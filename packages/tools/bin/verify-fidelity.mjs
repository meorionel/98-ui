#!/usr/bin/env node
import { runCli } from "../src/verify-fidelity.mjs";

try {
	runCli();
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
