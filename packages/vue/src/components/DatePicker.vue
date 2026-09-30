<script lang="ts">
import type { CalendarLabels } from "./Calendar.vue";

export interface DatePickerProps {
	/** Controlled value, as `YYYY-MM-DD`. Same name as React's. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial value while uncontrolled. */
	defaultValue?: string;
	/** Earliest selectable date. */
	min?: string;
	/** Latest selectable date. */
	max?: string;
	/** `0` (default) starts the week on Sunday, `1` on Monday. */
	weekStartsOn?: 0 | 1;
	/** Localised month, weekday and button names. */
	labels?: Partial<CalendarLabels>;
	/** How the chosen date is shown in the box. Defaults to the ISO date. */
	formatValue?: (iso: string) => string;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: string;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: "row" | "stacked" | "none";
	/** Width of the whole control. */
	width?: number | string;
	placeholder?: string;
	id?: string;
	/** Submits the value through the text box. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` with an error. */
	invalid?: boolean;
	/** Accessible name for the calendar button. Defaults to `"Choose a date"`. */
	buttonLabel?: string;
	/** Controlled calendar visibility. */
	open?: boolean;
	/** Initial calendar visibility while uncontrolled. */
	defaultOpen?: boolean;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, useId } from "vue";
import { useControllableState } from "../utils/controllable";
import { useField } from "../utils/fieldContext";
import { focusElement } from "../utils/focusTrap";
import FloatingSurface from "../utils/FloatingSurface.vue";
import Calendar from "./Calendar.vue";
import { sizeStyle } from "../utils/css";

/**
 * A date box with a drop-down calendar — the Windows 98 date picker.
 *
 * ```vue
 * <DatePicker
 *   label="Installed on"
 *   default-value="1998-06-25"
 *   min="1995-08-24"
 *   @value-change="setDate"
 * />
 * ```
 *
 * The box itself is read-only: dates are chosen from the calendar, whose grid
 * takes focus while it is open and hands it back when it closes. The value is
 * always an ISO `YYYY-MM-DD` string, so no date library is needed anywhere in
 * the chain — `toIsoDate`/`parseIsoDate` are exported for the conversions.
 */
defineOptions({ name: "DatePicker", inheritAttrs: false });

const props = withDefaults(defineProps<DatePickerProps>(), {
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	min: undefined,
	max: undefined,
	weekStartsOn: 0,
	labels: undefined,
	formatValue: (iso: string) => iso,
	label: undefined,
	layout: "row",
	width: undefined,
	placeholder: undefined,
	id: undefined,
	name: undefined,
	disabled: false,
	invalid: undefined,
	buttonLabel: "Choose a date",
	open: undefined,
	defaultOpen: false,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:value": [value: string];
	"value-change": [value: string];
	"update:modelValue": [value: string];
	"update:open": [open: boolean];
	"open-change": [open: boolean];
}>();

const slots = defineSlots<{ label?: () => unknown }>();
const attrs = useAttrs();

const field = useField();
const generatedId = useId();
const inputId = computed(() => props.id ?? field?.value.controlId ?? generatedId);

const [selected, setSelected] = useControllableState<string | undefined>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue,
	onChange: (next) => {
		if (next === undefined) return;
		emit("update:value", next);
		emit("value-change", next);
		emit("update:modelValue", next);
	},
});
const [open, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const selectedValue = computed(() => selected.value ?? "");
const boxRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isInvalid = computed(() => props.invalid ?? field?.value.invalid ?? false);

const close = () => {
	setOpen(false);
	focusElement(inputRef.value);
};

const standalone = computed(() => field !== null || props.layout === "none");
const widthStyle = computed(() => sizeStyle("width", props.width));

const displayValue = computed(() =>
	selectedValue.value === "" ? "" : props.formatValue(selectedValue.value),
);

const onDaySelected = (next: string) => {
	setSelected(next);
	close();
};

const inputBindings = computed<Record<string, unknown>>(() => ({
	id: inputId.value,
	name: props.name,
	type: "text",
	class: "date-picker-input",
	readonly: true,
	disabled: props.disabled,
	placeholder: props.placeholder,
	value: displayValue.value,
	"aria-invalid": isInvalid.value || undefined,
	"aria-required": field?.value.required || undefined,
	"aria-describedby": field?.value.describedBy,
	"aria-expanded": open.value,
	onKeydown: (event: KeyboardEvent) => {
		if (props.disabled) return;
		if (event.key === "ArrowDown" || (event.altKey && event.key === "ArrowDown")) {
			event.preventDefault();
			setOpen(true);
		}
	},
}));

const buttonBindings = computed<Record<string, unknown>>(() => ({
	type: "button",
	class: "date-picker-button",
	tabindex: -1,
	disabled: props.disabled,
	"aria-label": props.buttonLabel,
	onClick: () => (open.value ? close() : setOpen(true)),
}));

/** React's `className` went to the `.date-picker` wrapper, never to the row. */
const controlBindings = computed(() =>
	mergeProps(
		{
			class: ["date-picker", isInvalid.value && "invalid"],
			style: standalone.value ? widthStyle.value : undefined,
		},
		attrs,
	),
);

defineExpose({ el: inputRef });
</script>

<template>
	<div v-if="standalone" v-bind="controlBindings" ref="boxRef">
		<input ref="inputRef" v-bind="inputBindings" />
		<button v-bind="buttonBindings" />
	</div>

	<div
		v-else
		:class="props.layout === 'stacked' ? 'field-row-stacked' : 'field-row'"
		:style="widthStyle"
	>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<div v-bind="controlBindings" ref="boxRef">
			<input ref="inputRef" v-bind="inputBindings" />
			<button v-bind="buttonBindings" />
		</div>
	</div>

	<FloatingSurface
		:open="open && !props.disabled"
		:anchor="boxRef"
		:match-anchor-width="false"
		role="dialog"
		:label="props.buttonLabel"
		surface-class="date-picker-popup"
		@dismiss="close"
		:auto-focus="true"
		:restore-focus="true"
		:inline="props.inline"
		:container="props.container"
	>
		<Calendar
			:value="selectedValue === '' ? undefined : selectedValue"
			:min="props.min"
			:max="props.max"
			:week-starts-on="props.weekStartsOn"
			:labels="props.labels"
			@value-change="onDaySelected"
		/>
	</FloatingSurface>
</template>
