<script lang="ts">
import type { TitleBarControl } from "./TitleBar.vue";

export interface DialogProps {
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	/** Caption shown in the title bar. A `title` slot overrides it and may hold markup. */
	title?: string;
	/** Accessible name for dialogs that have no visible caption. */
	label?: string;
	/** Title bar commands. Defaults to a close button only. */
	controls?: TitleBarControl[];
	/** Localised accessible names for the title bar buttons. */
	labels?: Partial<Record<TitleBarControl, string>>;
	/** Draw the dimming backdrop. Defaults to `true`. */
	overlay?: boolean;
	/** A click on the backdrop closes the dialog. Defaults to `false`, as in Windows 98. */
	closeOnOverlayClick?: boolean;
	/** Escape closes the dialog. Defaults to `true`. */
	closeOnEscape?: boolean;
	/**
	 * Modal dialogs trap Tab, hide the rest of the page from assistive
	 * technology and lock body scrolling. Defaults to `true`.
	 */
	modal?: boolean;
	width?: number | string;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from "vue";
import { useControllableState } from "../utils/controllable";
import { useDismissable } from "../utils/dismissable";
import { useFocusTrap } from "../utils/focusTrap";
import { lockBodyScroll, useLayerZIndex } from "../utils/layers";
import Portal from "../utils/Portal.vue";
import TitleBar from "./TitleBar.vue";

/**
 * A Windows 98 modal dialog: a real window, centred over a dimmed page.
 *
 * ```vue
 * <Dialog v-model:open="open" title="Delete file">
 *   <p>Are you sure you want to send this file to the Recycle Bin?</p>
 *   <template #footer>
 *     <Button variant="default" @click="confirm">Yes</Button>
 *     <Button @click="open = false">No</Button>
 *   </template>
 * </Dialog>
 * ```
 *
 * The portal, the focus trap, the scroll lock and the `z-index` stack all come
 * from the shared layer utilities, so a dialog opened from inside another dialog
 * stacks and traps correctly.
 *
 * Slots: `default` is the body, `footer` is rendered right-aligned under it,
 * and `title` replaces the `title` prop's caption (it may hold markup).
 */
defineOptions({ name: "Dialog", inheritAttrs: false });

const props = withDefaults(defineProps<DialogProps>(), {
	open: undefined,
	defaultOpen: false,
	title: undefined,
	label: undefined,
	controls: () => ["close"],
	labels: undefined,
	overlay: true,
	closeOnOverlayClick: false,
	closeOnEscape: true,
	modal: true,
	width: undefined,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	control: [action: TitleBarControl];
}>();

const slots = defineSlots<{
	/** The dialog body. */
	default?: () => unknown;
	/** Rendered right-aligned under the body — the usual `<Button>` row. */
	footer?: () => unknown;
	/** Caption shown in the title bar, overriding the `title` prop. May hold markup. */
	title?: () => unknown;
}>();
const attrs = useAttrs();

const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const windowRef = ref<HTMLDivElement | null>(null);
const zIndex = useLayerZIndex(() => isOpen.value);
const titleId = useId();

const hasTitle = computed(() => props.title !== undefined || slots.title !== undefined);

useDismissable({
	enabled: () => isOpen.value,
	onDismiss: () => setOpen(false),
	refs: () => [windowRef.value],
	layer: () => zIndex.value,
	escape: () => props.closeOnEscape,
	// The backdrop is the only "outside": a dialog is centred and covers
	// everything else, so a pointer press outside it *is* a backdrop click.
	outsidePointerDown: () => props.closeOnOverlayClick,
});

useFocusTrap({
	target: windowRef,
	active: () => isOpen.value && props.modal,
	wrap: () => true,
	// Windows gives the default button focus, not the title bar close box.
	initialFocus: () => windowRef.value?.querySelector<HTMLElement>("button.default") ?? null,
	restoreFocus: () => true,
	layer: () => zIndex.value,
});

watch(
	[isOpen, () => props.modal],
	([open, modal], _previous, onCleanup) => {
		if (!open || !modal) return;
		onCleanup(lockBodyScroll());
	},
	{ immediate: true, flush: "post" },
);

const handleControl = (action: TitleBarControl) => {
	emit("control", action);
	if (action === "close") setOpen(false);
};

// `rest` excludes `class` / `style`, which Vue merges into the window element's
// own bindings below — exactly the split React's `cx("window", "dialog", …)` and
// `{ width, zIndex, ...style }` performed by hand.
const restAttrs = computed(() => {
	const { class: _class, style: _style, ...rest } = attrs;
	return rest;
});

// React appends `px` to a numeric style value; Vue's style serializer does not,
// so do it here to keep the rendered attribute byte-identical.
const windowWidth = computed(() =>
	typeof props.width === "number" ? `${props.width}px` : props.width,
);

const windowStyle = computed(() => [
	{ width: windowWidth.value, zIndex: zIndex.value + 1 },
	attrs.style,
]);
</script>

<template>
	<Portal v-if="isOpen" :to="props.container" :disabled="props.inline">
		<div v-if="props.overlay" class="dialog-overlay" :style="{ zIndex }" />
		<div
			v-bind="restAttrs"
			ref="windowRef"
			role="dialog"
			:aria-modal="props.modal || undefined"
			:aria-labelledby="hasTitle ? titleId : undefined"
			:aria-label="hasTitle ? undefined : props.label"
			:tabindex="-1"
			class="window dialog"
			:class="attrs.class"
			:style="windowStyle"
		>
			<TitleBar
				v-if="hasTitle"
				:text="props.title"
				:controls="props.controls"
				:labels="props.labels"
				@control="handleControl"
			>
				<template #text>
					<span :id="titleId"><slot name="title">{{ props.title }}</slot></span>
				</template>
			</TitleBar>
			<div class="window-body">
				<slot />
			</div>
			<div v-if="slots.footer" class="dialog-buttons">
				<slot name="footer" />
			</div>
		</div>
	</Portal>
</template>
