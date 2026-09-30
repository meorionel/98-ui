import { type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";
import { Button } from "./Button";

/** English accessible names for the pager buttons. */
export const PAGINATION_LABELS = {
	first: "First page",
	previous: "Previous page",
	next: "Next page",
	last: "Last page",
} as const;

export interface PaginationLabels {
	first: string;
	previous: string;
	next: string;
	last: string;
}

export interface PaginationProps {
	/** Controlled page, 1-based. */
	page?: number;
	/** Initial page while uncontrolled. */
	defaultPage?: number;
	/** Total number of pages. */
	pageCount: number;
	onPageChange?: (page: number) => void;
	/** Localised accessible names for the four buttons. */
	labels?: Partial<PaginationLabels>;
	/** Accessible name for the `nav` element. */
	label?: string;
	/** Show the "Page 1 of 4" readout. Defaults to `true`. */
	showStatus?: boolean;
	/** Build the readout. Defaults to `Page {page} of {pageCount}`. */
	renderStatus?: (page: number, pageCount: number) => ReactNode;
	/** Disable the buttons without hiding the pager. */
	disabled?: boolean;
	className?: string;
}

/**
 * A pager: first / previous / next / last, plus a "Page 1 of 4" readout.
 *
 * ```tsx
 * <Pagination page={page} pageCount={4} onPageChange={setPage} />
 * ```
 *
 * `TableView` renders one of these under the table when it is given a
 * `pageSize`, and it can also be used on its own. The arrow glyphs are CSS masks,
 * so they take the theme colour and the pressed-button text colour.
 */
export function Pagination({
	page: pageProp,
	defaultPage = 1,
	pageCount,
	onPageChange,
	labels,
	label = "Pagination",
	showStatus = true,
	renderStatus,
	disabled = false,
	className,
}: PaginationProps) {
	const total = Math.max(1, Math.floor(pageCount));
	const [page, setPage] = useControllableState<number>({
		value: pageProp,
		defaultValue: defaultPage,
		onChange: (next) => onPageChange?.(Math.min(Math.max(1, next), total)),
	});
	const current = Math.min(Math.max(1, Math.floor(page)), total);
	const atStart = current <= 1;
	const atEnd = current >= total;

	const go = (next: number) => setPage(Math.min(Math.max(1, next), total));

	const button = (
		key: keyof PaginationLabels,
		target: number,
		blocked: boolean,
		variant: "first" | "previous" | "next" | "last",
	) => (
		<Button
			key={key}
			variant="toolbar"
			className={cx("pagination-button", `pagination-${variant}`)}
			aria-label={labels?.[key] ?? PAGINATION_LABELS[key]}
			disabled={disabled || blocked}
			onClick={() => go(target)}
		/>
	);

	return (
		<nav className={cx("pagination", className)} aria-label={label}>
			{button("first", 1, atStart, "first")}
			{button("previous", current - 1, atStart, "previous")}
			{showStatus && (
				<span className="pagination-status" aria-live="polite">
					{renderStatus ? renderStatus(current, total) : `Page ${current} of ${total}`}
				</span>
			)}
			{button("next", current + 1, atEnd, "next")}
			{button("last", total, atEnd, "last")}
		</nav>
	);
}
