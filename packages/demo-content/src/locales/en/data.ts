/**
 * Data display section: TreeView, Tabs, TableView and ProgressIndicator.
 *
 * Same pattern as the other section dictionaries:
 *  - prose lives here and is rendered with <T k="…" />, which understands
 *    `code`, **strong**, *em* and [links](url);
 *  - plain labels, captions and short fragments use t("…") directly;
 *  - `Example` code samples stay in English on purpose — they document the API,
 *    so only the *rendered* children of <Example> are translated.
 */

export const data = {
	treeView: {
		quote: "A *tree view control* is a special list box control that displays a set of objects as an indented outline based on their logical hierarchical relationship.",
		quoteSource: "— Microsoft Windows User Experience p. 178",
		weCanPut: "We can put",
		whatever: "✨ Whatever ✨",
		weWantInHere: "We want in here",
		branchNote:
			"`TreeViewBranch` wraps a nested list in a native `<details>`, which is what the `+`/`-` markers come from. Expansion can be controlled with `open`/`onOpenChange`.",
		tableOfContents: "Table of Contents",
		whatIsWebDevelopment: "What is web development?",
		css: "CSS",
		selectors: "Selectors",
		specificity: "Specificity",
		properties: "Properties",
		javascript: "JavaScript",
		html: "HTML",
		specialThanks: "Special Thanks",
		avoidAtAllCosts: "Avoid at all costs",
		unless: "Unless",
		avoid: "Avoid",
		at: "At",
		all: "All",
		cost: "Cost",
		linkNote: "`TreeViewLink` renders a focusable anchor row:",
	},

	tabs: {
		quote: "A *tab control* is analogous to a divider in a file cabinet or notebook. You can use this control to define multiple logical pages or sections of information within the same window.",
		quoteSource: "— Microsoft Windows User Experience p. 193",
		p2: 'The original docs note that tabs "should be managed by adding custom javascript code". Here that bookkeeping lives in `Tabs`, including `aria-selected`, panel visibility and ← / → keyboard navigation.',
		windowTitle: "Control Panel",
		desktop: "Desktop",
		myComputer: "My computer",
		controlPanel: "Control panel",
		devicesManager: "Devices manager",
		desktopSettings: "Desktop settings",
		controlledIntro: "Controlled tabs, plus `multirows` to stretch the labels evenly:",
		multirowTitle: "Multirow tabs",
		settingsLabel: "Settings",
		selected: "Selected: {value}",
	},

	tableView: {
		p1: "`TableView` renders the `sunken-panel` wrapper, a sticky header and the interactive row highlighting that the original docs implemented with a manual `querySelectorAll` script.",
		columnName: "Name",
		columnVersion: "Version",
		columnCompany: "Company",
		selected: "Selected: {value}",
		p3: "Add `sortable` for clickable headers — the arrow follows `aria-sort`, so the picture and the screen-reader state cannot drift apart — and `pageSize` to slice the rows and put a pager underneath. Sorting reads `sortValue` when a column's key is not what should be ordered, for example a byte count behind a formatted size.",
		p2: "The lower-level `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` primitives are exported for hand-rolled markup, and `TableRow` accepts `highlighted` directly:",
	},

	progress: {
		quote: "You can use a *progress indicator*, also known as a progress bar control, to show the percentage of completion of a lengthy operation.",
		quoteSource: "— Microsoft Windows User Experience p. 189",
		p1: '`value` is a percentage by default and is clamped to `max`; `segmented` switches to the 16px block style. Both get a `role="progressbar"` and the matching ARIA value attributes.',
		liveIntro: "A live one, driven by timer state:",
		sliderLabel: "Progress",
	},
};
