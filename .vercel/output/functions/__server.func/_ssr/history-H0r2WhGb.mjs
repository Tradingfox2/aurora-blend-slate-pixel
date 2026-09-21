import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useDesk, i as formatLots, l as formatUsd, o as formatPrice, r as formatDateTime } from "./store-Cs07XZvE.mjs";
import { a as SignalNo, i as SideChip, n as PnlText } from "./bits-DXZvd2xW.mjs";
import { t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-H0r2WhGb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const history = useDesk((s) => s.history);
	const accounts = useDesk((s) => s.accounts);
	const sources = useDesk((s) => s.sources);
	const [q, setQ] = (0, import_react.useState)("");
	const rows = (0, import_react.useMemo)(() => history.filter((h) => {
		const acc = accounts.find((a) => a.id === h.accountId)?.name ?? "";
		const src = sources.find((s) => s.id === h.sourceId)?.name ?? "";
		return `${h.ticket} ${h.symbol} ${h.signalNumber ?? ""} ${acc} ${src}`.toLowerCase().includes(q.toLowerCase());
	}), [
		history,
		q,
		accounts,
		sources
	]);
	const net = rows.reduce((s, r) => s + r.profit, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Archive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "History"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Closed tickets with signal numbers intact."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: ["Net ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: formatUsd(net)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Filter",
					className: "w-48"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-x-auto p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[860px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-b border-border",
						children: [
							"Closed",
							"Ticket",
							"Sig",
							"Acct",
							"Source",
							"Symbol",
							"Side",
							"Lots",
							"Open",
							"Close",
							"P/L",
							"Note"
						].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: h
						}, h))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs text-muted",
							children: formatDateTime(h.closeTime)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs",
							children: h.ticket
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: h.signalNumber })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-xs text-muted",
							children: accounts.find((a) => a.id === h.accountId)?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-xs text-muted",
							children: sources.find((s) => s.id === h.sourceId)?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: h.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideChip, { side: h.side })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono tabular",
							children: formatLots(h.lots)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs",
							children: formatPrice(h.symbol, h.openPrice)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs",
							children: formatPrice(h.symbol, h.closePrice)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: h.profit })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-xs text-muted",
							children: h.comment
						})
					]
				}, h.id)) })]
			})
		})]
	});
}
//#endregion
export { HistoryPage as component };
