import {
	forwardRef,
	useId,
	type InputHTMLAttributes,
	type ReactNode,
	type TextareaHTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";

/** Every `<input type>` the stylesheet gives the engraved field border to. */
export type TextBoxType = "text" | "password" | "email" | "url" | "tel" | "number" | "search";

/** Where the label goes relative to the control. */
export type FieldLayout = "row" | "stacked" | "none";

export interface TextBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Content of the associated `<label>`. */
	label?: ReactNode;
	type?: TextBoxType;
	/** `"row"` (default) puts the label beside the input, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Wrapper width — the stacked examples in the docs use `200px`. */
	width?: number | string;
	/**
	 * Mark the field invalid: a red outline plus `aria-invalid`. Inherited from a
	 * surrounding `Field` that has an `error`.
	 */
	invalid?: boolean;
}

/**
 * A single-line text box.
 *
 * Renders a `.field-row` (or `.field-row-stacked`) wrapper around a `<label>`
 * and the input, mirroring how the original stylesheet expects the two to be
 * paired.
 */
export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(function TextBox(
	{ label, type = "text", layout = "row", width, className, id, style, invalid, ...rest },
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const inputId = id ?? field?.controlId ?? generatedId;
	const isInvalid = invalid ?? field?.invalid ?? false;

	const control = (
		<input
			ref={ref}
			id={inputId}
			type={type}
			className={cx(isInvalid && "invalid", className)}
			style={style}
			aria-invalid={isInvalid || undefined}
			aria-required={field?.required || undefined}
			aria-describedby={field?.describedBy}
			{...rest}
		/>
	);

	// Inside a `Field` the caption and the messages belong to the field.
	if (field || layout === "none") {
		return (
			<>
				{label !== undefined && <label htmlFor={inputId}>{label}</label>}
				{control}
			</>
		);
	}

	const wrapperStyle = width === undefined ? undefined : { width };

	return (
		<div
			className={cx(layout === "stacked" ? "field-row-stacked" : "field-row")}
			style={wrapperStyle}
		>
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
			{control}
		</div>
	);
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Content of the associated `<label>`. */
	label?: ReactNode;
	/** `"row"` puts the label beside the area, `"stacked"` (default) above it. */
	layout?: FieldLayout;
	/** Wrapper width — the stacked examples in the docs use `200px`. */
	width?: number | string;
	/** Mark the field invalid: a red outline plus `aria-invalid`. */
	invalid?: boolean;
}

/**
 * A multi-line text box. Rendered as a native `<textarea>`, which the
 * stylesheet treats exactly like a single-line text box.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
	{ label, layout = "stacked", width, className, id, style, invalid, ...rest },
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const inputId = id ?? field?.controlId ?? generatedId;
	const isInvalid = invalid ?? field?.invalid ?? false;
	const control = (
		<textarea
			ref={ref}
			id={inputId}
			className={cx(isInvalid && "invalid", className)}
			style={style}
			aria-invalid={isInvalid || undefined}
			aria-required={field?.required || undefined}
			aria-describedby={field?.describedBy}
			{...rest}
		/>
	);

	if (field || layout === "none") {
		return (
			<>
				{label !== undefined && <label htmlFor={inputId}>{label}</label>}
				{control}
			</>
		);
	}

	return (
		<div
			className={cx(layout === "stacked" ? "field-row-stacked" : "field-row")}
			style={width === undefined ? undefined : { width }}
		>
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
			{control}
		</div>
	);
});

/**
 * A `.field-row` that only contains text — used as a caption above a set of
 * inputs ("Select one:", "Volume:"), matching the original docs.
 */
export const FieldLabel = forwardRef<HTMLDivElement, { children?: ReactNode }>(function FieldLabel(
	{ children },
	ref,
) {
	return (
		<div ref={ref} className="field-row">
			{children}
		</div>
	);
});
