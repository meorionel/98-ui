import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

/* ----------------------------------------------------------------- heading */

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	/** `1`–`4`. Renders the matching `<h*>` element. Defaults to `2`. */
	level?: HeadingLevel;
}

/**
 * A heading at one of the four sizes the stylesheet knows about.
 *
 * ```tsx
 * <Heading level={1}>Control Panel</Heading>
 * <Heading level={3}>Display</Heading>
 * ```
 *
 * The upstream sheet sizes bare `h1`–`h4` for prose (5rem and down); these
 * classes override that with sizes that fit an 11px UI.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
	{ level = 2, className, ...rest },
	ref,
) {
	const Component = `h${level}` as "h1" | "h2" | "h3" | "h4";
	return (
		<Component ref={ref} className={cx("heading", `heading-${level}`, className)} {...rest} />
	);
});

/* -------------------------------------------------------------------- text */

export type TextVariant = "body" | "lead" | "muted" | "small";

export interface TextProps extends HTMLAttributes<HTMLElement> {
	/** Element to render. Defaults to `"p"`. */
	as?: ElementType;
	variant?: TextVariant;
	children?: ReactNode;
}

/**
 * Body copy in one of the four weights the library uses.
 *
 * ```tsx
 * <Text variant="lead">Setup has finished.</Text>
 * <Text variant="muted" as="span">C:\Windows</Text>
 * ```
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
	{ as: Component = "p", variant = "body", className, ...rest },
	ref,
) {
	return <Component ref={ref} className={cx("text", `text-${variant}`, className)} {...rest} />;
});

/* ------------------------------------------------------------------- prose */

export type ProseProps = HTMLAttributes<HTMLDivElement>;

/**
 * A block of rendered rich text — markdown output, a README, a help page.
 *
 * ```tsx
 * <Prose>
 *   <h2>Disk Defragmenter</h2>
 *   <p>Rearranges the files on your disk so programs start faster.</p>
 *   <ul><li>Close other programs first.</li></ul>
 * </Prose>
 * ```
 *
 * Everything inside is scoped: headings get UI-sized text, paragraphs get the
 * library's rhythm, and links, code, quotes, lists and tables pick up the theme
 * instead of the browser defaults.
 */
export const Prose = forwardRef<HTMLDivElement, ProseProps>(function Prose(
	{ className, ...rest },
	ref,
) {
	return <div ref={ref} className={cx("prose", className)} {...rest} />;
});
