import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PnlText } from "@/components/trading/bits";
import { formatUsd } from "@/lib/trading/format";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/risk")({
  component: RiskPage,
});

function RiskPage() {
  const circuits = useDesk((s) => s.circuits);
  const accounts = useDesk((s) => s.accounts);
  const setHalt = useDesk((s) => s.setHalt);
  const patchAccount = useDesk((s) => s.patchAccount);
  const setAccountFrozen = useDesk((s) => s.setAccountFrozen);
  const bulk = useDesk((s) => s.bulk);

  const spent = Math.max(0, -Math.min(0, circuits.realizedToday));
  const cap = accounts[0] ? (accounts[0].risk.maxDailyLossPct / 100) * circuits.dayStartEquity : 1;
  const used = Math.min(1, spent / cap);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Protection</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Circuits</h1>
        <p className="mt-1 text-sm text-muted">
          Halt is the panic switch. Daily loss, consecutive losses, spread, and Friday cutoff sit in front of every fill.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Global halt</CardTitle>
            <Switch checked={circuits.globalHalt} onCheckedChange={setHalt} />
          </CardHeader>
          <p className="text-sm text-muted">Blocks new orders. Open risk stays until you flatten.</p>
          <Button className="mt-4" variant="outline" size="sm" onClick={() => bulk("flatten")}>
            Flatten book
          </Button>
        </Card>
        <Card>
          <CardTitle className="mb-3">Daily loss</CardTitle>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
            <div className="h-full bg-sell" style={{ width: `${Math.round(used * 100)}%` }} />
          </div>
          <p className="mt-3 font-mono text-sm tabular">
            <PnlText value={circuits.realizedToday} />
            <span className="text-muted"> / {formatUsd(cap)} cap</span>
          </p>
          <p className="mt-1 text-xs text-muted">{circuits.dailyLossTripped ? "Tripped" : "Armed"}</p>
        </Card>
        <Card>
          <CardTitle className="mb-3">Streak</CardTitle>
          <p className="font-mono text-2xl tabular">{circuits.consecutiveLosses}</p>
          <p className="mt-1 text-xs text-muted">consecutive losses · {circuits.tradesToday} tickets today</p>
        </Card>
      </div>

      {accounts.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle>{a.name}</CardTitle>
            <Switch checked={!a.frozen} onCheckedChange={(v) => setAccountFrozen(a.id, !v)} />
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field
              label="Max daily loss %"
              value={a.risk.maxDailyLossPct}
              onChange={(maxDailyLossPct) => patchAccount(a.id, { risk: { ...a.risk, maxDailyLossPct } })}
            />
            <Field
              label="Max open lots"
              value={a.risk.maxOpenLots}
              onChange={(maxOpenLots) => patchAccount(a.id, { risk: { ...a.risk, maxOpenLots } })}
            />
            <Field
              label="Max trades / day"
              value={a.risk.maxTradesPerDay}
              onChange={(maxTradesPerDay) => patchAccount(a.id, { risk: { ...a.risk, maxTradesPerDay } })}
            />
            <Field
              label="Max consecutive L"
              value={a.risk.maxConsecutiveLosses}
              onChange={(maxConsecutiveLosses) => patchAccount(a.id, { risk: { ...a.risk, maxConsecutiveLosses } })}
            />
            <Field
              label="Max spread (pips)"
              value={a.risk.maxSpreadPips}
              onChange={(maxSpreadPips) => patchAccount(a.id, { risk: { ...a.risk, maxSpreadPips } })}
            />
            <Field
              label="Friday cutoff (UTC)"
              value={a.risk.fridayCutoffHour ?? 21}
              onChange={(fridayCutoffHour) => patchAccount(a.id, { risk: { ...a.risk, fridayCutoffHour } })}
            />
            <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
              <Switch
                checked={a.risk.flattenOnTrip}
                onCheckedChange={(flattenOnTrip) => patchAccount(a.id, { risk: { ...a.risk, flattenOnTrip } })}
              />
              Flatten this account if daily loss trips
            </label>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="space-y-1 text-xs text-muted">
      {label}
      <Input type="number" className="h-9" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
