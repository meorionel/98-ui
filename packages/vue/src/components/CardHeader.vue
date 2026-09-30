<script lang="ts">
/** No component-specific props: `<div>` attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CardHeaderProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "CardHeader" });

defineProps<CardHeaderProps>();
</script>

<template>
	<div class="card-header">
		<slot />
	</div>
</template>
