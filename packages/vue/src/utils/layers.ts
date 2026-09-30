/**
 * The layer stack lives in `98-pink-shared`.
 *
 * It is module-level, process-wide state — the `z-index` counter and the list of
 * open layers must be the same object for every layer on the page, so it is
 * deliberately not re-implemented per framework. Only the hook that binds it to
 * Vue's reactivity stays here.
 */
import { computed, ref, watch, type ComputedRef } from "vue";
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
 * The value is assigned in a post-flush watcher, so the first painted frame of a
 * freshly opened layer uses the base index — already above any page content —
 * and the real index lands immediately afterwards.
 */
export function useLayerZIndex(
	active: () => boolean,
	fixed?: () => number | undefined,
): ComputedRef<number> {
	const zIndex = ref(fixed?.() ?? LAYER_BASE_Z_INDEX);

	watch(
		[active, () => fixed?.()],
		([isActive, pinned]) => {
			if (isActive && pinned === undefined) zIndex.value = nextLayerZIndex();
		},
		{ immediate: true, flush: "post" },
	);

	return computed(() => fixed?.() ?? zIndex.value);
}
