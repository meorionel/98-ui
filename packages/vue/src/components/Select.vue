<script lang="ts">
import type { FieldLayout } from "./TextBox.vue";

export interface SelectOption {
	/** Text of the `<option>`. */
	label: string;
	value: string;
	disabled?: boolean;
}

export interface SelectProps {
	/**
	 * Convenience way to declare the options. When omitted, pass `<option>`
	 * elements as the default slot instead.
	 */
	options?: SelectOption[];
	/** Content of the associated `<label>`. A `label` slot overrides it. */
	label?: string;
	/** `"row"` (default) puts the label beside the select, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Wrapper width. */
	width?: number | string;
	/** Mark the field invalid: a red outline plus `aria-invalid`. */
	invalid?: boolean;
	/** Id of the select. A stable one is generated when omitted. */
	id?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { sizeStyle } from "../utils/css";

/**
 * A drop-down list box.
 *
 * Focus state is styled by the stylesheet (`select:focus` turns the field
 * blue), and the small triangle button is an inlined SVG background.
 */
defineOptions({ name: "Select", inheritAttrs: false });

const props = withDefaults(defineProps<SelectProps>(), {
	options: undefined,
	label: undefined,
	layout: "row",
	width: undefined,
	invalid: undefined,
	id: undefined,
});

const slots = defineSlots<{ default?: () => unknown; label?: () => unknown }>();
const attrs = useAttrs();

const field = useField();
const generatedId = useId();
const selectId = computed(() => props.id ?? field?.value.controlId ?? generatedId);
const isInvalid = computed(() => props.invalid ?? field?.value.invalid ?? false);
// Read through getters rather than `field?.x` inside the template: the
// `v-else` branch narrows `field` to `null`, which makes the access a type error
// even though it is a harmless no-op there.
const fieldRequired = computed(() => field?.value.required ?? false);
const fieldDescribedBy = computed(() => field?.value.describedBy);

// Inside a `Field` the caption and the messages belong to the field, so the
// wrapper is dropped and the caption is only rendered when it was given
// explicitly. `layout="none"` asks for the same bare fragment outside a field.
</script>

<template>
	<template v-if="field || props.layout === 'none'">
		<label v-if="props.label !== undefined || slots.label" :for="selectId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<select
			:id="selectId"
			:class="cx(isInvalid && 'invalid')"
			:aria-invalid="isInvalid || undefined"
			:aria-required="fieldRequired || undefined"
			:aria-describedby="fieldDescribedBy"
			v-bind="attrs"
		>
			<template v-if="props.options">
				<option
					v-for="option in props.options"
					:key="option.value"
					:value="option.value"
					:disabled="option.disabled"
				>
					{{ option.label }}
				</option>
			</template>
			<slot v-else />
		</select>
	</template>

	<div
		v-else
		:class="cx(props.layout === 'stacked' ? 'field-row-stacked' : 'field-row')"
		:style="sizeStyle('width', props.width)"
	>
		<label v-if="props.label !== undefined || slots.label" :for="selectId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<select
			:id="selectId"
			:class="cx(isInvalid && 'invalid')"
			:aria-invalid="isInvalid || undefined"
			:aria-required="fieldRequired || undefined"
			:aria-describedby="fieldDescribedBy"
			v-bind="attrs"
		>
			<template v-if="props.options">
				<option
					v-for="option in props.options"
					:key="option.value"
					:value="option.value"
					:disabled="option.disabled"
				>
					{{ option.label }}
				</option>
			</template>
			<slot v-else />
		</select>
	</div>
</template>
