<script lang="ts">
import type { MenuEntry } from "./MenuPopup.vue";

/** Where the menu should open: at the pointer, or under the focused element. */
type ContextAnchor = { kind: "point"; x: number; y: number } | { kind: "element" };

export interface ContextMenuProps {
	/** The entries to render. */
	items: MenuEntry[];
	/** Accessible name for the menu. */
	label?: string;
	/** Render the popup in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import MenuPopup from "./MenuPopup.vue";

/**
 * A right-click menu, the way Windows 98 shell surfaces behave.
 *
 * ```vue
 * <ContextMenu :items="[{ label: 'Rename' }, { label: 'Delete' }]">
 *   <SunkenPanel>Right-click me</SunkenPanel>
 * </ContextMenu>
 * ```
 *
 * Opens at the pointer for a mouse, and under the focused element for the
 * keyboard — <kbd>Shift</kbd>+<kbd>F10</kbd> or the dedicated Menu key, both of
 * which Windows has supported since 95.
 */
defineOptions({ name: "ContextMenu", inheritAttrs: false });

const props = withDefaults(defineProps<ContextMenuProps>(), {
	label: undefined,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	/** React's `onOpenChange`. */
	"open-change": [open: boolean];
}>();

const attrs = useAttrs();

const areaEl = ref<HTMLElement | null>(null);
// The element a keyboard-opened menu anchors to (the area has no box of its own).
const keyboardAnchor = ref<HTMLElement | null>(null);
const anchor = ref<ContextAnchor | null>(null);

const isOpen = computed(() => anchor.value !== null);
const menuAnchor = computed(() =>
	anchor.value?.kind === "element" ? keyboardAnchor.value : areaEl.value,
);
const point = computed(() =>
	anchor.value?.kind === "point" ? { x: anchor.value.x, y: anchor.value.y } : null,
);

const close = () => {
	anchor.value = null;
	emit("open-change", false);
};

const handleContextMenu = (event: MouseEvent) => {
	event.preventDefault();
	keyboardAnchor.value = null;
	anchor.value = { kind: "point", x: event.clientX, y: event.clientY };
	emit("open-change", true);
};

const handleKeyDown = (event: KeyboardEvent) => {
	const isMenuKey = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
	if (!isMenuKey) return;
	event.preventDefault();
	keyboardAnchor.value = event.target as HTMLElement;
	anchor.value = { kind: "element" };
	emit("open-change", true);
};
</script>

<template>
	<div
		class="context-menu-area"
		v-bind="attrs"
		ref="areaEl"
		@contextmenu="handleContextMenu"
		@keydown="handleKeyDown"
	>
		<slot />
	</div>

	<MenuPopup
		:open="isOpen"
		:anchor="menuAnchor"
		:point="point"
		:items="props.items"
		:label="props.label"
		@dismiss="close"
		:inline="props.inline"
		:container="props.container"
	/>
</template>
