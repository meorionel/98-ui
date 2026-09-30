import { useEffect, useRef, type RefObject } from "react";
import { focusElement, getFocusable, isTopLayer, tabWrapTarget } from "98-pink-shared";

/**
 * The focus primitives are shared with the Vue port; only the trigger — React's
 * effect, Vue's watcher — differs.
 */
export { focusElement, getFocusable } from "98-pink-shared";

/** Where to put focus when a layer opens. A function may return `null` to fall back. */
export type InitialFocus = RefObject<HTMLElement | null> | (() => HTMLElement | null);

export interface UseFocusTrapOptions {
	/**
	 * Whether the layer manages focus at all. When it flips to `false`, focus is
	 * restored to whatever was focused before it opened.
	 */
	active: boolean;
	/** Cycle Tab / Shift+Tab inside the layer. Modal layers want this; menus do not. */
	wrap?: boolean;
	/** Element to focus first. Defaults to the layer's first focusable child. */
	initialFocus?: InitialFocus;
	/** Give focus back to whatever was focused before. Defaults to `true`. */
	restoreFocus?: boolean;
	/**
	 * The layer's `z-index` from the layer stack. When supplied, a trap that is
	 * no longer the topmost layer ignores Tab, so a dialog opened from inside
	 * another dialog does not fight the one underneath it for focus.
	 */
	layer?: number;
	/**
	 * Bumped by `useElementRef` when the layer node attaches, so a portalled
	 * layer still gets its initial focus and its Tab trap.
	 */
	nodeVersion?: number;
}

/**
 * Moves focus into a layer, optionally traps Tab inside it, and hands focus back
 * on close.
 *
 * `wrap: false` is the menu behaviour: focus still moves in and comes back to
 * the trigger, but Tab is left alone so the user can tab out of the menu.
 */
export function useFocusTrap(
	ref: RefObject<HTMLElement | null>,
	{
		active,
		wrap = true,
		initialFocus,
		restoreFocus = true,
		layer,
		nodeVersion,
	}: UseFocusTrapOptions,
): void {
	// Callers usually pass an inline arrow function; keeping it in a ref stops the
	// effect from restarting (and re-focusing) on every render. The layer index is
	// read at event time for the same reason: it is assigned in an effect, so
	// depending on it would restart the trap one frame after it opened.
	const initialFocusRef = useRef(initialFocus);
	initialFocusRef.current = initialFocus;
	const layerRef = useRef(layer);
	layerRef.current = layer;

	useEffect(() => {
		if (!active) return;
		if (typeof document === "undefined" || !ref.current) return;

		const previouslyFocused = document.activeElement as HTMLElement | null;

		// Resolved lazily, never captured: a portal can move its DOM into
		// `document.body` one frame after mounting, and the element we hold must
		// be the one that is actually on screen.
		const container = () => ref.current;

		const resolveInitialFocus = (): HTMLElement | null => {
			const node = container();
			if (!node) return null;
			const requested = initialFocusRef.current;
			const element =
				typeof requested === "function" ? requested() : (requested?.current ?? null);
			return element ?? getFocusable(node)[0] ?? node;
		};

		const frame = window.requestAnimationFrame(() => {
			// A child may have focused something inside already (a menu focusing
			// its first item); never fight it for focus.
			const node = container();
			if (!node || node.contains(document.activeElement)) return;
			focusElement(resolveInitialFocus());
		});

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!wrap || event.key !== "Tab") return;
			if (layerRef.current !== undefined && !isTopLayer(layerRef.current)) return;
			const node = container();
			if (!node) return;

			const focusable = getFocusable(node);
			if (focusable.length === 0) {
				event.preventDefault();
				focusElement(node);
				return;
			}

			// The wrap decision itself is shared with the Vue port.
			const target = tabWrapTarget(focusable, document.activeElement, event.shiftKey);
			if (target) {
				event.preventDefault();
				focusElement(target);
			}
		};

		if (wrap) document.addEventListener("keydown", handleKeyDown, true);

		return () => {
			window.cancelAnimationFrame(frame);
			if (wrap) document.removeEventListener("keydown", handleKeyDown, true);
			if (restoreFocus && previouslyFocused?.isConnected) focusElement(previouslyFocused);
		};
		// `nodeVersion` retries the activation once a portalled node exists.
	}, [active, wrap, ref, restoreFocus, nodeVersion]);
}
