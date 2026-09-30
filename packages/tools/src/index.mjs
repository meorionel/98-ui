/**
 * `@98-ui/tools` — build tooling shared by every package in the workspace.
 *
 * The two things that used to be duplicated per port now live here:
 * generating a port's stylesheet from `packages/css`, and proving that the
 * generated file is still a pure transformation of it.
 */
export { generateStyles, parseArgs, runCli as runGenerateStyles } from "./generate-styles.mjs";
export { verifyFidelity, runCli as runVerifyFidelity } from "./verify-fidelity.mjs";
export {
	ADDITIVE_DIR,
	CORE_STYLESHEET,
	CSS_PACKAGE_DIR,
	FONTS_DIR,
	PACKAGES_DIR,
	PORTS,
	PORT_NAMES,
	SHARED_ADDITIVE,
	additiveOrder,
	resolvePort,
} from "./ports.mjs";
