<script lang="ts">
export interface RadioProps {
	/** Text rendered inside the associated `<label>`. A `label` slot overrides it. */
	label?: string;
	/** Wrap the input and label in a `.field-row`. Defaults to `true`. */
	row?: boolean;
	/** Extra props for the wrapping `.field-row` (ignored when `row` is false). */
	rowProps?: Record<string, unknown>;
	/**
	 * Controlled checked state, exactly like the native input. A `Radio` that is
	 * given `checked` but no `change` listener is rendered read-only.
	 */
	checked?: boolean;
	/** Initial checked state of the native, uncontrolled input. */
	defaultChecked?: boolean;
	/** Id of the input. A stable one is generated when omitted. */
	id?: string;
}

export interface RadioGroupOption {
	/** Text rendered inside the option's `<label>`. */
	label: string;
	value: string;
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import FieldRow from "./FieldRow.vue";

/**
 * A Windows 98 option button (radio button).
 *
 * Group several of these by giving them the same `name`, exactly like the
 * native control. For a managed group use `RadioGroup` instead.
 */
defineOptions({ name: "Radio", inheritAttrs: false });

const props = withDefaults(defineProps<RadioProps>(), {
	label: undefined,
	row: true,
	rowProps: undefined,
	checked: undefined,
	defaultChecked: undefined,
	id: undefined,
});

const slots = defineSlots<{ label?: () => unknown }>();
const attrs = useAttrs();

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);

/**
 * React added `readOnly` when `checked` was set without an `onChange` so a radio
 * that nobody can change stays put. Vue has no controlled-input warning, but the
 * behaviour is kept — `change` is not an emitted event here, it falls through to
 * the native input, so it is still visible in `attrs`.
 */
const isStatic = computed(() => props.checked !== undefined && attrs.onChange === undefined);

// `defaultChecked` is a prop of its own so that the initial state survives
// server rendering: Vue's SSR renders an attribute key literally, and
// `defaultchecked` is not the HTML attribute browsers map onto `defaultChecked`.
</script>

<template>
	<FieldRow v-if="props.row" v-bind="props.rowProps">
		<input
			type="radio"
			:id="inputId"
			:checked="props.checked ?? props.defaultChecked"
			:readonly="isStatic"
			v-bind="attrs"
		/>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
	</FieldRow>

	<template v-else>
		<input
			type="radio"
			:id="inputId"
			:checked="props.checked ?? props.defaultChecked"
			:readonly="isStatic"
			v-bind="attrs"
		/>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
	</template>
</template>
