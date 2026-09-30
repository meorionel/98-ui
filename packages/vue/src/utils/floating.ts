import {
	computed,
	ref,
	toValue,
	watch,
	type CSSProperties,
	type ComputedRef,
	type MaybeRefOrGetter,
	type Ref,
} from "vue";
import {
	computeFloatingPosition,
	pointToRect,
	type Align,
	type ComputePositionOptions,
	type FloatingPosition,
	type Side,
} from "98-pink-shared";

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

export interface UseFloatingOptions
	extends Omit<ComputePositionOptions, "side" | "align" | "offset" | "flip" | "shift"> {
	open: () => boolean;
	/** The layer element, so it can be measured. */
	floatingRef: Ref<HTMLElement | null>;
	/** Element the layer is positioned against. */
	anchor?: () => HTMLElement | null;
	/** Position at a viewport point instead of the anchor. Takes precedence. */
	point?: () => { x: number; y: number } | null;
	side?: MaybeRefOrGetter<Side>;
	align?: MaybeRefOrGetter<Align>;
	offset?: MaybeRefOrGetter<number>;
	flip?: MaybeRefOrGetter<boolean>;
	shift?: MaybeRefOrGetter<boolean>;
	/** Copy the anchor's width onto the layer. */
	matchAnchorWidth?: MaybeRefOrGetter<boolean>;
}

export interface UseFloatingResult {
	/** Position style for the layer element. */
	style: ComputedRef<CSSProperties>;
	/** The side actually used, useful for an arrow. */
	side: ComputedRef<Side>;
}

/**
 * Tracks an anchor and returns the `position: fixed` style for a layer.
 *
 * Until the layer has been measured the style keeps it hidden rather than
 * parked in the top-left corner, so nothing flashes. The position is recomputed
 * on scroll (including inside scroll containers), on resize, and whenever either
 * element changes size.
 *
 * The `floatingRef` is part of every dependency list on purpose: a teleported
 * layer has no node during the tick that opened it, and the watchers must run
 * again once it does.
 */
export function useFloating(options: UseFloatingOptions): UseFloatingResult {
	const {
		open,
		floatingRef,
		anchor,
		point,
		side = "bottom",
		align = "center",
		offset = 4,
		flip = true,
		shift = true,
		matchAnchorWidth = false,
	} = options;

	const position = ref<FloatingPosition | null>(null);
	const anchorWidth = ref<number | null>(null);

	const update = () => {
		const layer = floatingRef.value;
		if (!layer) return;

		const size = { width: layer.offsetWidth, height: layer.offsetHeight };
		const placement: ComputePositionOptions = {
			side: toValue(side),
			align: toValue(align),
			offset: toValue(offset),
			flip: toValue(flip),
			shift: toValue(shift),
		};

		const at = point?.() ?? null;
		let next: FloatingPosition;

		if (at) {
			next = computeFloatingPosition(pointToRect(at.x, at.y), size, placement);
		} else {
			const anchorEl = anchor?.() ?? null;
			if (!anchorEl) return;
			const rect = anchorEl.getBoundingClientRect();
			anchorWidth.value = rect.width;
			next = computeFloatingPosition(rect, size, placement);
		}

		const previous = position.value;
		if (
			previous &&
			previous.top === next.top &&
			previous.left === next.left &&
			previous.side === next.side
		) {
			return;
		}
		position.value = next;
	};

	// Re-measure whenever any input changes — including the moment a teleported
	// layer's node finally attaches.
	watch(
		() => [
			open(),
			floatingRef.value,
			anchor?.() ?? null,
			point?.() ?? null,
			toValue(side),
			toValue(align),
			toValue(offset),
			toValue(flip),
			toValue(shift),
			toValue(matchAnchorWidth),
		],
		() => {
			if (open()) update();
			else position.value = null;
		},
		{ immediate: true, flush: "post" },
	);

	// Live tracking while the layer is open.
	watch(
		[open, floatingRef, () => anchor?.() ?? null],
		([isOpen], _previous, onCleanup) => {
			if (!isOpen || typeof window === "undefined") return;

			const handle = () => update();
			window.addEventListener("scroll", handle, true);
			window.addEventListener("resize", handle);

			const observer =
				typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => handle());
			if (observer) {
				if (floatingRef.value) observer.observe(floatingRef.value);
				const anchorEl = anchor?.() ?? null;
				if (anchorEl) observer.observe(anchorEl);
			}

			onCleanup(() => {
				window.removeEventListener("scroll", handle, true);
				window.removeEventListener("resize", handle);
				observer?.disconnect();
			});
		},
		{ immediate: true, flush: "post" },
	);

	const style = computed<CSSProperties>(() => {
		const current = position.value;
		if (!current) {
			// Rendered but not measured yet — out of sight for exactly one frame.
			return { position: "fixed", top: "0px", left: "0px", visibility: "hidden" };
		}

		const result: CSSProperties = {
			position: "fixed",
			top: `${current.top}px`,
			left: `${current.left}px`,
		};
		if (toValue(matchAnchorWidth) && anchorWidth.value !== null) {
			result.width = `${anchorWidth.value}px`;
		}
		return result;
	});

	return { style, side: computed(() => position.value?.side ?? toValue(side)) };
}
