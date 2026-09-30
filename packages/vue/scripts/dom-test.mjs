#!/usr/bin/env node
/**
 * Interaction tests for the overlay layers, in a real DOM.
 *
 * Why this file exists: the SSR checks in `scripts/` render markup but never run
 * effects, so they cannot see whether a layer is *measured*, *focused* or
 * *dismissed*. A regression once shipped where every floating menu stayed
 * `visibility: hidden` until the page was scrolled — the measurement effect ran
 * before the teleport had mounted its node, found nothing, and never retried.
 * This suite drives the components the way a user does and fails when that
 * happens.
 *
 * happy-dom is only a test dependency: the library itself still ships with Vue
 * as its single peer dependency.
 *
 * Run with `npm test` (after `npm run build`).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";

/* ---------------------------------------------------------------- DOM setup */

const window = new Window({ url: "http://localhost/" });

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLDivElement = window.HTMLDivElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.MouseEvent = window.MouseEvent;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.PointerEvent = window.PointerEvent ?? window.MouseEvent;
globalThis.FocusEvent = window.FocusEvent;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.ResizeObserver =
	window.ResizeObserver ??
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Vue's runtime-dom sniffs constructors such as `SVGElement` and `MathMLElement`
// while mounting, so mirror anything happy-dom defines.
for (const key of Object.getOwnPropertyNames(window)) {
	if (key in globalThis) continue;
	try {
		globalThis[key] = window[key];
	} catch {
		/* read-only global: nothing to mirror */
	}
}

// The real stylesheet, so computed styles can be asserted and not just markup.
const stylesheet = document.createElement("style");
stylesheet.textContent = fs.readFileSync(new URL("../dist/style.css", import.meta.url), "utf8");
document.head.appendChild(stylesheet);

// Imported *after* the globals exist: Vue's runtime-dom captures `document` and
// friends when it is first evaluated.
const { createApp, h, nextTick, ref } = await import("vue");
const Lib = await import("../dist/index.js");

let passed = 0;
const failures = [];

/** Roots mounted by the current check, torn down even when it fails. */
let mounted = [];

async function check(name, fn) {
	try {
		await fn();
		passed += 1;
		console.log(`  ✓ ${name}`);
	} catch (error) {
		failures.push({ name, error });
		console.log(`  ✗ ${name}`);
		console.log(`      ${error.message.split("\n")[0]}`);
	} finally {
		// A failed check must not leave a layer behind: the next one would find
		// it in `document.body` and assert against the wrong pop-up.
		for (const teardown of mounted.reverse()) teardown();
		mounted = [];
	}
}

/**
 * Lets Vue flush its watchers, teleports and every queued animation frame.
 *
 * Focus and measurement both happen in a `requestAnimationFrame` callback, and
 * post-flush watchers run in a microtask, so a plain `await` is not enough.
 */
async function tick() {
	for (let round = 0; round < 3; round += 1) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		await nextTick();
		await new Promise((resolve) => requestAnimationFrame(() => resolve()));
		await nextTick();
	}
}

/** A string or vnode child becomes a function slot, so Vue does not warn. */
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

async function mount(component, props = {}, slots = undefined) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const app = createApp({ render: () => h(component, props, toSlots(slots)) });
	app.mount(container);

	// A teleported layer only exists after the component has re-rendered once:
	// `Portal` flips its `mounted` flag in `onMounted`, and that re-render lands
	// in the next flush. React flushed it synchronously inside `flushSync`, so
	// the original suite could assert straight after mounting.
	await tick();

	const teardown = () => {
		app.unmount();
		container.remove();
	};
	mounted.push(teardown);
	return {
		container,
		app,
		unmount: () => {
			mounted = mounted.filter((entry) => entry !== teardown);
			teardown();
		},
	};
}

/** Clicks and flushes the resulting render. */
async function click(target, init = {}) {
	target.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, ...init }));
	await nextTick();
}

/** Presses a mouse button — `MenuBar` captions open on press, as in Windows 98. */
async function mouseDown(target) {
	target.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true, cancelable: true }));
	await nextTick();
}

/** Right-clicks / opens a context menu at a viewport point. */
async function contextMenu(target, { clientX = 0, clientY = 0 } = {}) {
	target.dispatchEvent(
		new window.MouseEvent("contextmenu", {
			bubbles: true,
			cancelable: true,
			clientX,
			clientY,
		}),
	);
	await nextTick();
}

async function press(key, target = document.activeElement ?? document.body) {
	target.dispatchEvent(
		new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
	);
	await nextTick();
}

async function pointerDownOutside() {
	document.body.dispatchEvent(
		new window.MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
	);
	await nextTick();
}

/** Simulates a native focus/blur pair on an element. */
async function focusOn(target) {
	target.dispatchEvent(new window.FocusEvent("focus", { bubbles: false }));
	await nextTick();
}
async function blurFrom(target) {
	target.dispatchEvent(new window.FocusEvent("blur", { bubbles: false }));
	await nextTick();
}

/** Types into an input the way the browser (and `v-model`) reports it. */
async function type(input, value) {
	input.value = value;
	input.dispatchEvent(new window.Event("input", { bubbles: true }));
	await nextTick();
}

const popup = () => document.body.querySelector(".menu-popup");
const dialog = () => document.body.querySelector(".dialog");
const styleOf = (element) => element.getAttribute("style") ?? "";
const isPositioned = (element) =>
	!/visibility:\s*hidden/.test(styleOf(element)) && /position:\s*fixed/.test(styleOf(element));

console.log("\nOverlay interaction tests (happy-dom)\n");

/* ------------------------------------------------------------------- menus */

await check("DropdownMenu shows its menu on click, with no scroll needed", async () => {
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{ items: [{ label: "New" }, { label: "Open" }] },
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);

	const trigger = container.querySelector("button");
	assert.equal(trigger.getAttribute("aria-expanded"), "false", "closed to start with");
	assert.equal(popup(), null, "no menu while closed");

	await click(trigger);
	await tick();

	assert.equal(trigger.getAttribute("aria-expanded"), "true", "trigger reports open");
	const menu = popup();
	assert.ok(menu !== null, "the menu is in the document");
	assert.ok(isPositioned(menu), `the menu must be measured and visible, got: ${styleOf(menu)}`);
	assert.notEqual(menu.style.zIndex, "", "the menu has a z-index from the layer stack");

	assert.equal(document.activeElement?.textContent, "New", "the first item takes focus");

	unmount();
});

await check("Arrow keys walk the menu", async () => {
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{ items: [{ label: "New" }, { label: "Open" }, { label: "Exit" }] },
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);
	await click(container.querySelector("button"));
	await tick();

	await press("ArrowDown");
	assert.equal(document.activeElement?.textContent, "Open", "ArrowDown moves down");
	await press("ArrowDown");
	assert.equal(document.activeElement?.textContent, "Exit", "ArrowDown again");
	await press("ArrowDown");
	assert.equal(document.activeElement?.textContent, "New", "and wraps around");

	unmount();
});

await check("ArrowRight opens a submenu and focuses into it", async () => {
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{
			items: [
				{ label: "New" },
				{ type: "submenu", label: "Send to", items: [{ label: "Desktop" }, { label: "Mail" }] },
			],
		},
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);
	await click(container.querySelector("button"));
	await tick();

	await press("ArrowDown");
	assert.equal(document.activeElement?.textContent, "Send to", "the submenu parent is focused");

	await press("ArrowRight");
	await tick();
	assert.ok(document.body.querySelector(".menu-popup-submenu") !== null, "the submenu opened");
	assert.equal(document.activeElement?.textContent, "Desktop", "focus moved into the submenu");

	await press("ArrowLeft");
	await tick();
	assert.equal(document.body.querySelector(".menu-popup-submenu"), null, "ArrowLeft closed it");
	assert.equal(document.activeElement?.textContent, "Send to", "focus returned to the parent");

	unmount();
});

await check("clicking a menu item runs it and closes the menu", async () => {
	let ran = 0;
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{ items: [{ label: "New", onSelect: () => (ran += 1) }] },
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);
	await click(container.querySelector("button"));
	await tick();
	await click(popup().querySelector('[role="menuitem"]'));
	await tick();

	assert.equal(ran, 1, "onSelect fired once");
	assert.equal(popup(), null, "the menu closed after activation");

	unmount();
});

await check("Escape closes the menu", async () => {
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{ items: [{ label: "New" }] },
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);
	const trigger = container.querySelector("button");
	await click(trigger);
	await tick();
	assert.ok(popup() !== null, "open");

	await press("Escape");
	assert.equal(popup(), null, "Escape dismissed the menu");
	assert.equal(trigger.getAttribute("aria-expanded"), "false", "the trigger reports closed");

	unmount();
});

await check("a pointer press outside closes the menu", async () => {
	const { container, unmount } = await mount(
		Lib.DropdownMenu,
		{ items: [{ label: "New" }] },
		{ trigger: () => h(Lib.Button, null, { default: () => "File" }) },
	);
	await click(container.querySelector("button"));
	await tick();
	assert.ok(popup() !== null, "open");

	await pointerDownOutside();
	assert.equal(popup(), null, "an outside press dismissed the menu");

	unmount();
});

await check("MenuBar opens its drop-down on the caption", async () => {
	const { container, unmount } = await mount(Lib.MenuBar, {
		items: [
			{ label: "File", accessKey: "F", items: [{ label: "New" }] },
			{ label: "Edit", accessKey: "E" },
		],
	});
	const caption = container.querySelector('[role="menuitem"]');
	await mouseDown(caption);
	await tick();

	assert.ok(popup() !== null, "the menu opened");
	assert.equal(caption.getAttribute("aria-expanded"), "true", "the caption reports open");
	assert.equal(document.activeElement?.textContent, "New", "the first entry takes focus");

	await press("ArrowRight");
	await tick();
	assert.equal(popup(), null, "ArrowRight moved off a caption with no menu and closed it");

	unmount();
});

/* ------------------------------------------------------------ context menu */

await check("ContextMenu opens at the pointer", async () => {
	const { container, unmount } = await mount(
		Lib.ContextMenu,
		{ items: [{ label: "Rename" }, { label: "Delete" }] },
		{ default: () => h("div", null, "area") },
	);

	assert.equal(popup(), null, "no menu before a right-click");
	await contextMenu(container.querySelector(".context-menu-area"), { clientX: 40, clientY: 60 });
	await tick();

	const menu = popup();
	assert.ok(menu !== null, "the context menu opened");
	assert.ok(isPositioned(menu), `measured and visible, got: ${styleOf(menu)}`);
	// A menu opens *below* the pointer, hence the 4px offset.
	assert.match(styleOf(menu), /top:\s*64px/, `anchored below the pointer's y: ${styleOf(menu)}`);
	assert.match(styleOf(menu), /left:\s*40px/, `anchored at the pointer's x: ${styleOf(menu)}`);

	unmount();
});

/* ------------------------------------------------------------------ dialog */

await check("Dialog traps focus on its default button when it opens", async () => {
	const { unmount } = await mount(
		Lib.Dialog,
		{ defaultOpen: true, title: "Delete file" },
		{
			default: () => h("p", null, "Sure?"),
			footer: () => [
				h(Lib.Button, { variant: "default" }, { default: () => "OK" }),
				h(Lib.Button, null, { default: () => "Cancel" }),
			],
		},
	);

	const surface = dialog();
	assert.ok(surface !== null, "the dialog rendered through the teleport");

	await tick();
	assert.equal(document.activeElement?.textContent, "OK", "the default button has focus");

	unmount();
});

await check("Escape closes a dialog, and Tab stays inside it", async () => {
	const { unmount } = await mount(
		Lib.Dialog,
		{ defaultOpen: true, title: "Delete file" },
		{ default: () => h("p", null, "Sure?") },
	);
	const surface = dialog();
	await tick();
	assert.equal(document.activeElement, surface.querySelector(".close"), "its only control");

	await press("Tab", document.activeElement);
	assert.ok(surface.contains(document.activeElement), "Tab stayed inside the dialog");

	await press("Escape");
	assert.equal(dialog(), null, "Escape closed it");

	unmount();
});

await check("layers stack: Escape closes the menu, not the dialog under it", async () => {
	const { unmount } = await mount(
		Lib.Dialog,
		{ defaultOpen: true, title: "Delete file" },
		{
			default: () =>
				h(
					Lib.DropdownMenu,
					{ items: [{ label: "New" }] },
					{ trigger: () => h(Lib.Button, null, { default: () => "Options" }) },
				),
		},
	);
	const surface = dialog();
	assert.ok(surface !== null, "the dialog is open");

	// The dialog's own title bar close button is a <button> too, so match on the label.
	const trigger = [...surface.querySelectorAll("button")].find(
		(button) => button.textContent === "Options",
	);
	assert.ok(trigger !== undefined, "found the menu trigger inside the dialog");
	await click(trigger);
	await tick();
	assert.ok(popup() !== null, "the menu opened on top of the dialog");

	await press("Escape");
	assert.equal(popup(), null, "Escape closed the menu");
	assert.ok(dialog() !== null, "the dialog underneath is still open");

	await press("Escape");
	assert.equal(dialog(), null, "a second Escape closes the dialog");

	unmount();
});

await check("MessageBox reports its result and closes itself", async () => {
	const results = [];
	const { unmount } = await mount(Lib.MessageBox, {
		defaultOpen: true,
		title: "Confirm file delete",
		icon: "warning",
		buttons: ["yes", "no", "cancel"],
		defaultButton: "no",
		onResult: (result) => results.push(result),
	});
	await tick();

	const buttons = [...dialog().querySelectorAll(".dialog-buttons button")];
	assert.deepEqual(
		buttons.map((button) => button.textContent),
		["Yes", "No", "Cancel"],
		"buttons render in order",
	);

	await click(buttons[1]);
	await tick();
	assert.deepEqual(results, ["no"], "onResult received the pressed button");
	assert.equal(dialog(), null, "the box closed itself");

	unmount();
});

/* --------------------------------------------------- tooltip and popover */

await check("Tooltip appears on focus without any scroll", async () => {
	const { container, unmount } = await mount(
		Lib.Tooltip,
		{ content: "Sends the file to the Recycle Bin" },
		{ default: () => h(Lib.Button, null, { default: () => "Delete" }) },
	);
	const button = container.querySelector("button");
	assert.equal(document.body.querySelector(".tooltip"), null, "hidden to start with");

	await focusOn(button);
	await tick();

	const tooltip = document.body.querySelector(".tooltip");
	assert.ok(tooltip !== null, "the tooltip mounted on focus");
	assert.ok(isPositioned(tooltip), `measured and visible, got: ${styleOf(tooltip)}`);

	unmount();
});

await check("Popover opens on click and closes on Escape", async () => {
	const { container, unmount } = await mount(
		Lib.Popover,
		{ label: "File details" },
		{
			trigger: () => h(Lib.Button, null, { default: () => "Details" }),
			default: () => h("p", null, "Content"),
		},
	);

	const trigger = container.querySelector("button");
	await click(trigger);
	await tick();

	const surface = document.body.querySelector(".popover");
	assert.ok(surface !== null, "the popover opened");
	assert.ok(isPositioned(surface), `measured and visible, got: ${styleOf(surface)}`);
	assert.equal(trigger.getAttribute("aria-expanded"), "true", "the trigger reports open");

	await press("Escape");
	assert.equal(document.body.querySelector(".popover"), null, "Escape closed it");
	assert.equal(trigger.getAttribute("aria-expanded"), "false", "the trigger reports closed");

	unmount();
});

/* ------------------------------------------------------------ text colour */

/**
 * Upstream paints button labels as a transparent colour plus a `0 0`
 * text-shadow, so a label is visible when *either* one is set. A rule that
 * drops the shadow without restoring a colour renders invisible text — which is
 * how the calendar days came out white-on-white.
 */
function paintsText(element) {
	const computed = window.getComputedStyle(element);
	const colour = computed.getPropertyValue("color").trim();
	const shadow = computed.getPropertyValue("text-shadow").trim();
	const invisible = colour === "transparent" || /rgba?\([^)]*,\s*0\)$/.test(colour);
	return !invisible || (shadow !== "" && shadow !== "none");
}

await check("button labels stay visible under the upstream shadow trick", async () => {
	const { container, unmount } = await mount(
		"div",
		{},
		{
			default: () => [
				h(Lib.Calendar, { defaultValue: "2024-02-29" }),
				h(Lib.Toolbar, { label: "Toolbar" }, { default: () => h(Lib.ToolbarButton, null, { default: () => "New" }) }),
				h(Lib.Wizard, {
					defaultOpen: true,
					title: "Wizard",
					steps: [{ key: "a", title: "Welcome", content: "x" }],
				}),
			],
		},
	);
	await tick();

	const plainDay = container.querySelector('[aria-label="2024-02-14"]');
	const selectedDay = container.querySelector('[aria-label="2024-02-29"]');
	const toolbarButton = container.querySelector(".toolbar-button");
	const wizardStep = document.body.querySelector(".wizard-step");

	assert.ok(paintsText(plainDay), "an unselected calendar day is painted");
	assert.ok(paintsText(selectedDay), "a selected calendar day is painted");
	assert.ok(paintsText(toolbarButton), "a toolbar label is painted");
	assert.ok(paintsText(wizardStep), "a wizard step is painted");
	// happy-dom reports the declared token, so compare "not transparent" rather
	// than a specific serialisation.
	const selectedFill = window
		.getComputedStyle(selectedDay)
		.getPropertyValue("background-color")
		.trim();
	assert.ok(
		selectedFill !== "" && !/^(transparent|rgba?\([^)]*,\s*0\))$/.test(selectedFill),
		`the selected day must sit on the highlight colour, got: ${selectedFill}`,
	);

	unmount();
});

/* --------------------------------------------------------------- combo box */

const comboList = () => document.body.querySelector(".combo-box-list");
const optionLabels = () =>
	[...document.querySelectorAll(".combo-box-option")].map((node) => node.textContent);

await check("ComboBox filters as you type and selects with Enter", async () => {
	const changes = [];
	const { container, unmount } = await mount(Lib.ComboBox, {
		label: "Driver",
		onValueChange: (value) => changes.push(value),
		options: [
			{ value: "mysql", label: "MySQL ODBC" },
			{ value: "sql", label: "SQL Server" },
			{ value: "oracle", label: "Oracle" },
		],
	});
	const input = container.querySelector('input[role="combobox"]');
	const arrow = container.querySelector(".combo-box-button");

	// An editable combo box stays an editing surface: the arrow opens the list.
	await click(input);
	assert.equal(comboList(), null, "clicking the text box only starts an edit");

	await click(arrow);
	await tick();
	assert.ok(comboList() !== null, "the arrow opens the list");
	assert.ok(isPositioned(comboList()), `the list is measured: ${styleOf(comboList())}`);

	await type(input, "sql");
	await tick();
	assert.deepEqual(optionLabels(), ["SQL Server"], "typing filters the list");

	await press("Enter", input);
	await tick();
	assert.deepEqual(changes, ["sql"], "Enter chose the highlighted option");
	assert.equal(input.value, "SQL Server", "the box shows the chosen label");
	assert.equal(comboList(), null, "and the list closed");

	unmount();
});

await check("ComboBox Escape cancels the edit", async () => {
	const { container, unmount } = await mount(Lib.ComboBox, {
		defaultValue: "sql",
		options: [
			{ value: "sql", label: "SQL Server" },
			{ value: "oracle", label: "Oracle" },
		],
	});
	const input = container.querySelector('input[role="combobox"]');
	assert.equal(input.value, "SQL Server", "starts on the selected label");

	await type(input, "Ora");
	await tick();
	assert.ok(comboList() !== null, "typing opened the list");

	await press("Escape", input);
	await tick();
	assert.equal(comboList(), null, "Escape closed the list");
	assert.equal(input.value, "SQL Server", "and put the selected label back");

	unmount();
});

await check("a select-only ComboBox runs type-ahead", async () => {
	const { container, unmount } = await mount(Lib.ComboBox, {
		selectOnly: true,
		options: [
			{ value: "a", label: "Alpha" },
			{ value: "b", label: "Beta" },
		],
	});
	const input = container.querySelector('input[role="combobox"]');
	assert.equal(input.readOnly, true, "the text box cannot be edited");

	await press("b", input);
	await tick();
	assert.ok(comboList() !== null, "type-ahead opened the list");
	assert.equal(
		document.querySelector(".combo-box-option-highlighted")?.textContent,
		"Beta",
		"type-ahead jumped to Beta",
	);

	await press("Enter", input);
	await tick();
	assert.equal(input.value, "Beta", "Enter chose it");

	unmount();
});

/* ------------------------------------------------------- toggles & toolbar */

await check("ToggleButton flips its pressed state", async () => {
	const { container, unmount } = await mount(Lib.ToggleButton, {}, { default: () => "Bold" });
	const button = container.querySelector("button");

	assert.equal(button.getAttribute("aria-pressed"), "false", "starts unpressed");
	await click(button);
	assert.equal(button.getAttribute("aria-pressed"), "true", "pressed after a click");
	assert.ok(button.className.includes("force-active"), "and it looks pressed");
	await click(button);
	assert.equal(button.getAttribute("aria-pressed"), "false", "unpressed again");

	unmount();
});

await check("ToggleGroup replaces the selection in single mode", async () => {
	const { container, unmount } = await mount(
		Lib.ToggleGroup,
		{ label: "Alignment", defaultValue: "left" },
		{
			default: () => [
				h(Lib.ToggleGroupItem, { value: "left" }, { default: () => "Left" }),
				h(Lib.ToggleGroupItem, { value: "center" }, { default: () => "Center" }),
			],
		},
	);
	const [left, center] = container.querySelectorAll("button");

	assert.equal(left.getAttribute("aria-pressed"), "true", "the default is pressed");
	await click(center);
	assert.equal(center.getAttribute("aria-pressed"), "true", "the clicked item is pressed");
	assert.equal(left.getAttribute("aria-pressed"), "false", "and the previous one is not");

	unmount();
});

await check("ToggleGroup toggles items independently in multiple mode", async () => {
	const { container, unmount } = await mount(
		Lib.ToggleGroup,
		{ type: "multiple", defaultValue: ["bold"] },
		{
			default: () => [
				h(Lib.ToggleGroupItem, { value: "bold" }, { default: () => "Bold" }),
				h(Lib.ToggleGroupItem, { value: "italic" }, { default: () => "Italic" }),
			],
		},
	);
	const [bold, italic] = container.querySelectorAll("button");

	await click(italic);
	assert.equal(bold.getAttribute("aria-pressed"), "true", "the first stays pressed");
	assert.equal(italic.getAttribute("aria-pressed"), "true", "and the second is pressed too");
	await click(bold);
	assert.equal(bold.getAttribute("aria-pressed"), "false", "clicking again releases it");
	assert.equal(italic.getAttribute("aria-pressed"), "true", "without touching the other");

	unmount();
});

await check("Toolbar buttons fire, and disabled ones stay silent", async () => {
	let clicks = 0;
	const { container, unmount } = await mount(
		Lib.Toolbar,
		{ label: "Standard" },
		{
			default: () => [
				h(Lib.ToolbarButton, { onClick: () => (clicks += 1) }, { default: () => "New" }),
				h(
					Lib.ToolbarButton,
					{ disabled: true, onClick: () => (clicks += 100) },
					{ default: () => "Help" },
				),
			],
		},
	);
	const [fresh, help] = container.querySelectorAll("button");

	await click(fresh);
	assert.equal(clicks, 1, "the command button fired");
	await click(help);
	assert.equal(clicks, 1, "the disabled button did not");

	unmount();
});

/* -------------------------------------------------------------- pagination */

await check("Pagination reports page changes and blocks its ends", async () => {
	const seen = [];
	const { container, unmount } = await mount(Lib.Pagination, {
		page: 1,
		pageCount: 3,
		onPageChange: (page) => seen.push(page),
	});
	const [first, previous, next, last] = container.querySelectorAll("button");

	assert.ok(first.disabled && previous.disabled, "the start is blocked");
	await click(next);
	await click(last);
	assert.deepEqual(seen, [2, 3], "the buttons asked for pages 2 and 3");

	unmount();

	// Uncontrolled: the readout follows the internal state.
	const uncontrolled = await mount(Lib.Pagination, { defaultPage: 1, pageCount: 3 });
	await click(uncontrolled.container.querySelectorAll("button")[2]);
	assert.ok(
		uncontrolled.container.textContent.includes("Page 2 of 3"),
		"the readout moved to page 2",
	);
	uncontrolled.unmount();
});

/* -------------------------------------------------------------- table view */

await check("TableView sorts on a header click and pages the result", async () => {
	const { container, unmount } = await mount(Lib.TableView, {
		sortable: true,
		pageSize: 2,
		width: 200,
		height: 80,
		columns: [{ key: "name", header: "Name" }],
		data: [{ name: "Gamma" }, { name: "alpha" }, { name: "Beta" }, { name: "delta" }],
	});
	const rows = () => [...container.querySelectorAll("tbody td")].map((cell) => cell.textContent);
	const header = container.querySelector(".table-sort-button");

	assert.deepEqual(rows(), ["Gamma", "alpha"], "unsorted: insertion order, first page");

	await click(header);
	assert.equal(header.closest("th").getAttribute("aria-sort"), "ascending", "sorted ascending");
	const ascending = rows();
	assert.deepEqual(ascending, ["alpha", "Beta"], "case-insensitive ascending order");

	await click(header);
	assert.equal(header.closest("th").getAttribute("aria-sort"), "descending", "reversed");
	assert.notDeepEqual(rows(), ascending, "the rows are in the opposite order");

	await click([...container.querySelectorAll(".pagination button")][2]);
	assert.ok(container.textContent.includes("Page 2 of 2"), "moved to the second page");
	assert.deepEqual(rows(), ["Beta", "alpha"], "which holds the tail of the sorted rows");

	unmount();
});

/* ------------------------------------------------------- display feedback */

await check("Avatar swaps to its fallback when the image fails", async () => {
	const { container, unmount } = await mount(Lib.Avatar, { src: "/missing.png", alt: "Meorion", fallback: "MO" });
	const avatar = container.querySelector(".avatar");
	assert.ok(avatar.querySelector(".avatar-image") !== null, "the image renders first");
	assert.equal(avatar.querySelector(".avatar-fallback"), null, "no initials yet");

	avatar.querySelector(".avatar-image").dispatchEvent(new window.Event("error", { bubbles: false }));
	await nextTick();

	assert.equal(avatar.querySelector(".avatar-image"), null, "the broken image is gone");
	assert.equal(avatar.querySelector(".avatar-fallback").textContent, "MO", "and the initials show");

	unmount();
});

await check("Spinner and an indeterminate bar are announced", async () => {
	const { container, unmount } = await mount(
		"div",
		{},
		{
			default: () => [
				h(Lib.Spinner, { label: "Copying files" }),
				h(Lib.ProgressIndicator, { width: 120 }),
			],
		},
	);

	const spinner = container.querySelector('[role="status"]');
	assert.equal(spinner.getAttribute("aria-label"), "Copying files", "the spinner says what it is doing");

	const bar = container.querySelector('[role="progressbar"]');
	assert.ok(
		bar.className.includes("progress-indicator-indeterminate"),
		"a bar without a value is indeterminate",
	);
	assert.equal(bar.getAttribute("aria-valuenow"), null, "and reports no value");
	assert.equal(
		window.getComputedStyle(bar).getPropertyValue("overflow"),
		"hidden",
		"and its trough clips the sliding block",
	);

	unmount();
});

/* --------------------------------------------------------------- spin box */

await check("SpinBox steps, clamps and reformats", async () => {
	const changes = [];
	const { container, unmount } = await mount(Lib.SpinBox, {
		min: 0,
		max: 5,
		defaultValue: 1,
		onValueChange: (value) => changes.push(value),
	});
	const input = container.querySelector('input[role="spinbutton"]');
	assert.equal(input.value, "1", "starts at the default");

	await press("ArrowUp", input);
	assert.equal(input.value, "2", "ArrowUp steps up");
	await press("End", input);
	assert.equal(input.value, "5", "End jumps to the maximum");
	await press("ArrowUp", input);
	assert.equal(input.value, "5", "and it cannot be exceeded");
	await press("Home", input);
	assert.equal(input.value, "0", "Home jumps to the minimum");
	await press("ArrowDown", input);
	assert.equal(input.value, "0", "and it cannot be undershot");

	await click(container.querySelector(".spin-box-up"));
	assert.equal(input.value, "1", "the up arrow button steps up");
	await click(container.querySelector(".spin-box-down"));
	assert.equal(input.value, "0", "the down arrow button steps down");

	// Typing out of range is clamped when the box loses focus.
	await focusOn(input);
	await type(input, "42");
	await blurFrom(input);
	await tick();
	assert.equal(input.value, "5", "out-of-range text is clamped on blur");
	assert.equal(changes.at(-1), 5, "and reported to the parent");

	unmount();
});

/* ------------------------------------------------------------- split pane */

await check("SplitPane divider moves with the keyboard", async () => {
	const { container, unmount } = await mount(
		Lib.SplitPane,
		{ defaultSize: 120, min: 60, label: "Resize" },
		{ first: () => "a", second: () => "b" },
	);
	const pane = container.querySelector(".split-pane");
	// happy-dom has no layout engine, so give the container a size to clamp against.
	pane.getBoundingClientRect = () => ({
		left: 0,
		top: 0,
		right: 300,
		bottom: 200,
		width: 300,
		height: 200,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	});

	const divider = container.querySelector(".split-pane-divider");
	divider.focus();
	await nextTick();
	assert.equal(divider.getAttribute("aria-valuenow"), "120", "the divider reports its size");

	await press("ArrowRight", divider);
	assert.equal(divider.getAttribute("aria-valuenow"), "128", "the arrow moves it");
	await press("ArrowLeft", divider);
	await press("ArrowLeft", divider);
	assert.equal(divider.getAttribute("aria-valuenow"), "112", "and back again");
	await press("Home", divider);
	assert.equal(divider.getAttribute("aria-valuenow"), "60", "Home goes to the minimum");
	await press("End", divider);
	assert.equal(divider.getAttribute("aria-valuenow"), "240", "End leaves room for the other pane");
	await press("Enter", divider);
	assert.equal(divider.getAttribute("aria-valuenow"), "120", "Enter restores the default size");

	unmount();
});

/* --------------------------------------------------------------- calendar */

await check("Calendar selects with the pointer and the keyboard", async () => {
	const changes = [];
	const { container, unmount } = await mount(Lib.Calendar, {
		defaultValue: "2024-02-10",
		onValueChange: (value) => changes.push(value),
	});
	const day = (iso) => container.querySelector(`[aria-label="${iso}"]`);

	const twelfth = day("2024-02-12");
	twelfth.focus();
	await click(twelfth);
	await tick();
	assert.deepEqual(changes, ["2024-02-12"], "clicking a day selects it");

	await press("ArrowRight", twelfth);
	await tick();
	assert.equal(
		document.activeElement.getAttribute("aria-label"),
		"2024-02-13",
		"ArrowRight moves the focus",
	);

	await press("PageDown", document.activeElement);
	await tick();
	assert.ok(container.textContent.includes("March 2024"), "PageDown shows the next month");
	assert.equal(
		document.activeElement.getAttribute("aria-label"),
		"2024-03-13",
		"and keeps the day of the month",
	);

	await press("Enter", document.activeElement);
	await tick();
	assert.equal(changes.at(-1), "2024-03-13", "Enter selects the focused day");

	unmount();
});

/* ------------------------------------------------------------ date picker */

await check("DatePicker opens a calendar and picks a day", async () => {
	const changes = [];
	const { container, unmount } = await mount(Lib.DatePicker, {
		defaultValue: "1998-06-25",
		buttonLabel: "Pick a date",
		onValueChange: (value) => changes.push(value),
	});
	const input = container.querySelector(".date-picker-input");
	assert.equal(input.value, "1998-06-25", "the box shows the value");

	await click(container.querySelector(".date-picker-button"));
	await tick();
	const datePopup = document.body.querySelector(".date-picker-popup");
	assert.ok(datePopup !== null, "the calendar opened");
	assert.ok(isPositioned(datePopup), `and is measured: ${styleOf(datePopup)}`);

	await click(datePopup.querySelector('[aria-label="1998-06-30"]'));
	await tick();
	assert.deepEqual(changes, ["1998-06-30"], "picking a day reports it");
	assert.equal(input.value, "1998-06-30", "the box follows");
	assert.equal(document.body.querySelector(".date-picker-popup"), null, "and the calendar closed");

	unmount();
});

/* ------------------------------------------------------------- balloon tip */

await check("BalloonTip docks, announces and dismisses itself", async () => {
	const { unmount } = await mount(Lib.BalloonTip, {
		defaultOpen: true,
		// Long enough to survive the mount tick above: `mount()` now has to let
		// Vue flush the teleport before the check body runs, and a 20 ms timer
		// would already have fired by then.
		autoDismiss: 400,
		title: "New hardware found",
		icon: "info",
	}, "Installing the driver.");
	await tick();
	const balloon = () => document.body.querySelector(".balloon");
	assert.ok(balloon() !== null, "it is showing");
	assert.ok(balloon().className.includes("balloon-bottom-right"), "docked in its corner");
	assert.notEqual(balloon().style.zIndex, "", "and carries a layer z-index");

	await new Promise((resolve) => setTimeout(resolve, 500));
	await tick();
	assert.equal(balloon(), null, "autoDismiss closed it");

	unmount();
});

await check("BalloonTip closes on Escape", async () => {
	const { unmount } = await mount(Lib.BalloonTip, { defaultOpen: true, title: "Bye" }, "x");
	await tick();
	assert.ok(document.body.querySelector(".balloon") !== null, "open");

	await press("Escape");
	assert.equal(document.body.querySelector(".balloon"), null, "Escape closed it");

	unmount();
});

/* ---------------------------------------------------------- property sheet */

await check("PropertySheet switches pages and closes on OK", async () => {
	let confirmed = 0;
	const { unmount } = await mount(Lib.PropertySheet, {
		defaultOpen: true,
		title: "Display Properties",
		onOk: () => (confirmed += 1),
		tabs: [
			{ value: "background", label: "Background", content: "wallpaper" },
			{ value: "settings", label: "Settings", content: "colours" },
		],
	});
	await tick();
	const page = () => document.body.querySelector(".property-page:not([hidden])");
	assert.ok(page().textContent.includes("wallpaper"), "the first page is showing");

	await click(document.body.querySelectorAll('[role="tab"]')[1]);
	await tick();
	assert.ok(page().textContent.includes("colours"), "the second page is showing");

	const okButton = [...document.body.querySelectorAll(".dialog-buttons button")].find(
		(button) => button.textContent === "OK",
	);
	await click(okButton);
	await tick();
	assert.equal(confirmed, 1, "onOk fired");
	assert.equal(document.body.querySelector(".dialog"), null, "and the sheet closed");

	unmount();
});

/* ----------------------------------------------------------------- wizard */

await check("Wizard walks its steps and finishes", async () => {
	let finished = 0;
	const { unmount } = await mount(Lib.Wizard, {
		defaultOpen: true,
		title: "Add Hardware Wizard",
		onFinish: () => (finished += 1),
		steps: [
			{ key: "welcome", title: "Welcome", content: "one" },
			{ key: "device", title: "Device", content: "two" },
		],
	});
	await tick();
	const footerButton = (text) =>
		[...document.body.querySelectorAll(".wizard-footer button")].find(
			(button) => button.textContent === text,
		);
	const status = () => document.body.querySelector(".wizard-status").textContent;

	assert.equal(status(), "Step 1 of 2", "starts on the first step");
	assert.equal(footerButton("Back").disabled, true, "Back is blocked on the first step");

	await click(footerButton("Next"));
	assert.equal(status(), "Step 2 of 2", "Next advances");
	assert.ok(document.body.textContent.includes("two"), "the second page is showing");

	await click(footerButton("Back"));
	assert.equal(status(), "Step 1 of 2", "Back returns to the first page");

	await click(footerButton("Next"));
	await click(footerButton("Finish"));
	assert.equal(finished, 1, "Finish reported");
	assert.equal(document.body.querySelector(".dialog"), null, "and the wizard closed");

	unmount();
});

/* ------------------------------------------------------------------ report */

console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length > 0) {
	for (const { name, error } of failures) {
		console.error(`FAILED: ${name}`);
		console.error(error.stack ?? error.message);
	}
}

// happy-dom keeps timers alive, so exit explicitly.
process.exit(failures.length > 0 ? 1 : 0);
