/**
 * Focus management primitives — shared by both ports' `useFocusTrap`.
 *
 * `FOCUSABLE_SELECTOR`, `getFocusable` and `focusElement` were byte-identical in
 * the React and Vue ports; the Tab-wrapping decision was identical too, only
 * spelled differently. It lives here now.
 */

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"area[href]",
	"button:not([disabled])",
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	"textarea:not([disabled])",
	"iframe",
	"audio[controls]",
	"video[controls]",
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Every element inside `container` that can currently take focus, in DOM order.
 *
 * Uses `getClientRects()` rather than `offsetParent` to test visibility: layers
 * are `position: fixed`, and a fixed element always reports a `null`
 * `offsetParent` even when it is perfectly visible.
 */
export function getFocusable(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(element) =>
			!element.hasAttribute("inert") &&
			element.getAttribute("aria-hidden") !== "true" &&
			element.getClientRects().length > 0,
	);
}

/** Moves focus to `element` without scrolling the page behind a modal layer. */
export function focusElement(element: HTMLElement | null | undefined): void {
	element?.focus({ preventScroll: true });
}

/**
 * The element Tab should wrap to, or `null` when the browser's default
 * behaviour is already the right one.
 *
 * `active` is normally `document.activeElement`. When it is not part of
 * `focusable` at all — focus escaped the layer, or the layer has just opened —
 * forward Tab wraps to the first element.
 */
export function tabWrapTarget(
	focusable: readonly HTMLElement[],
	active: Element | null,
	shiftKey: boolean,
): HTMLElement | null {
	if (focusable.length === 0) return null;

	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	const index = focusable.indexOf(active as HTMLElement);

	if (shiftKey && index <= 0) return last;
	if (!shiftKey && (index === -1 || index === focusable.length - 1)) return first;
	return null;
}
