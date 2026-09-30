<script lang="ts">
import type { Locale } from "./i18n";

export interface AppProps {
	/** Force a language. Used by the SSR checks to render both locales. */
	locale?: Locale;
}
</script>

<script setup lang="ts">
import I18nProvider from "./i18n/I18nProvider.vue";
import DemoPage from "./DemoPage.vue";

/**
 * The documentation page, wrapped in the i18n provider.
 *
 * `App.vue` and `DemoPage.vue` are split on purpose: `useI18n()` injects the
 * translator, so the component that *calls* it must be a child of the provider.
 */
defineOptions({ name: "App" });

const props = withDefaults(defineProps<AppProps>(), { locale: undefined });
</script>

<template>
	<I18nProvider :locale="props.locale">
		<DemoPage />
	</I18nProvider>
</template>
