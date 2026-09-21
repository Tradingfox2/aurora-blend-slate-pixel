import { fillPrice, pipDistance, pipValueUsd, SPECS } from "./symbols";
import type { Account, ParsedSignal, Quote, RiskSettings, SymbolId } from "./types";

export function roundLot(lots: number): number {
  const x = Math.round(lots * 100) / 100;
  return Math.max(0.01, x);
}

export function defaultSlPrice(
  symbol: SymbolId,
  side: "buy" | "sell",
  entry: number,
  pips: number,
): number {
  const dist = SPECS[symbol].pipSize * pips;
  return side === "buy" ? entry - dist : entry + dist;
}

export function sizeLots(args: {
  account: Account;
  symbol: SymbolId;
  parsed: ParsedSignal;
  quote: Quote;
  risk?: RiskSettings;
}): number {
  const { account, symbol, parsed, quote } = args;
  const risk = args.risk ?? account.risk;
  const entry =
    parsed.entry ?? fillPrice(parsed.side, quote);
  const sl =
    parsed.sl ??
    defaultSlPrice(symbol, parsed.side, entry, Math.max(8, risk.fixedPips || 20));
  const slPips = Math.max(0.5, pipDistance(symbol, entry, sl));
  const pipVal = pipValueUsd(symbol, 1);

  let lots = 0.01;
  switch (risk.mode) {
    case "fixed_lots":
      lots = risk.fixedLots;
      break;
    case "fixed_pips": {
      const dollarRisk = pipVal * risk.fixedPips;
      lots = dollarRisk / (slPips * pipVal);
      break;
    }
    case "rr":
    case "percent": {
      const r = (account.equity * risk.percent) / 100;
      lots = r / (slPips * pipVal);
      break;
    }
    default:
      lots = risk.fixedLots;
  }

  if (parsed.lotsHint && parsed.lotsHint > 0) {
    lots = Math.min(lots, parsed.lotsHint);
  }
  lots = roundLot(lots);
  lots = Math.min(lots, risk.maxOpenLots);
  return lots;
}

export function followerLots(
  masterLots: number,
  follower: Account,
  masterEquity: number,
): number {
  const copy = follower.copy;
  if (!copy) return 0;
  let lots = masterLots * copy.multiplier;
  if (copy.equityScale && masterEquity > 0) {
    lots *= follower.equity / masterEquity;
  }
  lots = roundLot(lots);
  lots = Math.min(lots, copy.maxLot, follower.risk.maxOpenLots);
  return lots;
}

export function reverseSide<T extends "buy" | "sell">(side: T, reverse: boolean): T {
  if (!reverse) return side;
  return (side === "buy" ? "sell" : "buy") as T;
}

export function dailyLossHit(account: Account, realizedToday: number, floating: number): boolean {
  const cap = (account.risk.maxDailyLossPct / 100) * Math.max(account.equity, 1);
  return realizedToday + floating <= -cap;
}

export function fridayCutoff(now: number, hour: number | null): boolean {
  if (hour === null) return false;
  const d = new Date(now);
  const utcDay = d.getUTCDay();
  if (utcDay !== 5) return false;
  return d.getUTCHours() >= hour;
}
