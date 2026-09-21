import { resolveSymbol } from "./symbols";
import type { OrderType, ParsedSignal, Side, SignalAction, SymbolId } from "./types";
import { SYMBOL_IDS } from "./types";

const NUM = String.raw`(\d+(?:\.\d+)?)`;

function num(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function detectSymbol(text: string): SymbolId | null {
  const upper = text.toUpperCase();
  const ordered = Object.keys(
    // longest first so GOLDSPOT beats GOLD, EURUSD beats EUR
    {
      GOLDSPOT: 1,
      XAUUSDM: 1,
      EURUSD: 1,
      GBPUSD: 1,
      USDJPY: 1,
      GBPJPY: 1,
      BTCUSD: 1,
      ETHUSD: 1,
      NASDAQ: 1,
      NAS100: 1,
      USTEC: 1,
      US100: 1,
      USOIL: 1,
      XAUUSD: 1,
      BITCOIN: 1,
      ETHEREUM: 1,
      CABLE: 1,
      CRUDE: 1,
      WALLSTREET: 1,
      "EUR/USD": 1,
      "GBP/USD": 1,
      "USD/JPY": 1,
      "GBP/JPY": 1,
      DJ30: 1,
      US30: 1,
      GOLD: 1,
      XAU: 1,
      BTC: 1,
      ETH: 1,
      WTI: 1,
      OIL: 1,
      DOW: 1,
      NAS: 1,
    } as Record<string, 1>,
  ).sort((a, b) => b.length - a.length);

  for (const alias of ordered) {
    const escaped = alias.replace("/", "\\/");
    const re = new RegExp(`(^|[^A-Z0-9])${escaped}([^A-Z0-9]|$)`);
    if (re.test(upper)) return resolveSymbol(alias);
  }
  return null;
}

function detectSide(text: string): Side | null {
  const u = text.toUpperCase();
  if (/\b(SELL|SHORT|BEARISH)\b/.test(u)) return "sell";
  if (/\b(BUY|LONG|BULLISH)\b/.test(u)) return "buy";
  return null;
}

function detectAction(text: string): SignalAction {
  const u = text.toUpperCase();
  if (/\b(CLOSE\s*ALL|FLAT|FLATTEN|KILL)\b/.test(u)) return "close";
  if (/\b(BE|BREAK\s*EVEN|SL\s*TO\s*BE|MOVE\s*SL\s*TO\s*(BE|ENTRY))\b/.test(u))
    return "be";
  if (/\b(DELETE|CANCEL|REMOVE\s*PENDING)\b/.test(u)) return "delete";
  if (/\b(CLOSE\s*\d+\s*%|PARTIAL|TP1\s*HIT|SECURE|TAKE\s*PARTIAL)\b/.test(u))
    return "partial";
  if (/\b(CLOSE|BOOK|EXIT|TAKE\s*PROFIT\s*NOW)\b/.test(u) && !/\bTP\d?\b/.test(u.split("\n")[0] ?? "")) {
    if (/\b(CLOSE|EXIT|BOOK PROFIT|CLOSE NOW)\b/.test(u)) return "close";
  }
  if (/\b(MOVE\s*SL|MODIFY|NEW\s*SL|TRAIL)\b/.test(u)) return "modify";
  return "open";
}

function collectNumbers(re: RegExp, text: string): number[] {
  const out: number[] = [];
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = r.exec(text))) {
    const n = num(m[1]);
    if (n !== undefined) out.push(n);
  }
  return out;
}

function detectOrderType(text: string, side: Side): OrderType {
  const u = text.toUpperCase();
  if (/\bBUY\s*LIMIT\b/.test(u)) return "buy_limit";
  if (/\bSELL\s*LIMIT\b/.test(u)) return "sell_limit";
  if (/\bBUY\s*STOP\b/.test(u)) return "buy_stop";
  if (/\bSELL\s*STOP\b/.test(u)) return "sell_stop";
  if (/\bLIMIT\b/.test(u)) return side === "buy" ? "buy_limit" : "sell_limit";
  if (/\bSTOP\b/.test(u) && !/\bSTOP\s*LOSS\b/.test(u) && !/\bSL\b/.test(u))
    return side === "buy" ? "buy_stop" : "sell_stop";
  return "market";
}

export interface ParseResult {
  parsed: ParsedSignal | null;
  confidence: number;
  note: string;
}

export function parseSignal(raw: string): ParseResult {
  const t0 = performance.now();
  const text = raw.replace(/\u00a0/g, " ").trim();
  if (!text) return { parsed: null, confidence: 0, note: "empty" };

  const action = detectAction(text);
  const symbol = detectSymbol(text);
  const side = detectSide(text);

  const refMatch = text.match(/#\s*(\d{1,5})/);
  const signalRef = num(refMatch?.[1]);

  const sls = collectNumbers(
    new RegExp(
      String.raw`(?:SL|S\/L|STOP\s*LOSS|STOPLOSS)\s*[:\-]?\s*${NUM}`,
      "i",
    ),
    text,
  );
  const tps = collectNumbers(
    new RegExp(String.raw`(?:TP\s*\d*|T\/P|TAKE\s*PROFIT)\s*[:\-]?\s*${NUM}`, "i"),
    text,
  );
  const entries = collectNumbers(
    new RegExp(
      String.raw`(?:ENTRY|ENTER|NOW|ZONE|PRICE)\s*[:\-]?\s*${NUM}(?:\s*[-–/]\s*${NUM})?`,
      "i",
    ),
    text,
  );
  const entryZone = text.match(
    new RegExp(String.raw`(?:ENTRY|ZONE)\s*[:\-]?\s*${NUM}\s*[-–/]\s*${NUM}`, "i"),
  );

  const closePctMatch = text.match(/(\d{1,3})\s*%/);
  const closePct =
    action === "partial" ? Math.min(100, num(closePctMatch?.[1]) ?? 50) : undefined;

  const newSl = collectNumbers(
    new RegExp(String.raw`(?:NEW\s*SL|MOVE\s*SL(?:\s*TO)?)\s*[:\-]?\s*${NUM}`, "i"),
    text,
  )[0];

  if (action !== "open") {
    if (!symbol && signalRef === undefined)
      return {
        parsed: null,
        confidence: 0.2,
        note: "management without symbol or ticket",
      };
    const parsed: ParsedSignal = {
      symbol: symbol ?? (SYMBOL_IDS[0] as SymbolId),
      side: side ?? "buy",
      orderType: "market",
      sl: sls[0],
      tps,
      action,
      closePct,
      newSl,
      signalRef,
    };
    const confidence =
      (symbol ? 0.35 : 0) + (signalRef ? 0.4 : 0.15) + 0.25;
    void t0;
    return {
      parsed,
      confidence: Math.min(0.97, confidence),
      note: "management",
    };
  }

  if (!symbol || !side) {
    return {
      parsed: null,
      confidence: symbol || side ? 0.35 : 0.1,
      note: !symbol ? "no symbol" : "no side",
    };
  }

  const orderType = detectOrderType(text, side);
  const entry = entryZone ? num(entryZone[1]) : entries[0];
  const entryMax = entryZone ? num(entryZone[2]) : undefined;

  const parsed: ParsedSignal = {
    symbol,
    side,
    orderType,
    entry,
    entryMax,
    sl: sls[0],
    tps: tps.slice(0, 3),
    action: "open",
    signalRef,
  };

  let confidence = 0.55;
  if (parsed.sl) confidence += 0.18;
  if (parsed.tps.length) confidence += 0.12;
  if (parsed.entry) confidence += 0.08;
  if (parsed.tps.length >= 2) confidence += 0.05;
  if (orderType !== "market") confidence += 0.04;

  return {
    parsed,
    confidence: Math.min(0.99, confidence),
    note: `local ${((performance.now() - t0) * 1000) | 0}µs`,
  };
}

export function parsedToJson(p: ParsedSignal): string {
  return JSON.stringify(p);
}

export function parsedFromUnknown(raw: unknown): ParsedSignal | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const symbol = typeof o.symbol === "string" ? resolveSymbol(o.symbol) : null;
  const side = o.side === "buy" || o.side === "sell" ? o.side : null;
  if (!symbol || !side) return null;
  const action = (
    [
      "open",
      "close",
      "partial",
      "modify",
      "be",
      "delete",
    ] as SignalAction[]
  ).includes(o.action as SignalAction)
    ? (o.action as SignalAction)
    : "open";
  const tps = Array.isArray(o.tps)
    ? o.tps.filter((n): n is number => typeof n === "number")
    : [];
  const orderType = (
    [
      "market",
      "buy_limit",
      "sell_limit",
      "buy_stop",
      "sell_stop",
    ] as OrderType[]
  ).includes(o.orderType as OrderType)
    ? (o.orderType as OrderType)
    : "market";
  return {
    symbol,
    side,
    orderType,
    entry: typeof o.entry === "number" ? o.entry : undefined,
    entryMax: typeof o.entryMax === "number" ? o.entryMax : undefined,
    sl: typeof o.sl === "number" ? o.sl : undefined,
    tps,
    lotsHint: typeof o.lotsHint === "number" ? o.lotsHint : undefined,
    action,
    closePct: typeof o.closePct === "number" ? o.closePct : undefined,
    newSl: typeof o.newSl === "number" ? o.newSl : undefined,
    newTp: typeof o.newTp === "number" ? o.newTp : undefined,
    signalRef: typeof o.signalRef === "number" ? o.signalRef : undefined,
    comment: typeof o.comment === "string" ? o.comment : undefined,
  };
}
