import { useRef, type KeyboardEvent, type MouseEvent, type ReactElement } from "react";
import { cloneTrigger } from "../utils/trigger";
import { useControllableState } from "../utils/useControllableState";
import type { Align, Side } from "../utils/floating";
import { MenuPopup, type MenuEntry } from "./MenuPopup";

export interface DropdownMenuProps {
	/** The clickable element that opens the menu. Usually a `Button`. */
	trigger: ReactElement;
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
	onOpenChange?: (open: boolean) => void;
	/** ArrowLeft/ArrowRight past the edge of the menu — used to chain menus. */
	onNavigateSibling?: (direction: -1 | 1) => void;
	/** Render the popup in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A button that opens a Windows 98 drop-down menu underneath itself.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>File</Button>}
 *   items={[
 *     { label: "New", shortcut: "Ctrl+N", onSelect: () => newFile() },
 *     { type: "separator" },
 *     { type: "submenu", label: "Recent", items: [{ label: "report.doc" }] },
 *   ]}
 * />
 * ```
 *
 * The trigger keeps its own props and handlers — `cloneTrigger` only adds a ref,
 * the ARIA menu state, and the click/arrow-key behaviour on top.
 */
export function DropdownMenu({
	trigger,
	items,
	side,
	align,
	offset,
	label,
	disabled = false,
	open,
	defaultOpen = false,
	onOpenChange,
	onNavigateSibling,
	inline,
	container,
	className,
}: DropdownMenuProps) {
	const triggerRef = useRef<HTMLElement | null>(null);
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const triggerNode = cloneTrigger(trigger, {
		ref: (node: HTMLElement | null) => {
			triggerRef.current = node;
		},
		"aria-haspopup": "menu",
		"aria-expanded": isOpen,
		"aria-disabled": disabled || undefined,
		onClick: (event: MouseEvent) => {
			if (disabled || event.defaultPrevented) return;
			setOpen(!isOpen);
		},
		onKeyDown: (event: KeyboardEvent) => {
			if (disabled) return;
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				setOpen(true);
				return;
			}
			if (event.key === "Enter" || event.key === " ") {
				// Cancel the click the browser is about to synthesise, so the
				// menu toggles exactly once.
				event.preventDefault();
				setOpen(!isOpen);
			}
		},
	});

	return (
		<>
			{triggerNode}
			<MenuPopup
				open={isOpen && !disabled}
				anchorRef={triggerRef}
				items={items}
				side={side}
				align={align}
				offset={offset}
				label={label}
				onDismiss={() => setOpen(false)}
				onNavigateSibling={onNavigateSibling}
				inline={inline}
				container={container}
				className={className}
			/>
		</>
	);
}
