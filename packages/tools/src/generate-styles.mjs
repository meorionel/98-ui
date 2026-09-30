#!/usr/bin/env node
/**
 * Generates a port's stylesheet from the single source of truth.
 *
 * Why a generator instead of hand-copying?
 *  - `packages/css/style.css` uses `svg-load("./icon/*.svg")`, a
 *    postcss-inline-svg helper. It is not valid CSS on its own.
 *  - The same postcss pipeline runs here — inline-svg only, *without*
 *    postcss-css-variables — so the emitted stylesheet keeps every
 *    `var(--token)` intact. Consumers can therefore retheme the whole library by
 *    overriding custom properties, which the minified upstream dist cannot do.
 *
 * This used to be one near-identical script per port. It now lives here, and a
 * port is described by a few lines in `ports.mjs`.
 *
 * Usage:
 *   node packages/tools/bin/generate-styles.mjs --port react
 *   node packages/tools/bin/generate-styles.mjs --port vue --dist
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import {
	ADDITIVE_DIR,
	CORE_STYLESHEET,
	FONTS_DIR,
	additiveOrder,
	PORT_NAMES,
	resolvePort,
} from "./ports.mjs";

const require = createRequire(import.meta.url);
const postcss = require("postcss");
const inlineSvg = require("postcss-inline-svg");

/** The shared sheets are copied into each port so its `src/styles` is self-contained. */
const SHARED_SHEETS = ["overlays.css", "controls.css", "widgets.css", "display.css"];

function banner(port) {
	return `/*!
 * ${port.packageName} — ${port.label} of 98-pink.css
 * Generated from packages/css/style.css by packages/tools — do not edit by hand.
 *
 * 98.css  Copyright (c) 2020 Jordan Scales <thatjdanisso.cool>
 *         https://github.com/jdan/98.css/blob/main/LICENSE
 * 98-pink.css  https://github.com/meorionel/98-pink.css
 * Licensed under the MIT License.
 */
`;
}

function assertSource() {
	if (!fs.existsSync(CORE_STYLESHEET)) {
		throw new Error(
			`Could not find the core stylesheet at ${CORE_STYLESHEET}.\n` +
				`This generator expects packages/css to sit next to packages/tools.`,
		);
	}
}

/** The core sheet with every `svg-load()` inlined, custom properties untouched. */
async function inlineCore(port) {
	const input = banner(port) + fs.readFileSync(CORE_STYLESHEET, "utf8");
	const result = await postcss()
		.use(inlineSvg({ path: path.dirname(CORE_STYLESHEET) }))
		.process(input, { from: CORE_STYLESHEET });
	return result.css;
}

function copyFonts(destStylesDir) {
	const dest = path.join(destStylesDir, "fonts", "converted");
	fs.mkdirSync(dest, { recursive: true });
	for (const file of fs.readdirSync(FONTS_DIR)) {
		fs.copyFileSync(path.join(FONTS_DIR, file), path.join(dest, file));
	}
	return dest;
}

/** Mirrors the shared additive sheets into the port, so `@import` resolves locally. */
function copySharedSheets(stylesDir) {
	fs.mkdirSync(stylesDir, { recursive: true });
	for (const file of SHARED_SHEETS) {
		const from = path.join(ADDITIVE_DIR, file);
		if (!fs.existsSync(from)) throw new Error(`missing additive sheet: ${from}`);
		fs.copyFileSync(from, path.join(stylesDir, file));
	}
}

function readSheet(stylesDir, file) {
	const filePath = path.join(stylesDir, file);
	return fs.existsSync(filePath) ? `\n\n${fs.readFileSync(filePath, "utf8")}` : "";
}

export async function generateStyles({ port: portName, dist = false } = {}) {
	const port = resolvePort(portName);
	assertSource();

	const core = await inlineCore(port);

	// 1. The source tree: the demo apps and anyone importing from `src` read this.
	copySharedSheets(port.stylesDir);
	fs.writeFileSync(path.join(port.stylesDir, "98-pink.css"), core);
	const srcFonts = copyFonts(port.stylesDir);

	// 2. A barrel so `import "<port>/styles"` also works.
	const order = additiveOrder(port);
	fs.writeFileSync(
		path.join(port.stylesDir, "index.css"),
		["98-pink.css", ...order].map((file) => `@import "./${file}";`).join("\n") + "\n",
	);

	// 3. Optional dist copy, published as `<port>/style.css`. The core plus every
	//    additive sheet, so a consumer only ever needs one import.
	const written = [`src/styles/98-pink.css`, path.relative(port.root, srcFonts)];
	if (dist) {
		const css = core + order.map((file) => readSheet(port.stylesDir, file)).join("");
		const distDir = path.join(port.root, "dist");
		fs.mkdirSync(distDir, { recursive: true });
		fs.writeFileSync(path.join(distDir, "style.css"), css);
		const distFonts = copyFonts(distDir);
		written.push("dist/style.css", path.relative(port.root, distFonts));
	}

	const icons = (core.match(/data:image\/svg\+xml/g) || []).length;
	console.log(
		`✓ ${port.packageName}: ${(core.length / 1024).toFixed(1)} kB core, ${icons} inlined icons`,
	);
	for (const file of written) console.log(`   · ${file}`);
	return { port, core, written };
}

export function parseArgs(argv) {
	const dist = argv.includes("--dist");
	const index = argv.indexOf("--port");
	const port = index > -1 ? argv[index + 1] : undefined;
	if (!port) {
		throw new Error(`missing --port <${PORT_NAMES.join("|")}>`);
	}
	return { port, dist };
}

export async function runCli(argv = process.argv.slice(2)) {
	await generateStyles(parseArgs(argv));
}
