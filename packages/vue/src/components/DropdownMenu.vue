<script lang="ts">
import type { Align, Side } from "../utils/floating";
import type { MenuEntry } from "./MenuPopup.vue";

export interface DropdownMenuProps {
	/** The entries to render. */
	items: MenuEntry[];
	/** Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`, which lines the menu up with the trigger's left edge. */
	align?: Align;
	offset?: number;
	/** Accessible name for the menu. */
	label?: string;
	/** Render the trigger inert. */
	disabled?: boolean;
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	/** Render the popup in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { useControllableState } from "../utils/controllable";
import { TriggerHost } from "../utils/trigger";
import MenuPopup from "./MenuPopup.vue";

/**
 * A button that opens a Windows 98 drop-down menu underneath itself.
 *
 * ```vue
 * <DropdownMenu
 *   :items="[
 *     { label: 'New', shortcut: 'Ctrl+N', onSelect: () => newFile() },
 *     { type: 'separator' },
 *     { type: 'submenu', label: 'Recent', items: [{ label: 'report.doc' }] },
 *   ]"
 * >
 *   <template #trigger>
 *     <Button>File</Button>
 *   </template>
 * </DropdownMenu>
 * ```
 *
 * The trigger keeps its own props and handlers — the trigger slot is cloned
 * with `cloneTrigger`, which only adds a ref, the ARIA menu state, and the
 * click/arrow-key behaviour on top. React's `trigger` prop is the `trigger`
 * slot; the default slot is accepted as a shorthand as well.
 */
defineOptions({ name: "DropdownMenu", inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuProps>(), {
	side: undefined,
	align: undefined,
	offset: undefined,
	label: undefined,
	disabled: false,
	open: undefined,
	defaultOpen: false,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	/** React's `onNavigateSibling`: ArrowLeft/ArrowRight past the menu's edge. */
	"navigate-sibling": [direction: -1 | 1];
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
	"aria-haspopup": "menu",
	"aria-expanded": isOpen.value,
	"aria-disabled": props.disabled || undefined,
	onClick: (event: MouseEvent) => {
		if (props.disabled || event.defaultPrevented) return;
		setOpen(!isOpen.value);
	},
	onKeyDown: (event: KeyboardEvent) => {
		if (props.disabled) return;
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			setOpen(true);
			return;
		}
		if (event.key === "Enter" || event.key === " ") {
			// Cancel the click the browser is about to synthesise, so the
			// menu toggles exactly once.
			event.preventDefault();
			setOpen(!isOpen.value);
		}
	},
}));

const setTriggerEl = (element: HTMLElement | null) => {
	triggerEl.value = element;
};

const handleNavigateSibling = (direction: -1 | 1) => emit("navigate-sibling", direction);
</script>

<template>
	<TriggerHost
		:content="slots.trigger ?? slots.default"
		:bindings="triggerBindings"
		:on-element="setTriggerEl"
	/>

	<MenuPopup
		v-bind="attrs"
		:open="isOpen && !props.disabled"
		:anchor="triggerEl"
		:items="props.items"
		:side="props.side"
		:align="props.align"
		:offset="props.offset"
		:label="props.label"
		:inline="props.inline"
		:container="props.container"
		@dismiss="setOpen(false)"
		@navigate-sibling="handleNavigateSibling"
	/>
</template>
