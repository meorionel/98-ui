/**
 * Strings for the demo chrome: the sidebar, shared labels, and the App shell.
 *
 * Messages are plain strings. Inline markup is allowed:
 *   `code`     renders as <code>
 *   **strong** renders as <strong>
 *
 * NOTE: keys must stay in sync with `zh/core.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const common = {
	showCode: "Show code",
	language: "Language",
	// Language names stay in their own language, the usual convention.
	english: "English",
	chinese: "中文",
	ok: "OK",
	cancel: "Cancel",
	yes: "Yes",
	no: "No",
	firstPage: "First page",
	previousPage: "Previous page",
	nextPage: "Next page",
	lastPage: "Last page",
	pagination: "Pagination",
	pageStatus: "Page {page} of {count}",
	apply: "Apply",
	back: "Back",
	next: "Next",
	finish: "Finish",
	close: "Close",
	increase: "Increase",
	decrease: "Decrease",
	stepOf: "Step {step} of {count}",
	hue: "Hue",
};

export const nav = {
	intro: "Intro",
	install: "Install",
	components: "Components",
	notes: "Notes",
	portingNotes: "Porting notes",
	license: "License",

	// Component sections
	button: "Button",
	checkbox: "Checkbox",
	optionButton: "OptionButton",
	groupBox: "GroupBox",
	textBox: "TextBox",
	slider: "Slider",
	dropdown: "Dropdown",
	titleBar: "Title Bar",
	windowContents: "Window contents",
	interactiveWindow: "Interactive window",
	statusBar: "Status Bar",
	treeView: "TreeView",
	tabs: "Tabs",
	tableView: "TableView",
	progressIndicator: "Progress Indicator",
	fieldBorders: "Field borders",
	sunkenPanel: "SunkenPanel",
	misc: "Vertical bar, Link & CodeBlock",
	theming: "Theming",
	badgeAvatar: "Badge & Avatar",
	card: "Card",
	typography: "Typography",
	empty: "Empty",
	spinner: "Spinner & progress",
	separator: "Separator & Kbd",
	spinBox: "SpinBox",
	datePicker: "DatePicker & Calendar",
	splitPane: "SplitPane",
	balloonTip: "BalloonTip",
	propertySheet: "PropertySheet",
	wizard: "Wizard",
	comboBox: "ComboBox",
	toolbar: "Toolbar & ToggleGroup",
	formField: "Field",
	menus: "Menu bar & menus",
	contextMenu: "ContextMenu",
	dialog: "Dialog & MessageBox",
	tooltipPopover: "Tooltip & Popover",
};

export const app = {
	subtitle:
		"A pink & blue Windows 98 component library — **{count}** documented sections, every control from the original CSS ported to a typed component.",
	introHeading: "Intro",

	introA: "is a typed component port of ",
	introB: ", itself a pink and blue fork of ",
	introC: ". The stylesheet is unchanged; on top of it sits a typed component for every control, with the interactive behaviour the CSS-only version had to leave to the consumer.",

	installHeading: "Install",
	installImportHint: "Import the stylesheet once, anywhere in your app entry:",
	installThen: "Then use the components:",

	noteLabel: "Note",
	noteBody:
		"the upstream stylesheet is a global theme — it styles `body`, `button`, `input`, `table`, `pre`, `a` and the scrollbars page-wide. That is deliberate and matches the CSS-only library.",

	helloTitle: "Hello!",
	helloBody: "It is 1998 in here.",
	enablePinkMode: "Enable pink mode",

	componentsHeading: "Components",

	portingNotesHeading: "Porting notes",
	notesIntro: "What changed relative to the CSS-only library:",

	note1Title: "Class names are identical.",
	note1Body:
		"Every component emits the same hooks the stylesheet expects, so the two can be mixed in one page.",

	note2Title: "State moved into the component.",
	note2Body:
		"Tab selection, table row highlighting, menu focus and window controls are props and events instead of `document.querySelectorAll`.",

	note3Title: "Accessibility improved.",
	note3Body:
		'Tabs get roving tabindex and `aria-selected`, the menu bar supports arrow keys, progress bars get `role="progressbar"`, and every label is wired to the control it names.',

	note4Title: "Icons are inlined.",
	note4Body:
		"All 22 SVGs from `icon/` are converted to `data:` URIs at build time, so the stylesheet has no asset requests beyond the two web fonts.",

	note5Title: "CSS variables survive.",
	note5Body:
		"The upstream `dist` build pre-resolved every `var()` with postcss-css-variables; this port keeps them, which is what makes the theming example above possible.",

	note6Title: "Two extras were added:",
	note6Body:
		"the `active`/`focused` button props (the original docs referenced `.active` and `.focused` classes that were never defined) and a `:focus-visible` ring for radios and checkboxes.",

	notesTreeIntro: "The original library's tree, for reference:",
	treeItem1: "`98-pink.css/style.css` — the single source of truth for the theme",
	treeItem2: "`98-pink.css/icon/*.svg` — 22 glyphs, inlined by the generator",
	treeItem3: "the generator that runs the same postcss-inline-svg pipeline",

	licenseHeading: "License",
	licenseA: "MIT. Based on ",
	licenseB: " by Jordan Scales and the pink fork by ",
	licenseC: ".",

	themingP1:
		"Because the generated stylesheet keeps every upstream `var(--…)` token instead of pre-resolving them, the whole library can be rethemed from a single scope. The panel below overrides the tokens on a plain `<div>`:",
	themingWindowTitle: "Rethemed at runtime",
	themingWindowBody: "Same components, different tokens.",
	codeSamplesNote: "Code samples stay in English — they document the API, not the UI.",
};
