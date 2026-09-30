import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export type SpinnerSize = "small" | "default" | "large";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
	/** Named size, or a pixel size. Defaults to `"default"` (16px). */
	size?: SpinnerSize | number;
	/** Accessible label. Defaults to `"Working…"`. */
	label?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
	small: "spinner-small",
	default: "spinner-default",
	large: "spinner-large",
};

/**
 * The Windows 98 busy indicator: the hourglass that flips while the machine
 * thinks.
 *
 * ```tsx
 * <Spinner />
 * <Spinner size={24} label="Copying files…" />
 * ```
 *
 * It is announced as a `status` with the label, so a screen reader says what is
 * happening rather than reading a shape. The glyph is inline SVG so the two
 * frames are a CSS animation instead of a sprite.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
	{ size = "default", label = "Working…", className, style, ...rest },
	ref,
) {
	const named = typeof size === "string";
	return (
		<span
			ref={ref}
			role="status"
			aria-label={label}
			className={cx("spinner", named && SIZE_CLASS[size], className)}
			style={
				{
					...(named ? null : { "--spinner-size": `${size}px` }),
					...style,
				} as CSSProperties
			}
			{...rest}
		>
			<svg className="spinner-glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
				<path
					d="M3 1h10v3.2L9.2 8l3.8 3.8V15H3v-3.2L6.8 8 3 4.2z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path d="M6.4 3h3.2L8 4.9z" fill="currentColor" />
				<path d="M8 11.1l1.6 1.9H6.4z" fill="currentColor" />
			</svg>
		</span>
	);
});
