import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { t as Switch } from "./switch-Dd7KsvtD.mjs";
import { _ as useDesk, l as formatUsd } from "./store-Cs07XZvE.mjs";
import { n as PnlText } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-Cl9ReHVy.js
var import_jsx_runtime = require_jsx_runtime();
function RiskPage() {
	const circuits = useDesk((s) => s.circuits);
	const accounts = useDesk((s) => s.accounts);
	const setHalt = useDesk((s) => s.setHalt);
	const patchAccount = useDesk((s) => s.patchAccount);
	const setAccountFrozen = useDesk((s) => s.setAccountFrozen);
	const bulk = useDesk((s) => s.bulk);
	const spent = Math.max(0, -Math.min(0, circuits.realizedToday));
	const cap = accounts[0] ? accounts[0].risk.maxDailyLossPct / 100 * circuits.dayStartEquity : 1;
	const used = Math.min(1, spent / cap);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1100px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Protection"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "Circuits"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Halt is the panic switch. Daily loss, consecutive losses, spread, and Friday cutoff sit in front of every fill."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Global halt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: circuits.globalHalt,
							onCheckedChange: setHalt
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Blocks new orders. Open risk stays until you flatten."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							variant: "outline",
							size: "sm",
							onClick: () => bulk("flatten"),
							children: "Flatten book"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mb-3",
							children: "Daily loss"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 overflow-hidden rounded-full bg-bg-subtle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-sell",
								style: { width: `${Math.round(used * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-sm tabular",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: circuits.realizedToday }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									" / ",
									formatUsd(cap),
									" cap"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: circuits.dailyLossTripped ? "Tripped" : "Armed"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mb-3",
							children: "Streak"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-2xl tabular",
							children: circuits.consecutiveLosses
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								"consecutive losses · ",
								circuits.tradesToday,
								" tickets today"
							]
						})
					] })
				]
			}),
			accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: a.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				checked: !a.frozen,
				onCheckedChange: (v) => setAccountFrozen(a.id, !v)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max daily loss %",
						value: a.risk.maxDailyLossPct,
						onChange: (maxDailyLossPct) => patchAccount(a.id, { risk: {
							...a.risk,
							maxDailyLossPct
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max open lots",
						value: a.risk.maxOpenLots,
						onChange: (maxOpenLots) => patchAccount(a.id, { risk: {
							...a.risk,
							maxOpenLots
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max trades / day",
						value: a.risk.maxTradesPerDay,
						onChange: (maxTradesPerDay) => patchAccount(a.id, { risk: {
							...a.risk,
							maxTradesPerDay
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max consecutive L",
						value: a.risk.maxConsecutiveLosses,
						onChange: (maxConsecutiveLosses) => patchAccount(a.id, { risk: {
							...a.risk,
							maxConsecutiveLosses
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max spread (pips)",
						value: a.risk.maxSpreadPips,
						onChange: (maxSpreadPips) => patchAccount(a.id, { risk: {
							...a.risk,
							maxSpreadPips
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Friday cutoff (UTC)",
						value: a.risk.fridayCutoffHour ?? 21,
						onChange: (fridayCutoffHour) => patchAccount(a.id, { risk: {
							...a.risk,
							fridayCutoffHour
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "col-span-2 flex items-center gap-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: a.risk.flattenOnTrip,
							onCheckedChange: (flattenOnTrip) => patchAccount(a.id, { risk: {
								...a.risk,
								flattenOnTrip
							} })
						}), "Flatten this account if daily loss trips"]
					})
				]
			})] }, a.id))
		]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "space-y-1 text-xs text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			className: "h-9",
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
//#endregion
export { RiskPage as component };
