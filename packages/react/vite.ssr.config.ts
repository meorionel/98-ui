import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Builds the documentation app as an SSR bundle. There is no browser available
 * in every environment, so this is how the whole page gets rendered for real
 * (every section, every component) and asserted in `scripts/ssr-check.mjs`.
 */
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"98-pink-react": resolve(__dirname, "src/index.ts"),
		},
	},
	build: {
		ssr: resolve(__dirname, "demo/ssr.tsx"),
		outDir: resolve(__dirname, ".tmp/ssr"),
		emptyOutDir: true,
		minify: false,
		rollupOptions: {
			output: { entryFileNames: "ssr.mjs" },
		},
	},
});
