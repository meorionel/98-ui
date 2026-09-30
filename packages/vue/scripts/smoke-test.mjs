#!/usr/bin/env node
/**
 * Renders every exported component to static markup and asserts the class names
 * and structure the stylesheet depends on. This is the guard-rail for the Vue
 * port: if a refactor drops a `.field-row`, reorders `input + label`, or forgets
 * to hide an inactive tab panel, this test fails.
 *
 * Run with `npm test` (after `npm run build`).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import * as Lib from "../dist/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const postcss = require("postcss");

let passed = 0;
const failures = [];

async function check(name, fn) {
	try {
		await fn();
		passed += 1;
		console.log(`  ✓ ${name}`);
	} catch (error) {
		failures.push({ name, error });
		console.log(`  ✗ ${name}`);
		console.log(`      ${error.message.split("\n")[0]}`);
	}
}

/**
 * Vue's SSR wraps slot content in `<!--[-->` … `<!--]-->` markers and escapes
 * an apostrophe as `&#39;` where React used `&#x27;`. Both are stripped here so
 * an assertion can be written the way the markup actually reads.
 */
const normalize = (html) =>
	html.replace(/<!--\[-->|<!--\]-->|<!---->/g, "").replace(/&#39;/g, "&#x27;");

/**
 * `children` may be a string, a vnode, a vnode array, or a slot object.
 * Everything except a real slot object becomes a function slot — Vue warns
 * about a non-function default slot, and a raw vnode would be mistaken for one.
 */
const toSlots = (children) => {
	if (children === undefined) return undefined;
	if (typeof children === "function") return { default: children };
	const isSlotObject =
		typeof children === "object" &&
		children !== null &&
		!Array.isArray(children) &&
		!children.__v_isVNode;
	if (isSlotObject) return children;
	return { default: () => children };
};

/** Renders one component (or vnode) to static markup. */
const render = async (component, props = {}, children = undefined) =>
	normalize(
		await renderToString(createSSRApp({ render: () => h(component, props, toSlots(children)) })),
	);

const has = (html, needle, label) =>
	assert.ok(html.includes(needle), `${label ?? needle} missing from output:\n${html}`);
const lacks = (html, needle, label) =>
	assert.ok(!html.includes(needle), `${label ?? needle} unexpectedly present:\n${html}`);

/** A slot object, for components that take named slots. */
const slots = (entries) => entries;

console.log("\n98-pink-vue smoke test\n");

// ---------------------------------------------------------------- exports
await check("every public component is exported", async () => {
	const expected = [
		"Button",
		"Checkbox",
		"Radio",
		"RadioGroup",
		"GroupBox",
		"TextBox",
		"TextArea",
		"FieldLabel",
		"Select",
		"Slider",
		"ComboBox",
		"comboBoxOptionText",
		"Field",
		"FIELD_CONTEXT",
		"useField",
		"ButtonGroup",
		"ToggleButton",
		"ToggleGroup",
		"ToggleGroupItem",
		"Toolbar",
		"ToolbarButton",
		"ToolbarSeparator",
		"ToolbarSpacer",
		"Separator",
		"Kbd",
		"SpinBox",
		"SPIN_BOX_LABELS",
		"SplitPane",
		"Calendar",
		"CALENDAR_MONTHS",
		"CALENDAR_WEEKDAYS",
		"toIsoDate",
		"parseIsoDate",
		"DatePicker",
		"BalloonTip",
		"PropertySheet",
		"Wizard",
		"WIZARD_LABELS",
		"FieldRow",
		"FieldRowStacked",
		"Window",
		"WindowBody",
		"TitleBar",
		"TitleBarButton",
		"MenuBar",
		"MenuPopup",
		"DropdownMenu",
		"ContextMenu",
		"Dialog",
		"MessageBox",
		"MESSAGE_BOX_BUTTON_LABELS",
		"Tooltip",
		"Popover",
		"Portal",
		"computeFloatingPosition",
		"StatusBar",
		"StatusBarField",
		"TreeView",
		"TreeViewItem",
		"TreeViewBranch",
		"TreeViewLink",
		"Tabs",
		"TabList",
		"Tab",
		"TabPanel",
		"Table",
		"TableHead",
		"TableBody",
		"TableRow",
		"TableHeaderCell",
		"TableCell",
		"TableView",
		"ProgressIndicator",
		"Pagination",
		"PAGINATION_LABELS",
		"Badge",
		"Avatar",
		"Card",
		"CardHeader",
		"CardTitle",
		"CardDescription",
		"CardContent",
		"CardFooter",
		"Heading",
		"Text",
		"Prose",
		"Empty",
		"Spinner",
		"FieldBorder",
		"FieldBorderDisabled",
		"StatusFieldBorder",
		"SunkenPanel",
		"VerticalBar",
		"Link",
		"CodeBlock",
		"cx",
		"useControllableState",
	];
	for (const name of expected) {
		assert.equal(typeof Lib[name] !== "undefined", true, `${name} is not exported`);
	}
});

// ---------------------------------------------------------------- button
await check("Button applies the default and forced-state classes", async () => {
	const plain = await render(Lib.Button, {}, "Click me");
	has(plain, "<button", "button element");
	has(plain, 'type="button"', "implicit type=button");

	const dflt = await render(Lib.Button, { variant: "default" }, "OK");
	has(dflt, 'class="default"', "default variant class");

	const forced = await render(Lib.Button, { active: true, focused: true }, "Forced");
	has(forced, "force-active", "force-active class");
	has(forced, "force-focused", "force-focused class");

	const disabled = await render(Lib.Button, { disabled: true }, "No");
	has(disabled, "disabled", "disabled attribute");
});

// ---------------------------------------------------------------- checkbox
await check("Checkbox renders input immediately before its label", async () => {
	const html = await render(Lib.Checkbox, { label: "This is a checkbox" });
	const row = html.indexOf('class="field-row"');
	const input = html.indexOf("<input");
	const label = html.indexOf("<label");
	assert.ok(row > -1, "wrapped in .field-row");
	assert.ok(input > -1 && label > input, "input must precede its label");

	const id = /id="([^"]+)"/.exec(html)?.[1];
	const htmlFor = /for="([^"]+)"/.exec(html)?.[1];
	assert.equal(id, htmlFor, "label for= must match the input id");
	has(html, 'type="checkbox"', "checkbox type");
});

await check("Checkbox with checked but no change listener stays quiet (readonly)", async () => {
	const live = await render(Lib.Checkbox, { label: "Checked", checked: true, onChange: () => {} });
	has(live, "checked", "checked attribute");
	lacks(live, "readonly", "a live checkbox is not read-only");

	const staticHtml = await render(Lib.Checkbox, { label: "Static", checked: true });
	has(staticHtml, "readonly", "readOnly guard for static previews");
});

// ---------------------------------------------------------------- radio
await check("RadioGroup shares one name and checks the right option", async () => {
	const html = await render(Lib.RadioGroup, {
		defaultValue: "b",
		options: [
			{ label: "A", value: "a" },
			{ label: "B", value: "b" },
		],
	});
	const names = [...html.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
	assert.equal(names.length, 2, "both radios rendered");
	assert.equal(new Set(names).size, 1, "all radios share one name");
	assert.equal((html.match(/checked/g) || []).length, 1, "exactly one radio is checked");
});

// ---------------------------------------------------------------- groupbox
await check("GroupBox renders fieldset + legend", async () => {
	const html = await render(Lib.GroupBox, { legend: "Today's mood" }, "content");
	has(html, "<fieldset", "fieldset");
	has(html, "<legend>Today&#x27;s mood</legend>", "legend text");
});

// ---------------------------------------------------------------- text
await check("TextBox pairs its label and input", async () => {
	const row = await render(Lib.TextBox, { label: "Occupation" });
	has(row, 'class="field-row"', "field-row layout");
	const stacked = await render(Lib.TextBox, { label: "Address", layout: "stacked", width: 200 });
	has(stacked, "field-row-stacked", "stacked layout");
	has(stacked, "width:200px", "explicit width");

	const area = await render(Lib.TextArea, { label: "Notes", rows: 8 });
	has(area, "<textarea", "textarea element");
	has(area, "field-row-stacked", "TextArea defaults to stacked");
});

// ---------------------------------------------------------------- select
await check("Select supports both options and children", async () => {
	const fromOptions = await render(Lib.Select, {
		options: [
			{ label: "5 - Incredible!", value: "5" },
			{ label: "4 - Great!", value: "4" },
		],
	});
	has(fromOptions, "<select", "select element");
	assert.equal((fromOptions.match(/<option/g) || []).length, 2, "two options");

	const fromChildren = await render(Lib.Select, {}, h("option", null, "One"));
	has(fromChildren, "<option", "child option");
});

// ---------------------------------------------------------------- slider
await check("Slider renders horizontal, box and vertical variants", async () => {
	const plain = await render(Lib.Slider, { min: 1, max: 11, defaultValue: 5 });
	has(plain, 'type="range"', "range input");

	const boxed = await render(Lib.Slider, { boxIndicator: true, defaultValue: 2 });
	has(boxed, "has-box-indicator", "box indicator class");

	const vertical = await render(Lib.Slider, { vertical: true, length: 150, defaultValue: 2 });
	has(vertical, 'class="is-vertical"', "is-vertical wrapper");
	has(vertical, "height:150px", "vertical length");

	const labelled = await render(Lib.Slider, {
		label: "Volume:",
		lowLabel: "Low",
		highLabel: "High",
		defaultValue: 5,
	});
	has(labelled, "Low", "low caption");
	has(labelled, "High", "high caption");
});

// ---------------------------------------------------------------- window
await check("Window composes title bar, body, menu bar and status bar", async () => {
	const html = await render(
		Lib.Window,
		{
			title: "A Window With Stuff In It",
			controls: ["minimize", "maximize", "close"],
			width: 320,
		},
		slots({
			default: () => h("p", null, "There's so much room for activities!"),
			menuBar: () =>
				h(Lib.MenuBar, {
					items: [
						{ label: "File", accessKey: "F" },
						{ label: "Edit", accessKey: "E" },
					],
				}),
			statusBar: () =>
				h(Lib.StatusBar, null, {
					default: () => h(Lib.StatusBarField, null, { default: () => "Press F1 for help" }),
				}),
		}),
	);

	has(html, 'class="window"', "window class");
	has(html, "width:320px", "explicit width");
	has(html, 'class="title-bar"', "title bar");
	has(html, "title-bar-text", "title bar text");
	has(html, "title-bar-controls", "title bar controls");
	has(html, "window-body", "window body");
	has(html, "menu-bar", "menu bar inside the body");
	has(html, "status-bar", "status bar");

	// The minimised/maximised/close glyphs come from these classes.
	has(html, 'class="minimize"', "minimize button class");
	has(html, 'class="maximize"', "maximize button class");
	has(html, 'class="close"', "close button class");
	has(html, 'aria-label="Minimize"', "minimize aria-label");
	has(html, 'aria-label="Close"', "close aria-label");

	// menu bar sits inside .window-body, as the negative margins expect
	const bodyIndex = html.indexOf("window-body");
	const menuIndex = html.indexOf("menu-bar");
	assert.ok(menuIndex > bodyIndex, "menu bar must be inside the window body");
});

await check("Window supports an inactive title bar and localised labels", async () => {
	const html = await render(Lib.Window, {
		title: "An inactive title bar",
		controls: ["close"],
		inactive: true,
		labels: { close: "关闭" },
	});
	has(html, "title-bar inactive", "inactive class");
	has(html, 'aria-label="关闭"', "localised aria-label");
});

await check("TitleBar control buttons carry both class and aria-label hooks", async () => {
	const html = await render(Lib.TitleBar, {
		text: "A Title Bar",
		controls: ["minimize", "restore", "help", "close"],
	});
	for (const action of ["minimize", "restore", "help", "close"]) {
		has(html, `class="${action}"`, `${action} class`);
	}
	has(html, 'aria-label="Restore"', "restore aria-label");
});

// ---------------------------------------------------------------- menubar
await check("MenuBar renders an accessible menubar with underlined accelerators", async () => {
	const html = await render(Lib.MenuBar, {
		label: "Window menu",
		items: [
			{ label: "File", accessKey: "F" },
			{ label: "Favorites", accessKey: "a" },
		],
	});
	has(html, 'role="menubar"', "menubar role");
	has(html, 'aria-label="Window menu"', "menubar label");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two menu items");
	has(html, "<u>F</u>ile", "leading accelerator");
	has(html, "F<u>a</u>vorites", "inner accelerator");
	has(html, 'tabindex="0"', "focusable menu items");
});

await check("MenuBar localises accelerators that are absent from the label", async () => {
	const html = await render(Lib.MenuBar, { items: [{ label: "文件", accessKey: "F" }] });
	has(html, "文件(<u>F</u>)", "appended accelerator for a non-Latin label");

	assert.equal(
		await render(h("span", null, Lib.renderAccessKey("NoMatch", "Z"))),
		"<span>NoMatch(<u>Z</u>)</span>",
		"accelerator appended when the character is missing",
	);
	assert.equal(
		await render(h("span", null, Lib.renderAccessKey("View", "V"))),
		"<span><u>V</u>iew</span>",
		"accelerator underlined when the character is present",
	);
});

// ---------------------------------------------------------------- tree
await check("TreeView nests branches as details/summary", async () => {
	const html = await render(
		Lib.TreeView,
		{},
		slots({
			default: () => [
				h(Lib.TreeViewItem, null, { default: () => "Table of Contents" }),
				h(
					Lib.TreeViewBranch,
					{ label: "CSS", defaultOpen: true },
					{
						default: () => [
							h(Lib.TreeViewItem, null, { default: () => "Selectors" }),
							h(Lib.TreeViewItem, null, { default: () => "Specificity" }),
						],
					},
				),
			],
		}),
	);
	has(html, 'class="tree-view"', "tree-view class");
	has(html, "<details", "details element");
	has(html, "open", "defaultOpen forwarded");
	has(html, "<summary>CSS</summary>", "branch summary");
	has(html, "<ul><li>Selectors</li>", "nested list");
});

// ---------------------------------------------------------------- tabs
await check("Tabs shows only the selected panel and wires ARIA", async () => {
	const html = await render(
		Lib.Tabs,
		{ defaultValue: "desktop" },
		slots({
			default: () => [
				h(
					Lib.TabList,
					{ label: "Control panel" },
					{
						default: () => [
							h(Lib.Tab, { value: "desktop" }, { default: () => "Desktop" }),
							h(Lib.Tab, { value: "computer" }, { default: () => "My computer" }),
						],
					},
				),
				h(Lib.TabPanel, { value: "desktop" }, { default: () => h("p", null, "the tab content") }),
				h(Lib.TabPanel, { value: "computer" }, { default: () => h("p", null, "other content") }),
			],
		}),
	);

	has(html, 'role="tablist"', "tablist role");
	assert.equal((html.match(/role="tab"/g) || []).length, 2, "two tabs");
	has(html, 'aria-selected="true"', "selected tab");
	has(html, 'aria-selected="false"', "unselected tab");
	has(html, "the tab content", "active panel content");
	lacks(html, "other content", "inactive panel is unmounted");
	has(html, 'role="tabpanel"', "tabpanel role");
	has(html, 'class="window"', "panel uses the window chrome");
	has(html, 'tabindex="-1"', "roving tabindex on the inactive tab");
});

await check("Tabs keepMounted keeps inactive panels hidden, not unmounted", async () => {
	const html = await render(
		Lib.Tabs,
		{ defaultValue: "a", keepMounted: true },
		slots({
			default: () => [
				h(Lib.TabList, null, {
					default: () => [
						h(Lib.Tab, { value: "a" }, { default: () => "A" }),
						h(Lib.Tab, { value: "b" }, { default: () => "B" }),
					],
				}),
				h(Lib.TabPanel, { value: "a" }, { default: () => "content a" }),
				h(Lib.TabPanel, { value: "b" }, { default: () => "content b" }),
			],
		}),
	);
	has(html, "content a", "active content");
	has(html, "content b", "inactive content still mounted");
	has(html, "hidden", "inactive panel hidden");
});

await check("TabList multirows adds the stretching class", async () => {
	const html = await render(
		Lib.Tabs,
		null,
		slots({
			default: () => [
				h(Lib.TabList, { multirows: true }, { default: () => h(Lib.Tab, { value: "a" }, { default: () => "A" }) }),
				h(Lib.TabPanel, { value: "a" }, { default: () => "content a" }),
			],
		}),
	);
	has(html, "multirows", "multirows class");
});

// ---------------------------------------------------------------- table
await check("TableView builds a sunken panel, sticky header and selectable rows", async () => {
	const html = await render(Lib.TableView, {
		interactive: true,
		selectable: true,
		defaultSelectedKey: "sql",
		height: 120,
		width: 240,
		columns: [
			{ key: "name", header: "Name" },
			{ key: "version", header: "Version" },
		],
		data: [
			{ id: "mysql", name: "MySQL ODBC 3.51 Driver", version: "3.51.11.00" },
			{ id: "sql", name: "SQL Server", version: "3.70.06.23" },
		],
		getRowKey: (row) => row.id,
	});

	has(html, 'class="sunken-panel"', "sunken panel wrapper");
	has(html, "height:120px", "explicit height");
	has(html, "width:240px", "explicit width");
	has(html, 'class="interactive"', "interactive table");
	has(html, "<thead>", "sticky header");
	has(html, "<th>Name</th>", "header cell");
	assert.equal((html.match(/highlighted/g) || []).length, 1, "exactly one highlighted row");
	has(html, "MySQL ODBC 3.51 Driver", "cell value from row[key]");
});

await check("TableRow highlighted can be driven manually", async () => {
	const html = await render(
		Lib.Table,
		null,
		slots({
			default: () =>
				h(Lib.TableBody, null, {
					default: () =>
						h(Lib.TableRow, { highlighted: true }, {
							default: () => h(Lib.TableCell, null, { default: () => "x" }),
						}),
				}),
		}),
	);
	has(html, 'class="highlighted"', "highlighted class");
});

// ---------------------------------------------------------------- progress
await check("ProgressIndicator renders solid and segmented bars", async () => {
	const solid = await render(Lib.ProgressIndicator, { value: 40 });
	has(solid, 'class="progress-indicator"', "solid variant");
	has(solid, 'class="progress-indicator-bar"', "bar element");
	has(solid, "width:40%", "40% width");
	has(solid, 'role="progressbar"', "progressbar role");
	has(solid, 'aria-valuenow="40"', "aria-valuenow");

	const segmented = await render(Lib.ProgressIndicator, { value: 40, segmented: true });
	has(segmented, "progress-indicator segmented", "segmented class");

	const clamped = await render(Lib.ProgressIndicator, { value: 250 });
	has(clamped, "width:100%", "value is clamped to max");
});

// ---------------------------------------------------------------- panels
await check("Field border and panel helpers render their classes", async () => {
	has(await render(Lib.FieldBorder, null, "Work area"), 'class="field-border"', "field-border");
	has(
		await render(Lib.FieldBorderDisabled, null, "Disabled"),
		'class="field-border-disabled"',
		"field-border-disabled",
	);
	has(
		await render(Lib.StatusFieldBorder, null, "Dynamic"),
		'class="status-field-border"',
		"status-field-border",
	);
	has(await render(Lib.SunkenPanel, null, "x"), 'class="sunken-panel"', "sunken-panel");
	has(await render(Lib.VerticalBar), 'class="vertical-bar"', "vertical-bar");
	has(await render(Lib.Link, { href: "#x" }, "link"), "<a", "anchor element");
	has(await render(Lib.CodeBlock, null, "const a = 1;"), "<pre><code>", "pre + code");
});

await check("FieldRow spacing hooks are emitted", async () => {
	has(await render(Lib.FieldRow, null, "x"), 'class="field-row"', "field-row");
	has(await render(Lib.FieldRowStacked, null, "x"), 'class="field-row-stacked"', "field-row-stacked");
	has(await render(Lib.FieldLabel, null, "Select one:"), 'class="field-row"', "field label row");
	has(await render(Lib.FieldRow, { stacked: true }, "x"), "field-row-stacked", "stacked shorthand");
});

// ---------------------------------------------------------------- overlays
await check("DropdownMenu keeps its trigger and reflects the open state", async () => {
	const closed = await render(
		Lib.DropdownMenu,
		{ items: [{ label: "New" }] },
		slots({ trigger: () => h(Lib.Button, null, { default: () => "File" }) }),
	);
	has(closed, 'aria-haspopup="menu"', "trigger advertises a menu");
	has(closed, 'aria-expanded="false"', "collapsed state");
	lacks(closed, 'role="menu"', "no menu while closed");

	const open = await render(
		Lib.DropdownMenu,
		{
			label: "File",
			defaultOpen: true,
			inline: true,
			items: [
				{ label: "New", shortcut: "Ctrl+N", accessKey: "N" },
				{ label: "Open", disabled: true },
				{ type: "separator" },
				{ type: "label", label: "Recent" },
				{ type: "checkbox", label: "Word wrap", checked: true },
				{ type: "radio", label: "Left", value: "left", checked: true },
				{ type: "submenu", label: "Send to", items: [{ label: "Desktop" }] },
			],
		},
		slots({ trigger: () => h(Lib.Button, null, { default: () => "File" }) }),
	);
	has(open, 'role="menu"', "menu role");
	has(open, 'aria-label="File"', "menu label");
	has(open, 'aria-expanded="true"', "expanded state");
	has(open, 'class="menu-popup"', "popup surface");
	// New, Open and Send to are plain items; the checkbox and radio carry their
	// own `menuitemcheckbox` / `menuitemradio` roles.
	assert.equal((open.match(/role="menuitem"/g) || []).length, 3, "three plain menu items");
	has(open, "menu-popup-separator", "separator");
	has(open, "menu-popup-label", "group label");
	has(open, "menu-popup-shortcut", "accelerator hint");
	has(open, "<u>N</u>ew", "underlined access key");
	has(open, "menu-popup-item-disabled", "disabled item class");
	has(open, 'aria-disabled="true"', "disabled item state");
	has(open, 'role="menuitemcheckbox" aria-checked="true"', "checked checkbox item");
	has(open, 'role="menuitemradio" aria-checked="true"', "checked radio item");
	has(open, 'aria-haspopup="menu"', "submenu parent");
	has(open, "menu-popup-arrow", "submenu arrow");
	// A submenu is only mounted once it is opened.
	lacks(open, "Desktop", "submenu stays collapsed");
});

await check("MenuPopup renders a menu surface on its own", async () => {
	const html = await render(Lib.MenuPopup, {
		items: [{ label: "One" }, { label: "Two" }],
		label: "Standalone",
		inline: true,
		open: true,
	});
	has(html, 'role="menu"', "menu role");
	has(html, 'aria-label="Standalone"', "menu label");
	has(html, 'role="none" class="menu-popup-list"', "list is presentational");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two items");
});

await check("MenuBar opens drop-downs for entries that declare items", async () => {
	const html = await render(Lib.MenuBar, {
		items: [
			{ label: "File", accessKey: "F", items: [{ label: "New", onSelect: () => {} }] },
			{ label: "Edit", accessKey: "E" },
		],
	});
	has(html, 'role="menubar"', "menubar role");
	has(html, "<u>F</u>ile", "accelerator still underlined");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two captions");
	has(html, 'aria-haspopup="menu"', "caption advertises a menu");
	has(html, 'aria-expanded="false"', "caption reports the closed state");
	lacks(html, "menu-popup", "no popup until the caption is opened");
});

// ---------------------------------------------------------------- dialog
await check("Dialog renders a modal window with a title bar and footer", async () => {
	lacks(await render(Lib.Dialog, { title: "Hidden" }, "gone"), "gone", "a closed dialog renders nothing");

	const html = await render(
		Lib.Dialog,
		{
			defaultOpen: true,
			inline: true,
			title: "Delete file",
		},
		slots({
			default: () => h("p", null, "Are you sure?"),
			footer: () => h(Lib.Button, { variant: "default" }, { default: () => "OK" }),
		}),
	);
	has(html, 'role="dialog"', "dialog role");
	has(html, 'aria-modal="true"', "modal");
	has(html, "aria-labelledby", "labelled by its caption");
	has(html, 'class="dialog-overlay"', "backdrop");
	has(html, 'class="window dialog"', "window chrome");
	has(html, "window-body", "window body");
	has(html, 'class="close"', "title bar close button");
	has(html, 'class="dialog-buttons"', "footer row");
	has(html, 'class="default"', "default button");
});

await check("Dialog supports a modeless, caption-less variant", async () => {
	const html = await render(Lib.Dialog, {
		defaultOpen: true,
		inline: true,
		modal: false,
		overlay: false,
		label: "Floating palette",
	});
	lacks(html, "dialog-overlay", "no backdrop when overlay is false");
	lacks(html, "aria-modal", "no aria-modal when modal is false");
	has(html, 'aria-label="Floating palette"', "accessible name fallback");
	has(html, 'class="window dialog"', "still window chrome");
});

await check("MessageBox draws its icon, message and button set", async () => {
	for (const icon of ["info", "warning", "error", "question"]) {
		has(
			await render(Lib.MessageBox, { defaultOpen: true, inline: true, icon }, "Message"),
			`message-box-icon-${icon}`,
			`${icon} icon`,
		);
	}

	const html = await render(
		Lib.MessageBox,
		{
			defaultOpen: true,
			inline: true,
			title: "Format complete",
			icon: "info",
			buttons: ["yes", "no", "cancel"],
			defaultButton: "no",
			onResult: () => {},
		},
		"Setup has finished.",
	);
	has(html, "message-box-text", "message text");
	has(html, "Setup has finished.", "message body");
	assert.equal(
		(html.match(/<button/g) || []).length,
		4,
		"three buttons plus the title bar close box",
	);
	has(html, 'class="default">No<', "defaultButton is the default command");
	assert.equal(Lib.MESSAGE_BOX_BUTTON_LABELS.retry, "Retry", "label table is exported");
});

// ---------------------------------------------------------------- tooltip
await check("Tooltip describes its anchor and renders role=tooltip when open", async () => {
	lacks(
		await render(Lib.Tooltip, { content: "Tip" }, slots({ default: () => h(Lib.Button, null, { default: () => "Hover" }) })),
		"tooltip",
		"no tooltip while closed",
	);

	const html = await render(
		Lib.Tooltip,
		{ open: true, inline: true, content: "Sends the file away" },
		slots({ default: () => h(Lib.Button, null, { default: () => "Delete" }) }),
	);
	has(html, 'role="tooltip"', "tooltip role");
	has(html, "Sends the file away", "tooltip content");
	const id = /aria-describedby="([^"]+)"/.exec(html)?.[1];
	assert.ok(id !== undefined, "the anchor is described by the tooltip");
	has(html, `id="${id}"`, "aria-describedby points at the tooltip element");
});

// ---------------------------------------------------------------- popover
await check("Popover renders an anchored modeless surface", async () => {
	const html = await render(
		Lib.Popover,
		{ defaultOpen: true, inline: true, label: "Details" },
		slots({
			trigger: () => h(Lib.Button, null, { default: () => "Details" }),
			default: () => h("p", null, "Popover body"),
		}),
	);
	has(html, 'role="dialog"', "popover role");
	has(html, "popover", "popover surface class");
	has(html, "Popover body", "content");
});

// ---------------------------------------------------------------- field
await check("Field owns the label, hint and error of its control", async () => {
	const html = await render(
		Lib.Field,
		{ label: "Name", description: "Your full name", error: "Required", required: true },
		slots({ default: () => h(Lib.TextBox, null) }),
	);
	has(html, "field-label", "label");
	has(html, "field-required", "required marker");
	has(html, 'class="field-description"', "description");
	has(html, 'class="field-error"', "error");
	has(html, 'aria-invalid="true"', "control marked invalid");

	const clean = await render(
		Lib.Field,
		{ label: "Port" },
		slots({ default: () => h(Lib.Select, { options: [{ label: "COM1", value: "1" }] }) }),
	);
	lacks(clean, "aria-invalid", "no error, no invalid state");
	lacks(clean, "field-row", "no nested label row");
});

// -------------------------------------------------------------- pagination
await check("Pagination renders four buttons and a status readout", async () => {
	const html = await render(Lib.Pagination, { page: 1, pageCount: 3 });
	has(html, 'class="pagination"', "pager");
	has(html, 'aria-label="Pagination"', "nav label");
	assert.equal((html.match(/<button/g) || []).length, 4, "four buttons");
	has(html, 'aria-label="First page"', "first button");
	has(html, 'aria-label="Last page"', "last button");
	has(html, "Page 1 of 3", "status readout");
	assert.equal((html.match(/disabled/g) || []).length, 2, "first and previous are blocked on page 1");

	const localised = await render(Lib.Pagination, {
		page: 2,
		pageCount: 3,
		labels: { next: "Naechste" },
		renderStatus: (page, count) => `${page}/${count}`,
	});
	has(localised, "Naechste", "localised label");
	has(localised, ">2/3<", "custom readout");
	assert.equal((localised.match(/disabled/g) || []).length, 0, "nothing is blocked in the middle");
});

// -------------------------------------------------------------- table view
await check("TableView sorts through its headers", async () => {
	const html = await render(Lib.TableView, {
		sortable: true,
		defaultSortKey: "name",
		width: 240,
		height: 100,
		columns: [
			{ key: "name", header: "Name" },
			{ key: "size", header: "Size", align: "right", sortable: false },
		],
		data: [
			{ name: "Gamma", bytes: 30 },
			{ name: "alpha", bytes: 10 },
			{ name: "Beta", bytes: 20 },
		],
	});
	has(html, 'aria-sort="ascending"', "the sorted column reports its direction");
	has(html, 'class="table-sort-button"', "clickable header");
	has(html, "table-sort-arrow", "sort indicator");

	const body = /<tbody>(.*?)<\/tbody>/.exec(html)?.[1] ?? "";
	const names = [...body.matchAll(/<td>([^<]+)<\/td>/g)].map((match) => match[1]);
	assert.deepEqual(names, ["alpha", "Beta", "Gamma"], "rows are ordered case-insensitively");
});

await check("TableView pages its rows and renders a pager", async () => {
	const html = await render(Lib.TableView, {
		pageSize: 2,
		page: 2,
		width: 200,
		height: 80,
		columns: [{ key: "name", header: "Name" }],
		data: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }],
	});
	has(html, 'class="table-view"', "wrapper around the panel and the pager");
	has(html, 'class="pagination"', "pager");
	has(html, "Page 2 of 3", "readout");

	const body = /<tbody>(.*?)<\/tbody>/.exec(html)?.[1] ?? "";
	assert.equal((body.match(/<tr[\s>]/g) || []).length, 2, "two rows on the second page");
	has(body, ">C<", "the third row is on page two");
	has(body, ">D<", "and so is the fourth");
	lacks(body, ">A<", "the first page is not rendered");
});

// --------------------------------------------------------------- toolbar
await check("Toolbar and its helpers render their contracts", async () => {
	const html = await render(
		Lib.Toolbar,
		{ label: "Standard" },
		slots({
			default: () => [
				h(Lib.ToolbarButton, null, { default: () => "New" }),
				h(Lib.ToolbarSeparator),
				h(Lib.ToolbarButton, null, { default: () => "Open" }),
				h(Lib.ToolbarSpacer),
			],
		}),
	);
	has(html, 'role="toolbar"', "toolbar role");
	has(html, 'aria-label="Standard"', "toolbar name");
	has(html, "toolbar-button", "toolbar button class");
	assert.equal((html.match(/toolbar-button/g) || []).length, 2, "two command buttons");
	has(html, 'role="separator"', "separator role");
	has(html, "toolbar-separator", "separator class");
	has(html, "toolbar-spacer", "spacer class");

	const group = await render(
		Lib.ButtonGroup,
		null,
		slots({ default: () => h(Lib.Button, null, { default: () => "One" }) }),
	);
	has(group, 'class="button-group"', "button group class");
});

// -------------------------------------------------------- separator & keycap
await check("Separator and Kbd render their contracts", async () => {
	const horizontal = await render(Lib.Separator);
	has(horizontal, 'role="separator"', "separator role");
	has(horizontal, 'aria-orientation="horizontal"', "default orientation");
	has(horizontal, "separator-horizontal", "horizontal class");

	const vertical = await render(Lib.Separator, { orientation: "vertical" });
	has(vertical, 'aria-orientation="vertical"', "vertical orientation");

	const decorative = await render(Lib.Separator, { decorative: true });
	has(decorative, 'role="presentation"', "decorative dividers leave the a11y tree");
	lacks(decorative, "aria-orientation", "and carry no orientation");

	const kbd = await render(Lib.Kbd, null, "Ctrl");
	has(kbd, "<kbd", "kbd element");
	has(kbd, 'class="kbd"', "keycap class");
});

// ----------------------------------------------------------------- spin box
await check("SpinBox is a spinbutton with an up/down pair", async () => {
	const html = await render(Lib.SpinBox, { label: "Font size", min: 8, max: 72, defaultValue: 11, width: 80 });
	has(html, 'role="spinbutton"', "spinbutton role");
	has(html, 'aria-valuenow="11"', "current value");
	has(html, 'aria-valuemin="8"', "lower bound");
	has(html, 'aria-valuemax="72"', "upper bound");
	has(html, "spin-box-up", "up button");
	has(html, "spin-box-down", "down button");
	has(html, 'aria-label="Increase"', "up button name");
	has(html, "field-row", "label row");
	const labelled = /<label for="([^"]+)"/.exec(html)?.[1];
	has(html, `id="${labelled}"`, "the label points at the input");
});

// --------------------------------------------------------------- split pane
await check("SplitPane renders a focusable separator between two panes", async () => {
	const html = await render(
		Lib.SplitPane,
		{ defaultSize: 120, min: 60, label: "Resize" },
		slots({
			first: () => h("div", null, "left"),
			second: () => h("div", null, "right"),
		}),
	);
	has(html, 'class="split-pane"', "container");
	has(html, 'role="separator"', "divider role");
	has(html, 'aria-orientation="vertical"', "a horizontal split has a vertical divider");
	has(html, 'aria-label="Resize"', "divider name");
	has(html, 'aria-valuenow="120"', "divider reports its size");
	has(html, 'aria-valuemin="60"', "and its bounds");
	has(html, 'tabindex="0"', "the divider takes focus");
	has(html, "width:120px", "first pane is sized");
	has(html, "split-pane-pane-fill", "second pane takes the rest");
	has(html, ">left<", "first pane content");
	has(html, ">right<", "second pane content");

	const vertical = await render(
		Lib.SplitPane,
		{ direction: "vertical" },
		slots({ first: () => "a", second: () => "b" }),
	);
	has(vertical, "split-pane-vertical", "vertical modifier");
	has(vertical, 'aria-orientation="horizontal"', "and a horizontal divider");
});

// ---------------------------------------------------------------- calendar
await check("Calendar renders a month grid with the selection marked", async () => {
	const html = await render(Lib.Calendar, {
		defaultValue: "2024-02-29",
		min: "2024-02-10",
		max: "2024-02-29",
	});
	has(html, 'role="grid"', "grid role");
	has(html, "February 2024", "month heading");
	assert.equal((html.match(/class="calendar-weekday"/g) || []).length, 7, "seven weekday headers");
	has(html, 'aria-selected="true"', "the selected day is marked");
	has(html, "calendar-day-selected", "and styled");
	has(html, 'aria-label="2024-02-29"', "days are labelled with their date");
	has(html, 'aria-label="Previous month"', "previous month button");
	has(html, 'aria-label="Next month"', "next month button");
	has(html, 'disabled aria-label="2024-02-09"', "a day before min is disabled");

	const monday = await render(Lib.Calendar, { defaultValue: "2024-02-01", weekStartsOn: 1 });
	assert.equal(
		/<th[^>]*>Mo<\/th>/.test(monday) &&
			/<th[^>]*>Su<\/th>/.test(monday) &&
			monday.indexOf(">Mo</th>") < monday.indexOf(">Su</th>"),
		true,
		"weeks can start on Monday",
	);

	assert.equal(Lib.toIsoDate(new Date(1998, 5, 25)), "1998-06-25", "toIsoDate");
	assert.equal(Lib.toIsoDate(Lib.parseIsoDate("1998-06-25")), "1998-06-25", "parseIsoDate round trip");
	assert.equal(Lib.parseIsoDate("2024-02-31"), null, "impossible dates are rejected");
	assert.equal(Lib.parseIsoDate("nope"), null, "junk is rejected");
	assert.equal(Lib.parseIsoDate(""), null, "empty input is rejected");
});

// -------------------------------------------------------------- date picker
await check("DatePicker shows a read-only box and a calendar pop-up", async () => {
	const closed = await render(Lib.DatePicker, { label: "Installed on", defaultValue: "1998-06-25", width: 140 });
	has(closed, 'class="date-picker-input"', "text box");
	has(closed, "readonly", "the box cannot be typed into");
	has(closed, 'value="1998-06-25"', "it shows the value");
	has(closed, 'class="date-picker-button"', "calendar button");
	has(closed, 'aria-label="Choose a date"', "button name");
	has(closed, 'aria-expanded="false"', "collapsed to start with");
	lacks(closed, 'role="dialog"', "no calendar while closed");

	const open = await render(Lib.DatePicker, {
		defaultOpen: true,
		inline: true,
		defaultValue: "1998-06-25",
		formatValue: (iso) => iso.split("-").reverse().join("/"),
	});
	has(open, 'class="date-picker-popup"', "pop-up surface");
	has(open, 'role="dialog"', "the calendar is a dialog");
	has(open, 'class="calendar"', "with a calendar inside");
	has(open, 'value="25/06/1998"', "formatValue controls the box text");
	has(open, 'aria-expanded="true"', "expanded");
});

// -------------------------------------------------------------- balloon tip
await check("BalloonTip docks in a corner and carries its icon", async () => {
	const docked = await render(Lib.BalloonTip, {
		defaultOpen: true,
		inline: true,
		title: "New hardware found",
		icon: "info",
		closable: true,
	}, "Installing the driver.");
	has(docked, 'role="status"', "announced politely");
	has(docked, "balloon-docked", "docked variant");
	has(docked, "balloon-bottom-right", "default corner");
	has(docked, "balloon-icon-info", "icon");
	has(docked, "balloon-title", "title");
	has(docked, "balloon-text", "body");
	has(docked, "balloon-tail", "tail");
	has(docked, 'aria-label="Close"', "close button name");

	const anchored = await render(Lib.BalloonTip, {
		defaultOpen: true,
		inline: true,
		anchor: null,
		side: "top",
		announce: "alert",
	}, "Careful.");
	has(anchored, 'role="alert"', "announced assertively");
	has(anchored, "balloon-anchored", "anchored variant");
	lacks(anchored, "balloon-docked", "not docked");

	assert.equal(await render(Lib.BalloonTip, null, "hidden"), "", "a closed balloon renders nothing");
});

// ------------------------------------------------------------ property sheet
await check("PropertySheet is a dialog whose pages are tabs", async () => {
	const html = await render(Lib.PropertySheet, {
		defaultOpen: true,
		inline: true,
		title: "Display Properties",
		onApply: () => {},
		tabs: [
			{ value: "background", label: "Background", content: "wallpaper" },
			{ value: "settings", label: "Settings", content: "colours" },
			{ value: "screen", label: "Screen saver", content: "none", disabled: true },
		],
	});
	has(html, 'role="dialog"', "dialog");
	has(html, 'class="window dialog property-sheet"', "window chrome");
	has(html, 'role="tablist"', "tab strip");
	assert.equal((html.match(/role="tab"/g) || []).length, 3, "three tabs");
	has(html, 'role="tabpanel"', "a page");
	has(html, "property-page", "flat page styling");
	has(html, 'aria-disabled="true"', "a disabled tab");
	has(html, ">Apply<", "apply button");
	has(html, 'class="default">OK<', "OK is the default command");
	has(html, ">Cancel<", "cancel button");
});

// ------------------------------------------------------------------- wizard
await check("Wizard walks its steps and switches Next for Finish", async () => {
	const steps = [
		{ key: "welcome", title: "Welcome", content: "one" },
		{ key: "device", title: "Device", content: "two", description: "pick one" },
		{ key: "done", title: "Done", content: "three", disabled: true },
	];

	const first = await render(Lib.Wizard, { defaultOpen: true, inline: true, title: "Add Hardware", steps });
	has(first, "window dialog wizard", "the wizard is a dialog");
	has(first, 'class="wizard-steps"', "step list");
	assert.equal((first.match(/data-wizard-step=/g) || []).length, 3, "three steps");
	has(first, "wizard-step-active", "the current step is highlighted");
	has(first, 'aria-current="step"', "and marked for assistive technology");
	has(first, "wizard-step-disabled", "a blocked step is styled");
	has(first, "Step 1 of 3", "step readout");
	has(first, 'class="default">Next<', "Next on the first step");
	lacks(first, 'class="default">Finish<', "no Finish button yet");
	has(first, ">Back<", "back button");
	has(first, ">Cancel<", "cancel button");
	has(first, ">one<", "the first page content");

	const last = await render(Lib.Wizard, {
		defaultOpen: true,
		inline: true,
		title: "Add Hardware",
		steps,
		defaultStep: 2,
	});
	has(last, "Step 3 of 3", "readout follows the step");
	has(last, 'class="default">Finish<', "Finish on the last step");
	lacks(last, ">Next<", "no Next on the last step");
	has(last, ">three<", "the last page content");
});

// --------------------------------------------------------- badge and avatar
await check("Badge tints its chip per variant", async () => {
	const plain = await render(Lib.Badge, null, "New");
	has(plain, 'class="badge"', "default chip");
	lacks(plain, "badge-", "no variant class by default");

	for (const variant of ["info", "success", "warning", "error"]) {
		has(await render(Lib.Badge, { variant }, "Status"), `badge-${variant}`, `${variant} tint`);
	}

	const withIcon = await render(
		Lib.Badge,
		{},
		slots({
			icon: () => h("span", null, "!"),
			default: () => "3 errors",
		}),
	);
	has(withIcon, "badge-icon", "icon slot");
	has(withIcon, 'aria-hidden="true"', "the icon is decorative");
	has(withIcon, "3 errors", "label");
});

await check("Avatar falls back to initials and honours its size", async () => {
	const initials = await render(Lib.Avatar, { fallback: "MO" });
	has(initials, 'class="avatar"', "avatar box");
	has(initials, "avatar-fallback", "fallback slot");
	has(initials, "--avatar-size:32px", "default size");
	lacks(initials, "<img", "no image without a src");

	const image = await render(Lib.Avatar, { src: "/me.png", alt: "Meorion", size: 48, shape: "circle" });
	has(image, 'class="avatar-image"', "image element");
	has(image, 'src="/me.png"', "image source");
	has(image, 'alt="Meorion"', "alt text");
	has(image, "--avatar-size:48px", "explicit size");
	has(image, "avatar-circle", "circle shape");
});

// ------------------------------------------------------------------- card
await check("Card composes header, content and footer", async () => {
	const html = await render(
		Lib.Card,
		{ style: { width: "240px" } },
		slots({
			default: () => [
				h(Lib.CardHeader, null, {
					default: () => [
						h(Lib.CardTitle, null, { default: () => "Modem" }),
						h(Lib.CardDescription, null, { default: () => "Standard 56k modem" }),
					],
				}),
				h(Lib.CardContent, null, { default: () => "Connected at 33.6 kbps." }),
				h(Lib.CardFooter, null, {
					default: () => h(Lib.Button, null, { default: () => "Properties" }),
				}),
			],
		}),
	);
	has(html, 'class="card"', "card frame");
	has(html, 'class="card-header"', "header");
	has(html, "card-title", "title");
	has(html, ">Modem<", "title text");
	has(html, 'class="card-description"', "description");
	has(html, 'class="card-content"', "content");
	has(html, 'class="card-footer"', "footer");
	has(html, "Connected at 33.6 kbps.", "content text");

	has(await render(Lib.CardTitle, { as: "h2" }, "Title"), "<h2", "title level can be overridden");
});

// ------------------------------------------------------------- typography
await check("Heading, Text and Prose carry the UI type scale", async () => {
	for (const level of [1, 2, 3, 4]) {
		const html = await render(Lib.Heading, { level }, "Title");
		has(html, `<h${level} class="heading heading-${level}">`, `h${level} with its class`);
	}
	has(await render(Lib.Heading, null, "Title"), "<h2", "defaults to level 2");

	has(await render(Lib.Text, null, "Body"), 'class="text text-body"', "paragraph by default");
	has(await render(Lib.Text, { variant: "lead" }, "Lead"), "text-lead", "lead variant");
	has(await render(Lib.Text, { variant: "muted" }, "Muted"), "text-muted", "muted variant");
	has(await render(Lib.Text, { variant: "small" }, "Small"), "text-small", "small variant");
	has(await render(Lib.Text, { as: "span" }, "Inline"), "<span", "element override");

	const prose = await render(Lib.Prose, null, h("p", null, "Rendered markdown"));
	has(prose, 'class="prose"', "prose wrapper");
	has(prose, "Rendered markdown", "children pass through");
});

// ------------------------------------------------------------------ empty
await check("Empty stacks an icon, a title, a hint and actions", async () => {
	const html = await render(
		Lib.Empty,
		{ title: "This folder is empty", description: "Drag files here.", compact: true },
		slots({
			icon: () => h("span", null, "?"),
			default: () => h(Lib.Button, null, { default: () => "New folder" }),
		}),
	);
	has(html, 'class="empty empty-compact"', "empty state");
	has(html, 'class="empty-icon"', "icon");
	has(html, 'class="empty-title"', "title");
	has(html, 'class="empty-description"', "description");
	has(html, 'class="empty-actions"', "actions row");
	has(html, ">New folder<", "action content");

	const bare = await render(Lib.Empty, { title: "Nothing" });
	has(bare, 'class="empty"', "no compact class");
	lacks(bare, "empty-icon", "no icon when none is given");
});

// ---------------------------------------------------------------- spinner
await check("Spinner is an announced hourglass", async () => {
	const html = await render(Lib.Spinner);
	has(html, 'role="status"', "status role");
	has(html, 'aria-label="Working…"', "default label");
	has(html, "spinner spinner-default", "default size");
	has(html, "spinner-glyph", "glyph");
	has(html, "<svg", "inline svg, so the flip is a CSS animation");

	has(await render(Lib.Spinner, { size: "large", label: "Copying" }), "spinner-large", "named size");
	has(await render(Lib.Spinner, { size: "small" }), "spinner-small", "small size");
	has(await render(Lib.Spinner, { size: 24 }), "--spinner-size:24px", "pixel size");
	has(await render(Lib.Spinner, { label: "Copying files" }), 'aria-label="Copying files"', "custom label");
});

// -------------------------------------------------------------- progress
await check("ProgressIndicator animates when it has no value", async () => {
	const determinate = await render(Lib.ProgressIndicator, { value: 40 });
	has(determinate, 'aria-valuenow="40"', "determinate value");
	lacks(determinate, "progress-indicator-indeterminate", "and no marquee class");

	const indeterminate = await render(Lib.ProgressIndicator, { width: 200 });
	has(indeterminate, "progress-indicator-indeterminate", "a bar without a value is a marquee");
	lacks(indeterminate, "aria-valuenow", "which omits the value attributes");
	lacks(indeterminate, "aria-valuemax", "including the maximum");
	has(indeterminate, 'role="progressbar"', "still a progressbar");
	assert.ok(
		!/<span class="progress-indicator-bar"[^>]*style=/.test(indeterminate),
		"the marquee positions the bar itself, so it carries no inline width",
	);

	const optedOut = await render(Lib.ProgressIndicator, { indeterminate: false });
	lacks(optedOut, "progress-indicator-indeterminate", "the marquee can be turned off");
	has(optedOut, 'aria-valuenow="0"', "and then it reports zero");

	has(
		await render(Lib.ProgressIndicator, { value: 10, indeterminate: true }),
		"progress-indicator-indeterminate",
		"an explicit marquee wins over the value",
	);
});

// ------------------------------------------------------------- text colour
await check("no rule hides text by dropping the button shadow without a colour", async () => {
	/*
	 * Upstream paints every button label as `color: transparent` plus a
	 * `0 0 var(--text-color)` text-shadow — the shadow *is* the glyph. A rule
	 * that turns the shadow off and forgets to set a real colour renders
	 * invisible text, which is exactly what happened to the calendar days, the
	 * toolbar buttons and the wizard steps.
	 */
	const offenders = [];
	for (const file of ["vue-extras.css", "overlays.css", "controls.css", "widgets.css"]) {
		const css = fs.readFileSync(path.join(HERE, "..", "src", "styles", file), "utf8");
		postcss.parse(css).walkRules((rule) => {
			let shadow;
			let colour;
			let fill;
			rule.walkDecls((decl) => {
				if (decl.prop === "text-shadow") shadow = decl.value.trim();
				if (decl.prop === "color") colour = decl.value.trim();
				if (decl.prop === "background" || decl.prop === "background-color") {
					fill = decl.value.trim();
				}
			});
			if (shadow === "none" && colour === undefined) {
				offenders.push(`${file}: ${rule.selector}`);
			}
			// A mask filled with `currentColor` vanishes on a button, whose colour
			// is transparent: the glyph has to name a real colour.
			if (rule.selector.includes("::before") && fill === "currentColor" && colour === undefined) {
				offenders.push(`${file}: ${rule.selector} (mask on a transparent colour)`);
			}
		});
	}
	assert.deepEqual(offenders, [], `rules that would render invisible text: ${offenders.join(" | ")}`);
});

await check("the progress marquee cannot escape its trough", async () => {
	/*
	 * The trough only has padding upstream, so a bar that slides past its
	 * content box is painted outside the frame. That is what happened: the
	 * indeterminate block ran out past the end of the bar.
	 */
	const css = fs.readFileSync(path.join(HERE, "..", "src", "styles", "display.css"), "utf8");
	const declarations = new Map();
	postcss.parse(css).walkRules((rule) => {
		// Skip the `prefers-reduced-motion` overrides: they intentionally turn
		// the animations off.
		if (rule.parent?.type !== "root") return;
		const props = {};
		rule.walkDecls((decl) => {
			props[decl.prop] = decl.value.trim();
		});
		declarations.set(rule.selector, props);
	});

	const trough = declarations.get(".progress-indicator-indeterminate");
	assert.equal(trough?.overflow, "hidden", "a sliding trough must clip its bar");

	const solid = declarations.get(".progress-indicator-indeterminate > .progress-indicator-bar");
	assert.match(solid?.animation ?? "", /marquee/, "the solid variant sweeps");

	const segmented = declarations.get(
		".progress-indicator.segmented.progress-indicator-indeterminate > .progress-indicator-bar",
	);
	assert.match(segmented?.animation ?? "", /blocks/, "the segmented variant marches in place");
	assert.equal(segmented?.["margin-left"], "0", "and never slides out of the trough");
});

// ---------------------------------------------------------------- utilities
await check("cx filters falsy values", async () => {
	assert.equal(Lib.cx("a", false, null, undefined, "b"), "a b");
	assert.equal(Lib.cx(), undefined);
});

// ---------------------------------------------------------------- generated CSS
await check("generated stylesheet keeps CSS variables and inlines every icon", async () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");

	assert.ok(css.includes("--dialog-blue: #000080"), "custom properties preserved");
	assert.ok(!css.includes("svg-load("), "no unresolved svg-load() calls");
	assert.ok(!css.includes("var(--color-pinkline-50));"), "variables were not pre-resolved");
	const icons = (css.match(/data:image\/svg\+xml/g) || []).length;
	assert.ok(icons >= 24, `expected >= 24 inlined icons, found ${icons}`);
	assert.ok(css.includes(".force-active"), "Vue helper classes bundled");
});

// ---------------------------------------------------------------- report
console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length > 0) {
	for (const { name, error } of failures) {
		console.error(`FAILED: ${name}`);
		console.error(error.stack ?? error.message);
	}
	process.exit(1);
}
