<script lang="ts">
export interface StatusBarFieldProps {
	/**
	 * Which element to render. Defaults to `p`, matching the original docs.
	 * React's `ElementType` reaches Vue as a tag name string rendered through
	 * `<component :is>`.
	 */
	as?: string;
}
</script>

<script setup lang="ts">
/** One sunken cell inside a `StatusBar`. */
defineOptions({ name: "StatusBarField" });

const props = withDefaults(defineProps<StatusBarFieldProps>(), { as: "p" });
</script>

<template>
	<component :is="props.as" class="status-bar-field">
		<slot />
	</component>
</template>
