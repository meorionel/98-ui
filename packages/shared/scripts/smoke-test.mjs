#!/usr/bin/env node
/**
 * Behavioural tests for the shared core.
 *
 * These are the checks that used to be impossible to write once and had to be
 * duplicated per port. The positioning maths, the layer stack and the Tab
 * wrapping are asserted against the built output, so the package can be
 * consumed by both ports with confidence.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

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

console.log("\n98-pink-shared\n");

check("both module formats are emitted", () => {
	for (const file of ["dist/esm/index.js", "dist/esm/index.d.ts", "dist/cjs/index.js"]) {
		assert.ok(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
	}
	assert.deepEqual(
		JSON.parse(fs.readFileSync(path.join(ROOT, "dist/cjs/package.json"), "utf8")),
		{ type: "commonjs" },
		"dist/cjs must be marked CommonJS",
	);
});

const esm = await import(path.join(ROOT, "dist/esm/index.js"));

check("the CommonJS build exposes the same surface", () => {
	const cjs = require(path.join(ROOT, "dist/cjs/index.js"));
	for (const key of Object.keys(esm)) {
		assert.ok(key in cjs, `cjs is missing ${key}`);
	}
});

check("cx joins truthy values and returns undefined when empty", () => {
	assert.equal(esm.cx("window", false, "active", undefined), "window active");
	assert.equal(esm.cx(undefined, false), undefined);
	assert.equal(esm.cx(), undefined);
});

check("computeFloatingPosition centres a layer under its anchor", () => {
	// No `window` in this process, so flipping/shifting are inert and only the
	// pure alignment maths is exercised.
	const anchor = { top: 100, bottom: 120, left: 40, right: 140, width: 100, height: 20 };
	const layer = { width: 200, height: 50 };
	const position = esm.computeFloatingPosition(anchor, layer, { side: "bottom", offset: 4 });
	assert.deepEqual(position, { top: 124, left: -10, side: "bottom" });
});

check("computeFloatingPosition honours align start/end", () => {
	const anchor = { top: 100, bottom: 120, left: 40, right: 140, width: 100, height: 20 };
	const layer = { width: 200, height: 50 };
	assert.equal(esm.computeFloatingPosition(anchor, layer, { align: "start" }).left, 40);
	assert.equal(esm.computeFloatingPosition(anchor, layer, { align: "end" }).left, -60);
});

check("a context-menu point becomes a zero-sized rect", () => {
	assert.deepEqual(esm.pointToRect(12, 34), {
		top: 34,
		bottom: 34,
		left: 12,
		right: 12,
		width: 0,
		height: 0,
	});
});

check("the layer stack hands out increasing z-indices and tracks the top", () => {
	const first = esm.nextLayerZIndex();
	const second = esm.nextLayerZIndex();
	assert.ok(second > first, "later layers must stack higher");
	assert.ok(first >= esm.LAYER_BASE_Z_INDEX, "layers start above page content");

	esm.registerLayer(first);
	esm.registerLayer(second);
	assert.equal(esm.isTopLayer(second), true, "the newest layer is on top");
	assert.equal(esm.isTopLayer(first), false, "an older layer is not on top");

	esm.unregisterLayer(second);
	assert.equal(esm.isTopLayer(first), true, "closing the top layer promotes the one below");
	esm.unregisterLayer(first);
});

check("registerLayer is idempotent and unregisterLayer tolerates unknown values", () => {
	const z = esm.nextLayerZIndex();
	esm.registerLayer(z);
	esm.registerLayer(z);
	esm.unregisterLayer(z);
	assert.equal(esm.isTopLayer(z), true, "no stale entry should be left behind");
	esm.unregisterLayer(999999);
});

check("tabWrapTarget wraps at both ends and ignores outsiders", () => {
	const a = { id: "a" };
	const b = { id: "b" };
	const focusable = [a, b];
	assert.equal(esm.tabWrapTarget(focusable, b, false), a, "forward Tab wraps to the first");
	assert.equal(esm.tabWrapTarget(focusable, a, true), b, "backward Tab wraps to the last");
	assert.equal(esm.tabWrapTarget(focusable, a, false), null, "the middle is left to the browser");
	assert.equal(esm.tabWrapTarget(focusable, b, true), null, "the middle is left to the browser");
	assert.equal(esm.tabWrapTarget(focusable, { id: "outside" }, false), a, "an outsider wraps in");
	assert.equal(esm.tabWrapTarget([], a, false), null, "an empty layer has nothing to wrap to");
});

check("lockBodyScroll is a no-op without a document, and is safe to call twice", () => {
	assert.equal(typeof document, "undefined", "this test must run outside a DOM");
	const release = esm.lockBodyScroll();
	release();
	release();
});

console.log(failures === 0 ? "\n98-pink-shared OK\n" : `\n${failures} check(s) failed\n`);
if (failures > 0) process.exit(1);
