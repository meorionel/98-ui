<script lang="ts">
/** No component-specific props: every attribute falls through to the `<a>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TreeViewLinkProps {}
</script>

<script setup lang="ts">
/** A focusable link row, styled by `ul.tree-view a` / `a:focus`. */
defineOptions({ name: "TreeViewLink" });

defineProps<TreeViewLinkProps>();
</script>

<template>
	<a>
		<slot />
	</a>
</template>
