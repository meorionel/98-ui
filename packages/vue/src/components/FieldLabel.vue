<script lang="ts">
/** No component-specific props: `FieldLabel` only renders a `.field-row`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FieldLabelProps {}
</script>

<script setup lang="ts">
/**
 * A `.field-row` that only contains text — used as a caption above a set of
 * inputs ("Select one:", "Volume:"), matching the original docs.
 */
defineOptions({ name: "FieldLabel" });

defineProps<FieldLabelProps>();
</script>

<template>
	<div class="field-row">
		<slot />
	</div>
</template>
