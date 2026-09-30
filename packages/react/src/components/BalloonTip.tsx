import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cx } from "../utils/cx";
import { useDismissable } from "../utils/dismissable";
import { FloatingSurface, type Align, type Side } from "../utils/floating";
import { useLayerZIndex } from "../utils/layers";
import { Portal } from "../utils/portal";
import { useControllableState } from "../utils/useControllableState";
import { Button } from "./Button";

/** Where an unanchored balloon docks. */
export type BalloonCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** The four Windows 98 notification glyphs, shared with `MessageBox`. */
export type BalloonIcon = "info" | "warning" | "error" | "question";

export interface BalloonTipProps {
	/** Controlled visibility. */
	open?: boolean;
	/** Initial visibility while uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Bold first line. */
	title?: ReactNode;
	/** The message. */
	children: ReactNode;
	icon?: BalloonIcon;
	/** Element to point at. Without it the balloon docks in `corner`. */
	anchorRef?: RefObject<HTMLElement | null>;
	/** Side of the anchor to sit on. Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`. */
	align?: Align;
	offset?: number;
	/** Corner used when there is no anchor. Defaults to `"bottom-right"`. */
	corner?: BalloonCorner;
	/** Close by itself after this many milliseconds. */
	autoDismiss?: number;
	/** Called whenever the balloon closes. */
	onDismiss?: () => void;
	/** Show a close button. Windows 98 balloons just fade, so this defaults to `false`. */
	closable?: boolean;
	closeLabel?: string;
	/** How the message is announced. Defaults to `"status"` (polite). */
	announce?: "status" | "alert";
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A balloon notification: the little tailed window Windows 98 pops out of the
 * tray to tell you something.
 *
 * ```tsx
 * <BalloonTip
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="New hardware found"
 *   icon="info"
 *   autoDismiss={6000}
 * >
 *   Windows is installing the driver for your new device.
 * </BalloonTip>
 * ```
 *
 * With an `anchorRef` it points at that element; without one it docks in a
 * corner. It never steals focus, it closes on `Escape`, and it can dismiss
 * itself after `autoDismiss` — the shape a toast takes in this design language.
 */
export function BalloonTip({
	open,
	defaultOpen = false,
	onOpenChange,
	title,
	children,
	icon,
	anchorRef,
	side,
	align,
	offset,
	corner = "bottom-right",
	autoDismiss,
	onDismiss,
	closable = false,
	closeLabel = "Close",
	announce = "status",
	inline,
	container,
	className,
}: BalloonTipProps) {
	const [isOpen, setOpen] = useControllableState<boolean>({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const balloonRef = useRef<HTMLDivElement | null>(null);
	const zIndex = useLayerZIndex(isOpen);

	const close = () => {
		setOpen(false);
		onDismiss?.();
	};

	useDismissable({
		// An anchored balloon is a FloatingSurface, which dismisses for itself.
		enabled: isOpen && anchorRef === undefined,
		onDismiss: close,
		refs: [balloonRef],
		layer: zIndex,
		// A notification is not a menu: clicking away must not make it vanish.
		outsidePointerDown: false,
	});

	// The timer deliberately depends on nothing but the open state and the
	// delay: `close` is a fresh closure every render, and re-arming the timeout
	// on every parent render would keep the balloon open forever.
	const closeRef = useRef(close);
	closeRef.current = close;
	useEffect(() => {
		if (!isOpen || autoDismiss === undefined) return;
		const timer = window.setTimeout(() => closeRef.current(), autoDismiss);
		return () => window.clearTimeout(timer);
	}, [isOpen, autoDismiss]);

	if (!isOpen) return null;

	const content = (
		<>
			{icon !== undefined && (
				<span className={cx("balloon-icon", `balloon-icon-${icon}`)} aria-hidden="true" />
			)}
			<div className="balloon-body">
				{title !== undefined && <div className="balloon-title">{title}</div>}
				<div className="balloon-text">{children}</div>
			</div>
			{closable && (
				<Button className="balloon-close" aria-label={closeLabel} onClick={close}>
					&#x2715;
				</Button>
			)}
		</>
	);

	if (anchorRef) {
		return (
			<FloatingSurface
				open
				anchorRef={anchorRef}
				side={side ?? "bottom"}
				align={align}
				offset={offset ?? 10}
				role={announce}
				className={cx("balloon", "balloon-anchored", className)}
				inline={inline}
				container={container}
				// The balloon is anchored, so it needs the same tail logic as a tooltip.
				onDismiss={close}
			>
				{content}
				<span className="balloon-tail" aria-hidden="true" />
			</FloatingSurface>
		);
	}

	return (
		<Portal container={container} disabled={inline}>
			<div
				ref={balloonRef}
				role={announce}
				className={cx("balloon", "balloon-docked", `balloon-${corner}`, className)}
				style={{ zIndex }}
			>
				{content}
				<span className="balloon-tail" aria-hidden="true" />
			</div>
		</Portal>
	);
}
