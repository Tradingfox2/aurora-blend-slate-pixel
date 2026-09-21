import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn } from "./router-CDz7sFNU.mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { t as Switch } from "./switch-Dd7KsvtD.mjs";
import { _ as useDesk, c as formatTime, t as chatTitle } from "./store-Cs07XZvE.mjs";
import { a as SignalNo, o as SignalStatusChip, t as Badge } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, s as Label, t as Dialog } from "./dialog-BwaFZm3s.mjs";
import { t as interpretWithGrok } from "./interpret-D089Sat-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-Bb-NXXu5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-24 w-full rounded-sm bg-bg-subtle px-3 py-2 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)]", "disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
function TelegramPage() {
	const telegram = useDesk((s) => s.telegram);
	const sources = useDesk((s) => s.sources);
	const messages = useDesk((s) => s.messages);
	const signals = useDesk((s) => s.signals);
	const now = useDesk((s) => s.now);
	const patchSource = useDesk((s) => s.patchSource);
	const connectTelegram = useDesk((s) => s.connectTelegram);
	const disconnectTelegram = useDesk((s) => s.disconnectTelegram);
	const ingestMessage = useDesk((s) => s.ingestMessage);
	const interpretSignal = useDesk((s) => s.interpretSignal);
	const executeSignal = useDesk((s) => s.executeSignal);
	const settings = useDesk((s) => s.settings);
	const [connectOpen, setConnectOpen] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)("phone");
	const [phone, setPhone] = (0, import_react.useState)("+44 7700 900019");
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("XAUUSD BUY NOW\nEntry 3684.50\nSL 3676.20\nTP1 3692.00\nTP2 3701.40");
	const [sourceId, setSourceId] = (0, import_react.useState)(sources[0]?.id ?? "gold-sniper");
	const [grokBusy, setGrokBusy] = (0, import_react.useState)(null);
	async function runGrok(signalId, text) {
		if (settings.grokCallsUsed >= settings.grokCallCap) {
			toast("Grok call cap reached for this session");
			return;
		}
		setGrokBusy(signalId);
		try {
			const res = await interpretWithGrok({ data: { text } });
			if (!res.ok) {
				toast(res.error);
				return;
			}
			interpretSignal(signalId, res.parsed, res.confidence, "grok");
			toast(`Grok parsed ${res.parsed.symbol} ${res.parsed.side}`);
		} finally {
			setGrokBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
						children: "Intake"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
						children: "Telegram"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "User session, not a bot. Every channel and group already on the account is readable — no admin rights required."
					})
				] }), telegram.connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: disconnectTelegram,
					children: "Disconnect"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setConnectOpen(true),
					children: "Connect session"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg",
					children: telegram.connected ? `Signed in as @${telegram.user}` : "No Telegram session"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: telegram.connected ? `${sources.filter((s) => s.listening).length} chats listening · ${sources.filter((s) => s.autoTrade).length} auto-trade` : "Authorize once. VOLT reads messages; it never posts as the account."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: telegram.connected ? "live" : "outline",
					children: telegram.connected ? "session live" : "offline"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Chats" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: sources.length
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: sources.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg-subtle p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-start justify-between gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: src.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"@",
										src.username,
										" · ",
										chatTitle(src.kind),
										" · ",
										src.members.toLocaleString()
									]
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: src.listening,
										onCheckedChange: (v) => patchSource(src.id, { listening: v })
									}), "Listen"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: src.autoTrade,
										onCheckedChange: (v) => patchSource(src.id, { autoTrade: v }),
										disabled: !src.listening
									}), "Auto-trade"]
								})]
							})]
						}, src.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Inject message" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-[1fr_auto]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 rounded-sm bg-bg-subtle px-3 text-sm shadow-[var(--shadow-border)]",
								value: sourceId,
								onChange: (e) => setSourceId(e.target.value),
								children: sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									const sig = ingestMessage(sourceId, draft, "you", true);
									if (sig) toast(`Assigned ${sig.number}`);
								},
								children: "Ingest"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-3 font-mono text-xs",
							value: draft,
							onChange: (e) => setDraft(e.target.value)
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Live feed" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: messages.map((m) => {
							const src = sources.find((s) => s.id === m.sourceId);
							const sig = signals.find((s) => s.id === m.signalId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg-subtle p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2 text-xs text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-fg",
												children: src?.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.from }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-auto font-mono tabular",
												children: formatTime(m.at, now)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-fg",
										children: m.text
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap items-center gap-2",
										children: sig ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: sig.number }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalStatusChip, { status: sig.status }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-[11px] text-muted",
												children: [Math.round(sig.confidence * 100), "%"]
											}),
											sig.parsed && (sig.status === "interpreted" || sig.status === "received") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												onClick: () => executeSignal(sig.id),
												children: "Route"
											}) : null,
											sig.confidence < .8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: grokBusy === sig.id,
												onClick: () => runGrok(sig.id, m.text),
												children: grokBusy === sig.id ? "Grok…" : "Interpret with Grok"
											}) : null
										] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: "chat"
										})
									})
								]
							}, m.id);
						})
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: connectOpen,
				onOpenChange: setConnectOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Telegram user session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Same login you use in the app. VOLT enumerates every dialog — channels, groups, DMs — without asking admins to add a bot." })] }), step === "phone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								window.setTimeout(() => {
									setBusy(false);
									setStep("code");
								}, 700);
							},
							children: "Send code"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "code",
							children: "Login code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "code",
							value: code,
							onChange: (e) => setCode(e.target.value),
							placeholder: "12345"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: busy,
							onClick: () => {
								setBusy(true);
								window.setTimeout(() => {
									connectTelegram("volt.desk", phone);
									setBusy(false);
									setConnectOpen(false);
									setStep("phone");
									toast("Telegram session attached");
								}, 800);
							},
							children: "Authorize"
						})
					]
				})] })
			})
		]
	});
}
//#endregion
export { TelegramPage as component };
