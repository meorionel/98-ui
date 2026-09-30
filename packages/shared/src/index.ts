/**
 * 98-pink-shared — the framework-agnostic core of the 98-pink component
 * libraries.
 *
 * Everything here is plain TypeScript with no import of `react` or `vue`, so
 * the React and the Vue port can both be built on exactly the same behaviour.
 * A bug fixed here is fixed in both, including in the layer stack, which is
 * process-wide state and must not be duplicated.
 */
export { cx, type ClassValue } from "./cx.js";
export {
	computeFloatingPosition,
	pointToRect,
	type Align,
	type ComputePositionOptions,
	type FloatingPosition,
	type Rect,
	type Side,
} from "./floating.js";
export { focusElement, getFocusable, tabWrapTarget } from "./focus.js";
export {
	LAYER_BASE_Z_INDEX,
	isTopLayer,
	lockBodyScroll,
	nextLayerZIndex,
	registerLayer,
	unregisterLayer,
} from "./layers.js";
