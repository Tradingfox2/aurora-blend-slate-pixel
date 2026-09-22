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

export function providerStats(
  sources: TelegramSource[],
  history: ClosedTrade[],
): ProviderStat[] {
  return sources
    .map((src) => {
      const rows = history.filter((h) => h.sourceId === src.id);
      const wins = rows.filter((r) => r.profit > 0);
      const losses = rows.filter((r) => r.profit < 0);
      const grossWin = wins.reduce((s, r) => s + r.profit, 0);
      const grossLoss = Math.abs(losses.reduce((s, r) => s + r.profit, 0));
      return {
        sourceId: src.id,
        name: src.name,
        trades: rows.length,
        wins: wins.length,
        winRate: rows.length ? wins.length / rows.length : 0,
        profit: rows.reduce((s, r) => s + r.profit, 0),
        profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 9.9 : 0,
        avgWin: wins.length ? grossWin / wins.length : 0,
        avgLoss: losses.length ? losses.reduce((s, r) => s + r.profit, 0) / losses.length : 0,
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

export function totals(history: ClosedTrade[]) {
  const profit = history.reduce((s, r) => s + r.profit, 0);
  const wins = history.filter((h) => h.profit > 0).length;
  return {
    profit,
    trades: history.length,
    winRate: history.length ? wins / history.length : 0,
    wins,
  };
}

export function journalStats(history: ClosedTrade[]) {
  if (!history.length) {
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
  const wins = history.filter((h) => h.profit > 0);
  const profit = history.reduce((s, r) => s + r.profit, 0);
  const avgMfe = history.reduce((s, r) => s + (r.mfe ?? 0), 0) / history.length;
  const avgMae = history.reduce((s, r) => s + (r.mae ?? 0), 0) / history.length;
  const avgHoldMin =
    history.reduce((s, r) => s + (r.durationMs ?? Math.max(0, r.closeTime - r.openTime)), 0) /
    history.length /
    60_000;
  const captured = history.reduce((s, r) => {
    const mfe = r.mfe ?? 0;
    if (mfe <= 0) return s;
    return s + Math.min(1, Math.max(0, r.profit) / mfe);
  }, 0);
  const withMfe = history.filter((r) => (r.mfe ?? 0) > 0).length || 1;
  return {
    trades: history.length,
    profit,
    winRate: wins.length / history.length,
    avgMfe,
    avgMae,
    avgHoldMin,
    efficiency: captured / withMfe,
    expectancy: profit / history.length,
  };
}
