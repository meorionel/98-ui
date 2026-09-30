<script lang="ts">
export interface StatusFieldBorderProps {
	/** Which element to render. Defaults to `div`. */
	as?: string;
}
</script>

<script setup lang="ts">
/** The lighter status field border style, for read-only dynamic content. */
defineOptions({ name: "StatusFieldBorder" });

const props = withDefaults(defineProps<StatusFieldBorderProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="status-field-border">
		<slot />
	</component>
</template>
