<script lang="ts">
/** No component-specific props: every attribute falls through to the `<li>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TreeViewItemProps {}
</script>

<script setup lang="ts">
/** A leaf row in a `TreeView`. Can hold anything, not just text. */
defineOptions({ name: "TreeViewItem" });

defineProps<TreeViewItemProps>();
</script>

<template>
	<li>
		<slot />
	</li>
</template>
