import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityChart } from "@/components/trading/equity-chart";
import { ManualOrderButton } from "@/components/trading/manual-order";
import { PositionsTable } from "@/components/trading/positions-table";
import { PnlText, SignalNo, SignalStatusChip, SideChip } from "@/components/trading/bits";
import { formatPct, formatTime, formatUsd, latencyLabel, signalTag } from "@/lib/trading/format";
import { totals } from "@/lib/trading/stats";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/")({
  component: DeskPage,
});

function DeskPage() {
  const accounts = useDesk((s) => s.accounts);
  const positions = useDesk((s) => s.positions);
  const signals = useDesk((s) => s.signals);
  const history = useDesk((s) => s.history);
  const circuits = useDesk((s) => s.circuits);
  const equitySeries = useDesk((s) => s.equity);
  const log = useDesk((s) => s.log);
  const now = useDesk((s) => s.now);
  const executeSignal = useDesk((s) => s.executeSignal);
  const telegram = useDesk((s) => s.telegram);
  const bridge = useDesk((s) => s.bridge);

  const equity = accounts.reduce((s, a) => s + a.equity, 0);
  const balance = accounts.reduce((s, a) => s + a.balance, 0);
  const floating = equity - balance;
  const hist = totals(history);
  const lastFill = log.find((e) => e.kind === "fill");
  const liveSignals = signals.filter((s) => s.status !== "ignored").slice(0, 6);
  const online = accounts.filter((a) => a.connected).length;

  return (
    <div className="page-enter mx-auto flex w-full max-w-[1400px] flex-col gap-4 overflow-x-hidden p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Command</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-fg">Desk</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Numbered signals in, sized by risk, routed to master and followers. Paper engine is live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManualOrderButton />
          <Button asChild variant="outline" size="sm">
            <Link to="/telegram">Open Telegram</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <Badge variant={telegram.connected ? "live" : "outline"}>
          TG {telegram.connected ? "session" : "offline"}
        </Badge>
        <Badge variant={online > 0 ? "live" : "outline"}>
          {online}/{accounts.length} EA
        </Badge>
        <Badge variant={bridge?.enabled ? "accent" : "outline"}>
          Bridge {bridge?.enabled ? "armed" : "idle"}
        </Badge>
        <Badge variant={circuits.globalHalt ? "sell" : "outline"}>
          {circuits.globalHalt ? "halted" : "trading armed"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Combined equity" value={formatUsd(equity)} hint={`${online} terminals online`} />
        <Kpi label="Floating" value={<PnlText value={floating} className="text-lg" />} hint={`${positions.length} open`} />
        <Kpi
          label="Realized today"
          value={<PnlText value={circuits.realizedToday} className="text-lg" />}
          hint={`${circuits.tradesToday} tickets`}
        />
        <Kpi label="Win rate" value={formatPct(hist.winRate)} hint={`${hist.trades} closed`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Equity</CardTitle>
            <span className="font-mono text-xs text-muted tabular">{formatUsd(equity)}</span>
          </CardHeader>
          <EquityChart data={equitySeries} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Circuits</CardTitle>
            <Badge variant={circuits.globalHalt ? "sell" : "live"}>{circuits.globalHalt ? "halted" : "armed"}</Badge>
          </CardHeader>
          <ul className="space-y-2 text-sm">
            <Row k="Daily P/L" v={<PnlText value={circuits.realizedToday} />} />
            <Row k="Consecutive losses" v={`${circuits.consecutiveLosses}`} />
            <Row k="Trades today" v={`${circuits.tradesToday}`} />
            <Row k="Last fill" v={lastFill ? latencyLabel(lastFill.latencyMs ?? 0) : "—"} />
            {circuits.reason ? (
              <li className="rounded-sm bg-sell/10 px-2 py-1.5 text-xs text-sell">{circuits.reason}</li>
            ) : null}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Open positions</CardTitle>
            <Link to="/book" className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
              Book <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <PositionsTable rows={positions} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Signal tape</CardTitle>
            <Link to="/signals" className="text-xs text-muted hover:text-fg">
              All
            </Link>
          </CardHeader>
          <ul className="space-y-2">
            {liveSignals.map((s) => (
              <li key={s.id} className="rounded-md bg-bg-subtle p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <SignalNo n={s.number} />
                  <SignalStatusChip status={s.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {s.parsed ? <SideChip side={s.parsed.side} /> : null}
                  <span>{s.parsed?.symbol ?? "—"}</span>
                  <span className="ml-auto font-mono tabular">{formatTime(s.receivedAt, now)}</span>
                </div>
                {s.status === "interpreted" || s.status === "received" ? (
                  <Button size="sm" className="mt-2 w-full" onClick={() => executeSignal(s.id)} disabled={!s.parsed}>
                    Route {signalTag(s.number)}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <ul className="max-h-40 space-y-1.5 overflow-y-auto font-mono text-[11px] text-muted">
          {log.slice(0, 12).map((e) => (
            <li key={e.id} className="flex gap-2">
              <span className="shrink-0 tabular">{formatTime(e.at, now)}</span>
              <span className="text-fg">{e.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
  return (
    <Card className="p-3 md:p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">{label}</p>
      <div className="mt-1 font-mono text-lg tabular text-fg">{value}</div>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted">{k}</span>
      <span className="font-mono text-xs tabular text-fg">{v}</span>
    </li>
  );
}
