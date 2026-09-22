import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { downloadText } from "@/lib/trading/export";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useDesk((s) => s.settings);
  const patchSettings = useDesk((s) => s.patchSettings);
  const resetDesk = useDesk((s) => s.resetDesk);
  const telegram = useDesk((s) => s.telegram);
  const bridge = useDesk((s) => s.bridge);
  const accounts = useDesk((s) => s.accounts);
  const history = useDesk((s) => s.history);
  const sources = useDesk((s) => s.sources);

  function exportSnapshot() {
    const snap = {
      exportedAt: new Date().toISOString(),
      settings,
      telegram: { connected: telegram.connected, user: telegram.user },
      bridge,
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform,
        broker: a.broker,
        role: a.role,
        connected: a.connected,
        risk: a.risk,
        copy: a.copy,
      })),
      sources,
      historyCount: history.length,
    };
    downloadText(`volt-desk-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(snap, null, 2), "application/json");
    toast("Desk snapshot exported");
  }

  return (
    <div className="page-enter mx-auto flex max-w-[720px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Desk</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Hot path stays in-memory. Grok is opt-in and capped so a noisy channel cannot burn quota.
          </p>
        </div>
        <Badge variant={settings.paper ? "accent" : "sell"}>{settings.paper ? "paper mode" : "live mode"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interpretation</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Row
            title="Auto-parse structured signals"
            hint="Regex engine, typically under 1ms. Routes when confidence is high and the channel is on auto-trade."
            checked={settings.autoInterpret}
            onChange={(autoInterpret) => patchSettings({ autoInterpret })}
          />
          <Row
            title="Grok fallback on messy text"
            hint="Only when you press Interpret with Grok. Session cap applies."
            checked={settings.grokFallback}
            onChange={(grokFallback) => patchSettings({ grokFallback })}
          />
          <p className="text-xs text-muted">
            Grok used {settings.grokCallsUsed} / {settings.grokCallCap} this session
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade management</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Row
            title="Move SL to break-even after TP1"
            hint="Remaining size is protected once the first target pays."
            checked={settings.beAfterTp1}
            onChange={(beAfterTp1) => patchSettings({ beAfterTp1 })}
          />
          <label className="block space-y-1 text-xs text-muted">
            Default trailing (pips, empty = off)
            <Input
              className="h-9 max-w-40"
              value={settings.defaultTrailingPips ?? ""}
              onChange={(e) =>
                patchSettings({
                  defaultTrailingPips: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session & export</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted">
          Telegram {telegram.connected ? `connected as @${telegram.user}` : "offline"}. Bridge{" "}
          {bridge?.enabled ? "armed" : "idle"}. This preview runs a live paper tape; production attaches GramJS
          (user session) and a local MT4/MT5 expert for real fills.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportSnapshot}>
            Export desk JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm("Reset all paper state? This cannot be undone.")) {
                resetDesk();
                toast("Paper desk reset");
              }
            }}
          >
            Reset paper desk
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-fg">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
