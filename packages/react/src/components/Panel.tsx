import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

interface PanelBaseProps extends HTMLAttributes<HTMLElement> {
	/** Which element to render. Defaults to `div`. */
	as?: ElementType;
	children?: ReactNode;
}

function createPanel(displayName: string, baseClass: string) {
	const Panel = forwardRef<HTMLElement, PanelBaseProps>(function Panel(
		{ as: Component = "div", className, ...rest },
		ref,
	) {
		return <Component ref={ref} className={cx(baseClass, className)} {...rest} />;
	});
	Panel.displayName = displayName;
	return Panel;
}

/**
 * The field border style: sunken outer + sunken inner, on the button-highlight
 * interior. Used by work areas and any control that needs the engraved inset.
 */
export const FieldBorder = createPanel("FieldBorder", "field-border");

/** The field border style with the read-only/disabled interior colour. */
export const FieldBorderDisabled = createPanel("FieldBorderDisabled", "field-border-disabled");

/** The lighter status field border style, for read-only dynamic content. */
export const StatusFieldBorder = createPanel("StatusFieldBorder", "status-field-border");

export interface SunkenPanelProps extends PanelBaseProps {}

/**
 * A scrolling recessed region with a 2px groove border — the container used for
 * table views and list views.
 */
export const SunkenPanel = createPanel("SunkenPanel", "sunken-panel");
