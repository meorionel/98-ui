<script lang="ts">
export interface ProgressIndicatorProps {
	/**
	 * Progress, `0`–`max`. Omit it for an indeterminate bar.
	 */
	value?: number;
	/** Upper bound for `value`. Defaults to `100`. */
	max?: number;
	/** Draw the bar as the chunky segmented (16px block) style. */
	segmented?: boolean;
	/**
	 * Animate the bar as a marquee instead of filling it. Defaults to
	 * `value === undefined`, which is what "no value" means for a progress bar —
	 * Windows 98 slides its blocks while it does not know how long is left.
	 */
	indeterminate?: boolean;
	width?: number | string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { sizeStyle } from "../utils/css";
import { cx } from "../utils/cx";

/**
 * A progress indicator.
 *
 * ```vue
 * <ProgressIndicator :value="40" :width="200" />
 * <ProgressIndicator :value="40" segmented :width="200" />
 * <ProgressIndicator :width="200" />          <!-- indeterminate: animated -->
 * ```
 *
 * A determinate bar reports `aria-valuenow`; an indeterminate one omits the
 * value attributes entirely, which is the shape assistive technology expects for
 * "still working, no idea how long".
 */
defineOptions({ name: "ProgressIndicator" });

const props = withDefaults(defineProps<ProgressIndicatorProps>(), {
	value: undefined,
	max: 100,
	segmented: false,
	indeterminate: undefined,
	width: undefined,
});

const isIndeterminate = computed(() => props.indeterminate ?? props.value === undefined);
const clamped = computed(() =>
	props.value === undefined ? 0 : Math.min(Math.max(props.value, 0), props.max),
);
const percent = computed(() => (props.max === 0 ? 0 : (clamped.value / props.max) * 100));

/**
 * React's `style={{ width, ...style }}` — the numeric width grows a `px` unit —
 * minus the empty attribute: a bar with no width must not render `style=""`.
 * A consumer's fallthrough `style` still merges over this one.
 */
const sizeAttrs = computed<Record<string, unknown>>(() => {
	const style = sizeStyle("width", props.width);
	return style === undefined ? {} : { style };
});

// The marquee positions the bar itself; a determinate bar is sized.
const barAttrs = computed<Record<string, unknown>>(() =>
	isIndeterminate.value ? {} : { style: { width: `${percent.value}%` } },
);
</script>

<template>
	<div
		role="progressbar"
		:aria-valuemin="isIndeterminate ? undefined : 0"
		:aria-valuemax="isIndeterminate ? undefined : props.max"
		:aria-valuenow="isIndeterminate ? undefined : clamped"
		:class="
			cx(
				'progress-indicator',
				props.segmented && 'segmented',
				isIndeterminate && 'progress-indicator-indeterminate',
			)
		"
		v-bind="sizeAttrs"
	>
		<span class="progress-indicator-bar" v-bind="barAttrs" />
	</div>
</template>
