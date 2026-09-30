import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import type { FieldLayout } from "./TextBox";

export interface SelectOption {
	label: ReactNode;
	value: string;
	disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
	/**
	 * Convenience way to declare the options. When omitted, pass `<option>`
	 * elements as children instead.
	 */
	options?: SelectOption[];
	/** Content of the associated `<label>`. */
	label?: ReactNode;
	/** `"row"` (default) puts the label beside the select, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Wrapper width. */
	width?: number | string;
	/** Mark the field invalid: a red outline plus `aria-invalid`. */
	invalid?: boolean;
}

/**
 * A drop-down list box.
 *
 * Focus state is styled by the stylesheet (`select:focus` turns the field
 * blue), and the small triangle button is an inlined SVG background.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
	{ options, label, layout = "row", width, className, id, children, style, invalid, ...rest },
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const selectId = id ?? field?.controlId ?? generatedId;
	const isInvalid = invalid ?? field?.invalid ?? false;

	const control = (
		<select
			ref={ref}
			id={selectId}
			className={cx(isInvalid && "invalid", className)}
			style={style}
			aria-invalid={isInvalid || undefined}
			aria-required={field?.required || undefined}
			aria-describedby={field?.describedBy}
			{...rest}
		>
			{options
				? options.map((option) => (
						<option key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</option>
					))
				: children}
		</select>
	);

	if (field || layout === "none") {
		return (
			<>
				{label !== undefined && <label htmlFor={selectId}>{label}</label>}
				{control}
			</>
		);
	}

	return (
		<div
			className={cx(layout === "stacked" ? "field-row-stacked" : "field-row")}
			style={width === undefined ? undefined : { width }}
		>
			{label !== undefined && <label htmlFor={selectId}>{label}</label>}
			{control}
		</div>
	);
});
