<script lang="ts">
export interface TabPanelProps {
	/** Must match the `value` of the `Tab` it belongs to. */
	value: string;
	/** Wrap the content in a `.window-body`. Defaults to `true`. */
	body?: boolean;
	/**
	 * `"window"` (default) draws the raised panel that merges with the selected
	 * tab. `"flat"` drops the window chrome so the panel can live inside a
	 * dialog — that is what `PropertySheet` uses.
	 */
	variant?: "window" | "flat";
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { cx } from "../utils/cx";
import { useTabsContext } from "./Tabs.vue";

/**
 * The panel shown for the matching `Tab`. Renders a `.window[role=tabpanel]`
 * so it visually merges with the selected tab.
 */
defineOptions({ name: "TabPanel" });

const props = withDefaults(defineProps<TabPanelProps>(), {
	body: true,
	variant: "window",
});

const tabs = useTabsContext("TabPanel");
const isSelected = computed(() => tabs.value.value === props.value);
// React's early `return null` for an unmounted inactive panel becomes the `v-if`
// below; `keepMounted` keeps it in the tree with `hidden` instead.
const keepMounted = computed(() => tabs.value.keepMounted);
const panelId = computed(() => `${tabs.value.baseId}-panel-${props.value}`);
const tabId = computed(() => `${tabs.value.baseId}-tab-${props.value}`);
</script>

<template>
	<div
		v-if="isSelected || keepMounted"
		:id="panelId"
		role="tabpanel"
		:aria-labelledby="tabId"
		:hidden="!isSelected"
		tabindex="0"
		:class="cx(props.variant === 'window' && 'window')"
	>
		<div v-if="props.body" class="window-body">
			<slot />
		</div>
		<template v-else>
			<slot />
		</template>
	</div>
</template>
