import {
	forwardRef,
	useId,
	type ChangeEvent,
	type HTMLAttributes,
	type InputHTMLAttributes,
	type ReactNode,
} from "react";
import { useControllableState } from "../utils/useControllableState";
import { FieldRow } from "./FieldRow";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	/** Text rendered inside the associated `<label>`. */
	label?: ReactNode;
	/** Wrap the input and label in a `.field-row`. Defaults to `true`. */
	row?: boolean;
	/** Extra props for the wrapping `.field-row` (ignored when `row` is false). */
	rowProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * A Windows 98 option button (radio button).
 *
 * Group several of these by giving them the same `name`, exactly like the
 * native control. For a managed group use `RadioGroup` instead.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
	{ label, row = true, rowProps, className, id, checked, onChange, ...rest },
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const isStatic = checked !== undefined && onChange === undefined;

	const input = (
		<input
			ref={ref}
			type="radio"
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
		<FieldRow {...rowProps}>
			{input}
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
		</FieldRow>
	);
});

export interface RadioGroupOption {
	label: ReactNode;
	value: string;
	disabled?: boolean;
}

export interface RadioGroupProps {
	/** Shared `name` for every radio in the group. Auto-generated when omitted. */
	name?: string;
	/** Controlled selected value. */
	value?: string;
	/** Initial selected value for uncontrolled usage. */
	defaultValue?: string;
	onChange?: (value: string) => void;
	options: RadioGroupOption[];
	/** Render an optional label above the group. */
	label?: ReactNode;
	/** Render the options inside a `<fieldset>`/`<legend>` group box. */
	groupBox?: boolean;
	className?: string;
}

/**
 * Convenience wrapper that manages the selected value of a set of `Radio`s
 * and guarantees they all share one `name`.
 */
export function RadioGroup({
	name,
	value,
	defaultValue = "",
	onChange,
	options,
	label,
	groupBox = false,
	className,
}: RadioGroupProps) {
	const generatedName = useId();
	const groupName = name ?? generatedName;
	const [selected, setSelected] = useControllableState<string>({
		value,
		defaultValue,
		onChange,
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSelected(event.target.value);
	};

	const content = (
		<>
			{options.map((option) => (
				<Radio
					key={option.value}
					name={groupName}
					value={option.value}
					label={option.label}
					disabled={option.disabled}
					checked={selected === option.value}
					onChange={handleChange}
				/>
			))}
		</>
	);

	if (groupBox) {
		return (
			<fieldset className={className}>
				{label !== undefined && <legend>{label}</legend>}
				{content}
			</fieldset>
		);
	}

	if (label === undefined) return <div className={className}>{content}</div>;

	return (
		<div className={className}>
			<FieldRow>{label}</FieldRow>
			{content}
		</div>
	);
}
