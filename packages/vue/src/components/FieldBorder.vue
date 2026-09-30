<script lang="ts">
export interface FieldBorderProps {
	/** Which element to render. Defaults to `div`. */
	as?: string;
}
</script>

<script setup lang="ts">
/**
 * The field border style: sunken outer + sunken inner, on the button-highlight
 * interior. Used by work areas and any control that needs the engraved inset.
 */
defineOptions({ name: "FieldBorder" });

const props = withDefaults(defineProps<FieldBorderProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="field-border">
		<slot />
	</component>
</template>
