import { useEffect, useRef, type RefObject } from "react";
import { isTopLayer, registerLayer, unregisterLayer } from "./layers";

export interface UseDismissableOptions {
	/** Only listen while the layer is open. */
	enabled: boolean;
	/** Called when the user clicks outside or presses Escape. */
	onDismiss: () => void;
	/** Elements that count as "inside": the surface itself, plus e.g. its trigger. */
	refs: Array<RefObject<HTMLElement | null>>;
	/** The layer's `z-index`. Escape is only handled by the topmost open layer. */
	layer: number;
	/** Escape closes the layer. Defaults to `true`. */
	escape?: boolean;
	/** A pointer press outside closes the layer. Defaults to `true`. */
	outsidePointerDown?: boolean;
}

/**
 * Closes a floating layer when the user presses Escape or clicks away from it.
 *
 * Both listeners are passive observers on `document`, so a component that owns
 * keyboard handling (a menu reacting to Escape inside a submenu, say) can call
 * `event.stopPropagation()` first and win.
 */
export function useDismissable({
	enabled,
	onDismiss,
	refs,
	layer,
	escape = true,
	outsidePointerDown = true,
}: UseDismissableOptions): void {
	// Kept in refs so the listeners never have to be re-attached per render.
	const refsRef = useRef(refs);
	refsRef.current = refs;
	const onDismissRef = useRef(onDismiss);
	onDismissRef.current = onDismiss;

	useEffect(() => {
		if (!enabled || typeof document === "undefined") return;

		const isInside = (target: Node | null) =>
			target !== null &&
			refsRef.current.some((ref) => ref.current?.contains(target) === true);

		const handlePointerDown = (event: Event) => {
			if (isInside(event.target as Node | null)) return;
			onDismissRef.current();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			// Only the topmost layer reacts, so Escape closes a menu before the
			// dialog it sits on.
			if (!isTopLayer(layer)) return;
			onDismissRef.current();
		};

		// Bubble phase on purpose: a layer's own React handlers run first and can
		// stop the event before it ever reaches `document`.
		//
		// Only layers that handle Escape join the layer stack — a passive layer
		// (a tooltip) must never swallow Escape from the dialog underneath it.
		if (escape) registerLayer(layer);
		if (outsidePointerDown) document.addEventListener("pointerdown", handlePointerDown, false);
		if (escape) document.addEventListener("keydown", handleKeyDown, false);

		return () => {
			if (escape) unregisterLayer(layer);
			if (outsidePointerDown)
				document.removeEventListener("pointerdown", handlePointerDown, false);
			if (escape) document.removeEventListener("keydown", handleKeyDown, false);
		};
	}, [enabled, layer, escape, outsidePointerDown]);
}
