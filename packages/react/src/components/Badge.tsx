import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

/** Tint applied to the chip. `"default"` uses the plain button surface. */
export type BadgeVariant = "default" | "info" | "success" | "warning" | "error";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	/** Glyph shown before the label. */
	icon?: ReactNode;
}

/**
 * A small status chip.
 *
 * ```tsx
 * <Badge variant="success">Saved</Badge>
 * <Badge variant="error" icon={<WarningGlyph />}>3 errors</Badge>
 * ```
 *
 * Windows 98 itself had no badge, so this is a deliberate addition: it is drawn
 * as a raised chip in the theme's surfaces and only the status tint is new. The
 * variants are colour-coded, which is why each one also has a text label rather
 * than relying on the colour alone.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
	{ variant = "default", icon, className, children, ...rest },
	ref,
) {
	return (
		<span
			ref={ref}
			className={cx("badge", variant !== "default" && `badge-${variant}`, className)}
			{...rest}
		>
			{icon !== undefined && (
				<span className="badge-icon" aria-hidden="true">
					{icon}
				</span>
			)}
			{children}
		</span>
	);
});
