import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsomorphicLayoutEffect } from "./layoutEffect";

export interface PortalProps {
	children: ReactNode;
	/** Element to render into. Defaults to `document.body`. */
	container?: HTMLElement | null;
	/**
	 * Render the children in place instead of portalling them.
	 *
	 * This is what makes a layer statically renderable — documentation previews
	 * and the SSR smoke tests both use it.
	 */
	disabled?: boolean;
}

/**
 * Renders its children into `document.body` once mounted.
 *
 * Nothing is emitted before that: `react-dom/server` has no portal support, and
 * rendering the children in place first would force React to move a live subtree
 * into the portal after hydration — throwing away the focused element along the
 * way. Mounting into the portal exactly once keeps focus, measurement and event
 * handlers attached to the node that actually ends up on screen.
 *
 * Pass `disabled` to opt out of portalling entirely (documentation and tests).
 *
 * The mount flip happens in a layout effect, so a layer that opens paints,
 * measures and positions itself within a single frame.
 */
export function Portal({ children, container, disabled = false }: PortalProps) {
	const [mounted, setMounted] = useState(false);

	// Layout, not passive: the children must mount — and be measured — in the
	// same frame the layer opens, otherwise a pop-up appears one frame late.
	useIsomorphicLayoutEffect(() => {
		setMounted(true);
	}, []);

	if (disabled) return <>{children}</>;
	if (!mounted || typeof document === "undefined") return null;

	return createPortal(children, container ?? document.body);
}
