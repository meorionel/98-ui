import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface VerticalBarProps extends HTMLAttributes<HTMLDivElement> {
	/** Bar height in pixels. Defaults to the stylesheet's 20px. */
	height?: number | string;
}

/**
 * The little 4px raised divider used between toolbar/title-bar command groups.
 */
export const VerticalBar = forwardRef<HTMLDivElement, VerticalBarProps>(function VerticalBar(
	{ height, className, style, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			className={cx("vertical-bar", className)}
			style={{ height, ...style }}
			{...rest}
		/>
	);
});

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * An anchor using the Windows 98 link blue with the dotted focus ring.
 * (`a` is styled globally by the stylesheet; this component just adds typing
 * and an optional `external` convenience.)
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{ className, ...rest },
	ref,
) {
	return <a ref={ref} className={cx(className)} {...rest} />;
});

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
	/** Code content. Rendered inside a `<code>` element. */
	children?: ReactNode;
	/** Skip the inner `<code>` wrapper and render children straight into `<pre>`. */
	raw?: boolean;
}

/**
 * A sunken `<pre>` block for code, using the field border from the stylesheet.
 */
export const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(function CodeBlock(
	{ raw = false, className, children, ...rest },
	ref,
) {
	return (
		<pre ref={ref} className={cx(className)} {...rest}>
			{raw ? children : <code>{children}</code>}
		</pre>
	);
});
