<script lang="ts">
import type { RadioGroupOption } from "./Radio.vue";

// `RadioGroupOption` is defined next to `Radio` (where React declared it) and
// re-exported here, because it is the element type of `options` below.
export type { RadioGroupOption };

export interface RadioGroupProps {
	/** Shared `name` for every radio in the group. Auto-generated when omitted. */
	name?: string;
	/** Controlled selected value. Same name as React's. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial selected value for uncontrolled usage. */
	defaultValue?: string;
	options: RadioGroupOption[];
	/** Render an optional label above the group. A `label` slot overrides it. */
	label?: string;
	/** Render the options inside a `<fieldset>`/`<legend>` group box. */
	groupBox?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useId } from "vue";
import { useControllableState } from "../utils/controllable";
import FieldRow from "./FieldRow.vue";
import Radio from "./Radio.vue";

/**
 * Convenience wrapper that manages the selected value of a set of `Radio`s
 * and guarantees they all share one `name`.
 */
defineOptions({ name: "RadioGroup" });

const props = withDefaults(defineProps<RadioGroupProps>(), {
	name: undefined,
	value: undefined,
	modelValue: undefined,
	defaultValue: "",
	label: undefined,
	groupBox: false,
});

const emit = defineEmits<{
	"update:value": [value: string];
	"update:modelValue": [value: string];
	"value-change": [value: string];
}>();

const slots = defineSlots<{ label?: () => unknown }>();

const generatedName = useId();
const groupName = computed(() => props.name ?? generatedName);

const [selected, setSelected] = useControllableState<string>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue,
	onChange: (next) => {
		emit("update:value", next);
		emit("update:modelValue", next);
		emit("value-change", next);
	},
});

const hasLabel = computed(() => props.label !== undefined || Boolean(slots.label));

const handleChange = (event: Event) => {
	setSelected((event.target as HTMLInputElement).value);
};
</script>

<template>
	<fieldset v-if="props.groupBox">
		<legend v-if="hasLabel">
			<slot name="label">{{ props.label }}</slot>
		</legend>
		<Radio
			v-for="option in props.options"
			:key="option.value"
			:name="groupName"
			:value="option.value"
			:label="option.label"
			:disabled="option.disabled"
			:checked="selected === option.value"
			@change="handleChange"
		/>
	</fieldset>

	<div v-else-if="!hasLabel">
		<Radio
			v-for="option in props.options"
			:key="option.value"
			:name="groupName"
			:value="option.value"
			:label="option.label"
			:disabled="option.disabled"
			:checked="selected === option.value"
			@change="handleChange"
		/>
	</div>

	<div v-else>
		<FieldRow>
			<slot name="label">{{ props.label }}</slot>
		</FieldRow>
		<Radio
			v-for="option in props.options"
			:key="option.value"
			:name="groupName"
			:value="option.value"
			:label="option.label"
			:disabled="option.disabled"
			:checked="selected === option.value"
			@change="handleChange"
		/>
	</div>
</template>
