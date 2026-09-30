<script lang="ts">
export interface EmptyProps {
	/** Short headline, e.g. "No files found". A `title` slot overrides it. */
	title?: string;
	/** Sentence explaining what to do next. A `description` slot overrides it. */
	description?: string;
	/** Tighter padding, for a panel inside a panel. */
	compact?: boolean;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

/**
 * The "nothing here yet" state.
 *
 * ```vue
 * <Empty
 *   title="This folder is empty"
 *   description="Drag files here, or use File ▸ New."
 * >
 *   <template #icon><FolderGlyph /></template>
 *   <Button>New folder</Button>
 * </Empty>
 * ```
 *
 * Centred content in the page's own colours — no stock illustration, which is
 * both cheaper and more in keeping with the rest of the library.
 */
defineOptions({ name: "Empty" });

const props = withDefaults(defineProps<EmptyProps>(), {
	title: undefined,
	description: undefined,
	compact: false,
});

const slots = defineSlots<{
	/** Glyph shown above the title. */
	icon?: () => unknown;
	/** Short headline; overrides the `title` prop. */
	title?: () => unknown;
	/** Sentence explaining what to do next; overrides the `description` prop. */
	description?: () => unknown;
	/** Actions — usually a `Button` or a `ButtonGroup`. */
	default?: () => unknown;
}>();
</script>

<template>
	<div class="empty" :class="cx(props.compact && 'empty-compact')">
		<span v-if="slots.icon" class="empty-icon" aria-hidden="true">
			<slot name="icon" />
		</span>
		<div v-if="slots.title || props.title !== undefined" class="empty-title">
			<slot name="title">{{ props.title }}</slot>
		</div>
		<div v-if="slots.description || props.description !== undefined" class="empty-description">
			<slot name="description">{{ props.description }}</slot>
		</div>
		<div v-if="slots.default" class="empty-actions">
			<slot />
		</div>
	</div>
</template>
