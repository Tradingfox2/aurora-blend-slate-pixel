import { createServerFn } from "@tanstack/react-start";
import { parsedFromUnknown } from "./parser";
import type { ParsedSignal } from "./types";

const SYSTEM = `You extract trading signals from Telegram messages for a MetaTrader copier.
Return ONLY compact JSON, no markdown, with this shape:
{"symbol":"XAUUSD","side":"buy"|"sell","orderType":"market"|"buy_limit"|"sell_limit"|"buy_stop"|"sell_stop","entry":number|null,"entryMax":number|null,"sl":number|null,"tps":number[],"action":"open"|"close"|"partial"|"modify"|"be"|"delete","closePct":number|null,"newSl":number|null,"newTp":number|null,"signalRef":number|null,"confidence":0-1,"comment":string}
Symbol must be one of: XAUUSD,EURUSD,GBPUSD,USDJPY,GBPJPY,NAS100,US30,USOIL,BTCUSD,ETHUSD.
GOLD/XAU → XAUUSD. NASDAQ/USTEC → NAS100. US30/DOW → US30. WTI/OIL → USOIL.
If the message is not a trade instruction, still return JSON with confidence 0 and action open.
Keep numbers as numbers, not strings.`;

export const interpretWithGrok = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; parsed: ParsedSignal; confidence: number; note: string } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Grok is not available in this environment" };
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 280,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: data.text.slice(0, 1200) },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `xAI ${res.status}` };
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content ?? "";
    const jsonText = content.replace(/```json|```/g, "").trim();
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    if (start < 0 || end < 0) return { ok: false, error: "Could not parse model output" };
    try {
      const raw = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>;
      const parsed = parsedFromUnknown(raw);
      if (!parsed) return { ok: false, error: "Incomplete extraction" };
      const confidence = typeof raw.confidence === "number" ? raw.confidence : 0.8;
      return {
        ok: true,
        parsed,
        confidence,
        note: typeof raw.comment === "string" ? raw.comment : "Grok",
      };
    } catch {
      return { ok: false, error: "Invalid JSON from model" };
    }
  });
