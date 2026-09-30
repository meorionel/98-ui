import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
	/** Which element to render. Defaults to `div`. */
	as?: ElementType;
}

/**
 * The status strip along the bottom of a window. Children should be
 * `StatusBarField`s; the 1px gaps between them come from the stylesheet.
 */
export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(function StatusBar(
	{ as: Component = "div", className, ...rest },
	ref,
) {
	return <Component ref={ref} className={cx("status-bar", className)} {...rest} />;
});

export interface StatusBarFieldProps extends HTMLAttributes<HTMLElement> {
	/** Which element to render. Defaults to `p`, matching the original docs. */
	as?: ElementType;
	children?: ReactNode;
}

/** One sunken cell inside a `StatusBar`. */
export const StatusBarField = forwardRef<HTMLElement, StatusBarFieldProps>(function StatusBarField(
	{ as: Component = "p", className, ...rest },
	ref,
) {
	return <Component ref={ref} className={cx("status-bar-field", className)} {...rest} />;
});
