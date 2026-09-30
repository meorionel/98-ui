import { h, type VNodeChild } from "vue";

/** One piece of a label: plain text, or a character that must be underlined. */
export type AccessKeyPart = string | { underline: string };

/**
 * Splits a label around its accelerator key.
 *
 * The lookup is case-insensitive and uses the first occurrence only. When the
 * accelerator character does not appear in the label — a Latin accelerator on a
 * translated label such as `文件` — the character is appended in parentheses
 * instead (`文件(F)`), which is how Windows localises accelerators for
 * non-Latin scripts.
 */
export function accessKeyParts(label: string, accessKey?: string): AccessKeyPart[] {
	if (!accessKey) return [label];

	const index = label.toLowerCase().indexOf(accessKey.toLowerCase());
	if (index === -1) {
		return [label, "(", { underline: accessKey }, ")"];
	}

	return [label.slice(0, index), { underline: label[index] }, label.slice(index + 1)].filter(
		(part) => part !== "",
	) as AccessKeyPart[];
}

/**
 * Renders a label with its accelerator key wrapped in `<u>`, which is how
 * Windows 98 draws menu accelerators (e.g. `<u>F</u>ile).
 *
 * Returns an array of vnodes, so it can be dropped straight into a render
 * function or a `RenderVNode` slot. Templates normally use the `AccessKey`
 * component instead.
 */
export function renderAccessKey(label: string, accessKey?: string): VNodeChild[] {
	return accessKeyParts(label, accessKey).map((part) =>
		typeof part === "string" ? part : h("u", null, part.underline),
	);
}
