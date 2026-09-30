#!/usr/bin/env node
/**
 * Compiles single-file components without running a bundler.
 *
 * `vue-tsc` type-checks the whole project at once, which is useless while other
 * files are still being written. This helper parses and compiles only the files
 * it is given, so a template or `<script setup>` mistake shows up immediately.
 *
 * Given no arguments it compiles every component and demo SFC in the package,
 * which is what `bun run test` does.
 *
 * Usage: node scripts/check-sfc.mjs [src/components/*.vue ...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, compileScript, compileTemplate, compileStyle } from "vue/compiler-sfc";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const files =
	process.argv.length > 2
		? process.argv.slice(2)
		: ["src/**/*.vue", "demo/**/*.vue"].flatMap((pattern) =>
				fs.globSync(pattern, { cwd: ROOT }).map((file) => path.join(ROOT, file)),
			);

if (files.length === 0) {
	console.error("usage: node scripts/check-sfc.mjs <file.vue> [...]");
	process.exit(2);
}

console.log(`\nSingle-file components — ${files.length} files\n`);

let failed = 0;

for (const file of files) {
	const source = fs.readFileSync(file, "utf8");
	const id = path.basename(file);
	const problems = [];

	const { descriptor, errors } = parse(source, { filename: file });
	for (const error of errors) problems.push(`parse: ${error.message}`);

	let bindings;
	try {
		const script = compileScript(descriptor, { id, fs: { fileExists: fs.existsSync } });
		bindings = script.bindings;
	} catch (error) {
		problems.push(`script: ${error.message}`);
	}

	const template = descriptor.template;
	if (template) {
		const result = compileTemplate({
			id,
			filename: file,
			source: template.content,
			compilerOptions: { bindingMetadata: bindings },
		});
		for (const error of result.errors) {
			problems.push(`template: ${typeof error === "string" ? error : error.message}`);
		}
	}

	for (const style of descriptor.styles) {
		const result = compileStyle({ id, filename: file, source: style.content, scoped: style.scoped });
		for (const error of result.errors) {
			problems.push(`style: ${typeof error === "string" ? error : error.message}`);
		}
	}

	if (problems.length > 0) {
		failed += 1;
		console.log(`  ✗ ${file}`);
		for (const problem of problems) console.log(`      ${problem}`);
	} else {
		console.log(`  ✓ ${file}`);
	}
}

console.log(`\n${files.length - failed} compiled, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
