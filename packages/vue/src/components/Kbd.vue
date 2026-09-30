<script lang="ts">
/** No component-specific props: the React original is `HTMLAttributes<HTMLElement>`. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KbdProps {}
</script>

<script setup lang="ts">
/**
 * A keycap, for documenting a shortcut next to the command it runs.
 *
 * ```vue
 * <FieldRow>
 *   <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> saves the file.
 * </FieldRow>
 * ```
 */
defineOptions({ name: "Kbd" });

defineProps<KbdProps>();
</script>

<template>
	<kbd class="kbd">
		<slot />
	</kbd>
</template>
