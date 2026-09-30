import type { ReactNode } from "react";
import type { MessageKey } from "../i18n";

/** One documentation section: an anchor id, a heading key and its rendered body. */
export interface SectionDef {
	id: string;
	/** Dotted message key for the heading, resolved with `t()` when rendered. */
	titleKey: MessageKey;
	/** Heading level. Window sub-sections use `4`. */
	level: 3 | 4;
	body: ReactNode;
}

/** Wraps a section body in the `.component` two-column layout. */
export function Component({ children }: { children: ReactNode }) {
	return (
		<section className="component">
			<div className="component-body">{children}</div>
		</section>
	);
}
