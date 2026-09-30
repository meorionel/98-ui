<script lang="ts">
export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps {
	/** `"horizontal"` (default) draws a rule between stacked blocks. */
	orientation?: SeparatorOrientation;
	/**
	 * Purely visual: the element loses its `separator` role and is hidden from
	 * assistive technology. Use it when the divider is decoration rather than a
	 * meaningful break.
	 */
	decorative?: boolean;
}
</script>

<script setup lang="ts">
/**
 * A divider between two blocks of content.
 *
 * ```vue
 * <p>Above</p>
 * <Separator />
 * <p>Below</p>
 * <FieldRow>
 *   <span>Left</span>
 *   <Separator orientation="vertical" />
 *   <span>Right</span>
 * </FieldRow>
 * ```
 */
defineOptions({ name: "Separator" });

const props = withDefaults(defineProps<SeparatorProps>(), {
	orientation: "horizontal",
	decorative: false,
});
</script>

<template>
	<div
		:role="props.decorative ? 'presentation' : 'separator'"
		:aria-orientation="props.decorative ? undefined : props.orientation"
		class="separator"
		:class="`separator-${props.orientation}`"
	/>
</template>
