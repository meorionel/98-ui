<script lang="ts">
import type { VNode } from "vue";
import type { PaginationLabels } from "./Pagination.vue";

/** Sort order, matching the values `aria-sort` expects. */
export type SortDirection = "ascending" | "descending";

export interface TableSortState {
	/** Column key, or `null` when the rows are unsorted. */
	key: string | null;
	direction: SortDirection;
}

/** Row identity — React's `Key`, which is `string | number`. */
export type TableRowKey = string | number;

/**
 * A header or a cell value. React accepted any `ReactNode`; the Vue port keeps
 * text, numbers and vnodes and renders them through `RenderVNode`.
 */
export type TableViewContent = string | number | VNode | null | undefined;

export interface TableViewColumn<T> {
	/** Stable identity for the column. */
	key: string;
	/** Header cell content. */
	header: TableViewContent;
	/** Cell content. Defaults to `row[key]`. */
	render?: (row: T, rowIndex: number) => TableViewContent;
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
	getRowKey?: (row: T, index: number) => TableRowKey;
	/** Pointer cursor on body rows. Implied by `selectable`. */
	interactive?: boolean;
	/** Enable the single-row highlight selection. */
	selectable?: boolean;
	/** Controlled highlighted row key. */
	selectedKey?: TableRowKey | null;
	/** Initial highlighted row key for uncontrolled usage. */
	defaultSelectedKey?: TableRowKey | null;

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

	/** Slice the rows into pages of this many rows and show a pager. */
	pageSize?: number;
	/** Controlled page, 1-based. */
	page?: number;
	/** Initial page while uncontrolled. */
	defaultPage?: number;
	/** Keep paging the rows but hide the pager. */
	showPager?: boolean;
	/** Localised names for the pager buttons. */
	pagerLabels?: Partial<PaginationLabels>;
	/** Accessible name for the pager. */
	pagerLabel?: string;
	/** Build the "Page 1 of 4" readout. */
	renderPageStatus?: (page: number, pageCount: number) => string;

	height?: number | string;
	width?: number | string;
	/** Content rendered when `data` is empty. */
	emptyMessage?: string;
	/** Extra props for the wrapping `SunkenPanel`. */
	panelProps?: Record<string, unknown>;
}
</script>

<script setup lang="ts" generic="T">
import { computed, createTextVNode, isVNode, useAttrs } from "vue";
import { cssSize } from "../utils/css";
import { useControllableState } from "../utils/controllable";
import { RenderVNode } from "../utils/trigger";
import Pagination from "./Pagination.vue";
import SunkenPanel from "./SunkenPanel.vue";
import Table from "./Table.vue";
import TableBody from "./TableBody.vue";
import TableCell from "./TableCell.vue";
import TableHead from "./TableHead.vue";
import TableHeaderCell from "./TableHeaderCell.vue";
import TableRow from "./TableRow.vue";

/**
 * A data-driven table view. Wrap it in a `.sunken-panel` (done for you) so the
 * sticky header and scrolling behave like the Windows 98 list view.
 *
 * Selection mirrors the script in the original docs: clicking a body row moves
 * the highlight to it. Add `sortable` for clickable column headers (the arrow in
 * the header is driven by `aria-sort`, so the visual and the screen-reader state
 * cannot drift apart) and `pageSize` for a pager underneath.
 *
 * ```vue
 * <TableView
 *   selectable
 *   sortable
 *   default-sort-key="name"
 *   :page-size="10"
 *   :height="160"
 *   :columns="[
 *     { key: 'name', header: 'Name' },
 *     { key: 'size', header: 'Size', align: 'right', sortValue: (row) => row.bytes },
 *   ]"
 *   :data="drivers"
 * />
 * ```
 */
defineOptions({ name: "TableView", inheritAttrs: false });

const props = withDefaults(defineProps<TableViewProps<T>>(), {
	getRowKey: undefined,
	interactive: false,
	selectable: false,
	selectedKey: undefined,
	defaultSelectedKey: null,
	sortable: false,
	sortKey: undefined,
	defaultSortKey: null,
	sortDirection: undefined,
	defaultSortDirection: "ascending",
	pageSize: undefined,
	page: undefined,
	defaultPage: 1,
	showPager: true,
	pagerLabels: undefined,
	pagerLabel: undefined,
	renderPageStatus: undefined,
	height: undefined,
	width: undefined,
	emptyMessage: undefined,
	panelProps: undefined,
});

const emit = defineEmits<{
	select: [row: T, key: TableRowKey];
	"sort-change": [sort: TableSortState];
	"page-change": [page: number];
	"update:selectedKey": [key: TableRowKey | null];
	"selectedKey-change": [key: TableRowKey | null];
	"update:sortKey": [key: string | null];
	"sortKey-change": [key: string | null];
	"update:sortDirection": [direction: SortDirection];
	"sortDirection-change": [direction: SortDirection];
	"update:page": [page: number];
}>();

const slots = defineSlots<{ emptyMessage?: () => unknown }>();

/**
 * React's `className` landed on the `<table>`, so the attributes are captured
 * here and placed on the same element (the root is a fragment: the panel alone,
 * or the `.table-view` wrapper around it and the pager).
 */
const attrs = useAttrs();

const [activeKey, setActiveKey] = useControllableState<TableRowKey | null>({
	value: () => props.selectedKey,
	defaultValue: props.defaultSelectedKey,
	onChange: (next) => {
		emit("update:selectedKey", next);
		emit("selectedKey-change", next);
	},
});

const [sortKey, setSortKey] = useControllableState<string | null>({
	value: () => props.sortKey,
	defaultValue: props.defaultSortKey,
	onChange: (next) => {
		emit("update:sortKey", next);
		emit("sortKey-change", next);
	},
});
const [sortDirection, setSortDirection] = useControllableState<SortDirection>({
	value: () => props.sortDirection,
	defaultValue: props.defaultSortDirection,
	onChange: (next) => {
		emit("update:sortDirection", next);
		emit("sortDirection-change", next);
	},
});

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

const sortedData = computed(() => {
	if (!props.sortable || sortKey.value === null) return props.data;
	const column = props.columns.find((entry) => entry.key === sortKey.value);
	if (!column) return props.data;

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

	const factor = sortDirection.value === "ascending" ? 1 : -1;
	return [...props.data].sort((a, b) => factor * compare(a, b));
});

const pageCount = computed(() => {
	const pageSize = props.pageSize;
	return pageSize ? Math.max(1, Math.ceil(sortedData.value.length / pageSize)) : 1;
});
const [page, setPage] = useControllableState<number>({
	value: () => props.page,
	defaultValue: props.defaultPage,
	// React clamped before notifying, so `onPageChange` never saw an
	// out-of-range page; the internal state keeps the raw value.
	onChange: (next) => {
		const clamped = Math.min(Math.max(1, next), pageCount.value);
		emit("update:page", clamped);
		emit("page-change", clamped);
	},
});
const currentPage = computed(() => Math.min(Math.max(1, page.value), pageCount.value));
const visibleData = computed(() => {
	const pageSize = props.pageSize;
	if (!pageSize) return sortedData.value;
	return sortedData.value.slice(
		(currentPage.value - 1) * pageSize,
		currentPage.value * pageSize,
	);
});

const keyOf = (row: T, index: number): TableRowKey => props.getRowKey?.(row, index) ?? index;

const handleRowClick = (row: T, index: number) => {
	if (!props.selectable) return;
	setActiveKey(keyOf(row, index));
	emit("select", row, keyOf(row, index));
};

const handleSort = (column: TableViewColumn<T>) => {
	const nextDirection: SortDirection =
		sortKey.value === column.key && sortDirection.value === "ascending" ? "descending" : "ascending";
	setSortKey(column.key);
	setSortDirection(nextDirection);
	emit("sort-change", { key: column.key, direction: nextDirection });
};

const canSort = (column: TableViewColumn<T>) => props.sortable && column.sortable !== false;
const isSorted = (column: TableViewColumn<T>) => canSort(column) && sortKey.value === column.key;

const justifyContent = (align: TableViewColumn<T>["align"]) =>
	align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";

/**
 * React accepted any `ReactNode` in a column; a template has to know whether it
 * interpolates text or renders a vnode, so both are normalised to a vnode here
 * (`RenderVNode` then renders it without an element of its own).
 */
const contentVNode = (content: TableViewContent): VNode | null => {
	if (isVNode(content)) return content;
	if (content === null || content === undefined || typeof content === "boolean") return null;
	return createTextVNode(String(content));
};

const cellContent = (row: T, column: TableViewColumn<T>, index: number): TableViewContent =>
	column.render
		? column.render(row, index)
		: ((row as Record<string, unknown>)[column.key] as TableViewContent);

/**
 * React's `style={{ width, textAlign }}` on a header cell, minus the empty
 * attribute: a column with neither a width nor an alignment renders a bare
 * `<th>` (Vue would write `style=""` for an empty style binding).
 */
const headerAttrs = (column: TableViewColumn<T>): Record<string, unknown> => {
	const style: Record<string, string> = {};
	const width = cssSize(column.width);
	if (width !== undefined) style.width = width;
	if (column.align !== undefined) style.textAlign = column.align;
	return Object.keys(style).length > 0 ? { style } : {};
};

/** React's `style={{ textAlign }}` on a body cell, omitted when unaligned. */
const cellAttrs = (column: TableViewColumn<T>): Record<string, unknown> =>
	column.align === undefined ? {} : { style: { textAlign: column.align } };

/**
 * React's `<SunkenPanel {...panelProps} style={{ height, width, ...panelProps.style }} />`:
 * the caller's `style` wins over the size, and an empty style stays off the
 * element instead of rendering `style=""`.
 */
const panelAttrs = computed<Record<string, unknown>>(() => {
	const extra: Record<string, unknown> = { ...(props.panelProps ?? {}) };
	const extraStyle = (extra.style ?? {}) as Record<string, unknown>;
	delete extra.style;

	const style: Record<string, unknown> = {};
	const height = cssSize(props.height);
	const width = cssSize(props.width);
	if (height !== undefined) style.height = height;
	if (width !== undefined) style.width = width;
	Object.assign(style, extraStyle);

	const result: Record<string, unknown> = { ...extra };
	if (Object.keys(style).length > 0) result.style = style;
	return result;
});

// React returned the bare panel unless it had both a page size and a pager.
const isPaged = computed(() => Boolean(props.pageSize) && props.showPager);
const hasEmptyMessage = computed(
	() => props.emptyMessage !== undefined || slots.emptyMessage !== undefined,
);
</script>

<template>
	<div v-if="isPaged" class="table-view">
		<SunkenPanel v-bind="panelAttrs">
			<Table v-bind="attrs" :interactive="props.interactive || props.selectable">
				<TableHead>
					<tr>
						<TableHeaderCell
							v-for="column in props.columns"
							:key="column.key"
							v-bind="headerAttrs(column)"
							:aria-sort="
								canSort(column)
									? isSorted(column)
										? sortDirection
										: 'none'
									: undefined
							"
						>
							<button
								v-if="canSort(column)"
								type="button"
								class="table-sort-button"
								:style="{ justifyContent: justifyContent(column.align) }"
								@click="handleSort(column)"
							>
								<RenderVNode :vnode="contentVNode(column.header)" />
								<span class="table-sort-arrow" aria-hidden="true" />
							</button>
							<template v-else>
								<RenderVNode :vnode="contentVNode(column.header)" />
							</template>
						</TableHeaderCell>
					</tr>
				</TableHead>
				<TableBody>
					<tr v-if="visibleData.length === 0 && hasEmptyMessage">
						<TableCell :colspan="props.columns.length">
							<slot name="emptyMessage">{{ props.emptyMessage }}</slot>
						</TableCell>
					</tr>
					<template v-else>
						<TableRow
							v-for="(row, index) in visibleData"
							:key="keyOf(row, index)"
							:highlighted="props.selectable && activeKey === keyOf(row, index)"
							@click="handleRowClick(row, index)"
						>
							<TableCell
								v-for="column in props.columns"
								:key="column.key"
								v-bind="cellAttrs(column)"
							>
								<RenderVNode :vnode="contentVNode(cellContent(row, column, index))" />
							</TableCell>
						</TableRow>
					</template>
				</TableBody>
			</Table>
		</SunkenPanel>
		<Pagination
			:page="currentPage"
			:page-count="pageCount"
			:labels="props.pagerLabels"
			:label="props.pagerLabel"
			:render-status="props.renderPageStatus"
			@page-change="setPage"
		/>
	</div>

	<SunkenPanel v-else v-bind="panelAttrs">
		<Table v-bind="attrs" :interactive="props.interactive || props.selectable">
			<TableHead>
				<tr>
					<TableHeaderCell
						v-for="column in props.columns"
						:key="column.key"
						v-bind="headerAttrs(column)"
						:aria-sort="
							canSort(column) ? (isSorted(column) ? sortDirection : 'none') : undefined
						"
					>
						<button
							v-if="canSort(column)"
							type="button"
							class="table-sort-button"
							:style="{ justifyContent: justifyContent(column.align) }"
							@click="handleSort(column)"
						>
							<RenderVNode :vnode="contentVNode(column.header)" />
							<span class="table-sort-arrow" aria-hidden="true" />
						</button>
						<template v-else>
							<RenderVNode :vnode="contentVNode(column.header)" />
						</template>
					</TableHeaderCell>
				</tr>
			</TableHead>
			<TableBody>
				<tr v-if="visibleData.length === 0 && hasEmptyMessage">
					<TableCell :colspan="props.columns.length">
						<slot name="emptyMessage">{{ props.emptyMessage }}</slot>
					</TableCell>
				</tr>
				<template v-else>
					<TableRow
						v-for="(row, index) in visibleData"
						:key="keyOf(row, index)"
						:highlighted="props.selectable && activeKey === keyOf(row, index)"
						@click="handleRowClick(row, index)"
					>
						<TableCell
							v-for="column in props.columns"
							:key="column.key"
							v-bind="cellAttrs(column)"
						>
							<RenderVNode :vnode="contentVNode(cellContent(row, column, index))" />
						</TableCell>
					</TableRow>
				</template>
			</TableBody>
		</Table>
	</SunkenPanel>
</template>
