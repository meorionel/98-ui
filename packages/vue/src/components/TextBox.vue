<script lang="ts">
/** Every `<input type>` the stylesheet gives the engraved field border to. */
export type TextBoxType = "text" | "password" | "email" | "url" | "tel" | "number" | "search";

/** Where the label goes relative to the control. */
export type FieldLayout = "row" | "stacked" | "none";

export interface TextBoxProps {
	/** Content of the associated `<label>`. A `label` slot overrides it. */
	label?: string;
	type?: TextBoxType;
	/** `"row"` (default) puts the label beside the input, `"stacked"` above it. */
	layout?: FieldLayout;
	/** Wrapper width — the stacked examples in the docs use `200px`. */
	width?: number | string;
	/**
	 * Mark the field invalid: a red outline plus `aria-invalid`. Inherited from a
	 * surrounding `Field` that has an `error`.
	 */
	invalid?: boolean;
	/** Id of the input. A stable one is generated when omitted. */
	id?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { sizeStyle } from "../utils/css";

/**
 * A single-line text box.
 *
 * Renders a `.field-row` (or `.field-row-stacked`) wrapper around a `<label>`
 * and the input, mirroring how the original stylesheet expects the two to be
 * paired.
 */
defineOptions({ name: "TextBox", inheritAttrs: false });

const props = withDefaults(defineProps<TextBoxProps>(), {
	label: undefined,
	type: "text",
	layout: "row",
	width: undefined,
	invalid: undefined,
	id: undefined,
});

const slots = defineSlots<{ label?: () => unknown }>();
const attrs = useAttrs();

const field = useField();
const generatedId = useId();
const inputId = computed(() => props.id ?? field?.value.controlId ?? generatedId);
const isInvalid = computed(() => props.invalid ?? field?.value.invalid ?? false);
// Read through getters rather than `field?.x` inside the template: the
// `v-else` branch narrows `field` to `null`, which makes the access a type error
// even though it is a harmless no-op there.
const fieldRequired = computed(() => field?.value.required ?? false);
const fieldDescribedBy = computed(() => field?.value.describedBy);

const wrapperStyle = computed(() =>
	sizeStyle("width", props.width),
);

// Inside a `Field` the caption and the messages belong to the field, so the
// wrapper (and with it the control's own `.field-row` layout) is dropped and
// the caption is only rendered when it was given explicitly. `layout="none"`
// asks for the same bare fragment outside a field.
</script>

<template>
	<template v-if="field || props.layout === 'none'">
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<input
			:id="inputId"
			:type="props.type"
			:class="cx(isInvalid && 'invalid')"
			:aria-invalid="isInvalid || undefined"
			:aria-required="fieldRequired || undefined"
			:aria-describedby="fieldDescribedBy"
			v-bind="attrs"
		/>
	</template>

	<div
		v-else
		:class="cx(props.layout === 'stacked' ? 'field-row-stacked' : 'field-row')"
		:style="wrapperStyle"
	>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<input
			:id="inputId"
			:type="props.type"
			:class="cx(isInvalid && 'invalid')"
			:aria-invalid="isInvalid || undefined"
			:aria-required="fieldRequired || undefined"
			:aria-describedby="fieldDescribedBy"
			v-bind="attrs"
		/>
	</div>
</template>
