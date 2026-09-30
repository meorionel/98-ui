import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * `"default"` adds the thicker inner ring Windows 98 uses for the button
	 * that responds to <kbd>Enter</kbd> in the active window. `"toolbar"` draws
	 * the flat common-toolbar button that only shows its border on hover.
	 */
	variant?: "normal" | "default" | "toolbar";
	/**
	 * Force the pressed/sunken look without an actual pointer press.
	 * Handy for docs, Storybook and visual regression tests.
	 */
	active?: boolean;
	/** Force the dotted focus ring. Handy for docs and visual tests. */
	focused?: boolean;
	/**
	 * Toggle state: adds the sunken look *and* `aria-pressed`, which is what
	 * turns a button into a toggle for assistive technology. Leave it
	 * `undefined` for an ordinary command button.
	 */
	pressed?: boolean;
}

/**
 * The Windows 98 command button ("push button").
 *
 * Focus and pressed styling come from real `:focus` / `:active` state in the
 * stylesheet; the `active`/`focused` props only *simulate* those states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		variant = "normal",
		active = false,
		focused = false,
		pressed,
		className,
		type = "button",
		...rest
	},
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			aria-pressed={pressed}
			className={cx(
				variant === "default" && "default",
				variant === "toolbar" && "toolbar-button",
				(active || pressed === true) && "force-active",
				focused && "force-focused",
				className,
			)}
			{...rest}
		/>
	);
});
