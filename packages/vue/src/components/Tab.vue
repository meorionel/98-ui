<script lang="ts">
export interface TabProps {
	/** Identifies this tab and links it to the matching `TabPanel`. */
	value: string;
	/** Render the tab inert: it cannot be selected or reached with the arrow keys. */
	disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useTabsContext } from "./Tabs.vue";

/** A single tab. The anchor inside keeps the original focus styling. */
defineOptions({ name: "Tab" });

const props = withDefaults(defineProps<TabProps>(), {
	disabled: false,
});

/**
 * React called the caller's `onClick` first and only selected when the event had
 * not been prevented. Emitting first and then reading `defaultPrevented` keeps
 * that order, so a parent can still veto the selection.
 */
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const tabs = useTabsContext("Tab");
const isSelected = computed(() => tabs.value.value === props.value);
const panelId = computed(() => `${tabs.value.baseId}-panel-${props.value}`);
const tabId = computed(() => `${tabs.value.baseId}-tab-${props.value}`);

const select = () => {
	if (!props.disabled) tabs.value.setValue(props.value);
};

const handleClick = (event: MouseEvent) => {
	emit("click", event);
	if (!event.defaultPrevented) select();
};

const handleLinkClick = (event: MouseEvent) => {
	event.preventDefault();
	select();
};
</script>

<template>
	<li
		:id="tabId"
		role="tab"
		:aria-selected="isSelected"
		:aria-controls="panelId"
		:aria-disabled="props.disabled || undefined"
		:tabindex="props.disabled ? -1 : isSelected ? 0 : -1"
		@click="handleClick"
	>
		<a :href="`#${panelId}`" @click="handleLinkClick">
			<slot />
		</a>
	</li>
</template>
