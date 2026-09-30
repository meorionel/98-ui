import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { Button } from "./Button";

/** The five command buttons Windows 98 puts in a title bar. */
export type TitleBarControl = "minimize" | "maximize" | "restore" | "help" | "close";

/** English `aria-label`s used when no localised label is supplied. */
export const TITLE_BAR_CONTROL_LABELS: Record<TitleBarControl, string> = {
	minimize: "Minimize",
	maximize: "Maximize",
	restore: "Restore",
	help: "Help",
	close: "Close",
};

export interface TitleBarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Which glyph to draw. */
	action: TitleBarControl;
	/**
	 * Accessible name. The glyph is drawn from a styling class, not the label,
	 * so this can safely be translated.
	 */
	label?: string;
}

/**
 * A single title bar command button.
 *
 * Both the `aria-label="Minimize"` and the `.minimize` class hooks exist in the
 * stylesheet; we emit the class so the accessible name can be localised freely.
 */
export const TitleBarButton = forwardRef<HTMLButtonElement, TitleBarButtonProps>(
	function TitleBarButton({ action, label, className, ...rest }, ref) {
		return (
			<Button
				ref={ref}
				className={cx(action, className)}
				aria-label={label ?? TITLE_BAR_CONTROL_LABELS[action]}
				{...rest}
			/>
		);
	},
);

export interface TitleBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** Caption text. Rendered inside `.title-bar-text`. */
	text?: ReactNode;
	/** Which command buttons to render, left to right. */
	controls?: TitleBarControl[];
	/** Grey out the bar to signal that the window is not focused. */
	inactive?: boolean;
	/** Called with the clicked control. */
	onControl?: (action: TitleBarControl) => void;
	/** Localised accessible names, keyed by control. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Extra props for the `.title-bar-controls` wrapper. */
	controlsProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * The caption bar at the top of a window, optionally with command buttons.
 *
 * ```tsx
 * <TitleBar
 *   text="A Complete Window"
 *   controls={["minimize", "maximize", "close"]}
 *   onControl={(action) => console.log(action)}
 * />
 * ```
 */
export const TitleBar = forwardRef<HTMLDivElement, TitleBarProps>(function TitleBar(
	{
		text,
		controls = [],
		inactive = false,
		onControl,
		labels,
		controlsProps,
		className,
		children,
		...rest
	},
	ref,
) {
	return (
		<div ref={ref} className={cx("title-bar", inactive && "inactive", className)} {...rest}>
			{text !== undefined && <div className="title-bar-text">{text}</div>}
			{children}
			{controls.length > 0 && (
				<div
					{...controlsProps}
					className={cx("title-bar-controls", controlsProps?.className)}
				>
					{controls.map((action) => (
						<TitleBarButton
							key={action}
							action={action}
							label={labels?.[action]}
							onClick={() => onControl?.(action)}
						/>
					))}
				</div>
			)}
		</div>
	);
});
