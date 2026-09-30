<script lang="ts">
import type { MessageKey } from "../i18n";

export interface SectionProps {
	/** Anchor id, also used as the heading id and the sidebar link target. */
	id: string;
	/** Dotted message key for the heading. */
	titleKey: MessageKey;
	/** Heading level. Window sub-sections use `4`. */
	level?: 3 | 4;
}
</script>

<script setup lang="ts">
import { useI18n } from "../i18n";

/**
 * A documented section: the heading and the `.component` body wrapper.
 *
 * ```vue
 * <Section id="button" title-key="nav.button">
 *   <p>…</p>
 * </Section>
 * ```
 *
 * The heading sits *outside* `.component`, exactly as in the React port, and the
 * wrapper `<div>` is what `scripts/ssr-check.mjs` looks for when it asserts that
 * every section id is present.
 */
defineOptions({ name: "Section" });

const props = withDefaults(defineProps<SectionProps>(), { level: 3 });
const { t } = useI18n();
</script>

<template>
	<div>
		<h4 v-if="props.level === 4" :id="props.id">{{ t(props.titleKey) }}</h4>
		<h3 v-else :id="props.id">{{ t(props.titleKey) }}</h3>
		<section class="component">
			<div class="component-body">
				<slot />
			</div>
		</section>
	</div>
</template>
