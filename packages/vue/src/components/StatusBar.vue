<script lang="ts">
export interface StatusBarProps {
	/**
	 * Which element to render. Defaults to `div`. React's `ElementType` reaches
	 * Vue as a tag name string rendered through `<component :is>`.
	 */
	as?: string;
}
</script>

<script setup lang="ts">
/**
 * The status strip along the bottom of a window. Children should be
 * `StatusBarField`s; the 1px gaps between them come from the stylesheet.
 */
defineOptions({ name: "StatusBar" });

const props = withDefaults(defineProps<StatusBarProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="status-bar">
		<slot />
	</component>
</template>
