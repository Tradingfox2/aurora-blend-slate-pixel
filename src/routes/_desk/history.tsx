import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PnlText, SideChip, SignalNo } from "@/components/trading/bits";
import { downloadText, historyToCsv } from "@/lib/trading/export";
import { formatDateTime, formatLots, formatPrice, formatUsd } from "@/lib/trading/format";
import { journalStats } from "@/lib/trading/stats";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const history = useDesk((s) => s.history);
  const accounts = useDesk((s) => s.accounts);
  const sources = useDesk((s) => s.sources);
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"all" | "buy" | "sell">("all");
  const rows = useMemo(
    () =>
      history.filter((h) => {
        if (side !== "all" && h.side !== side) return false;
        const acc = accounts.find((a) => a.id === h.accountId)?.name ?? "";
        const src = sources.find((s) => s.id === h.sourceId)?.name ?? "";
        return `${h.ticket} ${h.symbol} ${h.signalNumber ?? ""} ${acc} ${src}`.toLowerCase().includes(q.toLowerCase());
      }),
    [history, q, accounts, sources, side],
  );
  const j = journalStats(rows);

  function exportCsv() {
    const csv = historyToCsv(rows, {
      account: (id) => accounts.find((a) => a.id === id)?.name ?? id,
      source: (id) => sources.find((s) => s.id === id)?.name ?? "",
    });
    downloadText(`volt-journal-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="page-enter mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Archive</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">History</h1>
          <p className="mt-1 text-sm text-muted">
            Closed tickets with MAE / MFE and hold time — export CSV for external review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-sm bg-bg-subtle px-2 text-xs shadow-[var(--shadow-border)]"
            value={side}
            onChange={(e) => setSide(e.target.value as typeof side)}
          >
            <option value="all">All sides</option>
            <option value="buy">Buys</option>
            <option value="sell">Sells</option>
          </select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" className="w-48" />
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows.length}>
            <Download className="size-3.5" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-subtle">Net</p>
          <div className="mt-1 font-mono text-lg">
            <PnlText value={j.profit} />
          </div>
          <p className="text-xs text-muted">{j.trades} tickets</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-subtle">Win rate</p>
          <p className="mt-1 font-mono text-lg tabular">{(j.winRate * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted">Expectancy {formatUsd(j.expectancy)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-subtle">Avg MFE / MAE</p>
          <p className="mt-1 font-mono text-sm tabular">
            <span className="text-buy">+{j.avgMfe.toFixed(0)}</span>
            <span className="text-muted"> / </span>
            <span className="text-sell">-{j.avgMae.toFixed(0)}</span>
          </p>
          <p className="text-xs text-muted">Capture {(j.efficiency * 100).toFixed(0)}% of MFE</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] uppercase tracking-wide text-subtle">Avg hold</p>
          <p className="mt-1 font-mono text-lg tabular">{j.avgHoldMin.toFixed(0)}m</p>
          <p className="text-xs text-muted">Closed duration</p>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <CardHeader className="px-3 pt-3">
          <CardTitle>Journal · {rows.length}</CardTitle>
        </CardHeader>
        {rows.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted">No closed trades match this filter.</p>
        ) : (
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wide text-subtle">
              <tr className="border-b border-border">
                {["Closed", "Ticket", "Sig", "Acct", "Source", "Symbol", "Side", "Lots", "Open", "Close", "P/L", "MFE", "MAE", "Hold", "Note"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const holdMin = ((h.durationMs ?? h.closeTime - h.openTime) / 60_000).toFixed(0);
                return (
                  <tr key={h.id} className="border-b border-border/70">
                    <td className="px-3 py-2 font-mono text-xs text-muted">{formatDateTime(h.closeTime)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{h.ticket}</td>
                    <td className="px-3 py-2">
                      <SignalNo n={h.signalNumber} />
                    </td>
                    <td className="px-3 py-2 text-xs text-muted">{accounts.find((a) => a.id === h.accountId)?.name}</td>
                    <td className="px-3 py-2 text-xs text-muted">
                      {sources.find((s) => s.id === h.sourceId)?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2">{h.symbol}</td>
                    <td className="px-3 py-2">
                      <SideChip side={h.side} />
                    </td>
                    <td className="px-3 py-2 font-mono tabular">{formatLots(h.lots)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{formatPrice(h.symbol, h.openPrice)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{formatPrice(h.symbol, h.closePrice)}</td>
                    <td className="px-3 py-2">
                      <PnlText value={h.profit} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular text-buy">{(h.mfe ?? 0).toFixed(0)}</td>
                    <td className="px-3 py-2 font-mono text-xs tabular text-sell">{(h.mae ?? 0).toFixed(0)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted">{holdMin}m</td>
                    <td className="px-3 py-2 text-xs text-muted">{h.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
