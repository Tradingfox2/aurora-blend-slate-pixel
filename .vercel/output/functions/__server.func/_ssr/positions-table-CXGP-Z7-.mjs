import { i as __toESM } from "../_runtime.mjs";
import { r as SYMBOL_IDS } from "./parser-Cq9aCLaR.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as cn } from "./router-CDz7sFNU.mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { _ as useDesk, i as formatLots, o as formatPrice } from "./store-Cs07XZvE.mjs";
import { a as SignalNo, i as SideChip, n as PnlText, r as Price } from "./bits-DXZvd2xW.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogDescription, s as Label, t as Dialog } from "./dialog-BwaFZm3s.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DITEi46k.mjs";
import { t as openPnl } from "./stats-ILMdQlXr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/positions-table-CXGP-Z7-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ManualOrderButton() {
	const accounts = useDesk((s) => s.accounts);
	const placeManual = useDesk((s) => s.placeManual);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [accountId, setAccountId] = (0, import_react.useState)(accounts[0]?.id ?? "");
	const [symbol, setSymbol] = (0, import_react.useState)("XAUUSD");
	const [side, setSide] = (0, import_react.useState)("buy");
	const [lots, setLots] = (0, import_react.useState)("0.10");
	const [sl, setSl] = (0, import_react.useState)("");
	const [tp, setTp] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				children: "Manual order"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Manual market order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Fires on the selected terminal at the current bid/ask." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: accountId,
							onValueChange: setAccountId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: a.id,
								children: a.name
							}, a.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Symbol" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: symbol,
							onValueChange: (v) => setSymbol(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SYMBOL_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: id,
								children: id
							}, id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Side" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: side,
							onValueChange: (v) => setSide(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "buy",
								children: "Buy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "sell",
								children: "Sell"
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lots" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: lots,
							onChange: (e) => setLots(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Stop loss" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: sl,
							onChange: (e) => setSl(e.target.value),
							placeholder: "optional"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Take profit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tp,
							onChange: (e) => setTp(e.target.value),
							placeholder: "optional"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: side === "buy" ? "buy" : "sell",
					onClick: () => {
						placeManual({
							accountId,
							symbol,
							side,
							lots: Number(lots) || .01,
							sl: sl ? Number(sl) : void 0,
							tp: tp ? Number(tp) : void 0
						});
						setOpen(false);
					},
					children: ["Send ", side.toUpperCase()]
				})]
			})
		] })]
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-44 overflow-hidden rounded-md bg-popover p-1 shadow-[var(--shadow-border),var(--shadow-float)]", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-fg outline-none data-[highlighted]:bg-bg-subtle", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
function PositionsTable({ rows }) {
	const quotes = useDesk((s) => s.quotes);
	const accounts = useDesk((s) => s.accounts);
	const closePosition = useDesk((s) => s.closePosition);
	const modify = useDesk((s) => s.modify);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [sl, setSl] = (0, import_react.useState)("");
	const [tp, setTp] = (0, import_react.useState)("");
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 py-8 text-center text-sm text-muted",
		children: "No open positions."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-[10px] uppercase tracking-wide text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-border",
					children: [
						"Ticket",
						"Acct",
						"Sig",
						"Symbol",
						"Side",
						"Lots",
						"Open",
						"Mark",
						"SL",
						"TP",
						"P/L",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-2 py-2 font-medium",
						children: h
					}, h))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((p) => {
				const q = quotes[p.symbol];
				const mark = p.side === "buy" ? q.bid : q.ask;
				const acc = accounts.find((a) => a.id === p.accountId);
				const pnl = openPnl(p, quotes);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/70 hover:bg-bg-subtle/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 font-mono text-xs tabular text-muted",
							children: p.ticket
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 text-xs text-muted",
							children: acc?.name ?? p.accountId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: p.signalNumber })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 font-medium",
							children: p.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideChip, { side: p.side })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 font-mono tabular",
							children: formatLots(p.lots)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
								symbol: p.symbol,
								value: p.openPrice
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
								symbol: p.symbol,
								value: mark
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 font-mono text-xs tabular text-muted",
							children: edit === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: sl,
								onChange: (e) => setSl(e.target.value),
								className: "h-8 w-24"
							}) : p.sl ? formatPrice(p.symbol, p.sl) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 font-mono text-xs tabular text-muted",
							children: edit === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tp,
								onChange: (e) => setTp(e.target.value),
								className: "h-8 w-24"
							}) : p.tp ? formatPrice(p.symbol, p.tp) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: pnl })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-2 py-2 text-right",
							children: edit === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => {
									modify(p.id, {
										sl: sl ? Number(sl) : p.sl,
										tp: tp ? Number(tp) : p.tp
									});
									setEdit(null);
								},
								children: "Save"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon-sm",
									"aria-label": "Position actions",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: () => {
											setEdit(p.id);
											setSl(p.sl?.toString() ?? "");
											setTp(p.tp?.toString() ?? "");
										},
										children: "Modify SL/TP"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: () => modify(p.id, { sl: p.openPrice }),
										children: "Break even"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: () => closePosition(p.id),
										children: "Close"
									})
								]
							})] })
						})
					]
				}, p.id);
			}) })]
		})
	});
}
//#endregion
export { PositionsTable as n, ManualOrderButton as t };
