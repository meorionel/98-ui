<script lang="ts">
/** No component-specific props: anchor attributes fall through to the element. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinkProps {}
</script>

<script setup lang="ts">
/**
 * An anchor using the Windows 98 link blue with the dotted focus ring.
 * (`a` is styled globally by the stylesheet; this component just adds typing
 * and an optional `external` convenience.)
 */
defineOptions({ name: "Link" });

defineProps<LinkProps>();
</script>

<template>
	<a>
		<slot />
	</a>
</template>
