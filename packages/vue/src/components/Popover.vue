<script lang="ts">
import type { Align, Side } from "../utils/floating";

export interface PopoverProps {
	/** Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`. */
	align?: Align;
	offset?: number;
	/** Accessible name for the popover surface. */
	label?: string;
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	/** Move focus to the first focusable element inside. Defaults to `true`. */
	autoFocus?: boolean;
	/** Copy the trigger's width onto the popover. */
	matchAnchorWidth?: boolean;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { useControllableState } from "../utils/controllable";
import FloatingSurface from "../utils/FloatingSurface.vue";
import { TriggerHost } from "../utils/trigger";

/**
 * A non-modal floating panel anchored to a trigger.
 *
 * ```vue
 * <Popover label="File details">
 *   <template #trigger>
 *     <Button>Details</Button>
 *   </template>
 *   <FieldRow><Checkbox label="Read-only" /></FieldRow>
 * </Popover>
 * ```
 *
 * Unlike `Dialog` a popover does not trap focus, dim the page or lock scrolling:
 * it is the Win98 equivalent of an inspector or a floating palette. Escape, an
 * outside click, or a second press of the trigger all close it, and focus goes
 * back to the trigger.
 *
 * The trigger is the `trigger` slot; the default slot is the popover's content.
 */
defineOptions({ name: "Popover", inheritAttrs: false });

const props = withDefaults(defineProps<PopoverProps>(), {
	side: undefined,
	align: undefined,
	offset: undefined,
	label: undefined,
	open: undefined,
	defaultOpen: false,
	autoFocus: true,
	matchAnchorWidth: false,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
}>();

const slots = defineSlots<{ trigger?: () => unknown; default?: () => unknown }>();
const attrs = useAttrs();

const triggerEl = ref<HTMLElement | null>(null);

const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const triggerBindings = computed<Record<string, unknown>>(() => ({
	"aria-haspopup": "dialog",
	"aria-expanded": isOpen.value,
	onClick: (event: MouseEvent) => {
		if (event.defaultPrevented) return;
		setOpen(!isOpen.value);
	},
	onKeyDown: (event: KeyboardEvent) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setOpen(true);
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setOpen(!isOpen.value);
		}
	},
}));

const setTriggerEl = (element: HTMLElement | null) => {
	triggerEl.value = element;
};
</script>

<template>
	<TriggerHost
		:content="slots.trigger"
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
		:match-anchor-width="props.matchAnchorWidth"
		role="dialog"
		:label="props.label"
		surface-class="popover"
		:auto-focus="props.autoFocus"
		:trap-focus="false"
		:restore-focus="props.autoFocus"
		:inline="props.inline"
		:container="props.container"
		@dismiss="setOpen(false)"
	>
		<slot />
	</FloatingSurface>
</template>
