import { h, type VNodeChild } from "vue";

/**
 * Renders the inline markup that message strings are allowed to contain:
 *
 *   `code`          -> <code>
 *   **strong**      -> <strong>
 *   *emphasis*      -> <em>
 *   [text](url)     -> <a href="url">
 *
 * Keeping messages as plain strings means translators never touch templates, and
 * a sentence with a technical identifier in the middle stays one translatable
 * unit instead of being chopped into fragile fragments.
 *
 * `**strong**` is listed before `*emphasis*` so the double form wins.
 */
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;

export interface RenderInlineOptions {
	/** Hook for anchors, e.g. to add target/rel. Returns extra props. */
	linkProps?: (href: string) => Record<string, unknown>;
}

export function renderInline(text: string, options: RenderInlineOptions = {}): VNodeChild[] {
	const parts: VNodeChild[] = [];
	let cursor = 0;
	let match: RegExpExecArray | null;

	INLINE.lastIndex = 0;
	while ((match = INLINE.exec(text)) !== null) {
		if (match.index > cursor) parts.push(text.slice(cursor, match.index));

		if (match[1] !== undefined) {
			parts.push(h("strong", null, match[1]));
		} else if (match[2] !== undefined) {
			parts.push(h("code", null, match[2]));
		} else if (match[3] !== undefined) {
			parts.push(h("em", null, match[3]));
		} else {
			const href = match[5];
			parts.push(h("a", { href, ...options.linkProps?.(href) }, match[4]));
		}
		cursor = INLINE.lastIndex;
	}
	if (cursor < text.length) parts.push(text.slice(cursor));

	return parts;
}
