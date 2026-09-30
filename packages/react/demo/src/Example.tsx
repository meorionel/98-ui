import type { ReactNode } from "react";
import { useI18n } from "./i18n";

/** Strips the common leading indentation from a template literal. */
export function dedent(value: string): string {
	const lines = value.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
	const widths = lines
		.filter((line) => line.trim() !== "")
		.map((line) => /^[\t ]*/.exec(line)?.[0].length ?? 0);
	const indent = widths.length > 0 ? Math.min(...widths) : 0;
	return lines.map((line) => line.slice(indent)).join("\n");
}

export interface ExampleProps {
	/** The live, rendered example. */
	children: ReactNode;
	/**
	 * Source shown behind "Show code".
	 *
	 * Deliberately always English: it documents the React API, so translating it
	 * would obscure prop names and identifiers.
	 */
	code: string;
	/** Optional caption above the preview. */
	caption?: ReactNode;
}

/** Live preview plus a collapsible source view — the pattern the docs use. */
export function Example({ children, code, caption }: ExampleProps) {
	const { t } = useI18n();
	return (
		<div className="example">
			{caption !== undefined && <p>{caption}</p>}
			<div className="example-preview">{children}</div>
			<details>
				<summary>{t("common.showCode")}</summary>
				<pre>
					<code>{dedent(code)}</code>
				</pre>
			</details>
		</div>
	);
}
