<script lang="ts">
export interface TableProps {
	/** Show a pointer cursor over body rows and enable row clicks. */
	interactive?: boolean;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

/** A plain table, styled by the `table` element selectors. */
defineOptions({ name: "Table" });

const props = withDefaults(defineProps<TableProps>(), { interactive: false });
</script>

<template>
	<table :class="cx(props.interactive && 'interactive')">
		<slot />
	</table>
</template>
