import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignalNo, SignalStatusChip } from "@/components/trading/bits";
import { formatTime } from "@/lib/trading/format";
import { interpretWithGrok } from "@/lib/trading/interpret";
import { chatTitle } from "@/lib/trading/telegram";
import { useDesk } from "@/lib/trading/store";

export const Route = createFileRoute("/_desk/telegram")({
  component: TelegramPage,
});

function TelegramPage() {
  const telegram = useDesk((s) => s.telegram);
  const sources = useDesk((s) => s.sources);
  const messages = useDesk((s) => s.messages);
  const signals = useDesk((s) => s.signals);
  const now = useDesk((s) => s.now);
  const patchSource = useDesk((s) => s.patchSource);
  const connectTelegram = useDesk((s) => s.connectTelegram);
  const disconnectTelegram = useDesk((s) => s.disconnectTelegram);
  const ingestMessage = useDesk((s) => s.ingestMessage);
  const interpretSignal = useDesk((s) => s.interpretSignal);
  const executeSignal = useDesk((s) => s.executeSignal);
  const settings = useDesk((s) => s.settings);

  const [connectOpen, setConnectOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+44 7700 900019");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("XAUUSD BUY NOW\nEntry 3684.50\nSL 3676.20\nTP1 3692.00\nTP2 3701.40");
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "gold-sniper");
  const [grokBusy, setGrokBusy] = useState<string | null>(null);

  async function runGrok(signalId: string, text: string) {
    if (settings.grokCallsUsed >= settings.grokCallCap) {
      toast("Grok call cap reached for this session");
      return;
    }
    setGrokBusy(signalId);
    try {
      const res = await interpretWithGrok({ data: { text } });
      if (!res.ok) {
        toast(res.error);
        return;
      }
      interpretSignal(signalId, res.parsed, res.confidence, "grok");
      toast(`Grok parsed ${res.parsed.symbol} ${res.parsed.side}`);
    } finally {
      setGrokBusy(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Intake</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">Telegram</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            User session, not a bot. Every channel and group already on the account is readable — no admin rights required.
          </p>
        </div>
        {telegram.connected ? (
          <Button variant="outline" size="sm" onClick={disconnectTelegram}>
            Disconnect
          </Button>
        ) : (
          <Button size="sm" onClick={() => setConnectOpen(true)}>
            Connect session
          </Button>
        )}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-fg">
            {telegram.connected ? `Signed in as @${telegram.user}` : "No Telegram session"}
          </p>
          <p className="text-xs text-muted">
            {telegram.connected
              ? `${sources.filter((s) => s.listening).length} chats listening · ${sources.filter((s) => s.autoTrade).length} auto-trade`
              : "Authorize once. VOLT reads messages; it never posts as the account."}
          </p>
        </div>
        <Badge variant={telegram.connected ? "live" : "outline"}>
          {telegram.connected ? "session live" : "offline"}
        </Badge>
      </Card>

      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chats</CardTitle>
            <span className="text-xs text-muted">{sources.length}</span>
          </CardHeader>
          <ul className="space-y-2">
            {sources.map((src) => (
              <li key={src.id} className="rounded-md bg-bg-subtle p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{src.name}</p>
                    <p className="text-xs text-muted">
                      @{src.username} · {chatTitle(src.kind)} · {src.members.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <Switch checked={src.listening} onCheckedChange={(v) => patchSource(src.id, { listening: v })} />
                    Listen
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <Switch
                      checked={src.autoTrade}
                      onCheckedChange={(v) => patchSource(src.id, { autoTrade: v })}
                      disabled={!src.listening}
                    />
                    Auto-trade
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Inject message</CardTitle>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <select
                className="h-10 rounded-sm bg-bg-subtle px-3 text-sm shadow-[var(--shadow-border)]"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => {
                  const sig = ingestMessage(sourceId, draft, "you", true);
                  if (sig) toast(`Assigned ${sig.number}`);
                }}
              >
                Ingest
              </Button>
            </div>
            <Textarea className="mt-3 font-mono text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live feed</CardTitle>
            </CardHeader>
            <ul className="space-y-3">
              {messages.map((m) => {
                const src = sources.find((s) => s.id === m.sourceId);
                const sig = signals.find((s) => s.id === m.signalId);
                return (
                  <li key={m.id} className="rounded-md bg-bg-subtle p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-medium text-fg">{src?.name}</span>
                      <span>{m.from}</span>
                      <span className="ml-auto font-mono tabular">{formatTime(m.at, now)}</span>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-fg">{m.text}</pre>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {sig ? (
                        <>
                          <SignalNo n={sig.number} />
                          <SignalStatusChip status={sig.status} />
                          <span className="font-mono text-[11px] text-muted">{Math.round(sig.confidence * 100)}%</span>
                          {sig.parsed && (sig.status === "interpreted" || sig.status === "received") ? (
                            <Button size="sm" onClick={() => executeSignal(sig.id)}>
                              Route
                            </Button>
                          ) : null}
                          {sig.confidence < 0.8 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={grokBusy === sig.id}
                              onClick={() => runGrok(sig.id, m.text)}
                            >
                              {grokBusy === sig.id ? "Grok…" : "Interpret with Grok"}
                            </Button>
                          ) : null}
                        </>
                      ) : (
                        <Badge variant="outline">chat</Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Telegram user session</DialogTitle>
            <DialogDescription>
              Same login you use in the app. VOLT enumerates every dialog — channels, groups, DMs — without asking admins to add a bot.
            </DialogDescription>
          </DialogHeader>
          {step === "phone" ? (
            <div className="space-y-3">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  window.setTimeout(() => {
                    setBusy(false);
                    setStep("code");
                  }, 700);
                }}
              >
                Send code
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="code">Login code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="12345" />
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  window.setTimeout(() => {
                    connectTelegram("volt.desk", phone);
                    setBusy(false);
                    setConnectOpen(false);
                    setStep("phone");
                    toast("Telegram session attached");
                  }, 800);
                }}
              >
                Authorize
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
