import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { t as Switch } from "./switch-Dd7KsvtD.mjs";
import { _ as useDesk } from "./store-Cs07XZvE.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-j-VQ0J2f.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const settings = useDesk((s) => s.settings);
	const patchSettings = useDesk((s) => s.patchSettings);
	const resetDesk = useDesk((s) => s.resetDesk);
	const telegram = useDesk((s) => s.telegram);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[720px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Desk"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Hot path stays in-memory. Grok is opt-in and capped so a noisy channel cannot burn quota."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Interpretation" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Auto-parse structured signals",
						hint: "Regex engine, typically under 1ms. Routes when confidence is high and the channel is on auto-trade.",
						checked: settings.autoInterpret,
						onChange: (autoInterpret) => patchSettings({ autoInterpret })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Grok fallback on messy text",
						hint: "Only when you press Interpret with Grok. Session cap applies.",
						checked: settings.grokFallback,
						onChange: (grokFallback) => patchSettings({ grokFallback })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Grok used ",
							settings.grokCallsUsed,
							" / ",
							settings.grokCallCap,
							" this session"
						]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Trade management" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					title: "Move SL to break-even after TP1",
					hint: "Remaining size is protected once the first target pays.",
					checked: settings.beAfterTp1,
					onChange: (beAfterTp1) => patchSettings({ beAfterTp1 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1 text-xs text-muted",
					children: ["Default trailing (pips, empty = off)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-9 max-w-40",
						value: settings.defaultTrailingPips ?? "",
						onChange: (e) => patchSettings({ defaultTrailingPips: e.target.value === "" ? null : Number(e.target.value) })
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Session" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Telegram ",
						telegram.connected ? `connected as @${telegram.user}` : "offline",
						". This preview runs a live paper tape; a production install attaches GramJS (user session) and a local MT4/MT5 expert for real fills."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: resetDesk,
					children: "Reset paper desk"
				})
			] })
		]
	});
}
function Row({ title, hint, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-fg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-xs text-muted",
			children: hint
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
//#endregion
export { SettingsPage as component };
