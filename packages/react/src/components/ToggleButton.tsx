import {
	createContext,
	forwardRef,
	useContext,
	type HTMLAttributes,
	type MouseEvent,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";
import { Button, type ButtonProps } from "./Button";

/* ------------------------------------------------------------- toggle button */

export interface ToggleButtonProps extends Omit<ButtonProps, "pressed"> {
	/** Controlled pressed state. */
	pressed?: boolean;
	/** Initial pressed state while uncontrolled. */
	defaultPressed?: boolean;
	onPressedChange?: (pressed: boolean) => void;
}

/**
 * A button that stays pressed until it is pressed again — the Windows 98
 * "toggle button" (what other libraries call a switch).
 *
 * ```tsx
 * <ToggleButton defaultPressed>Bold</ToggleButton>
 * ```
 *
 * State is exposed as `aria-pressed`, and the sunken border that
 * `Button variant="toolbar"` draws is driven by it, so a toggled button looks
 * pressed instead of merely tinted.
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
	{ pressed, defaultPressed = false, onPressedChange, onClick, ...rest },
	ref,
) {
	const [isPressed, setPressed] = useControllableState<boolean>({
		value: pressed,
		defaultValue: defaultPressed,
		onChange: onPressedChange,
	});

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		onClick?.(event);
		if (event.defaultPrevented) return;
		setPressed(!isPressed);
	};

	return <Button ref={ref} pressed={isPressed} onClick={handleClick} {...rest} />;
});

/* -------------------------------------------------------------- toggle group */

export type ToggleGroupType = "single" | "multiple";

interface ToggleGroupContextValue {
	type: ToggleGroupType;
	isPressed: (value: string) => boolean;
	toggle: (value: string) => void;
	disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function toArray(value: string | string[] | undefined): string[] {
	if (value === undefined) return [];
	return Array.isArray(value) ? value : [value];
}

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** `"single"` behaves like a radio group, `"multiple"` like check boxes. */
	type?: ToggleGroupType;
	/** Controlled selection: one value for `"single"`, an array for `"multiple"`. */
	value?: string | string[];
	/** Initial selection while uncontrolled. */
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	/** Accessible name for the group. */
	label?: string;
	/** Disable every button in the group. */
	disabled?: boolean;
	/** Stack the buttons vertically. */
	vertical?: boolean;
}

/**
 * A group of `ToggleGroupItem` buttons that share one selection.
 *
 * ```tsx
 * <ToggleGroup defaultValue="left" label="Alignment">
 *   <ToggleGroupItem value="left">Left</ToggleGroupItem>
 *   <ToggleGroupItem value="center">Center</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * In `"single"` mode selecting an item replaces the selection; in `"multiple"`
 * mode each item toggles independently.
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
	{
		type = "single",
		value,
		defaultValue,
		onValueChange,
		label,
		disabled = false,
		vertical = false,
		className,
		children,
		...rest
	},
	ref,
) {
	const [values, setValues] = useControllableState<string[]>({
		value: value === undefined ? undefined : toArray(value),
		defaultValue: toArray(defaultValue),
		onChange: (next) => onValueChange?.(type === "single" ? (next[0] ?? "") : next),
	});

	const context: ToggleGroupContextValue = {
		type,
		disabled,
		isPressed: (item) => values.includes(item),
		toggle: (item) => {
			if (type === "single") {
				// Like a radio group: the active item stays active.
				if (!values.includes(item)) setValues([item]);
				return;
			}
			setValues(
				values.includes(item)
					? values.filter((entry) => entry !== item)
					: [...values, item],
			);
		},
	};

	return (
		<div
			ref={ref}
			role="group"
			aria-label={label}
			className={cx("button-group", vertical && "button-group-vertical", className)}
			{...rest}
		>
			<ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
		</div>
	);
});

export interface ToggleGroupItemProps extends Omit<
	ToggleButtonProps,
	"pressed" | "defaultPressed" | "onPressedChange"
> {
	/** This item's value inside the group. */
	value: string;
	children?: ReactNode;
}

/** One button of a `ToggleGroup`. Inherits the group's selection and disabled state. */
export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
	function ToggleGroupItem({ value, disabled, onClick, ...rest }, ref) {
		const group = useContext(ToggleGroupContext);
		if (!group) {
			throw new Error("<ToggleGroupItem> must be used inside a <ToggleGroup>.");
		}

		return (
			<ToggleButton
				ref={ref}
				pressed={group.isPressed(value)}
				disabled={disabled ?? group.disabled}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented) return;
					group.toggle(value);
				}}
				{...rest}
			/>
		);
	},
);
