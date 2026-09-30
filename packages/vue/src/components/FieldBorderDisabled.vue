<script lang="ts">
export interface FieldBorderDisabledProps {
	/** Which element to render. Defaults to `div`. */
	as?: string;
}
</script>

<script setup lang="ts">
/** The field border style with the read-only/disabled interior colour. */
defineOptions({ name: "FieldBorderDisabled" });

const props = withDefaults(defineProps<FieldBorderDisabledProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="field-border-disabled">
		<slot />
	</component>
</template>
