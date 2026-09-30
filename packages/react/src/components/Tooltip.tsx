import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { cloneTrigger } from "../utils/trigger";
import { FloatingSurface, type Align, type Side } from "../utils/floating";

export interface TooltipProps {
	/** The tooltip text. */
	content: ReactNode;
	/** The element the tooltip describes. */
	children: ReactElement;
	/** Defaults to `"top"`. */
	side?: Side;
	/** Defaults to `"center"`. */
	align?: Align;
	offset?: number;
	/** How long the pointer must rest on the anchor, in ms. Defaults to `500`. */
	delay?: number;
	/** Grace period before hiding, so the pointer can travel onto the tooltip. Defaults to `100`. */
	closeDelay?: number;
	disabled?: boolean;
	/** Controlled visibility. Lets a tour or a docs page pin a tooltip open. */
	open?: boolean;
	/** Initial visibility while uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A Windows 98 tooltip.
 *
 * ```tsx
 * <Tooltip content="Sends the file to the Recycle Bin">
 *   <Button>Delete</Button>
 * </Tooltip>
 * ```
 *
 * Shows after `delay` on hover, immediately on keyboard focus, and wires
 * `aria-describedby` so screen readers announce it too. Escape hides it without
 * closing anything else.
 */
export function Tooltip({
	content,
	children,
	side = "top",
	align = "center",
	offset = 6,
	delay = 500,
	closeDelay = 100,
	disabled = false,
	open,
	defaultOpen = false,
	onOpenChange,
	inline,
	container,
	className,
}: TooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const isOpen = open ?? uncontrolledOpen;
	const anchorRef = useRef<HTMLElement | null>(null);
	const tooltipId = useId();
	const showTimer = useRef(0);
	const hideTimer = useRef(0);

	const setOpenState = (next: boolean) => {
		if (open === undefined) setUncontrolledOpen(next);
		onOpenChange?.(next);
	};

	const clearTimers = () => {
		window.clearTimeout(showTimer.current);
		window.clearTimeout(hideTimer.current);
	};

	useEffect(() => clearTimers, []);

	// A tooltip that is unmounted mid-hover must not leave a timer behind.
	useEffect(() => {
		if (disabled && isOpen) setOpenState(false);
	}, [disabled, isOpen]);

	const scheduleOpen = () => {
		clearTimers();
		if (disabled) return;
		showTimer.current = window.setTimeout(() => setOpenState(true), delay);
	};

	const scheduleClose = () => {
		clearTimers();
		hideTimer.current = window.setTimeout(() => setOpenState(false), closeDelay);
	};

	const openNow = () => {
		clearTimers();
		if (!disabled) setOpenState(true);
	};

	const closeNow = () => {
		clearTimers();
		setOpenState(false);
	};

	const anchor = cloneTrigger(children, {
		ref: (element: HTMLElement | null) => {
			anchorRef.current = element;
		},
		"aria-describedby": isOpen ? tooltipId : undefined,
		onMouseEnter: scheduleOpen,
		onMouseLeave: scheduleClose,
		onFocus: openNow,
		onBlur: closeNow,
		onKeyDown: (event: { key: string }) => {
			if (event.key === "Escape") closeNow();
		},
	});

	return (
		<>
			{anchor}
			<FloatingSurface
				open={isOpen}
				anchorRef={anchorRef}
				side={side}
				align={align}
				offset={offset}
				id={tooltipId}
				role="tooltip"
				className={cx("tooltip", className)}
				// A tooltip never owns focus and never dismisses anything.
				closeOnEscape={false}
				closeOnOutsidePointerDown={false}
				inline={inline}
				container={container}
			>
				{content}
			</FloatingSurface>
		</>
	);
}
