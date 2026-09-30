<script lang="ts">
export interface SliderProps {
	/** Lay the slider out vertically (wraps the input in `.is-vertical`). */
	vertical?: boolean;
	/** Swap the default indicator for the rectangular box indicator. */
	boxIndicator?: boolean;
	/** Content of the `<label>` shown before the slider. A `label` slot overrides it. */
	label?: string;
	/** Optional caption rendered before the track, e.g. "Low". A `lowLabel` slot overrides it. */
	lowLabel?: string;
	/** Optional caption rendered after the track, e.g. "High". A `highLabel` slot overrides it. */
	highLabel?: string;
	/** Track length in pixels. Defaults to the stylesheet's 150px. */
	length?: number;
	/**
	 * Wrap everything in a `.field-row`. Defaults to `true` when a `label`,
	 * `lowLabel` or `highLabel` is supplied.
	 */
	row?: boolean;
	/** Controlled value. Same name as React's. */
	value?: number | string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: number | string;
	/** Initial value while uncontrolled. */
	defaultValue?: number | string;
	/** Id of the input. A stable one is generated when omitted. */
	id?: string;
}
</script>

<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, useId } from "vue";
import { useControllableState } from "../utils/controllable";
import FieldRow from "./FieldRow.vue";
import { sizeStyle } from "../utils/css";

/**
 * A slider (trackbar control).
 *
 * ```vue
 * <Slider v-model="volume" label="Volume:" lowLabel="Low" highLabel="High" />
 * ```
 *
 * Both the horizontal and the vertical variants rely on vendor pseudo-elements
 * in the stylesheet (`::-webkit-slider-thumb`, `::-moz-range-thumb`), so the
 * input itself is left as a plain, fully native `<input type="range">` — all
 * keyboard and assistive-technology behaviour is preserved.
 */
defineOptions({ name: "Slider", inheritAttrs: false });

const props = withDefaults(defineProps<SliderProps>(), {
	vertical: false,
	boxIndicator: false,
	label: undefined,
	lowLabel: undefined,
	highLabel: undefined,
	length: undefined,
	row: undefined,
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	id: undefined,
});

const emit = defineEmits<{
	"update:value": [value: number | string];
	"value-change": [value: number | string];
	"update:modelValue": [value: number | string];
}>();

const slots = defineSlots<{
	label?: () => unknown;
	lowLabel?: () => unknown;
	highLabel?: () => unknown;
}>();
const attrs = useAttrs();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

// A range input has no read-only mode, so React would warn about a `value`
// with no `onChange`. Vue has no such warning, but the behaviour is kept: a
// `value` that nobody listens to is treated as a starting value instead.
const isStatic = computed(
	() =>
		props.value !== undefined &&
		props.modelValue === undefined &&
		attrs.onChange === undefined &&
		attrs.onInput === undefined,
);

const [current, setCurrent] = useControllableState<number | string | undefined>({
	value: () => (isStatic.value ? undefined : (props.modelValue ?? props.value)),
	defaultValue: props.defaultValue ?? props.value,
	onChange: (next) => {
		if (next === undefined) return;
		emit("update:value", next);
		emit("value-change", next);
		emit("update:modelValue", next);
	},
});

const inputRef = ref<HTMLInputElement | null>(null);

const onInput = (event: Event) => {
	setCurrent((event.target as HTMLInputElement).value);
};

/**
 * Everything React spread onto the range input: the state it derives first,
 * then the caller's own attributes, so `class` and `style` keep React's
 * precedence (`cx(boxIndicator && …, className)` / `{ width, ...style }`).
 */
const inputBindings = computed(() =>
	mergeProps(
		{
			id: inputId.value,
			type: "range",
			class: props.boxIndicator ? "has-box-indicator" : undefined,
			style:
				props.vertical ? sizeStyle("width", props.length) : undefined,
			value: current.value,
			onInput,
		},
		attrs,
	),
);

const withRow = computed(
	() =>
		props.row ??
		(props.label !== undefined || props.lowLabel !== undefined || props.highLabel !== undefined),
);

const verticalStyle = computed(() => sizeStyle("height", props.length));

defineExpose({ el: inputRef });
</script>

<template>
	<FieldRow v-if="withRow">
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<label v-if="props.lowLabel !== undefined || slots.lowLabel" :for="inputId">
			<slot name="lowLabel">{{ props.lowLabel }}</slot>
		</label>
		<div v-if="props.vertical" class="is-vertical" :style="verticalStyle">
			<input ref="inputRef" v-bind="inputBindings" />
		</div>
		<input v-else ref="inputRef" v-bind="inputBindings" />
		<label v-if="props.highLabel !== undefined || slots.highLabel" :for="inputId">
			<slot name="highLabel">{{ props.highLabel }}</slot>
		</label>
	</FieldRow>

	<template v-else>
		<div v-if="props.vertical" class="is-vertical" :style="verticalStyle">
			<input ref="inputRef" v-bind="inputBindings" />
		</div>
		<input v-else ref="inputRef" v-bind="inputBindings" />
	</template>
</template>
