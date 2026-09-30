<script lang="ts">
import { inject, type ComputedRef, type InjectionKey } from "vue";

/** `"single"` behaves like a radio group, `"multiple"` like check boxes. */
export type ToggleGroupType = "single" | "multiple";

/** What a `ToggleGroup` hands to its `ToggleGroupItem`s. React's context value. */
export interface ToggleGroupContextValue {
	type: ToggleGroupType;
	isPressed: (value: string) => boolean;
	toggle: (value: string) => void;
	disabled: boolean;
}

/**
 * React's `ToggleGroupContext` as a Vue injection key. The value is a
 * `ComputedRef` so an item follows the group's `type`, `disabled` and selection
 * the way React's `useContext` re-renders it.
 */
export const TOGGLE_GROUP_CONTEXT: InjectionKey<ComputedRef<ToggleGroupContextValue>> =
	Symbol("98-pink:toggle-group");

/** The surrounding `ToggleGroup`, or `null` when the item stands alone. */
export function useToggleGroupContext(): ComputedRef<ToggleGroupContextValue> | null {
	return inject(TOGGLE_GROUP_CONTEXT, null);
}

export interface ToggleGroupProps {
	/** `"single"` behaves like a radio group, `"multiple"` like check boxes. */
	type?: ToggleGroupType;
	/** Controlled selection: one value for `"single"`, an array for `"multiple"`. */
	value?: string | string[];
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string | string[];
	/** Initial selection while uncontrolled. */
	defaultValue?: string | string[];
	/** Accessible name for the group. */
	label?: string;
	/** Disable every button in the group. */
	disabled?: boolean;
	/** Stack the buttons vertically. */
	vertical?: boolean;
}
</script>

<script setup lang="ts">
import { computed, provide } from "vue";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/controllable";

/**
 * A group of `ToggleGroupItem` buttons that share one selection.
 *
 * ```vue
 * <ToggleGroup default-value="left" label="Alignment">
 *   <ToggleGroupItem value="left">Left</ToggleGroupItem>
 *   <ToggleGroupItem value="center">Center</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * In `"single"` mode selecting an item replaces the selection; in `"multiple"`
 * mode each item toggles independently.
 *
 * React's `onValueChange` is the `value-change` emit (also reachable as
 * `@update:value` / `@update:model-value`).
 */
defineOptions({ name: "ToggleGroup" });

const props = withDefaults(defineProps<ToggleGroupProps>(), {
	type: "single",
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	label: undefined,
	disabled: false,
	vertical: false,
});

const emit = defineEmits<{
	"update:value": [value: string | string[]];
	"update:modelValue": [value: string | string[]];
	"value-change": [value: string | string[]];
}>();

function toArray(value: string | string[] | undefined): string[] {
	if (value === undefined) return [];
	return Array.isArray(value) ? value : [value];
}

const [values, setValues] = useControllableState<string[]>({
	value: () => {
		const current = props.modelValue ?? props.value;
		return current === undefined ? undefined : toArray(current);
	},
	defaultValue: toArray(props.defaultValue),
	onChange: (next) => {
		const value = props.type === "single" ? (next[0] ?? "") : next;
		emit("update:value", value);
		emit("update:modelValue", value);
		emit("value-change", value);
	},
});

const context = computed<ToggleGroupContextValue>(() => ({
	type: props.type,
	disabled: props.disabled,
	isPressed: (item) => values.value.includes(item),
	toggle: (item) => {
		if (props.type === "single") {
			// Like a radio group: the active item stays active.
			if (!values.value.includes(item)) setValues([item]);
			return;
		}
		setValues(
			values.value.includes(item)
				? values.value.filter((entry) => entry !== item)
				: [...values.value, item],
		);
	},
}));

provide(TOGGLE_GROUP_CONTEXT, context);
</script>

<template>
	<div
		role="group"
		:aria-label="props.label"
		class="button-group"
		:class="cx(props.vertical && 'button-group-vertical')"
	>
		<slot />
	</div>
</template>
