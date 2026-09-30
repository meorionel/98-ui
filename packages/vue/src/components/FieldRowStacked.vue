<script lang="ts">
/** No component-specific props: `FieldRowStacked` only differs by its class. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FieldRowStackedProps {}
</script>

<script setup lang="ts">
/**
 * Like `FieldRow`, but places the label above the control — used for text boxes
 * and text areas that need the full width.
 */
defineOptions({ name: "FieldRowStacked" });

defineProps<FieldRowStackedProps>();
</script>

<template>
	<div class="field-row-stacked">
		<slot />
	</div>
</template>
