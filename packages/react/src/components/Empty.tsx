import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	/** Glyph shown above the title. */
	icon?: ReactNode;
	/** Short headline, e.g. "No files found". */
	title?: ReactNode;
	/** Sentence explaining what to do next. */
	description?: ReactNode;
	/** Actions — usually a `Button` or a `ButtonGroup`. */
	children?: ReactNode;
	/** Tighter padding, for a panel inside a panel. */
	compact?: boolean;
}

/**
 * The "nothing here yet" state.
 *
 * ```tsx
 * <Empty
 *   icon={<FolderGlyph />}
 *   title="This folder is empty"
 *   description="Drag files here, or use File ▸ New."
 * >
 *   <Button>New folder</Button>
 * </Empty>
 * ```
 *
 * Centred content in the page's own colours — no stock illustration, which is
 * both cheaper and more in keeping with the rest of the library.
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
	{ icon, title, description, children, compact = false, className, ...rest },
	ref,
) {
	return (
		<div ref={ref} className={cx("empty", compact && "empty-compact", className)} {...rest}>
			{icon !== undefined && (
				<span className="empty-icon" aria-hidden="true">
					{icon}
				</span>
			)}
			{title !== undefined && <div className="empty-title">{title}</div>}
			{description !== undefined && <div className="empty-description">{description}</div>}
			{children !== undefined && <div className="empty-actions">{children}</div>}
		</div>
	);
});
