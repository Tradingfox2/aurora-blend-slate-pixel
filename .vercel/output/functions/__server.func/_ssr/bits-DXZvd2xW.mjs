import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-CDz7sFNU.mjs";
import { d as pnlTone, m as signalTag, o as formatPrice, p as sideLabel, s as formatSignedUsd } from "./store-Cs07XZvE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bits-DXZvd2xW.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", {
	variants: { variant: {
		default: "bg-bg-subtle text-muted",
		buy: "bg-buy/15 text-buy",
		sell: "bg-sell/15 text-sell",
		warn: "bg-warn/15 text-warn",
		accent: "bg-accent/15 text-accent",
		live: "bg-buy/15 text-buy",
		outline: "shadow-[var(--shadow-border)] text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function PnlText({ value, className }) {
	const tone = pnlTone(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular font-mono text-sm", tone === "buy" && "text-buy", tone === "sell" && "text-sell", tone === "muted" && "text-muted", className),
		children: formatSignedUsd(value)
	});
}
function SideChip({ side }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: side === "buy" ? "buy" : "sell",
		children: sideLabel(side)
	});
}
function SignalNo({ n, className }) {
	if (!n) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-subtle",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-mono text-xs text-accent tabular", className),
		children: signalTag(n)
	});
}
function Price({ symbol, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-sm tabular text-fg",
		children: formatPrice(symbol, value)
	});
}
function SignalStatusChip({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: status === "live" || status === "managed" ? "live" : status === "failed" ? "sell" : status === "ignored" ? "outline" : status === "closed" ? "default" : "accent",
		children: status
	});
}
//#endregion
export { SignalNo as a, SideChip as i, PnlText as n, SignalStatusChip as o, Price as r, Badge as t };
