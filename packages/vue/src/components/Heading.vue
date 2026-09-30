<script lang="ts">
export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps {
	/** `1`–`4`. Renders the matching `<h*>` element. Defaults to `2`. */
	level?: HeadingLevel;
	/**
	 * Element to render, exactly like React's `ElementType`. Defaults to the
	 * element that matches `level` — `h2` unless `level` says otherwise — so
	 * `<Heading :level="1">` still renders an `<h1>`.
	 */
	as?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";

/**
 * A heading at one of the four sizes the stylesheet knows about.
 *
 * ```vue
 * <Heading :level="1">Control Panel</Heading>
 * <Heading :level="3">Display</Heading>
 * ```
 *
 * The upstream sheet sizes bare `h1`–`h4` for prose (5rem and down); these
 * classes override that with sizes that fit an 11px UI.
 */
defineOptions({ name: "Heading" });

const props = withDefaults(defineProps<HeadingProps>(), { level: 2, as: undefined });

const element = computed(() => props.as ?? `h${props.level}`);
</script>

<template>
	<component :is="element" class="heading" :class="`heading-${props.level}`">
		<slot />
	</component>
</template>
