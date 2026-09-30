import {
	forwardRef,
	type AnchorHTMLAttributes,
	type HTMLAttributes,
	type LiHTMLAttributes,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";

export type TreeViewProps = HTMLAttributes<HTMLUListElement>;

/**
 * A tree view: an indented outline built from nested `<ul>` elements.
 *
 * ```tsx
 * <TreeView>
 *   <TreeViewItem>Table of Contents</TreeViewItem>
 *   <TreeViewBranch label="CSS" defaultOpen>
 *     <TreeViewItem>Selectors</TreeViewItem>
 *   </TreeViewBranch>
 * </TreeView>
 * ```
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
	{ className, ...rest },
	ref,
) {
	return <ul ref={ref} className={cx("tree-view", className)} {...rest} />;
});

export type TreeViewItemProps = LiHTMLAttributes<HTMLLIElement>;

/** A leaf row in a `TreeView`. Can hold anything, not just text. */
export const TreeViewItem = forwardRef<HTMLLIElement, TreeViewItemProps>(function TreeViewItem(
	{ className, ...rest },
	ref,
) {
	return <li ref={ref} className={cx(className)} {...rest} />;
});

export type TreeViewLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** A focusable link row, styled by `ul.tree-view a` / `a:focus`. */
export const TreeViewLink = forwardRef<HTMLAnchorElement, TreeViewLinkProps>(function TreeViewLink(
	{ className, ...rest },
	ref,
) {
	return <a ref={ref} className={cx(className)} {...rest} />;
});

export interface TreeViewBranchProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "onChange"> {
	/** The always-visible summary row. */
	label: ReactNode;
	/** Controlled expansion state. */
	open?: boolean;
	/** Initial expansion state for uncontrolled usage. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Nested `TreeViewItem` / `TreeViewBranch` elements. */
	children?: ReactNode;
}

/**
 * An expandable branch. Renders native `<details>`/`<summary>`, which is what
 * gives the `+` / `-` markers in the stylesheet for free.
 */
export const TreeViewBranch = forwardRef<HTMLLIElement, TreeViewBranchProps>(
	function TreeViewBranch(
		{ label, open, defaultOpen = false, onOpenChange, className, children, ...rest },
		ref,
	) {
		const [isOpen, setIsOpen] = useControllableState<boolean>({
			value: open,
			defaultValue: defaultOpen,
			onChange: onOpenChange,
		});

		return (
			<li ref={ref} className={cx(className)} {...rest}>
				<details open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
					<summary>{label}</summary>
					<ul>{children}</ul>
				</details>
			</li>
		);
	},
);
