<script lang="ts">
export interface GroupBoxProps {
	/** Text rendered in the `<legend>` engraved into the frame. A `legend` slot overrides it. */
	legend?: string;
}
</script>

<script setup lang="ts">
/**
 * A group box — the engraved frame Windows 98 uses to organise related
 * controls. Renders a native `<fieldset>`/`<legend>` pair so it stays
 * accessible; the border comes from an inlined SVG `border-image`.
 */
defineOptions({ name: "GroupBox" });

const props = withDefaults(defineProps<GroupBoxProps>(), { legend: undefined });

const slots = defineSlots<{ default?: () => unknown; legend?: () => unknown }>();
</script>

<template>
	<fieldset>
		<legend v-if="props.legend !== undefined || slots.legend">
			<slot name="legend">{{ props.legend }}</slot>
		</legend>
		<slot />
	</fieldset>
</template>
