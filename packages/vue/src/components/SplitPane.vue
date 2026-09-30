<script lang="ts">
/** `"horizontal"` puts the panes side by side and drags left/right. */
export type SplitDirection = "horizontal" | "vertical";

export interface SplitPaneProps {
	/** Defaults to `"horizontal"`. */
	direction?: SplitDirection;
	/** Controlled size of the first pane, in pixels. */
	size?: number;
	/** Initial size of the first pane while uncontrolled. Defaults to `160`. */
	defaultSize?: number;
	/** Smallest size either pane may be dragged to. Defaults to `40`. */
	min?: number;
	/** Largest size the first pane may be dragged to. Defaults to the container minus `min`. */
	max?: number;
	/** How far one arrow press moves the divider. Defaults to `8`. */
	step?: number;
	/** Accessible name for the divider. */
	label?: string;
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/controllable";

/**
 * Two panes with a draggable divider between them — the Windows 98 splitter.
 *
 * ```vue
 * <SplitPane :default-size="160" :min="80" label="Resize the panes">
 *   <template #first><TreeView>…</TreeView></template>
 *   <template #second><TableView … /></template>
 * </SplitPane>
 * ```
 *
 * The divider is a real `separator`: it takes focus, exposes its size through
 * `aria-valuenow`, moves with the arrow keys, jumps with Home/End, and resets to
 * the default size on Enter or a double click. Dragging uses pointer capture, so
 * the pointer can leave the divider (or the window) mid-drag.
 *
 * React's `first`/`second` props are the `first`/`second` slots, and its
 * `onSizeChange` is the `size-change` emit (also reachable as `@update:size`, so
 * `v-model:size` works). `forwardRef` needs no port: the root element of a Vue
 * component is `$el`.
 */
defineOptions({ name: "SplitPane" });

const props = withDefaults(defineProps<SplitPaneProps>(), {
	direction: "horizontal",
	size: undefined,
	defaultSize: 160,
	min: 40,
	max: undefined,
	step: 8,
	label: undefined,
	disabled: false,
});

const emit = defineEmits<{
	"update:size": [size: number];
	"size-change": [size: number];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const dragging = ref(false);

const [size, setSize] = useControllableState<number>({
	value: () => props.size,
	defaultValue: props.defaultSize,
	onChange: (next) => {
		emit("update:size", next);
		emit("size-change", next);
	},
});

const horizontal = computed(() => props.direction === "horizontal");

const clamp = (next: number) => {
	const rect = containerRef.value?.getBoundingClientRect();
	const total = rect ? (horizontal.value ? rect.width : rect.height) : undefined;
	const upper = Math.max(
		props.min,
		total === undefined ? (props.max ?? next) : total - props.min,
	);
	const limit = props.max === undefined ? upper : Math.min(props.max, upper);
	return Math.round(Math.min(Math.max(next, props.min), limit));
};

const positionToSize = (event: PointerEvent) => {
	const rect = containerRef.value?.getBoundingClientRect();
	if (!rect) return;
	return horizontal.value ? event.clientX - rect.left : event.clientY - rect.top;
};

const handlePointerDown = (event: PointerEvent) => {
	if (props.disabled) return;
	event.preventDefault();
	(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
	dragging.value = true;
};

const handlePointerMove = (event: PointerEvent) => {
	if (!dragging.value || props.disabled) return;
	const next = positionToSize(event);
	if (next !== undefined) setSize(clamp(next));
};

const endDrag = (event: PointerEvent) => {
	if (!dragging.value) return;
	dragging.value = false;
	(event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
};

const handleKeyDown = (event: KeyboardEvent) => {
	if (props.disabled) return;
	const decrease = horizontal.value ? "ArrowLeft" : "ArrowUp";
	const increase = horizontal.value ? "ArrowRight" : "ArrowDown";

	switch (event.key) {
		case decrease:
			event.preventDefault();
			setSize(clamp(size.value - props.step));
			return;
		case increase:
			event.preventDefault();
			setSize(clamp(size.value + props.step));
			return;
		case "Home":
			event.preventDefault();
			setSize(clamp(props.min));
			return;
		case "End":
			event.preventDefault();
			setSize(clamp(Number.MAX_SAFE_INTEGER));
			return;
		case "Enter":
			event.preventDefault();
			setSize(clamp(props.defaultSize));
			return;
		default:
			return;
	}
};

/** Double clicking the divider puts it back where it started. */
const resetSize = () => {
	if (!props.disabled) setSize(clamp(props.defaultSize));
};
</script>

<template>
	<div
		ref="containerRef"
		class="split-pane"
		:class="cx(!horizontal && 'split-pane-vertical', dragging && 'split-pane-dragging')"
	>
		<div
			class="split-pane-pane"
			:style="horizontal ? { width: `${size}px` } : { height: `${size}px` }"
		>
			<slot name="first" />
		</div>
		<div
			role="separator"
			:aria-orientation="horizontal ? 'vertical' : 'horizontal'"
			:aria-label="props.label"
			:aria-valuenow="size"
			:aria-valuemin="props.min"
			:aria-valuemax="props.max"
			:aria-disabled="props.disabled || undefined"
			:tabindex="props.disabled ? -1 : 0"
			class="split-pane-divider"
			:class="cx(dragging && 'split-pane-divider-dragging')"
			@pointerdown="handlePointerDown"
			@pointermove="handlePointerMove"
			@pointerup="endDrag"
			@pointercancel="endDrag"
			@keydown="handleKeyDown"
			@dblclick="resetSize"
		/>
		<div class="split-pane-pane split-pane-pane-fill">
			<slot name="second" />
		</div>
	</div>
</template>
