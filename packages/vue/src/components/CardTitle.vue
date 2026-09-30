<script lang="ts">
export interface CardTitleProps {
	/** Heading element to render. Defaults to `"h3"`. */
	as?: "h2" | "h3" | "h4";
}
</script>

<script setup lang="ts">
defineOptions({ name: "CardTitle" });

const props = withDefaults(defineProps<CardTitleProps>(), { as: "h3" });
</script>

<template>
	<component :is="props.as" class="card-title">
		<slot />
	</component>
</template>
