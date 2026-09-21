import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Switch } from "./switch-Dd7KsvtD.mjs";
import { _ as useDesk, a as formatPct, c as formatTime } from "./store-Cs07XZvE.mjs";
import { n as PnlText, t as Badge } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { n as providerStats } from "./stats-ILMdQlXr.mjs";
import { c as Tooltip, i as XAxis, n as BarChart, o as Bar, r as YAxis, s as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/providers-Dngq8zIU.js
var import_jsx_runtime = require_jsx_runtime();
function ProvidersPage() {
	const sources = useDesk((s) => s.sources);
	const history = useDesk((s) => s.history);
	const now = useDesk((s) => s.now);
	const patchSource = useDesk((s) => s.patchSource);
	const stats = providerStats(sources, history);
	const chart = stats.filter((s) => s.trades > 0).map((s) => ({
		name: s.name.replace(/ .*/, ""),
		profit: Number(s.profit.toFixed(2))
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Scoreboard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "Providers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Ranked on closed tickets from this desk. Auto-trade is per channel, independent of the score."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Net by source" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-52",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chart,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "name",
								stroke: "#5c6370",
								fontSize: 11,
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "#5c6370",
								fontSize: 11,
								tickLine: false,
								axisLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								background: "#151922",
								border: "1px solid #232833",
								borderRadius: 8,
								fontSize: 12
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "profit",
								fill: "#c5ccd8",
								radius: [
									4,
									4,
									0,
									0
								]
							})
						]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-bg-elevated shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[10px] uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border",
							children: [
								"Provider",
								"Trades",
								"Win",
								"Net",
								"PF",
								"Avg win",
								"Last",
								"Auto"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: h
							}, h))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: stats.map((s, i) => {
						const src = sources.find((x) => x.id === s.sourceId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-subtle",
												children: String(i + 1).padStart(2, "0")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: s.name
											}),
											i === 0 && s.trades ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "accent",
												children: "lead"
											}) : null
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono tabular",
									children: s.trades
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono tabular",
									children: formatPct(s.winRate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: s.profit })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono tabular text-muted",
									children: s.profitFactor.toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: s.avgWin })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono text-xs text-muted",
									children: s.lastAt ? formatTime(s.lastAt, now) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: Boolean(src?.autoTrade),
										onCheckedChange: (v) => patchSource(s.sourceId, {
											autoTrade: v,
											listening: v || src?.listening
										})
									})
								})
							]
						}, s.sourceId);
					}) })]
				})
			})
		]
	});
}
//#endregion
export { ProvidersPage as component };
