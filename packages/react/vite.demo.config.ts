import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Config for the documentation / playground app.
 * The demo lives in `demo/` and consumes the library straight from `src/`,
 * so component changes show up instantly via HMR.
 */
export default defineConfig({
	root: resolve(__dirname, "demo"),
	plugins: [react()],
	resolve: {
		alias: {
			"98-pink-react": resolve(__dirname, "src/index.ts"),
		},
	},
	server: {
		port: 5273,
		strictPort: false,
	},
	preview: {
		port: 5273,
		strictPort: false,
	},
	build: {
		outDir: resolve(__dirname, "demo-dist"),
		emptyOutDir: true,
	},
});
