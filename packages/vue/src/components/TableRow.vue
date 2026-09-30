<script lang="ts">
export interface TableRowProps {
	/** Render the row in the selected (blue) state. */
	highlighted?: boolean;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

defineOptions({ name: "TableRow" });

const props = withDefaults(defineProps<TableRowProps>(), { highlighted: false });
</script>

<template>
	<tr :class="cx(props.highlighted && 'highlighted')">
		<slot />
	</tr>
</template>
