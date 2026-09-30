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
 * The English dictionary. `zh/index.ts` is typed against `typeof en`, so this
 * object is the schema of record: every key added here must exist in Chinese.
 */
export const en = {
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
