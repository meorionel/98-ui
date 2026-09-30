import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Config for the documentation / playground app.
 * The demo lives in `demo/` and consumes the library straight from `src/`,
 * so component changes show up instantly via HMR.
 */
export default defineConfig({
	root: resolve(__dirname, "demo"),
	plugins: [vue()],
	resolve: {
		alias: {
			"98-pink-vue": resolve(__dirname, "src/index.ts"),
		},
	},
	server: {
		port: 5274,
		strictPort: false,
	},
	preview: {
		port: 5274,
		strictPort: false,
	},
	build: {
		outDir: resolve(__dirname, "demo-dist"),
		emptyOutDir: true,
	},
});
