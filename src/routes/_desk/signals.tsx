import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SignalNo, SignalStatusChip, SideChip } from "@/components/trading/bits";
import { formatTime, latencyLabel } from "@/lib/trading/format";
import { interpretWithGrok } from "@/lib/trading/interpret";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/signals")({
  component: SignalsPage,
});

function SignalsPage() {
  const signals = useDesk((s) => s.signals);
  const sources = useDesk((s) => s.sources);
  const now = useDesk((s) => s.now);
  const executeSignal = useDesk((s) => s.executeSignal);
  const ignoreSignal = useDesk((s) => s.ignoreSignal);
  const interpretSignal = useDesk((s) => s.interpretSignal);
  const settings = useDesk((s) => s.settings);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const rows = signals.filter((s) => {
    const blob = `${s.number} ${s.rawText} ${s.parsed?.symbol ?? ""}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Book</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Signals</h1>
          <p className="mt-1 text-sm text-muted">
            Every intake gets a number. Positions, copies and history stay attached to that ticket.
          </p>
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter number, symbol, text"
          className="max-w-xs"
        />
      </div>
      <Card className="p-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle>{rows.length} tickets</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wide text-subtle">
              <tr className="border-b border-border">
                {["No", "Source", "Parsed", "Conf", "Status", "Age", "Latency", ""].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const src = sources.find((x) => x.id === s.sourceId);
                return (
                  <tr key={s.id} className="border-b border-border/70 align-top">
                    <td className="px-3 py-3"><SignalNo n={s.number} /></td>
                    <td className="px-3 py-3 text-xs text-muted">{src?.name}</td>
                    <td className="px-3 py-3">
                      {s.parsed ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <SideChip side={s.parsed.side} />
                          <span className="font-medium">{s.parsed.symbol}</span>
                          <span className="text-xs text-muted">{s.parsed.action}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">unparsed</span>
                      )}
                      <pre className="mt-1 max-w-sm truncate font-mono text-[11px] text-subtle">{s.rawText}</pre>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs tabular">{Math.round(s.confidence * 100)}%</td>
                    <td className="px-3 py-3"><SignalStatusChip status={s.status} /></td>
                    <td className="px-3 py-3 font-mono text-xs tabular text-muted">{formatTime(s.receivedAt, now)}</td>
                    <td className="px-3 py-3 font-mono text-xs tabular text-muted">{latencyLabel(s.latency.totalMs)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button size="sm" disabled={!s.parsed} onClick={() => executeSignal(s.id)}>
                          Route
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === s.id}
                          onClick={async () => {
                            if (settings.grokCallsUsed >= settings.grokCallCap) {
                              toast("Grok call cap reached");
                              return;
                            }
                            setBusy(s.id);
                            const res = await interpretWithGrok({ data: { text: s.rawText } });
                            setBusy(null);
                            if (!res.ok) {
                              toast(res.error);
                              return;
                            }
                            interpretSignal(s.id, res.parsed, res.confidence, "grok");
                          }}
                        >
                          Grok
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => ignoreSignal(s.id)}>
                          Ignore
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
