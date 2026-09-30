<script lang="ts">
export interface PortalProps {
	/** Element (or selector) to render into. Defaults to `document.body`. */
	to?: string | HTMLElement | null;
	/**
	 * Render the children in place instead of teleporting them.
	 *
	 * This is what makes a layer statically renderable — documentation previews
	 * and the SSR smoke tests both use it.
	 */
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PortalProps>(), {
	to: undefined,
	disabled: false,
});

// Nothing is emitted before the component has mounted: the server renderer has
// no teleport target, and rendering the children in place first would force Vue
// to move a live subtree into the teleport after hydration — throwing away the
// focused element along the way. Mounting into the teleport exactly once keeps
// focus, measurement and event handlers attached to the node that ends up on
// screen.
const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});

const target = computed(() => props.to ?? "body");
</script>

<template>
	<Teleport v-if="!disabled && mounted" :to="target">
		<slot />
	</Teleport>
	<template v-else-if="disabled">
		<slot />
	</template>
</template>
