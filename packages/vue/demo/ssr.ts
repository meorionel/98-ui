import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { flattenKeys } from "@98-ui/demo-content";
import App from "./src/App.vue";
import { en } from "./src/i18n/locales";

/** Renders the entire documentation page to HTML. Used by scripts/ssr-check.mjs. */
export function render(): Promise<string> {
	return renderToString(createSSRApp(App));
}

/** Renders the same page in Chinese, to prove the dictionary is wired up. */
export function renderZh(): Promise<string> {
	return renderToString(createSSRApp(App, { locale: "zh" }));
}

/** Every message key in the English dictionary, for leak detection. */
export function messageKeys(): string[] {
	return flattenKeys(en);
}
