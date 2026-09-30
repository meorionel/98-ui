import { watch } from "vue";
import { isTopLayer, registerLayer, unregisterLayer } from "./layers";

export interface UseDismissableOptions {
	/** Only listen while the layer is open. */
	enabled: () => boolean;
	/** Called when the user clicks outside or presses Escape. */
	onDismiss: () => void;
	/** Elements that count as "inside": the surface itself, plus e.g. its trigger. */
	refs: () => Array<HTMLElement | null | undefined>;
	/** The layer's `z-index`. Escape is only handled by the topmost open layer. */
	layer: () => number;
	/** Escape closes the layer. Defaults to `true`. */
	escape?: () => boolean;
	/** A pointer press outside closes the layer. Defaults to `true`. */
	outsidePointerDown?: () => boolean;
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
	escape = () => true,
	outsidePointerDown = () => true,
}: UseDismissableOptions): void {
	const isInside = (target: Node | null) =>
		target !== null &&
		refs().some((element) => element != null && element.contains(target) === true);

	const handlePointerDown = (event: Event) => {
		if (isInside(event.target as Node | null)) return;
		onDismiss();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Escape" || event.defaultPrevented) return;
		// Only the topmost layer reacts, so Escape closes a menu before the
		// dialog it sits on.
		if (!isTopLayer(layer())) return;
		onDismiss();
	};

	watch(
		[enabled, escape, outsidePointerDown],
		([isEnabled], _previous, onCleanup) => {
			if (!isEnabled || typeof document === "undefined") return;

			// Bubble phase on purpose: a layer's own handlers run first and can
			// stop the event before it ever reaches `document`.
			//
			// Only layers that handle Escape join the layer stack — a passive layer
			// (a tooltip) must never swallow Escape from the dialog underneath it.
			const closesOnEscape = escape();
			const closesOnOutside = outsidePointerDown();
			const zIndex = layer();

			if (closesOnEscape) registerLayer(zIndex);
			if (closesOnOutside) document.addEventListener("pointerdown", handlePointerDown, false);
			if (closesOnEscape) document.addEventListener("keydown", handleKeyDown, false);

			onCleanup(() => {
				if (closesOnEscape) unregisterLayer(zIndex);
				if (closesOnOutside)
					document.removeEventListener("pointerdown", handlePointerDown, false);
				if (closesOnEscape) document.removeEventListener("keydown", handleKeyDown, false);
			});
		},
		{ flush: "post", immediate: true },
	);
}
