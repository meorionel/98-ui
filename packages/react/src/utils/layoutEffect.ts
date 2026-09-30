import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` during SSR.
 *
 * React warns when `useLayoutEffect` runs on the server, where there is no
 * layout to read. Overlays need the *layout* variant on the client: a layer must
 * be measured and positioned before the browser paints, or it flashes at the
 * wrong place for a frame.
 */
export const useIsomorphicLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;
