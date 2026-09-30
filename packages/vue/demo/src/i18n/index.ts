import { computed, inject, ref, watch, type ComputedRef, type InjectionKey } from "vue";
import {
	LOCALES,
	applyLocaleToDocument,
	detectLocale,
	translate,
	type Locale,
	type MessageKey,
	type MessageVars,
	type Messages,
} from "@98-ui/demo-content";
import { en, zh } from "./locales";

/* ------------------------------------------------------------------ types */

export { LOCALES };
export type { Locale, MessageKey, MessageVars, Messages };

const DICTIONARIES: Record<Locale, Messages> = { en, zh };

/** The demo's own storage key — the two ports are separate origins. */
const STORAGE_KEY = "98-pink-vue:locale";

/* ------------------------------------------------------------- the locale */

export interface I18n {
	/** The active locale. Top-level refs unwrap in templates — destructure it. */
	locale: ComputedRef<Locale>;
	setLocale: (locale: Locale) => void;
	toggleLocale: () => void;
	/** Resolves a message key, replacing `{name}` placeholders. */
	t: (key: MessageKey, vars?: MessageVars) => string;
}

export const I18N_KEY: InjectionKey<I18n> = Symbol("98-pink-demo:i18n");

export interface CreateI18nOptions {
	/**
	 * Controlled locale getter. When it returns a value the provider no longer
	 * keeps its own state — handy for tests and for rendering a fixed language
	 * server-side.
	 */
	locale?: () => Locale | undefined;
	/** Initial locale when uncontrolled. Defaults to stored → browser → `"en"`. */
	defaultLocale?: Locale;
	onLocaleChange?: (locale: Locale) => void;
}

/**
 * Builds the translator the demo shares through `provide`/`inject`.
 *
 * ```vue
 * const { t, locale, setLocale } = useI18n();
 * ```
 */
export function createI18n(options: CreateI18nOptions = {}): I18n {
	const uncontrolled = ref<Locale>(
		detectLocale({ storageKey: STORAGE_KEY, fallback: options.defaultLocale }),
	);
	const controlled = computed(() => options.locale?.());
	const isControlled = computed(() => controlled.value !== undefined);
	const locale = computed<Locale>(() =>
		isControlled.value ? controlled.value! : uncontrolled.value,
	);

	const setLocale = (next: Locale) => {
		if (!isControlled.value) uncontrolled.value = next;
		options.onLocaleChange?.(next);
	};

	watch(locale, (current) => applyLocaleToDocument(current, STORAGE_KEY), { immediate: true });

	return {
		locale,
		setLocale,
		toggleLocale: () => setLocale(locale.value === "en" ? "zh" : "en"),
		t: (key: MessageKey, vars?: MessageVars) => translate(DICTIONARIES, locale.value, key, vars),
	};
}

export function useI18n(): I18n {
	const context = inject(I18N_KEY, null);
	if (!context) throw new Error("useI18n() must be used inside an <I18nProvider>.");
	return context;
}

export { renderInline } from "./inline";
export { T } from "./T";
