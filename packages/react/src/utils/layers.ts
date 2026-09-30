/**
 * The layer stack lives in `98-pink-shared`.
 *
 * It is module-level, process-wide state — the `z-index` counter and the list of
 * open layers must be the same object for every layer on the page, so it is
 * deliberately not re-implemented per framework. Only the hook that binds it to
 * React's render cycle stays here.
 */
import { useEffect, useState } from "react";
import { LAYER_BASE_Z_INDEX, nextLayerZIndex } from "98-pink-shared";

export {
	LAYER_BASE_Z_INDEX,
	isTopLayer,
	lockBodyScroll,
	nextLayerZIndex,
	registerLayer,
	unregisterLayer,
} from "98-pink-shared";

/**
 * Allocates a `z-index` for a layer while it is open.
 *
 * The value is assigned in an effect, so the first painted frame of a freshly
 * opened layer uses the base index — already above any page content — and the
 * real index lands immediately afterwards.
 */
export function useLayerZIndex(active: boolean, fixed?: number): number {
	const [zIndex, setZIndex] = useState(fixed ?? LAYER_BASE_Z_INDEX);

	useEffect(() => {
		if (active && fixed === undefined) setZIndex(nextLayerZIndex());
	}, [active, fixed]);

	return fixed ?? zIndex;
}
