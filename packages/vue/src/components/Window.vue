<script lang="ts">
import type { TitleBarControl } from "./TitleBar.vue";

export interface WindowProps {
	/**
	 * Caption for the title bar. Omit to render a bodyless window frame.
	 * A `title` slot overrides it and may hold markup.
	 */
	title?: string;
	/** Command buttons rendered in the title bar. */
	controls?: TitleBarControl[];
	/** Grey out the title bar (used for background windows). */
	inactive?: boolean;
	/** Localised accessible names for the title bar buttons. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Wrap the content in a `.window-body`. Defaults to `true`. */
	body?: boolean;
	width?: number | string;
	height?: number | string;
	/**
	 * Extra props forwarded to the generated `TitleBar` — React's
	 * `Omit<TitleBarProps, "text" | "controls" | "onControl" | "labels" | "inactive">`.
	 */
	titleBarProps?: Record<string, unknown>;
	/** Extra props forwarded to the generated `WindowBody` (React's `WindowBodyProps`). */
	bodyProps?: Record<string, unknown>;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import TitleBar from "./TitleBar.vue";
import WindowBody from "./WindowBody.vue";

/**
 * A complete Windows 98 window: raised outer/inner border, optional title bar
 * with command buttons, an optional menu bar, and an optional status bar.
 *
 * ```vue
 * <Window title="A Window With Stuff In It" :controls="['minimize', 'maximize', 'close']" :width="320">
 *   <p>There's so much room for activities!</p>
 * </Window>
 * ```
 */
defineOptions({ name: "Window" });

const props = withDefaults(defineProps<WindowProps>(), {
	title: undefined,
	controls: undefined,
	inactive: false,
	labels: undefined,
	body: true,
	width: undefined,
	height: undefined,
	titleBarProps: undefined,
	bodyProps: undefined,
});

const emit = defineEmits<{ control: [action: TitleBarControl] }>();

const slots = defineSlots<{
	default?: () => unknown;
	title?: () => unknown;
	menuBar?: () => unknown;
	statusBar?: () => unknown;
}>();

/**
 * React appends `px` to numeric style values (except `0`) and Vue does not, so
 * do it here to keep the rendered inline style identical.
 */
const dimension = (value: number | string | undefined) =>
	typeof value === "number" && value !== 0 ? `${value}px` : value;

/**
 * React's `style={{ width, height, ...style }}`, minus the empty attribute:
 * returning `undefined` when neither dimension was given leaves the root
 * without a `style` attribute, exactly as React rendered it. A consumer's
 * fallthrough `style` still merges over these values.
 */
const windowStyle = computed(() => {
	const style: Record<string, string | number> = {};
	if (props.width !== undefined) style.width = dimension(props.width) as string | number;
	if (props.height !== undefined) style.height = dimension(props.height) as string | number;
	return Object.keys(style).length > 0 ? style : undefined;
});
</script>

<template>
	<div class="window" :style="windowStyle">
		<TitleBar
			v-if="props.title !== undefined || slots.title"
			v-bind="props.titleBarProps"
			:text="props.title"
			:controls="props.controls"
			:inactive="props.inactive"
			:labels="props.labels"
			@control="emit('control', $event)"
		>
			<template v-if="slots.title" #text>
				<slot name="title" />
			</template>
		</TitleBar>
		<WindowBody v-if="props.body" v-bind="props.bodyProps">
			<slot name="menuBar" />
			<slot />
		</WindowBody>
		<template v-else>
			<slot name="menuBar" />
			<slot />
		</template>
		<slot name="statusBar" />
	</div>
</template>
