<script lang="ts">
/** No component-specific props: `<div>` attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CardFooterProps {}
</script>

<script setup lang="ts">
defineOptions({ name: "CardFooter" });

defineProps<CardFooterProps>();
</script>

<template>
	<div class="card-footer">
		<slot />
	</div>
</template>
