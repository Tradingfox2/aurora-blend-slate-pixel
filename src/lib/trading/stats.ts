import { pnlUsd } from "./symbols";
import type { ClosedTrade, Position, Quote, SymbolId, TelegramSource } from "./types";

export interface ProviderStat {
  sourceId: string;
  name: string;
  trades: number;
  wins: number;
  winRate: number;
  profit: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  lastAt: number | null;
}

// Single-pass O(N) provider stats calculation avoiding multi-pass filter/reduce allocations
export function providerStats(
  sources: TelegramSource[],
  history: ClosedTrade[],
): ProviderStat[] {
  // Pre-group trade history by sourceId in one pass
  const bySource = new Map<string, ClosedTrade[]>();
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    if (!h.sourceId) continue;
    let list = bySource.get(h.sourceId);
    if (!list) {
      list = [];
      bySource.set(h.sourceId, list);
    }
    list.push(h);
  }

  return sources
    .map((src) => {
      const rows = bySource.get(src.id);
      if (!rows || !rows.length) {
        return {
          sourceId: src.id,
          name: src.name,
          trades: 0,
          wins: 0,
          winRate: 0,
          profit: 0,
          profitFactor: 0,
          avgWin: 0,
          avgLoss: 0,
          lastAt: null,
        };
      }

      let winCount = 0;
      let lossCount = 0;
      let grossWin = 0;
      let grossLoss = 0;
      let profit = 0;

      for (let i = 0; i < rows.length; i++) {
        const p = rows[i].profit;
        profit += p;
        if (p > 0) {
          winCount++;
          grossWin += p;
        } else if (p < 0) {
          lossCount++;
          grossLoss += Math.abs(p);
        }
      }

      const trades = rows.length;
      return {
        sourceId: src.id,
        name: src.name,
        trades,
        wins: winCount,
        winRate: trades ? winCount / trades : 0,
        profit,
        profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 9.9 : 0,
        avgWin: winCount ? grossWin / winCount : 0,
        avgLoss: lossCount ? -grossLoss / lossCount : 0,
        lastAt: rows[0]?.closeTime ?? null,
      };
    })
    .sort((a, b) => b.profit - a.profit);
}

export function openPnl(p: Position, quotes: Record<SymbolId, Quote>): number {
  const q = quotes[p.symbol];
  const px = p.side === "buy" ? q.bid : q.ask;
  return pnlUsd(p.symbol, p.side, p.openPrice, px, p.lots) - p.commission;
}

// Single-pass O(N) totals calculation
export function totals(history: ClosedTrade[]) {
  let profit = 0;
  let wins = 0;
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    profit += h.profit;
    if (h.profit > 0) wins++;
  }
  return {
    profit,
    trades: history.length,
    winRate: history.length ? wins / history.length : 0,
    wins,
  };
}

// Single-pass O(N) journal stats calculation avoiding 7 array passes
export function journalStats(history: ClosedTrade[]) {
  const len = history.length;
  if (!len) {
    return {
      trades: 0,
      profit: 0,
      winRate: 0,
      avgMfe: 0,
      avgMae: 0,
      avgHoldMin: 0,
      efficiency: 0,
      expectancy: 0,
    };
  }

  let wins = 0;
  let profit = 0;
  let sumMfe = 0;
  let sumMae = 0;
  let sumHoldMs = 0;
  let captured = 0;
  let withMfeCount = 0;

  for (let i = 0; i < len; i++) {
    const r = history[i];
    if (r.profit > 0) wins++;
    profit += r.profit;
    const mfe = r.mfe ?? 0;
    sumMfe += mfe;
    sumMae += r.mae ?? 0;
    sumHoldMs += r.durationMs ?? Math.max(0, r.closeTime - r.openTime);
    if (mfe > 0) {
      captured += Math.min(1, Math.max(0, r.profit) / mfe);
      withMfeCount++;
    }
  }

  return {
    trades: len,
    profit,
    winRate: wins / len,
    avgMfe: sumMfe / len,
    avgMae: sumMae / len,
    avgHoldMin: sumHoldMs / len / 60_000,
    efficiency: captured / (withMfeCount || 1),
    expectancy: profit / len,
  };
}
