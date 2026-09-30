<script lang="ts">
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
	/** Localised accessible names for the four buttons. */
	labels?: Partial<PaginationLabels>;
	/** Accessible name for the `nav` element. */
	label?: string;
	/** Show the "Page 1 of 4" readout. Defaults to `true`. */
	showStatus?: boolean;
	/** Build the readout. Defaults to `Page {page} of {pageCount}`. */
	renderStatus?: (page: number, pageCount: number) => string;
	/** Disable the buttons without hiding the pager. */
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useControllableState } from "../utils/controllable";
import Button from "./Button.vue";

/**
 * A pager: first / previous / next / last, plus a "Page 1 of 4" readout.
 *
 * ```vue
 * <Pagination :page="page" :page-count="4" @page-change="setPage" />
 * ```
 *
 * `TableView` renders one of these under the table when it is given a
 * `pageSize`, and it can also be used on its own. The arrow glyphs are CSS masks,
 * so they take the theme colour and the pressed-button text colour.
 */
defineOptions({ name: "Pagination" });

const props = withDefaults(defineProps<PaginationProps>(), {
	page: undefined,
	defaultPage: 1,
	labels: undefined,
	label: "Pagination",
	showStatus: true,
	renderStatus: undefined,
	disabled: false,
});

/** React's `onPageChange` reaches us as `@page-change` / `onPageChange`. */
const emit = defineEmits<{
	"update:page": [page: number];
	"page-change": [page: number];
}>();

const total = computed(() => Math.max(1, Math.floor(props.pageCount)));
const [page, setPage] = useControllableState<number>({
	value: () => props.page,
	defaultValue: props.defaultPage,
	// React clamped a second time while notifying: whatever it is handed, the
	// listener only ever sees a page inside the pager's range. The internal
	// state keeps the raw value, exactly like React's.
	onChange: (next) => {
		const clamped = Math.min(Math.max(1, next), total.value);
		emit("update:page", clamped);
		emit("page-change", clamped);
	},
});
const current = computed(() => Math.min(Math.max(1, Math.floor(page.value)), total.value));
const atStart = computed(() => current.value <= 1);
const atEnd = computed(() => current.value >= total.value);

const go = (next: number) => setPage(Math.min(Math.max(1, next), total.value));

/** React's `labels?.[key] ?? PAGINATION_LABELS[key]`. */
const labelFor = (key: keyof PaginationLabels) => props.labels?.[key] ?? PAGINATION_LABELS[key];

const status = computed(() =>
	props.renderStatus
		? props.renderStatus(current.value, total.value)
		: `Page ${current.value} of ${total.value}`,
);
</script>

<template>
	<nav class="pagination" :aria-label="props.label">
		<Button
			variant="toolbar"
			class="pagination-button pagination-first"
			:aria-label="labelFor('first')"
			:disabled="props.disabled || atStart"
			@click="go(1)"
		/>
		<Button
			variant="toolbar"
			class="pagination-button pagination-previous"
			:aria-label="labelFor('previous')"
			:disabled="props.disabled || atStart"
			@click="go(current - 1)"
		/>
		<span v-if="props.showStatus" class="pagination-status" aria-live="polite">{{ status }}</span>
		<Button
			variant="toolbar"
			class="pagination-button pagination-next"
			:aria-label="labelFor('next')"
			:disabled="props.disabled || atEnd"
			@click="go(current + 1)"
		/>
		<Button
			variant="toolbar"
			class="pagination-button pagination-last"
			:aria-label="labelFor('last')"
			:disabled="props.disabled || atEnd"
			@click="go(total)"
		/>
	</nav>
</template>
