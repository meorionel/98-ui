/**
 * `@98-ui/demo-content` — everything the two documentation apps say.
 *
 * The React and the Vue demo were 1459 lines of identical message tables plus a
 * handful of sentences that mention the framework by name. The tables live here;
 * each app overrides only the sentences that genuinely differ (see
 * `demo/src/i18n/overrides.ts` in either port).
 *
 * Nothing in here imports React or Vue — it is data plus three pure helpers.
 */
export { flattenKeys } from "./keys";

export {
	BASE_DICTIONARIES,
	LOCALES,
	applyLocaleToDocument,
	detectLocale,
	interpolate,
	lookup,
	readStoredLocale,
	translate,
	withOverrides,
} from "./messages";

export type { DeepPartial, Locale, MessageKey, MessageVars, Messages } from "./messages";

export { en as baseEn } from "./locales/en/index";
export { zh as baseZh } from "./locales/zh/index";
