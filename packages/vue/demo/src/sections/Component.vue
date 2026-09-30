<script setup lang="ts">
/**
 * Wraps a section body in the `.component` two-column layout.
 *
 * This is the React port's `Component` helper: the heading is rendered by
 * `Section.vue` (or by the page shell for the prose chapters) directly above it.
 */
defineOptions({ name: "Component" });
</script>

<template>
	<section class="component">
		<div class="component-body">
			<slot />
		</div>
	</section>
</template>
