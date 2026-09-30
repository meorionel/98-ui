<script lang="ts">
import type { ButtonProps } from "./Button.vue";

/**
 * A `ToggleButton` is a `Button` whose pressed state it owns itself, so its
 * public surface is `Button`'s minus `pressed`, plus the controllable pair.
 *
 * React's `onPressedChange` is the `pressed-change` emit (also reachable as
 * `@update:pressed`, so `v-model:pressed` works).
 *
 * `variant`, `active`, `focused`, `type`, `disabled` and every other button
 * attribute are not declared here: they reach the inner `Button` through Vue's
 * attribute fallthrough, exactly like React's `{...rest}`.
 */
export interface ToggleButtonProps extends Omit<ButtonProps, "pressed"> {
	/** Controlled pressed state. */
	pressed?: boolean;
	/** Initial pressed state while uncontrolled. */
	defaultPressed?: boolean;
}
</script>

<script setup lang="ts">
import { useControllableState } from "../utils/controllable";
import Button from "./Button.vue";

/**
 * A button that stays pressed until it is pressed again — the Windows 98
 * "toggle button" (what other libraries call a switch).
 *
 * ```vue
 * <ToggleButton default-pressed>Bold</ToggleButton>
 * ```
 *
 * State is exposed as `aria-pressed`, and the sunken border that
 * `Button variant="toolbar"` draws is driven by it, so a toggled button looks
 * pressed instead of merely tinted.
 *
 * Only `pressed`/`defaultPressed` are declared props; the rest of `Button`'s
 * attributes fall through to it. `forwardRef` needs no port: the root element of
 * a Vue component is exposed as `$el`.
 */
defineOptions({ name: "ToggleButton" });

const props = withDefaults(
	defineProps<{ pressed?: boolean; defaultPressed?: boolean }>(),
	{
		pressed: undefined,
		defaultPressed: false,
	},
);

const emit = defineEmits<{
	click: [event: MouseEvent];
	"update:pressed": [pressed: boolean];
	"pressed-change": [pressed: boolean];
}>();

const [isPressed, setPressed] = useControllableState<boolean>({
	value: () => props.pressed,
	defaultValue: props.defaultPressed,
	onChange: (next) => {
		emit("update:pressed", next);
		emit("pressed-change", next);
	},
});

const handleClick = (event: MouseEvent) => {
	emit("click", event);
	if (event.defaultPrevented) return;
	setPressed(!isPressed.value);
};
</script>

<template>
	<Button :pressed="isPressed" @click="handleClick">
		<slot />
	</Button>
</template>
