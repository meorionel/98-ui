import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface FieldRowProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Stack the children vertically instead of horizontally.
	 * Shorthand for using `FieldRowStacked`.
	 */
	stacked?: boolean;
}

/**
 * Lays out a label and its control on one line, with the 6px spacing Windows 98
 * uses between grouped elements. Consecutive rows are spaced 6px apart too,
 * which the stylesheet handles through `.field-row + .field-row`.
 */
export const FieldRow = forwardRef<HTMLDivElement, FieldRowProps>(function FieldRow(
	{ stacked = false, className, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			className={cx(stacked ? "field-row-stacked" : "field-row", className)}
			{...rest}
		/>
	);
});

export type FieldRowStackedProps = HTMLAttributes<HTMLDivElement>;

/**
 * Like `FieldRow`, but places the label above the control — used for text boxes
 * and text areas that need the full width.
 */
export const FieldRowStacked = forwardRef<HTMLDivElement, FieldRowStackedProps>(
	function FieldRowStacked({ className, ...rest }, ref) {
		return <div ref={ref} className={cx("field-row-stacked", className)} {...rest} />;
	},
);
