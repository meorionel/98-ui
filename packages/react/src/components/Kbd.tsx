import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export type KbdProps = HTMLAttributes<HTMLElement>;

/**
 * A keycap, for documenting a shortcut next to the command it runs.
 *
 * ```tsx
 * <FieldRow>
 *   <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> saves the file.
 * </FieldRow>
 * ```
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ className, ...rest }, ref) {
	return <kbd ref={ref} className={cx("kbd", className)} {...rest} />;
});
