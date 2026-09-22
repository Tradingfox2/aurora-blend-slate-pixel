import { create } from "zustand";
import {
  applyManage,
  applyOpen,
  bulkClose,
  cancelOrders,
  manageOpenPositions,
  manualMarket,
  matchPendings,
  modifyPosition,
  positionPnl,
  tickQuotes,
  type ApplyResult,
} from "./engine";
import { parseSignal } from "./parser";
import { createSeed } from "./seed";
import { generateMessage } from "./telegram";
import { enqueueBridgeCommand } from "./persist";
import type {
  Account,
  BridgeState,
  DeskSnapshot,
  ExecEvent,
  ParsedSignal,
  Position,
  Signal,
  SymbolId,
  TelegramSource,
} from "./types";

const LS_KEY = "volt-desk-v2";

function mergeApply(s: DeskState, r: ApplyResult, extra?: Partial<DeskState>): Partial<DeskState> {
  return {
    positions: r.positions.map((p) => ({
      ...p,
      mfe: p.mfe ?? 0,
      mae: p.mae ?? 0,
    })),
    orders: r.orders,
    signals: r.signals,
    accounts: r.accounts,
    history: r.history.map((h) => ({
      ...h,
      mfe: h.mfe ?? Math.max(0, h.profit),
      mae: h.mae ?? Math.max(0, -h.profit),
      durationMs: h.durationMs ?? Math.max(0, h.closeTime - h.openTime),
    })),
    circuits: r.circuits,
    nextTicket: r.nextTicket,
    log: [...r.events, ...s.log].slice(0, 160),
    lastEvents: r.events,
    ...extra,
  };
}

function persistPartial(s: DeskState) {
  try {
    const snap = {
      accounts: s.accounts,
      sources: s.sources,
      messages: s.messages.slice(0, 80),
      signals: s.signals.slice(0, 80),
      positions: s.positions,
      orders: s.orders,
      history: s.history.slice(0, 200),
      circuits: s.circuits,
      telegram: s.telegram,
      settings: s.settings,
      bridge: s.bridge,
      nextSignalNumber: s.nextSignalNumber,
      nextTicket: s.nextTicket,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(snap));
  } catch {
    /* quota */
  }
}

export interface DeskState extends DeskSnapshot {
  running: boolean;
  lastEvents: ExecEvent[];
  ingestMessage: (sourceId: string, text: string, from: string, auto: boolean) => Signal | null;
  interpretSignal: (signalId: string, parsed: ParsedSignal, confidence: number, interpreter: Signal["interpreter"]) => void;
  executeSignal: (signalId: string) => void;
  ignoreSignal: (signalId: string) => void;
  tick: () => void;
  setHalt: (halt: boolean) => void;
  setAccountFrozen: (id: string, frozen: boolean) => void;
  setAccountConnected: (id: string, connected: boolean) => void;
  beginAccountConnect: (id: string) => void;
  patchAccount: (id: string, patch: Partial<Account>) => void;
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  patchSource: (id: string, patch: Partial<TelegramSource>) => void;
  patchSettings: (patch: Partial<DeskState["settings"]>) => void;
  patchBridge: (patch: Partial<BridgeState>) => void;
  pulseBridge: () => void;
  bulk: (mode: BulkMode) => void;
  closePosition: (id: string) => void;
  modify: (id: string, patch: Partial<Pick<Position, "sl" | "tp" | "trailingPips">>) => void;
  cancelOrder: (id: string) => void;
  placeManual: (args: {
    accountId: string;
    symbol: SymbolId;
    side: "buy" | "sell";
    lots: number;
    sl?: number;
    tp?: number;
  }) => void;
  connectTelegram: (user: string, phone: string) => void;
  beginTelegramConnect: () => void;
  disconnectTelegram: () => void;
  resetDesk: () => void;
  consumeEvents: () => void;
  refreshLiveState: () => Promise<void>;
}

export type BulkMode =
  | "close_all"
  | "close_winners"
  | "close_losers"
  | "flatten"
  | "be_all"
  | "cancel_all";

let engineTimer: number | null = null;
let telegramTimer: number | null = null;
let persistTimer: number | null = null;
let equityTimer: number | null = null;
let bridgeTimer: number | null = null;

const DEFAULT_BRIDGE: BridgeState = {
  token: "",
  enabled: true,
  lastPollAt: null,
  heartbeats: 0,
  eaVersion: "1.4.2",
};

export const useDesk = create<DeskState>((set, get) => {
  const seed = createSeed(Date.now());
  const bridge = (seed as DeskSnapshot).bridge ?? DEFAULT_BRIDGE;
  const telegram = {
    ...seed.telegram,
    lastIngestAt: seed.telegram.lastIngestAt ?? null,
  };
  return {
    ...seed,
    bridge,
    telegram,
    accounts: seed.accounts.map((a) => ({
      ...a,
      connecting: a.connecting ?? false,
      mfe: undefined,
      eaVersion: a.eaVersion ?? bridge.eaVersion,
      lastHeartbeat: undefined,
    })),
    positions: seed.positions.map((p) => ({ ...p, mfe: p.mfe ?? 0, mae: p.mae ?? 0 })),
    history: seed.history.map((h) => ({
      ...h,
      mfe: h.mfe ?? Math.max(12, Math.abs(h.profit) * (0.8 + Math.random())),
      mae: h.mae ?? Math.max(8, Math.abs(h.profit) * (0.4 + Math.random() * 0.6)),
      durationMs: h.durationMs ?? Math.max(60_000, h.closeTime - h.openTime),
    })),
    running: false,
    lastEvents: [],

    ingestMessage: (sourceId, text, from, auto) => {
      const s = get();
      if (!s.telegram.connected) return null;
      const source = s.sources.find((x) => x.id === sourceId);
      if (!source) return null;
      const t0 = performance.now();
      const msgId = `tg_${Date.now().toString(36)}`;
      const parseT0 = performance.now();
      const local = parseSignal(text);
      const parseMs = performance.now() - parseT0;
      const number = s.nextSignalNumber;
      const signal: Signal = {
        id: `sig_${number}`,
        number,
        sourceId,
        telegramMsgId: msgId,
        rawText: text,
        parsed: local.parsed ?? undefined,
        confidence: local.confidence,
        interpreter: "local",
        status: local.parsed && local.confidence >= 0.55 ? "interpreted" : "received",
        receivedAt: Date.now(),
        latency: {
          receiveMs: 0,
          parseMs,
          riskMs: 0,
          routeMs: 0,
          fillMs: 0,
          totalMs: performance.now() - t0,
        },
        note: local.note,
      };
      const msg = {
        id: msgId,
        sourceId,
        text,
        at: Date.now(),
        from,
        interpreted: Boolean(local.parsed && local.confidence >= 0.55),
        signalId: signal.id,
      };
      set({
        messages: [msg, ...s.messages].slice(0, 80),
        signals: [signal, ...s.signals].slice(0, 80),
        nextSignalNumber: number + 1,
        telegram: { ...s.telegram, lastIngestAt: Date.now() },
        log: [
          {
            id: `ev_${Date.now()}`,
            at: Date.now(),
            kind: "telegram" as const,
            text: `${source.name} · ${signal.status} ${number}`,
            signalNumber: number,
            latencyMs: parseMs,
          },
          ...s.log,
        ].slice(0, 160),
      });
      if (
        auto &&
        source.autoTrade &&
        s.settings.autoInterpret &&
        !s.circuits.globalHalt &&
        local.parsed &&
        local.confidence >= 0.82
      ) {
        queueMicrotask(() => get().executeSignal(signal.id));
      }
      return signal;
    },

    interpretSignal: (signalId, parsed, confidence, interpreter) => {
      set((s) => ({
        signals: s.signals.map((sig) =>
          sig.id === signalId
            ? {
                ...sig,
                parsed,
                confidence,
                interpreter,
                status: "interpreted",
                note: interpreter === "grok" ? "Grok" : sig.note,
              }
            : sig,
        ),
        messages: s.messages.map((m) =>
          m.signalId === signalId ? { ...m, interpreted: true } : m,
        ),
        settings:
          interpreter === "grok"
            ? { ...s.settings, grokCallsUsed: s.settings.grokCallsUsed + 1 }
            : s.settings,
      }));
    },

    executeSignal: (signalId) => {
      const s = get();
      const signal = s.signals.find((x) => x.id === signalId);
      if (!signal?.parsed) return;
      const parsed = signal.parsed;

      if (!s.settings.paper) {
        if (s.circuits.globalHalt) return;
        const accounts = s.accounts.filter((a) => a.connected && !a.frozen && a.receivesSignals);
        if (!accounts.length) {
          set({
            signals: s.signals.map((x) =>
              x.id === signalId ? { ...x, status: "failed", note: "No confirmed broker terminal heartbeat" } : x,
            ),
          });
          return;
        }

        if (parsed.action === "open") {
          // applyOpen is used only as a pure sizing/risk calculation. Its local
          // position is NEVER committed in live mode.
          const preview = applyOpen({ ...s, now: Date.now() }, signal, parsed, s.settings);
          const routed = preview.positions.filter((p) => p.signalId === signalId);
          if (!routed.length) return;
          set({
            signals: s.signals.map((x) =>
              x.id === signalId ? { ...x, status: "routed", note: "Awaiting broker acknowledgement" } : x,
            ),
            log: [
              {
                id: `ev_route_${Date.now()}`,
                at: Date.now(),
                kind: "bridge" as const,
                text: `Live order queued · signal ${signal.number}`,
                signalNumber: signal.number,
              },
              ...s.log,
            ].slice(0, 160),
          });
          for (const account of accounts) {
            const position = routed.find((p) => p.accountId === account.id) ?? routed[0];
            void enqueueBridgeCommand({
              login: account.login,
              platform: account.platform,
              type: "open_market",
              payload: {
                accountId: account.id,
                signalId,
                symbol: position.symbol,
                side: position.side,
                lots: position.lots,
                sl: position.sl,
                tp: position.tp,
                magic: position.magic,
                comment: position.comment,
                clientTicket: position.ticket,
              },
            });
          }
          return;
        }

        const commandType =
          parsed.action === "close"
            ? "close_position"
            : parsed.action === "partial"
              ? "partial_close"
              : parsed.action === "modify"
                ? "modify_position"
                : parsed.action === "be"
                  ? "break_even"
                  : parsed.action === "delete"
                    ? "cancel_order"
                    : null;
        if (!commandType) return;
        set({
          signals: s.signals.map((x) =>
            x.id === signalId
              ? { ...x, status: "routed", note: "Awaiting broker acknowledgement" }
              : x,
          ),
        });
        for (const account of accounts) {
          void enqueueBridgeCommand({
            login: account.login,
            platform: account.platform,
            type: commandType,
            payload: {
              accountId: account.id,
              signalId,
              symbol: parsed.symbol,
              side: parsed.side,
              closePct: parsed.closePct,
              newSl: parsed.newSl,
              newTp: parsed.newTp,
              signalRef: parsed.signalRef,
              comment: parsed.comment,
            },
          });
        }
        return;
      }

      const riskT0 = performance.now();
      const routeT0 = performance.now();
      const result =
        parsed.action === "open"
          ? applyOpen({ ...s, now: Date.now() }, signal, parsed, s.settings)
          : applyManage({ ...s, now: Date.now() }, signal, parsed);
      const fillMs = performance.now() - routeT0;
      const signals = result.signals.map((x) =>
        x.id === signalId
          ? {
              ...x,
              latency: {
                ...x.latency,
                riskMs: routeT0 - riskT0,
                routeMs: fillMs,
                fillMs,
                totalMs: x.latency.parseMs + fillMs,
              },
            }
          : x,
      );
      set(mergeApply(s, { ...result, signals }));
    },

    ignoreSignal: (signalId) => {
      set((s) => ({
        signals: s.signals.map((x) =>
          x.id === signalId ? { ...x, status: "ignored" as const } : x,
        ),
      }));
    },

    tick: () => {
      const s = get();
      const now = Date.now();
      const quotes = tickQuotes(s.quotes, now);
      let next: DeskSnapshot = { ...s, quotes, now };
      const matched = matchPendings(next);
      next = { ...next, ...matched, log: [...matched.events, ...next.log].slice(0, 160) };
      const managed = manageOpenPositions(next);
      next = { ...next, ...managed, log: [...managed.events, ...next.log].slice(0, 160) };
      const positions = next.positions.map((p) => {
        const pnl = positionPnl(p, quotes);
        const mfe = Math.max(p.mfe ?? 0, pnl);
        const mae = Math.max(p.mae ?? 0, -pnl);
        return { ...p, mfe, mae };
      });
      // Accounts were already refreshed in manageOpenPositions with current positions & quotes
      const accounts = next.accounts.map((a) =>
        a.connected && !a.connecting
          ? { ...a, lastHeartbeat: now, pingMs: Math.max(4, Math.round(a.pingMs + (Math.random() - 0.5) * 2)) }
          : a,
      );
      const events = [...matched.events, ...managed.events];
      set({
        quotes,
        now,
        positions,
        orders: next.orders,
        signals: next.signals,
        accounts,
        history: next.history,
        circuits: next.circuits,
        log: next.log,
        lastEvents: events.length ? events : s.lastEvents,
      });
    },

    setHalt: (halt) => {
      set((s) => ({
        circuits: {
          ...s.circuits,
          globalHalt: halt,
          reason: halt ? "Manual halt" : null,
        },
        log: [
          {
            id: `ev_halt_${Date.now()}`,
            at: Date.now(),
            kind: "circuit" as const,
            text: halt ? "Global halt engaged" : "Halt released",
          },
          ...s.log,
        ].slice(0, 160),
      }));
    },

    setAccountFrozen: (id, frozen) => {
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? { ...a, frozen } : a)),
      }));
    },

    setAccountConnected: (id, connected) => {
      set((s) => ({
        accounts: s.accounts.map((a) =>
          a.id === id
            ? { ...a, connected: false, connecting: false, frozen: true, lastHeartbeat: undefined }
            : a,
        ),
      }));
    },

    beginAccountConnect: (id) => {
      set((s) => ({
        accounts: s.accounts.map((a) =>
          a.id === id ? { ...a, connected: false, connecting: false, frozen: true } : a,
        ),
        log: [
          {
            id: `ev_acc_block_${Date.now()}`,
            at: Date.now(),
            kind: "reject" as const,
            text: `EA connection requires an authenticated bridge heartbeat · ${id}`,
          },
          ...s.log,
        ].slice(0, 160),
      }));
    },

    patchAccount: (id, patch) => {
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }));
    },

    addAccount: (account) => {
      set((s) => ({ accounts: [...s.accounts, { ...account, connecting: false }] }));
    },

    removeAccount: (id) => {
      set((s) => ({
        accounts: s.accounts.filter((a) => a.id !== id),
        positions: s.positions.filter((p) => p.accountId !== id),
        orders: s.orders.filter((o) => o.accountId !== id),
      }));
    },

    patchSource: (id, patch) => {
      set((s) => ({
        sources: s.sources.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }));
    },

    patchSettings: (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
    },

    patchBridge: (patch) => {
      set((s) => ({ bridge: { ...(s.bridge ?? DEFAULT_BRIDGE), ...patch } }));
    },

    pulseBridge: () => {
      // Browser state never manufactures broker heartbeats.
      return;
    },

    bulk: (mode) => {
      const s = get();
      if (!s.settings.paper) {
        set({ log: [{ id: `ev_live_block_${Date.now()}`, at: Date.now(), kind: "reject", text: `Live bulk action blocked until broker command routing is implemented · ${mode}` }, ...s.log].slice(0, 160) });
        return;
      }
      const pnlOf = (p: Position) => {
        const q = s.quotes[p.symbol];
        const px = p.side === "buy" ? q.bid : q.ask;
        const dir = p.side === "buy" ? 1 : -1;
        return (px - p.openPrice) * dir;
      };
      if (mode === "cancel_all") {
        set(mergeApply(s, cancelOrders(s, () => true)));
        return;
      }
      if (mode === "be_all") {
        const positions = s.positions.map((p) => ({ ...p, sl: p.openPrice }));
        set({
          positions,
          log: [
            { id: `ev_be_${Date.now()}`, at: Date.now(), kind: "modify" as const, text: "Break-even all" },
            ...s.log,
          ].slice(0, 160),
          lastEvents: [
            { id: `ev_be_${Date.now()}`, at: Date.now(), kind: "modify" as const, text: "Break-even all" },
          ],
        });
        return;
      }
      const filter =
        mode === "close_winners"
          ? (p: Position) => pnlOf(p) > 0
          : mode === "close_losers"
            ? (p: Position) => pnlOf(p) < 0
            : () => true;
      const r = bulkClose({ ...s, now: Date.now() }, filter, mode);
      const extra =
        mode === "flatten"
          ? cancelOrders({ ...s, orders: r.orders, positions: r.positions }, () => true)
          : null;
      set(mergeApply(s, extra ? { ...r, orders: extra.orders, events: [...r.events, ...extra.events] } : r));
    },

    closePosition: (id) => {
      const s = get();
      if (!s.settings.paper) {
        set({ log: [{ id: `ev_live_block_${Date.now()}`, at: Date.now(), kind: "reject", text: "Live manual close requires broker command + acknowledgement" }, ...s.log].slice(0, 160) });
        return;
      }
      set(mergeApply(s, bulkClose({ ...s, now: Date.now() }, (p) => p.id === id, "manual close")));
    },

    modify: (id, patch) => {
      const s = get();
      if (!s.settings.paper) {
        set({ log: [{ id: `ev_live_block_${Date.now()}`, at: Date.now(), kind: "reject", text: "Live modify requires broker command + acknowledgement" }, ...s.log].slice(0, 160) });
        return;
      }
      set(mergeApply(s, modifyPosition(s, id, patch)));
    },

    cancelOrder: (id) => {
      const s = get();
      if (!s.settings.paper) {
        set({ log: [{ id: `ev_live_block_${Date.now()}`, at: Date.now(), kind: "reject", text: "Live cancel requires broker command + acknowledgement" }, ...s.log].slice(0, 160) });
        return;
      }
      set(mergeApply(s, cancelOrders(s, (o) => o.id === id)));
    },

    placeManual: (args) => {
      const s = get();
      if (!s.settings.paper) {
        set({ log: [{ id: `ev_live_block_${Date.now()}`, at: Date.now(), kind: "reject", text: "Live manual order requires broker command + acknowledgement" }, ...s.log].slice(0, 160) });
        return;
      }
      set(mergeApply(s, manualMarket({ ...s, now: Date.now() }, args)));
    },

    beginTelegramConnect: () => {
      set((s) => ({ telegram: { ...s.telegram, connecting: true } }));
    },

    connectTelegram: (user, phone) => {
      set((s) => ({
        telegram: {
          ...s.telegram,
          connected: false,
          connecting: false,
          user: null,
          phone: null,
          lastIngestAt: null,
        },
        lastEvents: [
          {
            id: `ev_tg_block_${Date.now()}`,
            at: Date.now(),
            kind: "reject",
            text: "Telegram connection must be established by the MTProto worker",
          },
        ],
      }));
    },

    disconnectTelegram: () => {
      set((s) => ({
        telegram: {
          connected: false,
          connecting: false,
          user: null,
          phone: null,
          lastIngestAt: s.telegram.lastIngestAt,
        },
        sources: s.sources.map((src) => ({ ...src, listening: false, autoTrade: false })),
        lastEvents: [
          {
            id: `ev_tg_off_${Date.now()}`,
            at: Date.now(),
            kind: "telegram",
            text: "Telegram session closed · feed stopped",
          },
        ],
      }));
    },

    resetDesk: () => {
      const fresh = createSeed(Date.now());
      set({
        ...fresh,
        bridge: (fresh as DeskSnapshot).bridge ?? DEFAULT_BRIDGE,
        telegram: { ...fresh.telegram, lastIngestAt: null },
        running: true,
        lastEvents: [],
      });
      try {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem("volt-desk-v1");
      } catch {
        /* ignore */
      }
    },

    consumeEvents: () => set({ lastEvents: [] }),

    refreshLiveState: async () => {
      const s = get();
      if (s.settings.paper) return;
      try {
        const response = await fetch("/api/bridge/accounts", { cache: "no-store" });
        if (!response.ok) throw new Error(`bridge_accounts_${response.status}`);
        const data = await response.json() as { accounts?: Account[]; positions?: Position[]; orders?: DeskSnapshot["orders"] };
        const accounts = Array.isArray(data.accounts) ? data.accounts : [];
        set({
          accounts: accounts.map((a) => ({ ...a, receivesSignals: false, frozen: false })),
          positions: Array.isArray(data.positions) ? data.positions : [],
          orders: Array.isArray(data.orders) ? data.orders : [],
          history: [],
          signals: [],
          messages: [],
          sources: [],
          telegram: {
            connected: false,
            connecting: false,
            user: null,
            phone: null,
            lastIngestAt: null,
          },
          equity: accounts.length
            ? [{ t: Date.now(), equity: accounts.reduce((sum, a) => sum + a.equity, 0) }]
            : [],
          now: Date.now(),
          log: accounts.length
            ? [{
                id: `ev_bridge_sync_${Date.now()}`,
                at: Date.now(),
                kind: "bridge",
                text: `Synchronized ${accounts.length} live broker terminal(s)`,
              }, ...get().log].slice(0, 160)
            : [],
        });
      } catch {
        set({
          accounts: [],
          positions: [],
          orders: [],
          history: [],
          signals: [],
          messages: [],
          sources: [],
          telegram: { connected: false, connecting: false, user: null, phone: null, lastIngestAt: null },
          equity: [],
        });
      }
    },
  };
});

function pumpTelegram() {
  const s = useDesk.getState();
  if (!s.telegram.connected || s.telegram.connecting || s.circuits.globalHalt) return;
  const listening = s.sources.filter((x) => x.listening);
  if (!listening.length) return;
  const source = listening[Math.floor(Math.random() * listening.length)]!;
  const liveNums = s.signals.filter((x) => x.status === "live" || x.status === "managed").map((x) => x.number);
  const msg = generateMessage(source, s.quotes, liveNums);
  useDesk.getState().ingestMessage(source.id, msg.text, msg.from, true);
}

export function startDesk() {
  const st = useDesk.getState();
  if (st.running) return;
  // Live mode never restores browser-persisted trading state. Broker state is authoritative.
  useDesk.setState({ running: true });
  void useDesk.getState().refreshLiveState();
  if (engineTimer) window.clearInterval(engineTimer);
  engineTimer = window.setInterval(() => useDesk.getState().tick(), 220);
  if (telegramTimer) window.clearInterval(telegramTimer);
  telegramTimer = window.setInterval(pumpTelegram, 14000);
  if (persistTimer) window.clearInterval(persistTimer);
  persistTimer = window.setInterval(() => persistPartial(useDesk.getState()), 8000);
  if (equityTimer) window.clearInterval(equityTimer);
  equityTimer = window.setInterval(() => {
    const s = useDesk.getState();
    const equity = s.accounts.reduce((sum, a) => sum + a.equity, 0);
    useDesk.setState({
      equity: [...s.equity, { t: Date.now(), equity }].slice(-80),
    });
  }, 5000);
  if (bridgeTimer) window.clearInterval(bridgeTimer);
  bridgeTimer = window.setInterval(() => {
    const s = useDesk.getState();
    if (s.bridge?.enabled && s.accounts.some((a) => a.connected)) {
      useDesk.getState().pulseBridge();
    }
  }, 18000);
}

export function stopDesk() {
  if (engineTimer) window.clearInterval(engineTimer);
  if (telegramTimer) window.clearInterval(telegramTimer);
  if (persistTimer) window.clearInterval(persistTimer);
  if (equityTimer) window.clearInterval(equityTimer);
  if (bridgeTimer) window.clearInterval(bridgeTimer);
  engineTimer = telegramTimer = persistTimer = equityTimer = bridgeTimer = null;
  useDesk.setState({ running: false });
}
