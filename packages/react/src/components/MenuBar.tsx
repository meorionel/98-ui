import {
	forwardRef,
	useRef,
	useState,
	type HTMLAttributes,
	type KeyboardEvent,
	type MouseEvent,
} from "react";
import { cx } from "../utils/cx";
import { renderAccessKey } from "../utils/accessKey";
import { MenuPopup, type MenuEntry } from "./MenuPopup";

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

export interface MenuBarProps extends Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> {
	/** Either plain labels or full `MenuBarItem` descriptors. */
	items: Array<MenuBarItem | string>;
	/** Called for every activation, in addition to a per-item `onSelect`. */
	onSelect?: (item: MenuBarItem, index: number) => void;
	/** Accessible name for the `role="menubar"` element. */
	label?: string;
}

function normalize(item: MenuBarItem | string): MenuBarItem {
	return typeof item === "string" ? { label: item } : item;
}

/**
 * A horizontal menu bar (`File Edit View …`).
 *
 * Adds roving-focus keyboard support on top of the original CSS: ←/→ move
 * between entries, Home/End jump to the ends, and Enter/Space activate. Entries
 * that declare `items` open a real drop-down menu — Windows 98 style, where the
 * arrows keep walking the bar while a menu is open.
 *
 * ```tsx
 * <MenuBar
 *   items={[
 *     {
 *       label: "File",
 *       accessKey: "F",
 *       items: [
 *         { label: "New", shortcut: "Ctrl+N", onSelect: () => {} },
 *         { type: "separator" },
 *         { label: "Exit", onSelect: () => {} },
 *       ],
 *     },
 *     { label: "Edit", accessKey: "E" },
 *   ]}
 * />
 * ```
 */
export const MenuBar = forwardRef<HTMLUListElement, MenuBarProps>(function MenuBar(
	{ items, onSelect, label = "Menu", className, ...rest },
	ref,
) {
	const normalized = items.map(normalize);
	const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
	// The caption the open menu is anchored to; read by `useFloating` when the
	// menu mounts, so it must be set before `openIndex` changes.
	const anchorRef = useRef<HTMLElement | null>(null);
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const step = (from: number, direction: -1 | 1) => {
		const total = normalized.length;
		if (total === 0) return from;
		for (let offset = 1; offset <= total; offset += 1) {
			const candidate = (from + direction * offset + total * offset) % total;
			if (!normalized[candidate].disabled) return candidate;
		}
		return from;
	};

	const edge = (direction: -1 | 1) => {
		const total = normalized.length;
		for (let offset = 0; offset < total; offset += 1) {
			const index = direction === 1 ? offset : total - 1 - offset;
			if (!normalized[index].disabled) return index;
		}
		return -1;
	};

	const focusItem = (index: number) => {
		if (index > -1) itemRefs.current[index]?.focus();
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

	const openMenu = (index: number) => {
		const item = normalized[index];
		if (!item || item.disabled || !item.items || item.items.length === 0) return;
		anchorRef.current = itemRefs.current[index];
		setOpenIndex(index);
	};

	const closeMenu = (restoreFocus = true) => {
		const index = openIndex;
		setOpenIndex(null);
		if (restoreFocus && index !== null) restoreCaptionFocus(index);
	};

	const activate = (item: MenuBarItem, index: number) => {
		if (item.disabled) return;
		item.onSelect?.();
		onSelect?.(item, index);
		if (item.items && item.items.length > 0) openMenu(index);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
		const item = normalized[index];

		switch (event.key) {
			case "ArrowRight":
			case "ArrowLeft": {
				event.preventDefault();
				const direction = event.key === "ArrowRight" ? 1 : -1;
				const next = step(index, direction);
				focusItem(next);
				if (openIndex !== null) {
					if (normalized[next]?.items) openMenu(next);
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

	const handleMouseDown = (event: MouseEvent<HTMLLIElement>, index: number) => {
		const item = normalized[index];
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		// Captions with a menu toggle, so a second click closes it again.
		if (item.items && item.items.length > 0 && openIndex === index) {
			closeMenu();
			return;
		}
		activate(item, index);
	};

	const openItem = openIndex === null ? undefined : normalized[openIndex];

	return (
		<>
			<ul
				ref={ref}
				role="menubar"
				aria-label={label}
				className={cx("menu-bar", className)}
				{...rest}
			>
				{normalized.map((item, index) => {
					const hasMenu = item.items !== undefined && item.items.length > 0;
					return (
						<li
							key={`${item.label}-${index}`}
							ref={(node) => {
								itemRefs.current[index] = node;
							}}
							role="menuitem"
							tabIndex={item.disabled ? -1 : 0}
							aria-disabled={item.disabled || undefined}
							aria-haspopup={hasMenu ? "menu" : undefined}
							aria-expanded={hasMenu ? openIndex === index : undefined}
							onKeyDown={(event) => handleKeyDown(event, index)}
							onMouseDown={(event) => handleMouseDown(event, index)}
							onMouseEnter={() => {
								// Windows 98 switches menus as soon as the pointer
								// reaches another caption.
								if (
									openIndex !== null &&
									openIndex !== index &&
									hasMenu &&
									!item.disabled
								) {
									openMenu(index);
								}
							}}
						>
							{renderAccessKey(item.label, item.accessKey)}
						</li>
					);
				})}
			</ul>

			{openItem?.items ? (
				<MenuPopup
					// Re-mounting per caption gives each menu a fresh first-item focus
					// and a fresh z-index, exactly like opening it for the first time.
					key={openIndex}
					open
					anchorRef={anchorRef}
					items={openItem.items}
					label={openItem.label}
					restoreFocus={false}
					onDismiss={() => closeMenu()}
					onNavigateSibling={(direction) => {
						if (openIndex === null) return;
						const next = step(openIndex, direction);
						if (normalized[next]?.items) {
							openMenu(next);
							focusItem(next);
						} else {
							closeMenu();
						}
					}}
				/>
			) : null}
		</>
	);
});
