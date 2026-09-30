import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export type CardProps = HTMLAttributes<HTMLDivElement>;
export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
	/** Heading element to render. Defaults to `"h3"`. */
	as?: "h2" | "h3" | "h4";
}

/**
 * A framed container with a header, content and footer.
 *
 * ```tsx
 * <Card style={{ width: 260 }}>
 *   <CardHeader>
 *     <CardTitle>Modem</CardTitle>
 *     <CardDescription>Standard 56k modem</CardDescription>
 *   </CardHeader>
 *   <CardContent>Connected at 33.6 kbps.</CardContent>
 *   <CardFooter>
 *     <Button>Properties</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * It uses the same raised window frame as `Window`, so a card and a window sit
 * together comfortably — the difference is that a card carries no title bar and
 * is meant to be dropped into a page.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
	{ className, ...rest },
	ref,
) {
	return <div ref={ref} className={cx("card", className)} {...rest} />;
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
	{ className, ...rest },
	ref,
) {
	return <div ref={ref} className={cx("card-header", className)} {...rest} />;
});

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
	{ as: Component = "h3", className, ...rest },
	ref,
) {
	return <Component ref={ref} className={cx("card-title", className)} {...rest} />;
});

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
	function CardDescription({ className, ...rest }, ref) {
		return <p ref={ref} className={cx("card-description", className)} {...rest} />;
	},
);

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
	{ className, ...rest },
	ref,
) {
	return <div ref={ref} className={cx("card-content", className)} {...rest} />;
});

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
	{ className, children, ...rest },
	ref,
) {
	return (
		<div ref={ref} className={cx("card-footer", className)} {...rest}>
			{children}
		</div>
	);
});
