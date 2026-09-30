#!/usr/bin/env node
/**
 * Server-renders the whole documentation page — in both languages — and asserts
 * the result.
 *
 * This is the end-to-end check that stands in for a browser: it exercises every
 * section in `demo/src/sections/*`, so a broken component, a bad import or a
 * missing translation shows up as a thrown error, missing markup, or a raw
 * message key leaking into the page.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const postcss = require("postcss");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const BUNDLE = path.join(ROOT, ".tmp", "ssr", "ssr.mjs");

if (!fs.existsSync(BUNDLE)) {
	console.error(`SSR bundle missing at ${BUNDLE}\nRun: npm run build:ssr`);
	process.exit(1);
}

const { render, renderZh, messageKeys } = await import(BUNDLE);
const en = await render();
const zh = await renderZh();
const keys = messageKeys();

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

/** Assertion helper bound to one rendered page. */
const hasIn = (html) => (needle, label) =>
	assert.ok(html.includes(needle), `${label ?? needle} is missing from the rendered page`);
const has = hasIn(en);
const hasZh = hasIn(zh);

console.log(
	`\nDemo SSR render — en ${(en.length / 1024).toFixed(1)} kB, zh ${(zh.length / 1024).toFixed(1)} kB, ${keys.length} messages\n`,
);

/* ------------------------------------------------------------ structure */

check("both locales render without throwing", () => {
	assert.ok(en.length > 20000, `expected a substantial English page, got ${en.length} bytes`);
	assert.ok(zh.length > 20000, `expected a substantial Chinese page, got ${zh.length} bytes`);
});

check("every documented section has a heading", () => {
	const ids = [
		"intro",
		"install",
		"button",
		"checkbox",
		"option-button",
		"group-box",
		"text-box",
		"slider",
		"dropdown",
		"combo-box",
		"toolbar",
		"form-field",
		"badge-avatar",
		"card",
		"typography",
		"empty",
		"spinner",
		"separator",
		"spin-box",
		"date-picker",
		"split-pane",
		"balloon-tip",
		"property-sheet",
		"wizard",
		"title-bar",
		"window-contents",
		"interactive-window",
		"status-bar",
		"tree-view",
		"tabs",
		"table-view",
		"progress-indicator",
		"field-borders",
		"sunken-panel",
		"misc",
		"menus",
		"context-menu",
		"dialog",
		"tooltip-popover",
		"theming",
		"notes",
		"license",
	];
	for (const html of [en, zh]) {
		for (const id of ids) {
			assert.ok(html.includes(`id="${id}"`), `section #${id} is missing`);
		}
	}
});

check("the sidebar tree view links to every section", () => {
	has('class="tree-view"', "sidebar tree view");
	const links = (en.match(/href="#[a-z-]+"/g) || []).length;
	assert.ok(links >= 20, `expected >= 20 in-page links, found ${links}`);
});

check("window chrome rendered", () => {
	has('class="window"', "window");
	has("title-bar-text", "title bar text");
	has('class="minimize"', "minimize button");
	has('class="restore"', "restore button");
	has("title-bar inactive", "inactive title bar");
});

check("form controls rendered", () => {
	has('class="field-row"', "field row");
	has("field-row-stacked", "stacked field row");
	has('type="checkbox"', "checkbox");
	has('type="radio"', "radio");
	has('type="range"', "slider");
	has("has-box-indicator", "box indicator");
	has('class="is-vertical"', "vertical slider");
	has("<fieldset", "group box");
	has("<textarea", "textarea");
	has("<select", "select");
});

check("buttons rendered in every state", () => {
	has("force-active", "pressed button");
	has("force-focused", "focused button");
	has('class="default"', "default button");
	has("disabled", "disabled button");
});

check("windows and menu bars rendered", () => {
	has('role="menubar"', "menu bar");
	has("<u>F</u>ile", "menu accelerator");
	has('class="status-bar"', "status bar");
	has("status-bar-field", "status bar field");
});

check("tabs rendered with a selected tab and a panel", () => {
	has('role="tablist"', "tab list");
	has('role="tab"', "tab");
	has('role="tabpanel"', "tab panel");
	has('aria-selected="true"', "selected tab");
	has("multirows", "multirow tabs");
});

check("table view rendered with sunken panel and highlighted row", () => {
	has('class="sunken-panel"', "sunken panel");
	has('class="interactive"', "interactive table");
	has("highlighted", "highlighted row");
	// Sample data is intentionally not translated.
	has("MySQL ODBC 3.51 Driver", "table data");
});

check("combo boxes, toolbars, fields and sortable tables rendered", () => {
	has('role="combobox"', "combo box input");
	has("combo-box-button", "combo box arrow button");
	has("combo-box-input", "combo box text field");
	has('role="toolbar"', "toolbar");
	has("toolbar-separator", "toolbar separator");
	has("toolbar-spacer", "toolbar spacer");
	has('aria-pressed="', "toggle button state");
	has('class="button-group"', "button group");
	has('class="field"', "form field");
	has("field-description", "field hint");
	has('class="table-sort-button"', "sortable column header");
	has('aria-sort="ascending"', "sorted column state");
	has('class="pagination"', "pager");
	hasZh('aria-label="分页"', "localised pager label");
	hasZh("第 1 页，共 2 页", "localised pager readout");
});

check("widgets rendered", () => {
	has('class="separator separator-horizontal"', "horizontal separator");
	has('class="separator separator-vertical"', "vertical separator");
	has('class="kbd"', "keycap");
	has('role="spinbutton"', "spin box");
	has("spin-box-up", "spin box arrows");
	has('class="date-picker-input"', "date picker box");
	has('class="calendar-grid"', "calendar grid");
	has('class="split-pane"', "split pane");
	has('class="split-pane-divider"', "split pane divider");
	has("field-error", "field error state");
	hasZh("日", "localised calendar weekdays");
	hasZh("1998年", "localised calendar heading");
});

check("progress indicators rendered", () => {
	has('role="progressbar"', "progress bar");
	has("progress-indicator-bar", "progress bar element");
	has("progress-indicator segmented", "segmented progress bar");
	has("progress-indicator-indeterminate", "indeterminate progress bar");
});

check("display pieces rendered", () => {
	has('class="badge', "badge");
	has("badge-success", "status tint");
	has("avatar-fallback", "avatar initials");
	has('class="card"', "card");
	has("card-footer", "card footer");
	has('class="prose"', "prose block");
	has("heading-2", "heading");
	has("text-muted", "muted text");
	has('class="empty"', "empty state");
	has("empty-actions", "empty state actions");
	has('class="spinner', "spinner");
	has("spinner-glyph", "spinner glyph");
});

check("field borders, links and code blocks rendered", () => {
	has("field-border-disabled", "disabled field border");
	has("status-field-border", "status field border");
	has('class="window-body"', "window body");
	has("<pre>", "code block");
	has('href="https://github.com/meorionel/98-pink.css"', "outbound link");
});

check("theming demo rendered with inline custom properties", () => {
	has("--surface:hsl(210 60% 92%)", "overridden --surface token");
});

check("no error markers leaked into the page", () => {
	for (const html of [en, zh]) {
		assert.ok(!html.includes("NaN"), "no NaN in the markup");
		assert.ok(!html.includes("undefined"), "no literal undefined in the markup");
		assert.ok(!html.includes("[object Object]"), "no stringified objects in the markup");
	}
});

/* ------------------------------------------------------------------ i18n */

check("the language switch renders and marks the active locale", () => {
	has('class="locale-switcher"', "switcher container");
	has('class="locale-switcher-buttons"', "switcher button group");
	has('aria-pressed="true"', "pressed state on the active locale");
	has(">English<", "English label");
	has(">中文<", "Chinese label");
});

check("Chinese page actually renders Chinese chrome", () => {
	hasZh("简介", "intro nav");
	hasZh("安装", "install nav");
	hasZh("组件", "components nav");
	hasZh("移植说明", "porting notes nav");
	hasZh("显示代码", "Show code summary");
	hasZh("应用入口处导入一次样式表", "install hint");
});

check("English page still renders English chrome", () => {
	has(">Intro<", "intro nav");
	has(">Install<", "install nav");
	has(">Show code<", "Show code summary");
	has(">Language<", "language label");
});

check("translated strings replaced the English ones on the Chinese page", () => {
	for (const englishOnly of [">Show code<", ">Language<", ">Porting notes<", ">License<"]) {
		assert.ok(
			!zh.includes(englishOnly),
			`Chinese page still contains English chrome: ${englishOnly}`,
		);
	}
});

check("no message fell back to its own key in either locale", () => {
	const leaked = keys.filter((key) => en.includes(key) || zh.includes(key));
	assert.deepEqual(leaked, [], `untranslated keys rendered verbatim: ${leaked.join(", ")}`);
	assert.ok(keys.length > 100, `expected a substantial dictionary, found ${keys.length} keys`);
});

check("both locales emit the same structural headings", () => {
	const count = (html) => (html.match(/<h[234] id="/g) || []).length;
	assert.equal(count(en), count(zh), "heading count must match across locales");
});

check("the language switcher is inside the sidebar, not the main column", () => {
	const aside = en.indexOf("<aside");
	const switcher = en.indexOf('class="locale-switcher"');
	const main = en.indexOf("<main");
	assert.ok(aside > -1 && switcher > -1 && main > -1, "aside, switcher and main all present");
	assert.ok(switcher > aside && switcher < main, "switcher must sit inside <aside>");
});

check("code samples stay in English in both locales", () => {
	// The example source is intentionally not translated, so a known sample
	// string must survive on the Chinese page too.
	for (const html of [en, zh]) {
		assert.ok(html.includes("import &quot;98-pink-vue/style.css&quot;"), "import sample");
		assert.ok(html.includes("npm install 98-pink-vue"), "install sample");
	}
});

/* -------------------------------------------------------- dialog centring */

check("dialogs stay centred and nothing in the docs can knock them off", () => {
	/*
	 * The library centres a dialog with `position: fixed; inset: 0;
	 * margin: auto`. A later rule of the same specificity that sets a margin on
	 * the same element wins the cascade and drags the dialog to the top — which
	 * is exactly what happened while the docs rendered their dialogs `inline`
	 * inside `.example-preview`, under `demo.css`'s `* + *` spacing rule.
	 */
	const declarations = {};
	postcss
		.parse(fs.readFileSync(path.join(ROOT, "src", "styles", "overlays.css"), "utf8"))
		.walkRules(".dialog", (rule) => {
			rule.walkDecls((decl) => {
				declarations[decl.prop] = decl.value.trim();
			});
		});

	assert.equal(declarations.position, "fixed", "the dialog is viewport-positioned");
	assert.equal(declarations.inset, "0", "inset: 0 is what gives `margin: auto` room");
	assert.equal(declarations.margin, "auto", "auto margins centre both axes");
	assert.equal(declarations.height, "fit-content", "and the box must shrink to its content");

	const offenders = [];
	postcss
		.parse(fs.readFileSync(path.join(ROOT, "demo", "src", "demo.css"), "utf8"))
		.walkRules((rule) => {
			// Only a selector containing `*` can match a layer we did not name,
			// and `:not(…)` is the escape hatch that makes it safe.
			if (!rule.selector.includes("*") || rule.selector.includes(":not(")) return;
			rule.walkDecls(/^margin/, (decl) =>
				offenders.push(`${rule.selector} { ${decl.prop}: ${decl.value} }`),
			);
		});

	assert.deepEqual(
		offenders,
		[],
		`wildcard margin rules would reposition a fixed layer: ${offenders.join(" | ")}`,
	);
});

/* ------------------------------------------------------- class coverage */

check("every class emitted exists in the stylesheet", () => {
	const files = [
		"98-pink.css",
		"vue-extras.css",
		"overlays.css",
		"controls.css",
		"widgets.css",
		"display.css",
	];
	let stylesheet = files
		.map((file) => fs.readFileSync(path.join(ROOT, "src", "styles", file), "utf8"))
		.join("\n");
	stylesheet += fs.readFileSync(path.join(ROOT, "demo", "src", "demo.css"), "utf8");

	const classes = new Set();
	for (const html of [en, zh]) {
		for (const match of html.matchAll(/class="([^"]*)"/g)) {
			for (const name of match[1].split(/\s+/)) {
				if (name) classes.add(name);
			}
		}
	}

	const unknown = [...classes].filter((name) => !stylesheet.includes(`.${name}`));
	assert.deepEqual(unknown, [], `classes with no styling rules: ${unknown.join(", ")}`);
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length > 0) {
	for (const { name, error } of failures) {
		console.error(`FAILED: ${name}`);
		console.error(error.stack ?? error.message);
	}
	process.exit(1);
}
