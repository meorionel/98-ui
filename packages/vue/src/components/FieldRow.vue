<script lang="ts">
export interface FieldRowProps {
	/**
	 * Stack the children vertically instead of horizontally.
	 * Shorthand for using `FieldRowStacked`.
	 */
	stacked?: boolean;
}
</script>

<script setup lang="ts">
/**
 * Lays out a label and its control on one line, with the 6px spacing Windows 98
 * uses between grouped elements. Consecutive rows are spaced 6px apart too,
 * which the stylesheet handles through `.field-row + .field-row`.
 */
defineOptions({ name: "FieldRow" });

const props = withDefaults(defineProps<FieldRowProps>(), { stacked: false });
</script>

<template>
	<div :class="props.stacked ? 'field-row-stacked' : 'field-row'">
		<slot />
	</div>
</template>
