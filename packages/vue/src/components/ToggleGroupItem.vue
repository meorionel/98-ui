<script lang="ts">
import type { ToggleButtonProps } from "./ToggleButton.vue";

export interface ToggleGroupItemProps
	extends Omit<ToggleButtonProps, "pressed" | "defaultPressed" | "onPressedChange"> {
	/** This item's value inside the group. */
	value: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import ToggleButton from "./ToggleButton.vue";
import { useToggleGroupContext } from "./ToggleGroup.vue";

/** One button of a `ToggleGroup`. Inherits the group's selection and disabled state. */
defineOptions({ name: "ToggleGroupItem" });

const props = withDefaults(defineProps<{ value: string; disabled?: boolean }>(), {
	disabled: undefined,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const injected = useToggleGroupContext();
if (!injected) {
	throw new Error("<ToggleGroupItem> must be used inside a <ToggleGroup>.");
}

/** The group context. The guard above rules out the `null` branch. */
const group = injected;

const pressed = computed(() => group.value.isPressed(props.value));
const isDisabled = computed(() => props.disabled ?? group.value.disabled);

const handleClick = (event: MouseEvent) => {
	emit("click", event);
	if (event.defaultPrevented) return;
	group.value.toggle(props.value);
};
</script>

<template>
	<ToggleButton :pressed="pressed" :disabled="isDisabled" @click="handleClick">
		<slot />
	</ToggleButton>
</template>
