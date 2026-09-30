<script lang="ts">
/** The 2px sunken rule that groups toolbar buttons. No component-specific props. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ToolbarSeparatorProps {}
</script>

<script setup lang="ts">
/** The 2px sunken rule that groups toolbar buttons. */
defineOptions({ name: "ToolbarSeparator" });
</script>

<template>
	<div role="separator" aria-orientation="vertical" class="toolbar-separator" />
</template>
