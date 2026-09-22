import { fillPrice, markPrice, OPENING, pnlUsd, SPECS } from "./symbols";
import { fridayCutoff, followerLots, reverseSide, roundLot, sizeLots } from "./risk";
import type {
  Account,
  AppSettings,
  CircuitState,
  ClosedTrade,
  DeskSnapshot,
  ExecEvent,
  PendingOrder,
  ParsedSignal,
  Position,
  Quote,
  Signal,
  SymbolId,
  TpLevel,
} from "./types";
import { SYMBOL_IDS } from "./types";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function tickQuotes(
  quotes: Record<SymbolId, Quote>,
  now: number,
): Record<SymbolId, Quote> {
  const next = { ...quotes };
  for (const id of SYMBOL_IDS) {
    const spec = SPECS[id];
    const q = quotes[id];
    const shock = randn() * spec.vol * 0.55;
    const mid = (q.bid + q.ask) / 2 + shock;
    const widen = spec.baseSpread * (1 + Math.max(0, randn() * 0.15));
    const half = widen / 2;
    const opening = OPENING[id];
    next[id] = {
      bid: mid - half,
      ask: mid + half,
      spread: widen,
      ts: now,
      change: (mid - opening) / opening,
    };
  }
  return next;
}

export function positionPnl(
  p: Position,
  quotes: Record<SymbolId, Quote>,
): number {
  const q = quotes[p.symbol];
  const px = markPrice(p.side, q);
  return pnlUsd(p.symbol, p.side, p.openPrice, px, p.lots) - p.commission;
}

export function accountFloating(accountId: string, positions: Position[], quotes: Record<SymbolId, Quote>): number {
  let s = 0;
  for (const p of positions) {
    if (p.accountId === accountId) s += positionPnl(p, quotes);
  }
  return s;
}

export function usedMargin(accountId: string, positions: Position[], quotes: Record<SymbolId, Quote>, leverage: number): number {
  let m = 0;
  for (const p of positions) {
    if (p.accountId !== accountId) continue;
    const mid = (quotes[p.symbol].bid + quotes[p.symbol].ask) / 2;
    m += (p.lots * SPECS[p.symbol].contractSize * mid) / Math.max(1, leverage);
  }
  return m;
}

function event(
  kind: ExecEvent["kind"],
  text: string,
  extra?: Partial<ExecEvent>,
): ExecEvent {
  return {
    id: uid("ev"),
    at: Date.now(),
    kind,
    text,
    ...extra,
  };
}

export function refreshAccounts(
  accounts: Account[],
  positions: Position[],
  quotes: Record<SymbolId, Quote>,
): Account[] {
  return accounts.map((a) => {
    const floating = accountFloating(a.id, positions, quotes);
    const margin = usedMargin(a.id, positions, quotes, a.leverage);
    const ping = Math.max(4, a.pingMs + (Math.random() - 0.5) * 3);
    return {
      ...a,
      equity: a.balance + floating,
      margin,
      pingMs: Math.round(ping),
    };
  });
}

function tpLevels(parsed: ParsedSignal, split: [number, number, number]): TpLevel[] {
  if (!parsed.tps.length) return [];
  const n = parsed.tps.length;
  if (n === 1) return [{ price: parsed.tps[0], closePct: 100, hit: false }];
  if (n === 2)
    return [
      { price: parsed.tps[0], closePct: split[0], hit: false },
      { price: parsed.tps[1], closePct: 100, hit: false },
    ];
  return [
    { price: parsed.tps[0], closePct: split[0], hit: false },
    { price: parsed.tps[1], closePct: split[1], hit: false },
    { price: parsed.tps[2], closePct: 100, hit: false },
  ];
}

export function canTrade(
  desk: DeskSnapshot,
  account: Account,
  symbol: SymbolId,
): { ok: boolean; reason?: string } {
  if (desk.circuits.globalHalt) return { ok: false, reason: "global halt" };
  if (account.frozen) return { ok: false, reason: "account frozen" };
  if (!account.connected) return { ok: false, reason: "terminal offline" };
  if (desk.circuits.dailyLossTripped) return { ok: false, reason: "daily loss circuit" };
  if (desk.circuits.spreadPause) return { ok: false, reason: "spread pause" };
  if (account.risk.maxTradesPerDay <= desk.circuits.tradesToday)
    return { ok: false, reason: "max trades" };
  if (desk.circuits.consecutiveLosses >= account.risk.maxConsecutiveLosses)
    return { ok: false, reason: "consecutive losses" };
  if (fridayCutoff(desk.now, account.risk.fridayCutoffHour))
    return { ok: false, reason: "Friday cutoff" };
  const q = desk.quotes[symbol];
  const spreadPips = q.spread / SPECS[symbol].pipSize;
  if (spreadPips > account.risk.maxSpreadPips)
    return { ok: false, reason: `spread ${spreadPips.toFixed(1)} pips` };
  return { ok: true };
}

function nextTicket(desk: DeskSnapshot): number {
  return desk.nextTicket;
}

export interface ApplyResult {
  positions: Position[];
  orders: PendingOrder[];
  signals: Signal[];
  accounts: Account[];
  history: ClosedTrade[];
  circuits: CircuitState;
  nextTicket: number;
  events: ExecEvent[];
  filled: boolean;
}

function closePosition(
  p: Position,
  price: number,
  lots: number,
  reason: string,
  now: number,
): ClosedTrade {
  const profit = pnlUsd(p.symbol, p.side, p.openPrice, price, lots) - p.commission * (lots / p.lots);
  return {
    id: uid("tr"),
    ticket: p.ticket,
    accountId: p.accountId,
    signalNumber: p.signalNumber,
    sourceId: p.sourceId,
    symbol: p.symbol,
    side: p.side,
    lots,
    openPrice: p.openPrice,
    closePrice: price,
    sl: p.sl,
    tp: p.tp,
    profit,
    openTime: p.openTime,
    closeTime: now,
    comment: reason,
  };
}

export function applyOpen(
  desk: DeskSnapshot,
  signal: Signal,
  parsed: ParsedSignal,
  settings: AppSettings,
): ApplyResult {
  const events: ExecEvent[] = [];
  let positions = desk.positions.slice();
  let orders = desk.orders.slice();
  let accounts = desk.accounts.slice();
  const history = desk.history.slice();
  let ticket = desk.nextTicket;
  const now = desk.now;
  const masters = accounts.filter((a) => a.receivesSignals && a.role !== "follower");

  const openOn = (account: Account, lots: number, side: typeof parsed.side, copiedFrom?: string) => {
    const gate = canTrade(desk, account, parsed.symbol);
    if (!gate.ok) {
      events.push(event("reject", `${account.name}: ${gate.reason}`, { signalNumber: signal.number }));
      return;
    }
    const q = desk.quotes[parsed.symbol];
    const tps = tpLevels(parsed, settings.tpSplit);
    const sl = parsed.sl ?? null;
    const tp = tps.length ? tps[tps.length - 1].price : (parsed.tps[0] ?? null);
    const isPending = parsed.orderType !== "market";
    ticket += 1;
    const magic = signal.number * 1000 + (account.role === "master" ? 1 : account.role === "follower" ? 2 : 3);
    const comment = `VOLT ${signal.number.toString().padStart(4, "0")} ${account.name}`;

    if (isPending && parsed.entry) {
      orders = [
        ...orders,
        {
          id: uid("ord"),
          ticket,
          accountId: account.id,
          signalId: signal.id,
          signalNumber: signal.number,
          sourceId: signal.sourceId,
          symbol: parsed.symbol,
          side,
          type: parsed.orderType,
          lots,
          price: parsed.entry,
          sl,
          tp,
          tps,
          createdAt: now,
          magic,
          comment,
        },
      ];
      events.push(
        event("fill", `Pending ${parsed.orderType} ${lots.toFixed(2)} ${parsed.symbol} @ ${parsed.entry} · ${account.name}`, {
          signalNumber: signal.number,
        }),
      );
      return;
    }

    const px = fillPrice(side, q);
    positions = [
      ...positions,
      {
        id: uid("pos"),
        ticket,
        accountId: account.id,
        signalId: signal.id,
        signalNumber: signal.number,
        sourceId: signal.sourceId,
        copiedFrom,
        symbol: parsed.symbol,
        side,
        lots,
        openPrice: px,
        sl,
        tp,
        tps,
        beAfterTp1: settings.beAfterTp1,
        trailingPips: settings.defaultTrailingPips,
        openTime: now,
        magic,
        comment,
        commission: 3.5 * lots,
      },
    ];
    events.push(
      event("fill", `Filled ${side.toUpperCase()} ${lots.toFixed(2)} ${parsed.symbol} @ ${px} · ${account.name}`, {
        signalNumber: signal.number,
        latencyMs: signal.latency.totalMs,
      }),
    );
  };

  for (const acc of masters) {
    const lots = sizeLots({
      account: acc,
      symbol: parsed.symbol,
      parsed,
      quote: desk.quotes[parsed.symbol],
    });
    openOn(acc, lots, parsed.side);
    if (acc.role === "master") {
      const followers = accounts.filter((f) => f.role === "follower" && f.copy?.masterId === acc.id && !f.frozen);
      for (const f of followers) {
        const fl = followerLots(lots, f, acc.equity);
        if (fl <= 0) continue;
        const side = reverseSide(parsed.side, Boolean(f.copy?.reverse));
        openOn(f, fl, side, acc.id);
        events.push(event("copy", `Copied ${signalTagSafe(signal.number)} → ${f.name} ${fl.toFixed(2)} lots`, { signalNumber: signal.number }));
      }
    }
  }

  const circuits = {
    ...desk.circuits,
    tradesToday: desk.circuits.tradesToday + 1,
  };
  const signals = desk.signals.map((s) =>
    s.id === signal.id
      ? { ...s, status: (parsed.orderType === "market" ? "live" : "routed") as Signal["status"], parsed }
      : s,
  );
  accounts = refreshAccounts(accounts, positions, desk.quotes);
  return {
    positions,
    orders,
    signals,
    accounts,
    history,
    circuits,
    nextTicket: ticket,
    events,
    filled: events.some((e) => e.kind === "fill"),
  };
}

function signalTagSafe(n: number): string {
  return `#${String(n).padStart(4, "0")}`;
}

export function applyManage(
  desk: DeskSnapshot,
  signal: Signal,
  parsed: ParsedSignal,
): ApplyResult {
  const events: ExecEvent[] = [];
  let positions = desk.positions.slice();
  let orders = desk.orders.slice();
  const accounts = desk.accounts.slice();
  let history = desk.history.slice();
  const now = desk.now;
  const sourceFilter = (p: { sourceId: string | null; signalNumber: number | null; symbol: SymbolId }) => {
    if (parsed.signalRef) return p.signalNumber === parsed.signalRef;
    if (parsed.symbol) return p.symbol === parsed.symbol && (p.sourceId === signal.sourceId || !p.sourceId);
    return false;
  };

  const hit = positions.filter(sourceFilter);
  if (parsed.action === "delete") {
    const before = orders.length;
    orders = orders.filter((o) => !sourceFilter(o));
    events.push(event("modify", `Cancelled ${before - orders.length} pending for ${signalTagSafe(signal.number)}`));
  } else if (parsed.action === "be") {
    positions = positions.map((p) => {
      if (!sourceFilter(p)) return p;
      return { ...p, sl: p.openPrice };
    });
    events.push(event("modify", `SL → BE on ${hit.length} position(s)`));
  } else if (parsed.action === "modify") {
    positions = positions.map((p) => {
      if (!sourceFilter(p)) return p;
      return {
        ...p,
        sl: parsed.newSl ?? parsed.sl ?? p.sl,
        tp: parsed.newTp ?? p.tp,
      };
    });
    events.push(event("modify", `Modified ${hit.length} position(s)`));
  } else if (parsed.action === "partial" || parsed.action === "close") {
    const pct = parsed.action === "close" ? 100 : (parsed.closePct ?? 50);
    const remain: Position[] = [];
    for (const p of positions) {
      if (!sourceFilter(p)) {
        remain.push(p);
        continue;
      }
      const q = desk.quotes[p.symbol];
      const px = markPrice(p.side, q);
      const closeLots = roundLot(p.lots * (pct / 100));
      const leave = Math.max(0, Math.round((p.lots - closeLots) * 100) / 100);
      const trade = closePosition(p, px, Math.min(closeLots, p.lots), `${parsed.action} ${signalTagSafe(signal.number)}`, now);
      history = [trade, ...history];
      const accIdx = accounts.findIndex((a) => a.id === p.accountId);
      if (accIdx >= 0) {
        accounts[accIdx] = { ...accounts[accIdx], balance: accounts[accIdx].balance + trade.profit };
      }
      events.push(event("close", `Closed ${closeLots.toFixed(2)} ${p.symbol} ${p.side.toUpperCase()} · ${trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? undefined }));
      if (leave >= 0.01) remain.push({ ...p, lots: leave });
    }
    positions = remain;
  }

  const stillLive = positions.some((p) => p.signalId === signal.id || p.signalNumber === signal.number);
  const signals = desk.signals.map((s) =>
    s.id === signal.id
      ? { ...s, status: (stillLive ? "managed" : "closed") as Signal["status"], parsed }
      : s,
  );
  const refreshed = refreshAccounts(accounts, positions, desk.quotes);
  return {
    positions,
    orders,
    signals,
    accounts: refreshed,
    history,
    circuits: desk.circuits,
    nextTicket: desk.nextTicket,
    events,
    filled: true,
  };
}

export function matchPendings(desk: DeskSnapshot): ApplyResult {
  const events: ExecEvent[] = [];
  const positions = desk.positions.slice();
  const remain: PendingOrder[] = [];
  const now = desk.now;
  for (const o of desk.orders) {
    const q = desk.quotes[o.symbol];
    let hit = false;
    if (o.type === "buy_limit") hit = q.ask <= o.price;
    else if (o.type === "sell_limit") hit = q.bid >= o.price;
    else if (o.type === "buy_stop") hit = q.ask >= o.price;
    else if (o.type === "sell_stop") hit = q.bid <= o.price;
    if (!hit) {
      remain.push(o);
      continue;
    }
    const px = fillPrice(o.side, q);
    positions.push({
      id: uid("pos"),
      ticket: o.ticket,
      accountId: o.accountId,
      signalId: o.signalId,
      signalNumber: o.signalNumber,
      sourceId: o.sourceId,
      symbol: o.symbol,
      side: o.side,
      lots: o.lots,
      openPrice: px,
      sl: o.sl,
      tp: o.tp,
      tps: o.tps,
      beAfterTp1: desk.settings.beAfterTp1,
      trailingPips: desk.settings.defaultTrailingPips,
      openTime: now,
      magic: o.magic,
      comment: o.comment,
      commission: 3.5 * o.lots,
    });
    events.push(event("fill", `Pending filled ${o.side.toUpperCase()} ${o.lots.toFixed(2)} ${o.symbol} @ ${px}`, { signalNumber: o.signalNumber ?? undefined }));
  }
  const accounts = refreshAccounts(desk.accounts, positions, desk.quotes);
  return {
    positions,
    orders: remain,
    signals: desk.signals,
    accounts,
    history: desk.history,
    circuits: desk.circuits,
    nextTicket: desk.nextTicket,
    events,
    filled: events.length > 0,
  };
}

export function manageOpenPositions(desk: DeskSnapshot): ApplyResult {
  const events: ExecEvent[] = [];
  let positions: Position[] = [];
  let history = desk.history.slice();
  const accounts = desk.accounts.map((a) => ({ ...a }));
  const now = desk.now;
  let consecutive = desk.circuits.consecutiveLosses;
  let realized = desk.circuits.realizedToday;

  for (const p of desk.positions) {
    const q = desk.quotes[p.symbol];
    const px = markPrice(p.side, q);
    let sl = p.sl;
    const tps = p.tps.map((t) => ({ ...t }));
    let lots = p.lots;

    if (p.trailingPips && p.trailingPips > 0) {
      const dist = SPECS[p.symbol].pipSize * p.trailingPips;
      if (p.side === "buy") {
        const trail = px - dist;
        if (sl === null || trail > sl) sl = trail;
      } else {
        const trail = px + dist;
        if (sl === null || trail < sl) sl = trail;
      }
    }

    const hitSl =
      sl !== null && (p.side === "buy" ? q.bid <= sl : q.ask >= sl);
    if (hitSl && sl !== null) {
      const trade = closePosition({ ...p, sl }, sl, lots, "SL", now);
      history = [trade, ...history];
      const i = accounts.findIndex((a) => a.id === p.accountId);
      if (i >= 0) accounts[i].balance += trade.profit;
      realized += trade.profit;
      consecutive = trade.profit < 0 ? consecutive + 1 : 0;
      events.push(event("close", `SL ${p.symbol} ${p.side.toUpperCase()} ${lots.toFixed(2)} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? undefined }));
      continue;
    }

    let closedAll = false;
    for (let i = 0; i < tps.length; i++) {
      const lvl = tps[i];
      if (lvl.hit) continue;
      const hit = p.side === "buy" ? q.bid >= lvl.price : q.ask <= lvl.price;
      if (!hit) continue;
      tps[i] = { ...lvl, hit: true };
      const closeLots = roundLot(lots * (lvl.closePct / 100));
      const take = Math.min(closeLots, lots);
      const trade = closePosition(p, lvl.price, take, `TP${i + 1}`, now);
      history = [trade, ...history];
      const ai = accounts.findIndex((a) => a.id === p.accountId);
      if (ai >= 0) accounts[ai].balance += trade.profit;
      realized += trade.profit;
      consecutive = trade.profit < 0 ? consecutive + 1 : 0;
      lots = Math.round((lots - take) * 100) / 100;
      events.push(event("close", `TP${i + 1} ${p.symbol} ${take.toFixed(2)} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? undefined }));
      if (p.beAfterTp1 && i === 0 && lots >= 0.01) sl = p.openPrice;
      if (lots < 0.01) {
        closedAll = true;
        break;
      }
    }
    if (closedAll) continue;

    const hitTp =
      p.tp !== null && tps.length === 0 && (p.side === "buy" ? q.bid >= p.tp : q.ask <= p.tp);
    if (hitTp && p.tp !== null) {
      const trade = closePosition(p, p.tp, lots, "TP", now);
      history = [trade, ...history];
      const i = accounts.findIndex((a) => a.id === p.accountId);
      if (i >= 0) accounts[i].balance += trade.profit;
      realized += trade.profit;
      consecutive = trade.profit < 0 ? consecutive + 1 : 0;
      events.push(event("close", `TP ${p.symbol} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? undefined }));
      continue;
    }

    positions.push({ ...p, sl, tps, lots });
  }

  const master = accounts.find((a) => a.role === "master") ?? accounts[0];
  const dayCap = master
    ? (master.risk.maxDailyLossPct / 100) * desk.circuits.dayStartEquity
    : Infinity;
  const floating = master ? accountFloating(master.id, positions, desk.quotes) : 0;
  const dailyLossTripped = realized + floating <= -dayCap;
  let circuits: CircuitState = {
    ...desk.circuits,
    consecutiveLosses: consecutive,
    realizedToday: realized,
    dailyLossTripped,
    reason: dailyLossTripped ? "Daily loss circuit" : desk.circuits.reason,
  };
  if (dailyLossTripped && master?.risk.flattenOnTrip && positions.length) {
    const flattened: Position[] = [];
    for (const p of positions) {
      const q = desk.quotes[p.symbol];
      const px = markPrice(p.side, q);
      const trade = closePosition(p, px, p.lots, "circuit flatten", now);
      history = [trade, ...history];
      const i = accounts.findIndex((a) => a.id === p.accountId);
      if (i >= 0) accounts[i].balance += trade.profit;
      events.push(event("circuit", `Flattened ${p.symbol} on circuit`));
    }
    positions = flattened;
    circuits = { ...circuits, globalHalt: true, reason: "Daily loss · flattened" };
  }

  // Single refresh on final updated positions and balances
  const refreshed = refreshAccounts(accounts, positions, desk.quotes);

  const signals = desk.signals.map((s) => {
    if (s.status !== "live" && s.status !== "managed") return s;
    const live = positions.some((p) => p.signalId === s.id);
    if (!live && (s.status === "live" || s.status === "managed"))
      return { ...s, status: "closed" as const };
    return s;
  });

  return {
    positions,
    orders: desk.orders,
    signals,
    accounts: refreshed,
    history: history.slice(0, 400),
    circuits,
    nextTicket: desk.nextTicket,
    events,
    filled: events.length > 0,
  };
}

export function bulkClose(
  desk: DeskSnapshot,
  filter: (p: Position) => boolean,
  reason: string,
): ApplyResult {
  const events: ExecEvent[] = [];
  const now = desk.now;
  const accounts = desk.accounts.map((a) => ({ ...a }));
  let history = desk.history.slice();
  const remain: Position[] = [];
  for (const p of desk.positions) {
    if (!filter(p)) {
      remain.push(p);
      continue;
    }
    const px = markPrice(p.side, desk.quotes[p.symbol]);
    const trade = closePosition(p, px, p.lots, reason, now);
    history = [trade, ...history];
    const i = accounts.findIndex((a) => a.id === p.accountId);
    if (i >= 0) accounts[i].balance += trade.profit;
    events.push(event("close", `${reason}: ${p.symbol} ${p.lots.toFixed(2)} · ${trade.profit.toFixed(2)}`));
  }
  return {
    positions: remain,
    orders: desk.orders,
    signals: desk.signals,
    accounts: refreshAccounts(accounts, remain, desk.quotes),
    history,
    circuits: desk.circuits,
    nextTicket: desk.nextTicket,
    events,
    filled: true,
  };
}

export function cancelOrders(
  desk: DeskSnapshot,
  filter: (o: PendingOrder) => boolean,
): ApplyResult {
  const keep = desk.orders.filter((o) => !filter(o));
  const n = desk.orders.length - keep.length;
  return {
    positions: desk.positions,
    orders: keep,
    signals: desk.signals,
    accounts: desk.accounts,
    history: desk.history,
    circuits: desk.circuits,
    nextTicket: desk.nextTicket,
    events: n ? [event("modify", `Cancelled ${n} pending`)] : [],
    filled: n > 0,
  };
}

export function modifyPosition(
  desk: DeskSnapshot,
  id: string,
  patch: Partial<Pick<Position, "sl" | "tp" | "trailingPips" | "lots">>,
): ApplyResult {
  const positions = desk.positions.map((p) => (p.id === id ? { ...p, ...patch } : p));
  return {
    positions,
    orders: desk.orders,
    signals: desk.signals,
    accounts: desk.accounts,
    history: desk.history,
    circuits: desk.circuits,
    nextTicket: desk.nextTicket,
    events: [event("modify", "Position modified")],
    filled: true,
  };
}

export function manualMarket(
  desk: DeskSnapshot,
  args: {
    accountId: string;
    symbol: SymbolId;
    side: "buy" | "sell";
    lots: number;
    sl?: number;
    tp?: number;
  },
): ApplyResult {
  const account = desk.accounts.find((a) => a.id === args.accountId);
  if (!account)
    return {
      positions: desk.positions,
      orders: desk.orders,
      signals: desk.signals,
      accounts: desk.accounts,
      history: desk.history,
      circuits: desk.circuits,
      nextTicket: desk.nextTicket,
      events: [event("reject", "Unknown account")],
      filled: false,
    };
  const gate = canTrade(desk, account, args.symbol);
  if (!gate.ok)
    return {
      positions: desk.positions,
      orders: desk.orders,
      signals: desk.signals,
      accounts: desk.accounts,
      history: desk.history,
      circuits: desk.circuits,
      nextTicket: desk.nextTicket,
      events: [event("reject", gate.reason ?? "blocked")],
      filled: false,
    };
  const ticket = desk.nextTicket + 1;
  const px = fillPrice(args.side, desk.quotes[args.symbol]);
  const pos: Position = {
    id: uid("pos"),
    ticket,
    accountId: account.id,
    signalId: null,
    signalNumber: null,
    sourceId: null,
    symbol: args.symbol,
    side: args.side,
    lots: roundLot(args.lots),
    openPrice: px,
    sl: args.sl ?? null,
    tp: args.tp ?? null,
    tps: args.tp ? [{ price: args.tp, closePct: 100, hit: false }] : [],
    beAfterTp1: desk.settings.beAfterTp1,
    trailingPips: desk.settings.defaultTrailingPips,
    openTime: desk.now,
    magic: ticket,
    comment: "VOLT manual",
    commission: 3.5 * args.lots,
  };
  const positions = [...desk.positions, pos];
  return {
    positions,
    orders: desk.orders,
    signals: desk.signals,
    accounts: refreshAccounts(desk.accounts, positions, desk.quotes),
    history: desk.history,
    circuits: { ...desk.circuits, tradesToday: desk.circuits.tradesToday + 1 },
    nextTicket: ticket,
    events: [event("fill", `Manual ${args.side.toUpperCase()} ${args.lots.toFixed(2)} ${args.symbol} @ ${px}`)],
    filled: true,
  };
}

void nextTicket;
