import { s as parsedFromUnknown } from "./parser-Cq9aCLaR.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interpret-Bqm4JJS7.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SYSTEM = `You extract trading signals from Telegram messages for a MetaTrader copier.
Return ONLY compact JSON, no markdown, with this shape:
{"symbol":"XAUUSD","side":"buy"|"sell","orderType":"market"|"buy_limit"|"sell_limit"|"buy_stop"|"sell_stop","entry":number|null,"entryMax":number|null,"sl":number|null,"tps":number[],"action":"open"|"close"|"partial"|"modify"|"be"|"delete","closePct":number|null,"newSl":number|null,"newTp":number|null,"signalRef":number|null,"confidence":0-1,"comment":string}
Symbol must be one of: XAUUSD,EURUSD,GBPUSD,USDJPY,GBPJPY,NAS100,US30,USOIL,BTCUSD,ETHUSD.
GOLD/XAU → XAUUSD. NASDAQ/USTEC → NAS100. US30/DOW → US30. WTI/OIL → USOIL.
If the message is not a trade instruction, still return JSON with confidence 0 and action open.
Keep numbers as numbers, not strings.`;
var interpretWithGrok_createServerFn_handler = createServerRpc({
	id: "f2dcf90b37139fdcb4d48ab491e91e34d141b166eb8a85e195b5a9a1b67cb752",
	name: "interpretWithGrok",
	filename: "src/lib/trading/interpret.ts"
}, (opts) => interpretWithGrok.__executeServer(opts));
var interpretWithGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(interpretWithGrok_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Grok is not available in this environment"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: 0,
			max_tokens: 280,
			messages: [{
				role: "system",
				content: SYSTEM
			}, {
				role: "user",
				content: data.text.slice(0, 1200)
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI ${res.status}`
	};
	const jsonText = ((await res.json()).choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
	const start = jsonText.indexOf("{");
	const end = jsonText.lastIndexOf("}");
	if (start < 0 || end < 0) return {
		ok: false,
		error: "Could not parse model output"
	};
	try {
		const raw = JSON.parse(jsonText.slice(start, end + 1));
		const parsed = parsedFromUnknown(raw);
		if (!parsed) return {
			ok: false,
			error: "Incomplete extraction"
		};
		return {
			ok: true,
			parsed,
			confidence: typeof raw.confidence === "number" ? raw.confidence : .8,
			note: typeof raw.comment === "string" ? raw.comment : "Grok"
		};
	} catch {
		return {
			ok: false,
			error: "Invalid JSON from model"
		};
	}
});
//#endregion
export { interpretWithGrok_createServerFn_handler };
