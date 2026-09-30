<script lang="ts">
/** No component-specific props: every attribute falls through to the `<thead>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableHeadProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "TableHead" });

defineProps<TableHeadProps>();
</script>

<template>
	<thead>
		<slot />
	</thead>
</template>
