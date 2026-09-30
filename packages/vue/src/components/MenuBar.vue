<script lang="ts">
import type { MenuEntry } from "./MenuPopup.vue";

export interface MenuBarItem {
	/** Menu caption. The access key is underlined automatically. */
	label: string;
	/** Letter to underline, matched case-insensitively. */
	accessKey?: string;
	disabled?: boolean;
	/** Called when this entry is activated (click, Enter or Space). */
	onSelect?: () => void;
	/**
	 * Entries for the drop-down this caption opens.
	 *
	 * When present the caption behaves like the `File` / `Edit` menus of a real
	 * Windows 98 window: click or <kbd>Enter</kbd> opens it, ←/→ walk across the
	 * menu bar, and hovering another caption switches menus while one is open.
	 */
	items?: MenuEntry[];
}

export interface MenuBarProps {
	/** Either plain labels or full `MenuBarItem` descriptors. */
	items: Array<MenuBarItem | string>;
	/** Accessible name for the `role="menubar"` element. */
	label?: string;
}

function normalize(item: MenuBarItem | string): MenuBarItem {
	return typeof item === "string" ? { label: item } : item;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue";
import { refToElement } from "../utils/trigger";
import { AccessKey } from "./AccessKey";
import MenuPopup from "./MenuPopup.vue";

/**
 * A horizontal menu bar (`File Edit View …`).
 *
 * Adds roving-focus keyboard support on top of the original CSS: ←/→ move
 * between entries, Home/End jump to the ends, and Enter/Space activate. Entries
 * that declare `items` open a real drop-down menu — Windows 98 style, where the
 * arrows keep walking the bar while a menu is open.
 *
 * ```vue
 * <MenuBar
 *   :items="[
 *     {
 *       label: 'File',
 *       accessKey: 'F',
 *       items: [
 *         { label: 'New', shortcut: 'Ctrl+N', onSelect: () => {} },
 *         { type: 'separator' },
 *         { label: 'Exit', onSelect: () => {} },
 *       ],
 *     },
 *     { label: 'Edit', accessKey: 'E' },
 *   ]"
 * />
 * ```
 */
defineOptions({ name: "MenuBar", inheritAttrs: false });

const props = withDefaults(defineProps<MenuBarProps>(), {
	label: "Menu",
});

const emit = defineEmits<{
	/** React's `onSelect`, in addition to a per-item `onSelect`. */
	select: [item: MenuBarItem, index: number];
}>();

const attrs = useAttrs();

const normalized = computed<MenuBarItem[]>(() => props.items.map(normalize));
const itemRefs: Array<HTMLElement | null> = [];
// The caption the open menu is anchored to; read by `useFloating` when the
// menu mounts, so it must be set before `openIndex` changes.
const anchorEl = ref<HTMLElement | null>(null);
const openIndex = ref<number | null>(null);

const setItemRef = (index: number, element: unknown) => {
	itemRefs[index] = refToElement(element);
};

const step = (from: number, direction: -1 | 1) => {
	const total = normalized.value.length;
	if (total === 0) return from;
	for (let offset = 1; offset <= total; offset += 1) {
		const candidate = (from + direction * offset + total * offset) % total;
		if (!normalized.value[candidate].disabled) return candidate;
	}
	return from;
};

const edge = (direction: -1 | 1) => {
	const total = normalized.value.length;
	for (let offset = 0; offset < total; offset += 1) {
		const index = direction === 1 ? offset : total - 1 - offset;
		if (!normalized.value[index].disabled) return index;
	}
	return -1;
};

const focusItem = (index: number) => {
	if (index > -1) itemRefs[index]?.focus();
};

/**
 * Hands focus back to a caption once its menu is gone — but only when focus
 * was lost with the menu. A click on another control must keep that control.
 */
const restoreCaptionFocus = (index: number) => {
	window.requestAnimationFrame(() => {
		const active = document.activeElement;
		if (active && active !== document.body) return;
		focusItem(index);
	});
};

const hasMenu = (item: MenuBarItem) => item.items !== undefined && item.items.length > 0;

const openMenu = (index: number) => {
	const item = normalized.value[index];
	if (!item || item.disabled || !item.items || item.items.length === 0) return;
	anchorEl.value = itemRefs[index] ?? null;
	openIndex.value = index;
};

const closeMenu = (restoreFocus = true) => {
	const index = openIndex.value;
	openIndex.value = null;
	if (restoreFocus && index !== null) restoreCaptionFocus(index);
};

const activate = (item: MenuBarItem, index: number) => {
	if (item.disabled) return;
	item.onSelect?.();
	emit("select", item, index);
	if (item.items && item.items.length > 0) openMenu(index);
};

const handleKeyDown = (event: KeyboardEvent, index: number) => {
	const item = normalized.value[index];

	switch (event.key) {
		case "ArrowRight":
		case "ArrowLeft": {
			event.preventDefault();
			const direction: -1 | 1 = event.key === "ArrowRight" ? 1 : -1;
			const next = step(index, direction);
			focusItem(next);
			if (openIndex.value !== null) {
				if (normalized.value[next]?.items) openMenu(next);
				else closeMenu(false);
			}
			break;
		}
		case "Home":
			event.preventDefault();
			focusItem(edge(1));
			break;
		case "End":
			event.preventDefault();
			focusItem(edge(-1));
			break;
		case "ArrowDown":
			if (item.items && item.items.length > 0) {
				event.preventDefault();
				openMenu(index);
			}
			break;
		case "Enter":
		case " ":
			event.preventDefault();
			activate(item, index);
			break;
		default:
			break;
	}
};

const handleMouseDown = (event: MouseEvent, index: number) => {
	const item = normalized.value[index];
	if (item.disabled) {
		event.preventDefault();
		return;
	}
	// Captions with a menu toggle, so a second click closes it again.
	if (item.items && item.items.length > 0 && openIndex.value === index) {
		closeMenu();
		return;
	}
	activate(item, index);
};

const handleMouseEnter = (item: MenuBarItem, index: number) => {
	// Windows 98 switches menus as soon as the pointer reaches another caption.
	if (openIndex.value !== null && openIndex.value !== index && hasMenu(item) && !item.disabled) {
		openMenu(index);
	}
};

/** ArrowLeft/ArrowRight past the edge of the top-level menu. */
const handleNavigateSibling = (direction: -1 | 1) => {
	if (openIndex.value === null) return;
	const next = step(openIndex.value, direction);
	if (normalized.value[next]?.items) {
		openMenu(next);
		focusItem(next);
	} else {
		closeMenu();
	}
};

const openItem = computed(() =>
	openIndex.value === null ? undefined : normalized.value[openIndex.value],
);
</script>

<template>
	<ul
		role="menubar"
		:aria-label="props.label"
		class="menu-bar"
		v-bind="attrs"
	>
		<li
			v-for="(item, index) in normalized"
			:key="`${item.label}-${index}`"
			:ref="(element) => setItemRef(index, element)"
			role="menuitem"
			:tabindex="item.disabled ? -1 : 0"
			:aria-disabled="item.disabled || undefined"
			:aria-haspopup="hasMenu(item) ? 'menu' : undefined"
			:aria-expanded="hasMenu(item) ? openIndex === index : undefined"
			@keydown="handleKeyDown($event, index)"
			@mousedown="handleMouseDown($event, index)"
			@mouseenter="handleMouseEnter(item, index)"
		>
			<AccessKey :label="item.label" :access-key="item.accessKey" />
		</li>
	</ul>

	<!-- Re-mounting per caption gives each menu a fresh first-item focus
	     and a fresh z-index, exactly like opening it for the first time. -->
	<MenuPopup
		v-if="openItem && openItem.items"
		:key="openIndex ?? -1"
		open
		:anchor="anchorEl"
		:items="openItem.items"
		:label="openItem.label"
		:restore-focus="false"
		@dismiss="closeMenu()"
		@navigate-sibling="handleNavigateSibling"
	/>
</template>
