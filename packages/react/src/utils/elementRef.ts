import { useCallback, useRef, useState, type RefObject } from "react";

export interface UseElementRefResult<T extends HTMLElement> {
	/** The current node. Safe to read at any time, including inside listeners. */
	ref: RefObject<T | null>;
	/** Callback ref to spread onto the element. Stable across renders. */
	setRef: (node: T | null) => void;
	/**
	 * Bumped every time a node attaches. Effects that need the element to exist
	 * put this in their dependency list.
	 */
	version: number;
}

/**
 * A ref that tells you *when* the element exists.
 *
 * `useEffect` / `useLayoutEffect` run in the same commit as the render that
 * created the element, so a layer that is portalled has no node yet on its
 * first pass — the portal only renders its children once it has mounted. An
 * effect that measured `ref.current` on that pass would silently do nothing and
 * never run again, because nothing in its dependency list changed.
 *
 * Depend on `version` instead, and the effect runs again the moment the node
 * appears (and again if React ever replaces it).
 */
export function useElementRef<T extends HTMLElement>(): UseElementRefResult<T> {
	const ref = useRef<T | null>(null);
	const [version, setVersion] = useState(0);

	const setRef = useCallback((node: T | null) => {
		ref.current = node;
		// Only the attach is interesting: a detach is either a close (the parent
		// is re-rendering anyway) or an unmount, where a state update would be
		// pointless.
		if (node) setVersion((current) => current + 1);
	}, []);

	return { ref, setRef, version };
}
