<script lang="ts">
export interface CodeBlockProps {
	/** Skip the inner `<code>` wrapper and render the slot straight into `<pre>`. */
	raw?: boolean;
}
</script>

<script setup lang="ts">
/**
 * A sunken `<pre>` block for code, using the field border from the stylesheet.
 */
defineOptions({ name: "CodeBlock" });

const props = withDefaults(defineProps<CodeBlockProps>(), { raw: false });
</script>

<!-- The default slot is the code content; it renders inside a `<code>` element
     unless `raw` is set. Kept on one line because whitespace inside `<pre>` is
     significant, and React rendered `<pre><code>…</code></pre>` with no text
     nodes around it. -->
<template>
	<pre><code v-if="!props.raw"><slot /></code><slot v-else /></pre>
</template>
