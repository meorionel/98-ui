import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { Button, type ButtonProps } from "./Button";
import { ToggleButton, type ToggleButtonProps } from "./ToggleButton";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
	/** Accessible name for the `role="toolbar"` element. */
	label?: string;
}

/**
 * The Windows 98 common toolbar: a flat row of icon buttons with separators.
 *
 * ```tsx
 * <Toolbar label="Standard">
 *   <ToolbarButton icon={<NewIcon />} onClick={newFile}>New</ToolbarButton>
 *   <ToolbarSeparator />
 *   <ToolbarButton icon={<BoldIcon />} defaultPressed>Bold</ToolbarButton>
 *   <ToolbarSpacer />
 *   <ToolbarButton>Help</ToolbarButton>
 * </Toolbar>
 * ```
 *
 * Any child works — `DropdownMenu` triggers and `ToggleGroup`s are common ones —
 * but `ToolbarButton`, `ToolbarSeparator` and `ToolbarSpacer` keep the spacing
 * and the flat look consistent.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
	{ label, className, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			role="toolbar"
			aria-label={label}
			aria-orientation="horizontal"
			className={cx("toolbar", className)}
			{...rest}
		/>
	);
});

export interface ToolbarButtonProps extends Omit<ToggleButtonProps, "variant"> {
	/** Glyph rendered before the label. */
	icon?: ReactNode;
	/** Force a command button even when toggle props are present. */
	toggle?: boolean;
}

/**
 * A toolbar button.
 *
 * Supplying any of `pressed`, `defaultPressed` or `onPressedChange` turns it into
 * a toggle (a raised border until it is switched on); otherwise it is an ordinary
 * command button.
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
	function ToolbarButton(
		{ icon, toggle, pressed, defaultPressed, onPressedChange, children, ...rest },
		ref,
	) {
		const isToggle =
			toggle === true ||
			(toggle !== false &&
				(pressed !== undefined ||
					defaultPressed !== undefined ||
					onPressedChange !== undefined));

		const content = (
			<>
				{icon !== undefined && (
					<span className="toolbar-button-icon" aria-hidden="true">
						{icon}
					</span>
				)}
				{children}
			</>
		);

		if (isToggle) {
			return (
				<ToggleButton
					ref={ref}
					variant="toolbar"
					pressed={pressed}
					defaultPressed={defaultPressed}
					onPressedChange={onPressedChange}
					{...rest}
				>
					{content}
				</ToggleButton>
			);
		}

		return (
			<Button ref={ref} variant="toolbar" {...(rest as ButtonProps)}>
				{content}
			</Button>
		);
	},
);

/** The 2px sunken rule that groups toolbar buttons. */
export const ToolbarSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	function ToolbarSeparator({ className, ...rest }, ref) {
		return (
			<div
				ref={ref}
				role="separator"
				aria-orientation="vertical"
				className={cx("toolbar-separator", className)}
				{...rest}
			/>
		);
	},
);

/** Pushes everything after it to the far end of the toolbar. */
export const ToolbarSpacer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	function ToolbarSpacer({ className, ...rest }, ref) {
		return (
			<div
				ref={ref}
				aria-hidden="true"
				className={cx("toolbar-spacer", className)}
				{...rest}
			/>
		);
	},
);
