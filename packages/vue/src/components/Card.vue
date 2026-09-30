<script lang="ts">
export interface CardProps {
	/** Which element to render. Defaults to `div`. */
	as?: string;
}
</script>

<script setup lang="ts">
/**
 * A framed container with a header, content and footer.
 *
 * ```vue
 * <Card :style="{ width: 260 }">
 *   <CardHeader>
 *     <CardTitle>Modem</CardTitle>
 *     <CardDescription>Standard 56k modem</CardDescription>
 *   </CardHeader>
 *   <CardContent>Connected at 33.6 kbps.</CardContent>
 *   <CardFooter>
 *     <Button>Properties</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * It uses the same raised window frame as `Window`, so a card and a window sit
 * together comfortably — the difference is that a card carries no title bar and
 * is meant to be dropped into a page.
 */
defineOptions({ name: "Card" });

const props = withDefaults(defineProps<CardProps>(), { as: "div" });
</script>

<template>
	<component :is="props.as" class="card">
		<slot />
	</component>
</template>
