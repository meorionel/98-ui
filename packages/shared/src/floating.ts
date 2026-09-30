/**
 * Floating-layer positioning — the pure maths behind every overlay.
 *
 * Shared verbatim by both ports: `computeFloatingPosition` was byte-identical in
 * `98-pink-react/src/utils/floating.tsx` and `98-pink-vue/src/utils/floating.ts`.
 * Only the reactive wrapper around it is framework-specific.
 */

/** Which edge of the anchor the layer is placed against. */
export type Side = "top" | "right" | "bottom" | "left";

/** How the layer lines up on the anchor's other axis. */
export type Align = "start" | "center" | "end";

export interface ComputePositionOptions {
	side?: Side;
	align?: Align;
	/** Gap between the anchor and the layer, in pixels. Defaults to `4`. */
	offset?: number;
	/** Flip to the opposite side when the layer does not fit. Defaults to `true`. */
	flip?: boolean;
	/** Keep the layer inside the viewport. Defaults to `true`. */
	shift?: boolean;
}

export interface FloatingPosition {
	top: number;
	left: number;
	/** The side actually used, after flipping. */
	side: Side;
}

/** A rectangle in viewport coordinates — the shape `getBoundingClientRect` returns. */
export interface Rect {
	top: number;
	bottom: number;
	left: number;
	right: number;
	width: number;
	height: number;
}

/** The viewport margin a shifted layer keeps. */
const VIEWPORT_MARGIN = 4;

const OPPOSITE_SIDE: Record<Side, Side> = {
	top: "bottom",
	bottom: "top",
	left: "right",
	right: "left",
};

function fits(side: Side, anchor: Rect, layer: { width: number; height: number }, offset: number) {
	if (typeof window === "undefined") return true;
	switch (side) {
		case "top":
			return anchor.top - offset - layer.height >= 0;
		case "bottom":
			return anchor.bottom + offset + layer.height <= window.innerHeight;
		case "left":
			return anchor.left - offset - layer.width >= 0;
		case "right":
			return anchor.right + offset + layer.width <= window.innerWidth;
	}
}

/**
 * Places a fixed-position layer next to an anchor rectangle.
 *
 * Pure maths on purpose: no dependency on Popper or Floating UI, and no DOM
 * access beyond the viewport size, which keeps the whole layer system testable.
 * It flips when there is no room and shifts the layer back inside the viewport
 * as a last resort — the two behaviours that matter in practice.
 */
export function computeFloatingPosition(
	anchor: Rect,
	layer: { width: number; height: number },
	options: ComputePositionOptions = {},
): FloatingPosition {
	const { align = "center", offset = 4, flip = true, shift = true } = options;
	let side = options.side ?? "bottom";

	if (
		flip &&
		!fits(side, anchor, layer, offset) &&
		fits(OPPOSITE_SIDE[side], anchor, layer, offset)
	) {
		side = OPPOSITE_SIDE[side];
	}

	const vertical = side === "top" || side === "bottom";
	let top: number;
	let left: number;

	if (side === "top") top = anchor.top - offset - layer.height;
	else if (side === "bottom") top = anchor.bottom + offset;
	else top = anchor.top;

	if (side === "left") left = anchor.left - offset - layer.width;
	else if (side === "right") left = anchor.right + offset;
	else left = anchor.left;

	if (vertical) {
		if (align === "start") left = anchor.left;
		else if (align === "end") left = anchor.right - layer.width;
		else left = anchor.left + anchor.width / 2 - layer.width / 2;
	} else {
		if (align === "start") top = anchor.top;
		else if (align === "end") top = anchor.bottom - layer.height;
		else top = anchor.top + anchor.height / 2 - layer.height / 2;
	}

	if (shift && typeof window !== "undefined") {
		const maxLeft = Math.max(
			VIEWPORT_MARGIN,
			window.innerWidth - layer.width - VIEWPORT_MARGIN,
		);
		const maxTop = Math.max(
			VIEWPORT_MARGIN,
			window.innerHeight - layer.height - VIEWPORT_MARGIN,
		);
		left = Math.min(Math.max(left, VIEWPORT_MARGIN), maxLeft);
		top = Math.min(Math.max(top, VIEWPORT_MARGIN), maxTop);
	}

	return { top: Math.round(top), left: Math.round(left), side };
}

/** A zero-sized rect at a viewport point — a context menu's "anchor". */
export function pointToRect(x: number, y: number): Rect {
	return { top: y, bottom: y, left: x, right: x, width: 0, height: 0 };
}
