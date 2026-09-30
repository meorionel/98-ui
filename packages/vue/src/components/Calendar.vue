<script lang="ts">
/* ------------------------------------------------------------ date helpers */

function pad(value: number): string {
	return value < 10 ? `0${value}` : String(value);
}

/** Formats a local `Date` as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses `YYYY-MM-DD` into a local `Date`, or `null` when it is not a date. */
export function parseIsoDate(iso: string | null | undefined): Date | null {
	if (!iso) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
	if (!match) return null;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	if (Number.isNaN(date.getTime())) return null;
	// Reject roll-overs such as 2024-02-31.
	return date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3])
		? date
		: null;
}

function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

function addDays(date: Date, count: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

function addMonths(date: Date, count: number): Date {
	const target = new Date(date.getFullYear(), date.getMonth() + count, 1);
	const day = Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
	return new Date(target.getFullYear(), target.getMonth(), day);
}

function startOfWeek(date: Date, weekStartsOn: number): Date {
	return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}

/** English month names, January first. */
export const CALENDAR_MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

/** English weekday abbreviations, indexed by `Date.getDay()` (Sunday first). */
export const CALENDAR_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export interface CalendarLabels {
	/** Accessible name for the "previous month" button. */
	previousMonth: string;
	/** Accessible name for the "next month" button. */
	nextMonth: string;
	/** Heading above the grid. Defaults to `February 2024`. */
	monthHeading?: (year: number, month: number) => string;
	/** Seven short weekday names, Sunday first. */
	weekdays?: readonly string[];
	/** Accessible name for a day cell. Defaults to the ISO date. */
	dayLabel?: (iso: string) => string;
}

const DEFAULT_LABELS: CalendarLabels = {
	previousMonth: "Previous month",
	nextMonth: "Next month",
};

export interface CalendarProps {
	/** Controlled selection, as `YYYY-MM-DD`. Same name as React's. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial selection while uncontrolled. */
	defaultValue?: string;
	/** Controlled visible month, as `YYYY-MM-01`. */
	month?: string;
	/** Initial visible month while uncontrolled. Defaults to the selection's month. */
	defaultMonth?: string;
	/** Earliest selectable date. */
	min?: string;
	/** Latest selectable date. */
	max?: string;
	/** `0` (default) starts the week on Sunday, `1` on Monday. */
	weekStartsOn?: 0 | 1;
	/** Localised names. */
	labels?: Partial<CalendarLabels>;
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/controllable";
import { focusElement } from "../utils/focusTrap";

/**
 * A month view, the Windows 98 date picker's calendar half.
 *
 * ```vue
 * <Calendar default-value="1998-06-25" @value-change="setDay" />
 * ```
 *
 * The grid is a `role="grid"` with one tab stop: arrows move by day and week,
 * Home/End jump to the edges of the week, PageUp/PageDown change month, and
 * Enter or Space selects. `aria-selected` marks the chosen day and
 * `aria-current="date"` marks today.
 */
defineOptions({ name: "Calendar" });

const props = withDefaults(defineProps<CalendarProps>(), {
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	month: undefined,
	defaultMonth: undefined,
	min: undefined,
	max: undefined,
	weekStartsOn: 0,
	labels: undefined,
	disabled: false,
});

const emit = defineEmits<{
	"update:value": [value: string];
	"value-change": [value: string];
	"update:modelValue": [value: string];
	"update:month": [month: string];
	"month-change": [month: string];
}>();

const today = new Date();
const todayIso = toIsoDate(today);

const [selectedIso, setSelectedIso] = useControllableState<string | undefined>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue,
	onChange: (next) => {
		if (next === undefined) return;
		emit("update:value", next);
		emit("value-change", next);
		emit("update:modelValue", next);
	},
});

const selectedDate = computed(() => parseIsoDate(selectedIso.value));
const initialMonth = computed(() => toIsoDate(startOfMonth(selectedDate.value ?? today)));

const [monthIso, setMonthIso] = useControllableState<string>({
	value: () => props.month,
	defaultValue: props.defaultMonth ?? initialMonth.value,
	onChange: (next) => {
		emit("update:month", next);
		emit("month-change", next);
	},
});

const visible = computed(
	() => parseIsoDate(monthIso.value) ?? parseIsoDate(initialMonth.value) ?? today,
);
const visibleIso = computed(() => toIsoDate(startOfMonth(visible.value)));

const focusedIso = ref<string>(selectedIso.value ?? initialMonth.value);
const pendingFocus = ref<string | null>(null);
const dayRefs: Record<string, HTMLButtonElement | null> = {};

// Follow a selection made elsewhere, but only when the selection's *month*
// actually changes: reacting to `visibleIso` instead would drag the user back
// every time they page to another month.
const selectedMonthIso = computed(() =>
	selectedDate.value ? toIsoDate(startOfMonth(selectedDate.value)) : null,
);
const followedMonth = ref<string | null>(null);
watch(
	[selectedMonthIso, () => props.month, visibleIso],
	() => {
		if (props.month !== undefined || selectedMonthIso.value === null) return;
		if (followedMonth.value === selectedMonthIso.value) return;
		followedMonth.value = selectedMonthIso.value;
		if (selectedMonthIso.value !== visibleIso.value) setMonthIso(selectedMonthIso.value);
	},
	// `immediate` is required: React's effect runs once after mount and records
	// the month it started on, which is what stops this from dragging the user
	// back after PageUp/PageDown moves to another month.
	{ immediate: true },
);

// The port of React's `useIsomorphicLayoutEffect`: focus only after the grid
// for the new month has actually been rendered.
watch(
	[pendingFocus, visibleIso],
	() => {
		if (pendingFocus.value === null) return;
		const node = dayRefs[pendingFocus.value];
		if (node) {
			focusElement(node);
			pendingFocus.value = null;
		}
	},
	{ flush: "post" },
);

const setDayRef = (iso: string, node: unknown) => {
	dayRefs[iso] = node as HTMLButtonElement | null;
};

const isSelectable = (iso: string) => {
	if (props.min !== undefined && iso < props.min) return false;
	if (props.max !== undefined && iso > props.max) return false;
	return true;
};

const canGoToMonth = (offset: number) => {
	const target = addMonths(visible.value, offset);
	const first = toIsoDate(startOfMonth(target));
	const last = toIsoDate(
		new Date(
			target.getFullYear(),
			target.getMonth(),
			daysInMonth(target.getFullYear(), target.getMonth()),
		),
	);
	if (props.min !== undefined && last < props.min) return false;
	if (props.max !== undefined && first > props.max) return false;
	return true;
};

const goToMonth = (offset: number) => {
	if (!canGoToMonth(offset)) return;
	setMonthIso(toIsoDate(startOfMonth(addMonths(visible.value, offset))));
};

const moveFocus = (target: Date) => {
	let next = target;
	const minDate = parseIsoDate(props.min);
	const maxDate = parseIsoDate(props.max);
	if (minDate && next < minDate) next = minDate;
	if (maxDate && next > maxDate) next = maxDate;

	const iso = toIsoDate(next);
	const targetMonth = toIsoDate(startOfMonth(next));
	focusedIso.value = iso;
	if (targetMonth !== visibleIso.value) setMonthIso(targetMonth);
	pendingFocus.value = iso;
};

const select = (iso: string) => {
	if (props.disabled || !isSelectable(iso)) return;
	setSelectedIso(iso);
	focusedIso.value = iso;
};

const handleKeyDown = (event: KeyboardEvent) => {
	if (props.disabled) return;
	const base = parseIsoDate(focusedIso.value) ?? selectedDate.value ?? today;
	let next: Date | null = null;

	switch (event.key) {
		case "ArrowLeft":
			next = addDays(base, -1);
			break;
		case "ArrowRight":
			next = addDays(base, 1);
			break;
		case "ArrowUp":
			next = addDays(base, -7);
			break;
		case "ArrowDown":
			next = addDays(base, 7);
			break;
		case "Home":
			next = startOfWeek(base, props.weekStartsOn);
			break;
		case "End":
			next = addDays(startOfWeek(base, props.weekStartsOn), 6);
			break;
		case "PageUp":
			next = addMonths(base, -1);
			break;
		case "PageDown":
			next = addMonths(base, 1);
			break;
		case "Enter":
		case " ":
			event.preventDefault();
			select(focusedIso.value);
			return;
		default:
			return;
	}

	event.preventDefault();
	moveFocus(next);
};

const weekdays = computed(() => props.labels?.weekdays ?? CALENDAR_WEEKDAYS);
const rotated = computed(() => {
	const names = weekdays.value;
	return [...names.slice(props.weekStartsOn), ...names.slice(0, props.weekStartsOn)];
});
const heading = computed(() =>
	props.labels?.monthHeading
		? props.labels.monthHeading(visible.value.getFullYear(), visible.value.getMonth())
		: `${CALENDAR_MONTHS[visible.value.getMonth()]} ${visible.value.getFullYear()}`,
);

const previousLabel = computed(() => props.labels?.previousMonth ?? DEFAULT_LABELS.previousMonth);
const nextLabel = computed(() => props.labels?.nextMonth ?? DEFAULT_LABELS.nextMonth);

const gridStart = computed(() => startOfWeek(startOfMonth(visible.value), props.weekStartsOn));
const weeks = computed<Array<Array<string | null>>>(() => {
	const rows: Array<Array<string | null>> = [];
	for (let week = 0; week < 6; week += 1) {
		const row: Array<string | null> = [];
		for (let day = 0; day < 7; day += 1) {
			const date = addDays(gridStart.value, week * 7 + day);
			row.push(date.getMonth() === visible.value.getMonth() ? toIsoDate(date) : null);
		}
		if (row.every((entry) => entry === null)) continue;
		rows.push(row);
	}
	return rows;
});

/** The day number a cell shows, without relying on template type narrowing. */
const dayNumber = (iso: string) => Number(iso.slice(-2));
/** The cell's accessible name; `null` cells (other months) have no button. */
const dayLabel = (iso: string) => props.labels?.dayLabel?.(iso) ?? iso;
</script>

<template>
	<div class="calendar">
		<div class="calendar-header">
			<button
				type="button"
				class="calendar-nav calendar-nav-previous"
				:aria-label="previousLabel"
				:disabled="props.disabled || !canGoToMonth(-1)"
				@click="goToMonth(-1)"
			/>
			<div class="calendar-heading" aria-live="polite">{{ heading }}</div>
			<button
				type="button"
				class="calendar-nav calendar-nav-next"
				:aria-label="nextLabel"
				:disabled="props.disabled || !canGoToMonth(1)"
				@click="goToMonth(1)"
			/>
		</div>

		<table role="grid" class="calendar-grid" @keydown="handleKeyDown">
			<thead>
				<tr>
					<th
						v-for="(name, index) in rotated"
						:key="`${name}-${index}`"
						scope="col"
						:abbr="name"
						class="calendar-weekday"
					>
						{{ name }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(week, weekIndex) in weeks" :key="weekIndex">
					<td
						v-for="(iso, dayIndex) in week"
						:key="dayIndex"
						role="gridcell"
						class="calendar-cell"
						:aria-selected="iso === null ? undefined : iso === selectedIso"
					>
						<button
							v-if="iso !== null"
							type="button"
							:ref="(node) => setDayRef(iso, node)"
							:class="
								cx(
									'calendar-day',
									iso === selectedIso && 'calendar-day-selected',
									iso === todayIso && 'calendar-day-today',
								)
							"
							:tabindex="iso === focusedIso ? 0 : -1"
							:disabled="props.disabled || !isSelectable(iso)"
							:aria-current="iso === todayIso ? 'date' : undefined"
							:aria-label="dayLabel(iso)"
							@click="select(iso)"
						>
							{{ dayNumber(iso) }}
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
