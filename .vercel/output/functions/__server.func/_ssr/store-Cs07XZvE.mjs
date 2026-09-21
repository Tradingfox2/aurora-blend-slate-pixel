import { a as markPrice, c as pipDistance, d as seedQuotes, i as fillPrice, l as pipValueUsd, n as SPECS, o as parseSignal, r as SYMBOL_IDS, t as OPENING, u as pnlUsd } from "./parser-Cq9aCLaR.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-Cs07XZvE.js
function formatPrice(symbol, price) {
	return price.toFixed(SPECS[symbol].digits);
}
function formatLots(lots) {
	return lots.toFixed(2);
}
function formatUsd(value) {
	return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function formatSignedUsd(value) {
	const body = `$${Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
	if (value > .004) return `+${body}`;
	if (value < -.004) return `-${body}`;
	return body;
}
function formatPct(value) {
	const n = (value * 100).toFixed(2);
	if (value > 4e-5) return `+${n}%`;
	if (value < -4e-5) return `${n}%`;
	return "0.00%";
}
function formatTime(ts, now = Date.now()) {
	const diff = Math.max(0, now - ts);
	if (diff < 5e3) return "now";
	if (diff < 6e4) return `${Math.floor(diff / 1e3)}s`;
	if (diff < 36e5) return `${Math.floor(diff / 6e4)}m`;
	if (diff < 864e5) return `${Math.floor(diff / 36e5)}h`;
	return new Date(ts).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function formatClock(ts) {
	return new Date(ts).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});
}
function formatDateTime(ts) {
	return new Date(ts).toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
function sideLabel(side) {
	return side === "buy" ? "BUY" : "SELL";
}
function signalTag(n) {
	return `#${String(n).padStart(4, "0")}`;
}
function sessionName(ts) {
	const h = new Date(ts).getUTCHours();
	if (h >= 0 && h < 7) return "Tokyo";
	if (h >= 7 && h < 12) return "London";
	if (h >= 12 && h < 16) return "London / New York";
	if (h >= 16 && h < 21) return "New York";
	return "Sydney";
}
function latencyLabel(ms) {
	if (ms < 1) return "<1ms";
	if (ms < 10) return `${ms.toFixed(1)}ms`;
	return `${Math.round(ms)}ms`;
}
function pnlTone(value) {
	if (value > .004) return "buy";
	if (value < -.004) return "sell";
	return "muted";
}
function roundLot(lots) {
	const x = Math.round(lots * 100) / 100;
	return Math.max(.01, x);
}
function defaultSlPrice(symbol, side, entry, pips) {
	const dist = SPECS[symbol].pipSize * pips;
	return side === "buy" ? entry - dist : entry + dist;
}
function sizeLots(args) {
	const { account, symbol, parsed, quote } = args;
	const risk = args.risk ?? account.risk;
	const entry = parsed.entry ?? fillPrice(parsed.side, quote);
	const sl = parsed.sl ?? defaultSlPrice(symbol, parsed.side, entry, Math.max(8, risk.fixedPips || 20));
	const slPips = Math.max(.5, pipDistance(symbol, entry, sl));
	const pipVal = pipValueUsd(symbol, 1);
	let lots = .01;
	switch (risk.mode) {
		case "fixed_lots":
			lots = risk.fixedLots;
			break;
		case "fixed_pips":
			lots = pipVal * risk.fixedPips / (slPips * pipVal);
			break;
		case "rr":
		case "percent":
			lots = account.equity * risk.percent / 100 / (slPips * pipVal);
			break;
		default: lots = risk.fixedLots;
	}
	if (parsed.lotsHint && parsed.lotsHint > 0) lots = Math.min(lots, parsed.lotsHint);
	lots = roundLot(lots);
	lots = Math.min(lots, risk.maxOpenLots);
	return lots;
}
function followerLots(masterLots, follower, masterEquity) {
	const copy = follower.copy;
	if (!copy) return 0;
	let lots = masterLots * copy.multiplier;
	if (copy.equityScale && masterEquity > 0) lots *= follower.equity / masterEquity;
	lots = roundLot(lots);
	lots = Math.min(lots, copy.maxLot, follower.risk.maxOpenLots);
	return lots;
}
function reverseSide(side, reverse) {
	if (!reverse) return side;
	return side === "buy" ? "sell" : "buy";
}
function fridayCutoff(now, hour) {
	if (hour === null) return false;
	const d = new Date(now);
	if (d.getUTCDay() !== 5) return false;
	return d.getUTCHours() >= hour;
}
function uid(prefix) {
	return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function randn() {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function tickQuotes(quotes, now) {
	const next = { ...quotes };
	for (const id of SYMBOL_IDS) {
		const spec = SPECS[id];
		const q = quotes[id];
		const shock = randn() * spec.vol * .55;
		const mid = (q.bid + q.ask) / 2 + shock;
		const widen = spec.baseSpread * (1 + Math.max(0, randn() * .15));
		const half = widen / 2;
		const opening = OPENING[id];
		next[id] = {
			bid: mid - half,
			ask: mid + half,
			spread: widen,
			ts: now,
			change: (mid - opening) / opening
		};
	}
	return next;
}
function positionPnl(p, quotes) {
	const q = quotes[p.symbol];
	const px = markPrice(p.side, q);
	return pnlUsd(p.symbol, p.side, p.openPrice, px, p.lots) - p.commission;
}
function accountFloating(accountId, positions, quotes) {
	let s = 0;
	for (const p of positions) if (p.accountId === accountId) s += positionPnl(p, quotes);
	return s;
}
function usedMargin(accountId, positions, quotes, leverage) {
	let m = 0;
	for (const p of positions) {
		if (p.accountId !== accountId) continue;
		const mid = (quotes[p.symbol].bid + quotes[p.symbol].ask) / 2;
		m += p.lots * SPECS[p.symbol].contractSize * mid / Math.max(1, leverage);
	}
	return m;
}
function event(kind, text, extra) {
	return {
		id: uid("ev"),
		at: Date.now(),
		kind,
		text,
		...extra
	};
}
function refreshAccounts(accounts, positions, quotes) {
	return accounts.map((a) => {
		const floating = accountFloating(a.id, positions, quotes);
		const margin = usedMargin(a.id, positions, quotes, a.leverage);
		const ping = Math.max(4, a.pingMs + (Math.random() - .5) * 3);
		return {
			...a,
			equity: a.balance + floating,
			margin,
			pingMs: Math.round(ping)
		};
	});
}
function tpLevels(parsed, split) {
	if (!parsed.tps.length) return [];
	const n = parsed.tps.length;
	if (n === 1) return [{
		price: parsed.tps[0],
		closePct: 100,
		hit: false
	}];
	if (n === 2) return [{
		price: parsed.tps[0],
		closePct: split[0],
		hit: false
	}, {
		price: parsed.tps[1],
		closePct: 100,
		hit: false
	}];
	return [
		{
			price: parsed.tps[0],
			closePct: split[0],
			hit: false
		},
		{
			price: parsed.tps[1],
			closePct: split[1],
			hit: false
		},
		{
			price: parsed.tps[2],
			closePct: 100,
			hit: false
		}
	];
}
function canTrade(desk, account, symbol) {
	if (desk.circuits.globalHalt) return {
		ok: false,
		reason: "global halt"
	};
	if (account.frozen) return {
		ok: false,
		reason: "account frozen"
	};
	if (!account.connected) return {
		ok: false,
		reason: "terminal offline"
	};
	if (desk.circuits.dailyLossTripped) return {
		ok: false,
		reason: "daily loss circuit"
	};
	if (desk.circuits.spreadPause) return {
		ok: false,
		reason: "spread pause"
	};
	if (account.risk.maxTradesPerDay <= desk.circuits.tradesToday) return {
		ok: false,
		reason: "max trades"
	};
	if (desk.circuits.consecutiveLosses >= account.risk.maxConsecutiveLosses) return {
		ok: false,
		reason: "consecutive losses"
	};
	if (fridayCutoff(desk.now, account.risk.fridayCutoffHour)) return {
		ok: false,
		reason: "Friday cutoff"
	};
	const spreadPips = desk.quotes[symbol].spread / SPECS[symbol].pipSize;
	if (spreadPips > account.risk.maxSpreadPips) return {
		ok: false,
		reason: `spread ${spreadPips.toFixed(1)} pips`
	};
	return { ok: true };
}
function closePosition(p, price, lots, reason, now) {
	const profit = pnlUsd(p.symbol, p.side, p.openPrice, price, lots) - p.commission * (lots / p.lots);
	return {
		id: uid("tr"),
		ticket: p.ticket,
		accountId: p.accountId,
		signalNumber: p.signalNumber,
		sourceId: p.sourceId,
		symbol: p.symbol,
		side: p.side,
		lots,
		openPrice: p.openPrice,
		closePrice: price,
		sl: p.sl,
		tp: p.tp,
		profit,
		openTime: p.openTime,
		closeTime: now,
		comment: reason
	};
}
function applyOpen(desk, signal, parsed, settings) {
	const events = [];
	let positions = desk.positions.slice();
	let orders = desk.orders.slice();
	let accounts = desk.accounts.slice();
	let history = desk.history.slice();
	let ticket = desk.nextTicket;
	const now = desk.now;
	const masters = accounts.filter((a) => a.receivesSignals && a.role !== "follower");
	const openOn = (account, lots, side, copiedFrom) => {
		const gate = canTrade(desk, account, parsed.symbol);
		if (!gate.ok) {
			events.push(event("reject", `${account.name}: ${gate.reason}`, { signalNumber: signal.number }));
			return;
		}
		const q = desk.quotes[parsed.symbol];
		const tps = tpLevels(parsed, settings.tpSplit);
		const sl = parsed.sl ?? null;
		const tp = tps.length ? tps[tps.length - 1].price : parsed.tps[0] ?? null;
		const isPending = parsed.orderType !== "market";
		ticket += 1;
		const magic = signal.number * 1e3 + (account.role === "master" ? 1 : account.role === "follower" ? 2 : 3);
		const comment = `VOLT ${signal.number.toString().padStart(4, "0")} ${account.name}`;
		if (isPending && parsed.entry) {
			orders = [...orders, {
				id: uid("ord"),
				ticket,
				accountId: account.id,
				signalId: signal.id,
				signalNumber: signal.number,
				sourceId: signal.sourceId,
				symbol: parsed.symbol,
				side,
				type: parsed.orderType,
				lots,
				price: parsed.entry,
				sl,
				tp,
				tps,
				createdAt: now,
				magic,
				comment
			}];
			events.push(event("fill", `Pending ${parsed.orderType} ${lots.toFixed(2)} ${parsed.symbol} @ ${parsed.entry} · ${account.name}`, { signalNumber: signal.number }));
			return;
		}
		const px = fillPrice(side, q);
		positions = [...positions, {
			id: uid("pos"),
			ticket,
			accountId: account.id,
			signalId: signal.id,
			signalNumber: signal.number,
			sourceId: signal.sourceId,
			copiedFrom,
			symbol: parsed.symbol,
			side,
			lots,
			openPrice: px,
			sl,
			tp,
			tps,
			beAfterTp1: settings.beAfterTp1,
			trailingPips: settings.defaultTrailingPips,
			openTime: now,
			magic,
			comment,
			commission: 3.5 * lots
		}];
		events.push(event("fill", `Filled ${side.toUpperCase()} ${lots.toFixed(2)} ${parsed.symbol} @ ${px} · ${account.name}`, {
			signalNumber: signal.number,
			latencyMs: signal.latency.totalMs
		}));
	};
	for (const acc of masters) {
		const lots = sizeLots({
			account: acc,
			symbol: parsed.symbol,
			parsed,
			quote: desk.quotes[parsed.symbol]
		});
		openOn(acc, lots, parsed.side);
		if (acc.role === "master") {
			const followers = accounts.filter((f) => f.role === "follower" && f.copy?.masterId === acc.id && !f.frozen);
			for (const f of followers) {
				const fl = followerLots(lots, f, acc.equity);
				if (fl <= 0) continue;
				openOn(f, fl, reverseSide(parsed.side, Boolean(f.copy?.reverse)), acc.id);
				events.push(event("copy", `Copied ${signalTagSafe(signal.number)} → ${f.name} ${fl.toFixed(2)} lots`, { signalNumber: signal.number }));
			}
		}
	}
	const circuits = {
		...desk.circuits,
		tradesToday: desk.circuits.tradesToday + 1
	};
	const signals = desk.signals.map((s) => s.id === signal.id ? {
		...s,
		status: parsed.orderType === "market" ? "live" : "routed",
		parsed
	} : s);
	accounts = refreshAccounts(accounts, positions, desk.quotes);
	return {
		positions,
		orders,
		signals,
		accounts,
		history,
		circuits,
		nextTicket: ticket,
		events,
		filled: events.some((e) => e.kind === "fill")
	};
}
function signalTagSafe(n) {
	return `#${String(n).padStart(4, "0")}`;
}
function applyManage(desk, signal, parsed) {
	const events = [];
	let positions = desk.positions.slice();
	let orders = desk.orders.slice();
	const accounts = desk.accounts.slice();
	let history = desk.history.slice();
	const now = desk.now;
	const sourceFilter = (p) => {
		if (parsed.signalRef) return p.signalNumber === parsed.signalRef;
		if (parsed.symbol) return p.symbol === parsed.symbol && (p.sourceId === signal.sourceId || !p.sourceId);
		return false;
	};
	const hit = positions.filter(sourceFilter);
	if (parsed.action === "delete") {
		const before = orders.length;
		orders = orders.filter((o) => !sourceFilter(o));
		events.push(event("modify", `Cancelled ${before - orders.length} pending for ${signalTagSafe(signal.number)}`));
	} else if (parsed.action === "be") {
		positions = positions.map((p) => {
			if (!sourceFilter(p)) return p;
			return {
				...p,
				sl: p.openPrice
			};
		});
		events.push(event("modify", `SL → BE on ${hit.length} position(s)`));
	} else if (parsed.action === "modify") {
		positions = positions.map((p) => {
			if (!sourceFilter(p)) return p;
			return {
				...p,
				sl: parsed.newSl ?? parsed.sl ?? p.sl,
				tp: parsed.newTp ?? p.tp
			};
		});
		events.push(event("modify", `Modified ${hit.length} position(s)`));
	} else if (parsed.action === "partial" || parsed.action === "close") {
		const pct = parsed.action === "close" ? 100 : parsed.closePct ?? 50;
		const remain = [];
		for (const p of positions) {
			if (!sourceFilter(p)) {
				remain.push(p);
				continue;
			}
			const q = desk.quotes[p.symbol];
			const px = markPrice(p.side, q);
			const closeLots = roundLot(p.lots * (pct / 100));
			const leave = Math.max(0, Math.round((p.lots - closeLots) * 100) / 100);
			const trade = closePosition(p, px, Math.min(closeLots, p.lots), `${parsed.action} ${signalTagSafe(signal.number)}`, now);
			history = [trade, ...history];
			const accIdx = accounts.findIndex((a) => a.id === p.accountId);
			if (accIdx >= 0) accounts[accIdx] = {
				...accounts[accIdx],
				balance: accounts[accIdx].balance + trade.profit
			};
			events.push(event("close", `Closed ${closeLots.toFixed(2)} ${p.symbol} ${p.side.toUpperCase()} · ${trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? void 0 }));
			if (leave >= .01) remain.push({
				...p,
				lots: leave
			});
		}
		positions = remain;
	}
	const stillLive = positions.some((p) => p.signalId === signal.id || p.signalNumber === signal.number);
	const signals = desk.signals.map((s) => s.id === signal.id ? {
		...s,
		status: stillLive ? "managed" : "closed",
		parsed
	} : s);
	const refreshed = refreshAccounts(accounts, positions, desk.quotes);
	return {
		positions,
		orders,
		signals,
		accounts: refreshed,
		history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events,
		filled: true
	};
}
function matchPendings(desk) {
	const events = [];
	let positions = desk.positions.slice();
	const remain = [];
	const now = desk.now;
	for (const o of desk.orders) {
		const q = desk.quotes[o.symbol];
		let hit = false;
		if (o.type === "buy_limit") hit = q.ask <= o.price;
		else if (o.type === "sell_limit") hit = q.bid >= o.price;
		else if (o.type === "buy_stop") hit = q.ask >= o.price;
		else if (o.type === "sell_stop") hit = q.bid <= o.price;
		if (!hit) {
			remain.push(o);
			continue;
		}
		const px = fillPrice(o.side, q);
		positions.push({
			id: uid("pos"),
			ticket: o.ticket,
			accountId: o.accountId,
			signalId: o.signalId,
			signalNumber: o.signalNumber,
			sourceId: o.sourceId,
			symbol: o.symbol,
			side: o.side,
			lots: o.lots,
			openPrice: px,
			sl: o.sl,
			tp: o.tp,
			tps: o.tps,
			beAfterTp1: desk.settings.beAfterTp1,
			trailingPips: desk.settings.defaultTrailingPips,
			openTime: now,
			magic: o.magic,
			comment: o.comment,
			commission: 3.5 * o.lots
		});
		events.push(event("fill", `Pending filled ${o.side.toUpperCase()} ${o.lots.toFixed(2)} ${o.symbol} @ ${px}`, { signalNumber: o.signalNumber ?? void 0 }));
	}
	const accounts = refreshAccounts(desk.accounts, positions, desk.quotes);
	return {
		positions,
		orders: remain,
		signals: desk.signals,
		accounts,
		history: desk.history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events,
		filled: events.length > 0
	};
}
function manageOpenPositions(desk) {
	const events = [];
	let positions = [];
	let history = desk.history.slice();
	const accounts = desk.accounts.map((a) => ({ ...a }));
	const now = desk.now;
	let consecutive = desk.circuits.consecutiveLosses;
	let realized = desk.circuits.realizedToday;
	for (const p of desk.positions) {
		const q = desk.quotes[p.symbol];
		const px = markPrice(p.side, q);
		let sl = p.sl;
		let tps = p.tps.map((t) => ({ ...t }));
		let lots = p.lots;
		if (p.trailingPips && p.trailingPips > 0) {
			const dist = SPECS[p.symbol].pipSize * p.trailingPips;
			if (p.side === "buy") {
				const trail = px - dist;
				if (sl === null || trail > sl) sl = trail;
			} else {
				const trail = px + dist;
				if (sl === null || trail < sl) sl = trail;
			}
		}
		if (sl !== null && (p.side === "buy" ? q.bid <= sl : q.ask >= sl) && sl !== null) {
			const trade = closePosition({
				...p,
				sl
			}, sl, lots, "SL", now);
			history = [trade, ...history];
			const i = accounts.findIndex((a) => a.id === p.accountId);
			if (i >= 0) accounts[i].balance += trade.profit;
			realized += trade.profit;
			consecutive = trade.profit < 0 ? consecutive + 1 : 0;
			events.push(event("close", `SL ${p.symbol} ${p.side.toUpperCase()} ${lots.toFixed(2)} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? void 0 }));
			continue;
		}
		let closedAll = false;
		for (let i = 0; i < tps.length; i++) {
			const lvl = tps[i];
			if (lvl.hit) continue;
			if (!(p.side === "buy" ? q.bid >= lvl.price : q.ask <= lvl.price)) continue;
			tps[i] = {
				...lvl,
				hit: true
			};
			const closeLots = roundLot(lots * (lvl.closePct / 100));
			const take = Math.min(closeLots, lots);
			const trade = closePosition(p, lvl.price, take, `TP${i + 1}`, now);
			history = [trade, ...history];
			const ai = accounts.findIndex((a) => a.id === p.accountId);
			if (ai >= 0) accounts[ai].balance += trade.profit;
			realized += trade.profit;
			consecutive = trade.profit < 0 ? consecutive + 1 : 0;
			lots = Math.round((lots - take) * 100) / 100;
			events.push(event("close", `TP${i + 1} ${p.symbol} ${take.toFixed(2)} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? void 0 }));
			if (p.beAfterTp1 && i === 0 && lots >= .01) sl = p.openPrice;
			if (lots < .01) {
				closedAll = true;
				break;
			}
		}
		if (closedAll) continue;
		if (p.tp !== null && tps.length === 0 && (p.side === "buy" ? q.bid >= p.tp : q.ask <= p.tp) && p.tp !== null) {
			const trade = closePosition(p, p.tp, lots, "TP", now);
			history = [trade, ...history];
			const i = accounts.findIndex((a) => a.id === p.accountId);
			if (i >= 0) accounts[i].balance += trade.profit;
			realized += trade.profit;
			consecutive = trade.profit < 0 ? consecutive + 1 : 0;
			events.push(event("close", `TP ${p.symbol} · ${trade.profit.toFixed(2)}`, { signalNumber: p.signalNumber ?? void 0 }));
			continue;
		}
		positions.push({
			...p,
			sl,
			tps,
			lots
		});
	}
	const refreshed = refreshAccounts(accounts, positions, desk.quotes);
	const master = refreshed.find((a) => a.role === "master") ?? refreshed[0];
	const dayCap = master ? master.risk.maxDailyLossPct / 100 * desk.circuits.dayStartEquity : Infinity;
	const floating = master ? accountFloating(master.id, positions, desk.quotes) : 0;
	const dailyLossTripped = realized + floating <= -dayCap;
	let circuits = {
		...desk.circuits,
		consecutiveLosses: consecutive,
		realizedToday: realized,
		dailyLossTripped,
		reason: dailyLossTripped ? "Daily loss circuit" : desk.circuits.reason
	};
	if (dailyLossTripped && master?.risk.flattenOnTrip && positions.length) {
		const flattened = [];
		for (const p of positions) {
			const q = desk.quotes[p.symbol];
			const trade = closePosition(p, markPrice(p.side, q), p.lots, "circuit flatten", now);
			history = [trade, ...history];
			const i = refreshed.findIndex((a) => a.id === p.accountId);
			if (i >= 0) refreshed[i].balance += trade.profit;
			events.push(event("circuit", `Flattened ${p.symbol} on circuit`));
		}
		positions = flattened;
		circuits = {
			...circuits,
			globalHalt: true,
			reason: "Daily loss · flattened"
		};
	}
	const signals = desk.signals.map((s) => {
		if (s.status !== "live" && s.status !== "managed") return s;
		if (!positions.some((p) => p.signalId === s.id) && (s.status === "live" || s.status === "managed")) return {
			...s,
			status: "closed"
		};
		return s;
	});
	return {
		positions,
		orders: desk.orders,
		signals,
		accounts: refreshAccounts(refreshed, positions, desk.quotes),
		history: history.slice(0, 400),
		circuits,
		nextTicket: desk.nextTicket,
		events,
		filled: events.length > 0
	};
}
function bulkClose(desk, filter, reason) {
	const events = [];
	const now = desk.now;
	const accounts = desk.accounts.map((a) => ({ ...a }));
	let history = desk.history.slice();
	const remain = [];
	for (const p of desk.positions) {
		if (!filter(p)) {
			remain.push(p);
			continue;
		}
		const trade = closePosition(p, markPrice(p.side, desk.quotes[p.symbol]), p.lots, reason, now);
		history = [trade, ...history];
		const i = accounts.findIndex((a) => a.id === p.accountId);
		if (i >= 0) accounts[i].balance += trade.profit;
		events.push(event("close", `${reason}: ${p.symbol} ${p.lots.toFixed(2)} · ${trade.profit.toFixed(2)}`));
	}
	return {
		positions: remain,
		orders: desk.orders,
		signals: desk.signals,
		accounts: refreshAccounts(accounts, remain, desk.quotes),
		history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events,
		filled: true
	};
}
function cancelOrders(desk, filter) {
	const keep = desk.orders.filter((o) => !filter(o));
	const n = desk.orders.length - keep.length;
	return {
		positions: desk.positions,
		orders: keep,
		signals: desk.signals,
		accounts: desk.accounts,
		history: desk.history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events: n ? [event("modify", `Cancelled ${n} pending`)] : [],
		filled: n > 0
	};
}
function modifyPosition(desk, id, patch) {
	return {
		positions: desk.positions.map((p) => p.id === id ? {
			...p,
			...patch
		} : p),
		orders: desk.orders,
		signals: desk.signals,
		accounts: desk.accounts,
		history: desk.history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events: [event("modify", "Position modified")],
		filled: true
	};
}
function manualMarket(desk, args) {
	const account = desk.accounts.find((a) => a.id === args.accountId);
	if (!account) return {
		positions: desk.positions,
		orders: desk.orders,
		signals: desk.signals,
		accounts: desk.accounts,
		history: desk.history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events: [event("reject", "Unknown account")],
		filled: false
	};
	const gate = canTrade(desk, account, args.symbol);
	if (!gate.ok) return {
		positions: desk.positions,
		orders: desk.orders,
		signals: desk.signals,
		accounts: desk.accounts,
		history: desk.history,
		circuits: desk.circuits,
		nextTicket: desk.nextTicket,
		events: [event("reject", gate.reason ?? "blocked")],
		filled: false
	};
	const ticket = desk.nextTicket + 1;
	const px = fillPrice(args.side, desk.quotes[args.symbol]);
	const pos = {
		id: uid("pos"),
		ticket,
		accountId: account.id,
		signalId: null,
		signalNumber: null,
		sourceId: null,
		symbol: args.symbol,
		side: args.side,
		lots: roundLot(args.lots),
		openPrice: px,
		sl: args.sl ?? null,
		tp: args.tp ?? null,
		tps: args.tp ? [{
			price: args.tp,
			closePct: 100,
			hit: false
		}] : [],
		beAfterTp1: desk.settings.beAfterTp1,
		trailingPips: desk.settings.defaultTrailingPips,
		openTime: desk.now,
		magic: ticket,
		comment: "VOLT manual",
		commission: 3.5 * args.lots
	};
	const positions = [...desk.positions, pos];
	return {
		positions,
		orders: desk.orders,
		signals: desk.signals,
		accounts: refreshAccounts(desk.accounts, positions, desk.quotes),
		history: desk.history,
		circuits: {
			...desk.circuits,
			tradesToday: desk.circuits.tradesToday + 1
		},
		nextTicket: ticket,
		events: [event("fill", `Manual ${args.side.toUpperCase()} ${args.lots.toFixed(2)} ${args.symbol} @ ${px}`)],
		filled: true
	};
}
var SOURCE_SEED = [
	{
		id: "gold-sniper",
		name: "Gold Sniper VIP",
		username: "goldsniper_vip",
		kind: "channel",
		members: 12840,
		listening: true,
		autoTrade: true,
		priority: 1
	},
	{
		id: "fx-masters",
		name: "FX Masters",
		username: "fx_masters_desk",
		kind: "channel",
		members: 22110,
		listening: true,
		autoTrade: true,
		priority: 2
	},
	{
		id: "crypto-pulse",
		name: "Crypto Pulse",
		username: "crypto_pulse_fx",
		kind: "group",
		members: 8640,
		listening: true,
		autoTrade: false,
		priority: 5
	},
	{
		id: "indices-desk",
		name: "Indices Desk",
		username: "indices_desk",
		kind: "channel",
		members: 5402,
		listening: true,
		autoTrade: true,
		priority: 3
	},
	{
		id: "london-scalps",
		name: "London Scalps",
		username: "london_scalps",
		kind: "group",
		members: 3104,
		listening: true,
		autoTrade: false,
		priority: 6
	},
	{
		id: "smc-room",
		name: "SMC Inner",
		username: "smc_inner_room",
		kind: "supergroup",
		members: 980,
		listening: false,
		autoTrade: false,
		priority: 8
	},
	{
		id: "oil-wire",
		name: "Oil Wire",
		username: "oil_wire",
		kind: "channel",
		members: 4021,
		listening: true,
		autoTrade: false,
		priority: 7
	},
	{
		id: "vip-circle",
		name: "Inner Circle",
		username: "volt_inner_circle",
		kind: "supergroup",
		members: 214,
		listening: true,
		autoTrade: true,
		priority: 4
	}
];
var AUTHORS = {
	"gold-sniper": ["Admin", "Aisha"],
	"fx-masters": ["Desk", "Marco"],
	"crypto-pulse": ["Pulse", "Kenji"],
	"indices-desk": ["NY Desk", "Lina"],
	"london-scalps": ["Jon", "Priya"],
	"smc-room": ["Mentor"],
	"oil-wire": ["Wire"],
	"vip-circle": ["Lead", "Nico"]
};
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function pips(symbol, n) {
	return SPECS[symbol].pipSize * n;
}
function preferredSymbols(sourceId) {
	switch (sourceId) {
		case "gold-sniper": return ["XAUUSD"];
		case "fx-masters": return [
			"EURUSD",
			"GBPUSD",
			"USDJPY",
			"GBPJPY"
		];
		case "crypto-pulse": return ["BTCUSD", "ETHUSD"];
		case "indices-desk": return ["NAS100", "US30"];
		case "london-scalps": return [
			"EURUSD",
			"GBPUSD",
			"XAUUSD"
		];
		case "oil-wire": return ["USOIL"];
		default: return [...SYMBOL_IDS];
	}
}
function generateMessage(source, quotes, liveSignalNumbers) {
	const from = pick(AUTHORS[source.id] ?? ["Admin"]);
	const roll = Math.random();
	if (liveSignalNumbers.length && roll < .22) return {
		from,
		kind: "manage",
		text: manageText(liveSignalNumbers, quotes)
	};
	if (roll < .32) return {
		from,
		kind: "messy",
		text: messyText(source, quotes)
	};
	return {
		from,
		kind: "open",
		text: cleanText(source, quotes)
	};
}
function cleanText(source, quotes) {
	const symbol = pick(preferredSymbols(source.id));
	const q = quotes[symbol];
	const mid = (q.bid + q.ask) / 2;
	const side = Math.random() > .48 ? "buy" : "sell";
	const dir = side === "buy" ? 1 : -1;
	const sl = mid - dir * pips(symbol, 18 + Math.random() * 22);
	const tp1 = mid + dir * pips(symbol, 16 + Math.random() * 10);
	const tp2 = mid + dir * pips(symbol, 32 + Math.random() * 16);
	const tp3 = mid + dir * pips(symbol, 55 + Math.random() * 24);
	const entryA = mid - dir * pips(symbol, 1.2);
	const entryB = mid + dir * pips(symbol, 2.4);
	const f = (n) => formatPrice(symbol, n);
	const style = Math.floor(Math.random() * 3);
	const header = `${symbol} ${side.toUpperCase()} NOW`;
	if (style === 0) return [
		header,
		`Entry: ${f(entryA)} - ${f(entryB)}`,
		`SL: ${f(sl)}`,
		`TP1: ${f(tp1)}`,
		`TP2: ${f(tp2)}`,
		`TP3: ${f(tp3)}`
	].join("\n");
	if (style === 1) return `${header}
Entry ${f(mid)}
SL ${f(sl)}
TP ${f(tp1)} / ${f(tp2)} / ${f(tp3)}`;
	return `${side === "buy" ? "BUY" : "SELL"} ${symbol}
Stop loss ${f(sl)}
Take profit ${f(tp1)}
TP2 ${f(tp2)}`;
}
function messyText(source, quotes) {
	const symbol = pick(preferredSymbols(source.id));
	const q = quotes[symbol];
	const mid = (q.bid + q.ask) / 2;
	const f = (n) => formatPrice(symbol, n);
	return pick([
		`looking at ${symbol} for a long here, sl a bit under ${f(mid - pips(symbol, 22))} tps ${f(mid + pips(symbol, 18))} then ${f(mid + pips(symbol, 40))}`,
		`${symbol} short if we reject, invalidation ${f(mid + pips(symbol, 16))}`,
		`scalp ${symbol} same plan as last, tight sl`,
		`gold looking heavy / wait for confirmation`,
		`${symbol} in premium, want a sell model. no chase.`
	]);
}
function manageText(numbers, quotes) {
	const n = pick(numbers);
	return pick([
		`Close 50% on #${n}`,
		`Move SL to BE on #${n}`,
		`Close #${n} now`,
		`TP1 hit, close 50% #${n}`,
		`Trail #${n}`,
		`Book ${pick([
			"XAUUSD",
			"EURUSD",
			"NAS100"
		])} now`
	]);
}
function chatTitle(kind) {
	if (kind === "channel") return "Channel";
	if (kind === "supergroup") return "Supergroup";
	return "Group";
}
function risk(partial = {}) {
	return {
		mode: "percent",
		percent: 1,
		fixedLots: .1,
		fixedPips: 20,
		rr: 2,
		maxDailyLossPct: 4,
		maxOpenLots: 5,
		maxTradesPerDay: 40,
		maxConsecutiveLosses: 6,
		maxSlippagePips: 3,
		maxSpreadPips: 40,
		flattenOnTrip: false,
		fridayCutoffHour: 21,
		...partial
	};
}
function seedAccounts() {
	return [
		{
			id: "acc-master",
			name: "Volt Master",
			platform: "MT5",
			broker: "IC Markets",
			server: "ICMarketsSC-MT5-2",
			login: "50422187",
			role: "master",
			currency: "USD",
			leverage: 500,
			balance: 52480,
			equity: 52480,
			margin: 0,
			connected: true,
			pingMs: 11,
			frozen: false,
			receivesSignals: true,
			risk: risk({
				percent: .8,
				maxOpenLots: 8
			})
		},
		{
			id: "acc-copy-a",
			name: "Exness Copy",
			platform: "MT4",
			broker: "Exness",
			server: "Exness-Real3",
			login: "88120411",
			role: "follower",
			currency: "USD",
			leverage: 400,
			balance: 12410,
			equity: 12410,
			margin: 0,
			connected: true,
			pingMs: 18,
			frozen: false,
			receivesSignals: false,
			risk: risk({
				mode: "fixed_lots",
				fixedLots: .05,
				maxOpenLots: 2
			}),
			copy: {
				masterId: "acc-master",
				multiplier: .4,
				reverse: false,
				equityScale: false,
				maxLot: 1.2,
				delayMs: 0,
				symbolSuffix: ""
			}
		},
		{
			id: "acc-prop",
			name: "FTMO 100k",
			platform: "MT5",
			broker: "FTMO",
			server: "FTMO-Server3",
			login: "11092844",
			role: "follower",
			currency: "USD",
			leverage: 100,
			balance: 1e5,
			equity: 1e5,
			margin: 0,
			connected: true,
			pingMs: 9,
			frozen: false,
			receivesSignals: false,
			risk: risk({
				mode: "percent",
				percent: .4,
				maxDailyLossPct: 2,
				maxOpenLots: 4,
				flattenOnTrip: true
			}),
			copy: {
				masterId: "acc-master",
				multiplier: .25,
				reverse: false,
				equityScale: true,
				maxLot: 2,
				delayMs: 40,
				symbolSuffix: ".pro"
			}
		},
		{
			id: "acc-personal",
			name: "Pepperstone Scalp",
			platform: "MT5",
			broker: "Pepperstone",
			server: "Pepperstone-MT5-Live2",
			login: "3340912",
			role: "independent",
			currency: "USD",
			leverage: 200,
			balance: 8250,
			equity: 8250,
			margin: 0,
			connected: true,
			pingMs: 14,
			frozen: false,
			receivesSignals: true,
			risk: risk({
				mode: "rr",
				percent: .5,
				rr: 2.5,
				maxOpenLots: 1.5
			})
		}
	];
}
var SETTINGS = {
	autoInterpret: true,
	grokFallback: false,
	grokCallsUsed: 0,
	grokCallCap: 8,
	beAfterTp1: true,
	tpSplit: [
		50,
		30,
		20
	],
	defaultTrailingPips: null,
	paper: true
};
function at(now, minutesAgo) {
	return now - minutesAgo * 6e4;
}
function seedHistory(now) {
	return [
		{
			ticket: 18419901,
			accountId: "acc-master",
			signalNumber: 138,
			sourceId: "gold-sniper",
			symbol: "XAUUSD",
			side: "buy",
			lots: .42,
			openPrice: 3671.2,
			closePrice: 3682.4,
			sl: 3664.1,
			tp: 3688,
			profit: 470.4,
			openTime: at(now, 420),
			closeTime: at(now, 310),
			comment: "TP2"
		},
		{
			ticket: 18419902,
			accountId: "acc-copy-a",
			signalNumber: 138,
			sourceId: "gold-sniper",
			symbol: "XAUUSD",
			side: "buy",
			lots: .17,
			openPrice: 3671.22,
			closePrice: 3682.41,
			sl: 3664.1,
			tp: 3688,
			profit: 190.23,
			openTime: at(now, 420),
			closeTime: at(now, 310),
			comment: "copy TP2"
		},
		{
			ticket: 18419908,
			accountId: "acc-master",
			signalNumber: 139,
			sourceId: "fx-masters",
			symbol: "EURUSD",
			side: "sell",
			lots: 1.2,
			openPrice: 1.08612,
			closePrice: 1.0844,
			sl: 1.0878,
			tp: 1.0832,
			profit: 206.4,
			openTime: at(now, 380),
			closeTime: at(now, 240),
			comment: "TP1"
		},
		{
			ticket: 18419911,
			accountId: "acc-master",
			signalNumber: 140,
			sourceId: "indices-desk",
			symbol: "NAS100",
			side: "buy",
			lots: .8,
			openPrice: 20012.4,
			closePrice: 19974.1,
			sl: 19974,
			tp: 20110,
			profit: -30.64,
			openTime: at(now, 300),
			closeTime: at(now, 250),
			comment: "SL"
		},
		{
			ticket: 18419914,
			accountId: "acc-personal",
			signalNumber: 141,
			sourceId: "london-scalps",
			symbol: "GBPUSD",
			side: "buy",
			lots: .2,
			openPrice: 1.3102,
			closePrice: 1.3129,
			sl: 1.3084,
			tp: 1.3148,
			profit: 54,
			openTime: at(now, 210),
			closeTime: at(now, 140),
			comment: "TP1"
		},
		{
			ticket: 18419918,
			accountId: "acc-master",
			signalNumber: 142,
			sourceId: "vip-circle",
			symbol: "GBPJPY",
			side: "sell",
			lots: .6,
			openPrice: 194.88,
			closePrice: 194.41,
			sl: 195.22,
			tp: 194.1,
			profit: 282,
			openTime: at(now, 180),
			closeTime: at(now, 90),
			comment: "TP1"
		},
		{
			ticket: 18419921,
			accountId: "acc-prop",
			signalNumber: 142,
			sourceId: "vip-circle",
			symbol: "GBPJPY",
			side: "sell",
			lots: .4,
			openPrice: 194.882,
			closePrice: 194.412,
			sl: 195.22,
			tp: 194.1,
			profit: 188,
			openTime: at(now, 180),
			closeTime: at(now, 90),
			comment: "copy"
		},
		{
			ticket: 18419924,
			accountId: "acc-master",
			signalNumber: 143,
			sourceId: "gold-sniper",
			symbol: "XAUUSD",
			side: "sell",
			lots: .3,
			openPrice: 3691.8,
			closePrice: 3698.2,
			sl: 3698.1,
			tp: 3674,
			profit: -192,
			openTime: at(now, 160),
			closeTime: at(now, 120),
			comment: "SL"
		},
		{
			ticket: 18419928,
			accountId: "acc-master",
			signalNumber: 144,
			sourceId: "fx-masters",
			symbol: "USDJPY",
			side: "buy",
			lots: 1,
			openPrice: 147.92,
			closePrice: 148.18,
			sl: 147.71,
			tp: 148.4,
			profit: 175.4,
			openTime: at(now, 110),
			closeTime: at(now, 40),
			comment: "TP1"
		},
		{
			ticket: 18419931,
			accountId: "acc-personal",
			signalNumber: null,
			sourceId: null,
			symbol: "USOIL",
			side: "buy",
			lots: .15,
			openPrice: 71.92,
			closePrice: 72.44,
			sl: 71.4,
			tp: 73.1,
			profit: 78,
			openTime: at(now, 96),
			closeTime: at(now, 28),
			comment: "manual"
		},
		{
			ticket: 18419933,
			accountId: "acc-copy-a",
			signalNumber: 144,
			sourceId: "fx-masters",
			symbol: "USDJPY",
			side: "buy",
			lots: .4,
			openPrice: 147.922,
			closePrice: 148.181,
			sl: 147.71,
			tp: 148.4,
			profit: 70.1,
			openTime: at(now, 110),
			closeTime: at(now, 40),
			comment: "copy"
		},
		{
			ticket: 18419936,
			accountId: "acc-master",
			signalNumber: 145,
			sourceId: "crypto-pulse",
			symbol: "BTCUSD",
			side: "buy",
			lots: .08,
			openPrice: 96810,
			closePrice: 97140,
			sl: 96120,
			tp: 97800,
			profit: 26.4,
			openTime: at(now, 80),
			closeTime: at(now, 22),
			comment: "partial"
		}
	].map((r, i) => ({
		...r,
		id: `hist_${i + 1}`
	}));
}
function seedPositions(now) {
	return [
		{
			id: "pos_live_1",
			ticket: 18420002,
			accountId: "acc-master",
			signalId: "sig_146",
			signalNumber: 146,
			sourceId: "gold-sniper",
			symbol: "XAUUSD",
			side: "buy",
			lots: .36,
			openPrice: 3681.4,
			sl: 3674.2,
			tp: 3704.8,
			tps: [
				{
					price: 3690.2,
					closePct: 50,
					hit: false
				},
				{
					price: 3697.4,
					closePct: 30,
					hit: false
				},
				{
					price: 3704.8,
					closePct: 100,
					hit: false
				}
			],
			beAfterTp1: true,
			trailingPips: null,
			openTime: at(now, 38),
			magic: 146001,
			comment: "VOLT 0146 Volt Master",
			commission: 1.26
		},
		{
			id: "pos_live_2",
			ticket: 18420003,
			accountId: "acc-copy-a",
			signalId: "sig_146",
			signalNumber: 146,
			sourceId: "gold-sniper",
			copiedFrom: "acc-master",
			symbol: "XAUUSD",
			side: "buy",
			lots: .14,
			openPrice: 3681.44,
			sl: 3674.2,
			tp: 3704.8,
			tps: [{
				price: 3690.2,
				closePct: 50,
				hit: false
			}, {
				price: 3704.8,
				closePct: 100,
				hit: false
			}],
			beAfterTp1: true,
			trailingPips: null,
			openTime: at(now, 38),
			magic: 146002,
			comment: "VOLT 0146 Exness Copy",
			commission: .49
		},
		{
			id: "pos_live_3",
			ticket: 18420005,
			accountId: "acc-master",
			signalId: "sig_147",
			signalNumber: 147,
			sourceId: "fx-masters",
			symbol: "EURUSD",
			side: "sell",
			lots: 1.1,
			openPrice: 1.08502,
			sl: 1.0868,
			tp: 1.0814,
			tps: [{
				price: 1.0836,
				closePct: 50,
				hit: false
			}, {
				price: 1.0814,
				closePct: 100,
				hit: false
			}],
			beAfterTp1: true,
			trailingPips: null,
			openTime: at(now, 22),
			magic: 147001,
			comment: "VOLT 0147 Volt Master",
			commission: 3.85
		},
		{
			id: "pos_live_4",
			ticket: 18420007,
			accountId: "acc-personal",
			signalId: "sig_148",
			signalNumber: 148,
			sourceId: "indices-desk",
			symbol: "NAS100",
			side: "buy",
			lots: .4,
			openPrice: 20112.2,
			sl: 20040,
			tp: 20280,
			tps: [{
				price: 20190,
				closePct: 50,
				hit: false
			}, {
				price: 20280,
				closePct: 100,
				hit: false
			}],
			beAfterTp1: true,
			trailingPips: 18,
			openTime: at(now, 14),
			magic: 148003,
			comment: "VOLT 0148 Pepperstone Scalp",
			commission: 1.4
		},
		{
			id: "pos_live_5",
			ticket: 18420008,
			accountId: "acc-prop",
			signalId: "sig_146",
			signalNumber: 146,
			sourceId: "gold-sniper",
			copiedFrom: "acc-master",
			symbol: "XAUUSD",
			side: "buy",
			lots: .22,
			openPrice: 3681.5,
			sl: 3674.2,
			tp: 3704.8,
			tps: [{
				price: 3690.2,
				closePct: 50,
				hit: false
			}, {
				price: 3704.8,
				closePct: 100,
				hit: false
			}],
			beAfterTp1: true,
			trailingPips: null,
			openTime: at(now, 38),
			magic: 146002,
			comment: "VOLT 0146 FTMO 100k",
			commission: .77
		}
	];
}
function seedSignals(now) {
	const emptyLat = {
		receiveMs: 0,
		parseMs: .4,
		riskMs: .1,
		routeMs: .2,
		fillMs: 8,
		totalMs: 9
	};
	return [
		{
			id: "sig_146",
			number: 146,
			sourceId: "gold-sniper",
			telegramMsgId: "tg_146",
			rawText: "XAUUSD BUY NOW\nEntry: 3680.40 - 3682.20\nSL: 3674.20\nTP1: 3690.20\nTP2: 3697.40\nTP3: 3704.80",
			parsed: {
				symbol: "XAUUSD",
				side: "buy",
				orderType: "market",
				entry: 3680.4,
				entryMax: 3682.2,
				sl: 3674.2,
				tps: [
					3690.2,
					3697.4,
					3704.8
				],
				action: "open"
			},
			confidence: .96,
			interpreter: "local",
			status: "live",
			receivedAt: at(now, 38),
			latency: {
				...emptyLat,
				totalMs: 11,
				fillMs: 10
			}
		},
		{
			id: "sig_147",
			number: 147,
			sourceId: "fx-masters",
			telegramMsgId: "tg_147",
			rawText: "EURUSD SELL\nSL 1.08680\nTP 1.08360\nTP2 1.08140",
			parsed: {
				symbol: "EURUSD",
				side: "sell",
				orderType: "market",
				sl: 1.0868,
				tps: [1.0836, 1.0814],
				action: "open"
			},
			confidence: .93,
			interpreter: "local",
			status: "live",
			receivedAt: at(now, 22),
			latency: {
				...emptyLat,
				totalMs: 8
			}
		},
		{
			id: "sig_148",
			number: 148,
			sourceId: "indices-desk",
			telegramMsgId: "tg_148",
			rawText: "NAS100 BUY NOW\nEntry 20112\nSL 20040\nTP 20190 / 20280",
			parsed: {
				symbol: "NAS100",
				side: "buy",
				orderType: "market",
				entry: 20112,
				sl: 20040,
				tps: [20190, 20280],
				action: "open"
			},
			confidence: .91,
			interpreter: "local",
			status: "live",
			receivedAt: at(now, 14),
			latency: {
				...emptyLat,
				totalMs: 13
			}
		},
		{
			id: "sig_149",
			number: 149,
			sourceId: "crypto-pulse",
			telegramMsgId: "tg_149",
			rawText: "btc looking heavy into the round number, maybe a scalp short if we fail — not financial advice",
			confidence: .28,
			interpreter: "local",
			status: "received",
			receivedAt: at(now, 6),
			latency: {
				receiveMs: 0,
				parseMs: .3,
				riskMs: 0,
				routeMs: 0,
				fillMs: 0,
				totalMs: .3
			},
			note: "low confidence · awaiting Grok"
		}
	];
}
function seedMessages(now) {
	const sigs = seedSignals(now);
	return [
		{
			id: "tg_146",
			sourceId: "gold-sniper",
			text: sigs[0].rawText,
			at: sigs[0].receivedAt,
			from: "Aisha",
			interpreted: true,
			signalId: "sig_146"
		},
		{
			id: "tg_147",
			sourceId: "fx-masters",
			text: sigs[1].rawText,
			at: sigs[1].receivedAt,
			from: "Desk",
			interpreted: true,
			signalId: "sig_147"
		},
		{
			id: "tg_148",
			sourceId: "indices-desk",
			text: sigs[2].rawText,
			at: sigs[2].receivedAt,
			from: "Lina",
			interpreted: true,
			signalId: "sig_148"
		},
		{
			id: "tg_149",
			sourceId: "crypto-pulse",
			text: sigs[3].rawText,
			at: sigs[3].receivedAt,
			from: "Kenji",
			interpreted: false,
			signalId: "sig_149"
		},
		{
			id: "tg_note_1",
			sourceId: "london-scalps",
			text: "London open, spreads are fine. Waiting on cable.",
			at: at(now, 11),
			from: "Priya",
			interpreted: false
		},
		{
			id: "tg_note_2",
			sourceId: "oil-wire",
			text: "Inventory later. No trade until the print.",
			at: at(now, 4),
			from: "Wire",
			interpreted: false
		}
	].sort((a, b) => b.at - a.at);
}
function seedCircuits(now, startEquity) {
	return {
		globalHalt: false,
		dailyLossTripped: false,
		consecutiveLosses: 1,
		tradesToday: 9,
		dayStartEquity: startEquity,
		realizedToday: 612.4,
		spreadPause: false,
		reason: null
	};
}
function createSeed(now = Date.now()) {
	const accounts = seedAccounts();
	const quotes = seedQuotes(now);
	const positions = seedPositions(now);
	const history = seedHistory(now);
	const start = accounts.reduce((s, a) => s + a.balance, 0);
	return {
		accounts,
		sources: SOURCE_SEED.map((s) => ({ ...s })),
		messages: seedMessages(now),
		signals: seedSignals(now),
		positions,
		orders: [{
			id: "ord_1",
			ticket: 18420012,
			accountId: "acc-master",
			signalId: null,
			signalNumber: 150,
			sourceId: "fx-masters",
			symbol: "GBPUSD",
			side: "buy",
			type: "buy_limit",
			lots: .7,
			price: 1.3098,
			sl: 1.3072,
			tp: 1.3164,
			tps: [{
				price: 1.3128,
				closePct: 50,
				hit: false
			}, {
				price: 1.3164,
				closePct: 100,
				hit: false
			}],
			createdAt: at(now, 9),
			magic: 150001,
			comment: "VOLT 0150 Volt Master"
		}],
		history,
		quotes,
		circuits: seedCircuits(now, start),
		telegram: {
			connected: true,
			connecting: false,
			user: "volt.desk",
			phone: "+44 •• •• 19"
		},
		settings: { ...SETTINGS },
		log: [
			{
				id: "ev_seed_1",
				at: at(now, 38),
				kind: "fill",
				text: "Filled BUY 0.36 XAUUSD @ 3681.40 · Volt Master",
				latencyMs: 11,
				signalNumber: 146
			},
			{
				id: "ev_seed_2",
				at: at(now, 38),
				kind: "copy",
				text: "Copied #0146 → Exness Copy 0.14 lots",
				signalNumber: 146
			},
			{
				id: "ev_seed_3",
				at: at(now, 22),
				kind: "fill",
				text: "Filled SELL 1.10 EURUSD @ 1.08502 · Volt Master",
				latencyMs: 8,
				signalNumber: 147
			},
			{
				id: "ev_seed_4",
				at: at(now, 6),
				kind: "parse",
				text: "Low confidence on Crypto Pulse — held",
				signalNumber: 149
			}
		],
		equity: Array.from({ length: 48 }, (_, i) => ({
			t: now - (47 - i) * 5 * 6e4,
			equity: start - 420 + Math.sin(i / 4) * 280 + i * 18
		})),
		nextSignalNumber: 150,
		nextTicket: 18420020,
		now
	};
}
var LS_KEY = "volt-desk-v1";
function mergeApply(s, r, extra) {
	return {
		positions: r.positions,
		orders: r.orders,
		signals: r.signals,
		accounts: r.accounts,
		history: r.history,
		circuits: r.circuits,
		nextTicket: r.nextTicket,
		log: [...r.events, ...s.log].slice(0, 160),
		lastEvents: r.events,
		...extra
	};
}
function persistPartial(s) {
	try {
		const snap = {
			accounts: s.accounts,
			sources: s.sources,
			messages: s.messages.slice(0, 80),
			signals: s.signals.slice(0, 80),
			positions: s.positions,
			orders: s.orders,
			history: s.history.slice(0, 200),
			circuits: s.circuits,
			telegram: s.telegram,
			settings: s.settings,
			nextSignalNumber: s.nextSignalNumber,
			nextTicket: s.nextTicket
		};
		localStorage.setItem(LS_KEY, JSON.stringify(snap));
	} catch {}
}
var engineTimer = null;
var telegramTimer = null;
var persistTimer = null;
var equityTimer = null;
var useDesk = create((set, get) => {
	return {
		...createSeed(Date.now()),
		running: false,
		lastEvents: [],
		ingestMessage: (sourceId, text, from, auto) => {
			const s = get();
			const source = s.sources.find((x) => x.id === sourceId);
			if (!source) return null;
			const t0 = performance.now();
			const msgId = `tg_${Date.now().toString(36)}`;
			const parseT0 = performance.now();
			const local = parseSignal(text);
			const parseMs = performance.now() - parseT0;
			const number = s.nextSignalNumber;
			const signal = {
				id: `sig_${number}`,
				number,
				sourceId,
				telegramMsgId: msgId,
				rawText: text,
				parsed: local.parsed ?? void 0,
				confidence: local.confidence,
				interpreter: "local",
				status: local.parsed && local.confidence >= .55 ? "interpreted" : "received",
				receivedAt: Date.now(),
				latency: {
					receiveMs: 0,
					parseMs,
					riskMs: 0,
					routeMs: 0,
					fillMs: 0,
					totalMs: performance.now() - t0
				},
				note: local.note
			};
			set({
				messages: [{
					id: msgId,
					sourceId,
					text,
					at: Date.now(),
					from,
					interpreted: Boolean(local.parsed && local.confidence >= .55),
					signalId: signal.id
				}, ...s.messages].slice(0, 80),
				signals: [signal, ...s.signals].slice(0, 80),
				nextSignalNumber: number + 1,
				log: [{
					id: `ev_${Date.now()}`,
					at: Date.now(),
					kind: "telegram",
					text: `${source.name} · ${signal.status} ${number}`,
					signalNumber: number,
					latencyMs: parseMs
				}, ...s.log].slice(0, 160)
			});
			if (auto && source.autoTrade && s.settings.autoInterpret && !s.circuits.globalHalt && local.parsed && local.confidence >= .82) queueMicrotask(() => get().executeSignal(signal.id));
			return signal;
		},
		interpretSignal: (signalId, parsed, confidence, interpreter) => {
			set((s) => ({
				signals: s.signals.map((sig) => sig.id === signalId ? {
					...sig,
					parsed,
					confidence,
					interpreter,
					status: "interpreted",
					note: interpreter === "grok" ? "Grok" : sig.note
				} : sig),
				messages: s.messages.map((m) => m.signalId === signalId ? {
					...m,
					interpreted: true
				} : m),
				settings: interpreter === "grok" ? {
					...s.settings,
					grokCallsUsed: s.settings.grokCallsUsed + 1
				} : s.settings
			}));
		},
		executeSignal: (signalId) => {
			const s = get();
			const signal = s.signals.find((x) => x.id === signalId);
			if (!signal?.parsed) return;
			const riskT0 = performance.now();
			const parsed = signal.parsed;
			const routeT0 = performance.now();
			const result = parsed.action === "open" ? applyOpen({
				...s,
				now: Date.now(),
				signals: s.signals.map((x) => x.id === signalId ? {
					...x,
					latency: {
						...x.latency,
						riskMs: routeT0 - riskT0
					}
				} : x)
			}, signal, parsed, s.settings) : applyManage({
				...s,
				now: Date.now()
			}, signal, parsed);
			const fillMs = performance.now() - routeT0;
			const signals = result.signals.map((x) => x.id === signalId ? {
				...x,
				latency: {
					...x.latency,
					routeMs: fillMs,
					fillMs,
					totalMs: x.latency.parseMs + fillMs
				}
			} : x);
			set(mergeApply(s, {
				...result,
				signals
			}));
		},
		ignoreSignal: (signalId) => {
			set((s) => ({ signals: s.signals.map((x) => x.id === signalId ? {
				...x,
				status: "ignored"
			} : x) }));
		},
		tick: () => {
			const s = get();
			const now = Date.now();
			const quotes = tickQuotes(s.quotes, now);
			let next = {
				...s,
				quotes,
				now
			};
			const matched = matchPendings(next);
			next = {
				...next,
				...matched,
				log: [...matched.events, ...next.log].slice(0, 160)
			};
			const managed = manageOpenPositions(next);
			next = {
				...next,
				...managed,
				log: [...managed.events, ...next.log].slice(0, 160)
			};
			const accounts = refreshAccounts(next.accounts, next.positions, quotes);
			const events = [...matched.events, ...managed.events];
			set({
				quotes,
				now,
				positions: next.positions,
				orders: next.orders,
				signals: next.signals,
				accounts,
				history: next.history,
				circuits: next.circuits,
				log: next.log,
				lastEvents: events.length ? events : s.lastEvents
			});
		},
		setHalt: (halt) => {
			set((s) => ({
				circuits: {
					...s.circuits,
					globalHalt: halt,
					reason: halt ? "Manual halt" : null
				},
				log: [{
					id: `ev_halt_${Date.now()}`,
					at: Date.now(),
					kind: "circuit",
					text: halt ? "Global halt engaged" : "Halt released"
				}, ...s.log].slice(0, 160)
			}));
		},
		setAccountFrozen: (id, frozen) => {
			set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? {
				...a,
				frozen
			} : a) }));
		},
		patchAccount: (id, patch) => {
			set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? {
				...a,
				...patch
			} : a) }));
		},
		addAccount: (account) => {
			set((s) => ({ accounts: [...s.accounts, account] }));
		},
		patchSource: (id, patch) => {
			set((s) => ({ sources: s.sources.map((x) => x.id === id ? {
				...x,
				...patch
			} : x) }));
		},
		patchSettings: (patch) => {
			set((s) => ({ settings: {
				...s.settings,
				...patch
			} }));
		},
		bulk: (mode) => {
			const s = get();
			const pnlOf = (p) => {
				const q = s.quotes[p.symbol];
				const px = p.side === "buy" ? q.bid : q.ask;
				p.symbol;
				const dir = p.side === "buy" ? 1 : -1;
				return (px - p.openPrice) * dir;
			};
			if (mode === "cancel_all") {
				set(mergeApply(s, cancelOrders(s, () => true)));
				return;
			}
			if (mode === "be_all") {
				set({
					positions: s.positions.map((p) => ({
						...p,
						sl: p.openPrice
					})),
					log: [{
						id: `ev_be_${Date.now()}`,
						at: Date.now(),
						kind: "modify",
						text: "Break-even all"
					}, ...s.log].slice(0, 160)
				});
				return;
			}
			const filter = mode === "close_winners" ? (p) => pnlOf(p) > 0 : mode === "close_losers" ? (p) => pnlOf(p) < 0 : () => true;
			const r = bulkClose({
				...s,
				now: Date.now()
			}, filter, mode);
			const extra = mode === "flatten" ? cancelOrders({
				...s,
				orders: r.orders,
				positions: r.positions
			}, () => true) : null;
			set(mergeApply(s, extra ? {
				...r,
				orders: extra.orders,
				events: [...r.events, ...extra.events]
			} : r));
		},
		closePosition: (id) => {
			const s = get();
			set(mergeApply(s, bulkClose({
				...s,
				now: Date.now()
			}, (p) => p.id === id, "manual close")));
		},
		modify: (id, patch) => {
			const s = get();
			set(mergeApply(s, modifyPosition(s, id, patch)));
		},
		cancelOrder: (id) => {
			const s = get();
			set(mergeApply(s, cancelOrders(s, (o) => o.id === id)));
		},
		placeManual: (args) => {
			const s = get();
			set(mergeApply(s, manualMarket({
				...s,
				now: Date.now()
			}, args)));
		},
		connectTelegram: (user, phone) => {
			set({ telegram: {
				connected: true,
				connecting: false,
				user,
				phone
			} });
		},
		disconnectTelegram: () => {
			set({ telegram: {
				connected: false,
				connecting: false,
				user: null,
				phone: null
			} });
		},
		resetDesk: () => {
			set({
				...createSeed(Date.now()),
				running: true,
				lastEvents: []
			});
			try {
				localStorage.removeItem(LS_KEY);
			} catch {}
		},
		consumeEvents: () => set({ lastEvents: [] })
	};
});
function pumpTelegram() {
	const s = useDesk.getState();
	if (!s.telegram.connected || s.circuits.globalHalt) return;
	const listening = s.sources.filter((x) => x.listening);
	if (!listening.length) return;
	const source = listening[Math.floor(Math.random() * listening.length)];
	const liveNums = s.signals.filter((x) => x.status === "live" || x.status === "managed").map((x) => x.number);
	const msg = generateMessage(source, s.quotes, liveNums);
	useDesk.getState().ingestMessage(source.id, msg.text, msg.from, true);
}
function startDesk() {
	const st = useDesk.getState();
	if (st.running) return;
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			useDesk.setState({
				...st,
				...parsed,
				quotes: st.quotes,
				now: Date.now(),
				running: true
			});
		} else useDesk.setState({ running: true });
	} catch {
		useDesk.setState({ running: true });
	}
	if (engineTimer) window.clearInterval(engineTimer);
	engineTimer = window.setInterval(() => useDesk.getState().tick(), 220);
	if (telegramTimer) window.clearInterval(telegramTimer);
	telegramTimer = window.setInterval(pumpTelegram, 14e3);
	if (persistTimer) window.clearInterval(persistTimer);
	persistTimer = window.setInterval(() => persistPartial(useDesk.getState()), 8e3);
	if (equityTimer) window.clearInterval(equityTimer);
	equityTimer = window.setInterval(() => {
		const s = useDesk.getState();
		const equity = s.accounts.reduce((sum, a) => sum + a.equity, 0);
		useDesk.setState({ equity: [...s.equity, {
			t: Date.now(),
			equity
		}].slice(-80) });
	}, 5e3);
}
function stopDesk() {
	if (engineTimer) window.clearInterval(engineTimer);
	if (telegramTimer) window.clearInterval(telegramTimer);
	if (persistTimer) window.clearInterval(persistTimer);
	if (equityTimer) window.clearInterval(equityTimer);
	engineTimer = telegramTimer = persistTimer = equityTimer = null;
	useDesk.setState({ running: false });
}
//#endregion
export { useDesk as _, formatPct as a, formatTime as c, pnlTone as d, sessionName as f, stopDesk as g, startDesk as h, formatLots as i, formatUsd as l, signalTag as m, formatClock as n, formatPrice as o, sideLabel as p, formatDateTime as r, formatSignedUsd as s, chatTitle as t, latencyLabel as u };
