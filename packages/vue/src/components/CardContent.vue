<script lang="ts">
/** No component-specific props: `<div>` attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CardContentProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "CardContent" });

defineProps<CardContentProps>();
</script>

<template>
	<div class="card-content">
		<slot />
	</div>
</template>
