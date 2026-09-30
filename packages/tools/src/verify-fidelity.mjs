#!/usr/bin/env node
/**
 * Proves a generated port stylesheet is a *pure* transformation of the one
 * source of truth: the only difference must be `svg-load("…")` becoming an
 * inlined `url("data:image/svg+xml,…")`.
 *
 * If a selector, a declaration, a custom property or the order of any of them
 * ever drifts, this fails — so a port cannot silently lose styling, and the
 * three projects can no longer disagree about what the CSS says.
 *
 * Usage:
 *   node packages/tools/bin/verify-fidelity.mjs --port react
 *   node packages/tools/bin/verify-fidelity.mjs --all
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { CORE_STYLESHEET, PORT_NAMES, resolvePort } from "./ports.mjs";

const BANNER = /^\/\*![\s\S]*?\*\/\n/;
const SVG_LOAD = /svg-load\(\s*["'][^"']+["']\s*\)/g;
const DATA_URI = /url\(\s*"data:image\/svg\+xml;charset=utf-8,[^"]*"\s*\)/g;

/** How many `svg-load()` calls the core sheet is expected to contain. */
const EXPECTED_ICONS = 26;

const normalize = (css) =>
	css
		.replace(/\r\n/g, "\n")
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n")
		.trimEnd();

/**
 * @returns {number} the number of failed checks (0 means success).
 */
export function verifyFidelity(portName, { log = console.log } = {}) {
	const port = resolvePort(portName);
	const generatedPath = path.join(port.stylesDir, "98-pink.css");

	let failures = 0;
	function check(name, fn) {
		try {
			fn();
			log(`  ✓ ${name}`);
		} catch (error) {
			failures += 1;
			log(`  ✗ ${name}`);
			log(`      ${error.message.split("\n").slice(0, 12).join("\n      ")}`);
		}
	}

	log(`\nCSS fidelity — ${port.packageName} vs packages/css/style.css\n`);

	check("source and generated stylesheet both exist", () => {
		assert.ok(fs.existsSync(CORE_STYLESHEET), `missing ${CORE_STYLESHEET}`);
		assert.ok(fs.existsSync(generatedPath), `missing ${generatedPath}`);
	});

	if (failures > 0) return failures;

	const upstream = fs.readFileSync(CORE_STYLESHEET, "utf8");
	const generated = fs.readFileSync(generatedPath, "utf8");

	const skeletonUpstream = normalize(upstream.replace(SVG_LOAD, "__ICON__"));
	const skeletonGenerated = normalize(generated.replace(BANNER, "").replace(DATA_URI, "__ICON__"));

	const upstreamIcons = (upstream.match(SVG_LOAD) || []).length;
	const generatedIcons = (generated.match(DATA_URI) || []).length;

	check(`stylesheet is identical once icons are factored out (${upstreamIcons} icons)`, () => {
		if (skeletonUpstream === skeletonGenerated) return;

		const a = skeletonUpstream.split("\n");
		const b = skeletonGenerated.split("\n");
		const max = Math.max(a.length, b.length);
		for (let i = 0; i < max; i += 1) {
			if (a[i] !== b[i]) {
				throw new Error(
					`first difference at generated line ${i + 1}:\n` +
						`  source    : ${JSON.stringify(a[i])}\n` +
						`  generated : ${JSON.stringify(b[i])}`,
				);
			}
		}
		throw new Error("files differ only in trailing content");
	});

	check("every svg-load() call was inlined", () => {
		assert.equal(generatedIcons, upstreamIcons, "inlined icon count must match svg-load() count");
		assert.ok(!generated.includes("svg-load("), "no svg-load() left behind");
		assert.equal(upstreamIcons, EXPECTED_ICONS, "source svg-load() count changed");
	});

	check("custom properties are preserved, not pre-resolved", () => {
		assert.ok(generated.includes("--dialog-blue: #000080"), "--dialog-blue kept");
		assert.ok(generated.includes("--color-pinkline-50"), "--color-pinkline-50 kept");
		assert.ok(generated.includes("box-shadow: var(--border-raised-outer)"), "var() kept");
		// postcss-css-variables, which the upstream dist build runs, would have
		// flattened these into literal colours.
		assert.ok(!generated.includes("inset -1px -1px #3D28BC"), "not pre-resolved to literals");
	});

	check("the two font faces survive", () => {
		assert.equal((generated.match(/@font-face/g) || []).length, 2, "@font-face count");
		assert.ok(
			generated.includes('url("fonts/converted/ms_sans_serif.woff2")'),
			"woff2 font url preserved",
		);
	});

	check("the shared additive sheets are mirrored next to it", () => {
		for (const file of ["overlays.css", "controls.css", "widgets.css", "display.css"]) {
			assert.ok(
				fs.existsSync(path.join(port.stylesDir, file)),
				`missing src/styles/${file} — run the generate step first`,
			);
		}
	});

	log(failures === 0 ? `\n${port.packageName} CSS fidelity OK\n` : `\n${failures} check(s) failed\n`);
	return failures;
}

export function runCli(argv = process.argv.slice(2)) {
	const targets = argv.includes("--all")
		? PORT_NAMES
		: [argv[argv.indexOf("--port") + 1]].filter(Boolean);

	if (targets.length === 0) {
		throw new Error(`missing --port <${PORT_NAMES.join("|")}> or --all`);
	}

	const failures = targets.reduce((total, name) => total + verifyFidelity(name), 0);
	if (failures > 0) process.exit(1);
}
