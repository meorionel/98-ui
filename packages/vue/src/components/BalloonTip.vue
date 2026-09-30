<script lang="ts">
import type { Align, Side } from "../utils/floating";

/** Where an unanchored balloon docks. */
export type BalloonCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** The four Windows 98 notification glyphs, shared with `MessageBox`. */
export type BalloonIcon = "info" | "warning" | "error" | "question";

export interface BalloonTipProps {
	/** Controlled visibility. */
	open?: boolean;
	/** Initial visibility while uncontrolled. */
	defaultOpen?: boolean;
	/** Bold first line. A `title` slot overrides it and may hold markup. */
	title?: string;
	icon?: BalloonIcon;
	/** Element to point at. Without it the balloon docks in `corner`. */
	anchor?: HTMLElement | null;
	/** Side of the anchor to sit on. Defaults to `"bottom"`. */
	side?: Side;
	/** Defaults to `"start"`. */
	align?: Align;
	offset?: number;
	/** Corner used when there is no anchor. Defaults to `"bottom-right"`. */
	corner?: BalloonCorner;
	/** Close by itself after this many milliseconds. */
	autoDismiss?: number;
	/** Show a close button. Windows 98 balloons just fade, so this defaults to `false`. */
	closable?: boolean;
	closeLabel?: string;
	/** How the message is announced. Defaults to `"status"` (polite). */
	announce?: "status" | "alert";
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs, watch } from "vue";
import { useControllableState } from "../utils/controllable";
import { useDismissable } from "../utils/dismissable";
import FloatingSurface from "../utils/FloatingSurface.vue";
import { useLayerZIndex } from "../utils/layers";
import Portal from "../utils/Portal.vue";
import Button from "./Button.vue";

/**
 * A balloon notification: the little tailed window Windows 98 pops out of the
 * tray to tell you something.
 *
 * ```vue
 * <BalloonTip
 *   v-model:open="open"
 *   title="New hardware found"
 *   icon="info"
 *   :auto-dismiss="6000"
 * >
 *   Windows is installing the driver for your new device.
 * </BalloonTip>
 * ```
 *
 * With an `anchor` it points at that element; without one — i.e. the prop was
 * never passed — it docks in a corner. Passing `null` explicitly keeps the
 * anchored variant, which is what a trigger that has not mounted yet needs.
 * It never steals focus, it closes on `Escape`, and it can dismiss itself after
 * `autoDismiss` — the shape a toast takes in this design language.
 *
 * The `title` slot replaces the `title` prop's first line; the default slot is
 * the message.
 */
defineOptions({ name: "BalloonTip", inheritAttrs: false });

const props = withDefaults(defineProps<BalloonTipProps>(), {
	open: undefined,
	defaultOpen: false,
	title: undefined,
	icon: undefined,
	anchor: undefined,
	side: undefined,
	align: undefined,
	offset: undefined,
	corner: "bottom-right",
	autoDismiss: undefined,
	closable: false,
	closeLabel: "Close",
	announce: "status",
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	dismiss: [];
}>();

const slots = defineSlots<{ default?: () => unknown; title?: () => unknown }>();
const attrs = useAttrs();

const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const balloonRef = ref<HTMLDivElement | null>(null);
const zIndex = useLayerZIndex(() => isOpen.value);

const close = () => {
	setOpen(false);
	emit("dismiss");
};

useDismissable({
	// An anchored balloon is a FloatingSurface, which dismisses for itself and
	// draws its own tail from the resolved side — the same tail logic as a
	// tooltip. Only the docked variant has to listen here.
	enabled: () => isOpen.value && props.anchor === undefined,
	onDismiss: close,
	refs: () => [balloonRef.value],
	layer: () => zIndex.value,
	// A notification is not a menu: clicking away must not make it vanish.
	outsidePointerDown: () => false,
});

// The timer deliberately depends on nothing but the open state and the delay:
// re-arming the timeout on every parent render would keep the balloon open
// forever. Vue's setup-scope `close` is already stable, so no ref indirection
// (React's `useRef(close)`) is needed.
watch(
	[isOpen, () => props.autoDismiss],
	([open, autoDismiss], _previous, onCleanup) => {
		if (!open || autoDismiss === undefined) return;
		if (typeof window === "undefined") return;
		const timer = window.setTimeout(close, autoDismiss);
		onCleanup(() => window.clearTimeout(timer));
	},
	{ immediate: true, flush: "post" },
);

// `rest` excludes `class` / `style`, which the docked element merges into its
// own bindings below — the job React's `cx("balloon", …)` did by hand.
const restAttrs = computed(() => {
	const { class: _class, style: _style, ...rest } = attrs;
	return rest;
});
</script>

<template>
	<FloatingSurface
		v-if="isOpen && props.anchor !== undefined"
		v-bind="attrs"
		:open="isOpen"
		:anchor="props.anchor"
		:side="props.side ?? 'bottom'"
		:align="props.align"
		:offset="props.offset ?? 10"
		:role="props.announce"
		surface-class="balloon balloon-anchored"
		:inline="props.inline"
		:container="props.container"
		@dismiss="close"
	>
		<span
			v-if="props.icon !== undefined"
			:class="['balloon-icon', `balloon-icon-${props.icon}`]"
			aria-hidden="true"
		/>
		<div class="balloon-body">
			<div v-if="props.title !== undefined || slots.title" class="balloon-title">
				<slot name="title">{{ props.title }}</slot>
			</div>
			<div class="balloon-text">
				<slot />
			</div>
		</div>
		<Button
			v-if="props.closable"
			class="balloon-close"
			:aria-label="props.closeLabel"
			@click="close"
		>
			&#x2715;
		</Button>
		<span class="balloon-tail" aria-hidden="true" />
	</FloatingSurface>

	<Portal v-else-if="isOpen" :to="props.container" :disabled="props.inline">
		<div
			v-bind="restAttrs"
			ref="balloonRef"
			:role="props.announce"
			class="balloon balloon-docked"
			:class="[`balloon-${props.corner}`, attrs.class]"
			:style="[{ zIndex }, attrs.style]"
		>
			<span
				v-if="props.icon !== undefined"
				:class="['balloon-icon', `balloon-icon-${props.icon}`]"
				aria-hidden="true"
			/>
			<div class="balloon-body">
				<div v-if="props.title !== undefined || slots.title" class="balloon-title">
					<slot name="title">{{ props.title }}</slot>
				</div>
				<div class="balloon-text">
					<slot />
				</div>
			</div>
			<Button
				v-if="props.closable"
				class="balloon-close"
				:aria-label="props.closeLabel"
				@click="close"
			>
				&#x2715;
			</Button>
			<span class="balloon-tail" aria-hidden="true" />
		</div>
	</Portal>
</template>
