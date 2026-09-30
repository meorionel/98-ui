<script lang="ts">
export interface SunkenPanelProps {
	/** Which element to render. Defaults to `div`. */
	as?: string;
}
</script>

<script setup lang="ts">
/**
 * A scrolling recessed region with a 2px groove border — the container used for
 * table views and list views.
 */
defineOptions({ name: "SunkenPanel" });

const props = withDefaults(defineProps<SunkenPanelProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="sunken-panel">
		<slot />
	</component>
</template>
