import {
	useRef,
	type KeyboardEvent,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { cloneTrigger } from "../utils/trigger";
import { useControllableState } from "../utils/useControllableState";
import { FloatingSurface, type Align, type Side } from "../utils/floating";

export interface PopoverProps {
	/** The element that opens the popover. */
	trigger: ReactElement;
	/** The popover's content. */
	children: ReactNode;
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
	onOpenChange?: (open: boolean) => void;
	/** Move focus to the first focusable element inside. Defaults to `true`. */
	autoFocus?: boolean;
	/** Copy the trigger's width onto the popover. */
	matchAnchorWidth?: boolean;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A non-modal floating panel anchored to a trigger.
 *
 * ```tsx
 * <Popover trigger={<Button>Details</Button>} label="File details">
 *   <FieldRow><Checkbox label="Read-only" /></FieldRow>
 * </Popover>
 * ```
 *
 * Unlike `Dialog` a popover does not trap focus, dim the page or lock scrolling:
 * it is the Win98 equivalent of an inspector or a floating palette. Escape, an
 * outside click, or a second press of the trigger all close it, and focus goes
 * back to the trigger.
 */
export function Popover({
	trigger,
	children,
	side,
	align,
	offset,
	label,
	open,
	defaultOpen = false,
	onOpenChange,
	autoFocus = true,
	matchAnchorWidth,
	inline,
	container,
	className,
}: PopoverProps) {
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
		"aria-haspopup": "dialog",
		"aria-expanded": isOpen,
		onClick: (event: MouseEvent) => {
			if (event.defaultPrevented) return;
			setOpen(!isOpen);
		},
		onKeyDown: (event: KeyboardEvent) => {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				setOpen(true);
			} else if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				setOpen(!isOpen);
			}
		},
	});

	return (
		<>
			{triggerNode}
			<FloatingSurface
				open={isOpen}
				anchorRef={triggerRef}
				side={side}
				align={align}
				offset={offset}
				matchAnchorWidth={matchAnchorWidth}
				onDismiss={() => setOpen(false)}
				role="dialog"
				label={label}
				className={cx("popover", className)}
				autoFocus={autoFocus}
				trapFocus={false}
				restoreFocus={autoFocus}
				inline={inline}
				container={container}
			>
				{children}
			</FloatingSurface>
		</>
	);
}
