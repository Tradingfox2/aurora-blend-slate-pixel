import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PnlText, Price, SideChip, SignalNo } from "@/components/trading/bits";
import { formatLots, formatPrice } from "@/lib/trading/format";
import { openPnl } from "@/lib/trading/stats";
import { useDesk } from "@/lib/trading/store";
import type { Position } from "@/lib/trading/types";

export function PositionsTable({ rows }: { rows: Position[] }) {
  const quotes = useDesk((s) => s.quotes);
  const accounts = useDesk((s) => s.accounts);
  const closePosition = useDesk((s) => s.closePosition);
  const modify = useDesk((s) => s.modify);
  const [edit, setEdit] = useState<string | null>(null);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  if (!rows.length) {
    return (
      <p className="px-1 py-8 text-center text-sm text-muted">No open positions.</p>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-[10px] uppercase tracking-wide text-subtle">
          <tr className="border-b border-border">
            {["Ticket", "Acct", "Sig", "Symbol", "Side", "Lots", "Open", "Mark", "SL", "TP", "P/L", ""].map((h) => (
              <th key={h} className="px-2 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const q = quotes[p.symbol];
            const mark = p.side === "buy" ? q.bid : q.ask;
            const acc = accounts.find((a) => a.id === p.accountId);
            const pnl = openPnl(p, quotes);
            return (
              <tr key={p.id} className="border-b border-border/70 hover:bg-bg-subtle/40">
                <td className="px-2 py-2 font-mono text-xs tabular text-muted">{p.ticket}</td>
                <td className="px-2 py-2 text-xs text-muted">{acc?.name ?? p.accountId}</td>
                <td className="px-2 py-2"><SignalNo n={p.signalNumber} /></td>
                <td className="px-2 py-2 font-medium">{p.symbol}</td>
                <td className="px-2 py-2"><SideChip side={p.side} /></td>
                <td className="px-2 py-2 font-mono tabular">{formatLots(p.lots)}</td>
                <td className="px-2 py-2"><Price symbol={p.symbol} value={p.openPrice} /></td>
                <td className="px-2 py-2"><Price symbol={p.symbol} value={mark} /></td>
                <td className="px-2 py-2 font-mono text-xs tabular text-muted">
                  {edit === p.id ? (
                    <Input value={sl} onChange={(e) => setSl(e.target.value)} className="h-8 w-24" />
                  ) : p.sl ? (
                    formatPrice(p.symbol, p.sl)
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2 py-2 font-mono text-xs tabular text-muted">
                  {edit === p.id ? (
                    <Input value={tp} onChange={(e) => setTp(e.target.value)} className="h-8 w-24" />
                  ) : p.tp ? (
                    formatPrice(p.symbol, p.tp)
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2 py-2"><PnlText value={pnl} /></td>
                <td className="px-2 py-2 text-right">
                  {edit === p.id ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        modify(p.id, {
                          sl: sl ? Number(sl) : p.sl,
                          tp: tp ? Number(tp) : p.tp,
                        });
                        setEdit(null);
                      }}
                    >
                      Save
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Position actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEdit(p.id);
                            setSl(p.sl?.toString() ?? "");
                            setTp(p.tp?.toString() ?? "");
                          }}
                        >
                          Modify SL/TP
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => modify(p.id, { sl: p.openPrice })}>
                          Break even
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => closePosition(p.id)}>Close</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
