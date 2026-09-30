<script lang="ts">
export interface TabListProps {
	/** Stretch the tabs evenly across the full width (`menu.multirows`). */
	multirows?: boolean;
	/** Accessible name for the tab list. */
	label?: string;
}
</script>

<script setup lang="ts">
import { ref } from "vue";
import { cx } from "../utils/cx";

/** The strip of tabs. Renders `<menu role="tablist">`. */
defineOptions({ name: "TabList" });

const props = withDefaults(defineProps<TabListProps>(), {
	multirows: false,
	label: undefined,
});

/**
 * React destructured `onKeyDown` out of its own props and called it first, so a
 * caller could cancel the Windows arrow-key behaviour with `preventDefault()`.
 * Emitting before the check keeps that order.
 */
const emit = defineEmits<{ keydown: [event: KeyboardEvent] }>();

// React typed the intrinsic `<menu>` element as `HTMLElement` (not
// `HTMLMenuElement`), so the ref type follows suit.
const listRef = ref<HTMLElement | null>(null);

const handleKeyDown = (event: KeyboardEvent) => {
	emit("keydown", event);
	if (event.defaultPrevented) return;

	const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
	if (!keys.includes(event.key)) return;

	const tabs = Array.from(
		listRef.value?.querySelectorAll<HTMLLIElement>('[role="tab"]:not([aria-disabled="true"])') ??
			[],
	);
	if (tabs.length === 0) return;

	event.preventDefault();
	const current = tabs.findIndex((tab) => tab === document.activeElement);
	let next = current;
	if (event.key === "ArrowRight") next = (current + 1 + tabs.length) % tabs.length;
	if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
	if (event.key === "Home") next = 0;
	if (event.key === "End") next = tabs.length - 1;

	const nextTab = tabs[next];
	nextTab.focus();
	// Follow the Windows behaviour: arrowing to a tab selects it.
	const link = nextTab.querySelector<HTMLAnchorElement>("a");
	if (link) link.click();
};
</script>

<template>
	<menu
		ref="listRef"
		role="tablist"
		:aria-label="props.label"
		:class="cx(props.multirows && 'multirows')"
		@keydown="handleKeyDown"
	>
		<slot />
	</menu>
</template>
