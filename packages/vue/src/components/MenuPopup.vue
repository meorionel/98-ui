<script lang="ts">
import type { VNode, VNodeChild } from "vue";
import type { Align, Side } from "../utils/floating";

/* ------------------------------------------------------------------ entries */

export interface MenuItemEntry {
	/** Defaults to `"item"`, so plain commands can omit it. */
	type?: "item";
	/** React's `ReactNode`; Vue's counterpart is `VNodeChild`. */
	label: VNodeChild;
	/** Called when the entry is activated. */
	onSelect?: () => void;
	disabled?: boolean;
	/** Letter underlined in the label, matched case-insensitively. */
	accessKey?: string;
	/** Right-aligned accelerator hint, e.g. `"Ctrl+S"`. */
	shortcut?: string;
	/** Glyph shown in the left gutter. */
	icon?: VNodeChild;
	/** Leave the menu open after activating this entry. */
	keepOpen?: boolean;
}

export interface MenuSeparatorEntry {
	type: "separator";
}

export interface MenuLabelEntry {
	type: "label";
	label: VNodeChild;
}

export interface MenuCheckboxEntry {
	type: "checkbox";
	label: VNodeChild;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	accessKey?: string;
	keepOpen?: boolean;
}

export interface MenuRadioEntry {
	type: "radio";
	label: VNodeChild;
	value: string;
	checked?: boolean;
	onCheckedChange?: (value: string) => void;
	disabled?: boolean;
	accessKey?: string;
	keepOpen?: boolean;
}

export interface MenuSubmenuEntry {
	type: "submenu";
	label: VNodeChild;
	items: MenuEntry[];
	disabled?: boolean;
	accessKey?: string;
}

/** Every flavour of entry a menu can hold. */
export type MenuEntry =
	| MenuItemEntry
	| MenuSeparatorEntry
	| MenuLabelEntry
	| MenuCheckboxEntry
	| MenuRadioEntry
	| MenuSubmenuEntry;

/** The same union with `type` guaranteed, so it can be narrowed on. */
type ResolvedEntry = MenuEntry & { type: NonNullable<MenuEntry["type"]> };

function resolve(entry: MenuEntry): ResolvedEntry {
	return (entry.type === undefined ? { ...entry, type: "item" } : entry) as ResolvedEntry;
}

/** Entries the user can move to and activate. */
function isNavigable(entry: ResolvedEntry): boolean {
	return entry.type !== "separator" && entry.type !== "label" && entry.disabled !== true;
}

function textOf(entry: ResolvedEntry): string | null {
	if (entry.type === "separator" || entry.type === "label") return null;
	return typeof entry.label === "string" ? entry.label : null;
}

/** The first entry arrow keys should land on. */
export function firstNavigableIndex(items: MenuEntry[]): number {
	return items.map(resolve).findIndex(isNavigable);
}

/* -------------------------------------------------------------------- popup */

export interface MenuPopupProps {
	/** The entries to render. */
	items: MenuEntry[];
	/** Mount the popup. Defaults to `true`, so it can be rendered on its own. */
	open?: boolean;
	/** Element to position against. React's `anchorRef`, as an element. */
	anchor?: HTMLElement | null;
	/** Position at a viewport point instead — how a context menu follows the cursor. */
	point?: { x: number; y: number } | null;
	/** Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`, the Windows 98 menu alignment. */
	align?: Align;
	offset?: number;
	/** Accessible name for the `role="menu"` surface. */
	label?: string;
	/** Extra elements that count as "inside" for dismissal. React's `ignoreRefs`. */
	ignore?: Array<HTMLElement | null | undefined>;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	zIndex?: number;
	/** Give focus back to the trigger when the menu closes. Defaults to `true`. */
	restoreFocus?: boolean;
	/**
	 * Internal recursion plumbing, React's `MenuLevel` `depth`: `0` for the menu
	 * itself, `1+` inside a submenu. A submenu is the same component mounted at
	 * `depth + 1`, so the DOM mirrors the menu tree and a key press bubbles from
	 * the open submenu back into the menu that owns it.
	 */
	depth?: number;
}
</script>

<script setup lang="ts">
import {
	computed,
	createTextVNode,
	createVNode,
	Fragment,
	getCurrentInstance,
	isVNode,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from "vue";
import { cx } from "../utils/cx";
import { focusElement } from "../utils/focusTrap";
import FloatingSurface from "../utils/FloatingSurface.vue";
import { refToElement, RenderVNode } from "../utils/trigger";
import { AccessKey } from "./AccessKey";

/**
 * A drop-down menu surface — the popup behind `DropdownMenu`, `ContextMenu` and
 * the `MenuBar`.
 *
 * It owns positioning, keyboard navigation (arrows, Home/End, type-ahead),
 * submenus, and the Win98 highlight rules; the caller owns the trigger. Use it
 * directly when you need a menu anchored to something the other components do
 * not cover.
 */
defineOptions({ name: "MenuPopup" });

const props = withDefaults(defineProps<MenuPopupProps>(), {
	open: true,
	anchor: null,
	point: null,
	side: undefined,
	align: "start",
	offset: undefined,
	label: undefined,
	ignore: () => [],
	inline: false,
	container: null,
	zIndex: undefined,
	restoreFocus: undefined,
	depth: 0,
});

const emit = defineEmits<{
	/** React's `onDismiss`: the whole menu wants to close. */
	dismiss: [];
	/** Every activation, with the entry that ran. Additive to React's surface. */
	select: [entry: MenuEntry, index: number];
	/** React's `onNavigateSibling`: ArrowLeft/ArrowRight past the edge. */
	"navigate-sibling": [direction: -1 | 1];
	/** A submenu asked to close and hand focus back to the entry that opened it. */
	"request-close": [restoreFocus: boolean];
}>();

const instance = getCurrentInstance();

const resolved = computed<ResolvedEntry[]>(() => props.items.map(resolve));

/** The `<li>` of every entry, so arrow keys and hover can move real DOM focus. */
const itemRefs: Array<HTMLElement | null> = [];
const rootEl = ref<HTMLElement | null>(null);
const openSubmenu = ref(-1);
const submenuFlipped = ref(false);

/**
 * Renders any `MenuNode` through `RenderVNode`, which only accepts a single
 * vnode: text and numbers become text nodes, vnode arrays a fragment.
 */
const toVNode = (node: VNodeChild): VNode | null => {
	if (node === null || node === undefined || typeof node === "boolean") return null;
	if (isVNode(node)) return node;
	if (Array.isArray(node)) return createVNode(Fragment, null, node);
	return createTextVNode(String(node));
};

const setItemRef = (index: number, element: unknown) => {
	itemRefs[index] = refToElement(element);
};

const setRootEl = (element: unknown) => {
	rootEl.value = refToElement(element);
};

/**
 * The floating surface at depth `0`, and the submenu wrapper inside a submenu.
 *
 * React split these between `MenuPopup` (the surface) and `MenuLevel` (the
 * wrapper div); one recursive component has to switch on `depth` instead, so
 * the rendered DOM stays exactly the same.
 */
const wrapperProps = computed<Record<string, unknown>>(() => {
	if (props.depth === 0) {
		return {
			open: props.open,
			anchor: props.anchor,
			point: props.point,
			side: props.side,
			align: props.align,
			offset: props.offset,
			ignore: props.ignore,
			role: "menu",
			label: props.label,
			surfaceClass: "menu-popup",
			autoFocus: true,
			initialFocus: () => itemRefs[firstNavigableIndex()] ?? null,
			restoreFocus: props.restoreFocus,
			inline: props.inline,
			container: props.container,
			zIndex: props.zIndex,
			onDismiss: () => emit("dismiss"),
		};
	}
	return {
		class: cx(
			"menu-popup",
			"menu-popup-submenu",
			submenuFlipped.value && "menu-popup-submenu-flipped",
		),
	};
});

const focusItem = (index: number) => {
	if (index < 0) return;
	focusElement(itemRefs[index]);
};

// Focus the first entry whenever the level opens.
//
// A watcher on `open` rather than `onMounted`: the depth-0 surface is rendered
// for the whole life of the `DropdownMenu`, so it is already mounted (and
// closed) by the time the trigger is clicked. React got away with a mount
// effect because its menu level is only created when it opens.
const firstNavigableIndex = () => resolved.value.findIndex(isNavigable);
let focusFrame = 0;
watch(
	() => props.open,
	(isOpen) => {
		// `typeof window` matters: an `immediate` watcher runs during SSR too,
		// where there is no `window` and no DOM to focus.
		if (!isOpen || typeof window === "undefined") return;
		const index = firstNavigableIndex();
		if (index < 0) return;
		focusFrame = window.requestAnimationFrame(() => focusElement(itemRefs[index]));
	},
	{ immediate: true, flush: "post" },
);
onBeforeUnmount(() => {
	if (typeof window !== "undefined") window.cancelAnimationFrame(focusFrame);
});

// Keep an open submenu inside the viewport by flipping it when it would
// overflow the right edge. React measured the wrapper from its parent level;
// a submenu level measures its own wrapper, which is the same element.
onMounted(() => {
	if (props.depth === 0) return;
	const box = rootEl.value;
	if (!box || typeof window === "undefined") return;
	submenuFlipped.value = box.getBoundingClientRect().right > window.innerWidth - 4;
});

const move = (from: number, direction: -1 | 1) => {
	const total = resolved.value.length;
	if (total === 0) return;
	for (let step = 1; step <= total; step += 1) {
		const candidate = (from + direction * step + total * step) % total;
		if (isNavigable(resolved.value[candidate])) {
			openSubmenu.value = -1;
			focusItem(candidate);
			return;
		}
	}
};

const edge = (direction: -1 | 1) => {
	const total = resolved.value.length;
	for (let step = 0; step < total; step += 1) {
		const index = direction === 1 ? step : total - 1 - step;
		if (isNavigable(resolved.value[index])) {
			openSubmenu.value = -1;
			focusItem(index);
			return;
		}
	}
};

const activate = (index: number) => {
	const entry = resolved.value[index];
	if (!entry || !isNavigable(entry)) return;

	if (entry.type === "submenu") {
		openSubmenu.value = index;
		return;
	}
	if (entry.type === "checkbox") entry.onCheckedChange?.(entry.checked !== true);
	else if (entry.type === "radio") entry.onCheckedChange?.(entry.value);
	else if (entry.type === "item") entry.onSelect?.();

	emit("select", entry, index);
	if (!("keepOpen" in entry) || entry.keepOpen !== true) emit("dismiss");
};

/** Close *this* submenu and hand focus back to the entry that opened it. */
const closeSubmenu = (index: number, restoreFocus: boolean) => {
	openSubmenu.value = -1;
	if (restoreFocus) focusItem(index);
};

/** Pass a nested level's dismissal up to the surface that owns the layer. */
const forwardDismiss = () => emit("dismiss");
const forwardSelect = (entry: MenuEntry, index: number) => emit("select", entry, index);

/** `disabled` is declared on the actionable entries only, so read it loosely. */
const isDisabled = (entry: ResolvedEntry) => (entry as { disabled?: boolean }).disabled === true;

const handleItemEnter = (entry: ResolvedEntry, index: number) => {
	if (isDisabled(entry)) return;
	focusItem(index);
	openSubmenu.value = entry.type === "submenu" ? index : -1;
};

const handleItemLeave = (index: number) => {
	if (openSubmenu.value === index) openSubmenu.value = -1;
};

/** Index of the entry that currently has DOM focus, if any. */
const focusedIndex = () =>
	itemRefs.findIndex((node) => node !== null && node === document.activeElement);

/**
 * ArrowLeft/ArrowRight past the edge of the top-level menu.
 *
 * React only handled the key when a listener was attached; a declared emit
 * cannot be introspected, so the parent's listener is read off the vnode.
 */
const navigateSibling = (direction: -1 | 1) => {
	const listener = instance?.vnode.props?.onNavigateSibling;
	if (typeof listener !== "function") return false;
	emit("navigate-sibling", direction);
	return true;
};

const typeahead: { query: string; timer: number } = { query: "", timer: 0 };

const handleTypeahead = (key: string) => {
	typeahead.query += key.toLowerCase();
	window.clearTimeout(typeahead.timer);
	typeahead.timer = window.setTimeout(() => {
		typeahead.query = "";
	}, 500);

	const found = resolved.value.findIndex(
		(entry) =>
			isNavigable(entry) && (textOf(entry)?.toLowerCase().startsWith(typeahead.query) ?? false),
	);
	if (found > -1) {
		openSubmenu.value = -1;
		focusItem(found);
	}
};

const handleKeyDown = (event: KeyboardEvent) => {
	const from = (() => {
		const focused = focusedIndex();
		if (focused > -1) return focused;
		return resolved.value.findIndex(isNavigable);
	})();
	const entry = resolved.value[from];

	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			move(from, 1);
			return;
		case "ArrowUp":
			event.preventDefault();
			move(from, -1);
			return;
		case "Home":
			event.preventDefault();
			edge(1);
			return;
		case "End":
			event.preventDefault();
			edge(-1);
			return;
		case "Enter":
		case " ":
			event.preventDefault();
			activate(from);
			return;
		case "ArrowRight":
			if (entry?.type === "submenu" && entry.disabled !== true) {
				event.preventDefault();
				openSubmenu.value = from;
				return;
			}
			if (props.depth === 0 && navigateSibling(1)) event.preventDefault();
			return;
		case "ArrowLeft":
			if (props.depth > 0) {
				// Handled here, so the menu bar does not also react to it.
				event.preventDefault();
				event.stopPropagation();
				emit("request-close", true);
				return;
			}
			if (navigateSibling(-1)) event.preventDefault();
			return;
		case "Escape":
			if (props.depth > 0) {
				event.preventDefault();
				event.stopPropagation();
				emit("request-close", true);
			}
			// At depth 0 the layer's dismiss handler closes the menu.
			return;
		case "Tab":
			// Windows 98 menus close when you tab out of them.
			emit("dismiss");
			return;
		default:
			if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
				handleTypeahead(event.key);
			}
			return;
	}
};
</script>

<template>
	<component :is="props.depth === 0 ? FloatingSurface : 'div'" v-bind="wrapperProps" :ref="setRootEl">
		<!-- `role="none"` keeps the list out of the accessibility tree so the
		     `menuitem` children belong directly to the `role="menu"` surface. -->
		<ul role="none" class="menu-popup-list" @keydown="handleKeyDown">
			<template v-for="(entry, index) in resolved" :key="index">
				<li v-if="entry.type === 'separator'" role="separator" class="menu-popup-separator" />
				<li v-else-if="entry.type === 'label'" role="none" class="menu-popup-label">
					<RenderVNode :vnode="toVNode(entry.label)" />
				</li>
				<li
					v-else
					:ref="(element) => setItemRef(index, element)"
					:role="
						entry.type === 'checkbox'
							? 'menuitemcheckbox'
							: entry.type === 'radio'
								? 'menuitemradio'
								: 'menuitem'
					"
					:aria-checked="
						entry.type === 'checkbox' || entry.type === 'radio'
							? entry.checked === true
							: undefined
					"
					:aria-disabled="entry.disabled === true || undefined"
					:aria-haspopup="entry.type === 'submenu' ? 'menu' : undefined"
					:aria-expanded="entry.type === 'submenu' ? openSubmenu === index : undefined"
					:tabindex="-1"
					:class="cx('menu-popup-item', entry.disabled === true && 'menu-popup-item-disabled')"
					@mousedown.prevent
					@mouseenter="handleItemEnter(entry, index)"
					@mouseleave="handleItemLeave(index)"
					@click="activate(index)"
				>
					<span class="menu-popup-glyph" aria-hidden="true">
						<span v-if="entry.type === 'checkbox' && entry.checked === true" class="menu-popup-check" />
						<span v-if="entry.type === 'radio' && entry.checked === true" class="menu-popup-dot" />
						<span v-if="entry.type === 'item' && entry.icon !== undefined" class="menu-popup-icon">
							<RenderVNode :vnode="toVNode(entry.icon)" />
						</span>
					</span>

					<span class="menu-popup-text">
						<AccessKey
							v-if="typeof entry.label === 'string'"
							:label="entry.label"
							:access-key="entry.accessKey"
						/>
						<RenderVNode v-else :vnode="toVNode(entry.label)" />
					</span>

					<span v-if="entry.type === 'item' && entry.shortcut !== undefined" class="menu-popup-shortcut">{{
						entry.shortcut
					}}</span>

					<span v-if="entry.type === 'submenu'" class="menu-popup-arrow" aria-hidden="true" />

					<MenuPopup
						v-if="entry.type === 'submenu' && openSubmenu === index"
						:items="entry.items"
						:depth="props.depth + 1"
						@dismiss="forwardDismiss"
						@select="forwardSelect"
						@request-close="closeSubmenu(index, $event)"
					/>
				</li>
			</template>
		</ul>
	</component>
</template>
