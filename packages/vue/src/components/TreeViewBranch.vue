<script lang="ts">
export interface TreeViewBranchProps {
	/** The always-visible summary row. A `label` slot overrides it. */
	label?: string;
	/** Controlled expansion state. */
	open?: boolean;
	/** Initial expansion state for uncontrolled usage. */
	defaultOpen?: boolean;
}
</script>

<script setup lang="ts">
import { useControllableState } from "../utils/controllable";

/**
 * An expandable branch. Renders native `<details>`/`<summary>`, which is what
 * gives the `+` / `-` markers in the stylesheet for free.
 */
defineOptions({ name: "TreeViewBranch" });

const props = withDefaults(defineProps<TreeViewBranchProps>(), {
	label: undefined,
	open: undefined,
	defaultOpen: false,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
}>();

const [isOpen, setIsOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const onToggle = (event: Event) => {
	setIsOpen((event.currentTarget as HTMLDetailsElement).open);
};
</script>

<template>
	<li>
		<details :open="isOpen" @toggle="onToggle">
			<summary>
				<slot name="label">{{ props.label }}</slot>
			</summary>
			<ul>
				<slot />
			</ul>
		</details>
	</li>
</template>
