<script lang="ts">
export interface CheckboxProps {
	/** Text rendered inside the associated `<label>`. A `label` slot overrides it. */
	label?: string;
	/**
	 * Wrap the input and label in a `.field-row` so that stacked checkboxes get
	 * the standard 6px gap. Defaults to `true`; set to `false` when you place the
	 * checkbox inside a row yourself.
	 */
	row?: boolean;
	/** Extra props for the wrapping `.field-row` (ignored when `row` is false). */
	rowProps?: Record<string, unknown>;
	/** Controlled checked state. Same name as React's. */
	checked?: boolean;
	/** Alias for `checked`, so plain `v-model` works. Wins when both are given. */
	modelValue?: boolean;
	/** Initial checked state while uncontrolled. */
	defaultChecked?: boolean;
	/** Id of the input. A stable one is generated when omitted. */
	id?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { useControllableState } from "../utils/controllable";
import FieldRow from "./FieldRow.vue";

/**
 * A Windows 98 check box.
 *
 * The stylesheet draws the box and the checkmark from the input's own state via
 * the `input + label` sibling selectors, so the input is always rendered
 * immediately before its label — never reorder them.
 *
 * ```vue
 * <Checkbox v-model="remember" label="Remember me" />
 * <Checkbox :checked="true" @change="onChange" label="Static preview" />
 * ```
 */
defineOptions({ name: "Checkbox", inheritAttrs: false });

const props = withDefaults(defineProps<CheckboxProps>(), {
	label: undefined,
	row: true,
	rowProps: undefined,
	checked: undefined,
	modelValue: undefined,
	defaultChecked: false,
	id: undefined,
});

const emit = defineEmits<{
	"update:checked": [checked: boolean];
	"update:modelValue": [checked: boolean];
}>();

const slots = defineSlots<{ label?: () => unknown }>();
const attrs = useAttrs();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

const [current, setCurrent] = useControllableState<boolean>({
	value: () => props.modelValue ?? props.checked,
	defaultValue: props.defaultChecked,
	onChange: (next) => {
		emit("update:checked", next);
		emit("update:modelValue", next);
	},
});

/**
 * React added `readOnly` when `checked` was set without an `onChange` just to
 * silence its own controlled-input warning. Vue has no such warning, but the
 * behaviour is kept: a checkbox that nobody listens to stays put.
 */
const isStatic = computed(
	() =>
		props.checked !== undefined &&
		attrs.onChange === undefined &&
		attrs["onUpdate:checked"] === undefined &&
		attrs["onUpdate:modelValue"] === undefined,
);

const onChange = (event: Event) => {
	setCurrent((event.target as HTMLInputElement).checked);
};
</script>

<template>
	<FieldRow v-if="props.row" v-bind="props.rowProps">
		<input
			v-bind="attrs"
			:id="inputId"
			type="checkbox"
			:checked="current"
			:readonly="isStatic"
			@change="onChange"
		/>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
	</FieldRow>

	<template v-else>
		<input
			v-bind="attrs"
			:id="inputId"
			type="checkbox"
			:checked="current"
			:readonly="isStatic"
			@change="onChange"
		/>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
	</template>
</template>
