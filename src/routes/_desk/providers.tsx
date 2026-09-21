import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PnlText } from "@/components/trading/bits";
import { formatPct, formatTime } from "@/lib/trading/format";
import { providerStats } from "@/lib/trading/stats";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/providers")({
  component: ProvidersPage,
});

function ProvidersPage() {
  const sources = useDesk((s) => s.sources);
  const history = useDesk((s) => s.history);
  const now = useDesk((s) => s.now);
  const patchSource = useDesk((s) => s.patchSource);
  const stats = providerStats(sources, history);
  const chart = stats.filter((s) => s.trades > 0).map((s) => ({ name: s.name.replace(/ .*/, ""), profit: Number(s.profit.toFixed(2)) }));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Scoreboard</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Providers</h1>
        <p className="mt-1 text-sm text-muted">
          Ranked on closed tickets from this desk. Auto-trade is per channel, independent of the score.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net by source</CardTitle>
        </CardHeader>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#5c6370" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#5c6370" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#151922", border: "1px solid #232833", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="profit" fill="#c5ccd8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="overflow-x-auto rounded-lg bg-bg-elevated shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-wide text-subtle">
            <tr className="border-b border-border">
              {["Provider", "Trades", "Win", "Net", "PF", "Avg win", "Last", "Auto"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => {
              const src = sources.find((x) => x.id === s.sourceId);
              return (
                <tr key={s.sourceId} className="border-b border-border/70">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium">{s.name}</span>
                      {i === 0 && s.trades ? <Badge variant="accent">lead</Badge> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono tabular">{s.trades}</td>
                  <td className="px-3 py-3 font-mono tabular">{formatPct(s.winRate)}</td>
                  <td className="px-3 py-3"><PnlText value={s.profit} /></td>
                  <td className="px-3 py-3 font-mono tabular text-muted">{s.profitFactor.toFixed(2)}</td>
                  <td className="px-3 py-3"><PnlText value={s.avgWin} /></td>
                  <td className="px-3 py-3 font-mono text-xs text-muted">{s.lastAt ? formatTime(s.lastAt, now) : "—"}</td>
                  <td className="px-3 py-3">
                    <Switch
                      checked={Boolean(src?.autoTrade)}
                      onCheckedChange={(v) => patchSource(s.sourceId, { autoTrade: v, listening: v || src?.listening })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
