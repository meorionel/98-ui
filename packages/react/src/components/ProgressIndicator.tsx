import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface ProgressIndicatorProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Progress, `0`–`max`. Omit it for an indeterminate bar.
	 */
	value?: number;
	/** Upper bound for `value`. Defaults to `100`. */
	max?: number;
	/** Draw the bar as the chunky segmented (16px block) style. */
	segmented?: boolean;
	/**
	 * Animate the bar as a marquee instead of filling it. Defaults to
	 * `value === undefined`, which is what "no value" means for a progress bar —
	 * Windows 98 slides its blocks while it does not know how long is left.
	 */
	indeterminate?: boolean;
	width?: number | string;
}

/**
 * A progress indicator.
 *
 * ```tsx
 * <ProgressIndicator value={40} width={200} />
 * <ProgressIndicator value={40} segmented width={200} />
 * <ProgressIndicator width={200} />          // indeterminate: animated
 * ```
 *
 * A determinate bar reports `aria-valuenow`; an indeterminate one omits the
 * value attributes entirely, which is the shape assistive technology expects for
 * "still working, no idea how long".
 */
export const ProgressIndicator = forwardRef<HTMLDivElement, ProgressIndicatorProps>(
	function ProgressIndicator(
		{ value, max = 100, segmented = false, indeterminate, width, className, style, ...rest },
		ref,
	) {
		const isIndeterminate = indeterminate ?? value === undefined;
		const clamped = value === undefined ? 0 : Math.min(Math.max(value, 0), max);
		const percent = max === 0 ? 0 : (clamped / max) * 100;

		return (
			<div
				ref={ref}
				role="progressbar"
				aria-valuemin={isIndeterminate ? undefined : 0}
				aria-valuemax={isIndeterminate ? undefined : max}
				aria-valuenow={isIndeterminate ? undefined : clamped}
				className={cx(
					"progress-indicator",
					segmented && "segmented",
					isIndeterminate && "progress-indicator-indeterminate",
					className,
				)}
				style={{ width, ...style }}
				{...rest}
			>
				{/* The marquee positions the bar itself; a determinate bar is sized. */}
				<span
					className="progress-indicator-bar"
					style={isIndeterminate ? undefined : { width: `${percent}%` }}
				/>
			</div>
		);
	},
);
