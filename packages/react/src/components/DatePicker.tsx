import { forwardRef, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { FloatingSurface } from "../utils/floating";
import { focusElement } from "../utils/focusTrap";
import { useControllableState } from "../utils/useControllableState";
import { Calendar, type CalendarLabels } from "./Calendar";
import type { FieldLayout } from "./TextBox";

export interface DatePickerProps {
	/** Controlled value, as `YYYY-MM-DD`. */
	value?: string;
	/** Initial value while uncontrolled. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Earliest selectable date. */
	min?: string;
	/** Latest selectable date. */
	max?: string;
	/** `0` (default) starts the week on Sunday, `1` on Monday. */
	weekStartsOn?: 0 | 1;
	/** Localised month, weekday and button names. */
	labels?: Partial<CalendarLabels>;
	/** How the chosen date is shown in the box. Defaults to the ISO date. */
	formatValue?: (iso: string) => string;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: ReactNode;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Width of the whole control. */
	width?: number | string;
	placeholder?: string;
	id?: string;
	/** Submits the value through the text box. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` with an error. */
	invalid?: boolean;
	/** Accessible name for the calendar button. Defaults to `"Choose a date"`. */
	buttonLabel?: string;
	/** Controlled calendar visibility. */
	open?: boolean;
	/** Initial calendar visibility while uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
	className?: string;
}

/**
 * A date box with a drop-down calendar — the Windows 98 date picker.
 *
 * ```tsx
 * <DatePicker
 *   label="Installed on"
 *   defaultValue="1998-06-25"
 *   min="1995-08-24"
 *   onValueChange={setDate}
 * />
 * ```
 *
 * The box itself is read-only: dates are chosen from the calendar, whose grid
 * takes focus while it is open and hands it back when it closes. The value is
 * always an ISO `YYYY-MM-DD` string, so no date library is needed anywhere in
 * the chain — `toIsoDate`/`parseIsoDate` are exported for the conversions.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
	{
		value,
		defaultValue,
		onValueChange,
		min,
		max,
		weekStartsOn = 0,
		labels,
		formatValue = (iso) => iso,
		label,
		layout = "row",
		width,
		placeholder,
		id,
		name,
		disabled = false,
		invalid,
		buttonLabel = "Choose a date",
		open: openProp,
		defaultOpen = false,
		onOpenChange,
		inline,
		container,
		className,
	},
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const inputId = id ?? field?.controlId ?? generatedId;

	const [selected = "", setSelected] = useControllableState<string | undefined>({
		value,
		defaultValue,
		onChange: (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
	});
	const [open, setOpen] = useControllableState<boolean>({
		value: openProp,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});

	const boxRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const isInvalid = invalid ?? field?.invalid ?? false;

	const setInputRef = (node: HTMLInputElement | null) => {
		inputRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
	};

	const close = () => {
		setOpen(false);
		focusElement(inputRef.current);
	};

	const standalone = field !== null || layout === "none";
	const widthStyle = width === undefined ? undefined : { width };

	const control = (
		<div
			ref={boxRef}
			className={cx("date-picker", isInvalid && "invalid", className)}
			style={standalone ? widthStyle : undefined}
		>
			<input
				ref={setInputRef}
				id={inputId}
				name={name}
				type="text"
				className="date-picker-input"
				readOnly
				disabled={disabled}
				placeholder={placeholder}
				value={selected === "" ? "" : formatValue(selected)}
				aria-invalid={isInvalid || undefined}
				aria-required={field?.required || undefined}
				aria-describedby={field?.describedBy}
				aria-expanded={open}
				onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
					if (disabled) return;
					if (event.key === "ArrowDown" || (event.altKey && event.key === "ArrowDown")) {
						event.preventDefault();
						setOpen(true);
					}
				}}
			/>
			<button
				type="button"
				className="date-picker-button"
				tabIndex={-1}
				disabled={disabled}
				aria-label={buttonLabel}
				onClick={() => (open ? close() : setOpen(true))}
			/>
		</div>
	);

	const popup = (
		<FloatingSurface
			open={open && !disabled}
			anchorRef={boxRef}
			matchAnchorWidth={false}
			role="dialog"
			label={buttonLabel}
			className="date-picker-popup"
			onDismiss={close}
			autoFocus
			restoreFocus
			inline={inline}
			container={container}
		>
			<Calendar
				value={selected === "" ? undefined : selected}
				min={min}
				max={max}
				weekStartsOn={weekStartsOn}
				labels={labels}
				onValueChange={(next) => {
					setSelected(next);
					close();
				}}
			/>
		</FloatingSurface>
	);

	if (standalone) {
		return (
			<>
				{control}
				{popup}
			</>
		);
	}

	return (
		<>
			<div
				className={cx(layout === "stacked" ? "field-row-stacked" : "field-row")}
				style={widthStyle}
			>
				{label !== undefined && <label htmlFor={inputId}>{label}</label>}
				{control}
			</div>
			{popup}
		</>
	);
});
