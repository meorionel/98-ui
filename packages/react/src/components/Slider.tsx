import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { FieldRow } from "./FieldRow";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Lay the slider out vertically (wraps the input in `.is-vertical`). */
	vertical?: boolean;
	/** Swap the default indicator for the rectangular box indicator. */
	boxIndicator?: boolean;
	/** Content of the `<label>` shown before the slider. */
	label?: ReactNode;
	/** Optional caption rendered before the track, e.g. "Low". */
	lowLabel?: ReactNode;
	/** Optional caption rendered after the track, e.g. "High". */
	highLabel?: ReactNode;
	/** Track length in pixels. Defaults to the stylesheet's 150px. */
	length?: number;
	/**
	 * Wrap everything in a `.field-row`. Defaults to `true` when a `label`,
	 * `lowLabel` or `highLabel` is supplied.
	 */
	row?: boolean;
}

/**
 * A slider (trackbar control).
 *
 * Both the horizontal and the vertical variants rely on vendor pseudo-elements
 * in the stylesheet (`::-webkit-slider-thumb`, `::-moz-range-thumb`), so the
 * input itself is left as a plain, fully native `<input type="range">` — all
 * keyboard and assistive-technology behaviour is preserved.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
	{
		vertical = false,
		boxIndicator = false,
		label,
		lowLabel,
		highLabel,
		length,
		row,
		className,
		id,
		style,
		value,
		defaultValue,
		onChange,
		...rest
	},
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	// A range input has no read-only mode, so React would warn about a `value`
	// with no `onChange`. Treat that combination as a starting value instead.
	const isStatic = value !== undefined && onChange === undefined;
	const valueProps = isStatic ? { defaultValue: value } : { value, defaultValue, onChange };

	const input = (
		<input
			ref={ref}
			id={inputId}
			type="range"
			className={cx(boxIndicator && "has-box-indicator", className)}
			style={vertical ? { width: length, ...style } : style}
			{...valueProps}
			{...rest}
		/>
	);

	const control = vertical ? (
		<div className="is-vertical" style={length === undefined ? undefined : { height: length }}>
			{input}
		</div>
	) : (
		input
	);

	const withRow =
		row ?? (label !== undefined || lowLabel !== undefined || highLabel !== undefined);
	if (!withRow) return control;

	return (
		<FieldRow>
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
			{lowLabel !== undefined && <label htmlFor={inputId}>{lowLabel}</label>}
			{control}
			{highLabel !== undefined && <label htmlFor={inputId}>{highLabel}</label>}
		</FieldRow>
	);
});
