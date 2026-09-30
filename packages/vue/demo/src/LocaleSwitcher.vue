<script setup lang="ts">
import { Button } from "98-pink-vue";
import { LOCALES, useI18n } from "./i18n";

/**
 * Language toggle for the documentation site.
 *
 * Sits at the top of the sidebar. The active locale is rendered with the
 * `active` prop, which applies the pressed/sunken button look — the closest
 * native Windows 98 idiom for "this option is selected".
 */
defineOptions({ name: "LocaleSwitcher" });

const { locale, setLocale, t } = useI18n();
</script>

<template>
	<div class="locale-switcher">
		<div class="locale-switcher-label">{{ t("common.language") }}</div>
		<div class="locale-switcher-buttons" role="group" :aria-label="t('common.language')">
			<Button
				v-for="entry in LOCALES"
				:key="entry.value"
				:active="locale === entry.value"
				:aria-pressed="locale === entry.value"
				:lang="entry.value === 'zh' ? 'zh-CN' : 'en'"
				@click="setLocale(entry.value)"
			>
				{{ t(entry.labelKey) }}
			</Button>
		</div>
	</div>
</template>
