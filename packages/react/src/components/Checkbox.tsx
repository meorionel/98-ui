import {
	forwardRef,
	useId,
	type HTMLAttributes,
	type InputHTMLAttributes,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { FieldRow } from "./FieldRow";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Text rendered inside the associated `<label>`. */
	label?: ReactNode;
	/**
	 * Wrap the input and label in a `.field-row` so that stacked checkboxes get
	 * the standard 6px gap. Defaults to `true`; set to `false` when you place the
	 * checkbox inside a row yourself.
	 */
	row?: boolean;
	/** Extra props for the wrapping `.field-row` (ignored when `row` is false). */
	rowProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * A Windows 98 check box.
 *
 * The stylesheet draws the box and the checkmark from the input's own state via
 * the `input + label` sibling selectors, so the input is always rendered
 * immediately before its label — never reorder them.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ label, row = true, rowProps, className, id, checked, onChange, ...rest },
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	// React warns when `checked` is set without `onChange`. Static previews
	// (docs, tests) legitimately pass `checked` alone, so mark those read-only.
	const isStatic = checked !== undefined && onChange === undefined;

	const input = (
		<input
			ref={ref}
			type="checkbox"
			id={inputId}
			className={className}
			checked={checked}
			onChange={onChange}
			readOnly={isStatic}
			{...rest}
		/>
	);

	if (!row) {
		return (
			<>
				{input}
				{label !== undefined && <label htmlFor={inputId}>{label}</label>}
			</>
		);
	}

	return (
		<FieldRow {...rowProps} className={cx(rowProps?.className)}>
			{input}
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
		</FieldRow>
	);
});
