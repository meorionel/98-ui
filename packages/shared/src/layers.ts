/**
 * The layer stack — shared, module-level state.
 *
 * This is the part that most wanted to be single-sourced: the `z-index`
 * counter and the list of open layers are process-wide singletons, and a port
 * that kept its own copy would disagree with anything else on the page about
 * which layer is on top. Both ports now import this one module.
 */

/** The lowest `z-index` any layer from this library uses. */
export const LAYER_BASE_Z_INDEX = 1000;

/** Every layer opened so far gets a higher index than the ones before it. */
let zIndexCounter = 0;

/** Open layers, ordered by `z-index`. The last entry is the topmost one. */
const openLayers: number[] = [];

/**
 * Reserves a fresh `z-index` for a new layer.
 *
 * The counter only ever grows — never reuses a value — so a layer opened later
 * always paints above one opened earlier, which is what makes nested layers
 * (`DropdownMenu` inside `Dialog`, a submenu inside a menu) stack correctly.
 */
export function nextLayerZIndex(): number {
	zIndexCounter += 1;
	return LAYER_BASE_Z_INDEX + zIndexCounter * 10;
}

/** Marks a layer as open so it can take part in Escape arbitration. */
export function registerLayer(zIndex: number): void {
	if (openLayers.includes(zIndex)) return;
	openLayers.push(zIndex);
	openLayers.sort((a, b) => a - b);
}

/** Marks a layer as closed. */
export function unregisterLayer(zIndex: number): void {
	const index = openLayers.indexOf(zIndex);
	if (index > -1) openLayers.splice(index, 1);
}

/**
 * True when `zIndex` belongs to the topmost open layer.
 *
 * Only the topmost layer reacts to Escape, so pressing it inside a menu that
 * sits on top of a dialog closes the menu rather than the dialog underneath.
 */
export function isTopLayer(zIndex: number): boolean {
	return openLayers.length === 0 || openLayers[openLayers.length - 1] === zIndex;
}

/** Keeps `document.body` from scrolling while at least one modal is open. */
let scrollLocks = 0;
let previousOverflow = "";

export function lockBodyScroll(): () => void {
	if (typeof document === "undefined") return () => {};
	if (scrollLocks === 0) {
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
	}
	scrollLocks += 1;

	return () => {
		scrollLocks = Math.max(0, scrollLocks - 1);
		if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
	};
}
