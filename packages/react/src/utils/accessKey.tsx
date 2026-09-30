import type { ReactNode } from "react";

/**
 * Splits a label around its accelerator key and wraps that character in `<u>`,
 * which is how Windows 98 renders menu accelerators (e.g. `<u>F</u>ile).
 *
 * The lookup is case-insensitive and uses the first occurrence only.
 *
 * When the accelerator character does not appear in the label — a Latin
 * accelerator on a translated label such as `文件` — the character is appended
 * in parentheses instead (`文件(F)`), which is how Windows localises
 * accelerators for non-Latin scripts.
 */
export function renderAccessKey(label: string, accessKey?: string): ReactNode {
	if (!accessKey) return label;

	const index = label.toLowerCase().indexOf(accessKey.toLowerCase());
	if (index === -1) {
		return (
			<>
				{label}(<u>{accessKey}</u>)
			</>
		);
	}

	return (
		<>
			{label.slice(0, index)}
			<u>{label[index]}</u>
			{label.slice(index + 1)}
		</>
	);
}
