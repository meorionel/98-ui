<script lang="ts">
import type { Align, Side } from "../utils/floating";

export interface TooltipProps {
	/** The tooltip text. A `content` slot overrides it and may hold markup. */
	content?: string;
	/** Defaults to `"top"`. */
	side?: Side;
	/** Defaults to `"center"`. */
	align?: Align;
	offset?: number;
	/** How long the pointer must rest on the anchor, in ms. Defaults to `500`. */
	delay?: number;
	/** Grace period before hiding, so the pointer can travel onto the tooltip. Defaults to `100`. */
	closeDelay?: number;
	disabled?: boolean;
	/** Controlled visibility. Lets a tour or a docs page pin a tooltip open. */
	open?: boolean;
	/** Initial visibility while uncontrolled. */
	defaultOpen?: boolean;
	/** Render in place instead of teleporting (docs and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs, useId, watch } from "vue";
import { useControllableState } from "../utils/controllable";
import FloatingSurface from "../utils/FloatingSurface.vue";
import { TriggerHost } from "../utils/trigger";

/**
 * A Windows 98 tooltip.
 *
 * ```vue
 * <Tooltip content="Sends the file to the Recycle Bin">
 *   <Button>Delete</Button>
 * </Tooltip>
 * ```
 *
 * Shows after `delay` on hover, immediately on keyboard focus, and wires
 * `aria-describedby` so screen readers announce it too. Escape hides it without
 * closing anything else.
 */
defineOptions({ name: "Tooltip", inheritAttrs: false });

const props = withDefaults(defineProps<TooltipProps>(), {
	content: undefined,
	side: "top",
	align: "center",
	offset: 6,
	delay: 500,
	closeDelay: 100,
	disabled: false,
	open: undefined,
	defaultOpen: false,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
}>();

const slots = defineSlots<{ default?: () => unknown; content?: () => unknown }>();
const attrs = useAttrs();

const tooltipId = useId();
const triggerEl = ref<HTMLElement | null>(null);

const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

let showTimer = 0;
let hideTimer = 0;

const clearTimers = () => {
	window.clearTimeout(showTimer);
	window.clearTimeout(hideTimer);
};

// A tooltip that is unmounted mid-hover must not leave a timer behind.
onBeforeUnmount(clearTimers);

watch([() => props.disabled, isOpen], () => {
	if (props.disabled && isOpen.value) setOpen(false);
});

const scheduleOpen = () => {
	clearTimers();
	if (props.disabled) return;
	showTimer = window.setTimeout(() => setOpen(true), props.delay);
};

const scheduleClose = () => {
	clearTimers();
	hideTimer = window.setTimeout(() => setOpen(false), props.closeDelay);
};

const openNow = () => {
	clearTimers();
	if (!props.disabled) setOpen(true);
};

const closeNow = () => {
	clearTimers();
	setOpen(false);
};

const triggerBindings = computed<Record<string, unknown>>(() => ({
	"aria-describedby": isOpen.value ? tooltipId : undefined,
	onMouseEnter: scheduleOpen,
	onMouseLeave: scheduleClose,
	onFocus: openNow,
	onBlur: closeNow,
	onKeyDown: (event: KeyboardEvent) => {
		if (event.key === "Escape") closeNow();
	},
}));

const setTriggerEl = (element: HTMLElement | null) => {
	triggerEl.value = element;
};
</script>

<template>
	<TriggerHost
		:content="slots.default"
		:bindings="triggerBindings"
		:on-element="setTriggerEl"
	/>
	<FloatingSurface
		v-bind="attrs"
		:open="isOpen"
		:anchor="triggerEl"
		:side="props.side"
		:align="props.align"
		:offset="props.offset"
		:id="tooltipId"
		role="tooltip"
		surface-class="tooltip"
		:close-on-escape="false"
		:close-on-outside-pointer-down="false"
		:inline="props.inline"
		:container="props.container"
	>
		<slot name="content">{{ props.content }}</slot>
	</FloatingSurface>
</template>
