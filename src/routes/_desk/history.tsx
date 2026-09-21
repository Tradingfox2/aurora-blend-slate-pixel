import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PnlText, SideChip, SignalNo } from "@/components/trading/bits";
import { formatDateTime, formatLots, formatPrice, formatUsd } from "@/lib/trading/format";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const history = useDesk((s) => s.history);
  const accounts = useDesk((s) => s.accounts);
  const sources = useDesk((s) => s.sources);
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      history.filter((h) => {
        const acc = accounts.find((a) => a.id === h.accountId)?.name ?? "";
        const src = sources.find((s) => s.id === h.sourceId)?.name ?? "";
        return `${h.ticket} ${h.symbol} ${h.signalNumber ?? ""} ${acc} ${src}`.toLowerCase().includes(q.toLowerCase());
      }),
    [history, q, accounts, sources],
  );
  const net = rows.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Archive</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">History</h1>
          <p className="mt-1 text-sm text-muted">Closed tickets with signal numbers intact.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            Net <span className="font-mono">{formatUsd(net)}</span>
          </span>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" className="w-48" />
        </div>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-wide text-subtle">
            <tr className="border-b border-border">
              {["Closed", "Ticket", "Sig", "Acct", "Source", "Symbol", "Side", "Lots", "Open", "Close", "P/L", "Note"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id} className="border-b border-border/70">
                <td className="px-3 py-2 font-mono text-xs text-muted">{formatDateTime(h.closeTime)}</td>
                <td className="px-3 py-2 font-mono text-xs">{h.ticket}</td>
                <td className="px-3 py-2"><SignalNo n={h.signalNumber} /></td>
                <td className="px-3 py-2 text-xs text-muted">{accounts.find((a) => a.id === h.accountId)?.name}</td>
                <td className="px-3 py-2 text-xs text-muted">{sources.find((s) => s.id === h.sourceId)?.name ?? "—"}</td>
                <td className="px-3 py-2">{h.symbol}</td>
                <td className="px-3 py-2"><SideChip side={h.side} /></td>
                <td className="px-3 py-2 font-mono tabular">{formatLots(h.lots)}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatPrice(h.symbol, h.openPrice)}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatPrice(h.symbol, h.closePrice)}</td>
                <td className="px-3 py-2"><PnlText value={h.profit} /></td>
                <td className="px-3 py-2 text-xs text-muted">{h.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
