/**
 * Numeric size helpers for inline styles.
 *
 * React turns `style={{ width: 320 }}` into `width:320px`; Vue writes the bare
 * number, which CSS rejects — so the browser drops the declaration entirely and
 * the element silently loses its size. Every numeric size prop goes through
 * `cssSize` so the two ports render identical inline styles.
 */
export function cssSize(value: number | string | undefined | null): string | undefined {
	if (value === undefined || value === null) return undefined;
	return typeof value === "number" ? `${value}px` : value;
}

/**
 * `{ width: "200px" }`, or `undefined` when the size was not given — so the
 * attribute stays off the element instead of rendering `width:undefined`.
 */
export function sizeStyle(
	property: string,
	value: number | string | undefined | null,
): Record<string, string> | undefined {
	const size = cssSize(value);
	return size === undefined ? undefined : { [property]: size };
}
