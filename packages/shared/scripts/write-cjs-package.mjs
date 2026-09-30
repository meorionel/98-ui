#!/usr/bin/env node
/**
 * Marks `dist/cjs` as CommonJS.
 *
 * The package is `"type": "module"`, so Node would otherwise parse the CJS
 * build as ESM and fail on the first `require`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CJS_DIR = path.join(ROOT, "dist", "cjs");

if (!fs.existsSync(CJS_DIR)) {
	console.error(`missing ${CJS_DIR} — run the CommonJS tsc pass first`);
	process.exit(1);
}

fs.writeFileSync(
	path.join(CJS_DIR, "package.json"),
	JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
);
console.log("✓ dist/cjs/package.json (type: commonjs)");
