import type { Quote, SymbolId } from "./types";

export interface SymbolSpec {
  id: SymbolId;
  label: string;
  digits: number;
  pipSize: number;
  contractSize: number;
  baseSpread: number;
  vol: number;
  session: "fx" | "index" | "metal" | "energy" | "crypto";
}

export const SPECS: Record<SymbolId, SymbolSpec> = {
  XAUUSD: {
    id: "XAUUSD",
    label: "Gold",
    digits: 2,
    pipSize: 0.1,
    contractSize: 100,
    baseSpread: 0.18,
    vol: 0.42,
    session: "metal",
  },
  EURUSD: {
    id: "EURUSD",
    label: "EUR/USD",
    digits: 5,
    pipSize: 0.0001,
    contractSize: 100_000,
    baseSpread: 0.00008,
    vol: 0.00012,
    session: "fx",
  },
  GBPUSD: {
    id: "GBPUSD",
    label: "GBP/USD",
    digits: 5,
    pipSize: 0.0001,
    contractSize: 100_000,
    baseSpread: 0.00011,
    vol: 0.00016,
    session: "fx",
  },
  USDJPY: {
    id: "USDJPY",
    label: "USD/JPY",
    digits: 3,
    pipSize: 0.01,
    contractSize: 100_000,
    baseSpread: 0.012,
    vol: 0.028,
    session: "fx",
  },
  GBPJPY: {
    id: "GBPJPY",
    label: "GBP/JPY",
    digits: 3,
    pipSize: 0.01,
    contractSize: 100_000,
    baseSpread: 0.028,
    vol: 0.055,
    session: "fx",
  },
  NAS100: {
    id: "NAS100",
    label: "US Tech 100",
    digits: 1,
    pipSize: 1,
    contractSize: 1,
    baseSpread: 1.2,
    vol: 4.8,
    session: "index",
  },
  US30: {
    id: "US30",
    label: "Wall Street 30",
    digits: 1,
    pipSize: 1,
    contractSize: 1,
    baseSpread: 2.4,
    vol: 8.5,
    session: "index",
  },
  USOIL: {
    id: "USOIL",
    label: "WTI Crude",
    digits: 2,
    pipSize: 0.01,
    contractSize: 1000,
    baseSpread: 0.03,
    vol: 0.09,
    session: "energy",
  },
  BTCUSD: {
    id: "BTCUSD",
    label: "Bitcoin",
    digits: 1,
    pipSize: 1,
    contractSize: 1,
    baseSpread: 12,
    vol: 38,
    session: "crypto",
  },
  ETHUSD: {
    id: "ETHUSD",
    label: "Ether",
    digits: 2,
    pipSize: 0.1,
    contractSize: 1,
    baseSpread: 1.4,
    vol: 6.2,
    session: "crypto",
  },
};

export const OPENING: Record<SymbolId, number> = {
  XAUUSD: 3684.72,
  EURUSD: 1.08426,
  GBPUSD: 1.31248,
  USDJPY: 148.214,
  GBPJPY: 194.632,
  NAS100: 20148.6,
  US30: 43518.4,
  USOIL: 72.38,
  BTCUSD: 97240,
  ETHUSD: 3482.4,
};

export const ALIASES: Record<string, SymbolId> = {
  XAUUSD: "XAUUSD",
  GOLD: "XAUUSD",
  XAU: "XAUUSD",
  GOLDSPOT: "XAUUSD",
  XAUUSDM: "XAUUSD",
  EURUSD: "EURUSD",
  EUR: "EURUSD",
  "EUR/USD": "EURUSD",
  EU: "EURUSD",
  GBPUSD: "GBPUSD",
  GBP: "GBPUSD",
  "GBP/USD": "GBPUSD",
  GU: "GBPUSD",
  CABLE: "GBPUSD",
  USDJPY: "USDJPY",
  "USD/JPY": "USDJPY",
  UJ: "USDJPY",
  JPY: "USDJPY",
  GBPJPY: "GBPJPY",
  "GBP/JPY": "GBPJPY",
  GJ: "GBPJPY",
  NAS100: "NAS100",
  NASDAQ: "NAS100",
  USTEC: "NAS100",
  NAS: "NAS100",
  US100: "NAS100",
  NDX: "NAS100",
  US30: "US30",
  DJ30: "US30",
  DOW: "US30",
  DJI: "US30",
  WALLSTREET: "US30",
  USOIL: "USOIL",
  OIL: "USOIL",
  WTI: "USOIL",
  CRUDE: "USOIL",
  CL: "USOIL",
  BTCUSD: "BTCUSD",
  BTC: "BTCUSD",
  BITCOIN: "BTCUSD",
  ETHUSD: "ETHUSD",
  ETH: "ETHUSD",
  ETHER: "ETHUSD",
  ETHEREUM: "ETHUSD",
};

export function resolveSymbol(raw: string): SymbolId | null {
  const key = raw.toUpperCase().replace(/\s+/g, "");
  return ALIASES[key] ?? null;
}

export function seedQuotes(now: number): Record<SymbolId, Quote> {
  const quotes = {} as Record<SymbolId, Quote>;
  for (const id of Object.keys(OPENING) as SymbolId[]) {
    const spec = SPECS[id];
    const mid = OPENING[id];
    const half = spec.baseSpread / 2;
    quotes[id] = {
      bid: mid - half,
      ask: mid + half,
      spread: spec.baseSpread,
      ts: now,
      change: 0,
    };
  }
  return quotes;
}

export function pipDistance(symbol: SymbolId, a: number, b: number): number {
  return Math.abs(a - b) / SPECS[symbol].pipSize;
}

export function pipValueUsd(symbol: SymbolId, lots: number): number {
  const spec = SPECS[symbol];
  return spec.pipSize * spec.contractSize * lots;
}

export function pnlUsd(
  symbol: SymbolId,
  side: "buy" | "sell",
  open: number,
  close: number,
  lots: number,
): number {
  const spec = SPECS[symbol];
  const dir = side === "buy" ? 1 : -1;
  return (close - open) * dir * spec.contractSize * lots;
}

export function markPrice(side: "buy" | "sell", quote: Quote): number {
  return side === "buy" ? quote.bid : quote.ask;
}

export function fillPrice(side: "buy" | "sell", quote: Quote): number {
  return side === "buy" ? quote.ask : quote.bid;
}
