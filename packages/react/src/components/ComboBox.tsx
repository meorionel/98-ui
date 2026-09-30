import {
	forwardRef,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { FloatingSurface } from "../utils/floating";
import { focusElement } from "../utils/focusTrap";
import { useControllableState } from "../utils/useControllableState";
import type { FieldLayout } from "./TextBox";

export interface ComboBoxOption {
	/** Value reported through `onValueChange`. */
	value: string;
	/** Content rendered in the list. */
	label: ReactNode;
	/**
	 * Text placed in the text box when this option is chosen. Defaults to `label`
	 * when that is a string, otherwise to `value` — a `ReactNode` label cannot be
	 * typed into an `<input>`.
	 */
	text?: string;
	disabled?: boolean;
}

export interface ComboBoxProps {
	/** The entries offered by the drop-down list. */
	options: ComboBoxOption[];
	/** Controlled selected value. */
	value?: string;
	/** Initial selected value while uncontrolled. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Controlled text in the box. */
	inputValue?: string;
	/** Initial text while uncontrolled. */
	defaultInputValue?: string;
	/** Called on every keystroke. */
	onInputChange?: (text: string) => void;
	/** Called with the option that was chosen, after `onValueChange`. */
	onOptionSelect?: (option: ComboBoxOption) => void;
	/**
	 * Restrict the control to the listed options: the text box is read-only and
	 * typing runs type-ahead instead of editing. This is the Windows 98
	 * "drop-down list" style; leave it off for the editable "drop-down combo".
	 */
	selectOnly?: boolean;
	/**
	 * Replace the built-in filter with your own. The default matches the start of
	 * the option text, case-insensitively — what a Windows 98 combo box does.
	 * Pass e.g. `(option, query) => text(option).includes(query)` for substring
	 * matching, or a fuzzy scorer.
	 */
	filter?: (option: ComboBoxOption, query: string) => boolean;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: ReactNode;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Width of the whole control. */
	width?: number | string;
	/** Shown in the list when no option matches. */
	emptyMessage?: ReactNode;
	/** Accessible name for the list box when neither `label` nor a `Field` is present. */
	listLabel?: string;
	/** Accessible name for the arrow button. Defaults to `"Show options"`. */
	buttonLabel?: string;
	id?: string;
	/** Submits the selected value through a hidden input. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` that has an error. */
	invalid?: boolean;
	placeholder?: string;
	/** Controlled list visibility. */
	open?: boolean;
	/** Initial list visibility while uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}

/** The text a combo box shows for an option. */
export function comboBoxOptionText(option: ComboBoxOption): string {
	if (option.text !== undefined) return option.text;
	return typeof option.label === "string" ? option.label : option.value;
}

function defaultFilter(option: ComboBoxOption, query: string): boolean {
	return comboBoxOptionText(option).toLowerCase().startsWith(query.trim().toLowerCase());
}

function firstEnabled(options: ComboBoxOption[], from = 0): number {
	for (let index = from; index < options.length; index += 1) {
		if (!options[index].disabled) return index;
	}
	return -1;
}

function lastEnabled(options: ComboBoxOption[]): number {
	for (let index = options.length - 1; index >= 0; index -= 1) {
		if (!options[index].disabled) return index;
	}
	return -1;
}

/**
 * The Windows 98 combo box: a text box with a drop-down list underneath.
 *
 * ```tsx
 * <ComboBox
 *   label="Driver"
 *   options={drivers.map((driver) => ({ value: driver.id, label: driver.name }))}
 *   onValueChange={setDriver}
 * />
 * ```
 *
 * Editable by default — typing filters the list and free text is reported through
 * `onInputChange`. Pass `selectOnly` for the "drop-down list" style, where the
 * box only displays the selection and typing jumps through the entries.
 *
 * Keyboard: `↓`/`↑` open and walk the list, `Alt+↓` toggles it, `Home`/`End` jump,
 * `Enter` chooses, `Escape` cancels the edit, `Tab` moves on and commits a typed
 * option when it matches one exactly. The list is a `role="listbox"` wired to the
 * input through `aria-activedescendant`, so focus never leaves the text box.
 */
export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(function ComboBox(
	{
		options,
		value,
		defaultValue,
		onValueChange,
		inputValue,
		defaultInputValue,
		onInputChange,
		onOptionSelect,
		selectOnly = false,
		filter = defaultFilter,
		label,
		layout = "row",
		width,
		emptyMessage,
		listLabel,
		buttonLabel,
		id,
		name,
		disabled = false,
		invalid,
		placeholder,
		open: openProp,
		defaultOpen = false,
		onOpenChange,
		className,
		inline,
		container,
	},
	ref,
) {
	const field = useField();
	const generatedId = useId();
	const inputId = id ?? field?.controlId ?? generatedId;
	const listId = `${generatedId}list`;

	const initialSelected = defaultValue;
	const initialOption = options.find((option) => option.value === initialSelected);

	const [selected = "", setSelected] = useControllableState<string | undefined>({
		value,
		defaultValue: initialSelected,
		onChange: (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
	});
	const [text, setText] = useControllableState<string>({
		value: inputValue,
		defaultValue:
			defaultInputValue ??
			(initialOption ? comboBoxOptionText(initialOption) : (initialSelected ?? "")),
		onChange: onInputChange,
	});

	const [open, setOpen] = useControllableState<boolean>({
		value: openProp,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	});
	// `null` means "not filtering": the whole list is offered.
	const [query, setQuery] = useState<string | null>(null);
	const [highlighted, setHighlighted] = useState(-1);

	const boxRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);
	const typeahead = useRef({ query: "", timer: 0 });

	const filtered = useMemo(() => {
		if (query === null || query === "" || selectOnly) return options;
		return options.filter((option) => filter(option, query));
	}, [options, query, selectOnly, filter]);

	const isInvalid = invalid ?? field?.invalid ?? false;

	const focusInput = () => focusElement(inputRef.current);

	const setInputRef = (node: HTMLInputElement | null) => {
		inputRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
	};

	const openList = (highlight?: number) => {
		setOpen(true);
		if (highlight !== undefined) {
			setHighlighted(highlight);
			return;
		}
		const selectedIndex = filtered.findIndex((option) => option.value === selected);
		setHighlighted(selectedIndex > -1 ? selectedIndex : firstEnabled(filtered));
	};

	const closeList = () => {
		setOpen(false);
		setQuery(null);
	};

	const choose = (option: ComboBoxOption) => {
		if (option.disabled) return;
		setSelected(option.value);
		setText(comboBoxOptionText(option));
		closeList();
		onOptionSelect?.(option);
		focusInput();
	};

	/** Commits free text when it matches an option exactly; used on blur and Enter. */
	const commitText = () => {
		if (selectOnly) {
			const current = options.find((option) => option.value === selected);
			setText(current ? comboBoxOptionText(current) : "");
			return;
		}
		const typed = text.trim().toLowerCase();
		if (typed === "") return;
		const match = options.find(
			(option) => comboBoxOptionText(option).toLowerCase() === typed && !option.disabled,
		);
		if (match) {
			setSelected(match.value);
			setText(comboBoxOptionText(match));
			onOptionSelect?.(match);
		}
	};

	/** Escape and outside clicks cancel the edit, as in Windows 98. */
	const cancelEdit = () => {
		closeList();
		if (selectOnly) return;
		if (selected === undefined || selected === "") return;
		const current = options.find((option) => option.value === selected);
		if (current) setText(comboBoxOptionText(current));
	};

	const move = (from: number, direction: -1 | 1) => {
		const total = filtered.length;
		if (total === 0) return;
		for (let step = 1; step <= total; step += 1) {
			const index = (from + direction * step + total * step) % total;
			if (!filtered[index].disabled) {
				setHighlighted(index);
				return;
			}
		}
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const next = event.target.value;
		setText(next);
		setQuery(next);
		if (!open) setOpen(true);
		setHighlighted(
			firstEnabled(next === "" ? options : options.filter((o) => filter(o, next))),
		);
	};

	const handleTypeahead = (key: string) => {
		const state = typeahead.current;
		state.query += key.toLowerCase();
		window.clearTimeout(state.timer);
		state.timer = window.setTimeout(() => {
			state.query = "";
		}, 500);

		const found = options.findIndex(
			(option) =>
				!option.disabled &&
				comboBoxOptionText(option).toLowerCase().startsWith(state.query),
		);
		if (found > -1) {
			setHighlighted(found);
			if (!open) setOpen(true);
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				if (!open) openList();
				else move(highlighted, 1);
				return;
			case "ArrowUp":
				event.preventDefault();
				if (!open) openList(lastEnabled(filtered));
				else move(highlighted, -1);
				return;
			case "Home":
				if (!open) return;
				event.preventDefault();
				setHighlighted(firstEnabled(filtered));
				return;
			case "End":
				if (!open) return;
				event.preventDefault();
				setHighlighted(lastEnabled(filtered));
				return;
			case "Enter": {
				const option = open ? filtered[highlighted] : undefined;
				if (option && !option.disabled) {
					event.preventDefault();
					choose(option);
					return;
				}
				commitText();
				return;
			}
			case "Escape":
				// The layer's dismiss handler closes the list and calls `cancelEdit`.
				return;
			case "Tab":
				closeList();
				commitText();
				return;
			default:
				if (selectOnly && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
					handleTypeahead(event.key);
				}
				return;
		}
	};

	// Keep the highlighted option visible while arrowing through a long list.
	useEffect(() => {
		if (!open || highlighted < 0) return;
		const node = listRef.current?.children[highlighted] as HTMLElement | undefined;
		if (node && typeof node.scrollIntoView === "function") node.scrollIntoView();
	}, [open, highlighted]);

	const widthStyle = width === undefined ? undefined : { width };
	const standalone = field !== null || layout === "none";

	const control = (
		<div
			ref={boxRef}
			className={cx("combo-box", isInvalid && "invalid", className)}
			style={standalone ? widthStyle : undefined}
		>
			<input
				ref={setInputRef}
				id={inputId}
				type="text"
				role="combobox"
				className="combo-box-input"
				autoComplete="off"
				placeholder={placeholder}
				disabled={disabled}
				readOnly={selectOnly}
				value={text}
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				aria-autocomplete={selectOnly ? undefined : "list"}
				aria-activedescendant={
					open && highlighted > -1 ? `${listId}-option-${highlighted}` : undefined
				}
				aria-invalid={isInvalid || undefined}
				aria-required={field?.required || undefined}
				aria-describedby={field?.describedBy}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onMouseDown={() => {
					// The editable box stays an editing surface: only the arrow
					// opens the list with a pointer, as in Windows 98.
					if (selectOnly && !open && !disabled) openList();
				}}
				onBlur={commitText}
			/>
			<button
				type="button"
				className="combo-box-button"
				tabIndex={-1}
				disabled={disabled}
				aria-label={buttonLabel ?? "Show options"}
				onClick={() => (open ? closeList() : openList())}
			></button>
			{name !== undefined && <input type="hidden" name={name} value={selected ?? ""} />}
		</div>
	);

	const list = (
		<FloatingSurface
			open={open && !disabled}
			anchorRef={boxRef}
			matchAnchorWidth
			role="listbox"
			id={listId}
			label={listLabel ?? (typeof label === "string" ? label : undefined)}
			className="combo-box-list"
			onDismiss={cancelEdit}
			inline={inline}
			container={container}
		>
			<div ref={listRef} role="presentation">
				{filtered.length === 0 && emptyMessage !== undefined ? (
					<div className="combo-box-empty">{emptyMessage}</div>
				) : (
					filtered.map((option, index) => (
						<div
							key={option.value}
							id={`${listId}-option-${index}`}
							role="option"
							aria-selected={option.value === selected}
							aria-disabled={option.disabled || undefined}
							className={cx(
								"combo-box-option",
								index === highlighted && "combo-box-option-highlighted",
								option.disabled && "combo-box-option-disabled",
							)}
							onMouseDown={(event) => event.preventDefault()}
							onMouseEnter={() => setHighlighted(index)}
							onClick={() => choose(option)}
						>
							{option.label}
						</div>
					))
				)}
			</div>
		</FloatingSurface>
	);

	// Inside a `Field` the label, hint and error belong to the field, so the
	// control renders bare and inherits its id and ARIA wiring from context.
	if (standalone) {
		return (
			<>
				{control}
				{list}
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
			{list}
		</>
	);
});
