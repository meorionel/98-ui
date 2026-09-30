<script lang="ts">
export interface ButtonProps {
	/**
	 * `"default"` adds the thicker inner ring Windows 98 uses for the button
	 * that responds to <kbd>Enter</kbd> in the active window. `"toolbar"` draws
	 * the flat common-toolbar button that only shows its border on hover.
	 */
	variant?: "normal" | "default" | "toolbar";
	/**
	 * Force the pressed/sunken look without an actual pointer press.
	 * Handy for docs, Storybook and visual regression tests.
	 */
	active?: boolean;
	/** Force the dotted focus ring. Handy for docs and visual tests. */
	focused?: boolean;
	/**
	 * Toggle state: adds the sunken look *and* `aria-pressed`, which is what
	 * turns a button into a toggle for assistive technology. Leave it
	 * `undefined` for an ordinary command button.
	 */
	pressed?: boolean;
	/** Native button type. Defaults to `"button"`, so it never submits a form. */
	type?: "button" | "submit" | "reset";
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

/**
 * The Windows 98 command button ("push button").
 *
 * ```vue
 * <Button variant="default" @click="save">OK</Button>
 * ```
 *
 * Focus and pressed styling come from real `:focus` / `:active` state in the
 * stylesheet; the `active`/`focused` props only *simulate* those states.
 */
defineOptions({ name: "Button" });

const props = withDefaults(defineProps<ButtonProps>(), {
	variant: "normal",
	active: false,
	focused: false,
	pressed: undefined,
	type: "button",
});
</script>

<template>
	<button
		:type="type"
		:aria-pressed="props.pressed"
		:class="
			cx(
				props.variant === 'default' && 'default',
				props.variant === 'toolbar' && 'toolbar-button',
				(props.active || props.pressed === true) && 'force-active',
				props.focused && 'force-focused',
			)
		"
	>
		<slot />
	</button>
</template>
