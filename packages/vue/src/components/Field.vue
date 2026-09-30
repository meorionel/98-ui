<script lang="ts">
export interface FieldProps {
	/** Caption for the control. Not rendered when omitted. A `label` slot overrides it. */
	label?: string;
	/** Hint shown under the control, wired to `aria-describedby`. A `description` slot overrides it. */
	description?: string;
	/** Error message. Its presence also marks the control invalid. An `error` slot overrides it. */
	error?: string | null | false;
	/** Marks the label and the control as required. */
	required?: boolean;
	/** Use this id for the control instead of a generated one. */
	htmlFor?: string;
}
</script>

<script setup lang="ts">
import { computed, provide, useId } from "vue";
import { FIELD_CONTEXT } from "../utils/fieldContext";

/**
 * A labelled form field: label, control, hint and error message.
 *
 * ```vue
 * <Field label="Occupation" description="As it appears on your tax return" :error="errors.occupation">
 *   <TextBox width="200" />
 * </Field>
 * ```
 *
 * The control does not need an `id`, `aria-describedby` or `aria-invalid` — the
 * field supplies all three through context, and drops the control's own label so
 * the caption is not duplicated. Pass `invalid` explicitly on a control that is
 * used outside a field.
 */
defineOptions({ name: "Field" });

const props = withDefaults(defineProps<FieldProps>(), {
	label: undefined,
	description: undefined,
	error: undefined,
	required: false,
	htmlFor: undefined,
});

const slots = defineSlots<{
	default?: () => unknown;
	label?: () => unknown;
	description?: () => unknown;
	error?: () => unknown;
}>();

const generatedId = useId();
const controlId = computed(() => props.htmlFor ?? `${generatedId}control`);
const descriptionId = `${generatedId}description`;
const errorId = `${generatedId}error`;
const hasDescription = computed(
	() => props.description !== undefined || Boolean(slots.description),
);
const hasError = computed(
	() =>
		(props.error !== undefined && props.error !== null && props.error !== false) ||
		Boolean(slots.error),
);

const describedBy = computed(
	() =>
		[hasDescription.value ? descriptionId : null, hasError.value ? errorId : null]
			.filter((id): id is string => id !== null)
			.join(" ") || undefined,
);

// The control picks up the id, the described-by ids and the invalid/required
// state through context, so it never has to repeat the field's own wiring.
provide(
	FIELD_CONTEXT,
	computed(() => ({
		controlId: controlId.value,
		describedBy: describedBy.value,
		invalid: hasError.value,
		required: props.required,
	})),
);
</script>

<template>
	<div class="field">
		<label
			v-if="props.label !== undefined || slots.label"
			class="field-label"
			:for="controlId"
		>
			<slot name="label">{{ props.label }}</slot>
			<span v-if="props.required" class="field-required" aria-hidden="true">*</span>
		</label>

		<slot />

		<div v-if="hasDescription" class="field-description" :id="descriptionId">
			<slot name="description">{{ props.description }}</slot>
		</div>

		<div v-if="hasError" class="field-error" :id="errorId" aria-live="polite">
			<slot name="error">{{ props.error }}</slot>
		</div>
	</div>
</template>
