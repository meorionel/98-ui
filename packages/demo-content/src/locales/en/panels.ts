/**
 * Panels / borders section.
 *
 * Pattern used by every section file:
 *  - prose lives in this dictionary and is rendered with <T k="…" /> (which
 *    understands `code`, **strong**, *em* and [links](url));
 *  - plain labels and headings use t("…") directly;
 *  - `Example` code samples stay in English on purpose — they document the API.
 */

export const panels = {
	fieldBorders: {
		quote: "Text boxes, check boxes, drop-down list boxes, spin boxes and list boxes use the *field border style*. Status fields use the *status field border style*, which uses only the sunken outer basic border style.",
		quoteSource: "— Microsoft Windows User Experience p. 421, p. 422",
		p1: "These borders are useful outside form controls too — for work areas and dynamic content. The three helpers only define the border and background, so add your own padding.",
		workArea: "Work area",
		disabledWorkArea: "Disabled work area",
		dynamicContent: "Dynamic content",
	},

	sunkenPanel: {
		p1: "`SunkenPanel` is the scrolling recessed container from the table view: a 2px groove border with `overflow: auto`.",
		sample: "The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.",
	},

	misc: {
		p1: "The remaining odds and ends: the toolbar `VerticalBar` separator, the styled `Link`, and `CodeBlock` for preformatted text.",
		toolbarItem: "Toolbar item",
		anotherItem: "Another item",
		links: "Read the [original project](https://github.com/jdan/98.css), or the pink fork on [GitHub](https://github.com/meorionel/98-pink.css).",
	},
};
