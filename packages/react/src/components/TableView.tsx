import {
	forwardRef,
	useMemo,
	type HTMLAttributes,
	type Key,
	type ReactNode,
	type TableHTMLAttributes,
	type TdHTMLAttributes,
	type ThHTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/useControllableState";
import { Pagination, type PaginationLabels } from "./Pagination";
import { SunkenPanel, type SunkenPanelProps } from "./Panel";

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
	/** Show a pointer cursor over body rows and enable row clicks. */
	interactive?: boolean;
};

/** A plain table, styled by the `table` element selectors. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
	{ interactive = false, className, ...rest },
	ref,
) {
	return <table ref={ref} className={cx(interactive && "interactive", className)} {...rest} />;
});

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
	{ className, ...rest },
	ref,
) {
	return <thead ref={ref} className={cx(className)} {...rest} />;
});

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
	{ className, ...rest },
	ref,
) {
	return <tbody ref={ref} className={cx(className)} {...rest} />;
});

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
	/** Render the row in the selected (blue) state. */
	highlighted?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
	{ highlighted = false, className, ...rest },
	ref,
) {
	return <tr ref={ref} className={cx(highlighted && "highlighted", className)} {...rest} />;
});

export type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement>;
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
	function TableHeaderCell({ className, ...rest }, ref) {
		return <th ref={ref} className={cx(className)} {...rest} />;
	},
);

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
	{ className, ...rest },
	ref,
) {
	return <td ref={ref} className={cx(className)} {...rest} />;
});

/** Sort order, matching the values `aria-sort` expects. */
export type SortDirection = "ascending" | "descending";

export interface TableSortState {
	/** Column key, or `null` when the rows are unsorted. */
	key: string | null;
	direction: SortDirection;
}

export interface TableViewColumn<T> {
	/** Stable identity for the column. */
	key: string;
	/** Header cell content. */
	header: ReactNode;
	/** Cell content. Defaults to `row[key]`. */
	render?: (row: T, rowIndex: number) => ReactNode;
	width?: number | string;
	align?: "left" | "center" | "right";
	/** This column can be sorted. Defaults to `true` when the table is `sortable`. */
	sortable?: boolean;
	/** Value used to order rows. Defaults to `row[key]`. */
	sortValue?: (row: T) => string | number | null | undefined;
	/** Full comparator for this column, used instead of `sortValue`. */
	compare?: (a: T, b: T) => number;
}

export interface TableViewProps<T> {
	columns: Array<TableViewColumn<T>>;
	data: T[];
	/** Stable key per row. Defaults to the row index. */
	getRowKey?: (row: T, index: number) => Key;
	/** Pointer cursor on body rows. Implied by `selectable`. */
	interactive?: boolean;
	/** Enable the single-row highlight selection. */
	selectable?: boolean;
	/** Controlled highlighted row key. */
	selectedKey?: Key | null;
	/** Initial highlighted row key for uncontrolled usage. */
	defaultSelectedKey?: Key | null;
	onSelect?: (row: T, key: Key) => void;

	/** Make the column headers clickable and sort `data` in place. */
	sortable?: boolean;
	/** Controlled sort column. */
	sortKey?: string | null;
	/** Initial sort column while uncontrolled. */
	defaultSortKey?: string | null;
	/** Controlled sort direction. */
	sortDirection?: SortDirection;
	/** Initial sort direction. Defaults to `"ascending"`. */
	defaultSortDirection?: SortDirection;
	onSortChange?: (sort: TableSortState) => void;

	/** Slice the rows into pages of this many rows and show a pager. */
	pageSize?: number;
	/** Controlled page, 1-based. */
	page?: number;
	/** Initial page while uncontrolled. */
	defaultPage?: number;
	onPageChange?: (page: number) => void;
	/** Keep paging the rows but hide the pager. */
	showPager?: boolean;
	/** Localised names for the pager buttons. */
	pagerLabels?: Partial<PaginationLabels>;
	/** Accessible name for the pager. */
	pagerLabel?: string;
	/** Build the "Page 1 of 4" readout. */
	renderPageStatus?: (page: number, pageCount: number) => ReactNode;

	height?: number | string;
	width?: number | string;
	className?: string;
	/** Content rendered when `data` is empty. */
	emptyMessage?: ReactNode;
	/** Extra props for the wrapping `SunkenPanel`. */
	panelProps?: SunkenPanelProps;
}

/** Orders two cell values the way a list view does: numeric when it can be. */
function defaultCompare(
	left: string | number | null | undefined,
	right: string | number | null | undefined,
): number {
	if (left === right) return 0;
	// Blank cells sink to the bottom of an ascending sort.
	if (left === null || left === undefined || left === "") return 1;
	if (right === null || right === undefined || right === "") return -1;
	if (typeof left === "number" && typeof right === "number") return left - right;
	return String(left).localeCompare(String(right), undefined, {
		numeric: true,
		sensitivity: "base",
	});
}

/**
 * A data-driven table view. Wrap it in a `.sunken-panel` (done for you) so the
 * sticky header and scrolling behave like the Windows 98 list view.
 *
 * Selection mirrors the script in the original docs: clicking a body row moves
 * the highlight to it. Add `sortable` for clickable column headers (the arrow in
 * the header is driven by `aria-sort`, so the visual and the screen-reader state
 * cannot drift apart) and `pageSize` for a pager underneath.
 *
 * ```tsx
 * <TableView
 *   selectable
 *   sortable
 *   defaultSortKey="name"
 *   pageSize={10}
 *   height={160}
 *   columns={[
 *     { key: "name", header: "Name" },
 *     { key: "size", header: "Size", align: "right", sortValue: (row) => row.bytes },
 *   ]}
 *   data={drivers}
 * />
 * ```
 */
export function TableView<T>({
	columns,
	data,
	getRowKey,
	interactive = false,
	selectable = false,
	selectedKey,
	defaultSelectedKey = null,
	onSelect,
	sortable = false,
	sortKey: sortKeyProp,
	defaultSortKey = null,
	sortDirection: sortDirectionProp,
	defaultSortDirection = "ascending",
	onSortChange,
	pageSize,
	page: pageProp,
	defaultPage = 1,
	onPageChange,
	showPager = true,
	pagerLabels,
	pagerLabel,
	renderPageStatus,
	height,
	width,
	className,
	emptyMessage,
	panelProps,
}: TableViewProps<T>) {
	const [activeKey, setActiveKey] = useControllableState<Key | null>({
		value: selectedKey,
		defaultValue: defaultSelectedKey,
	});

	const [sortKey, setSortKey] = useControllableState<string | null>({
		value: sortKeyProp,
		defaultValue: defaultSortKey,
	});
	const [sortDirection, setSortDirection] = useControllableState<SortDirection>({
		value: sortDirectionProp,
		defaultValue: defaultSortDirection,
	});

	const sortedData = useMemo(() => {
		if (!sortable || sortKey === null) return data;
		const column = columns.find((entry) => entry.key === sortKey);
		if (!column) return data;

		const compare =
			column.compare ??
			((a: T, b: T) =>
				defaultCompare(
					column.sortValue
						? column.sortValue(a)
						: ((a as Record<string, unknown>)[column.key] as string | number | null),
					column.sortValue
						? column.sortValue(b)
						: ((b as Record<string, unknown>)[column.key] as string | number | null),
				));

		const factor = sortDirection === "ascending" ? 1 : -1;
		return [...data].sort((a, b) => factor * compare(a, b));
	}, [data, columns, sortable, sortKey, sortDirection]);

	const pageCount = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
	const [page, setPage] = useControllableState<number>({
		value: pageProp,
		defaultValue: defaultPage,
		onChange: (next) => onPageChange?.(Math.min(Math.max(1, next), pageCount)),
	});
	const currentPage = Math.min(Math.max(1, page), pageCount);
	const visibleData = pageSize
		? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
		: sortedData;

	const keyOf = (row: T, index: number): Key => getRowKey?.(row, index) ?? index;

	const handleRowClick = (row: T, index: number) => {
		if (!selectable) return;
		setActiveKey(keyOf(row, index));
		onSelect?.(row, keyOf(row, index));
	};

	const handleSort = (column: TableViewColumn<T>) => {
		const nextDirection: SortDirection =
			sortKey === column.key && sortDirection === "ascending" ? "descending" : "ascending";
		setSortKey(column.key);
		setSortDirection(nextDirection);
		onSortChange?.({ key: column.key, direction: nextDirection });
	};

	const justifyContent = (align: TableViewColumn<T>["align"]) =>
		align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";

	const panel = (
		<SunkenPanel
			{...panelProps}
			style={{ height, width, ...panelProps?.style }}
			className={cx(panelProps?.className)}
		>
			<Table interactive={interactive || selectable} className={className}>
				<TableHead>
					<tr>
						{columns.map((column) => {
							const canSort = sortable && column.sortable !== false;
							const isSorted = canSort && sortKey === column.key;

							return (
								<TableHeaderCell
									key={column.key}
									style={{ width: column.width, textAlign: column.align }}
									aria-sort={
										canSort ? (isSorted ? sortDirection : "none") : undefined
									}
								>
									{canSort ? (
										<button
											type="button"
											className="table-sort-button"
											style={{ justifyContent: justifyContent(column.align) }}
											onClick={() => handleSort(column)}
										>
											{column.header}
											<span className="table-sort-arrow" aria-hidden="true" />
										</button>
									) : (
										column.header
									)}
								</TableHeaderCell>
							);
						})}
					</tr>
				</TableHead>
				<TableBody>
					{visibleData.length === 0 && emptyMessage !== undefined ? (
						<tr>
							<TableCell colSpan={columns.length}>{emptyMessage}</TableCell>
						</tr>
					) : (
						visibleData.map((row, index) => {
							const key = keyOf(row, index);
							return (
								<TableRow
									key={key}
									highlighted={selectable && activeKey === key}
									onClick={() => handleRowClick(row, index)}
								>
									{columns.map((column) => (
										<TableCell
											key={column.key}
											style={{ textAlign: column.align }}
										>
											{column.render
												? column.render(row, index)
												: ((row as Record<string, unknown>)[
														column.key
													] as ReactNode)}
										</TableCell>
									))}
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</SunkenPanel>
	);

	if (!pageSize || !showPager) return panel;

	return (
		<div className="table-view">
			{panel}
			<Pagination
				page={currentPage}
				pageCount={pageCount}
				onPageChange={setPage}
				labels={pagerLabels}
				label={pagerLabel}
				renderStatus={renderPageStatus}
			/>
		</div>
	);
}
