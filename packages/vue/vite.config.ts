import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Pink98Vue",
			formats: ["es", "cjs"],
			fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
		},
		rollupOptions: {
			// `98-pink-shared` stays external on purpose: its layer stack is
			// process-wide state, so every layer on a page must share one copy.
			external: ["vue", "98-pink-shared"],
			output: {
				globals: {
					vue: "Vue",
					"98-pink-shared": "Pink98Shared",
				},
			},
		},
		emptyOutDir: true,
		sourcemap: true,
	},
});
