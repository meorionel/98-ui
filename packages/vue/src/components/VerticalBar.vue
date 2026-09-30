<script lang="ts">
export interface VerticalBarProps {
	/** Bar height in pixels. Defaults to the stylesheet's 20px. */
	height?: number | string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";

/**
 * The little 4px raised divider used between toolbar/title-bar command groups.
 */
defineOptions({ name: "VerticalBar" });

const props = withDefaults(defineProps<VerticalBarProps>(), { height: undefined });

/**
 * React's `style={{ height }}` appends `px` to a numeric height; Vue's SSR style
 * serialiser does not, so the unit is added here to keep the rendered inline
 * style byte-identical. The caller's own `style` still wins through Vue's
 * attribute fallthrough, exactly like React's `...style` spread.
 */
const barStyle = computed(() => ({
	height: typeof props.height === "number" ? `${props.height}px` : props.height,
}));
</script>

<template>
	<div class="vertical-bar" :style="barStyle">
		<slot />
	</div>
</template>
