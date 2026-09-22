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
  refreshAccounts,
  tickQuotes,
  type ApplyResult,
} from "./engine";
import { parseSignal } from "./parser";
import { createSeed } from "./seed";
import { generateMessage } from "./telegram";
import type {
  Account,
  DeskSnapshot,
  ExecEvent,
  ParsedSignal,
  Position,
  Signal,
  SymbolId,
  TelegramSource,
} from "./types";

const LS_KEY = "volt-desk-v1";

function mergeApply(s: DeskState, r: ApplyResult, extra?: Partial<DeskState>): Partial<DeskState> {
  return {
    positions: r.positions,
    orders: r.orders,
    signals: r.signals,
    accounts: r.accounts,
    history: r.history,
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
  patchAccount: (id: string, patch: Partial<Account>) => void;
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  patchSource: (id: string, patch: Partial<TelegramSource>) => void;
  patchSettings: (patch: Partial<DeskState["settings"]>) => void;
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
  disconnectTelegram: () => void;
  resetDesk: () => void;
  consumeEvents: () => void;
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

export const useDesk = create<DeskState>((set, get) => {
  const seed = createSeed(Date.now());
  return {
    ...seed,
    running: false,
    lastEvents: [],

    ingestMessage: (sourceId, text, from, auto) => {
      const s = get();
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
      const riskT0 = performance.now();
      const parsed = signal.parsed;
      const routeT0 = performance.now();
      const result =
        parsed.action === "open"
          ? applyOpen(
              {
                ...s,
                now: Date.now(),
                signals: s.signals.map((x) =>
                  x.id === signalId
                    ? {
                        ...x,
                        latency: {
                          ...x.latency,
                          riskMs: routeT0 - riskT0,
                        },
                      }
                    : x,
                ),
              },
              signal,
              parsed,
              s.settings,
            )
          : applyManage({ ...s, now: Date.now() }, signal, parsed);
      const fillMs = performance.now() - routeT0;
      const signals = result.signals.map((x) =>
        x.id === signalId
          ? {
              ...x,
              latency: {
                ...x.latency,
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
      const accounts = refreshAccounts(next.accounts, next.positions, quotes);
      const events = [...matched.events, ...managed.events];
      set({
        quotes,
        now,
        positions: next.positions,
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
      set((s) => {
        const accounts = s.accounts.map((a) =>
          a.id === id
            ? {
                ...a,
                connected,
                pingMs: connected ? 8 + Math.floor(Math.random() * 22) : 0,
                frozen: connected ? a.frozen : true,
              }
            : a,
        );
        const name = accounts.find((a) => a.id === id)?.name ?? id;
        return {
          accounts,
          log: [
            {
              id: `ev_acc_${Date.now()}`,
              at: Date.now(),
              kind: "circuit" as const,
              text: connected ? `Terminal online · ${name}` : `Terminal offline · ${name}`,
            },
            ...s.log,
          ].slice(0, 160),
          lastEvents: [
            {
              id: `ev_acc_${Date.now()}`,
              at: Date.now(),
              kind: "circuit" as const,
              text: connected ? `Terminal online · ${name}` : `Terminal offline · ${name}`,
            },
          ],
        };
      });
    },

    patchAccount: (id, patch) => {
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }));
    },

    addAccount: (account) => {
      set((s) => ({ accounts: [...s.accounts, account] }));
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

    bulk: (mode) => {
      const s = get();
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
      set(mergeApply(s, bulkClose({ ...s, now: Date.now() }, (p) => p.id === id, "manual close")));
    },

    modify: (id, patch) => {
      const s = get();
      set(mergeApply(s, modifyPosition(s, id, patch)));
    },

    cancelOrder: (id) => {
      const s = get();
      set(mergeApply(s, cancelOrders(s, (o) => o.id === id)));
    },

    placeManual: (args) => {
      const s = get();
      set(mergeApply(s, manualMarket({ ...s, now: Date.now() }, args)));
    },

    connectTelegram: (user, phone) => {
      set({
        telegram: { connected: true, connecting: false, user, phone },
      });
    },

    disconnectTelegram: () => {
      set({
        telegram: { connected: false, connecting: false, user: null, phone: null },
      });
    },

    resetDesk: () => {
      const fresh = createSeed(Date.now());
      set({ ...fresh, running: true, lastEvents: [] });
      try {
        localStorage.removeItem(LS_KEY);
      } catch {
        /* ignore */
      }
    },

    consumeEvents: () => set({ lastEvents: [] }),
  };
});

function pumpTelegram() {
  const s = useDesk.getState();
  if (!s.telegram.connected || s.circuits.globalHalt) return;
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
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DeskSnapshot>;
      useDesk.setState({
        ...st,
        ...parsed,
        quotes: st.quotes,
        now: Date.now(),
        running: true,
      });
    } else {
      useDesk.setState({ running: true });
    }
  } catch {
    useDesk.setState({ running: true });
  }
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
}

export function stopDesk() {
  if (engineTimer) window.clearInterval(engineTimer);
  if (telegramTimer) window.clearInterval(telegramTimer);
  if (persistTimer) window.clearInterval(persistTimer);
  if (equityTimer) window.clearInterval(equityTimer);
  engineTimer = telegramTimer = persistTimer = equityTimer = null;
  useDesk.setState({ running: false });
}
