import { i as __toESM } from "./_runtime.mjs";
import { r as SYMBOL_IDS } from "./_ssr/parser-Cq9aCLaR.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { a as Settings, c as LayoutGrid, d as CircuitBoard, g as Activity, i as Shield, l as History, m as BookOpen, n as Users, o as Radio, s as Menu, t as X } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, r as DialogContent, t as Dialog } from "./_libs/@radix-ui/react-dialog+[...].mjs";
import { n as cn } from "./_ssr/router-CDz7sFNU.mjs";
import { t as Button } from "./_ssr/button-DVyFu7IL.mjs";
import { t as Switch } from "./_ssr/switch-Dd7KsvtD.mjs";
import { _ as useDesk, a as formatPct, f as sessionName, g as stopDesk, h as startDesk, n as formatClock, o as formatPrice, s as formatSignedUsd } from "./_ssr/store-Cs07XZvE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_desk-EbncDllJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VoltMark({ className, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "relative flex size-6 items-center justify-center rounded-sm bg-accent/12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-[2px] bg-accent" })
		}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-[15px] font-semibold tracking-[-0.04em] text-fg",
			children: "VOLT"
		}) : null]
	});
}
var Sheet = Dialog;
function SheetContent({ className, children, side = "left", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-72 flex-col bg-bg-elevated p-4 shadow-[var(--shadow-border)]", side === "left" ? "inset-y-0 left-0" : "inset-y-0 right-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-3 top-3 rounded-sm p-1 text-muted hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function Ticker() {
	const quotes = useDesk((s) => s.quotes);
	const items = [...SYMBOL_IDS, ...SYMBOL_IDS];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden h-7 overflow-hidden border-t border-border bg-bg-elevated md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tape-scroll flex w-max items-center gap-8 px-4",
			children: items.map((id, i) => {
				const q = quotes[id];
				const up = q.change >= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 font-mono text-[11px] tabular",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: formatPrice(id, q.bid)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn(up ? "text-buy" : "text-sell"),
							children: formatPct(q.change)
						})
					]
				}, `${id}-${i}`);
			})
		})
	});
}
var NAV = [
	{
		to: "/",
		label: "Desk",
		icon: LayoutGrid
	},
	{
		to: "/telegram",
		label: "Telegram",
		icon: Radio
	},
	{
		to: "/signals",
		label: "Signals",
		icon: Activity
	},
	{
		to: "/book",
		label: "Positions",
		icon: BookOpen
	},
	{
		to: "/accounts",
		label: "Accounts",
		icon: Users
	},
	{
		to: "/providers",
		label: "Providers",
		icon: Shield
	},
	{
		to: "/history",
		label: "History",
		icon: History
	},
	{
		to: "/risk",
		label: "Circuits",
		icon: CircuitBoard
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function NavLinks({ onNavigate, compact }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-0.5",
		children: NAV.map((item) => {
			const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				className: cn("flex h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-150", active ? "bg-bg-subtle text-fg" : "text-muted hover:bg-bg-subtle/60 hover:text-fg", compact && "justify-center px-0"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), !compact ? item.label : null]
			}, item.to);
		})
	});
}
function AppShell() {
	const [live, setLive] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const now = useDesk((s) => s.now);
	const accounts = useDesk((s) => s.accounts);
	const circuits = useDesk((s) => s.circuits);
	const telegram = useDesk((s) => s.telegram);
	const lastEvents = useDesk((s) => s.lastEvents);
	const setHalt = useDesk((s) => s.setHalt);
	const consumeEvents = useDesk((s) => s.consumeEvents);
	const equity = accounts.reduce((sum, a) => sum + a.equity, 0);
	const floating = accounts.reduce((sum, a) => sum + (a.equity - a.balance), 0);
	(0, import_react.useEffect)(() => {
		startDesk();
		setLive(true);
		return () => stopDesk();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!lastEvents.length) return;
		for (const ev of lastEvents) if (ev.kind === "fill") toast(ev.text, { description: ev.latencyMs != null ? `${ev.latencyMs.toFixed(1)}ms` : void 0 });
		else if (ev.kind === "reject" || ev.kind === "circuit") toast(ev.text);
		consumeEvents();
	}, [lastEvents, consumeEvents]);
	if (!live) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg text-fg" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border bg-bg/95 px-3 backdrop-blur-sm md:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						className: "md:hidden",
						onClick: () => setOpen(true),
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoltMark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden font-mono text-[10px] uppercase tracking-[0.18em] text-subtle sm:inline",
						children: sessionName(now)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-3 md:gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden items-center gap-1.5 text-xs text-muted sm:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", telegram.connected ? "bg-buy" : "bg-subtle") }),
									"TG ",
									telegram.connected ? "session" : "offline"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden font-mono text-xs tabular text-muted lg:inline",
								children: formatClock(now)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden flex-col items-end sm:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-wide text-subtle",
									children: "Equity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs tabular text-fg",
									children: formatSignedUsd(equity).replace("+", "")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden flex-col items-end md:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[10px] uppercase tracking-wide text-subtle",
									children: "Float"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono text-xs tabular", floating >= 0 ? "text-buy" : "text-sell"),
									children: formatSignedUsd(floating)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Halt"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: circuits.globalHalt,
									onCheckedChange: setHalt,
									"aria-label": "Global halt"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sticky top-12 hidden h-[calc(100dvh-3rem-28px)] w-52 shrink-0 flex-col border-r border-border p-3 md:flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto rounded-md bg-bg-subtle p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-medium uppercase tracking-wide text-subtle",
								children: "Engine"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs tabular text-muted",
								children: "in-memory · 220ms"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] leading-snug text-subtle",
								children: "Local parser first. Grok only on demand."
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1 pb-16 md:pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-border bg-bg md:hidden",
				children: [NAV.slice(0, 4).map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
					}, item.to);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-muted",
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" }), "More"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "pt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoltMark, { className: "mb-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onNavigate: () => setOpen(false) })]
				})
			})
		]
	});
}
var SplitComponent = AppShell;
//#endregion
export { SplitComponent as component };
