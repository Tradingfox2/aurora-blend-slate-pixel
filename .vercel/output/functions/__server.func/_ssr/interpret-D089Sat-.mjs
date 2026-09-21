import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/interpret-D089Sat-.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var interpretWithGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("f2dcf90b37139fdcb4d48ab491e91e34d141b166eb8a85e195b5a9a1b67cb752"));
//#endregion
export { interpretWithGrok as t };
