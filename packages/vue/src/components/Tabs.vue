<script lang="ts">
import { inject, type ComputedRef, type InjectionKey } from "vue";

/**
 * What a `Tabs` tells every `Tab`, `TabList` and `TabPanel` inside it.
 *
 * A `ComputedRef` is provided rather than a plain object so the consumer stays
 * reactive when the controlled `value` prop changes.
 */
export interface TabsContextValue {
	/** The currently selected tab value. */
	value: string;
	/** Request a new selected value. */
	setValue: (value: string) => void;
	/** Id prefix shared by the tabs and their panels. */
	baseId: string;
	/** Whether inactive panels stay mounted and are hidden instead. */
	keepMounted: boolean;
}

export const TABS_CONTEXT: InjectionKey<ComputedRef<TabsContextValue>> = Symbol("98-pink:tabs");

/**
 * The surrounding `Tabs`, or a hard failure.
 *
 * React's `useContext` returned `null` outside a provider and the component
 * threw; Vue's `inject` does the same, so the message is kept verbatim.
 */
export function useTabsContext(component: string): ComputedRef<TabsContextValue> {
	const context = inject(TABS_CONTEXT, null);
	if (!context) {
		throw new Error(`<${component}> must be rendered inside a <Tabs> component.`);
	}
	return context;
}

export interface TabsProps {
	/** Controlled active tab value. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial active tab value for uncontrolled usage. */
	defaultValue?: string;
	/**
	 * Keep inactive panels mounted and hide them with `hidden` instead of
	 * unmounting. Useful when panel content holds state or expensive DOM.
	 */
	keepMounted?: boolean;
}
</script>

<script setup lang="ts">
import { computed, provide, useId } from "vue";
import { useControllableState } from "../utils/controllable";

/**
 * A tab control.
 *
 * ```vue
 * <Tabs default-value="desktop">
 *   <TabList>
 *     <Tab value="desktop">Desktop</Tab>
 *     <Tab value="computer">My computer</Tab>
 *   </TabList>
 *   <TabPanel value="desktop">the tab content</TabPanel>
 * </Tabs>
 * ```
 *
 * State lives here, so no custom JavaScript is needed to toggle
 * `aria-selected` the way the plain-CSS version required.
 */
defineOptions({ name: "Tabs" });

const props = withDefaults(defineProps<TabsProps>(), {
	value: undefined,
	modelValue: undefined,
	defaultValue: "",
	keepMounted: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
	"update:value": [value: string];
	"value-change": [value: string];
	change: [value: string];
}>();

const baseId = useId();
const [selected, setSelected] = useControllableState<string>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue,
	onChange: (next) => {
		emit("update:modelValue", next);
		emit("update:value", next);
		emit("value-change", next);
		// React named the callback prop `onChange`, so the React-style listener
		// (`:on-change="…"` / `@change`) keeps working next to `v-model:value`.
		emit("change", next);
	},
});

provide(
	TABS_CONTEXT,
	computed<TabsContextValue>(() => ({
		value: selected.value,
		setValue: setSelected,
		baseId,
		keepMounted: props.keepMounted,
	})),
);
</script>

<template>
	<div>
		<slot />
	</div>
</template>
