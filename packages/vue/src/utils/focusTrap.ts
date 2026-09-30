import { watch, type Ref } from "vue";
import { focusElement, getFocusable, isTopLayer, tabWrapTarget } from "98-pink-shared";

/**
 * The focus primitives are shared with the React port; only the trigger — Vue's
 * watcher, React's effect — differs.
 */
export { focusElement, getFocusable } from "98-pink-shared";

/** Where to put focus when a layer opens. A function may return `null` to fall back. */
export type InitialFocus = HTMLElement | null | (() => HTMLElement | null);

export interface UseFocusTrapOptions {
	/** The layer element. A portalled layer only has one a frame after opening. */
	target: Ref<HTMLElement | null>;
	/**
	 * Whether the layer manages focus at all. When it flips to `false`, focus is
	 * restored to whatever was focused before it opened.
	 */
	active: () => boolean;
	/** Cycle Tab / Shift+Tab inside the layer. Modal layers want this; menus do not. */
	wrap?: () => boolean;
	/** Element to focus first. Defaults to the layer's first focusable child. */
	initialFocus?: () => InitialFocus;
	/** Give focus back to whatever was focused before. Defaults to `true`. */
	restoreFocus?: () => boolean;
	/**
	 * The layer's `z-index` from the layer stack. When supplied, a trap that is
	 * no longer the topmost layer ignores Tab, so a dialog opened from inside
	 * another dialog does not fight the one underneath it for focus.
	 */
	layer?: () => number | undefined;
}

/**
 * Moves focus into a layer, optionally traps Tab inside it, and hands focus back
 * on close.
 *
 * `wrap: false` is the menu behaviour: focus still moves in and comes back to
 * the trigger, but Tab is left alone so the user can tab out of the menu.
 */
export function useFocusTrap({
	target,
	active,
	wrap = () => true,
	initialFocus,
	restoreFocus = () => true,
	layer,
}: UseFocusTrapOptions): void {
	// Resolved lazily, never captured: a teleported layer can move its DOM into
	// `document.body` a tick after mounting, and the element we hold must be the
	// one that is actually on screen.
	const resolveInitialFocus = (): HTMLElement | null => {
		const node = target.value;
		if (!node) return null;
		const requested = initialFocus?.();
		const element = typeof requested === "function" ? requested() : requested;
		return element ?? getFocusable(node)[0] ?? node;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!wrap() || event.key !== "Tab") return;
		const current = layer?.();
		if (current !== undefined && !isTopLayer(current)) return;
		const node = target.value;
		if (!node) return;

		const focusable = getFocusable(node);
		if (focusable.length === 0) {
			event.preventDefault();
			focusElement(node);
			return;
		}

		// The wrap decision itself is shared with the React port.
		const next = tabWrapTarget(focusable, document.activeElement, event.shiftKey);
		if (next) {
			event.preventDefault();
			focusElement(next);
		}
	};

	watch(
		[active, target],
		([isActive], _previous, onCleanup) => {
			if (!isActive) return;
			if (typeof window === "undefined" || typeof document === "undefined") return;
			if (!target.value) return;

			const previouslyFocused = document.activeElement as HTMLElement | null;
			const node = target.value;

			// A child may have focused something inside already (a menu focusing
			// its first item); never fight it for focus.
			const frame = window.requestAnimationFrame(() => {
				if (node.contains(document.activeElement)) return;
				focusElement(resolveInitialFocus());
			});

			if (wrap()) document.addEventListener("keydown", handleKeyDown, true);

			onCleanup(() => {
				window.cancelAnimationFrame(frame);
				document.removeEventListener("keydown", handleKeyDown, true);
				if (restoreFocus() && previouslyFocused?.isConnected) focusElement(previouslyFocused);
			});
		},
		{ flush: "post", immediate: true },
	);
}
