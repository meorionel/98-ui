/**
 * The demo dictionary: the schema, the lookup and the interpolation.
 *
 * Both documentation apps used to carry their own copy of this and of the
 * message tables. The tables now live here, the prose that actually differs per
 * framework sits in a handful of keys each app overrides, and a typo in an
 * override key is a type error rather than a string that silently falls back to
 * its own key at runtime.
 */
import { en } from "./locales/en/index";
import { zh } from "./locales/zh/index";

export type Locale = "en" | "zh";

/** The shape of the base dictionary — the schema of record. */
export type Messages = typeof en;

/** Every dotted key path that resolves to a string, e.g. `"forms.button.p1"`. */
type Leaves<T> = T extends string
	? ""
	: {
			[K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
		}[keyof T & string];

export type MessageKey = Leaves<Messages>;

export type MessageVars = Record<string, string | number>;

/** An override tree: the same shape, every leaf optional. */
export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends string ? T[K] : DeepPartial<T[K]>;
};

/** The framework-neutral dictionary. A port overrides only what it must. */
export const BASE_DICTIONARIES: Record<Locale, Messages> = { en, zh };

export const LOCALES: ReadonlyArray<{ value: Locale; labelKey: MessageKey }> = [
	{ value: "en", labelKey: "common.english" },
	{ value: "zh", labelKey: "common.chinese" },
];

/**
 * Merges a port's wording over the base dictionary.
 *
 * Returns `base` untouched when there is nothing to override, so the common case
 * allocates nothing.
 */
export function withOverrides<T>(base: T, overrides?: DeepPartial<T>): T {
	if (!overrides) return base;

	const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
		if (value === undefined) continue;

		const current = result[key];
		result[key] =
			value && typeof value === "object" && current && typeof current === "object"
				? withOverrides(current, value as DeepPartial<typeof current>)
				: value;
	}
	return result as T;
}

/** Walks a dotted path, falling back to the key itself so gaps are visible. */
export function lookup(messages: Messages, key: string): string {
	let current: unknown = messages;
	for (const segment of key.split(".")) {
		if (current && typeof current === "object" && segment in (current as object)) {
			current = (current as Record<string, unknown>)[segment];
		} else {
			return key;
		}
	}
	return typeof current === "string" ? current : key;
}

/** Replaces `{name}` placeholders. */
export function interpolate(template: string, vars?: MessageVars): string {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
		name in vars ? String(vars[name]) : whole,
	);
}

/** Resolves one key for one locale. Both apps' `t()` is a thin wrapper on this. */
export function translate(
	dictionaries: Record<Locale, Messages>,
	locale: Locale,
	key: MessageKey,
	vars?: MessageVars,
): string {
	return interpolate(lookup(dictionaries[locale], key), vars);
}

/** The locale this browser last chose, if storage is even available. */
export function readStoredLocale(storageKey: string): Locale | null {
	if (typeof window === "undefined") return null;
	try {
		const stored = window.localStorage.getItem(storageKey);
		return stored === "en" || stored === "zh" ? stored : null;
	} catch {
		// Private mode / disabled storage — fall back to the default.
		return null;
	}
}

/** Picks a sensible starting locale: stored choice, then browser language. */
export function detectLocale({
	storageKey,
	fallback = "en",
}: {
	storageKey: string;
	fallback?: Locale;
}): Locale {
	const stored = readStoredLocale(storageKey);
	if (stored) return stored;
	if (typeof navigator !== "undefined" && /^zh\b/i.test(String(navigator.language))) return "zh";
	return fallback;
}

/** Mirrors `<html lang>` and remembers the choice. */
export function applyLocaleToDocument(locale: Locale, storageKey: string): void {
	if (typeof document === "undefined") return;
	document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
	try {
		window.localStorage.setItem(storageKey, locale);
	} catch {
		// Ignore storage failures; the toggle still works for this session.
	}
}
