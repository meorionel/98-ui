import type { MessageKey } from "../i18n";

/**
 * One documentation section: an anchor id, a heading key and its level.
 *
 * The body of every section is written directly in its `sections/*.vue` file —
 * the metadata here is what the sidebar and the table of contents iterate over,
 * and `scripts/ssr-check.mjs` asserts every one of these ids is present in the
 * rendered page.
 */
export interface SectionMeta {
	id: string;
	/** Dotted message key for the heading, resolved with `t()` when rendered. */
	titleKey: MessageKey;
	/** Heading level. Window sub-sections use `4`. */
	level: 3 | 4;
}
