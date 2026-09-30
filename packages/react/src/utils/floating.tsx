import {
	useCallback,
	useEffect,
	useState,
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	type RefObject,
} from "react";
import {
	computeFloatingPosition,
	pointToRect,
	type Align,
	type ComputePositionOptions,
	type FloatingPosition,
	type Side,
} from "98-pink-shared";
import { useDismissable } from "./dismissable";
import { useElementRef } from "./elementRef";
import { useIsomorphicLayoutEffect } from "./layoutEffect";
import { useFocusTrap, type InitialFocus } from "./focusTrap";
import { useLayerZIndex } from "./layers";
import { Portal } from "./portal";

/**
 * The positioning maths — `computeFloatingPosition`, `pointToRect` and the
 * `Side` / `Align` / `ComputePositionOptions` / `FloatingPosition` / `Rect`
 * types — lives in `98-pink-shared`, byte-for-byte the code both ports used to
 * carry. Re-exported here so the public surface of this package is unchanged.
 */
export {
	computeFloatingPosition,
	pointToRect,
	type Align,
	type ComputePositionOptions,
	type FloatingPosition,
	type Rect,
	type Side,
} from "98-pink-shared";

export interface UseFloatingOptions extends ComputePositionOptions {
	open: boolean;
	/** The layer element, so it can be measured. */
	floatingRef: RefObject<HTMLDivElement | null>;
	/**
	 * Bumped by `useElementRef` when the layer node attaches. A portalled layer
	 * has no node during the commit that opened it, so measuring must be retried
	 * when the node finally appears.
	 */
	nodeVersion?: number;
	/** Element the layer is positioned against. */
	anchorRef?: RefObject<HTMLElement | null>;
	/** Position at a viewport point instead of the anchor. Takes precedence. */
	point?: { x: number; y: number } | null;
	/** Copy the anchor's width onto the layer. */
	matchAnchorWidth?: boolean;
}

export interface UseFloatingResult {
	/** Position style for the layer element. */
	style: CSSProperties;
	/** The side actually used, useful for an arrow. */
	side: Side;
}

/**
 * Tracks an anchor and returns the `position: fixed` style for a layer.
 *
 * Until the layer has been measured the style keeps it hidden rather than
 * parked in the top-left corner, so nothing flashes. The position is recomputed
 * on scroll (including inside scroll containers), on resize, and whenever either
 * element changes size.
 */
export function useFloating({
	open,
	floatingRef,
	nodeVersion,
	anchorRef,
	point,
	side = "bottom",
	align = "center",
	offset = 4,
	flip = true,
	shift = true,
	matchAnchorWidth = false,
}: UseFloatingOptions): UseFloatingResult {
	const [position, setPosition] = useState<FloatingPosition | null>(null);
	const [anchorWidth, setAnchorWidth] = useState<number | null>(null);

	// `point` is usually built inline by the caller, so depend on its numbers.
	const pointX = point?.x ?? null;
	const pointY = point?.y ?? null;
	const hasPoint = pointX !== null && pointY !== null;

	const update = useCallback(() => {
		const layer = floatingRef.current;
		if (!layer) return;

		const size = { width: layer.offsetWidth, height: layer.offsetHeight };
		let next: FloatingPosition | null = null;

		if (hasPoint) {
			next = computeFloatingPosition(pointToRect(pointX, pointY), size, {
				side,
				align,
				offset,
				flip,
				shift,
			});
		} else {
			const anchor = anchorRef?.current;
			if (!anchor) return;
			const rect = anchor.getBoundingClientRect();
			setAnchorWidth(rect.width);
			next = computeFloatingPosition(rect, size, { side, align, offset, flip, shift });
		}

		setPosition((previous) =>
			previous &&
			previous.top === next.top &&
			previous.left === next.left &&
			previous.side === next.side
				? previous
				: next,
		);
	}, [floatingRef, anchorRef, hasPoint, pointX, pointY, side, align, offset, flip, shift]);

	useIsomorphicLayoutEffect(() => {
		if (open) update();
		else setPosition(null);
		// `nodeVersion` is the retry: on the commit that opens a portalled layer
		// the element does not exist yet, so this runs again once it does.
	}, [open, nodeVersion, update]);

	useEffect(() => {
		if (!open) return;

		const handle = () => update();
		window.addEventListener("scroll", handle, true);
		window.addEventListener("resize", handle);

		const observer =
			typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => handle());
		if (observer) {
			if (floatingRef.current) observer.observe(floatingRef.current);
			if (anchorRef?.current) observer.observe(anchorRef.current);
		}

		return () => {
			window.removeEventListener("scroll", handle, true);
			window.removeEventListener("resize", handle);
			observer?.disconnect();
		};
	}, [open, nodeVersion, update, anchorRef, floatingRef]);

	const style: CSSProperties = position
		? {
				position: "fixed",
				top: position.top,
				left: position.left,
				...(matchAnchorWidth && anchorWidth !== null ? { width: anchorWidth } : null),
			}
		: // Rendered but not measured yet — out of sight for exactly one frame.
			{ position: "fixed", top: 0, left: 0, visibility: "hidden" as const };

	return { style, side: position?.side ?? side };
}

/* ------------------------------------------------------------- the surface */

export interface FloatingSurfaceProps {
	/** Mount the layer. When false nothing is rendered at all. */
	open: boolean;
	children: ReactNode;
	/** Element the layer is positioned against. */
	anchorRef?: RefObject<HTMLElement | null>;
	/** Position at a viewport point instead — how `ContextMenu` follows the cursor. */
	point?: { x: number; y: number } | null;
	side?: Side;
	align?: Align;
	offset?: number;
	matchAnchorWidth?: boolean;
	/** Called when the user dismisses the layer (Escape, outside press). */
	onDismiss?: () => void;
	/** Escape dismisses. Defaults to `true`. */
	closeOnEscape?: boolean;
	/** A pointer press outside dismisses. Defaults to `true`. */
	closeOnOutsidePointerDown?: boolean;
	/** Extra elements that count as "inside", typically the trigger. */
	ignoreRefs?: Array<RefObject<HTMLElement | null>>;
	/** ARIA role for the surface — `menu`, `dialog` or `tooltip`. */
	role?: HTMLAttributes<HTMLElement>["role"];
	/** Accessible name for the surface. */
	label?: string;
	/** Element id, so `aria-describedby` / `aria-controls` can point at the layer. */
	id?: string;
	className?: string;
	/** Merged after the computed position styles. */
	style?: CSSProperties;
	/** Move focus into the layer when it opens. Defaults to `false`. */
	autoFocus?: boolean;
	/** Where that focus goes. Defaults to the layer's first focusable child. */
	initialFocus?: InitialFocus;
	/** Cycle Tab inside the layer. Modal layers want this; menus do not. */
	trapFocus?: boolean;
	/** Give focus back to whatever had it when the layer opened. Defaults to `autoFocus`. */
	restoreFocus?: boolean;
	/** Pin the z-index. By default every layer gets a fresh, higher one. */
	zIndex?: number;
	/** Render in place instead of portalling (docs and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}

/**
 * The shared engine behind every floating layer: `DropdownMenu`, `ContextMenu`,
 * `Tooltip` and `Popover`.
 *
 * Owns the portal, the position, the layer's `z-index`, Escape/outside-click
 * dismissal and focus movement, so each component only has to describe its own
 * content.
 */
export function FloatingSurface({
	open,
	children,
	anchorRef,
	point,
	side,
	align,
	offset,
	matchAnchorWidth,
	onDismiss,
	closeOnEscape = true,
	closeOnOutsidePointerDown = true,
	ignoreRefs,
	role,
	label,
	id,
	className,
	style,
	autoFocus = false,
	initialFocus,
	trapFocus = false,
	restoreFocus,
	zIndex,
	inline,
	container,
}: FloatingSurfaceProps) {
	const {
		ref: surfaceRef,
		setRef: setSurfaceRef,
		version: surfaceVersion,
	} = useElementRef<HTMLDivElement>();
	const { style: positionStyle, side: resolvedSide } = useFloating({
		open,
		floatingRef: surfaceRef,
		nodeVersion: surfaceVersion,
		anchorRef,
		point,
		side,
		align,
		offset,
		matchAnchorWidth,
	});
	const layerZIndex = useLayerZIndex(open, zIndex);

	useDismissable({
		enabled: open,
		onDismiss: onDismiss ?? noop,
		// The anchor counts as "inside" too: clicking a menu's own trigger must
		// toggle it rather than dismiss-and-reopen.
		refs: [surfaceRef, ...(anchorRef ? [anchorRef] : []), ...(ignoreRefs ?? [])],
		layer: layerZIndex,
		escape: closeOnEscape,
		outsidePointerDown: closeOnOutsidePointerDown,
	});

	useFocusTrap(surfaceRef, {
		active: open && autoFocus,
		wrap: trapFocus,
		initialFocus,
		restoreFocus: restoreFocus ?? autoFocus,
		layer: layerZIndex,
		nodeVersion: surfaceVersion,
	});

	if (!open) return null;

	return (
		<Portal container={container} disabled={inline}>
			<div
				ref={setSurfaceRef}
				id={id}
				data-side={resolvedSide}
				role={role}
				aria-label={label}
				tabIndex={-1}
				className={className}
				style={{ ...positionStyle, zIndex: layerZIndex, ...style }}
			>
				{children}
			</div>
		</Portal>
	);
}

function noop(): void {}
