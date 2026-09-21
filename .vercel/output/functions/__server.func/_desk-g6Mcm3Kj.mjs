import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { h as ArrowUpRight } from "./_libs/lucide-react.mjs";
import { t as Button } from "./_ssr/button-DVyFu7IL.mjs";
import { _ as useDesk, a as formatPct, c as formatTime, l as formatUsd, m as signalTag, u as latencyLabel } from "./_ssr/store-Cs07XZvE.mjs";
import { a as SignalNo, i as SideChip, n as PnlText, o as SignalStatusChip, t as Badge } from "./_ssr/bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./_ssr/card-SUTpxZ3e.mjs";
import { r as totals } from "./_ssr/stats-ILMdQlXr.mjs";
import { n as PositionsTable, t as ManualOrderButton } from "./_ssr/positions-table-CXGP-Z7-.mjs";
import { a as Area, c as Tooltip, r as YAxis, s as ResponsiveContainer, t as AreaChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_desk-g6Mcm3Kj.js
var import_jsx_runtime = require_jsx_runtime();
function EquityChart({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-36 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 0,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "eq",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#c5ccd8",
							stopOpacity: .28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#c5ccd8",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						hide: true,
						domain: ["dataMin - 80", "dataMax + 80"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "#151922",
							border: "1px solid #232833",
							borderRadius: 8,
							fontSize: 12
						},
						formatter: (v) => [formatUsd(v), "Equity"],
						labelFormatter: () => ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "equity",
						stroke: "#c5ccd8",
						fill: "url(#eq)",
						strokeWidth: 1.5
					})
				]
			})
		})
	});
}
function DeskPage() {
	const accounts = useDesk((s) => s.accounts);
	const positions = useDesk((s) => s.positions);
	useDesk((s) => s.quotes);
	const signals = useDesk((s) => s.signals);
	const history = useDesk((s) => s.history);
	const circuits = useDesk((s) => s.circuits);
	const equitySeries = useDesk((s) => s.equity);
	const log = useDesk((s) => s.log);
	const now = useDesk((s) => s.now);
	const executeSignal = useDesk((s) => s.executeSignal);
	const equity = accounts.reduce((s, a) => s + a.equity, 0);
	const floating = equity - accounts.reduce((s, a) => s + a.balance, 0);
	const hist = totals(history);
	const lastFill = log.find((e) => e.kind === "fill");
	const liveSignals = signals.filter((s) => s.status !== "ignored").slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
						children: "Command"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-fg",
						children: "Desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted",
						children: "Numbered signals in, sized by risk, routed to master and followers. Paper engine is live."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualOrderButton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/telegram",
							children: "Open Telegram"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Combined equity",
						value: formatUsd(equity),
						hint: `${accounts.filter((a) => a.connected).length} terminals`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Floating",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, {
							value: floating,
							className: "text-lg"
						}),
						hint: `${positions.length} open`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Realized today",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, {
							value: circuits.realizedToday,
							className: "text-lg"
						}),
						hint: `${circuits.tradesToday} tickets`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Win rate",
						value: formatPct(hist.winRate),
						hint: `${hist.trades} closed`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Equity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted tabular",
						children: formatUsd(equity)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquityChart, { data: equitySeries })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Circuits" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: circuits.globalHalt ? "sell" : "live",
					children: circuits.globalHalt ? "halted" : "armed"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Daily P/L",
							v: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: circuits.realizedToday })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Consecutive losses",
							v: `${circuits.consecutiveLosses}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Trades today",
							v: `${circuits.tradesToday}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Last fill",
							v: lastFill ? latencyLabel(lastFill.latencyMs ?? 0) : "—"
						}),
						circuits.reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-sm bg-sell/10 px-2 py-1.5 text-xs text-sell",
							children: circuits.reason
						}) : null
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 xl:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "xl:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Open positions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/book",
						className: "inline-flex items-center gap-1 text-xs text-muted hover:text-fg",
						children: ["Book ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3" })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionsTable, { rows: positions })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "xl:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Signal tape" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signals",
						className: "text-xs text-muted hover:text-fg",
						children: "All"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: liveSignals.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg-subtle p-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: s.number }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalStatusChip, { status: s.status })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-muted",
									children: [
										s.parsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideChip, { side: s.parsed.side }) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.parsed?.symbol ?? "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto font-mono tabular",
											children: formatTime(s.receivedAt, now)
										})
									]
								}),
								s.status === "interpreted" || s.status === "received" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "mt-2 w-full",
									onClick: () => executeSignal(s.id),
									disabled: !s.parsed,
									children: ["Route ", signalTag(s.number)]
								}) : null
							]
						}, s.id))
					})]
				})]
			})
		]
	});
}
function Kpi({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-3 md:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-medium uppercase tracking-wide text-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-lg tabular text-fg",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs tabular text-fg",
			children: v
		})]
	});
}
//#endregion
export { DeskPage as component };
