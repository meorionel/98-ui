<script lang="ts">
/** Pushes everything after it to the far end of the toolbar. No props. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ToolbarSpacerProps {}
</script>

<script setup lang="ts">
/** Pushes everything after it to the far end of the toolbar. */
defineOptions({ name: "ToolbarSpacer" });
</script>

<template>
	<div aria-hidden="true" class="toolbar-spacer" />
</template>
