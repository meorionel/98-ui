#!/usr/bin/env node
/**
 * Renders every exported component to static markup and asserts the class names
 * and structure the stylesheet depends on. This is the guard-rail for the
 * React port: if a refactor drops a `.field-row`, reorders `input + label`, or
 * forgets to hide an inactive tab panel, this test fails.
 *
 * Run with `npm test` (after `npm run build`).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Lib from "../dist/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const postcss = require("postcss");

let passed = 0;
const failures = [];

function check(name, fn) {
	try {
		fn();
		passed += 1;
		console.log(`  ✓ ${name}`);
	} catch (error) {
		failures.push({ name, error });
		console.log(`  ✗ ${name}`);
		console.log(`      ${error.message.split("\n")[0]}`);
	}
}

const render = (element) => renderToStaticMarkup(element);
const has = (html, needle, label) =>
	assert.ok(html.includes(needle), `${label ?? needle} missing from output:\n${html}`);
const lacks = (html, needle, label) =>
	assert.ok(!html.includes(needle), `${label ?? needle} unexpectedly present:\n${html}`);

console.log("\n98-pink-react smoke test\n");

// ---------------------------------------------------------------- exports
check("every public component is exported", () => {
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
		"FieldContext",
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
check("Button applies the default and forced-state classes", () => {
	const plain = render(h(Lib.Button, null, "Click me"));
	has(plain, "<button", "button element");
	has(plain, 'type="button"', "implicit type=button");

	const dflt = render(h(Lib.Button, { variant: "default" }, "OK"));
	has(dflt, 'class="default"', "default variant class");

	const forced = render(h(Lib.Button, { active: true, focused: true }, "Forced"));
	has(forced, "force-active", "force-active class");
	has(forced, "force-focused", "force-focused class");

	const disabled = render(h(Lib.Button, { disabled: true }, "No"));
	has(disabled, "disabled", "disabled attribute");
});

// ---------------------------------------------------------------- checkbox
check("Checkbox renders input immediately before its label", () => {
	const html = render(h(Lib.Checkbox, { label: "This is a checkbox" }));
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

check("Checkbox with checked but no onChange stays quiet (readOnly)", () => {
	const html = render(h(Lib.Checkbox, { label: "Checked", checked: true, onChange: () => {} }));
	has(html, "checked", "checked attribute");
	const staticHtml = render(h(Lib.Checkbox, { label: "Static", checked: true }));
	has(staticHtml, "readonly", "readOnly guard for static previews");
});

// ---------------------------------------------------------------- radio
check("RadioGroup shares one name and checks the right option", () => {
	const html = render(
		h(Lib.RadioGroup, {
			defaultValue: "b",
			options: [
				{ label: "A", value: "a" },
				{ label: "B", value: "b" },
			],
		}),
	);
	const names = [...html.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
	assert.equal(names.length, 2, "both radios rendered");
	assert.equal(new Set(names).size, 1, "all radios share one name");
	assert.equal((html.match(/checked/g) || []).length, 1, "exactly one radio is checked");
});

// ---------------------------------------------------------------- groupbox
check("GroupBox renders fieldset + legend", () => {
	const html = render(h(Lib.GroupBox, { legend: "Today's mood" }, "content"));
	has(html, "<fieldset", "fieldset");
	has(html, "<legend>Today&#x27;s mood</legend>", "legend text");
});

// ---------------------------------------------------------------- text
check("TextBox pairs its label and input", () => {
	const row = render(h(Lib.TextBox, { label: "Occupation" }));
	has(row, 'class="field-row"', "field-row layout");
	const stacked = render(h(Lib.TextBox, { label: "Address", layout: "stacked", width: 200 }));
	has(stacked, "field-row-stacked", "stacked layout");
	has(stacked, "width:200px", "explicit width");

	const area = render(h(Lib.TextArea, { label: "Notes", rows: 8 }));
	has(area, "<textarea", "textarea element");
	has(area, "field-row-stacked", "TextArea defaults to stacked");
});

// ---------------------------------------------------------------- select
check("Select supports both options and children", () => {
	const fromOptions = render(
		h(Lib.Select, {
			options: [
				{ label: "5 - Incredible!", value: "5" },
				{ label: "4 - Great!", value: "4" },
			],
		}),
	);
	has(fromOptions, "<select", "select element");
	assert.equal((fromOptions.match(/<option/g) || []).length, 2, "two options");

	const fromChildren = render(h(Lib.Select, null, h("option", null, "One")));
	has(fromChildren, "<option", "child option");
});

// ---------------------------------------------------------------- slider
check("Slider renders horizontal, box and vertical variants", () => {
	const plain = render(h(Lib.Slider, { min: 1, max: 11, defaultValue: 5 }));
	has(plain, 'type="range"', "range input");

	const boxed = render(h(Lib.Slider, { boxIndicator: true, defaultValue: 2 }));
	has(boxed, "has-box-indicator", "box indicator class");

	const vertical = render(h(Lib.Slider, { vertical: true, length: 150, defaultValue: 2 }));
	has(vertical, 'class="is-vertical"', "is-vertical wrapper");
	has(vertical, "height:150px", "vertical length");

	const labelled = render(
		h(Lib.Slider, { label: "Volume:", lowLabel: "Low", highLabel: "High", defaultValue: 5 }),
	);
	has(labelled, "Low", "low caption");
	has(labelled, "High", "high caption");
});

// ---------------------------------------------------------------- window
check("Window composes title bar, body, menu bar and status bar", () => {
	const html = render(
		h(
			Lib.Window,
			{
				title: "A Window With Stuff In It",
				controls: ["minimize", "maximize", "close"],
				width: 320,
				menuBar: h(Lib.MenuBar, {
					items: [
						{ label: "File", accessKey: "F" },
						{ label: "Edit", accessKey: "E" },
					],
				}),
				statusBar: h(Lib.StatusBar, null, h(Lib.StatusBarField, null, "Press F1 for help")),
			},
			h("p", null, "There's so much room for activities!"),
		),
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

check("Window supports an inactive title bar and localised labels", () => {
	const html = render(
		h(Lib.Window, {
			title: "An inactive title bar",
			controls: ["close"],
			inactive: true,
			labels: { close: "关闭" },
		}),
	);
	has(html, "title-bar inactive", "inactive class");
	has(html, 'aria-label="关闭"', "localised aria-label");
});

check("TitleBar control buttons carry both class and aria-label hooks", () => {
	const html = render(
		h(Lib.TitleBar, {
			text: "A Title Bar",
			controls: ["minimize", "restore", "help", "close"],
		}),
	);
	for (const action of ["minimize", "restore", "help", "close"]) {
		has(html, `class="${action}"`, `${action} class`);
	}
	has(html, 'aria-label="Restore"', "restore aria-label");
});

// ---------------------------------------------------------------- menubar
check("MenuBar renders an accessible menubar with underlined accelerators", () => {
	const html = render(
		h(Lib.MenuBar, {
			label: "Window menu",
			items: [
				{ label: "File", accessKey: "F" },
				{ label: "Favorites", accessKey: "a" },
			],
		}),
	);
	has(html, 'role="menubar"', "menubar role");
	has(html, 'aria-label="Window menu"', "menubar label");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two menu items");
	has(html, "<u>F</u>ile", "leading accelerator");
	has(html, "F<u>a</u>vorites", "inner accelerator");
	has(html, 'tabindex="0"', "focusable menu items");
});

check("MenuBar localises accelerators that are absent from the label", () => {
	const html = render(h(Lib.MenuBar, { items: [{ label: "文件", accessKey: "F" }] }));
	has(html, "文件(<u>F</u>)", "appended accelerator for a non-Latin label");

	assert.equal(
		render(h("span", null, Lib.renderAccessKey("NoMatch", "Z"))),
		"<span>NoMatch(<u>Z</u>)</span>",
		"accelerator appended when the character is missing",
	);
	assert.equal(
		render(h("span", null, Lib.renderAccessKey("View", "V"))),
		"<span><u>V</u>iew</span>",
		"accelerator underlined when the character is present",
	);
});

// ---------------------------------------------------------------- tree
check("TreeView nests branches as details/summary", () => {
	const html = render(
		h(
			Lib.TreeView,
			null,
			h(Lib.TreeViewItem, null, "Table of Contents"),
			h(
				Lib.TreeViewBranch,
				{ label: "CSS", defaultOpen: true },
				h(Lib.TreeViewItem, null, "Selectors"),
				h(Lib.TreeViewItem, null, "Specificity"),
			),
		),
	);
	has(html, 'class="tree-view"', "tree-view class");
	has(html, "<details", "details element");
	has(html, "open", "defaultOpen forwarded");
	has(html, "<summary>CSS</summary>", "branch summary");
	has(html, "<ul><li>Selectors</li>", "nested list");
});

// ---------------------------------------------------------------- tabs
check("Tabs shows only the selected panel and wires ARIA", () => {
	const html = render(
		h(
			Lib.Tabs,
			{ defaultValue: "desktop" },
			h(
				Lib.TabList,
				{ label: "Control panel" },
				h(Lib.Tab, { value: "desktop" }, "Desktop"),
				h(Lib.Tab, { value: "computer" }, "My computer"),
			),
			h(Lib.TabPanel, { value: "desktop" }, h("p", null, "the tab content")),
			h(Lib.TabPanel, { value: "computer" }, h("p", null, "other content")),
		),
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

check("Tabs keepMounted keeps inactive panels hidden, not unmounted", () => {
	const html = render(
		h(
			Lib.Tabs,
			{ defaultValue: "a", keepMounted: true },
			h(Lib.TabList, null, h(Lib.Tab, { value: "a" }, "A"), h(Lib.Tab, { value: "b" }, "B")),
			h(Lib.TabPanel, { value: "a" }, "content a"),
			h(Lib.TabPanel, { value: "b" }, "content b"),
		),
	);
	has(html, "content a", "active content");
	has(html, "content b", "inactive content still mounted");
	has(html, "hidden", "inactive panel hidden");
});

check("TabList multirows adds the stretching class", () => {
	const html = render(
		h(
			Lib.Tabs,
			null,
			h(Lib.TabList, { multirows: true }, h(Lib.Tab, { value: "a" }, "A")),
			h(Lib.TabPanel, { value: "a" }, "content a"),
		),
	);
	has(html, "multirows", "multirows class");
});

// ---------------------------------------------------------------- table
check("TableView builds a sunken panel, sticky header and selectable rows", () => {
	const html = render(
		h(Lib.TableView, {
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
		}),
	);

	has(html, 'class="sunken-panel"', "sunken panel wrapper");
	has(html, "height:120px", "explicit height");
	has(html, "width:240px", "explicit width");
	has(html, 'class="interactive"', "interactive table");
	has(html, "<thead>", "sticky header");
	has(html, "<th>Name</th>", "header cell");
	assert.equal((html.match(/highlighted/g) || []).length, 1, "exactly one highlighted row");
	has(html, "MySQL ODBC 3.51 Driver", "cell value from row[key]");
});

check("TableRow highlighted can be driven manually", () => {
	const html = render(
		h(
			Lib.Table,
			null,
			h(
				Lib.TableBody,
				null,
				h(Lib.TableRow, { highlighted: true }, h(Lib.TableCell, null, "x")),
			),
		),
	);
	has(html, 'class="highlighted"', "highlighted class");
});

// ---------------------------------------------------------------- progress
check("ProgressIndicator renders solid and segmented bars", () => {
	const solid = render(h(Lib.ProgressIndicator, { value: 40 }));
	has(solid, 'class="progress-indicator"', "solid variant");
	has(solid, 'class="progress-indicator-bar"', "bar element");
	has(solid, "width:40%", "40% width");
	has(solid, 'role="progressbar"', "progressbar role");
	has(solid, 'aria-valuenow="40"', "aria-valuenow");

	const segmented = render(h(Lib.ProgressIndicator, { value: 40, segmented: true }));
	has(segmented, "progress-indicator segmented", "segmented class");

	const clamped = render(h(Lib.ProgressIndicator, { value: 250 }));
	has(clamped, "width:100%", "value is clamped to max");
});

// ---------------------------------------------------------------- panels
check("Field border and panel helpers render their classes", () => {
	has(render(h(Lib.FieldBorder, null, "Work area")), 'class="field-border"', "field-border");
	has(
		render(h(Lib.FieldBorderDisabled, null, "Disabled")),
		'class="field-border-disabled"',
		"field-border-disabled",
	);
	has(
		render(h(Lib.StatusFieldBorder, null, "Dynamic")),
		'class="status-field-border"',
		"status-field-border",
	);
	has(render(h(Lib.SunkenPanel, null, "x")), 'class="sunken-panel"', "sunken-panel");
	has(render(h(Lib.VerticalBar, null)), 'class="vertical-bar"', "vertical-bar");
	has(render(h(Lib.Link, { href: "#x" }, "link")), "<a", "anchor element");
	has(render(h(Lib.CodeBlock, null, "const a = 1;")), "<pre><code>", "pre + code");
});

check("FieldRow spacing hooks are emitted", () => {
	has(render(h(Lib.FieldRow, null, "x")), 'class="field-row"', "field-row");
	has(
		render(h(Lib.FieldRowStacked, null, "x")),
		'class="field-row-stacked"',
		"field-row-stacked",
	);
	has(render(h(Lib.FieldLabel, null, "Select one:")), 'class="field-row"', "field label row");
	has(render(h(Lib.FieldRow, { stacked: true }, "x")), "field-row-stacked", "stacked shorthand");
});

// ---------------------------------------------------------------- overlays
check("DropdownMenu keeps its trigger and reflects the open state", () => {
	const closed = render(
		h(Lib.DropdownMenu, {
			trigger: h(Lib.Button, { onClick: () => {} }, "File"),
			items: [{ label: "New" }],
		}),
	);
	has(closed, 'aria-haspopup="menu"', "trigger advertises a menu");
	has(closed, 'aria-expanded="false"', "collapsed state");
	lacks(closed, 'role="menu"', "no menu while closed");

	const open = render(
		h(Lib.DropdownMenu, {
			trigger: h(Lib.Button, null, "File"),
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
		}),
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

check("MenuPopup renders a menu surface on its own", () => {
	const html = render(
		h(Lib.MenuPopup, {
			items: [{ label: "One" }, { label: "Two" }],
			label: "Standalone",
			inline: true,
		}),
	);
	has(html, 'role="menu"', "menu role");
	has(html, 'aria-label="Standalone"', "menu label");
	has(html, 'role="none" class="menu-popup-list"', "list is presentational");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two items");
});

// ---------------------------------------------------------------- menubar
check("MenuBar opens drop-downs for entries that declare items", () => {
	const html = render(
		h(Lib.MenuBar, {
			items: [
				{ label: "File", accessKey: "F", items: [{ label: "New", onSelect: () => {} }] },
				{ label: "Edit", accessKey: "E" },
			],
		}),
	);
	has(html, 'role="menubar"', "menubar role");
	has(html, "<u>F</u>ile", "accelerator still underlined");
	assert.equal((html.match(/role="menuitem"/g) || []).length, 2, "two captions");
	has(html, 'aria-haspopup="menu"', "caption advertises a menu");
	has(html, 'aria-expanded="false"', "caption reports the closed state");
	lacks(html, "menu-popup", "no popup until the caption is opened");
});

// ---------------------------------------------------------------- dialog
check("Dialog renders a modal window with a title bar and footer", () => {
	lacks(
		render(h(Lib.Dialog, { title: "Hidden", children: "gone" })),
		"gone",
		"a closed dialog renders nothing",
	);

	const html = render(
		h(Lib.Dialog, {
			defaultOpen: true,
			inline: true,
			title: "Delete file",
			footer: h(Lib.Button, { variant: "default" }, "OK"),
			children: h("p", null, "Are you sure?"),
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

check("Dialog supports a modeless, caption-less variant", () => {
	const html = render(
		h(Lib.Dialog, {
			defaultOpen: true,
			inline: true,
			modal: false,
			overlay: false,
			label: "Floating palette",
			children: "x",
		}),
	);
	lacks(html, "dialog-overlay", "no backdrop when overlay={false}");
	lacks(html, "aria-modal", "no aria-modal when modal={false}");
	has(html, 'aria-label="Floating palette"', "accessible name fallback");
	has(html, 'class="window dialog"', "still window chrome");
});

check("MessageBox draws its icon, message and button set", () => {
	for (const icon of ["info", "warning", "error", "question"]) {
		has(
			render(
				h(Lib.MessageBox, { defaultOpen: true, inline: true, icon, children: "Message" }),
			),
			`message-box-icon-${icon}`,
			`${icon} icon`,
		);
	}

	const html = render(
		h(Lib.MessageBox, {
			defaultOpen: true,
			inline: true,
			title: "Format complete",
			icon: "info",
			buttons: ["yes", "no", "cancel"],
			defaultButton: "no",
			onResult: () => {},
			children: "Setup has finished.",
		}),
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
check("Tooltip describes its anchor and renders role=tooltip when open", () => {
	lacks(
		render(h(Lib.Tooltip, { content: "Tip", children: h(Lib.Button, null, "Hover") })),
		"tooltip",
		"no tooltip while closed",
	);

	const html = render(
		h(Lib.Tooltip, {
			open: true,
			inline: true,
			content: "Sends the file away",
			children: h(Lib.Button, null, "Delete"),
		}),
	);
	has(html, 'role="tooltip"', "tooltip role");
	has(html, "Sends the file away", "tooltip content");
	const id = /aria-describedby="([^"]+)"/.exec(html)?.[1];
	assert.ok(id !== undefined, "the anchor is described by the tooltip");
	has(html, `id="${id}"`, "aria-describedby points at the tooltip element");
});

// ---------------------------------------------------------------- popover
check("Popover renders an anchored modeless surface", () => {
	const html = render(
		h(Lib.Popover, {
			defaultOpen: true,
			inline: true,
			label: "Details",
			trigger: h(Lib.Button, null, "More"),
			children: h("p", null, "Content"),
		}),
	);
	has(html, 'class="popover"', "popover surface");
	has(html, 'role="dialog"', "dialog role");
	has(html, 'aria-label="Details"', "accessible name");
	has(html, 'aria-haspopup="dialog"', "trigger advertises the popover");
	has(html, 'aria-expanded="true"', "trigger state");
	has(html, "Content", "children rendered");
});

check("ContextMenu wraps its area and waits for a right-click", () => {
	const html = render(
		h(Lib.ContextMenu, { items: [{ label: "Rename" }], children: h("div", null, "area") }),
	);
	has(html, 'class="context-menu-area"', "area wrapper");
	has(html, "area", "children rendered");
	lacks(html, "menu-popup", "no menu before a right-click");
});

// ---------------------------------------------------------------- layer maths
check("Portal defers to the client, and renders inline when disabled", () => {
	assert.equal(typeof Lib.Portal, "function", "Portal is exported");
	assert.equal(
		render(h(Lib.Portal, null, h("span", null, "mounted"))),
		"",
		"nothing before mount",
	);
	assert.equal(
		render(h(Lib.Portal, { disabled: true }, h("span", null, "inline"))),
		"<span>inline</span>",
		"renders in place when disabled",
	);
});

check("computeFloatingPosition flips and shifts inside the viewport", () => {
	const originalWindow = globalThis.window;
	globalThis.window = { innerWidth: 1000, innerHeight: 800 };
	try {
		const anchor = { top: 100, bottom: 120, left: 200, right: 300, width: 100, height: 20 };
		const layer = { width: 150, height: 200 };

		assert.deepEqual(
			Lib.computeFloatingPosition(anchor, layer, { side: "bottom", align: "start" }),
			{ top: 124, left: 200, side: "bottom" },
			"placed below the anchor with the standard 4px gap",
		);
		assert.equal(
			Lib.computeFloatingPosition({ ...anchor, top: 760, bottom: 780 }, layer, {
				side: "bottom",
			}).side,
			"top",
			"flips above when there is no room below",
		);
		assert.equal(
			Lib.computeFloatingPosition(anchor, layer, { side: "bottom", align: "end" }).left,
			150,
			"end alignment hugs the anchor's right edge",
		);
		assert.equal(
			Lib.computeFloatingPosition({ ...anchor, left: 950, right: 980 }, layer, {
				side: "bottom",
				align: "start",
			}).left,
			846,
			"shifted back inside the viewport",
		);
	} finally {
		if (originalWindow === undefined) delete globalThis.window;
		else globalThis.window = originalWindow;
	}
});

check("every class the display components emit exists in the stylesheet", () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");
	const html = [
		render(h(Lib.Badge, { variant: "error", icon: h("span", null, "!") }, "3 errors")),
		render(h(Lib.Avatar, { fallback: "MO" })),
		render(h(Lib.Avatar, { src: "/x.png", alt: "x", size: 48, shape: "circle" })),
		render(
			h(
				Lib.Card,
				null,
				h(
					Lib.CardHeader,
					null,
					h(Lib.CardTitle, null, "T"),
					h(Lib.CardDescription, null, "d"),
				),
				h(Lib.CardContent, null, "c"),
				h(Lib.CardFooter, null, "f"),
			),
		),
		render(
			h(
				Lib.Prose,
				null,
				h(Lib.Heading, { level: 1 }, "H"),
				h(Lib.Text, { variant: "muted" }, "t"),
			),
		),
		render(
			h(
				Lib.Empty,
				{ icon: h("span", null, "?"), title: "t", description: "d", compact: true },
				"x",
			),
		),
		render(h(Lib.Spinner, { size: "large" })),
		render(h(Lib.ProgressIndicator, { width: 100 })),
	].join("");

	const classes = new Set();
	for (const match of html.matchAll(/class="([^"]*)"/g)) {
		for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
	}
	const unknown = [...classes].filter((name) => !css.includes(`.${name}`));
	assert.deepEqual(unknown, [], `classes with no styling rules: ${unknown.join(", ")}`);
});

check("every class the widget components emit exists in the stylesheet", () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");
	const html = [
		render(h(Lib.Separator, null)),
		render(h(Lib.Separator, { orientation: "vertical" })),
		render(h(Lib.Kbd, null, "Ctrl")),
		render(h(Lib.SpinBox, { label: "S", min: 0, max: 9, defaultValue: 1 })),
		render(h(Lib.SplitPane, { first: "a", second: "b", label: "x" })),
		render(h(Lib.SplitPane, { direction: "vertical", first: "a", second: "b" })),
		render(h(Lib.Calendar, { defaultValue: "2024-02-29" })),
		render(h(Lib.DatePicker, { defaultOpen: true, inline: true, defaultValue: "1998-06-25" })),
		render(
			h(Lib.BalloonTip, {
				defaultOpen: true,
				inline: true,
				title: "T",
				icon: "warning",
				closable: true,
				children: "b",
			}),
		),
		render(
			h(Lib.BalloonTip, {
				defaultOpen: true,
				inline: true,
				anchorRef: { current: null },
				icon: "error",
				children: "b",
			}),
		),
		render(
			h(Lib.PropertySheet, {
				defaultOpen: true,
				inline: true,
				title: "P",
				tabs: [{ value: "a", label: "A", content: "x" }],
			}),
		),
		render(
			h(Lib.Wizard, {
				defaultOpen: true,
				inline: true,
				title: "W",
				steps: [{ key: "a", title: "A", content: "x" }],
			}),
		),
	].join("");

	const classes = new Set();
	for (const match of html.matchAll(/class="([^"]*)"/g)) {
		for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
	}
	const unknown = [...classes].filter((name) => !css.includes(`.${name}`));
	assert.deepEqual(unknown, [], `classes with no styling rules: ${unknown.join(", ")}`);
});

check("every class the control components emit exists in the stylesheet", () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");
	const html = [
		render(
			h(
				Lib.Toolbar,
				{ label: "T" },
				h(Lib.ToolbarButton, { icon: h("span", null, "*") }, "New"),
				h(Lib.ToolbarButton, { defaultPressed: true }, "Bold"),
				h(Lib.ToolbarSeparator),
				h(Lib.ToolbarSpacer),
			),
		),
		render(
			h(
				Lib.ToggleGroup,
				{ label: "G", defaultValue: "a", vertical: true },
				h(Lib.ToggleGroupItem, { value: "a" }, "A"),
			),
		),
		render(
			h(Lib.ComboBox, {
				defaultOpen: true,
				inline: true,
				emptyMessage: "none",
				options: [{ value: "a", label: "A" }],
			}),
		),
		render(
			h(
				Lib.Field,
				{ label: "L", description: "d", error: "e", required: true },
				h(Lib.ComboBox, { options: [] }),
			),
		),
		render(
			h(Lib.TableView, {
				sortable: true,
				defaultSortKey: "a",
				pageSize: 1,
				columns: [{ key: "a", header: "A" }],
				data: [{ a: "x" }, { a: "y" }],
			}),
		),
	].join("");

	const classes = new Set();
	for (const match of html.matchAll(/class="([^"]*)"/g)) {
		for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
	}
	const unknown = [...classes].filter((name) => !css.includes(`.${name}`));
	assert.deepEqual(unknown, [], `classes with no styling rules: ${unknown.join(", ")}`);
});

check("every class the overlay components emit exists in the stylesheet", () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");

	const html = [
		render(
			h(Lib.DropdownMenu, {
				trigger: h(Lib.Button, null, "File"),
				defaultOpen: true,
				inline: true,
				items: [
					{ label: "New", shortcut: "Ctrl+N", icon: h("span", null, "!") },
					{ label: "Open", disabled: true },
					{ type: "separator" },
					{ type: "label", label: "Recent" },
					{ type: "checkbox", label: "Word wrap", checked: true },
					{ type: "radio", label: "Left", value: "left", checked: true },
					{ type: "submenu", label: "Send to", items: [{ label: "Desktop" }] },
				],
			}),
		),
		render(
			h(Lib.Dialog, {
				defaultOpen: true,
				inline: true,
				title: "Delete file",
				footer: h(Lib.Button, null, "OK"),
				children: "text",
			}),
		),
		render(
			h(Lib.MessageBox, {
				defaultOpen: true,
				inline: true,
				icon: "warning",
				buttons: ["retry", "cancel"],
				children: "text",
			}),
		),
		render(
			h(Lib.Tooltip, {
				open: true,
				inline: true,
				content: "tip",
				children: h(Lib.Button, null, "x"),
			}),
		),
		render(
			h(Lib.Popover, {
				defaultOpen: true,
				inline: true,
				trigger: h(Lib.Button, null, "x"),
				children: "text",
			}),
		),
		render(
			h(Lib.ContextMenu, {
				items: [{ label: "Rename" }],
				inline: true,
				children: h("div", null, "area"),
			}),
		),
		render(h(Lib.MenuBar, { items: [{ label: "File", items: [{ label: "New" }] }] })),
	].join("");

	const classes = new Set();
	for (const match of html.matchAll(/class="([^"]*)"/g)) {
		for (const name of match[1].split(/\s+/)) if (name) classes.add(name);
	}
	const unknown = [...classes].filter((name) => !css.includes(`.${name}`));
	assert.deepEqual(unknown, [], `classes with no styling rules: ${unknown.join(", ")}`);
});

// ------------------------------------------------------- toolbar & toggles
check("Toolbar renders a toolbar of flat, toggleable buttons", () => {
	const html = render(
		h(
			Lib.Toolbar,
			{ label: "Standard" },
			h(Lib.ToolbarButton, { onClick: () => {} }, "New"),
			h(Lib.ToolbarSeparator),
			h(Lib.ToolbarButton, { defaultPressed: true }, "Bold"),
			h(Lib.ToolbarSpacer),
			h(Lib.ToolbarButton, { disabled: true }, "Help"),
		),
	);
	has(html, 'role="toolbar"', "toolbar role");
	has(html, 'aria-orientation="horizontal"', "orientation");
	has(html, 'aria-label="Standard"', "accessible name");
	assert.equal(
		(html.match(/class="toolbar-button"/g) || []).length,
		2,
		"two plain command buttons",
	);
	has(html, 'class="toolbar-button force-active"', "pressed button class");
	has(html, 'aria-pressed="true"', "pressed state");
	has(html, 'class="toolbar-separator"', "separator");
	has(html, 'class="toolbar-spacer"', "spacer");
	has(html, "disabled", "disabled button");
});

check("ToolbarButton is only a toggle when it has toggle state", () => {
	lacks(render(h(Lib.ToolbarButton, null, "Save")), "aria-pressed", "command button");
	has(
		render(h(Lib.ToolbarButton, { defaultPressed: true }, "Bold")),
		'aria-pressed="true"',
		"toggle",
	);
	has(
		render(h(Lib.ToolbarButton, { onPressedChange: () => {} }, "Bold")),
		'aria-pressed="false"',
		"a button that can report state is a toggle",
	);
});

check("ToggleButton and ToggleGroup expose aria-pressed", () => {
	const single = render(
		h(
			Lib.ToggleGroup,
			{ label: "Alignment", defaultValue: "left" },
			h(Lib.ToggleGroupItem, { value: "left" }, "Left"),
			h(Lib.ToggleGroupItem, { value: "center" }, "Center"),
			h(Lib.ToggleGroupItem, { value: "right", disabled: true }, "Right"),
		),
	);
	has(single, 'role="group"', "group role");
	has(single, 'aria-label="Alignment"', "group label");
	has(single, "button-group", "grouped layout");
	assert.equal((single.match(/aria-pressed="true"/g) || []).length, 1, "one pressed item");
	assert.equal((single.match(/aria-pressed="false"/g) || []).length, 2, "the rest are unpressed");
	assert.equal((single.match(/disabled/g) || []).length, 1, "one disabled item");

	const multiple = render(
		h(
			Lib.ToggleGroup,
			{ type: "multiple", defaultValue: ["bold", "italic"] },
			h(Lib.ToggleGroupItem, { value: "bold" }, "Bold"),
			h(Lib.ToggleGroupItem, { value: "italic" }, "Italic"),
			h(Lib.ToggleGroupItem, { value: "underline" }, "Underline"),
		),
	);
	assert.equal((multiple.match(/aria-pressed="true"/g) || []).length, 2, "two pressed items");

	const standalone = render(h(Lib.ToggleButton, { pressed: true }, "Bold"));
	has(standalone, 'aria-pressed="true"', "standalone toggle state");
	has(standalone, "force-active", "pressed look");
});

check("ButtonGroup lays buttons out and can stack them", () => {
	const html = render(
		h(Lib.ButtonGroup, { "aria-label": "Commands" }, h(Lib.Button, null, "OK")),
	);
	has(html, 'class="button-group"', "group class");
	has(html, 'role="group"', "group role");
	has(
		render(h(Lib.ButtonGroup, { vertical: true }, "x")),
		"button-group-vertical",
		"vertical modifier",
	);
});

// ---------------------------------------------------------------- combo box
check("ComboBox renders a combobox input and, once open, a list box", () => {
	const closed = render(
		h(Lib.ComboBox, {
			label: "Driver",
			width: 160,
			name: "driver",
			options: [
				{ value: "mysql", label: "MySQL" },
				{ value: "sql", label: "SQL Server" },
			],
		}),
	);
	has(closed, 'role="combobox"', "combobox role");
	has(closed, 'aria-expanded="false"', "collapsed to start with");
	has(closed, 'aria-autocomplete="list"', "editable box autocompletes");
	has(closed, 'class="combo-box-button"', "arrow button");
	has(closed, 'class="field-row"', "label row");
	lacks(closed, 'role="listbox"', "no list while closed");
	has(closed, 'name="driver"', "hidden input submits the value");
	const labelled = /<label for="([^"]+)"/.exec(closed)?.[1];
	has(closed, `id="${labelled}"`, "the label points at the input");

	const open = render(
		h(Lib.ComboBox, {
			defaultOpen: true,
			inline: true,
			defaultValue: "sql",
			listLabel: "Drivers",
			options: [
				{ value: "mysql", label: "MySQL" },
				{ value: "sql", label: "SQL Server" },
				{ value: "gone", label: "Gone", disabled: true },
			],
		}),
	);
	has(open, 'role="listbox"', "list box role");
	has(open, 'aria-label="Drivers"', "list box name");
	has(open, 'aria-expanded="true"', "expanded state");
	has(open, "aria-controls=", "the input owns the list");
	assert.equal((open.match(/role="option"/g) || []).length, 3, "three options");
	has(open, 'aria-selected="true"', "the selected option is marked");
	has(open, 'aria-disabled="true"', "a disabled option is marked");
	has(open, "combo-box-option-disabled", "disabled option class");
	has(open, 'value="SQL Server"', "the box shows the selected label");

	const selectOnly = render(
		h(Lib.ComboBox, { selectOnly: true, options: [{ value: "a", label: "A" }] }),
	);
	has(selectOnly, "readonly", "a select-only box is read-only");
	lacks(selectOnly, "aria-autocomplete", "no autocomplete when it cannot be typed in");
});

// ------------------------------------------------------------------- field
check("Field wires its label, hint and error into the control", () => {
	const html = render(
		h(
			Lib.Field,
			{
				label: "Occupation",
				description: "As printed on your tax return",
				error: "Required",
				required: true,
			},
			h(Lib.TextBox, { width: 200 }),
		),
	);
	has(html, 'class="field"', "field wrapper");
	has(html, 'class="field-label"', "label");
	has(html, "field-required", "required marker");
	has(html, 'class="field-description"', "description");
	has(html, 'class="field-error"', "error");
	has(html, 'aria-invalid="true"', "control marked invalid");
	has(html, 'aria-required="true"', "control marked required");
	has(html, "invalid", "invalid styling hook");

	const controlId = /<label class="field-label" for="([^"]+)"/.exec(html)?.[1];
	has(html, `id="${controlId}"`, "the label points at the control");
	assert.equal((html.match(/<label/g) || []).length, 1, "the control drops its own label");

	const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1] ?? "";
	assert.equal(describedBy.split(" ").length, 2, "described by the hint and the error");
	for (const id of describedBy.split(" ")) has(html, `id="${id}"`, `description target ${id}`);

	const clean = render(
		h(
			Lib.Field,
			{ label: "Port" },
			h(Lib.Select, { options: [{ label: "COM1", value: "1" }] }),
		),
	);
	lacks(clean, "aria-invalid", "no error, no invalid state");
	lacks(clean, "field-row", "no nested label row");
	assert.equal((clean.match(/<label/g) || []).length, 1, "one label only");

	const combo = render(
		h(Lib.Field, { label: "Driver", error: "Pick one" }, h(Lib.ComboBox, { options: [] })),
	);
	has(combo, 'class="combo-box invalid"', "the combo box inherits the invalid state");
	has(combo, 'aria-describedby="', "and the described-by wiring");
});

// -------------------------------------------------------------- pagination
check("Pagination renders four buttons and a status readout", () => {
	const html = render(h(Lib.Pagination, { page: 1, pageCount: 3 }));
	has(html, 'class="pagination"', "pager");
	has(html, 'aria-label="Pagination"', "nav label");
	assert.equal((html.match(/<button/g) || []).length, 4, "four buttons");
	has(html, 'aria-label="First page"', "first button");
	has(html, 'aria-label="Last page"', "last button");
	has(html, "Page 1 of 3", "status readout");
	assert.equal(
		(html.match(/disabled/g) || []).length,
		2,
		"first and previous are blocked on page 1",
	);

	const localised = render(
		h(Lib.Pagination, {
			page: 2,
			pageCount: 3,
			labels: { next: "Naechste" },
			renderStatus: (page, count) => `${page}/${count}`,
		}),
	);
	has(localised, "Naechste", "localised label");
	has(localised, ">2/3<", "custom readout");
	assert.equal(
		(localised.match(/disabled/g) || []).length,
		0,
		"nothing is blocked in the middle",
	);
});

// -------------------------------------------------------------- table view
check("TableView sorts through its headers", () => {
	const html = render(
		h(Lib.TableView, {
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
		}),
	);
	has(html, 'aria-sort="ascending"', "the sorted column reports its direction");
	has(html, 'class="table-sort-button"', "clickable header");
	has(html, "table-sort-arrow", "sort indicator");
	lacks(html, '<th style="text-align:right"><button', "a non-sortable column has no button");

	const body = /<tbody>(.*?)<\/tbody>/.exec(html)?.[1] ?? "";
	const names = [...body.matchAll(/<td>([^<]+)<\/td>/g)].map((match) => match[1]);
	assert.deepEqual(names, ["alpha", "Beta", "Gamma"], "rows are ordered case-insensitively");
});

check("TableView pages its rows and renders a pager", () => {
	const html = render(
		h(Lib.TableView, {
			pageSize: 2,
			page: 2,
			width: 200,
			height: 80,
			columns: [{ key: "name", header: "Name" }],
			data: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }],
		}),
	);
	has(html, 'class="table-view"', "wrapper around the panel and the pager");
	has(html, 'class="pagination"', "pager");
	has(html, "Page 2 of 3", "readout");

	const body = /<tbody>(.*?)<\/tbody>/.exec(html)?.[1] ?? "";
	assert.equal((body.match(/<tr>/g) || []).length, 2, "two rows on the second page");
	has(body, ">C<", "the third row is on page two");
	has(body, ">D<", "and so is the fourth");
	lacks(body, ">A<", "the first page is not rendered");
});

// -------------------------------------------------------- separator & keycap
check("Separator and Kbd render their contracts", () => {
	const horizontal = render(h(Lib.Separator));
	has(horizontal, 'role="separator"', "separator role");
	has(horizontal, 'aria-orientation="horizontal"', "default orientation");
	has(horizontal, "separator-horizontal", "horizontal class");

	const vertical = render(h(Lib.Separator, { orientation: "vertical" }));
	has(vertical, 'aria-orientation="vertical"', "vertical orientation");

	const decorative = render(h(Lib.Separator, { decorative: true }));
	has(decorative, 'role="presentation"', "decorative dividers leave the a11y tree");
	lacks(decorative, "aria-orientation", "and carry no orientation");

	const kbd = render(h(Lib.Kbd, null, "Ctrl"));
	has(kbd, "<kbd", "kbd element");
	has(kbd, 'class="kbd"', "keycap class");
});

// ----------------------------------------------------------------- spin box
check("SpinBox is a spinbutton with an up/down pair", () => {
	const html = render(
		h(Lib.SpinBox, { label: "Font size", min: 8, max: 72, defaultValue: 11, width: 80 }),
	);
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

	const inField = render(
		h(Lib.Field, { label: "Size", error: "Too small" }, h(Lib.SpinBox, { min: 4, width: 60 })),
	);
	has(inField, 'class="spin-box invalid"', "inherits the invalid state");
	has(inField, 'aria-describedby="', "and the described-by wiring");
	lacks(inField, "aria-required", "no aria-required without a required field");
});

// --------------------------------------------------------------- split pane
check("SplitPane renders a focusable separator between two panes", () => {
	const html = render(
		h(Lib.SplitPane, {
			defaultSize: 120,
			min: 60,
			label: "Resize",
			first: h("div", null, "left"),
			second: h("div", null, "right"),
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

	const vertical = render(h(Lib.SplitPane, { direction: "vertical", first: "a", second: "b" }));
	has(vertical, "split-pane-vertical", "vertical modifier");
	has(vertical, 'aria-orientation="horizontal"', "and a horizontal divider");
});

// ---------------------------------------------------------------- calendar
check("Calendar renders a month grid with the selection marked", () => {
	const html = render(
		h(Lib.Calendar, {
			defaultValue: "2024-02-29",
			min: "2024-02-10",
			max: "2024-02-29",
		}),
	);
	has(html, 'role="grid"', "grid role");
	has(html, "February 2024", "month heading");
	assert.equal(
		(html.match(/class="calendar-weekday"/g) || []).length,
		7,
		"seven weekday headers",
	);
	has(html, 'aria-selected="true"', "the selected day is marked");
	has(html, "calendar-day-selected", "and styled");
	has(html, 'aria-label="2024-02-29"', "days are labelled with their date");
	has(html, 'aria-label="Previous month"', "previous month button");
	has(html, 'aria-label="Next month"', "next month button");
	has(html, 'disabled="" aria-label="2024-02-09"', "a day before min is disabled");
	has(html, 'aria-label="2024-02-29"', "the last selectable day is not disabled");

	const monday = render(h(Lib.Calendar, { defaultValue: "2024-02-01", weekStartsOn: 1 }));
	assert.equal(
		/<th[^>]*>Mo<\/th>/.test(monday) &&
			/<th[^>]*>Su<\/th>/.test(monday) &&
			monday.indexOf(">Mo</th>") < monday.indexOf(">Su</th>"),
		true,
		"weeks can start on Monday",
	);

	assert.equal(Lib.toIsoDate(new Date(1998, 5, 25)), "1998-06-25", "toIsoDate");
	assert.equal(
		Lib.toIsoDate(Lib.parseIsoDate("1998-06-25")),
		"1998-06-25",
		"parseIsoDate round trip",
	);
	assert.equal(Lib.parseIsoDate("2024-02-31"), null, "impossible dates are rejected");
	assert.equal(Lib.parseIsoDate("nope"), null, "junk is rejected");
	assert.equal(Lib.parseIsoDate(""), null, "empty input is rejected");
});

// -------------------------------------------------------------- date picker
check("DatePicker shows a read-only box and a calendar pop-up", () => {
	const closed = render(
		h(Lib.DatePicker, { label: "Installed on", defaultValue: "1998-06-25", width: 140 }),
	);
	has(closed, 'class="date-picker-input"', "text box");
	has(closed, "readonly", "the box cannot be typed into");
	has(closed, 'value="1998-06-25"', "it shows the value");
	has(closed, 'class="date-picker-button"', "calendar button");
	has(closed, 'aria-label="Choose a date"', "button name");
	has(closed, 'aria-expanded="false"', "collapsed to start with");
	lacks(closed, 'role="dialog"', "no calendar while closed");

	const open = render(
		h(Lib.DatePicker, {
			defaultOpen: true,
			inline: true,
			defaultValue: "1998-06-25",
			formatValue: (iso) => iso.split("-").reverse().join("/"),
		}),
	);
	has(open, 'class="date-picker-popup"', "pop-up surface");
	has(open, 'role="dialog"', "the calendar is a dialog");
	has(open, 'class="calendar"', "with a calendar inside");
	has(open, 'value="25/06/1998"', "formatValue controls the box text");
	has(open, 'aria-expanded="true"', "expanded");
});

// -------------------------------------------------------------- balloon tip
check("BalloonTip docks in a corner and carries its icon", () => {
	const docked = render(
		h(Lib.BalloonTip, {
			defaultOpen: true,
			inline: true,
			title: "New hardware found",
			icon: "info",
			closable: true,
			children: "Installing the driver.",
		}),
	);
	has(docked, 'role="status"', "announced politely");
	has(docked, "balloon-docked", "docked variant");
	has(docked, "balloon-bottom-right", "default corner");
	has(docked, "balloon-icon-info", "icon");
	has(docked, "balloon-title", "title");
	has(docked, "balloon-text", "body");
	has(docked, "balloon-tail", "tail");
	has(docked, 'aria-label="Close"', "close button name");

	const anchored = render(
		h(Lib.BalloonTip, {
			defaultOpen: true,
			inline: true,
			anchorRef: { current: null },
			side: "top",
			announce: "alert",
			children: "Careful.",
		}),
	);
	has(anchored, 'role="alert"', "announced assertively");
	has(anchored, "balloon-anchored", "anchored variant");
	lacks(anchored, "balloon-docked", "not docked");

	assert.equal(
		render(h(Lib.BalloonTip, { children: "hidden" })),
		"",
		"a closed balloon renders nothing",
	);
});

// ------------------------------------------------------------ property sheet
check("PropertySheet is a dialog whose pages are tabs", () => {
	const html = render(
		h(Lib.PropertySheet, {
			defaultOpen: true,
			inline: true,
			title: "Display Properties",
			onApply: () => {},
			tabs: [
				{ value: "background", label: "Background", content: "wallpaper" },
				{ value: "settings", label: "Settings", content: "colours" },
				{ value: "screen", label: "Screen saver", content: "none", disabled: true },
			],
		}),
	);
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
	lacks(html, "window-body&quot;", "pages are not wrapped in window bodies");
});

// ------------------------------------------------------------------- wizard
check("Wizard walks its steps and switches Next for Finish", () => {
	const steps = [
		{ key: "welcome", title: "Welcome", content: "one" },
		{ key: "device", title: "Device", content: "two", description: "pick one" },
		{ key: "done", title: "Done", content: "three", disabled: true },
	];

	const first = render(
		h(Lib.Wizard, { defaultOpen: true, inline: true, title: "Add Hardware", steps }),
	);
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

	const last = render(
		h(Lib.Wizard, {
			defaultOpen: true,
			inline: true,
			title: "Add Hardware",
			steps,
			defaultStep: 2,
		}),
	);
	has(last, "Step 3 of 3", "readout follows the step");
	has(last, 'class="default">Finish<', "Finish on the last step");
	lacks(last, ">Next<", "no Next on the last step");
	has(last, ">three<", "the last page content");
});

// --------------------------------------------------------- badge and avatar
check("Badge tints its chip per variant", () => {
	const plain = render(h(Lib.Badge, null, "New"));
	has(plain, 'class="badge"', "default chip");
	lacks(plain, "badge-", "no variant class by default");

	for (const variant of ["info", "success", "warning", "error"]) {
		has(render(h(Lib.Badge, { variant }, "Status")), `badge-${variant}`, `${variant} tint`);
	}

	const withIcon = render(h(Lib.Badge, { icon: h("span", null, "!") }, "3 errors"));
	has(withIcon, "badge-icon", "icon slot");
	has(withIcon, 'aria-hidden="true"', "the icon is decorative");
	has(withIcon, "3 errors", "label");
});

check("Avatar falls back to initials and honours its size", () => {
	const initials = render(h(Lib.Avatar, { fallback: "MO" }));
	has(initials, 'class="avatar"', "avatar box");
	has(initials, "avatar-fallback", "fallback slot");
	has(initials, "--avatar-size:32px", "default size");
	lacks(initials, "<img", "no image without a src");

	const image = render(
		h(Lib.Avatar, { src: "/me.png", alt: "Meorion", size: 48, shape: "circle" }),
	);
	has(image, 'class="avatar-image"', "image element");
	has(image, 'src="/me.png"', "image source");
	has(image, 'alt="Meorion"', "alt text");
	has(image, "--avatar-size:48px", "explicit size");
	has(image, "avatar-circle", "circle shape");
});

// ------------------------------------------------------------------- card
check("Card composes header, content and footer", () => {
	const html = render(
		h(
			Lib.Card,
			{ style: { width: 240 } },
			h(
				Lib.CardHeader,
				null,
				h(Lib.CardTitle, null, "Modem"),
				h(Lib.CardDescription, null, "Standard 56k modem"),
			),
			h(Lib.CardContent, null, "Connected at 33.6 kbps."),
			h(Lib.CardFooter, null, h(Lib.Button, null, "Properties")),
		),
	);
	has(html, 'class="card"', "card frame");
	has(html, 'class="card-header"', "header");
	has(html, '<h3 class="card-title">Modem</h3>', "default title element");
	has(html, 'class="card-description"', "description");
	has(html, 'class="card-content"', "content");
	has(html, 'class="card-footer"', "footer");
	has(html, "Connected at 33.6 kbps.", "content text");

	has(
		render(h(Lib.CardTitle, { as: "h2" }, "Title")),
		'<h2 class="card-title">',
		"title level can be overridden",
	);
});

// ------------------------------------------------------------- typography
check("Heading, Text and Prose carry the UI type scale", () => {
	for (const level of [1, 2, 3, 4]) {
		const html = render(h(Lib.Heading, { level }, "Title"));
		has(html, `<h${level} class="heading heading-${level}">`, `h${level} with its class`);
	}
	has(render(h(Lib.Heading, null, "Title")), "<h2", "defaults to level 2");

	has(render(h(Lib.Text, null, "Body")), '<p class="text text-body">', "paragraph by default");
	has(render(h(Lib.Text, { variant: "lead" }, "Lead")), "text-lead", "lead variant");
	has(render(h(Lib.Text, { variant: "muted" }, "Muted")), "text-muted", "muted variant");
	has(render(h(Lib.Text, { variant: "small" }, "Small")), "text-small", "small variant");
	has(
		render(h(Lib.Text, { as: "span" }, "Inline")),
		'<span class="text text-body">',
		"element override",
	);

	const prose = render(h(Lib.Prose, null, h("p", null, "Rendered markdown")));
	has(prose, 'class="prose"', "prose wrapper");
	has(prose, "Rendered markdown", "children pass through");
});

// ------------------------------------------------------------------ empty
check("Empty stacks an icon, a title, a hint and actions", () => {
	const html = render(
		h(
			Lib.Empty,
			{
				icon: h("span", null, "?"),
				title: "This folder is empty",
				description: "Drag files here.",
				compact: true,
			},
			h(Lib.Button, null, "New folder"),
		),
	);
	has(html, 'class="empty empty-compact"', "empty state");
	has(html, 'class="empty-icon"', "icon");
	has(html, 'class="empty-title"', "title");
	has(html, 'class="empty-description"', "description");
	has(html, 'class="empty-actions"', "actions row");
	has(html, ">New folder<", "action content");

	const bare = render(h(Lib.Empty, { title: "Nothing" }));
	has(bare, 'class="empty"', "no compact class");
	lacks(bare, "empty-icon", "no icon when none is given");
});

// ---------------------------------------------------------------- spinner
check("Spinner is an announced hourglass", () => {
	const html = render(h(Lib.Spinner));
	has(html, 'role="status"', "status role");
	has(html, 'aria-label="Working…"', "default label");
	has(html, 'class="spinner spinner-default"', "default size");
	has(html, "spinner-glyph", "glyph");
	has(html, "<svg", "inline svg, so the flip is a CSS animation");

	has(render(h(Lib.Spinner, { size: "large", label: "Copying" })), "spinner-large", "named size");
	has(render(h(Lib.Spinner, { size: "small" })), "spinner-small", "small size");
	has(render(h(Lib.Spinner, { size: 24 })), "--spinner-size:24px", "pixel size");
	has(
		render(h(Lib.Spinner, { label: "Copying files" })),
		'aria-label="Copying files"',
		"custom label",
	);
});

// -------------------------------------------------------------- progress
check("ProgressIndicator animates when it has no value", () => {
	const determinate = render(h(Lib.ProgressIndicator, { value: 40 }));
	has(determinate, 'aria-valuenow="40"', "determinate value");
	lacks(determinate, "progress-indicator-indeterminate", "and no marquee class");

	const indeterminate = render(h(Lib.ProgressIndicator, { width: 200 }));
	has(indeterminate, "progress-indicator-indeterminate", "a bar without a value is a marquee");
	lacks(indeterminate, "aria-valuenow", "which omits the value attributes");
	lacks(indeterminate, "aria-valuemax", "including the maximum");
	has(indeterminate, 'role="progressbar"', "still a progressbar");
	assert.ok(
		!/<span class="progress-indicator-bar"[^>]*style=/.test(indeterminate),
		"the marquee positions the bar itself, so it carries no inline width",
	);

	const optedOut = render(h(Lib.ProgressIndicator, { indeterminate: false }));
	lacks(optedOut, "progress-indicator-indeterminate", "the marquee can be turned off");
	has(optedOut, 'aria-valuenow="0"', "and then it reports zero");

	has(
		render(h(Lib.ProgressIndicator, { value: 10, indeterminate: true })),
		"progress-indicator-indeterminate",
		"an explicit marquee wins over the value",
	);
});

// ------------------------------------------------------------- text colour
check("no rule hides text by dropping the button shadow without a colour", () => {
	/*
	 * Upstream paints every button label as `color: transparent` plus a
	 * `0 0 var(--text-color)` text-shadow — the shadow *is* the glyph. A rule
	 * that turns the shadow off and forgets to set a real colour renders
	 * invisible text, which is exactly what happened to the calendar days, the
	 * toolbar buttons and the wizard steps.
	 */
	const offenders = [];
	for (const file of ["react-extras.css", "overlays.css", "controls.css", "widgets.css"]) {
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
			if (
				rule.selector.includes("::before") &&
				fill === "currentColor" &&
				colour === undefined
			) {
				offenders.push(`${file}: ${rule.selector} (mask on a transparent colour)`);
			}
		});
	}
	assert.deepEqual(
		offenders,
		[],
		`rules that would render invisible text: ${offenders.join(" | ")}`,
	);
});

check("the progress marquee cannot escape its trough", () => {
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
check("cx filters falsy values", () => {
	assert.equal(Lib.cx("a", false, null, undefined, "b"), "a b");
	assert.equal(Lib.cx(), undefined);
});

// ---------------------------------------------------------------- generated CSS
check("generated stylesheet keeps CSS variables and inlines every icon", () => {
	const css = fs.readFileSync(path.join(HERE, "..", "dist", "style.css"), "utf8");

	assert.ok(css.includes("--dialog-blue: #000080"), "custom properties preserved");
	assert.ok(!css.includes("svg-load("), "no unresolved svg-load() calls");
	assert.ok(!css.includes("var(--color-pinkline-50));"), "variables were not pre-resolved");
	const icons = (css.match(/data:image\/svg\+xml/g) || []).length;
	assert.ok(icons >= 24, `expected >= 24 inlined icons, found ${icons}`);
	assert.ok(css.includes(".force-active"), "react helper classes bundled");
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
