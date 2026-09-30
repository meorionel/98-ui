import { defineComponent, h } from "vue";
import { accessKeyParts } from "../utils/access-key";

/**
 * Renders a label with its accelerator key underlined, the way Windows 98 draws
 * menu accelerators.
 *
 * ```vue
 * <AccessKey label="File" access-key="F" />   <!-- <u>F</u>ile -->
 * <AccessKey label="文件" access-key="F" />   <!-- 文件(<u>F</u>) -->
 * ```
 *
 * It is a render-function component rather than an SFC because the output is a
 * variable-length run of text and `<u>` nodes with no whitespace between them.
 */
export const AccessKey = defineComponent({
	name: "AccessKey",
	props: {
		label: { type: String, required: true },
		accessKey: { type: String, default: undefined },
	},
	setup(props) {
		return () =>
			accessKeyParts(props.label, props.accessKey ?? undefined).map((part) =>
				typeof part === "string" ? part : h("u", null, part.underline),
			);
	},
});
