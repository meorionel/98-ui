import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { TitleBar, type TitleBarControl, type TitleBarProps } from "./TitleBar";

export type WindowBodyProps = HTMLAttributes<HTMLDivElement>;

/**
 * The padded content area of a window. Everything between the title bar and the
 * status bar goes in here (including the menu bar, which bleeds to the edges
 * through negative margins).
 */
export const WindowBody = forwardRef<HTMLDivElement, WindowBodyProps>(function WindowBody(
	{ className, ...rest },
	ref,
) {
	return <div ref={ref} className={cx("window-body", className)} {...rest} />;
});

export interface WindowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	/** Caption for the title bar. Omit to render a bodyless window frame. */
	title?: ReactNode;
	/** Command buttons rendered in the title bar. */
	controls?: TitleBarControl[];
	/** Grey out the title bar (used for background windows). */
	inactive?: boolean;
	/** Called with the clicked title bar control. */
	onControl?: (action: TitleBarControl) => void;
	/** Localised accessible names for the title bar buttons. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Rendered inside `.window-body`, above `children`. Typically a `MenuBar`. */
	menuBar?: ReactNode;
	/** Rendered after the body. Typically a `StatusBar`. */
	statusBar?: ReactNode;
	/** Wrap `children` in a `.window-body`. Defaults to `true`. */
	body?: boolean;
	width?: number | string;
	height?: number | string;
	/** Extra props forwarded to the generated `TitleBar`. */
	titleBarProps?: Omit<TitleBarProps, "text" | "controls" | "onControl" | "labels" | "inactive">;
	/** Extra props forwarded to the generated `WindowBody`. */
	bodyProps?: WindowBodyProps;
}

/**
 * A complete Windows 98 window: raised outer/inner border, optional title bar
 * with command buttons, an optional menu bar, and an optional status bar.
 *
 * ```tsx
 * <Window title="A Window With Stuff In It" controls={["minimize", "maximize", "close"]} width={320}>
 *   <p>There's so much room for activities!</p>
 * </Window>
 * ```
 */
export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
	{
		title,
		controls,
		inactive = false,
		onControl,
		labels,
		menuBar,
		statusBar,
		body = true,
		width,
		height,
		titleBarProps,
		bodyProps,
		className,
		style,
		children,
		...rest
	},
	ref,
) {
	const content = body ? (
		<WindowBody {...bodyProps}>
			{menuBar}
			{children}
		</WindowBody>
	) : (
		<>
			{menuBar}
			{children}
		</>
	);

	return (
		<div
			ref={ref}
			className={cx("window", className)}
			style={{ width, height, ...style }}
			{...rest}
		>
			{title !== undefined && (
				<TitleBar
					{...titleBarProps}
					text={title}
					controls={controls}
					inactive={inactive}
					onControl={onControl}
					labels={labels}
				/>
			)}
			{content}
			{statusBar}
		</div>
	);
});
