import {
	useEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
} from "react";
import { cx } from "../utils/cx";
import { renderAccessKey } from "../utils/accessKey";
import { focusElement } from "../utils/focusTrap";
import { FloatingSurface, type Align, type Side } from "../utils/floating";
import { useIsomorphicLayoutEffect } from "../utils/layoutEffect";

/* ------------------------------------------------------------------ entries */

export interface MenuItemEntry {
	/** Defaults to `"item"`, so plain commands can omit it. */
	type?: "item";
	label: ReactNode;
	/** Called when the entry is activated. */
	onSelect?: () => void;
	disabled?: boolean;
	/** Letter underlined in the label, matched case-insensitively. */
	accessKey?: string;
	/** Right-aligned accelerator hint, e.g. `"Ctrl+S"`. */
	shortcut?: string;
	/** Glyph shown in the left gutter. */
	icon?: ReactNode;
	/** Leave the menu open after activating this entry. */
	keepOpen?: boolean;
}

export interface MenuSeparatorEntry {
	type: "separator";
}

export interface MenuLabelEntry {
	type: "label";
	label: ReactNode;
}

export interface MenuCheckboxEntry {
	type: "checkbox";
	label: ReactNode;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	accessKey?: string;
	keepOpen?: boolean;
}

export interface MenuRadioEntry {
	type: "radio";
	label: ReactNode;
	value: string;
	checked?: boolean;
	onCheckedChange?: (value: string) => void;
	disabled?: boolean;
	accessKey?: string;
	keepOpen?: boolean;
}

export interface MenuSubmenuEntry {
	type: "submenu";
	label: ReactNode;
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

/* -------------------------------------------------------------------- level */

interface MenuLevelProps {
	items: MenuEntry[];
	/** `0` for the menu itself, `1+` inside a submenu. */
	depth: number;
	/** Close the whole menu. */
	onDismiss?: () => void;
	/** ArrowLeft/ArrowRight past the edge of the top-level menu. */
	onNavigateSibling?: (direction: -1 | 1) => void;
	/** Close *this* submenu and hand focus back to the entry that opened it. */
	onRequestClose?: (restoreFocus: boolean) => void;
}

/**
 * One level of a menu: the list of entries plus its keyboard behaviour.
 *
 * Submenus are rendered as a nested `MenuLevel` inside their parent entry, which
 * is exactly how Windows 98 nests them — the DOM mirrors the menu tree, so a
 * key press bubbles from the open submenu back into the menu that owns it.
 */
function MenuLevel({ items, depth, onDismiss, onNavigateSibling, onRequestClose }: MenuLevelProps) {
	const resolved = items.map(resolve);
	const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
	const itemsRef = useRef(resolved);
	itemsRef.current = resolved;

	const [openSubmenu, setOpenSubmenu] = useState(-1);
	const [submenuFlipped, setSubmenuFlipped] = useState(false);
	const submenuRef = useRef<HTMLDivElement | null>(null);
	const typeahead = useRef({ query: "", timer: 0 });

	// Focus the first entry when the level appears. Mount-only: re-focusing on
	// every render would fight the user for focus while the menu is open.
	useEffect(() => {
		const index = itemsRef.current.findIndex(isNavigable);
		if (index < 0) return;
		const frame = window.requestAnimationFrame(() => focusElement(itemRefs.current[index]));
		return () => window.cancelAnimationFrame(frame);
	}, []);

	// Keep an open submenu inside the viewport by flipping it when it would
	// overflow the right edge.
	useIsomorphicLayoutEffect(() => {
		if (openSubmenu < 0) return;
		const box = submenuRef.current;
		if (!box || typeof window === "undefined") return;
		setSubmenuFlipped(box.getBoundingClientRect().right > window.innerWidth - 4);
	}, [openSubmenu]);

	const focusItem = (index: number) => {
		if (index < 0) return;
		focusElement(itemRefs.current[index]);
	};

	const move = (from: number, direction: -1 | 1) => {
		const total = resolved.length;
		if (total === 0) return;
		for (let step = 1; step <= total; step += 1) {
			const candidate = (from + direction * step + total * step) % total;
			if (isNavigable(resolved[candidate])) {
				setOpenSubmenu(-1);
				focusItem(candidate);
				return;
			}
		}
	};

	const edge = (direction: -1 | 1) => {
		const total = resolved.length;
		for (let step = 0; step < total; step += 1) {
			const index = direction === 1 ? step : total - 1 - step;
			if (isNavigable(resolved[index])) {
				setOpenSubmenu(-1);
				focusItem(index);
				return;
			}
		}
	};

	const activate = (index: number) => {
		const entry = resolved[index];
		if (!entry || !isNavigable(entry)) return;

		if (entry.type === "submenu") {
			setOpenSubmenu(index);
			return;
		}
		if (entry.type === "checkbox") entry.onCheckedChange?.(entry.checked !== true);
		else if (entry.type === "radio") entry.onCheckedChange?.(entry.value);
		else if (entry.type === "item") entry.onSelect?.();

		if (!("keepOpen" in entry) || entry.keepOpen !== true) onDismiss?.();
	};

	/** Index of the entry that currently has DOM focus, if any. */
	const focusedIndex = () =>
		itemRefs.current.findIndex((node) => node !== null && node === document.activeElement);

	const handleTypeahead = (key: string) => {
		const state = typeahead.current;
		state.query += key.toLowerCase();
		window.clearTimeout(state.timer);
		state.timer = window.setTimeout(() => {
			state.query = "";
		}, 500);

		const found = resolved.findIndex(
			(entry) =>
				isNavigable(entry) &&
				(textOf(entry)?.toLowerCase().startsWith(state.query) ?? false),
		);
		if (found > -1) {
			setOpenSubmenu(-1);
			focusItem(found);
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
		const from = (() => {
			const focused = focusedIndex();
			if (focused > -1) return focused;
			return resolved.findIndex(isNavigable);
		})();
		const entry = resolved[from];

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
					setOpenSubmenu(from);
					return;
				}
				if (depth === 0 && onNavigateSibling) {
					event.preventDefault();
					onNavigateSibling(1);
				}
				return;
			case "ArrowLeft":
				if (depth > 0) {
					// Handled here, so the menu bar does not also react to it.
					event.preventDefault();
					event.stopPropagation();
					onRequestClose?.(true);
					return;
				}
				if (onNavigateSibling) {
					event.preventDefault();
					onNavigateSibling(-1);
				}
				return;
			case "Escape":
				if (depth > 0) {
					event.preventDefault();
					event.stopPropagation();
					onRequestClose?.(true);
				}
				// At depth 0 the layer's dismiss handler closes the menu.
				return;
			case "Tab":
				// Windows 98 menus close when you tab out of them.
				onDismiss?.();
				return;
			default:
				if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
					handleTypeahead(event.key);
				}
				return;
		}
	};

	const renderEntry = (entry: ResolvedEntry, index: number) => {
		if (entry.type === "separator") {
			return <li key={index} role="separator" className="menu-popup-separator" />;
		}
		if (entry.type === "label") {
			return (
				<li key={index} role="none" className="menu-popup-label">
					{entry.label}
				</li>
			);
		}

		const disabled = entry.disabled === true;
		const isSubmenu = entry.type === "submenu";
		const submenuOpen = isSubmenu && openSubmenu === index;
		const label =
			typeof entry.label === "string"
				? renderAccessKey(entry.label, entry.accessKey)
				: entry.label;

		return (
			<li
				key={index}
				ref={(node) => {
					itemRefs.current[index] = node;
				}}
				role={
					entry.type === "checkbox"
						? "menuitemcheckbox"
						: entry.type === "radio"
							? "menuitemradio"
							: "menuitem"
				}
				aria-checked={
					entry.type === "checkbox" || entry.type === "radio"
						? entry.checked === true
						: undefined
				}
				aria-disabled={disabled || undefined}
				aria-haspopup={isSubmenu ? "menu" : undefined}
				aria-expanded={isSubmenu ? submenuOpen : undefined}
				tabIndex={-1}
				className={cx("menu-popup-item", disabled && "menu-popup-item-disabled")}
				onMouseDown={(event) => event.preventDefault()}
				onMouseEnter={() => {
					if (disabled) return;
					focusItem(index);
					setOpenSubmenu(isSubmenu ? index : -1);
				}}
				onMouseLeave={() => {
					if (submenuOpen) setOpenSubmenu(-1);
				}}
				onClick={() => activate(index)}
			>
				<span className="menu-popup-glyph" aria-hidden="true">
					{entry.type === "checkbox" && entry.checked === true ? (
						<span className="menu-popup-check" />
					) : null}
					{entry.type === "radio" && entry.checked === true ? (
						<span className="menu-popup-dot" />
					) : null}
					{entry.type === "item" && entry.icon !== undefined ? (
						<span className="menu-popup-icon">{entry.icon}</span>
					) : null}
				</span>

				<span className="menu-popup-text">{label}</span>

				{entry.type === "item" && entry.shortcut !== undefined ? (
					<span className="menu-popup-shortcut">{entry.shortcut}</span>
				) : null}

				{isSubmenu ? <span className="menu-popup-arrow" aria-hidden="true" /> : null}

				{submenuOpen && entry.type === "submenu" ? (
					<div
						ref={submenuRef}
						className={cx(
							"menu-popup",
							"menu-popup-submenu",
							submenuFlipped && "menu-popup-submenu-flipped",
						)}
					>
						<MenuLevel
							items={entry.items}
							depth={depth + 1}
							onDismiss={onDismiss}
							onRequestClose={(restoreFocus) => {
								setOpenSubmenu(-1);
								if (restoreFocus) focusItem(index);
							}}
						/>
					</div>
				) : null}
			</li>
		);
	};

	return (
		// `role="none"` keeps the list out of the accessibility tree so the
		// `menuitem` children belong directly to the `role="menu"` surface.
		<ul role="none" className="menu-popup-list" onKeyDown={handleKeyDown}>
			{resolved.map(renderEntry)}
		</ul>
	);
}

/* -------------------------------------------------------------------- popup */

export interface MenuPopupProps {
	/** The entries to render. */
	items: MenuEntry[];
	/** Mount the popup. Defaults to `true`, so it can be rendered on its own. */
	open?: boolean;
	/** Element to position against. */
	anchorRef?: RefObject<HTMLElement | null>;
	/** Position at a viewport point instead — how a context menu follows the cursor. */
	point?: { x: number; y: number } | null;
	/** Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`, the Windows 98 menu alignment. */
	align?: Align;
	offset?: number;
	/** Called when the menu wants to close. */
	onDismiss?: () => void;
	/** ArrowLeft/ArrowRight past the edge of the top-level menu (used by `MenuBar`). */
	onNavigateSibling?: (direction: -1 | 1) => void;
	/** Accessible name for the `role="menu"` surface. */
	label?: string;
	className?: string;
	/** Extra elements that count as "inside" for dismissal. */
	ignoreRefs?: Array<RefObject<HTMLElement | null>>;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	zIndex?: number;
	/** Give focus back to the trigger when the menu closes. Defaults to `true`. */
	restoreFocus?: boolean;
}

/**
 * A drop-down menu surface — the popup behind `DropdownMenu`, `ContextMenu` and
 * the `MenuBar`.
 *
 * It owns positioning, keyboard navigation (arrows, Home/End, type-ahead),
 * submenus, and the Win98 highlight rules; the caller owns the trigger. Use it
 * directly when you need a menu anchored to something the other components do
 * not cover.
 */
export function MenuPopup({
	items,
	open = true,
	anchorRef,
	point,
	side,
	align = "start",
	offset,
	onDismiss,
	onNavigateSibling,
	label,
	className,
	ignoreRefs,
	inline,
	container,
	zIndex,
	restoreFocus,
}: MenuPopupProps) {
	return (
		<FloatingSurface
			open={open}
			anchorRef={anchorRef}
			point={point}
			side={side}
			align={align}
			offset={offset}
			onDismiss={onDismiss}
			ignoreRefs={ignoreRefs}
			role="menu"
			label={label}
			className={cx("menu-popup", className)}
			autoFocus
			restoreFocus={restoreFocus}
			inline={inline}
			container={container}
			zIndex={zIndex}
		>
			<MenuLevel
				items={items}
				depth={0}
				onDismiss={onDismiss}
				onNavigateSibling={onNavigateSibling}
			/>
		</FloatingSurface>
	);
}
