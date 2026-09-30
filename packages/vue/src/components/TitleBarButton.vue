<script lang="ts">
import type { TitleBarControl } from "./TitleBar.vue";

export interface TitleBarButtonProps {
	/** Which glyph to draw. */
	action: TitleBarControl;
	/**
	 * Accessible name. The glyph is drawn from a styling class, not the label,
	 * so this can safely be translated.
	 */
	label?: string;
}
</script>

<script setup lang="ts">
import Button from "./Button.vue";
import { TITLE_BAR_CONTROL_LABELS } from "./TitleBar.vue";

/**
 * A single title bar command button.
 *
 * Both the `aria-label="Minimize"` and the `.minimize` class hooks exist in the
 * stylesheet; we emit the class so the accessible name can be localised freely.
 *
 * The `action` class is joined with the caller's `class` by Vue's class
 * merge — React's `cx(action, className)`.
 */
defineOptions({ name: "TitleBarButton" });

const props = withDefaults(defineProps<TitleBarButtonProps>(), { label: undefined });
</script>

<template>
	<Button
		:class="props.action"
		:aria-label="props.label ?? TITLE_BAR_CONTROL_LABELS[props.action]"
	>
		<slot />
	</Button>
</template>
