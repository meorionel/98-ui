import { cloneElement, isValidElement, type ReactElement, type Ref } from "react";

type Props = Record<string, unknown>;
type AnyHandler = (event: never) => void;

/** Handlers we chain when the trigger already defines its own. */
const CHAINED_HANDLERS = [
	"onClick",
	"onKeyDown",
	"onPointerDown",
	"onMouseEnter",
	"onMouseLeave",
	"onFocus",
	"onBlur",
	"onContextMenu",
] as const;

function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
	if (typeof ref === "function") ref(node);
	else if (ref && typeof ref === "object") (ref as { current: T | null }).current = node;
}

/**
 * Clones a trigger element and merges our props into it.
 *
 * Used by `DropdownMenu`, `Popover` and `Tooltip`, which need a ref, click
 * handlers and ARIA state on a trigger the *caller* authored. The caller's own
 * handlers always run first — if one of them calls `preventDefault()` we can see
 * it and skip our own behaviour — and their ref is preserved alongside ours.
 */
export function cloneTrigger(
	trigger: ReactElement,
	props: Props & { ref?: Ref<HTMLElement> },
): ReactElement {
	if (!isValidElement(trigger)) return trigger;

	const original = trigger.props as Props;
	const merged: Props = { ...props };

	// React 19 exposes `ref` through props; React 18 keeps it on the element.
	const originalRef = (original.ref ?? (trigger as unknown as { ref?: Ref<HTMLElement> }).ref) as
		Ref<HTMLElement> | undefined;

	for (const name of CHAINED_HANDLERS) {
		const ours = props[name] as AnyHandler | undefined;
		const theirs = original[name] as AnyHandler | undefined;
		if (ours && theirs) {
			merged[name] = (event: never) => {
				theirs(event);
				ours(event);
			};
		}
	}

	const ourRef = props.ref;
	merged.ref = (node: HTMLElement | null) => {
		assignRef(originalRef, node);
		assignRef(ourRef, node);
	};

	return cloneElement(trigger as ReactElement<Props>, merged);
}
