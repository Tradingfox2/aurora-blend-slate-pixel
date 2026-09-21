import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-DVyFu7IL.mjs";
import { _ as useDesk, c as formatTime, u as latencyLabel } from "./store-Cs07XZvE.mjs";
import { a as SignalNo, i as SideChip, o as SignalStatusChip } from "./bits-DXZvd2xW.mjs";
import { n as CardHeader, r as CardTitle, t as Card } from "./card-SUTpxZ3e.mjs";
import { t as Input } from "./input-CK3RFz_1.mjs";
import { t as interpretWithGrok } from "./interpret-D089Sat-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signals-DyjQ1x1U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignalsPage() {
	const signals = useDesk((s) => s.signals);
	const sources = useDesk((s) => s.sources);
	const now = useDesk((s) => s.now);
	const executeSignal = useDesk((s) => s.executeSignal);
	const ignoreSignal = useDesk((s) => s.ignoreSignal);
	const interpretSignal = useDesk((s) => s.interpretSignal);
	const settings = useDesk((s) => s.settings);
	const [q, setQ] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const rows = signals.filter((s) => {
		return `${s.number} ${s.rawText} ${s.parsed?.symbol ?? ""}`.toLowerCase().includes(q.toLowerCase());
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-2xl font-semibold tracking-[-0.03em]",
					children: "Signals"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Every intake gets a number. Positions, copies and history stay attached to that ticket."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Filter number, symbol, text",
				className: "max-w-xs"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "px-4 pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [rows.length, " tickets"] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[860px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[10px] uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border",
							children: [
								"No",
								"Source",
								"Parsed",
								"Conf",
								"Status",
								"Age",
								"Latency",
								""
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: h
							}, h))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((s) => {
						const src = sources.find((x) => x.id === s.sourceId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70 align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalNo, { n: s.number })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-xs text-muted",
									children: src?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-3",
									children: [s.parsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideChip, { side: s.parsed.side }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: s.parsed.symbol
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: s.parsed.action
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "unparsed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "mt-1 max-w-sm truncate font-mono text-[11px] text-subtle",
										children: s.rawText
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-3 font-mono text-xs tabular",
									children: [Math.round(s.confidence * 100), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalStatusChip, { status: s.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono text-xs tabular text-muted",
									children: formatTime(s.receivedAt, now)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono text-xs tabular text-muted",
									children: latencyLabel(s.latency.totalMs)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap justify-end gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												disabled: !s.parsed,
												onClick: () => executeSignal(s.id),
												children: "Route"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: busy === s.id,
												onClick: async () => {
													if (settings.grokCallsUsed >= settings.grokCallCap) {
														toast("Grok call cap reached");
														return;
													}
													setBusy(s.id);
													const res = await interpretWithGrok({ data: { text: s.rawText } });
													setBusy(null);
													if (!res.ok) {
														toast(res.error);
														return;
													}
													interpretSignal(s.id, res.parsed, res.confidence, "grok");
												},
												children: "Grok"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => ignoreSignal(s.id),
												children: "Ignore"
											})
										]
									})
								})
							]
						}, s.id);
					}) })]
				})
			})]
		})]
	});
}
//#endregion
export { SignalsPage as component };
