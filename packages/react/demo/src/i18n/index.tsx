import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ElementType,
	type ReactNode,
} from "react";
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
import { renderInline } from "./inline";

/* --------------------------------------------------------------- typing */

export { LOCALES };
export type { Locale, MessageKey, MessageVars, Messages };

const DICTIONARIES: Record<Locale, Messages> = { en, zh };

/** The demo's own storage key — the two ports are separate origins. */
const STORAGE_KEY = "98-pink-react:locale";

/* ------------------------------------------------------------- context */

interface I18nContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	toggleLocale: () => void;
	t: (key: MessageKey, vars?: MessageVars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
	children: ReactNode;
	/**
	 * Controlled locale. When provided, the provider no longer keeps its own
	 * state — handy for tests and for rendering a fixed language server-side.
	 */
	locale?: Locale;
	/** Initial locale when uncontrolled. Defaults to stored → browser → `"en"`. */
	defaultLocale?: Locale;
	onLocaleChange?: (locale: Locale) => void;
}

export function I18nProvider({
	children,
	locale: controlledLocale,
	defaultLocale,
	onLocaleChange,
}: I18nProviderProps) {
	const [uncontrolledLocale, setUncontrolledLocale] = useState<Locale>(() =>
		detectLocale({ storageKey: STORAGE_KEY, fallback: defaultLocale }),
	);

	const isControlled = controlledLocale !== undefined;
	const locale = isControlled ? controlledLocale : uncontrolledLocale;

	const setLocale = useCallback(
		(next: Locale) => {
			if (!isControlled) setUncontrolledLocale(next);
			onLocaleChange?.(next);
		},
		[isControlled, onLocaleChange],
	);

	useEffect(() => {
		applyLocaleToDocument(locale, STORAGE_KEY);
	}, [locale]);

	const t = useCallback(
		(key: MessageKey, vars?: MessageVars) => translate(DICTIONARIES, locale, key, vars),
		[locale],
	);

	const value = useMemo<I18nContextValue>(
		() => ({
			locale,
			setLocale,
			toggleLocale: () => setLocale(locale === "en" ? "zh" : "en"),
			t,
		}),
		[locale, setLocale, t],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const context = useContext(I18nContext);
	if (!context) throw new Error("useI18n() must be used inside an <I18nProvider>.");
	return context;
}

/* -------------------------------------------------- inline-aware render */

export interface TProps {
	/** Message key to render. */
	k: MessageKey;
	vars?: MessageVars;
	/**
	 * Optional wrapper element — usually `"p"` or `"li"`. Defaults to a bare
	 * fragment so `<T>` can be dropped inside existing markup.
	 */
	as?: ElementType;
	className?: string;
}

/**
 * Renders a message that may contain `` `code` ``, `**strong**`, `*emphasis*`
 * and `[links](url)` spans.
 *
 * Use this instead of `t()` for any prose containing inline markup.
 *
 * ```tsx
 * <T k="panels.fieldBorders.p1" as="p" />
 * <blockquote><T k="forms.button.quote" /></blockquote>
 * ```
 */
export function T({ k, vars, as: Wrapper, className }: TProps) {
	const { t } = useI18n();
	const content = renderInline(t(k, vars));
	if (Wrapper === undefined) return <>{content}</>;
	return <Wrapper className={className}>{content}</Wrapper>;
}

export { renderInline };
