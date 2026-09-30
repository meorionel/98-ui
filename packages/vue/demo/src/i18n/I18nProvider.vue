<script lang="ts">
import type { Locale } from "./index";

export interface I18nProviderProps {
	/**
	 * Controlled locale. When provided, the provider no longer keeps its own
	 * state — handy for tests and for rendering a fixed language server-side.
	 */
	locale?: Locale;
	/** Initial locale when uncontrolled. Defaults to stored → browser → `"en"`. */
	defaultLocale?: Locale;
}
</script>

<script setup lang="ts">
import { provide } from "vue";
import { createI18n, I18N_KEY } from "./index";

const props = withDefaults(defineProps<I18nProviderProps>(), {
	locale: undefined,
	defaultLocale: undefined,
});

const emit = defineEmits<{ "locale-change": [locale: Locale] }>();

provide(
	I18N_KEY,
	createI18n({
		locale: () => props.locale,
		defaultLocale: props.defaultLocale,
		onLocaleChange: (next) => emit("locale-change", next),
	}),
);
</script>

<template>
	<slot />
</template>
