import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Pink98",
			formats: ["es", "cjs"],
			fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
		},
		rollupOptions: {
			// `98-pink-shared` stays external on purpose: its layer stack is
			// process-wide state, so every layer on a page must share one copy.
			external: ["react", "react-dom", "react/jsx-runtime", "98-pink-shared"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "jsxRuntime",
					"98-pink-shared": "Pink98Shared",
				},
			},
		},
		emptyOutDir: true,
		sourcemap: true,
	},
});
