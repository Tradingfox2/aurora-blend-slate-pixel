import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./router-CDz7sFNU.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/switch-Dd7KsvtD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full shadow-[var(--shadow-border)] transition-colors", "data-[state=checked]:bg-accent data-[state=unchecked]:bg-bg-subtle", "disabled:cursor-not-allowed disabled:opacity-50", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block size-4 rounded-full bg-fg shadow-sm transition-transform", "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5", "data-[state=checked]:bg-accent-fg") })
}));
Switch.displayName = Switch$1.displayName;
//#endregion
export { Switch as t };
