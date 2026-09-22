import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatClock, formatTime } from "@/lib/trading/format";
import { useDesk } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_desk/bridge")({
  component: BridgePage,
});

function BridgePage() {
  const bridge = useDesk((s) => s.bridge);
  const accounts = useDesk((s) => s.accounts);
  const now = useDesk((s) => s.now);
  const patchBridge = useDesk((s) => s.patchBridge);
  const pulseBridge = useDesk((s) => s.pulseBridge);
  const setAccountConnected = useDesk((s) => s.setAccountConnected);
  const beginAccountConnect = useDesk((s) => s.beginAccountConnect);
  const [tokenDraft, setTokenDraft] = useState(bridge?.token ?? "");

  const online = accounts.filter((a) => a.connected).length;

  return (
    <div className="page-enter mx-auto flex max-w-[1100px] flex-col gap-4 p-4 md:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Execution path</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">EA Bridge</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Local MT4/MT5 experts heartbeat here with a shared token. Paper mode still routes fills in-memory;
          when the bridge is armed, each terminal shows live ping and build.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bridge</CardTitle>
            <Switch
              checked={Boolean(bridge?.enabled)}
              onCheckedChange={(enabled) => {
                patchBridge({ enabled });
                toast(enabled ? "Bridge armed" : "Bridge idle");
              }}
            />
          </CardHeader>
          <p className="text-sm text-muted">
            {bridge?.enabled ? "Accepting EA heartbeats" : "Paused — terminals keep last state"}
          </p>
          <p className="mt-3 font-mono text-xs text-subtle">
            Heartbeats {bridge?.heartbeats ?? 0} · EA {bridge?.eaVersion ?? "1.4.2"}
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last poll</CardTitle>
            <Badge variant={bridge?.lastPollAt ? "live" : "outline"}>
              {bridge?.lastPollAt ? formatTime(bridge.lastPollAt, now) : "never"}
            </Badge>
          </CardHeader>
          <p className="font-mono text-sm tabular text-muted">{formatClock(now)}</p>
          <Button className="mt-4" size="sm" variant="outline" onClick={() => pulseBridge()}>
            Simulate EA pulse
          </Button>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Terminals</CardTitle>
            <Badge variant="accent">
              {online}/{accounts.length}
            </Badge>
          </CardHeader>
          <p className="text-sm text-muted">Online experts reporting through this desk.</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shared token</CardTitle>
        </CardHeader>
        <p className="mb-3 text-xs text-muted">
          Paste the same string into the VOLT EA inputs. Rotate anytime; offline terminals re-auth on next
          connect.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-md font-mono text-xs"
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              patchBridge({ token: tokenDraft || bridge?.token || "volt_live_demo" });
              toast("Token saved");
            }}
          >
            Save token
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const t = `volt_${Math.random().toString(36).slice(2, 10)}`;
              setTokenDraft(t);
              patchBridge({ token: t });
              toast("Token rotated");
            }}
          >
            Rotate
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div>
                <CardTitle>{a.name}</CardTitle>
                <p className="mt-0.5 text-xs text-muted">
                  {a.platform} · {a.broker} · {a.server}
                </p>
              </div>
              <Badge variant={a.connected ? "live" : "outline"} className="gap-1.5">
                <span
                  className={cn(
                    "inline-block size-1.5 rounded-full",
                    a.connected ? "bg-buy pulse-live" : "bg-subtle",
                  )}
                />
                {a.connecting ? "handshake" : a.connected ? `${a.pingMs}ms` : "offline"}
              </Badge>
            </CardHeader>
            <dl className="grid grid-cols-2 gap-2 text-xs text-muted">
              <div>
                <dt className="text-subtle">Login</dt>
                <dd className="font-mono text-fg">{a.login}</dd>
              </div>
              <div>
                <dt className="text-subtle">EA build</dt>
                <dd className="font-mono text-fg">{a.eaVersion ?? bridge?.eaVersion ?? "1.4.2"}</dd>
              </div>
              <div>
                <dt className="text-subtle">Heartbeat</dt>
                <dd className="font-mono text-fg">
                  {a.lastHeartbeat ? formatTime(a.lastHeartbeat, now) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Role</dt>
                <dd className="text-fg">{a.role}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.connected ? (
                <Button size="sm" variant="outline" onClick={() => setAccountConnected(a.id, false)}>
                  Disconnect EA
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={a.connecting}
                  onClick={() => beginAccountConnect(a.id)}
                >
                  {a.connecting ? "Connecting…" : "Connect EA"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
