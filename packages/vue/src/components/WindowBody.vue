<script lang="ts">
/** No component-specific props: the React original is `HTMLAttributes<HTMLDivElement>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WindowBodyProps {}
</script>

<script setup lang="ts">
/**
 * The padded content area of a window. Everything between the title bar and the
 * status bar goes in here (including the menu bar, which bleeds to the edges
 * through negative margins).
 */
defineOptions({ name: "WindowBody" });

defineProps<WindowBodyProps>();
</script>

<template>
	<div class="window-body">
		<slot />
	</div>
</template>
