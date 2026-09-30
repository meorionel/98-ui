<script lang="ts">
import type { CSSProperties } from "vue";
import type { Align, Side } from "./floating";
import type { InitialFocus } from "./focusTrap";

export interface FloatingSurfaceProps {
	/** Mount the layer. When false nothing is rendered at all. */
	open: boolean;
	/** Element the layer is positioned against. */
	anchor?: HTMLElement | null;
	/** Position at a viewport point instead — how `ContextMenu` follows the cursor. */
	point?: { x: number; y: number } | null;
	side?: Side;
	align?: Align;
	offset?: number;
	/** Copy the anchor's width onto the layer. */
	matchAnchorWidth?: boolean;
	/** Escape dismisses. Defaults to `true`. */
	closeOnEscape?: boolean;
	/** A pointer press outside dismisses. Defaults to `true`. */
	closeOnOutsidePointerDown?: boolean;
	/** Extra elements that count as "inside", typically the trigger. */
	ignore?: Array<HTMLElement | null | undefined>;
	/** ARIA role for the surface — `menu`, `dialog` or `tooltip`. */
	role?: string;
	/** Accessible name for the surface. */
	label?: string;
	/** Element id, so `aria-describedby` / `aria-controls` can point at the layer. */
	id?: string;
	/** Extra class for the surface element. */
	surfaceClass?: string;
	/** Merged after the computed position styles. */
	surfaceStyle?: CSSProperties;
	/** Move focus into the layer when it opens. Defaults to `false`. */
	autoFocus?: boolean;
	/** Where that focus goes. Defaults to the layer's first focusable child. */
	initialFocus?: InitialFocus;
	/** Cycle Tab inside the layer. Modal layers want this; menus do not. */
	trapFocus?: boolean;
	/** Give focus back to whatever had it when the layer opened. Defaults to `autoFocus`. */
	restoreFocus?: boolean;
	/** Pin the z-index. By default every layer gets a fresh, higher one. */
	zIndex?: number;
	/** Render in place instead of teleporting (docs and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { useDismissable } from "./dismissable";
import { useFloating } from "./floating";
import { useFocusTrap } from "./focusTrap";
import { useLayerZIndex } from "./layers";
import Portal from "./Portal.vue";

/**
 * The shared engine behind every floating layer: `DropdownMenu`, `ContextMenu`,
 * `Tooltip` and `Popover`.
 *
 * Owns the teleport, the position, the layer's `z-index`, Escape/outside-click
 * dismissal and focus movement, so each component only has to describe its own
 * content.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FloatingSurfaceProps>(), {
	anchor: null,
	point: null,
	side: "bottom",
	align: "center",
	offset: 4,
	matchAnchorWidth: false,
	closeOnEscape: true,
	closeOnOutsidePointerDown: true,
	ignore: () => [],
	role: undefined,
	label: undefined,
	id: undefined,
	surfaceClass: undefined,
	surfaceStyle: undefined,
	autoFocus: false,
	initialFocus: undefined,
	trapFocus: false,
	restoreFocus: undefined,
	zIndex: undefined,
	inline: false,
	container: null,
});

const emit = defineEmits<{ dismiss: [] }>();
const attrs = useAttrs();

const surfaceRef = ref<HTMLDivElement | null>(null);

const { style: positionStyle, side: resolvedSide } = useFloating({
	open: () => props.open,
	floatingRef: surfaceRef,
	anchor: () => props.anchor,
	point: () => props.point,
	side: () => props.side,
	align: () => props.align,
	offset: () => props.offset,
	matchAnchorWidth: () => props.matchAnchorWidth,
});

const layerZIndex = useLayerZIndex(
	() => props.open,
	() => props.zIndex,
);

useDismissable({
	enabled: () => props.open,
	onDismiss: () => emit("dismiss"),
	// The anchor counts as "inside" too: clicking a menu's own trigger must
	// toggle it rather than dismiss-and-reopen.
	refs: () => [surfaceRef.value, props.anchor, ...props.ignore],
	layer: () => layerZIndex.value,
	escape: () => props.closeOnEscape,
	outsidePointerDown: () => props.closeOnOutsidePointerDown,
});

useFocusTrap({
	target: surfaceRef,
	active: () => props.open && props.autoFocus,
	wrap: () => props.trapFocus,
	initialFocus: () => props.initialFocus ?? null,
	restoreFocus: () => props.restoreFocus ?? props.autoFocus,
	layer: () => layerZIndex.value,
});

const restAttrs = computed(() => {
	const { class: _class, style: _style, ...rest } = attrs;
	return rest;
});
const rootClass = computed(() => [props.surfaceClass, attrs.class]);
const rootStyle = computed(() => [
	positionStyle.value,
	{ zIndex: layerZIndex.value },
	props.surfaceStyle,
	attrs.style,
]);
</script>

<template>
	<Portal v-if="open" :to="container" :disabled="inline">
		<div
			ref="surfaceRef"
			v-bind="restAttrs"
			:id="id"
			:data-side="resolvedSide"
			:role="role"
			:aria-label="label"
			:tabindex="-1"
			:class="rootClass"
			:style="rootStyle"
		>
			<slot />
		</div>
	</Portal>
</template>
