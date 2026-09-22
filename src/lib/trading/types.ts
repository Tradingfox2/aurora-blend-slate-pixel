export type Platform = "MT4" | "MT5";
export type AccountRole = "master" | "follower" | "independent";
export type Side = "buy" | "sell";
export type OrderType =
  | "market"
  | "buy_limit"
  | "sell_limit"
  | "buy_stop"
  | "sell_stop";
export type SignalStatus =
  | "received"
  | "interpreted"
  | "routed"
  | "live"
  | "closed"
  | "ignored"
  | "failed"
  | "managed";
export type RiskMode = "percent" | "fixed_lots" | "fixed_pips" | "rr";
export type SignalAction =
  | "open"
  | "close"
  | "partial"
  | "modify"
  | "be"
  | "delete";
export type Interpreter = "local" | "grok" | "manual";

export const SYMBOL_IDS = [
  "XAUUSD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "GBPJPY",
  "NAS100",
  "US30",
  "USOIL",
  "BTCUSD",
  "ETHUSD",
] as const;

export type SymbolId = (typeof SYMBOL_IDS)[number];

export interface Quote {
  bid: number;
  ask: number;
  spread: number;
  ts: number;
  change: number;
}

export interface RiskSettings {
  mode: RiskMode;
  percent: number;
  fixedLots: number;
  fixedPips: number;
  rr: number;
  maxDailyLossPct: number;
  maxOpenLots: number;
  maxTradesPerDay: number;
  maxConsecutiveLosses: number;
  maxSlippagePips: number;
  maxSpreadPips: number;
  flattenOnTrip: boolean;
  fridayCutoffHour: number | null;
}

export interface CopySettings {
  masterId: string;
  multiplier: number;
  reverse: boolean;
  equityScale: boolean;
  maxLot: number;
  delayMs: number;
  symbolSuffix: string;
}

export interface Account {
  id: string;
  name: string;
  platform: Platform;
  broker: string;
  server: string;
  login: string;
  role: AccountRole;
  currency: string;
  leverage: number;
  balance: number;
  equity: number;
  margin: number;
  connected: boolean;
  connecting?: boolean;
  pingMs: number;
  frozen: boolean;
  receivesSignals: boolean;
  risk: RiskSettings;
  copy?: CopySettings;
  lastHeartbeat?: number;
  eaVersion?: string;
  bridgeToken?: string;
}

export interface TelegramSource {
  id: string;
  name: string;
  username: string;
  kind: "channel" | "group" | "supergroup";
  members: number;
  listening: boolean;
  autoTrade: boolean;
  priority: number;
}

export interface TelegramMessage {
  id: string;
  sourceId: string;
  text: string;
  at: number;
  from: string;
  interpreted: boolean;
  signalId?: string;
}

export interface ParsedSignal {
  symbol: SymbolId;
  side: Side;
  orderType: OrderType;
  entry?: number;
  entryMax?: number;
  sl?: number;
  tps: number[];
  lotsHint?: number;
  action: SignalAction;
  closePct?: number;
  newSl?: number;
  newTp?: number;
  signalRef?: number;
  comment?: string;
}

export interface LatencyBreakdown {
  receiveMs: number;
  parseMs: number;
  riskMs: number;
  routeMs: number;
  fillMs: number;
  totalMs: number;
}

export interface Signal {
  id: string;
  number: number;
  sourceId: string;
  telegramMsgId: string;
  rawText: string;
  parsed?: ParsedSignal;
  confidence: number;
  interpreter: Interpreter;
  status: SignalStatus;
  receivedAt: number;
  latency: LatencyBreakdown;
  note?: string;
}

export interface TpLevel {
  price: number;
  closePct: number;
  hit: boolean;
}

export interface Position {
  id: string;
  ticket: number;
  accountId: string;
  signalId: string | null;
  signalNumber: number | null;
  sourceId: string | null;
  copiedFrom?: string;
  symbol: SymbolId;
  side: Side;
  lots: number;
  openPrice: number;
  sl: number | null;
  tp: number | null;
  tps: TpLevel[];
  beAfterTp1: boolean;
  trailingPips: number | null;
  openTime: number;
  magic: number;
  comment: string;
  commission: number;
  mfe?: number;
  mae?: number;
}

export interface PendingOrder {
  id: string;
  ticket: number;
  accountId: string;
  signalId: string | null;
  signalNumber: number | null;
  sourceId: string | null;
  symbol: SymbolId;
  side: Side;
  type: OrderType;
  lots: number;
  price: number;
  sl: number | null;
  tp: number | null;
  tps: TpLevel[];
  createdAt: number;
  magic: number;
  comment: string;
}

export interface ClosedTrade {
  id: string;
  ticket: number;
  accountId: string;
  signalNumber: number | null;
  sourceId: string | null;
  symbol: SymbolId;
  side: Side;
  lots: number;
  openPrice: number;
  closePrice: number;
  sl: number | null;
  tp: number | null;
  profit: number;
  openTime: number;
  closeTime: number;
  comment: string;
  mfe?: number;
  mae?: number;
  durationMs?: number;
}

export interface CircuitState {
  globalHalt: boolean;
  dailyLossTripped: boolean;
  consecutiveLosses: number;
  tradesToday: number;
  dayStartEquity: number;
  realizedToday: number;
  spreadPause: boolean;
  reason: string | null;
}

export interface ExecEvent {
  id: string;
  at: number;
  kind:
    | "signal"
    | "parse"
    | "fill"
    | "close"
    | "modify"
    | "reject"
    | "copy"
    | "circuit"
    | "telegram"
    | "bridge";
  text: string;
  latencyMs?: number;
  signalNumber?: number;
}

export interface EquityPoint {
  t: number;
  equity: number;
}

export interface AppSettings {
  autoInterpret: boolean;
  grokFallback: boolean;
  grokCallsUsed: number;
  grokCallCap: number;
  beAfterTp1: boolean;
  tpSplit: [number, number, number];
  defaultTrailingPips: number | null;
  paper: boolean;
}

export interface TelegramSession {
  connected: boolean;
  connecting: boolean;
  user: string | null;
  phone: string | null;
  lastIngestAt?: number | null;
}

export interface BridgeState {
  token: string;
  enabled: boolean;
  lastPollAt: number | null;
  heartbeats: number;
  eaVersion: string;
}

export interface DeskSnapshot {
  accounts: Account[];
  sources: TelegramSource[];
  messages: TelegramMessage[];
  signals: Signal[];
  positions: Position[];
  orders: PendingOrder[];
  history: ClosedTrade[];
  quotes: Record<SymbolId, Quote>;
  circuits: CircuitState;
  telegram: TelegramSession;
  settings: AppSettings;
  bridge?: BridgeState;
  log: ExecEvent[];
  equity: EquityPoint[];
  nextSignalNumber: number;
  nextTicket: number;
  now: number;
}
