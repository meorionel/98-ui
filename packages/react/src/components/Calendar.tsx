import {
	forwardRef,
	useEffect,
	useMemo,
	useRef,
	useState,
	type HTMLAttributes,
	type KeyboardEvent,
} from "react";
import { cx } from "../utils/cx";
import { focusElement } from "../utils/focusTrap";
import { useIsomorphicLayoutEffect } from "../utils/layoutEffect";
import { useControllableState } from "../utils/useControllableState";

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

export interface CalendarProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	"onChange" | "defaultValue"
> {
	/** Controlled selection, as `YYYY-MM-DD`. */
	value?: string;
	/** Initial selection while uncontrolled. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Controlled visible month, as `YYYY-MM-01`. */
	month?: string;
	onMonthChange?: (month: string) => void;
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

/**
 * A month view, the Windows 98 date picker's calendar half.
 *
 * ```tsx
 * <Calendar defaultValue="1998-06-25" onValueChange={setDay} />
 * ```
 *
 * The grid is a `role="grid"` with one tab stop: arrows move by day and week,
 * Home/End jump to the edges of the week, PageUp/PageDown change month, and
 * Enter or Space selects. `aria-selected` marks the chosen day and
 * `aria-current="date"` marks today.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
	{
		value,
		defaultValue,
		onValueChange,
		month: monthProp,
		onMonthChange,
		min,
		max,
		weekStartsOn = 0,
		labels,
		disabled = false,
		className,
		...rest
	},
	ref,
) {
	const today = useMemo(() => new Date(), []);
	const todayIso = toIsoDate(today);

	const [selectedIso, setSelectedIso] = useControllableState<string | undefined>({
		value,
		defaultValue,
		onChange: (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
	});

	const selectedDate = parseIsoDate(selectedIso);
	const initialMonth = toIsoDate(startOfMonth(selectedDate ?? today));

	const [monthIso, setMonthIso] = useControllableState<string>({
		value: monthProp,
		defaultValue: initialMonth,
		onChange: onMonthChange,
	});

	const visible = parseIsoDate(monthIso) ?? parseIsoDate(initialMonth) ?? today;
	const visibleIso = toIsoDate(startOfMonth(visible));

	const [focusedIso, setFocusedIso] = useState<string>(selectedIso ?? initialMonth);
	const [pendingFocus, setPendingFocus] = useState<string | null>(null);
	const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	// Follow a selection made elsewhere, but only when the selection's *month*
	// actually changes: reacting to `visibleIso` instead would drag the user back
	// every time they page to another month.
	const selectedMonthIso = selectedDate ? toIsoDate(startOfMonth(selectedDate)) : null;
	const followedMonth = useRef<string | null>(null);
	useEffect(() => {
		if (monthProp !== undefined || selectedMonthIso === null) return;
		if (followedMonth.current === selectedMonthIso) return;
		followedMonth.current = selectedMonthIso;
		if (selectedMonthIso !== visibleIso) setMonthIso(selectedMonthIso);
	}, [selectedMonthIso, monthProp, visibleIso, setMonthIso]);

	useIsomorphicLayoutEffect(() => {
		if (pendingFocus === null) return;
		const node = dayRefs.current[pendingFocus];
		if (node) {
			focusElement(node);
			setPendingFocus(null);
		}
	}, [pendingFocus, visibleIso]);

	const isSelectable = (iso: string) => {
		if (min !== undefined && iso < min) return false;
		if (max !== undefined && iso > max) return false;
		return true;
	};

	const canGoToMonth = (offset: number) => {
		const target = addMonths(visible, offset);
		const first = toIsoDate(startOfMonth(target));
		const last = toIsoDate(
			new Date(
				target.getFullYear(),
				target.getMonth(),
				daysInMonth(target.getFullYear(), target.getMonth()),
			),
		);
		if (min !== undefined && last < min) return false;
		if (max !== undefined && first > max) return false;
		return true;
	};

	const goToMonth = (offset: number) => {
		if (!canGoToMonth(offset)) return;
		setMonthIso(toIsoDate(startOfMonth(addMonths(visible, offset))));
	};

	const moveFocus = (target: Date) => {
		let next = target;
		const minDate = parseIsoDate(min);
		const maxDate = parseIsoDate(max);
		if (minDate && next < minDate) next = minDate;
		if (maxDate && next > maxDate) next = maxDate;

		const iso = toIsoDate(next);
		const targetMonth = toIsoDate(startOfMonth(next));
		setFocusedIso(iso);
		if (targetMonth !== visibleIso) setMonthIso(targetMonth);
		setPendingFocus(iso);
	};

	const select = (iso: string) => {
		if (disabled || !isSelectable(iso)) return;
		setSelectedIso(iso);
		setFocusedIso(iso);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
		if (disabled) return;
		const base = parseIsoDate(focusedIso) ?? selectedDate ?? today;
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
				next = startOfWeek(base, weekStartsOn);
				break;
			case "End":
				next = addDays(startOfWeek(base, weekStartsOn), 6);
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
				select(focusedIso);
				return;
			default:
				return;
		}

		event.preventDefault();
		moveFocus(next);
	};

	const weekdays = labels?.weekdays ?? CALENDAR_WEEKDAYS;
	const rotated = [...weekdays.slice(weekStartsOn), ...weekdays.slice(0, weekStartsOn)];
	const heading = labels?.monthHeading
		? labels.monthHeading(visible.getFullYear(), visible.getMonth())
		: `${CALENDAR_MONTHS[visible.getMonth()]} ${visible.getFullYear()}`;

	const gridStart = startOfWeek(startOfMonth(visible), weekStartsOn);
	const weeks: Array<Array<string | null>> = [];
	for (let week = 0; week < 6; week += 1) {
		const row: Array<string | null> = [];
		for (let day = 0; day < 7; day += 1) {
			const date = addDays(gridStart, week * 7 + day);
			row.push(date.getMonth() === visible.getMonth() ? toIsoDate(date) : null);
		}
		if (row.every((entry) => entry === null)) continue;
		weeks.push(row);
	}

	return (
		<div ref={ref} className={cx("calendar", className)} {...rest}>
			<div className="calendar-header">
				<button
					type="button"
					className="calendar-nav calendar-nav-previous"
					aria-label={labels?.previousMonth ?? DEFAULT_LABELS.previousMonth}
					disabled={disabled || !canGoToMonth(-1)}
					onClick={() => goToMonth(-1)}
				/>
				<div className="calendar-heading" aria-live="polite">
					{heading}
				</div>
				<button
					type="button"
					className="calendar-nav calendar-nav-next"
					aria-label={labels?.nextMonth ?? DEFAULT_LABELS.nextMonth}
					disabled={disabled || !canGoToMonth(1)}
					onClick={() => goToMonth(1)}
				/>
			</div>

			<table role="grid" className="calendar-grid" onKeyDown={handleKeyDown}>
				<thead>
					<tr>
						{rotated.map((name, index) => (
							<th
								key={`${name}-${index}`}
								scope="col"
								abbr={name}
								className="calendar-weekday"
							>
								{name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{weeks.map((week, weekIndex) => (
						<tr key={weekIndex}>
							{week.map((iso, dayIndex) =>
								iso === null ? (
									<td key={dayIndex} className="calendar-cell" role="gridcell" />
								) : (
									<td
										key={dayIndex}
										role="gridcell"
										className="calendar-cell"
										aria-selected={iso === selectedIso}
									>
										<button
											type="button"
											ref={(node) => {
												dayRefs.current[iso] = node;
											}}
											className={cx(
												"calendar-day",
												iso === selectedIso && "calendar-day-selected",
												iso === todayIso && "calendar-day-today",
											)}
											tabIndex={iso === focusedIso ? 0 : -1}
											disabled={disabled || !isSelectable(iso)}
											aria-current={iso === todayIso ? "date" : undefined}
											aria-label={labels?.dayLabel?.(iso) ?? iso}
											onClick={() => select(iso)}
										>
											{Number(iso.slice(-2))}
										</button>
									</td>
								),
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
});
