import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
	/** `"horizontal"` (default) draws a rule between stacked blocks. */
	orientation?: SeparatorOrientation;
	/**
	 * Purely visual: the element loses its `separator` role and is hidden from
	 * assistive technology. Use it when the divider is decoration rather than a
	 * meaningful break.
	 */
	decorative?: boolean;
}

/**
 * A divider between two blocks of content.
 *
 * ```tsx
 * <p>Above</p>
 * <Separator />
 * <p>Below</p>
 * <FieldRow>
 *   <span>Left</span>
 *   <Separator orientation="vertical" />
 *   <span>Right</span>
 * </FieldRow>
 * ```
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
	{ orientation = "horizontal", decorative = false, className, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			role={decorative ? "presentation" : "separator"}
			aria-orientation={decorative ? undefined : orientation}
			className={cx("separator", `separator-${orientation}`, className)}
			{...rest}
		/>
	);
});
