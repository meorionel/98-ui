import type { Messages } from "../../index";
import { common, nav, app } from "./core";
import { forms } from "./forms";
import { windows } from "./windows";
import { data } from "./data";
import { panels } from "./panels";
import { overlays } from "./overlays";
import { controls } from "./controls";
import { widgets } from "./widgets";
import { display } from "./display";

/**
 * The Chinese dictionary.
 *
 * Typed as `Messages` (= `typeof en`) on purpose: TypeScript then guarantees the
 * two locales have exactly the same keys, so a forgotten translation is a build
 * error rather than a string that silently falls back to English.
 */
export const zh: Messages = {
	common,
	nav,
	app,
	forms,
	windows,
	data,
	panels,
	overlays,
	controls,
	widgets,
	display,
};
