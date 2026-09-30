<script lang="ts">
/** Tint applied to the chip. `"default"` uses the plain button surface. */
export type BadgeVariant = "default" | "info" | "success" | "warning" | "error";

export interface BadgeProps {
	variant?: BadgeVariant;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

/**
 * A small status chip.
 *
 * ```vue
 * <Badge variant="success">Saved</Badge>
 * <Badge variant="error">
 *   <template #icon><WarningGlyph /></template>
 *   3 errors
 * </Badge>
 * ```
 *
 * Windows 98 itself had no badge, so this is a deliberate addition: it is drawn
 * as a raised chip in the theme's surfaces and only the status tint is new. The
 * variants are colour-coded, which is why each one also has a text label rather
 * than relying on the colour alone.
 */
defineOptions({ name: "Badge" });

const props = withDefaults(defineProps<BadgeProps>(), { variant: "default" });

const slots = defineSlots<{
	/** Glyph shown before the label. */
	icon?: () => unknown;
	default?: () => unknown;
}>();
</script>

<template>
	<span class="badge" :class="cx(props.variant !== 'default' && `badge-${props.variant}`)">
		<span v-if="slots.icon" class="badge-icon" aria-hidden="true">
			<slot name="icon" />
		</span>
		<slot />
	</span>
</template>
