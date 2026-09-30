import {
	forwardRef,
	useEffect,
	useId,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { focusElement } from "../utils/focusTrap";
import { useControllableState } from "../utils/useControllableState";
import type { FieldLayout } from "./TextBox";

/** English accessible names for the two arrow buttons. */
export const SPIN_BOX_LABELS = { up: "Increase", down: "Decrease" } as const;

export interface SpinBoxProps {
	/** Controlled value. `undefined` renders an empty box. */
	value?: number;
	/** Initial value while uncontrolled. */
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	/** Lower bound, and the value `Home` jumps to. */
	min?: number;
	/** Upper bound, and the value `End` jumps to. */
	max?: number;
	/** Amount one arrow press changes the value by. Defaults to `1`. */
	step?: number;
	/** Amount one PageUp/PageDown press changes the value by. Defaults to `10`. */
	pageStep?: number;
	/** Fixed number of decimals, e.g. `2` for a price. */
	precision?: number;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: ReactNode;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Width of the whole control. */
	width?: number | string;
	id?: string;
	/** Submits the value through the text box. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` with an error. */
	invalid?: boolean;
	placeholder?: string;
	/** Accessible names for the arrow buttons. */
	labels?: Partial<Record<"up" | "down", string>>;
	className?: string;
}

function format(value: number | undefined, precision?: number): string {
	if (value === undefined || Number.isNaN(value)) return "";
	return precision === undefined ? String(value) : value.toFixed(precision);
}

function parse(text: string): number | null {
	const trimmed = text.trim();
	if (trimmed === "" || trimmed === "-" || trimmed === ".") return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The Windows 98 spin box: a text box with a pair of up/down arrows.
 *
 * ```tsx
 * <SpinBox label="Font size" min={8} max={72} defaultValue={11} />
 * ```
 *
 * Arrows step by `step`, PageUp/PageDown by `pageStep`, Home/End jump to
 * `min`/`max`, and typing is clamped when the box loses focus. The input carries
 * `role="spinbutton"` with the matching value attributes, so the number is
 * announced as a spin button rather than as free text.
 */
export const SpinBox = forwardRef<HTMLInputElement, SpinBoxProps>(function SpinBox(
	{
		value: valueProp,
		defaultValue,
		onValueChange,
		min,
		max,
		step = 1,
		pageStep = 10,
		precision,
		label,
		layout = "row",
		width,
		id,
		name,
		disabled = false,
		invalid,
		placeholder,
		labels,
		className,
	},
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const inputId = id ?? field?.controlId ?? generatedId;
	const isInvalid = invalid ?? field?.invalid ?? false;

	const [value, setValue] = useControllableState<number | undefined>({
		value: valueProp,
		defaultValue,
		onChange: (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
	});

	const [text, setText] = useState(() => format(valueProp ?? defaultValue, precision));
	const inputRef = useRef<HTMLInputElement | null>(null);
	const editing = useRef(false);

	// Follow the value from the outside, unless the user is mid-edit.
	useEffect(() => {
		if (!editing.current) setText(format(value, precision));
	}, [value, precision]);

	const setInputRef = (node: HTMLInputElement | null) => {
		inputRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
	};

	const clamp = (next: number) => {
		let result = next;
		if (min !== undefined) result = Math.max(min, result);
		if (max !== undefined) result = Math.min(max, result);
		return result;
	};

	/** Commits a value, optionally reformatting the text (blur, arrows, Enter). */
	const commit = (next: number | null, reformat = false) => {
		if (next === null) {
			if (reformat) setText(format(value, precision));
			return;
		}
		const clamped = clamp(next);
		setValue(clamped);
		if (reformat) setText(format(clamped, precision));
	};

	const stepBy = (multiplier: number) => {
		const current = parse(text) ?? value ?? min ?? 0;
		commit(current + step * multiplier, true);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		switch (event.key) {
			case "ArrowUp":
				event.preventDefault();
				stepBy(1);
				return;
			case "ArrowDown":
				event.preventDefault();
				stepBy(-1);
				return;
			case "PageUp":
				event.preventDefault();
				stepBy(pageStep / step);
				return;
			case "PageDown":
				event.preventDefault();
				stepBy(-pageStep / step);
				return;
			case "Home":
				if (min === undefined) return;
				event.preventDefault();
				commit(min, true);
				return;
			case "End":
				if (max === undefined) return;
				event.preventDefault();
				commit(max, true);
				return;
			case "Enter":
				commit(parse(text), true);
				return;
			default:
				return;
		}
	};

	const standalone = field !== null || layout === "none";
	const widthStyle = width === undefined ? undefined : { width };

	const control = (
		<div
			className={cx("spin-box", isInvalid && "invalid", className)}
			style={standalone ? widthStyle : undefined}
			onKeyDown={handleKeyDown}
		>
			<input
				ref={setInputRef}
				id={inputId}
				name={name}
				type="text"
				role="spinbutton"
				className="spin-box-input"
				inputMode={precision === undefined ? "numeric" : "decimal"}
				autoComplete="off"
				disabled={disabled}
				placeholder={placeholder}
				value={text}
				aria-valuenow={value}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-invalid={isInvalid || undefined}
				aria-required={field?.required || undefined}
				aria-describedby={field?.describedBy}
				onChange={(event) => {
					const next = event.target.value;
					setText(next);
					commit(parse(next));
				}}
				onFocus={() => {
					editing.current = true;
				}}
				onBlur={() => {
					editing.current = false;
					commit(parse(text), true);
				}}
			/>
			<div className="spin-box-buttons">
				<button
					type="button"
					className="spin-box-button spin-box-up"
					tabIndex={-1}
					disabled={disabled}
					aria-label={labels?.up ?? SPIN_BOX_LABELS.up}
					onClick={() => {
						stepBy(1);
						focusElement(inputRef.current);
					}}
				/>
				<button
					type="button"
					className="spin-box-button spin-box-down"
					tabIndex={-1}
					disabled={disabled}
					aria-label={labels?.down ?? SPIN_BOX_LABELS.down}
					onClick={() => {
						stepBy(-1);
						focusElement(inputRef.current);
					}}
				/>
			</div>
		</div>
	);

	if (standalone) {
		return <>{control}</>;
	}

	return (
		<div
			className={cx(layout === "stacked" ? "field-row-stacked" : "field-row")}
			style={widthStyle}
		>
			{label !== undefined && <label htmlFor={inputId}>{label}</label>}
			{control}
		</div>
	);
});
