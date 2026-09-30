<script lang="ts">
/** No component-specific props: every attribute falls through to the `<ul>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TreeViewProps {}
</script>

<script setup lang="ts">
/**
 * A tree view: an indented outline built from nested `<ul>` elements.
 *
 * ```vue
 * <TreeView>
 *   <TreeViewItem>Table of Contents</TreeViewItem>
 *   <TreeViewBranch label="CSS" default-open>
 *     <TreeViewItem>Selectors</TreeViewItem>
 *   </TreeViewBranch>
 * </TreeView>
 * ```
 */
defineOptions({ name: "TreeView" });

defineProps<TreeViewProps>();
</script>

<template>
	<ul class="tree-view">
		<slot />
	</ul>
</template>
