import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Builds the documentation app as an SSR bundle. There is no browser available
 * in every environment, so this is how the whole page gets rendered for real
 * (every section, every component) and asserted in `scripts/ssr-check.mjs`.
 */
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"98-pink-vue": resolve(__dirname, "src/index.ts"),
		},
	},
	build: {
		ssr: resolve(__dirname, "demo/ssr.ts"),
		outDir: resolve(__dirname, ".tmp/ssr"),
		emptyOutDir: true,
		minify: false,
		rollupOptions: {
			output: { entryFileNames: "ssr.mjs" },
		},
	},
});
