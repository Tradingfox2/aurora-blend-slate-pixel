import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./router-CDz7sFNU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CK3RFz_1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-10 w-full rounded-sm bg-bg-subtle px-3 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle file:border-0 file:bg-transparent", "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)]", "disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
//#endregion
export { Input as t };
