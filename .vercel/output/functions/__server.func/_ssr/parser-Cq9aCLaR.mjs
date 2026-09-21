//#region node_modules/.nitro/vite/services/ssr/assets/parser-Cq9aCLaR.js
var SPECS = {
	XAUUSD: {
		id: "XAUUSD",
		label: "Gold",
		digits: 2,
		pipSize: .1,
		contractSize: 100,
		baseSpread: .18,
		vol: .42,
		session: "metal"
	},
	EURUSD: {
		id: "EURUSD",
		label: "EUR/USD",
		digits: 5,
		pipSize: 1e-4,
		contractSize: 1e5,
		baseSpread: 8e-5,
		vol: 12e-5,
		session: "fx"
	},
	GBPUSD: {
		id: "GBPUSD",
		label: "GBP/USD",
		digits: 5,
		pipSize: 1e-4,
		contractSize: 1e5,
		baseSpread: 11e-5,
		vol: 16e-5,
		session: "fx"
	},
	USDJPY: {
		id: "USDJPY",
		label: "USD/JPY",
		digits: 3,
		pipSize: .01,
		contractSize: 1e5,
		baseSpread: .012,
		vol: .028,
		session: "fx"
	},
	GBPJPY: {
		id: "GBPJPY",
		label: "GBP/JPY",
		digits: 3,
		pipSize: .01,
		contractSize: 1e5,
		baseSpread: .028,
		vol: .055,
		session: "fx"
	},
	NAS100: {
		id: "NAS100",
		label: "US Tech 100",
		digits: 1,
		pipSize: 1,
		contractSize: 1,
		baseSpread: 1.2,
		vol: 4.8,
		session: "index"
	},
	US30: {
		id: "US30",
		label: "Wall Street 30",
		digits: 1,
		pipSize: 1,
		contractSize: 1,
		baseSpread: 2.4,
		vol: 8.5,
		session: "index"
	},
	USOIL: {
		id: "USOIL",
		label: "WTI Crude",
		digits: 2,
		pipSize: .01,
		contractSize: 1e3,
		baseSpread: .03,
		vol: .09,
		session: "energy"
	},
	BTCUSD: {
		id: "BTCUSD",
		label: "Bitcoin",
		digits: 1,
		pipSize: 1,
		contractSize: 1,
		baseSpread: 12,
		vol: 38,
		session: "crypto"
	},
	ETHUSD: {
		id: "ETHUSD",
		label: "Ether",
		digits: 2,
		pipSize: .1,
		contractSize: 1,
		baseSpread: 1.4,
		vol: 6.2,
		session: "crypto"
	}
};
var OPENING = {
	XAUUSD: 3684.72,
	EURUSD: 1.08426,
	GBPUSD: 1.31248,
	USDJPY: 148.214,
	GBPJPY: 194.632,
	NAS100: 20148.6,
	US30: 43518.4,
	USOIL: 72.38,
	BTCUSD: 97240,
	ETHUSD: 3482.4
};
var ALIASES = {
	XAUUSD: "XAUUSD",
	GOLD: "XAUUSD",
	XAU: "XAUUSD",
	GOLDSPOT: "XAUUSD",
	XAUUSDM: "XAUUSD",
	EURUSD: "EURUSD",
	EUR: "EURUSD",
	"EUR/USD": "EURUSD",
	EU: "EURUSD",
	GBPUSD: "GBPUSD",
	GBP: "GBPUSD",
	"GBP/USD": "GBPUSD",
	GU: "GBPUSD",
	CABLE: "GBPUSD",
	USDJPY: "USDJPY",
	"USD/JPY": "USDJPY",
	UJ: "USDJPY",
	JPY: "USDJPY",
	GBPJPY: "GBPJPY",
	"GBP/JPY": "GBPJPY",
	GJ: "GBPJPY",
	NAS100: "NAS100",
	NASDAQ: "NAS100",
	USTEC: "NAS100",
	NAS: "NAS100",
	US100: "NAS100",
	NDX: "NAS100",
	US30: "US30",
	DJ30: "US30",
	DOW: "US30",
	DJI: "US30",
	WALLSTREET: "US30",
	USOIL: "USOIL",
	OIL: "USOIL",
	WTI: "USOIL",
	CRUDE: "USOIL",
	CL: "USOIL",
	BTCUSD: "BTCUSD",
	BTC: "BTCUSD",
	BITCOIN: "BTCUSD",
	ETHUSD: "ETHUSD",
	ETH: "ETHUSD",
	ETHER: "ETHUSD",
	ETHEREUM: "ETHUSD"
};
function resolveSymbol(raw) {
	return ALIASES[raw.toUpperCase().replace(/\s+/g, "")] ?? null;
}
function seedQuotes(now) {
	const quotes = {};
	for (const id of Object.keys(OPENING)) {
		const spec = SPECS[id];
		const mid = OPENING[id];
		const half = spec.baseSpread / 2;
		quotes[id] = {
			bid: mid - half,
			ask: mid + half,
			spread: spec.baseSpread,
			ts: now,
			change: 0
		};
	}
	return quotes;
}
function pipDistance(symbol, a, b) {
	return Math.abs(a - b) / SPECS[symbol].pipSize;
}
function pipValueUsd(symbol, lots) {
	const spec = SPECS[symbol];
	return spec.pipSize * spec.contractSize * lots;
}
function pnlUsd(symbol, side, open, close, lots) {
	const spec = SPECS[symbol];
	const dir = side === "buy" ? 1 : -1;
	return (close - open) * dir * spec.contractSize * lots;
}
function markPrice(side, quote) {
	return side === "buy" ? quote.bid : quote.ask;
}
function fillPrice(side, quote) {
	return side === "buy" ? quote.ask : quote.bid;
}
var SYMBOL_IDS = [
	"XAUUSD",
	"EURUSD",
	"GBPUSD",
	"USDJPY",
	"GBPJPY",
	"NAS100",
	"US30",
	"USOIL",
	"BTCUSD",
	"ETHUSD"
];
var NUM = String.raw`(\d+(?:\.\d+)?)`;
function num(s) {
	if (!s) return void 0;
	const n = Number(s);
	return Number.isFinite(n) ? n : void 0;
}
function detectSymbol(text) {
	const upper = text.toUpperCase();
	const ordered = Object.keys({
		GOLDSPOT: 1,
		XAUUSDM: 1,
		EURUSD: 1,
		GBPUSD: 1,
		USDJPY: 1,
		GBPJPY: 1,
		BTCUSD: 1,
		ETHUSD: 1,
		NASDAQ: 1,
		NAS100: 1,
		USTEC: 1,
		US100: 1,
		USOIL: 1,
		XAUUSD: 1,
		BITCOIN: 1,
		ETHEREUM: 1,
		CABLE: 1,
		CRUDE: 1,
		WALLSTREET: 1,
		"EUR/USD": 1,
		"GBP/USD": 1,
		"USD/JPY": 1,
		"GBP/JPY": 1,
		DJ30: 1,
		US30: 1,
		GOLD: 1,
		XAU: 1,
		BTC: 1,
		ETH: 1,
		WTI: 1,
		OIL: 1,
		DOW: 1,
		NAS: 1
	}).sort((a, b) => b.length - a.length);
	for (const alias of ordered) {
		const escaped = alias.replace("/", "\\/");
		if (new RegExp(`(^|[^A-Z0-9])${escaped}([^A-Z0-9]|$)`).test(upper)) return resolveSymbol(alias);
	}
	return null;
}
function detectSide(text) {
	const u = text.toUpperCase();
	if (/\b(SELL|SHORT|BEARISH)\b/.test(u)) return "sell";
	if (/\b(BUY|LONG|BULLISH)\b/.test(u)) return "buy";
	return null;
}
function detectAction(text) {
	const u = text.toUpperCase();
	if (/\b(CLOSE\s*ALL|FLAT|FLATTEN|KILL)\b/.test(u)) return "close";
	if (/\b(BE|BREAK\s*EVEN|SL\s*TO\s*BE|MOVE\s*SL\s*TO\s*(BE|ENTRY))\b/.test(u)) return "be";
	if (/\b(DELETE|CANCEL|REMOVE\s*PENDING)\b/.test(u)) return "delete";
	if (/\b(CLOSE\s*\d+\s*%|PARTIAL|TP1\s*HIT|SECURE|TAKE\s*PARTIAL)\b/.test(u)) return "partial";
	if (/\b(CLOSE|BOOK|EXIT|TAKE\s*PROFIT\s*NOW)\b/.test(u) && !/\bTP\d?\b/.test(u.split("\n")[0] ?? "")) {
		if (/\b(CLOSE|EXIT|BOOK PROFIT|CLOSE NOW)\b/.test(u)) return "close";
	}
	if (/\b(MOVE\s*SL|MODIFY|NEW\s*SL|TRAIL)\b/.test(u)) return "modify";
	return "open";
}
function collectNumbers(re, text) {
	const out = [];
	const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
	let m;
	while (m = r.exec(text)) {
		const n = num(m[1]);
		if (n !== void 0) out.push(n);
	}
	return out;
}
function detectOrderType(text, side) {
	const u = text.toUpperCase();
	if (/\bBUY\s*LIMIT\b/.test(u)) return "buy_limit";
	if (/\bSELL\s*LIMIT\b/.test(u)) return "sell_limit";
	if (/\bBUY\s*STOP\b/.test(u)) return "buy_stop";
	if (/\bSELL\s*STOP\b/.test(u)) return "sell_stop";
	if (/\bLIMIT\b/.test(u)) return side === "buy" ? "buy_limit" : "sell_limit";
	if (/\bSTOP\b/.test(u) && !/\bSTOP\s*LOSS\b/.test(u) && !/\bSL\b/.test(u)) return side === "buy" ? "buy_stop" : "sell_stop";
	return "market";
}
function parseSignal(raw) {
	const t0 = performance.now();
	const text = raw.replace(/\u00a0/g, " ").trim();
	if (!text) return {
		parsed: null,
		confidence: 0,
		note: "empty"
	};
	const action = detectAction(text);
	const symbol = detectSymbol(text);
	const side = detectSide(text);
	const signalRef = num(text.match(/#\s*(\d{1,5})/)?.[1]);
	const sls = collectNumbers(new RegExp(String.raw`(?:SL|S\/L|STOP\s*LOSS|STOPLOSS)\s*[:\-]?\s*${NUM}`, "i"), text);
	const tps = collectNumbers(new RegExp(String.raw`(?:TP\s*\d*|T\/P|TAKE\s*PROFIT)\s*[:\-]?\s*${NUM}`, "i"), text);
	const entries = collectNumbers(new RegExp(String.raw`(?:ENTRY|ENTER|NOW|ZONE|PRICE)\s*[:\-]?\s*${NUM}(?:\s*[-–/]\s*${NUM})?`, "i"), text);
	const entryZone = text.match(new RegExp(String.raw`(?:ENTRY|ZONE)\s*[:\-]?\s*${NUM}\s*[-–/]\s*${NUM}`, "i"));
	const closePctMatch = text.match(/(\d{1,3})\s*%/);
	const closePct = action === "partial" ? Math.min(100, num(closePctMatch?.[1]) ?? 50) : void 0;
	const newSl = collectNumbers(new RegExp(String.raw`(?:NEW\s*SL|MOVE\s*SL(?:\s*TO)?)\s*[:\-]?\s*${NUM}`, "i"), text)[0];
	if (action !== "open") {
		if (!symbol && signalRef === void 0) return {
			parsed: null,
			confidence: .2,
			note: "management without symbol or ticket"
		};
		return {
			parsed: {
				symbol: symbol ?? SYMBOL_IDS[0],
				side: side ?? "buy",
				orderType: "market",
				sl: sls[0],
				tps,
				action,
				closePct,
				newSl,
				signalRef
			},
			confidence: Math.min(.97, (symbol ? .35 : 0) + (signalRef ? .4 : .15) + .25),
			note: "management"
		};
	}
	if (!symbol || !side) return {
		parsed: null,
		confidence: symbol || side ? .35 : .1,
		note: !symbol ? "no symbol" : "no side"
	};
	const orderType = detectOrderType(text, side);
	const parsed = {
		symbol,
		side,
		orderType,
		entry: entryZone ? num(entryZone[1]) : entries[0],
		entryMax: entryZone ? num(entryZone[2]) : void 0,
		sl: sls[0],
		tps: tps.slice(0, 3),
		action: "open",
		signalRef
	};
	let confidence = .55;
	if (parsed.sl) confidence += .18;
	if (parsed.tps.length) confidence += .12;
	if (parsed.entry) confidence += .08;
	if (parsed.tps.length >= 2) confidence += .05;
	if (orderType !== "market") confidence += .04;
	return {
		parsed,
		confidence: Math.min(.99, confidence),
		note: `local ${(performance.now() - t0) * 1e3 | 0}µs`
	};
}
function parsedFromUnknown(raw) {
	if (!raw || typeof raw !== "object") return null;
	const o = raw;
	const symbol = typeof o.symbol === "string" ? resolveSymbol(o.symbol) : null;
	const side = o.side === "buy" || o.side === "sell" ? o.side : null;
	if (!symbol || !side) return null;
	const action = [
		"open",
		"close",
		"partial",
		"modify",
		"be",
		"delete"
	].includes(o.action) ? o.action : "open";
	const tps = Array.isArray(o.tps) ? o.tps.filter((n) => typeof n === "number") : [];
	return {
		symbol,
		side,
		orderType: [
			"market",
			"buy_limit",
			"sell_limit",
			"buy_stop",
			"sell_stop"
		].includes(o.orderType) ? o.orderType : "market",
		entry: typeof o.entry === "number" ? o.entry : void 0,
		entryMax: typeof o.entryMax === "number" ? o.entryMax : void 0,
		sl: typeof o.sl === "number" ? o.sl : void 0,
		tps,
		lotsHint: typeof o.lotsHint === "number" ? o.lotsHint : void 0,
		action,
		closePct: typeof o.closePct === "number" ? o.closePct : void 0,
		newSl: typeof o.newSl === "number" ? o.newSl : void 0,
		newTp: typeof o.newTp === "number" ? o.newTp : void 0,
		signalRef: typeof o.signalRef === "number" ? o.signalRef : void 0,
		comment: typeof o.comment === "string" ? o.comment : void 0
	};
}
//#endregion
export { markPrice as a, pipDistance as c, seedQuotes as d, fillPrice as i, pipValueUsd as l, SPECS as n, parseSignal as o, SYMBOL_IDS as r, parsedFromUnknown as s, OPENING as t, pnlUsd as u };
