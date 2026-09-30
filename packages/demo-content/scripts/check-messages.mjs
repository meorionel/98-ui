#!/usr/bin/env node
/**
 * Keeps the two dictionaries honest.
 *
 * They are typed against each other, so a missing key is already a type error —
 * but the type cannot see an empty string, a placeholder that exists in English
 * and not in Chinese, or an override that quietly wipes out its siblings. This
 * script can.
 *
 * Runs under Bun: the tables are extensionless TypeScript imports, which Node's
 * ESM resolver will not follow but Bun resolves natively.
 */
import assert from "node:assert/strict";

import { BASE_DICTIONARIES, baseEn, baseZh, flattenKeys, LOCALES, translate, withOverrides } from "../src/index.ts";

const enKeys = flattenKeys(baseEn).sort();
const zhKeys = flattenKeys(baseZh).sort();

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

/** Every `{placeholder}` in a message, sorted. */
const placeholders = (message) => (message.match(/\{(\w+)\}/g) ?? []).sort();

function at(dictionary, key) {
	return key.split(".").reduce((node, segment) => node?.[segment], dictionary);
}

console.log("\n@98-ui/demo-content\n");

check("both dictionaries exist and are non-trivial", () => {
	assert.ok(enKeys.length > 100, `only ${enKeys.length} English keys`);
	assert.ok(Object.keys(BASE_DICTIONARIES).length === 2, "expected exactly en and zh");
});

check("the two locales have exactly the same keys", () => {
	const onlyEn = enKeys.filter((key) => !zhKeys.includes(key));
	const onlyZh = zhKeys.filter((key) => !enKeys.includes(key));
	assert.deepEqual(onlyEn, [], "keys missing from zh");
	assert.deepEqual(onlyZh, [], "keys missing from en");
});

check("no message is empty", () => {
	const empty = [];
	for (const [locale, dictionary] of Object.entries(BASE_DICTIONARIES)) {
		for (const key of flattenKeys(dictionary)) {
			const value = at(dictionary, key);
			if (typeof value !== "string" || value.trim() === "") empty.push(`${locale}.${key}`);
		}
	}
	assert.deepEqual(empty, [], "empty messages");
});

check("a key and its translation use the same placeholders", () => {
	const mismatched = [];
	for (const key of enKeys) {
		const a = placeholders(at(baseEn, key)).join(",");
		const b = placeholders(at(baseZh, key)).join(",");
		if (a !== b) mismatched.push(`${key}: en({${a}}) vs zh({${b}})`);
	}
	assert.deepEqual(mismatched, [], "placeholder mismatch");
});

check("every LOCALES label resolves to a real message", () => {
	for (const { value, labelKey } of LOCALES) {
		const label = translate(BASE_DICTIONARIES, value, labelKey);
		assert.notEqual(label, labelKey, `${labelKey} fell back to its own key`);
	}
});

check("an override wins without disturbing its siblings", () => {
	const merged = withOverrides(baseEn, { app: { introA: "OVERRIDDEN" } });
	assert.equal(merged.app.introA, "OVERRIDDEN", "override was not applied");
	assert.equal(merged.app.introB, baseEn.app.introB, "a sibling was lost");
	assert.equal(merged.app.licenseHeading, baseEn.app.licenseHeading, "a sibling was lost");
	assert.equal(merged.nav, baseEn.nav, "an untouched branch should be shared");
});

check("withOverrides never mutates the base dictionary", () => {
	const before = baseEn.app.note2Title;
	withOverrides(baseEn, { app: { note2Title: "MUTATED" } });
	assert.equal(baseEn.app.note2Title, before, "the base dictionary was mutated");
});

check("withOverrides is a no-op without overrides", () => {
	assert.equal(withOverrides(baseEn, undefined), baseEn);
});

console.log(failures === 0 ? "\n@98-ui/demo-content OK\n" : `\n${failures} check(s) failed\n`);
if (failures > 0) process.exit(1);
