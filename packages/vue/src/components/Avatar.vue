<script lang="ts">
export interface AvatarProps {
	/** Image URL. When it is missing or fails to load, `fallback` is shown. */
	src?: string;
	/** Alt text for the image. A decorative avatar can pass `""`. */
	alt?: string;
	/** Content used when there is no image: usually initials. A `fallback` slot overrides it. */
	fallback?: string;
	/** Pixel size. Defaults to `32`. */
	size?: number;
	/** Windows 98 tiles are square; `"circle"` is there for modern layouts. */
	shape?: "square" | "circle";
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { cx } from "../utils/cx";

/**
 * A user tile.
 *
 * ```vue
 * <Avatar src="/me.png" alt="Meorion" fallback="MO" />
 * ```
 *
 * Modelled on the Windows 98 logon tiles: a sunken square with the picture
 * inside. If the image is missing — or errors while loading, which is the case
 * that matters — the `fallback` (initials, typically) is rendered instead.
 */
defineOptions({ name: "Avatar" });

const props = withDefaults(defineProps<AvatarProps>(), {
	src: undefined,
	alt: "",
	fallback: undefined,
	size: 32,
	shape: "square",
});

const slots = defineSlots<{
	/** Content used when there is no image: usually initials. Overrides `fallback`. */
	fallback?: () => unknown;
}>();

/** Set by the image's `error` event; stays set, exactly like React's state. */
const failed = ref(false);

const showImage = computed(() => props.src !== undefined && props.src !== "" && !failed.value);
</script>

<template>
	<span
		class="avatar"
		:class="cx(props.shape === 'circle' && 'avatar-circle')"
		:style="{ '--avatar-size': `${props.size}px` }"
	>
		<img
			v-if="showImage"
			class="avatar-image"
			:src="props.src"
			:alt="props.alt"
			:width="props.size"
			:height="props.size"
			@error="failed = true"
		/>
		<span v-else-if="slots.fallback || props.fallback !== undefined" class="avatar-fallback">
			<slot name="fallback">{{ props.fallback }}</slot>
		</span>
	</span>
</template>
