<script lang="ts">
import type { FieldLayout } from "./TextBox.vue";

export interface TextAreaProps {
	/** Content of the associated `<label>`. A `label` slot overrides it. */
	label?: string;
	/** `"row"` puts the label beside the area, `"stacked"` (default) above it. */
	layout?: FieldLayout;
	/** Wrapper width — the stacked examples in the docs use `200px`. */
	width?: number | string;
	/** Mark the field invalid: a red outline plus `aria-invalid`. */
	invalid?: boolean;
	/** Id of the textarea. A stable one is generated when omitted. */
	id?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
import { cx } from "../utils/cx";
import { useField } from "../utils/fieldContext";
import { sizeStyle } from "../utils/css";

/**
 * A multi-line text box. Rendered as a native `<textarea>`, which the
 * stylesheet treats exactly like a single-line text box.
 */
defineOptions({ name: "TextArea", inheritAttrs: false });

const props = withDefaults(defineProps<TextAreaProps>(), {
	label: undefined,
	layout: "stacked",
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

// Inside a `Field` the caption and the messages belong to the field, so the
// wrapper is dropped and the caption is only rendered when it was given
// explicitly. `layout="none"` asks for the same bare fragment outside a field.
</script>

<template>
	<template v-if="field || props.layout === 'none'">
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<textarea
			:id="inputId"
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
		:style="sizeStyle('width', props.width)"
	>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<textarea
			:id="inputId"
			:class="cx(isInvalid && 'invalid')"
			:aria-invalid="isInvalid || undefined"
			:aria-required="fieldRequired || undefined"
			:aria-describedby="fieldDescribedBy"
			v-bind="attrs"
		/>
	</div>
</template>
