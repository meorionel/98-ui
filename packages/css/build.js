#!/usr/bin/env node
/**
 * Builds every stylesheet flavour the 98-ui workspace publishes.
 *
 * This package is the single source of truth for styling: the core sheet
 * (`style.css`) plus the additive sheets in `additive/` that used to live only
 * inside the React and Vue ports. There is now exactly one place to add a rule —
 * and the CSS-only consumers get the newer components too.
 *
 * Outputs, all under `dist/`:
 *
 *  98-pink.css        legacy flavour — icons inlined, custom properties
 *                     pre-resolved, minified, fonts flattened next to it.
 *                     This is the file the npm package and the CDN have always
 *                     served, so it stays byte-compatible in spirit.
 *  98-pink.raw.css    the core sheet with icons inlined but every `var(--token)`
 *                     intact, unminified. This is the flavour a consumer can
 *                     retheme by overriding custom properties.
 *  98-pink.full.css   `98-pink.raw.css` plus the additive sheets — the complete
 *                     component stylesheet, still rethemeable.
 *  fonts/converted/   fonts at the relative path `style.css` expects, so the raw
 *                     and full flavours resolve them without rewriting urls.
 */
const dedent = require("dedent");
const ejs = require("ejs");
const fs = require("fs");
const glob = require("glob");
const hljs = require("highlight.js");
const mkdirp = require("mkdirp");
const path = require("path");
const postcss = require("postcss");

const { homepage, version } = require("./package.json");

const ROOT = __dirname;
const SRC_STYLE = path.join(ROOT, "style.css");
const ADDITIVE_DIR = path.join(ROOT, "additive");
const DIST = path.join(ROOT, "dist");

/** The additive sheets, in a stable concatenation order. */
const ADDITIVE = ["controls.css", "widgets.css", "display.css", "overlays.css"];

function readAdditive() {
	return ADDITIVE.map((name) => {
		const file = path.join(ADDITIVE_DIR, name);
		if (!fs.existsSync(file)) throw new Error(`missing additive sheet: ${file}`);
		return fs.readFileSync(file, "utf8").trimEnd();
	}).join("\n\n");
}

/** Icons inlined, everything else (including custom properties) untouched. */
function buildRaw() {
	const input = fs.readFileSync(SRC_STYLE, "utf8");
	return postcss()
		.use(require("postcss-inline-svg")({ path: ROOT }))
		.process(input, { from: SRC_STYLE });
}

/** The legacy, self-contained, minified stylesheet. */
function buildLegacy() {
	const input = `/*! 98.css v${version} - ${homepage} */\n` + fs.readFileSync(SRC_STYLE);

	return postcss()
		.use(require("postcss-inline-svg"))
		.use(require("postcss-css-variables"))
		.use(require("postcss-calc"))
		.use(require("postcss-copy")({ dest: "dist", template: "[name].[ext]" }))
		.use(require("cssnano"))
		.process(input, {
			from: "style.css",
			to: "dist/98.css",
			map: { inline: false },
		});
}

function buildCSS() {
	mkdirp.sync(DIST);

	return Promise.all([buildRaw(), buildLegacy()]).then(([raw, legacy]) => {
		fs.writeFileSync(path.join(DIST, "98-pink.css"), legacy.css);
		fs.writeFileSync(path.join(DIST, "98-pink.css.map"), legacy.map.toString());

		// `98-pink.raw.css` is the core sheet the ports generate from; keeping the
		// original relative font url means `fonts/converted/` must sit beside it.
		fs.cpSync(path.join(ROOT, "fonts"), path.join(DIST, "fonts"), { recursive: true });
		fs.writeFileSync(path.join(DIST, "98-pink.raw.css"), raw.css);
		fs.writeFileSync(
			path.join(DIST, "98-pink.full.css"),
			`${raw.css.trimEnd()}\n\n${readAdditive()}\n`,
		);

		const icons = (raw.css.match(/data:image\/svg\+xml/g) || []).length;
		console.log(`✓ dist/98-pink.css (${(legacy.css.length / 1024).toFixed(1)} kB, minified)`);
		console.log(`✓ dist/98-pink.raw.css (${icons} inlined icons, custom properties kept)`);
		console.log(`✓ dist/98-pink.full.css (+ ${ADDITIVE.length} additive sheets)`);
		console.log("✓ dist/fonts/converted/");
	});
}

function buildDocs() {
	let id = 0;
	function getNewId() {
		return ++id;
	}
	function getCurrentId() {
		return id;
	}

	const template = fs.readFileSync(path.join(ROOT, "docs/index.html.ejs"), "utf-8");
	function example(code) {
		const magicBrackets = /\[\[(.*)\]\]/g;
		const dedented = dedent(code);
		const inline = dedented.replace(magicBrackets, "$1");
		const escaped = hljs.highlight("html", dedented.replace(magicBrackets, "")).value;

		return `<div class="example">
      ${inline}
      <details>
        <summary>Show code</summary>
        <pre><code>${escaped}</code></pre>
      </details>
    </div>`;
	}

	glob("docs/*", (err, files) => {
		if (!err) {
			files.forEach((srcFile) =>
				fs.copyFileSync(srcFile, path.join(DIST, path.basename(srcFile))),
			);
		} else throw new Error("error globbing docs directory.");
	});
	fs.writeFileSync(
		path.join(DIST, "index.html"),
		ejs.render(template, { getNewId, getCurrentId, example }),
	);
}

function build() {
	buildCSS()
		.then(buildDocs)
		.catch((err) => {
			console.error(err);
			process.exitCode = 1;
		});
}

module.exports = build;

build();
