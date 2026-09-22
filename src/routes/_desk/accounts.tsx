import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatUsd } from "@/lib/trading/format";
import { PnlText } from "@/components/trading/bits";
import { useDesk } from "@/lib/trading/store";
import type { Account, AccountRole, CopySettings, Platform } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_desk/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const accounts = useDesk((s) => s.accounts);
  const patchAccount = useDesk((s) => s.patchAccount);
  const setAccountFrozen = useDesk((s) => s.setAccountFrozen);
  const setAccountConnected = useDesk((s) => s.setAccountConnected);
  const beginAccountConnect = useDesk((s) => s.beginAccountConnect);
  const addAccount = useDesk((s) => s.addAccount);
  const removeAccount = useDesk((s) => s.removeAccount);
  const [open, setOpen] = useState(false);

  function toggleConnect(a: Account) {
    if (a.connecting) return;
    if (a.connected) {
      setAccountConnected(a.id, false);
      toast(`${a.name} disconnected`, { description: "Trading frozen until reconnect" });
      return;
    }
    beginAccountConnect(a.id);
    toast(`${a.name} handshaking`, { description: `${a.platform} · ${a.server}` });
  }

  return (
    <div className="page-enter mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Routing</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Accounts</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Masters receive signals. Followers copy fills with lot multiplier, reverse, and equity scaling.
            Connect runs the EA handshake (token on Bridge page).
          </p>
        </div>
        <AddAccountDialog open={open} onOpenChange={setOpen} onAdd={addAccount} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {accounts.map((a) => {
          const float = a.equity - a.balance;
          return (
            <Card key={a.id}>
              <CardHeader>
                <div>
                  <CardTitle>{a.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted">
                    {a.broker} · {a.platform} · {a.server} · {a.login}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.connected ? "live" : "outline"} className="gap-1.5">
                    <span
                      className={cn(
                        "inline-block size-1.5 rounded-full",
                        a.connected ? "bg-buy pulse-live" : "bg-subtle",
                      )}
                    />
                    {a.connecting ? "handshake" : a.connected ? `${a.pingMs}ms` : "offline"}
                  </Badge>
                  <Badge variant="accent">{a.role}</Badge>
                </div>
              </CardHeader>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Metric k="Balance" v={formatUsd(a.balance)} />
                <Metric k="Equity" v={formatUsd(a.equity)} />
                <Metric k="Float" v={<PnlText value={float} />} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={a.connected ? "outline" : "default"}
                  disabled={a.connecting}
                  onClick={() => toggleConnect(a)}
                >
                  {a.connecting ? "Handshaking…" : a.connected ? "Disconnect" : "Connect"}
                </Button>
                {a.role !== "master" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted hover:text-sell"
                    onClick={() => {
                      removeAccount(a.id);
                      toast(`Removed ${a.name}`);
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-muted">
                  <Switch
                    checked={!a.frozen && a.connected}
                    disabled={!a.connected}
                    onCheckedChange={(v) => setAccountFrozen(a.id, !v)}
                  />
                  Trading
                </label>
                {a.role !== "follower" ? (
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <Switch
                      checked={a.receivesSignals}
                      onCheckedChange={(v) => patchAccount(a.id, { receivesSignals: v })}
                    />
                    Take signals
                  </label>
                ) : null}
              </div>

              {a.copy ? (
                <CopyEditor
                  account={a}
                  masters={accounts.filter((m) => m.role === "master" || m.id !== a.id)}
                  onChange={(copy) => patchAccount(a.id, { copy })}
                />
              ) : null}
              <RiskEditor account={a} onChange={(risk) => patchAccount(a.id, { risk })} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-subtle">{k}</p>
      <div className="mt-0.5 font-mono text-sm tabular">{v}</div>
    </div>
  );
}

function CopyEditor({
  account,
  masters,
  onChange,
}: {
  account: Account;
  masters: Account[];
  onChange: (c: CopySettings) => void;
}) {
  const c = account.copy!;
  return (
    <div className="mt-4 rounded-md bg-bg-subtle p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-subtle">Copy settings</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-muted">
          Master
          <select
            className="h-9 w-full rounded-sm bg-bg px-2 text-fg shadow-[var(--shadow-border)]"
            value={c.masterId}
            onChange={(e) => onChange({ ...c, masterId: e.target.value })}
          >
            {masters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted">
          Multiplier
          <Input
            className="h-9"
            type="number"
            step="0.1"
            value={c.multiplier}
            onChange={(e) => onChange({ ...c, multiplier: Number(e.target.value) })}
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Max lot
          <Input
            className="h-9"
            type="number"
            step="0.01"
            value={c.maxLot}
            onChange={(e) => onChange({ ...c, maxLot: Number(e.target.value) })}
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Delay ms
          <Input
            className="h-9"
            type="number"
            step="50"
            value={c.delayMs}
            onChange={(e) => onChange({ ...c, delayMs: Number(e.target.value) })}
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          Symbol suffix
          <Input
            className="h-9"
            value={c.symbolSuffix}
            onChange={(e) => onChange({ ...c, symbolSuffix: e.target.value })}
          />
        </label>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-xs text-muted">
            <Switch checked={c.reverse} onCheckedChange={(reverse) => onChange({ ...c, reverse })} />
            Reverse
          </label>
          <label className="flex items-center gap-2 text-xs text-muted">
            <Switch
              checked={c.equityScale}
              onCheckedChange={(equityScale) => onChange({ ...c, equityScale })}
            />
            Equity scale
          </label>
        </div>
      </div>
    </div>
  );
}

function RiskEditor({ account, onChange }: { account: Account; onChange: (risk: Account["risk"]) => void }) {
  const r = account.risk;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <label className="space-y-1 text-xs text-muted">
        Mode
        <select
          className="h-9 w-full rounded-sm bg-bg-subtle px-2 text-fg shadow-[var(--shadow-border)]"
          value={r.mode}
          onChange={(e) => onChange({ ...r, mode: e.target.value as Account["risk"]["mode"] })}
        >
          <option value="percent">Percent</option>
          <option value="fixed_lots">Fixed lots</option>
          <option value="fixed_pips">Fixed pips</option>
          <option value="rr">RR</option>
        </select>
      </label>
      <Num label="Risk %" value={r.percent} onChange={(percent) => onChange({ ...r, percent })} />
      <Num label="Fixed lots" value={r.fixedLots} onChange={(fixedLots) => onChange({ ...r, fixedLots })} />
      <Num label="Daily loss %" value={r.maxDailyLossPct} onChange={(maxDailyLossPct) => onChange({ ...r, maxDailyLossPct })} />
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="space-y-1 text-xs text-muted">
      {label}
      <Input
        className="h-9"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function AddAccountDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (a: Account) => void;
}) {
  const accounts = useDesk((s) => s.accounts);
  const [name, setName] = useState("New terminal");
  const [platform, setPlatform] = useState<Platform>("MT5");
  const [role, setRole] = useState<AccountRole>("independent");
  const [broker, setBroker] = useState("Broker");
  const [login, setLogin] = useState("100000");
  const [balance, setBalance] = useState("10000");
  const master = accounts.find((a) => a.role === "master");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Add account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach terminal</DialogTitle>
          <DialogDescription>
            Paper credentials only. Live bridges attach to the local MT4/MT5 expert (`ea/VoltBridge.mq5`).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Broker">
            <Input value={broker} onChange={(e) => setBroker(e.target.value)} />
          </Field>
          <Field label="Platform">
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MT4">MT4</SelectItem>
                <SelectItem value="MT5">MT5</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as AccountRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="follower">Follower</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Login">
            <Input value={login} onChange={(e) => setLogin(e.target.value)} />
          </Field>
          <Field label="Balance">
            <Input value={balance} onChange={(e) => setBalance(e.target.value)} />
          </Field>
        </div>
        <Button
          className="mt-2 w-full"
          onClick={() => {
            const id = `acc_${Date.now().toString(36)}`;
            const bal = Number(balance) || 10000;
            const base: Account = {
              id,
              name,
              platform,
              broker,
              server: `${broker.replace(/\s/g, "")}-Live`,
              login,
              role,
              currency: "USD",
              leverage: 200,
              balance: bal,
              equity: bal,
              margin: 0,
              connected: false,
              connecting: false,
              pingMs: 0,
              frozen: true,
              receivesSignals: role !== "follower",
              risk: accounts[0]!.risk,
              copy:
                role === "follower" && master
                  ? {
                      masterId: master.id,
                      multiplier: 0.5,
                      reverse: false,
                      equityScale: false,
                      maxLot: 2,
                      delayMs: 0,
                      symbolSuffix: "",
                    }
                  : undefined,
            };
            onAdd(base);
            onOpenChange(false);
            toast(`${name} attached — Connect to handshake`);
          }}
        >
          Attach
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
