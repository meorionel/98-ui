<script lang="ts">
/** No component-specific props: every attribute falls through to the `<th>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableHeaderCellProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "TableHeaderCell" });

defineProps<TableHeaderCellProps>();
</script>

<template>
	<th>
		<slot />
	</th>
</template>
