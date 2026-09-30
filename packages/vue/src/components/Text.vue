<script lang="ts">
export type TextVariant = "body" | "lead" | "muted" | "small";

export interface TextProps {
	/** Element to render. Defaults to `"p"`. */
	as?: string;
	variant?: TextVariant;
}
</script>

<script setup lang="ts">
/**
 * Body copy in one of the four weights the library uses.
 *
 * ```vue
 * <Text variant="lead">Setup has finished.</Text>
 * <Text variant="muted" as="span">C:\Windows</Text>
 * ```
 */
defineOptions({ name: "Text" });

const props = withDefaults(defineProps<TextProps>(), { as: "p", variant: "body" });
</script>

<template>
	<component :is="props.as" class="text" :class="`text-${props.variant}`">
		<slot />
	</component>
</template>
