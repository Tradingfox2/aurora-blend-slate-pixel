import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Account = {
  id: string;
  platform: string;
  broker: string;
  server: string;
  login: string;
  environment: string;
  status: string;
  trading_enabled: boolean;
  last_error?: string | null;
};

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const { user, isPending } = useCurrentUserState();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [broker, setBroker] = useState("");
  const [server, setServer] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "live">("demo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/accounts", { cache: "no-store" });
    if (!r.ok) return;
    const data = await r.json();
    setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
  }

  useEffect(() => {
    if (!isPending && user) void load();
  }, [isPending, user]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(id);
  }, []);

  async function connect(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/accounts/mt5/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ broker, server, login, password, environment }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unable to create connection");
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create connection");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(id: string) {
    await fetch("/api/accounts/disconnect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function setTrading(id: string, enabled: boolean) {
    await fetch("/api/accounts/enable-trading", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    await load();
  }

  if (isPending) return <div className="min-h-screen bg-[#090b10] p-8 text-zinc-400">Loading account session…</div>;
  if (!user) return <div className="min-h-screen bg-[#090b10] p-8 text-zinc-400">Sign in to manage broker accounts.</div>;

  return (
    <main className="min-h-screen bg-[#090b10] px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-400">VOLT / BROKER CONNECTIONS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">MT5 accounts</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Connect an MT5 account from VOLT. Credentials are encrypted before storage and are never returned to the browser.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-medium">Add MT5 account</h2>
            <p className="mt-1 text-xs text-zinc-500">New accounts start with live trading disabled.</p>
          </div>
          <form onSubmit={connect} className="grid gap-4 md:grid-cols-2">
            <Field label="Broker" value={broker} onChange={setBroker} placeholder="Broker name" />
            <Field label="MT5 server" value={server} onChange={setServer} placeholder="Broker-Live 01" />
            <Field label="Login" value={login} onChange={setLogin} placeholder="12345678" inputMode="numeric" />
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Environment</span>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value as "demo" | "live")} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 outline-none focus:border-cyan-400">
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-zinc-400">Trading password</span>
              <input required type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 outline-none focus:border-cyan-400" placeholder="••••••••" />
            </label>
            {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
            <button disabled={busy} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50 md:col-span-2">
              {busy ? "Submitting…" : "Connect MT5 account"}
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
              No broker accounts connected yet.
            </div>
          ) : accounts.map((account) => (
            <article key={account.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{account.broker} · {account.login}</h3>
                    <Status status={account.status} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{account.server} · {account.environment}</p>
                  {account.last_error && <p className="mt-2 text-xs text-red-400">{account.last_error}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {account.status === "connected" && (
                    <button onClick={() => setTrading(account.id, !account.trading_enabled)} className="rounded-lg border border-white/10 px-3 py-2 text-xs">
                      {account.trading_enabled ? "Disable live trading" : "Enable live trading"}
                    </button>
                  )}
                  <button onClick={() => disconnect(account.id)} className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300">
                    Disconnect
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder: string; inputMode?: "numeric" }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-zinc-400">{props.label}</span>
      <input required value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={props.placeholder} inputMode={props.inputMode} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 outline-none focus:border-cyan-400" />
    </label>
  );
}

function Status({ status }: { status: string }) {
  const text = status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : status === "error" ? "Error" : "Waiting";
  return <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">{text}</span>;
}
