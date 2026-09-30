<script lang="ts">
/** English accessible names for the two arrow buttons. */
export const SPIN_BOX_LABELS = { up: "Increase", down: "Decrease" } as const;

export interface SpinBoxProps {
	/** Controlled value. `undefined` renders an empty box. */
	value?: number;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: number;
	/** Initial value while uncontrolled. */
	defaultValue?: number;
	/** Lower bound, and the value `Home` jumps to. */
	min?: number;
	/** Upper bound, and the value `End` jumps to. */
	max?: number;
	/** Amount one arrow press changes the value by. Defaults to `1`. */
	step?: number;
	/** Amount one PageUp/PageDown press changes the value by. Defaults to `10`. */
	pageStep?: number;
	/** Fixed number of decimals, e.g. `2` for a price. */
	precision?: number;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: string;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: "row" | "stacked" | "none";
	/** Width of the whole control. */
	width?: number | string;
	id?: string;
	/** Submits the value through the text box. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` with an error. */
	invalid?: boolean;
	placeholder?: string;
	/** Accessible names for the arrow buttons. */
	labels?: Partial<Record<"up" | "down", string>>;
}
</script>

<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, useId, watch } from "vue";
import { useControllableState } from "../utils/controllable";
import { useField } from "../utils/fieldContext";
import { focusElement } from "../utils/focusTrap";
import { sizeStyle } from "../utils/css";

function format(value: number | undefined, precision?: number): string {
	if (value === undefined || Number.isNaN(value)) return "";
	return precision === undefined ? String(value) : value.toFixed(precision);
}

function parse(text: string): number | null {
	const trimmed = text.trim();
	if (trimmed === "" || trimmed === "-" || trimmed === ".") return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The Windows 98 spin box: a text box with a pair of up/down arrows.
 *
 * ```vue
 * <SpinBox label="Font size" :min="8" :max="72" :default-value="11" />
 * ```
 *
 * Arrows step by `step`, PageUp/PageDown by `pageStep`, Home/End jump to
 * `min`/`max`, and typing is clamped when the box loses focus. The input carries
 * `role="spinbutton"` with the matching value attributes, so the number is
 * announced as a spin button rather than as free text.
 */
defineOptions({ name: "SpinBox", inheritAttrs: false });

const props = withDefaults(defineProps<SpinBoxProps>(), {
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	min: undefined,
	max: undefined,
	step: 1,
	pageStep: 10,
	precision: undefined,
	label: undefined,
	layout: "row",
	width: undefined,
	id: undefined,
	name: undefined,
	disabled: false,
	invalid: undefined,
	placeholder: undefined,
	labels: undefined,
});

const emit = defineEmits<{
	"update:value": [value: number];
	"value-change": [value: number];
	"update:modelValue": [value: number];
}>();

const slots = defineSlots<{ label?: () => unknown }>();
const attrs = useAttrs();

const field = useField();
const generatedId = useId();
const inputId = computed(() => props.id ?? field?.value.controlId ?? generatedId);
const isInvalid = computed(() => props.invalid ?? field?.value.invalid ?? false);

const [value, setValue] = useControllableState<number | undefined>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue,
	onChange: (next) => {
		if (next === undefined) return;
		emit("update:value", next);
		emit("value-change", next);
		emit("update:modelValue", next);
	},
});

const text = ref(format(props.modelValue ?? props.value ?? props.defaultValue, props.precision));
const inputRef = ref<HTMLInputElement | null>(null);
const editing = ref(false);

// Follow the value from the outside, unless the user is mid-edit.
watch([value, () => props.precision], () => {
	if (!editing.value) text.value = format(value.value, props.precision);
});

const clamp = (next: number) => {
	let result = next;
	if (props.min !== undefined) result = Math.max(props.min, result);
	if (props.max !== undefined) result = Math.min(props.max, result);
	return result;
};

/** Commits a value, optionally reformatting the text (blur, arrows, Enter). */
const commit = (next: number | null, reformat = false) => {
	if (next === null) {
		if (reformat) text.value = format(value.value, props.precision);
		return;
	}
	const clamped = clamp(next);
	setValue(clamped);
	if (reformat) text.value = format(clamped, props.precision);
};

const stepBy = (multiplier: number) => {
	const current = parse(text.value) ?? value.value ?? props.min ?? 0;
	commit(current + props.step * multiplier, true);
};

const handleKeyDown = (event: KeyboardEvent) => {
	if (props.disabled) return;
	switch (event.key) {
		case "ArrowUp":
			event.preventDefault();
			stepBy(1);
			return;
		case "ArrowDown":
			event.preventDefault();
			stepBy(-1);
			return;
		case "PageUp":
			event.preventDefault();
			stepBy(props.pageStep / props.step);
			return;
		case "PageDown":
			event.preventDefault();
			stepBy(-props.pageStep / props.step);
			return;
		case "Home":
			if (props.min === undefined) return;
			event.preventDefault();
			commit(props.min, true);
			return;
		case "End":
			if (props.max === undefined) return;
			event.preventDefault();
			commit(props.max, true);
			return;
		case "Enter":
			commit(parse(text.value), true);
			return;
		default:
			return;
	}
};

const standalone = computed(() => field !== null || props.layout === "none");
const widthStyle = computed(() => sizeStyle("width", props.width));

const onInput = (event: Event) => {
	const next = (event.target as HTMLInputElement).value;
	text.value = next;
	commit(parse(next));
};

const inputBindings = computed<Record<string, unknown>>(() => ({
	id: inputId.value,
	name: props.name,
	type: "text",
	role: "spinbutton",
	class: "spin-box-input",
	inputmode: props.precision === undefined ? "numeric" : "decimal",
	autocomplete: "off",
	disabled: props.disabled,
	placeholder: props.placeholder,
	value: text.value,
	"aria-valuenow": value.value,
	"aria-valuemin": props.min,
	"aria-valuemax": props.max,
	"aria-invalid": isInvalid.value || undefined,
	"aria-required": field?.value.required || undefined,
	"aria-describedby": field?.value.describedBy,
	onInput,
	onFocus: () => {
		editing.value = true;
	},
	onBlur: () => {
		editing.value = false;
		commit(parse(text.value), true);
	},
}));

/** React's `className` went to the `.spin-box` wrapper, never to the row. */
const controlBindings = computed(() =>
	mergeProps(
		{
			class: ["spin-box", isInvalid.value && "invalid"],
			style: standalone.value ? widthStyle.value : undefined,
			onKeydown: handleKeyDown,
		},
		attrs,
	),
);

const upBindings = computed<Record<string, unknown>>(() => ({
	type: "button",
	class: "spin-box-button spin-box-up",
	tabindex: -1,
	disabled: props.disabled,
	"aria-label": props.labels?.up ?? SPIN_BOX_LABELS.up,
	onClick: () => {
		stepBy(1);
		focusElement(inputRef.value);
	},
}));

const downBindings = computed<Record<string, unknown>>(() => ({
	type: "button",
	class: "spin-box-button spin-box-down",
	tabindex: -1,
	disabled: props.disabled,
	"aria-label": props.labels?.down ?? SPIN_BOX_LABELS.down,
	onClick: () => {
		stepBy(-1);
		focusElement(inputRef.value);
	},
}));

defineExpose({ el: inputRef });
</script>

<template>
	<div v-if="standalone" v-bind="controlBindings">
		<input ref="inputRef" v-bind="inputBindings" />
		<div class="spin-box-buttons">
			<button v-bind="upBindings" />
			<button v-bind="downBindings" />
		</div>
	</div>

	<div
		v-else
		:class="props.layout === 'stacked' ? 'field-row-stacked' : 'field-row'"
		:style="widthStyle"
	>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<div v-bind="controlBindings">
			<input ref="inputRef" v-bind="inputBindings" />
			<div class="spin-box-buttons">
				<button v-bind="upBindings" />
				<button v-bind="downBindings" />
			</div>
		</div>
	</div>
</template>
