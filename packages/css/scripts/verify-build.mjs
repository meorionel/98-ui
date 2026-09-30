#!/usr/bin/env node
/**
 * Checks the three published stylesheet flavours after `bun run build`.
 *
 * The important invariant is the split between them:
 *  - `98-pink.css` is the legacy, minified, self-contained file (custom
 *    properties pre-resolved) that existing CDN consumers already use;
 *  - `98-pink.raw.css` keeps every `var(--token)` so the theme stays
 *    overridable, and has every `svg-load()` inlined;
 *  - `98-pink.full.css` is `raw` plus the additive component sheets.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const read = (file) => fs.readFileSync(path.join(DIST, file), "utf8");

let failures = 0;
function check(name, fn) {
	try {
		fn();
		console.log(`  ✓ ${name}`);
	} catch (error) {
		failures += 1;
		console.log(`  ✗ ${name}`);
		console.log(`      ${error.message.split("\n").slice(0, 8).join("\n      ")}`);
	}
}

console.log("\n98-pink.css build verification\n");

const legacy = read("98-pink.css");
const raw = read("98-pink.raw.css");
const full = read("98-pink.full.css");

check("all three flavours are emitted", () => {
	for (const file of ["98-pink.css", "98-pink.raw.css", "98-pink.full.css"]) {
		assert.ok(fs.existsSync(path.join(DIST, file)), `missing dist/${file}`);
	}
});

check("icons are inlined in every flavour", () => {
	for (const [name, css] of [
		["legacy", legacy],
		["raw", raw],
		["full", full],
	]) {
		assert.ok(!css.includes("svg-load("), `${name} still contains svg-load()`);
		assert.ok(css.includes("data:image/svg+xml"), `${name} has no inlined icon`);
	}
	assert.equal((raw.match(/data:image\/svg\+xml/g) || []).length, 26, "raw icon count");
});

check("only the legacy flavour pre-resolves custom properties", () => {
	assert.ok(raw.includes("--dialog-blue: #000080"), "raw keeps --dialog-blue");
	assert.ok(raw.includes("box-shadow: var(--border-raised-outer)"), "raw keeps var()");
	assert.ok(!raw.includes("inset -1px -1px #3D28BC"), "raw must not be pre-resolved");
	// cssnano + postcss-css-variables is what the published file has always run.
	assert.ok(!legacy.includes("--dialog-blue: #000080"), "legacy should be flattened");
});

check("the full flavour carries the additive component sheets", () => {
	for (const selector of [
		".toolbar",
		".menu-popup",
		".card",
		".badge",
		".avatar",
		".pagination",
		".spin-box",
	]) {
		assert.ok(full.includes(selector), `full is missing ${selector}`);
	}
	// And the core is still there underneath.
	assert.ok(full.includes(".window"), "full lost the core .window rules");
});

check("fonts are copied to the path style.css references", () => {
	for (const font of [
		"ms_sans_serif.woff",
		"ms_sans_serif.woff2",
		"ms_sans_serif_bold.woff",
		"ms_sans_serif_bold.woff2",
	]) {
		assert.ok(
			fs.existsSync(path.join(DIST, "fonts", "converted", font)),
			`missing dist/fonts/converted/${font}`,
		);
	}
	assert.ok(raw.includes('url("fonts/converted/ms_sans_serif.woff2")'), "font url rewritten");
});

check("the full flavour is the raw flavour plus the additive sheets", () => {
	assert.ok(full.startsWith(raw.trimEnd()), "full must start with raw");
	assert.ok(full.length > raw.length, "full must be longer than raw");
});

console.log(failures === 0 ? "\nCSS build OK\n" : `\n${failures} check(s) failed\n`);
if (failures > 0) process.exit(1);
