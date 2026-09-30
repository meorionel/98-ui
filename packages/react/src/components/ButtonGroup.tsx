import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
	/** Stack the buttons vertically. */
	vertical?: boolean;
}

/**
 * Lays a row of buttons out with the 4px "grouped button" rhythm the stylesheet
 * uses for dialog command rows.
 *
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="default">OK</Button>
 *   <Button>Cancel</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
	{ vertical = false, className, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			role="group"
			className={cx("button-group", vertical && "button-group-vertical", className)}
			{...rest}
		/>
	);
});
