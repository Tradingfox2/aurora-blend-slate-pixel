import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { t as Switch } from "./switch-Dd7KsvtD.mjs";
import { _ as useDesk, l as formatUsd } from "./store-Cs07XZvE.mjs";
import { n as PnlText, t as Badge } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogDescription, s as Label, t as Dialog } from "./dialog-BwaFZm3s.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DITEi46k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-Dr20tRWE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountsPage() {
	const accounts = useDesk((s) => s.accounts);
	const patchAccount = useDesk((s) => s.patchAccount);
	const setAccountFrozen = useDesk((s) => s.setAccountFrozen);
	const addAccount = useDesk((s) => s.addAccount);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Routing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "Accounts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted",
					children: "Masters receive signals. Followers copy fills with lot multiplier, reverse, and equity scaling. Independents trade the same tape on their own risk."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddAccountDialog, {
				open,
				onOpenChange: setOpen,
				onAdd: addAccount
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2",
			children: accounts.map((a) => {
				const float = a.equity - a.balance;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: a.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-muted",
						children: [
							a.broker,
							" · ",
							a.platform,
							" · ",
							a.server,
							" · ",
							a.login
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: a.connected ? "live" : "outline",
							children: a.connected ? `${a.pingMs}ms` : "offline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "accent",
							children: a.role
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								k: "Balance",
								v: formatUsd(a.balance)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								k: "Equity",
								v: formatUsd(a.equity)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								k: "Float",
								v: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnlText, { value: float })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: !a.frozen,
								onCheckedChange: (v) => setAccountFrozen(a.id, !v)
							}), "Trading"]
						}), a.role !== "follower" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: a.receivesSignals,
								onCheckedChange: (v) => patchAccount(a.id, { receivesSignals: v })
							}), "Take signals"]
						}) : null]
					}),
					a.copy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg-subtle p-3 text-xs text-muted",
						children: [
							"Copy of ",
							accounts.find((m) => m.id === a.copy?.masterId)?.name ?? a.copy.masterId,
							" · ×",
							a.copy.multiplier,
							a.copy.reverse ? " · reverse" : "",
							" ",
							a.copy.equityScale ? " · equity scale" : "",
							" · max ",
							a.copy.maxLot,
							" lots",
							a.copy.delayMs ? ` · ${a.copy.delayMs}ms delay` : ""
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskEditor, {
						account: a,
						onChange: (risk) => patchAccount(a.id, { risk })
					})
				] }, a.id);
			})
		})]
	});
}
function Metric({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[10px] uppercase tracking-wide text-subtle",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5 font-mono text-sm tabular",
		children: v
	})] });
}
function RiskEditor({ account, onChange }) {
	const r = account.risk;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "space-y-1 text-xs text-muted",
				children: ["Mode", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-9 w-full rounded-sm bg-bg-subtle px-2 text-fg shadow-[var(--shadow-border)]",
					value: r.mode,
					onChange: (e) => onChange({
						...r,
						mode: e.target.value
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "percent",
							children: "Percent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "fixed_lots",
							children: "Fixed lots"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "fixed_pips",
							children: "Fixed pips"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "rr",
							children: "RR"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
				label: "Risk %",
				value: r.percent,
				onChange: (percent) => onChange({
					...r,
					percent
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
				label: "Fixed lots",
				value: r.fixedLots,
				onChange: (fixedLots) => onChange({
					...r,
					fixedLots
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
				label: "Daily loss %",
				value: r.maxDailyLossPct,
				onChange: (maxDailyLossPct) => onChange({
					...r,
					maxDailyLossPct
				})
			})
		]
	});
}
function Num({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "space-y-1 text-xs text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: "h-9",
			type: "number",
			step: "0.01",
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
function AddAccountDialog({ open, onOpenChange, onAdd }) {
	const accounts = useDesk((s) => s.accounts);
	const [name, setName] = (0, import_react.useState)("New terminal");
	const [platform, setPlatform] = (0, import_react.useState)("MT5");
	const [role, setRole] = (0, import_react.useState)("independent");
	const [broker, setBroker] = (0, import_react.useState)("Broker");
	const [login, setLogin] = (0, import_react.useState)("100000");
	const [balance, setBalance] = (0, import_react.useState)("10000");
	const master = accounts.find((a) => a.role === "master");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				children: "Add account"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Attach terminal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Paper credentials only. Live bridges attach to the local MT4/MT5 expert." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Broker",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: broker,
							onChange: (e) => setBroker(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Platform",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: platform,
							onValueChange: (v) => setPlatform(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "MT4",
								children: "MT4"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "MT5",
								children: "MT5"
							})] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Role",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: role,
							onValueChange: (v) => setRole(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "independent",
									children: "Independent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "master",
									children: "Master"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "follower",
									children: "Follower"
								})
							] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Login",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: login,
							onChange: (e) => setLogin(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Balance",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: balance,
							onChange: (e) => setBalance(e.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-2 w-full",
				onClick: () => {
					const id = `acc_${Date.now().toString(36)}`;
					const bal = Number(balance) || 1e4;
					onAdd({
						id,
						name,
						platform,
						broker,
						server: `${broker.replace(/\s/g, "")}-Live`,
						login,
						role,
						currency: "USD",
						leverage: 200,
						balance: bal,
						equity: bal,
						margin: 0,
						connected: true,
						pingMs: 16,
						frozen: false,
						receivesSignals: role !== "follower",
						risk: accounts[0].risk,
						copy: role === "follower" && master ? {
							masterId: master.id,
							multiplier: .5,
							reverse: false,
							equityScale: false,
							maxLot: 2,
							delayMs: 0,
							symbolSuffix: ""
						} : void 0
					});
					onOpenChange(false);
				},
				children: "Attach"
			})
		] })]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { AccountsPage as component };
