export type ClassValue = string | number | false | null | undefined;

/**
 * Tiny classnames helper — joins the truthy values with a space.
 *
 * Returns `undefined` (rather than `""`) when nothing is left, so the renderer
 * omits the attribute entirely instead of rendering an empty `class=""`.
 *
 * ```ts
 * cx("window", inactive && "inactive") // "window inactive"
 * cx(undefined)                        // undefined
 * ```
 */
export function cx(...values: ClassValue[]): string | undefined {
	const result = values.filter(Boolean).join(" ");
	return result === "" ? undefined : result;
}
