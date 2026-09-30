<script lang="ts">
/** No component-specific props: `<p>` attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CardDescriptionProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "CardDescription" });

defineProps<CardDescriptionProps>();
</script>

<template>
	<p class="card-description">
		<slot />
	</p>
</template>
