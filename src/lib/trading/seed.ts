import { seedQuotes } from "./symbols";
import type {
  Account,
  AppSettings,
  CircuitState,
  ClosedTrade,
  DeskSnapshot,
  Position,
  RiskSettings,
  Signal,
  TelegramMessage,
} from "./types";

function risk(partial: Partial<RiskSettings> = {}): RiskSettings {
  return {
    mode: "percent",
    percent: 1,
    fixedLots: 0.1,
    fixedPips: 20,
    rr: 2,
    maxDailyLossPct: 4,
    maxOpenLots: 5,
    maxTradesPerDay: 40,
    maxConsecutiveLosses: 6,
    maxSlippagePips: 3,
    maxSpreadPips: 40,
    flattenOnTrip: false,
    fridayCutoffHour: 21,
    ...partial,
  };
}

export function seedAccounts(): Account[] { return []; }

const SETTINGS: AppSettings = {
  autoInterpret: true,
  grokFallback: false,
  grokCallsUsed: 0,
  grokCallCap: 8,
  beAfterTp1: true,
  tpSplit: [50, 30, 20],
  defaultTrailingPips: null,
  paper: false,
};

function at(now: number, minutesAgo: number): number {
  return now - minutesAgo * 60_000;
}

export function seedHistory(now: number): ClosedTrade[] { void now; return []; }

export function seedPositions(now: number): Position[] { void now; return []; }

export function seedSignals(now: number): Signal[] { void now; return []; }

export function seedMessages(now: number): TelegramMessage[] { void now; return []; }

export function seedCircuits(now: number, startEquity: number): CircuitState {
  void now;
  return {
    globalHalt: false,
    dailyLossTripped: false,
    consecutiveLosses: 1,
    tradesToday: 0,
    dayStartEquity: startEquity,
    realizedToday: 0,
    spreadPause: false,
    reason: null,
  };
}

export function createSeed(now = Date.now()): DeskSnapshot {
  const accounts = seedAccounts();
  const quotes = seedQuotes(now);
  const positions = seedPositions(now);
  const history = seedHistory(now);
  const start = accounts.reduce((s, a) => s + a.balance, 0);
  return {
    accounts,
    sources: [],
    messages: seedMessages(now),
    signals: seedSignals(now),
    positions,
    orders: [],
    history,
    quotes,
    circuits: seedCircuits(now, start),
    telegram: {
      connected: false,
      connecting: false,
      user: null,
      phone: null,
    },
    settings: { ...SETTINGS },
    log: [
      {
        id: "ev_seed_1",
        at: at(now, 38),
        kind: "fill",
        text: "Filled BUY 0.36 XAUUSD @ 3681.40 · Volt Master",
        latencyMs: 11,
        signalNumber: 146,
      },
      {
        id: "ev_seed_2",
        at: at(now, 38),
        kind: "copy",
        text: "Copied #0146 → Exness Copy 0.14 lots",
        signalNumber: 146,
      },
      {
        id: "ev_seed_3",
        at: at(now, 22),
        kind: "fill",
        text: "Filled SELL 1.10 EURUSD @ 1.08502 · Volt Master",
        latencyMs: 8,
        signalNumber: 147,
      },
      {
        id: "ev_seed_4",
        at: at(now, 6),
        kind: "parse",
        text: "Low confidence on Crypto Pulse — held",
        signalNumber: 149,
      },
    ],
    equity: Array.from({ length: 48 }, (_, i) => ({
      t: now - (47 - i) * 5 * 60_000,
      equity: start - 420 + Math.sin(i / 4) * 280 + i * 18,
    })),
    nextSignalNumber: 1,
    nextTicket: 1,
    now,
  };
}
