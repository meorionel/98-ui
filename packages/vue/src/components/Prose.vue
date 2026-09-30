<script lang="ts">
/** No component-specific props: `<div>` attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProseProps {}
</script>

<script setup lang="ts">
/**
 * A block of rendered rich text — markdown output, a README, a help page.
 *
 * ```vue
 * <Prose>
 *   <h2>Disk Defragmenter</h2>
 *   <p>Rearranges the files on your disk so programs start faster.</p>
 *   <ul><li>Close other programs first.</li></ul>
 * </Prose>
 * ```
 *
 * Everything inside is scoped: headings get UI-sized text, paragraphs get the
 * library's rhythm, and links, code, quotes, lists and tables pick up the theme
 * instead of the browser defaults.
 */
defineOptions({ name: "Prose" });

defineProps<ProseProps>();
</script>

<template>
	<div class="prose">
		<slot />
	</div>
</template>
