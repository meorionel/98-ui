<script lang="ts">
/** No component-specific props: every attribute falls through to the `<td>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableCellProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "TableCell" });

defineProps<TableCellProps>();
</script>

<template>
	<td>
		<slot />
	</td>
</template>
