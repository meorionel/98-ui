<script lang="ts">
import type { ToggleButtonProps } from "./ToggleButton.vue";

export interface ToolbarButtonProps extends Omit<ToggleButtonProps, "variant"> {
	/**
	 * Glyph rendered before the label. React took a `ReactNode`; the Vue port
	 * renders it through the `icon` slot, with this string as the slot's
	 * fallback.
	 */
	icon?: string;
	/** Force a command button even when toggle props are present. */
	toggle?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Button from "./Button.vue";
import ToggleButton from "./ToggleButton.vue";

/**
 * A toolbar button.
 *
 * Supplying any of `pressed`, `defaultPressed` or `onPressedChange` turns it into
 * a toggle (a raised border until it is switched on); otherwise it is an ordinary
 * command button.
 *
 * It really is a `Button` with `variant="toolbar"` — or a `ToggleButton` when it
 * toggles — so no button logic is duplicated here: the label, the icon and every
 * other attribute fall through to that button (and a native `disabled` on it is
 * what keeps a disabled toolbar button silent).
 *
 * `forwardRef` needs no port: the root element of a Vue component is `$el`.
 */
defineOptions({ name: "ToolbarButton" });

const props = withDefaults(
	defineProps<{
		icon?: string;
		toggle?: boolean;
		pressed?: boolean;
		defaultPressed?: boolean;
	}>(),
	{
		icon: undefined,
		toggle: undefined,
		pressed: undefined,
		defaultPressed: undefined,
	},
);

const slots = defineSlots<{ default?: () => unknown; icon?: () => unknown }>();
const attrs = useAttrs();

/**
 * React decided between the two buttons from the *presence* of the toggle props.
 * A Vue listener is not a prop, so an `onPressedChange` (or `@update:pressed`)
 * handler is still visible among the fallthrough attributes — that is what this
 * looks at, so the attribute can keep falling through to the button it ends up
 * on.
 */
const hasPressedChange = computed(() => {
	const rest = attrs as Record<string, unknown>;
	return (
		rest.onPressedChange !== undefined ||
		rest["on-pressed-change"] !== undefined ||
		rest["onUpdate:pressed"] !== undefined ||
		rest["on-update:pressed"] !== undefined
	);
});

const isToggle = computed(
	() =>
		props.toggle === true ||
		(props.toggle !== false &&
			(props.pressed !== undefined ||
				props.defaultPressed !== undefined ||
				hasPressedChange.value)),
);
</script>

<template>
	<ToggleButton
		v-if="isToggle"
		variant="toolbar"
		:pressed="props.pressed"
		:default-pressed="props.defaultPressed"
	>
		<span
			v-if="props.icon !== undefined || slots.icon"
			class="toolbar-button-icon"
			aria-hidden="true"
		>
			<slot name="icon">{{ props.icon }}</slot>
		</span>
		<slot />
	</ToggleButton>

	<Button v-else variant="toolbar">
		<span
			v-if="props.icon !== undefined || slots.icon"
			class="toolbar-button-icon"
			aria-hidden="true"
		>
			<slot name="icon">{{ props.icon }}</slot>
		</span>
		<slot />
	</Button>
</template>
