import { useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { FieldContext } from "../utils/fieldContext";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
	/** Caption for the control. Not rendered when omitted. */
	label?: ReactNode;
	/** Hint shown under the control, wired to `aria-describedby`. */
	description?: ReactNode;
	/** Error message. Its presence also marks the control invalid. */
	error?: ReactNode;
	/** Marks the label and the control as required. */
	required?: boolean;
	/** Use this id for the control instead of a generated one. */
	htmlFor?: string;
	/** The control. It picks up the id, description and invalid state by context. */
	children: ReactNode;
}

/**
 * A labelled form field: label, control, hint and error message.
 *
 * ```tsx
 * <Field label="Occupation" description="As it appears on your tax return" error={errors.occupation}>
 *   <TextBox width={200} />
 * </Field>
 * ```
 *
 * The control does not need an `id`, `aria-describedby` or `aria-invalid` — the
 * field supplies all three through context, and drops the control's own label so
 * the caption is not duplicated. Pass `invalid` explicitly on a control that is
 * used outside a field.
 */
export function Field({
	label,
	description,
	error,
	required = false,
	htmlFor,
	className,
	children,
	...rest
}: FieldProps) {
	const generatedId = useId();
	const controlId = htmlFor ?? `${generatedId}control`;
	const descriptionId = `${generatedId}description`;
	const errorId = `${generatedId}error`;
	const hasError = error !== undefined && error !== null && error !== false;

	const describedBy =
		[description !== undefined ? descriptionId : null, hasError ? errorId : null]
			.filter((id): id is string => id !== null)
			.join(" ") || undefined;

	return (
		<div className={cx("field", className)} {...rest}>
			{label !== undefined && (
				<label className="field-label" htmlFor={controlId}>
					{label}
					{required && (
						<span className="field-required" aria-hidden="true">
							*
						</span>
					)}
				</label>
			)}

			<FieldContext.Provider value={{ controlId, describedBy, invalid: hasError, required }}>
				{children}
			</FieldContext.Provider>

			{description !== undefined && (
				<div className="field-description" id={descriptionId}>
					{description}
				</div>
			)}

			{hasError && (
				<div className="field-error" id={errorId} aria-live="polite">
					{error}
				</div>
			)}
		</div>
	);
}
