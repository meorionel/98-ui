#!/usr/bin/env node
import { runCli } from "../src/generate-styles.mjs";

runCli().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
