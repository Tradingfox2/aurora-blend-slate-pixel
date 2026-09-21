import { u as pnlUsd } from "./parser-Cq9aCLaR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-ILMdQlXr.js
function providerStats(sources, history) {
	return sources.map((src) => {
		const rows = history.filter((h) => h.sourceId === src.id);
		const wins = rows.filter((r) => r.profit > 0);
		const losses = rows.filter((r) => r.profit < 0);
		const grossWin = wins.reduce((s, r) => s + r.profit, 0);
		const grossLoss = Math.abs(losses.reduce((s, r) => s + r.profit, 0));
		return {
			sourceId: src.id,
			name: src.name,
			trades: rows.length,
			wins: wins.length,
			winRate: rows.length ? wins.length / rows.length : 0,
			profit: rows.reduce((s, r) => s + r.profit, 0),
			profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 9.9 : 0,
			avgWin: wins.length ? grossWin / wins.length : 0,
			avgLoss: losses.length ? losses.reduce((s, r) => s + r.profit, 0) / losses.length : 0,
			lastAt: rows[0]?.closeTime ?? null
		};
	}).sort((a, b) => b.profit - a.profit);
}
function openPnl(p, quotes) {
	const q = quotes[p.symbol];
	const px = p.side === "buy" ? q.bid : q.ask;
	return pnlUsd(p.symbol, p.side, p.openPrice, px, p.lots) - p.commission;
}
function totals(history) {
	const profit = history.reduce((s, r) => s + r.profit, 0);
	const wins = history.filter((h) => h.profit > 0).length;
	return {
		profit,
		trades: history.length,
		winRate: history.length ? wins / history.length : 0,
		wins
	};
}
//#endregion
export { providerStats as n, totals as r, openPnl as t };
