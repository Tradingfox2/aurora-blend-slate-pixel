import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { _ as useDesk, i as formatLots } from "./store-Cs07XZvE.mjs";
import { a as SignalNo, i as SideChip, r as Price } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { n as PositionsTable, t as ManualOrderButton } from "./positions-table-CXGP-Z7-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-Cw4pUbtY.js
var import_jsx_runtime = require_jsx_runtime();
var BULK = [
	{
		mode: "close_all",
		label: "Close all"
	},
	{
		mode: "close_winners",
		label: "Close winners"
	},
	{
		mode: "close_losers",
		label: "Close losers"
	},
	{
		mode: "be_all",
		label: "BE all"
	},
	{
		mode: "flatten",
		label: "Flatten"
	},
	{
		mode: "cancel_all",
		label: "Cancel pendings"
	}
];
function BookPage() {
	const positions = useDesk((s) => s.positions);
	const orders = useDesk((s) => s.orders);
	const accounts = useDesk((s) => s.accounts);
	const bulk = useDesk((s) => s.bulk);
	const cancelOrder = useDesk((s) => s.cancelOrder);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
						children: "Execution"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
						children: "Positions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Live tickets, pendings, and bulk actions across every terminal."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualOrderButton, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: BULK.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => bulk(b.mode),
					children: b.label
				}, b.mode))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: ["Open · ", positions.length] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PositionsTable, { rows: positions })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: ["Pending · ", orders.length] }) }), orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-6 text-center text-sm text-muted",
				children: "No pending orders."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[10px] uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border",
							children: [
								"Ticket",
								"Acct",
								"Sig",
								"Symbol",
								"Type",
								"Lots",
								"Price",
								"SL",
								"TP",
								""
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: h
							}, h))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: orders.map((o) => {
						const acc = accounts.find((a) => a.id === o.accountId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono text-xs",
									children: o.ticket
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 text-xs text-muted",
									children: acc?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: o.signalNumber })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: o.symbol
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideChip, { side: o.side }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-xs text-muted",
										children: o.type.replace("_", " ")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular",
									children: formatLots(o.lots)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
										symbol: o.symbol,
										value: o.price
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono text-xs text-muted",
									children: o.sl ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono text-xs text-muted",
									children: o.tp ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => cancelOrder(o.id),
										children: "Cancel"
									})
								})
							]
						}, o.id);
					}) })]
				})
			})] })
		]
	});
}
//#endregion
export { BookPage as component };
