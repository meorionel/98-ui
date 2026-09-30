import { forwardRef, type FieldsetHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface GroupBoxProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
	/** Text rendered in the `<legend>` engraved into the frame. */
	legend?: ReactNode;
}

/**
 * A group box — the engraved frame Windows 98 uses to organise related
 * controls. Renders a native `<fieldset>`/`<legend>` pair so it stays
 * accessible; the border comes from an inlined SVG `border-image`.
 */
export const GroupBox = forwardRef<HTMLFieldSetElement, GroupBoxProps>(function GroupBox(
	{ legend, className, children, ...rest },
	ref,
) {
	return (
		<fieldset ref={ref} className={cx(className)} {...rest}>
			{legend !== undefined && <legend>{legend}</legend>}
			{children}
		</fieldset>
	);
});
