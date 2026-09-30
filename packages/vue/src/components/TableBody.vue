<script lang="ts">
/** No component-specific props: every attribute falls through to the `<tbody>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableBodyProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "TableBody" });

defineProps<TableBodyProps>();
</script>

<template>
	<tbody>
		<slot />
	</tbody>
</template>
