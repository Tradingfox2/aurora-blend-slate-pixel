import { formatPrice } from "./format";
import { SPECS } from "./symbols";
import type { Quote, Side, SymbolId, TelegramSource } from "./types";
import { SYMBOL_IDS } from "./types";

export const SOURCE_SEED: TelegramSource[] = [
  {
    id: "gold-sniper",
    name: "Gold Sniper VIP",
    username: "goldsniper_vip",
    kind: "channel",
    members: 12840,
    listening: true,
    autoTrade: true,
    priority: 1,
  },
  {
    id: "fx-masters",
    name: "FX Masters",
    username: "fx_masters_desk",
    kind: "channel",
    members: 22110,
    listening: true,
    autoTrade: true,
    priority: 2,
  },
  {
    id: "crypto-pulse",
    name: "Crypto Pulse",
    username: "crypto_pulse_fx",
    kind: "group",
    members: 8640,
    listening: true,
    autoTrade: false,
    priority: 5,
  },
  {
    id: "indices-desk",
    name: "Indices Desk",
    username: "indices_desk",
    kind: "channel",
    members: 5402,
    listening: true,
    autoTrade: true,
    priority: 3,
  },
  {
    id: "london-scalps",
    name: "London Scalps",
    username: "london_scalps",
    kind: "group",
    members: 3104,
    listening: true,
    autoTrade: false,
    priority: 6,
  },
  {
    id: "smc-room",
    name: "SMC Inner",
    username: "smc_inner_room",
    kind: "supergroup",
    members: 980,
    listening: false,
    autoTrade: false,
    priority: 8,
  },
  {
    id: "oil-wire",
    name: "Oil Wire",
    username: "oil_wire",
    kind: "channel",
    members: 4021,
    listening: true,
    autoTrade: false,
    priority: 7,
  },
  {
    id: "vip-circle",
    name: "Inner Circle",
    username: "volt_inner_circle",
    kind: "supergroup",
    members: 214,
    listening: true,
    autoTrade: true,
    priority: 4,
  },
];

const AUTHORS: Record<string, string[]> = {
  "gold-sniper": ["Admin", "Aisha"],
  "fx-masters": ["Desk", "Marco"],
  "crypto-pulse": ["Pulse", "Kenji"],
  "indices-desk": ["NY Desk", "Lina"],
  "london-scalps": ["Jon", "Priya"],
  "smc-room": ["Mentor"],
  "oil-wire": ["Wire"],
  "vip-circle": ["Lead", "Nico"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pips(symbol: SymbolId, n: number): number {
  return SPECS[symbol].pipSize * n;
}

function preferredSymbols(sourceId: string): SymbolId[] {
  switch (sourceId) {
    case "gold-sniper":
      return ["XAUUSD"];
    case "fx-masters":
      return ["EURUSD", "GBPUSD", "USDJPY", "GBPJPY"];
    case "crypto-pulse":
      return ["BTCUSD", "ETHUSD"];
    case "indices-desk":
      return ["NAS100", "US30"];
    case "london-scalps":
      return ["EURUSD", "GBPUSD", "XAUUSD"];
    case "oil-wire":
      return ["USOIL"];
    default:
      return [...SYMBOL_IDS];
  }
}

export type GeneratedKind = "open" | "manage" | "messy";

export interface GeneratedMessage {
  text: string;
  from: string;
  kind: GeneratedKind;
}

export function generateMessage(
  source: TelegramSource,
  quotes: Record<SymbolId, Quote>,
  liveSignalNumbers: number[],
): GeneratedMessage {
  const from = pick(AUTHORS[source.id] ?? ["Admin"]);
  const roll = Math.random();
  if (liveSignalNumbers.length && roll < 0.22) {
    return { from, kind: "manage", text: manageText(liveSignalNumbers, quotes) };
  }
  if (roll < 0.32) {
    return { from, kind: "messy", text: messyText(source, quotes) };
  }
  return { from, kind: "open", text: cleanText(source, quotes) };
}

function cleanText(source: TelegramSource, quotes: Record<SymbolId, Quote>): string {
  const symbol = pick(preferredSymbols(source.id));
  const q = quotes[symbol];
  const mid = (q.bid + q.ask) / 2;
  const side: Side = Math.random() > 0.48 ? "buy" : "sell";
  const dir = side === "buy" ? 1 : -1;
  const sl = mid - dir * pips(symbol, 18 + Math.random() * 22);
  const tp1 = mid + dir * pips(symbol, 16 + Math.random() * 10);
  const tp2 = mid + dir * pips(symbol, 32 + Math.random() * 16);
  const tp3 = mid + dir * pips(symbol, 55 + Math.random() * 24);
  const entryA = mid - dir * pips(symbol, 1.2);
  const entryB = mid + dir * pips(symbol, 2.4);
  const f = (n: number) => formatPrice(symbol, n);
  const style = Math.floor(Math.random() * 3);
  const header = `${symbol} ${side.toUpperCase()} NOW`;
  if (style === 0) {
    return [
      header,
      `Entry: ${f(entryA)} - ${f(entryB)}`,
      `SL: ${f(sl)}`,
      `TP1: ${f(tp1)}`,
      `TP2: ${f(tp2)}`,
      `TP3: ${f(tp3)}`,
    ].join("\n");
  }
  if (style === 1) {
    return `${header}
Entry ${f(mid)}
SL ${f(sl)}
TP ${f(tp1)} / ${f(tp2)} / ${f(tp3)}`;
  }
  return `${side === "buy" ? "BUY" : "SELL"} ${symbol}
Stop loss ${f(sl)}
Take profit ${f(tp1)}
TP2 ${f(tp2)}`;
}

function messyText(source: TelegramSource, quotes: Record<SymbolId, Quote>): string {
  const symbol = pick(preferredSymbols(source.id));
  const q = quotes[symbol];
  const mid = (q.bid + q.ask) / 2;
  const f = (n: number) => formatPrice(symbol, n);
  const variants = [
    `looking at ${symbol} for a long here, sl a bit under ${f(mid - pips(symbol, 22))} tps ${f(mid + pips(symbol, 18))} then ${f(mid + pips(symbol, 40))}`,
    `${symbol} short if we reject, invalidation ${f(mid + pips(symbol, 16))}`,
    `scalp ${symbol} same plan as last, tight sl`,
    `gold looking heavy / wait for confirmation`,
    `${symbol} in premium, want a sell model. no chase.`,
  ];
  return pick(variants);
}

function manageText(numbers: number[], quotes: Record<SymbolId, Quote>): string {
  const n = pick(numbers);
  const variants = [
    `Close 50% on #${n}`,
    `Move SL to BE on #${n}`,
    `Close #${n} now`,
    `TP1 hit, close 50% #${n}`,
    `Trail #${n}`,
    `Book ${pick(["XAUUSD", "EURUSD", "NAS100"] as SymbolId[])} now`,
  ];
  void quotes;
  return pick(variants);
}

export function chatTitle(kind: TelegramSource["kind"]): string {
  if (kind === "channel") return "Channel";
  if (kind === "supergroup") return "Supergroup";
  return "Group";
}
