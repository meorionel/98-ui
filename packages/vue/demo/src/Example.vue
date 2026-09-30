<script lang="ts">
/** Strips the common leading indentation from a template literal. */
export function dedent(value: string): string {
	const lines = value.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
	const widths = lines
		.filter((line) => line.trim() !== "")
		.map((line) => /^[\t ]*/.exec(line)?.[0].length ?? 0);
	const indent = widths.length > 0 ? Math.min(...widths) : 0;
	return lines.map((line) => line.slice(indent)).join("\n");
}

export interface ExampleProps {
	/**
	 * Source shown behind "Show code".
	 *
	 * Deliberately always English: it documents the API, so translating it would
	 * obscure prop names and identifiers.
	 */
	code: string;
	/** Optional caption above the preview. A `caption` slot overrides it. */
	caption?: string;
}
</script>

<script setup lang="ts">
import { useI18n } from "./i18n";

/**
 * Live preview plus a collapsible source view — the pattern the docs use.
 *
 * ```vue
 * <Example :code="`<Button>OK</Button>`">
 *   <Button>OK</Button>
 * </Example>
 * ```
 */
defineOptions({ name: "Example" });

const props = withDefaults(defineProps<ExampleProps>(), { caption: undefined });
const { t } = useI18n();
</script>

<template>
	<div class="example">
		<p v-if="props.caption !== undefined">
			<slot name="caption">{{ props.caption }}</slot>
		</p>
		<div class="example-preview">
			<slot />
		</div>
		<details>
			<summary>{{ t("common.showCode") }}</summary>
			<pre><code>{{ dedent(props.code) }}</code></pre>
		</details>
	</div>
</template>
