import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualOrderButton } from "@/components/trading/manual-order";
import { PositionsTable } from "@/components/trading/positions-table";
import { Price, SideChip, SignalNo } from "@/components/trading/bits";
import { formatLots } from "@/lib/trading/format";
import { useDesk, type BulkMode } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/book")({
  component: BookPage,
});

const BULK: { mode: BulkMode; label: string }[] = [
  { mode: "close_all", label: "Close all" },
  { mode: "close_winners", label: "Close winners" },
  { mode: "close_losers", label: "Close losers" },
  { mode: "be_all", label: "BE all" },
  { mode: "flatten", label: "Flatten" },
  { mode: "cancel_all", label: "Cancel pendings" },
];

function BookPage() {
  const positions = useDesk((s) => s.positions);
  const orders = useDesk((s) => s.orders);
  const accounts = useDesk((s) => s.accounts);
  const bulk = useDesk((s) => s.bulk);
  const cancelOrder = useDesk((s) => s.cancelOrder);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Execution</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Positions</h1>
          <p className="mt-1 text-sm text-muted">
            Live tickets, pendings, and bulk actions across every terminal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManualOrderButton />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {BULK.map((b) => (
          <Button key={b.mode} size="sm" variant="outline" onClick={() => bulk(b.mode)}>
            {b.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open · {positions.length}</CardTitle>
        </CardHeader>
        <PositionsTable rows={positions} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending · {orders.length}</CardTitle>
        </CardHeader>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No pending orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wide text-subtle">
                <tr className="border-b border-border">
                  {["Ticket", "Acct", "Sig", "Symbol", "Type", "Lots", "Price", "SL", "TP", ""].map((h) => (
                    <th key={h} className="px-2 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const acc = accounts.find((a) => a.id === o.accountId);
                  return (
                    <tr key={o.id} className="border-b border-border/70">
                      <td className="px-2 py-2 font-mono text-xs">{o.ticket}</td>
                      <td className="px-2 py-2 text-xs text-muted">{acc?.name}</td>
                      <td className="px-2 py-2"><SignalNo n={o.signalNumber} /></td>
                      <td className="px-2 py-2">{o.symbol}</td>
                      <td className="px-2 py-2">
                        <SideChip side={o.side} />
                        <span className="ml-2 text-xs text-muted">{o.type.replace("_", " ")}</span>
                      </td>
                      <td className="px-2 py-2 font-mono tabular">{formatLots(o.lots)}</td>
                      <td className="px-2 py-2"><Price symbol={o.symbol} value={o.price} /></td>
                      <td className="px-2 py-2 font-mono text-xs text-muted">{o.sl ?? "—"}</td>
                      <td className="px-2 py-2 font-mono text-xs text-muted">{o.tp ?? "—"}</td>
                      <td className="px-2 py-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => cancelOrder(o.id)}>
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
