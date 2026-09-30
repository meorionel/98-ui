<script lang="ts">
export interface ToolbarProps {
	/** Accessible name for the `role="toolbar"` element. */
	label?: string;
}
</script>

<script setup lang="ts">
/**
 * The Windows 98 common toolbar: a flat row of icon buttons with separators.
 *
 * ```vue
 * <Toolbar label="Standard">
 *   <ToolbarButton @click="newFile">
 *     <template #icon><NewIcon /></template>
 *     New
 *   </ToolbarButton>
 *   <ToolbarSeparator />
 *   <ToolbarButton default-pressed>Bold</ToolbarButton>
 *   <ToolbarSpacer />
 *   <ToolbarButton>Help</ToolbarButton>
 * </Toolbar>
 * ```
 *
 * Any child works — `DropdownMenu` triggers and `ToggleGroup`s are common ones —
 * but `ToolbarButton`, `ToolbarSeparator` and `ToolbarSpacer` keep the spacing
 * and the flat look consistent.
 */
defineOptions({ name: "Toolbar" });

const props = withDefaults(defineProps<ToolbarProps>(), { label: undefined });
</script>

<template>
	<div role="toolbar" :aria-label="props.label" aria-orientation="horizontal" class="toolbar">
		<slot />
	</div>
</template>
