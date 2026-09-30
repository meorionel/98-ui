import { Button } from "98-pink-react";
import { LOCALES, useI18n } from "./i18n";

/**
 * Language toggle for the documentation site.
 *
 * Sits at the top of the sidebar. The active locale is rendered with the
 * `active` prop, which applies the pressed/sunken button look — the closest
 * native Windows 98 idiom for "this option is selected".
 */
export function LocaleSwitcher() {
	const { locale, setLocale, t } = useI18n();

	return (
		<div className="locale-switcher">
			<div className="locale-switcher-label">{t("common.language")}</div>
			<div className="locale-switcher-buttons" role="group" aria-label={t("common.language")}>
				{LOCALES.map(({ value, labelKey }) => {
					const selected = locale === value;
					return (
						<Button
							key={value}
							active={selected}
							aria-pressed={selected}
							lang={value === "zh" ? "zh-CN" : "en"}
							onClick={() => setLocale(value)}
						>
							{t(labelKey)}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
