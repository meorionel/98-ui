<script lang="ts">
export interface ButtonGroupProps {
	/** Stack the buttons vertically. */
	vertical?: boolean;
}
</script>

<script setup lang="ts">
import { cx } from "../utils/cx";

/**
 * Lays a row of buttons out with the 4px "grouped button" rhythm the stylesheet
 * uses for dialog command rows.
 *
 * ```vue
 * <ButtonGroup>
 *   <Button variant="default">OK</Button>
 *   <Button>Cancel</Button>
 * </ButtonGroup>
 * ```
 */
defineOptions({ name: "ButtonGroup" });

const props = withDefaults(defineProps<ButtonGroupProps>(), { vertical: false });
</script>

<template>
	<div role="group" class="button-group" :class="cx(props.vertical && 'button-group-vertical')">
		<slot />
	</div>
</template>
