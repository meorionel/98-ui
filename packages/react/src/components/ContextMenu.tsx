import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { MenuPopup, type MenuEntry } from "./MenuPopup";

/** Where the menu should open: at the pointer, or under the focused element. */
type ContextAnchor = { kind: "point"; x: number; y: number } | { kind: "element" };

export interface ContextMenuProps {
	/** The entries to render. */
	items: MenuEntry[];
	/** The area that owns the menu. Right-clicking anywhere inside opens it. */
	children: ReactNode;
	/** Accessible name for the menu. */
	label?: string;
	onOpenChange?: (open: boolean) => void;
	/** Render the popup in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A right-click menu, the way Windows 98 shell surfaces behave.
 *
 * ```tsx
 * <ContextMenu items={[{ label: "Rename" }, { label: "Delete" }]}>
 *   <SunkenPanel>Right-click me</SunkenPanel>
 * </ContextMenu>
 * ```
 *
 * Opens at the pointer for a mouse, and under the focused element for the
 * keyboard — <kbd>Shift</kbd>+<kbd>F10</kbd> or the dedicated Menu key, both of
 * which Windows has supported since 95.
 */
export function ContextMenu({
	items,
	children,
	label,
	onOpenChange,
	inline,
	container,
	className,
}: ContextMenuProps) {
	const areaRef = useRef<HTMLDivElement | null>(null);
	// The element a keyboard-opened menu anchors to (the area has no box of its own).
	const keyboardAnchorRef = useRef<HTMLElement | null>(null);
	const [anchor, setAnchor] = useState<ContextAnchor | null>(null);

	const close = () => {
		setAnchor(null);
		onOpenChange?.(false);
	};

	const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		keyboardAnchorRef.current = null;
		setAnchor({ kind: "point", x: event.clientX, y: event.clientY });
		onOpenChange?.(true);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const isMenuKey = event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
		if (!isMenuKey) return;
		event.preventDefault();
		keyboardAnchorRef.current = event.target as HTMLElement;
		setAnchor({ kind: "element" });
		onOpenChange?.(true);
	};

	return (
		<>
			<div
				ref={areaRef}
				className={cx("context-menu-area", className)}
				onContextMenu={handleContextMenu}
				onKeyDown={handleKeyDown}
			>
				{children}
			</div>
			<MenuPopup
				open={anchor !== null}
				anchorRef={anchor?.kind === "element" ? keyboardAnchorRef : areaRef}
				point={anchor?.kind === "point" ? { x: anchor.x, y: anchor.y } : null}
				items={items}
				label={label}
				onDismiss={close}
				inline={inline}
				container={container}
			/>
		</>
	);
}
