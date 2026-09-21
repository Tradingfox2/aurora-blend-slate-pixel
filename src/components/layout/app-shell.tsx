import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  CircuitBoard,
  History,
  LayoutGrid,
  Menu,
  Radio,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { VoltMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Ticker } from "@/components/layout/ticker";
import { formatClock, formatSignedUsd, sessionName } from "@/lib/trading/format";
import { startDesk, stopDesk, useDesk } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Desk", icon: LayoutGrid },
  { to: "/telegram", label: "Telegram", icon: Radio },
  { to: "/signals", label: "Signals", icon: Activity },
  { to: "/book", label: "Positions", icon: BookOpen },
  { to: "/accounts", label: "Accounts", icon: Users },
  { to: "/providers", label: "Providers", icon: Shield },
  { to: "/history", label: "History", icon: History },
  { to: "/risk", label: "Circuits", icon: CircuitBoard },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-150",
              active ? "bg-bg-subtle text-fg" : "text-muted hover:bg-bg-subtle/60 hover:text-fg",
              compact && "justify-center px-0",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!compact ? item.label : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const now = useDesk((s) => s.now);
  const accounts = useDesk((s) => s.accounts);
  const circuits = useDesk((s) => s.circuits);
  const telegram = useDesk((s) => s.telegram);
  const lastEvents = useDesk((s) => s.lastEvents);
  const setHalt = useDesk((s) => s.setHalt);
  const consumeEvents = useDesk((s) => s.consumeEvents);
  const equity = accounts.reduce((sum, a) => sum + a.equity, 0);
  const floating = accounts.reduce((sum, a) => sum + (a.equity - a.balance), 0);

  useEffect(() => {
    startDesk();
    return () => stopDesk();
  }, []);

  useEffect(() => {
    if (!lastEvents.length) return;
    for (const ev of lastEvents) {
      if (ev.kind === "fill") toast(ev.text, { description: ev.latencyMs != null ? `${ev.latencyMs.toFixed(1)}ms` : undefined });
      else if (ev.kind === "reject" || ev.kind === "circuit") toast(ev.text);
    }
    consumeEvents();
  }, [lastEvents, consumeEvents]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg">
      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border bg-bg/95 px-3 backdrop-blur-sm md:px-4">
        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
        <VoltMark />
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-subtle sm:inline">
          {sessionName(now)}
        </span>
        <div className="ml-auto flex items-center gap-3 md:gap-5">
          <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
            <span className={cn("size-1.5 rounded-full", telegram.connected ? "bg-buy" : "bg-subtle")} />
            TG {telegram.connected ? "session" : "offline"}
          </span>
          <span className="hidden font-mono text-xs tabular text-muted lg:inline">{formatClock(now)}</span>
          <div className="hidden flex-col items-end sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-wide text-subtle">Equity</span>
            <span className="font-mono text-xs tabular text-fg">{formatSignedUsd(equity).replace("+", "")}</span>
          </div>
          <div className="hidden flex-col items-end md:flex">
            <span className="font-mono text-[10px] uppercase tracking-wide text-subtle">Float</span>
            <span className={cn("font-mono text-xs tabular", floating >= 0 ? "text-buy" : "text-sell")}>
              {formatSignedUsd(floating)}
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            <span className="hidden sm:inline">Halt</span>
            <Switch checked={circuits.globalHalt} onCheckedChange={setHalt} aria-label="Global halt" />
          </label>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-12 hidden h-[calc(100dvh-3rem-28px)] w-52 shrink-0 flex-col border-r border-border p-3 md:flex">
          <NavLinks />
          <div className="mt-auto rounded-md bg-bg-subtle p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">Engine</p>
            <p className="mt-1 font-mono text-xs tabular text-muted">in-memory · 220ms</p>
            <p className="mt-1 text-[11px] leading-snug text-subtle">
              Local parser first. Grok only on demand.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      <Ticker />

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-border bg-bg md:hidden">
        {NAV.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted"
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-4" />
          More
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="pt-10">
          <VoltMark className="mb-6" />
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
