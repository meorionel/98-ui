/**
 * The two ports this workspace generates stylesheets for.
 *
 * Everything that used to be copy-pasted between `98-pink-react` and
 * `98-pink-vue` — the postcss pipeline, the additive-sheet list, the banner and
 * the fidelity check — lives here once. A port only declares what is genuinely
 * its own: its directory, its name and the one sheet that is framework-specific.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** `packages/` — the parent of `tools/`, `css/`, `react/` and `vue/`. */
export const PACKAGES_DIR = path.resolve(HERE, "..", "..");

/** The stylesheet source of truth. */
export const CSS_PACKAGE_DIR = path.join(PACKAGES_DIR, "css");
export const CORE_STYLESHEET = path.join(CSS_PACKAGE_DIR, "style.css");
export const ADDITIVE_DIR = path.join(CSS_PACKAGE_DIR, "additive");
export const FONTS_DIR = path.join(CSS_PACKAGE_DIR, "fonts", "converted");

/**
 * Additive sheets that live in `packages/css/additive`, in the order every port
 * has always concatenated them. The core stylesheet comes first.
 */
export const SHARED_ADDITIVE = ["overlays.css", "controls.css", "widgets.css", "display.css"];

export const PORTS = {
	react: {
		dir: "react",
		/** The published package name. */
		packageName: "98-pink-react",
		/** How the port is described in its banner. */
		label: "React port",
		/** The one additive sheet that is genuinely framework-specific. */
		extras: "react-extras.css",
	},
	vue: {
		dir: "vue",
		packageName: "98-pink-vue",
		label: "Vue port",
		extras: "vue-extras.css",
	},
};

export const PORT_NAMES = Object.keys(PORTS);

export function resolvePort(name) {
	const port = PORTS[name];
	if (!port) {
		throw new Error(`unknown port "${name}" — expected one of: ${PORT_NAMES.join(", ")}`);
	}
	return {
		...port,
		name,
		/** `packages/react` */
		root: path.join(PACKAGES_DIR, port.dir),
		/** `packages/react/src/styles` */
		stylesDir: path.join(PACKAGES_DIR, port.dir, "src", "styles"),
	};
}

/**
 * Every sheet a port concatenates, in order: the framework-specific extras
 * first (matching the historical output byte for byte), then the shared ones.
 */
export function additiveOrder(port) {
	return [port.extras, ...SHARED_ADDITIVE];
}
