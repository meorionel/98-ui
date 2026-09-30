<script lang="ts">
/** The five command buttons Windows 98 puts in a title bar. */
export type TitleBarControl = "minimize" | "maximize" | "restore" | "help" | "close";

/** English `aria-label`s used when no localised label is supplied. */
export const TITLE_BAR_CONTROL_LABELS: Record<TitleBarControl, string> = {
	minimize: "Minimize",
	maximize: "Maximize",
	restore: "Restore",
	help: "Help",
	close: "Close",
};

export interface TitleBarProps {
	/**
	 * Caption text. Rendered inside `.title-bar-text`. A `text` slot overrides
	 * it and may hold markup.
	 */
	text?: string;
	/** Which command buttons to render, left to right. */
	controls?: TitleBarControl[];
	/** Grey out the bar to signal that the window is not focused. */
	inactive?: boolean;
	/** Localised accessible names, keyed by control. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Extra props for the `.title-bar-controls` wrapper. */
	controlsProps?: Record<string, unknown>;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";
import TitleBarButton from "./TitleBarButton.vue";

/**
 * The caption bar at the top of a window, optionally with command buttons.
 *
 * ```vue
 * <TitleBar
 *   text="A Complete Window"
 *   :controls="['minimize', 'maximize', 'close']"
 *   @control="(action) => console.log(action)"
 * />
 * ```
 */
defineOptions({ name: "TitleBar" });

const props = withDefaults(defineProps<TitleBarProps>(), {
	text: undefined,
	controls: () => [],
	inactive: false,
	labels: undefined,
	controlsProps: undefined,
});

const emit = defineEmits<{ control: [action: TitleBarControl] }>();

const slots = defineSlots<{ default?: () => unknown; text?: () => unknown }>();
</script>

<template>
	<div class="title-bar" :class="cx(props.inactive && 'inactive')">
		<div v-if="props.text !== undefined || slots.text" class="title-bar-text">
			<slot name="text">{{ props.text }}</slot>
		</div>
		<slot />
		<div
			v-if="props.controls.length > 0"
			class="title-bar-controls"
			v-bind="props.controlsProps"
		>
			<TitleBarButton
				v-for="action in props.controls"
				:key="action"
				:action="action"
				:label="props.labels?.[action]"
				@click="emit('control', action)"
			/>
		</div>
	</div>
</template>
