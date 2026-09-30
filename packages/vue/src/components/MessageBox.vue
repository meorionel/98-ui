<script lang="ts">
/** The icons Windows 98 puts in a message box. */
export type MessageBoxIcon = "info" | "warning" | "error" | "question";

/** The buttons a message box can offer. */
export type MessageBoxButton = "ok" | "cancel" | "yes" | "no" | "retry";

/** English labels used when no localised `buttonLabels` are supplied. */
export const MESSAGE_BOX_BUTTON_LABELS: Record<MessageBoxButton, string> = {
	ok: "OK",
	cancel: "Cancel",
	yes: "Yes",
	no: "No",
	retry: "Retry",
};

export interface MessageBoxProps {
	open?: boolean;
	defaultOpen?: boolean;
	/** Caption shown in the title bar. A `title` slot overrides it and may hold markup. */
	title?: string;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	/** Glyph drawn to the left of the message. */
	icon?: MessageBoxIcon;
	/** Which buttons to show, left to right. Defaults to `["ok"]`. */
	buttons?: MessageBoxButton[];
	/** The button that responds to Enter. Defaults to the first one. */
	defaultButton?: MessageBoxButton;
	/** Localised button labels. */
	buttonLabels?: Partial<Record<MessageBoxButton, string>>;
	width?: number | string;
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useControllableState } from "../utils/controllable";
import Button from "./Button.vue";
import Dialog from "./Dialog.vue";

/**
 * The Windows 98 message box, built on `Dialog`.
 *
 * ```vue
 * <MessageBox
 *   v-model:open="open"
 *   icon="warning"
 *   title="Format complete"
 *   :buttons="['ok', 'cancel']"
 *   @result="(result) => console.log(result)"
 * >
 *   Setup has finished copying files.
 * </MessageBox>
 * ```
 *
 * The `title` slot replaces the `title` prop's caption, and the default slot is
 * the message itself.
 */
defineOptions({ name: "MessageBox" });

const props = withDefaults(defineProps<MessageBoxProps>(), {
	open: undefined,
	defaultOpen: false,
	title: undefined,
	label: undefined,
	icon: undefined,
	buttons: () => ["ok"],
	defaultButton: undefined,
	buttonLabels: undefined,
	width: 340,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	result: [result: MessageBoxButton];
}>();

const slots = defineSlots<{ default?: () => unknown; title?: () => unknown }>();

const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

const primary = computed(() => props.defaultButton ?? props.buttons[0]);

const handleResult = (button: MessageBoxButton) => {
	emit("result", button);
	setOpen(false);
};
</script>

<template>
	<Dialog
		:open="isOpen"
		:title="props.title"
		:label="props.label"
		:width="props.width"
		:inline="props.inline"
		:container="props.container"
		@update:open="setOpen"
	>
		<template v-if="slots.title" #title>
			<slot name="title" />
		</template>
		<div class="message-box">
			<span
				v-if="props.icon !== undefined"
				:class="['message-box-icon', `message-box-icon-${props.icon}`]"
				aria-hidden="true"
			/>
			<div class="message-box-text">
				<slot />
			</div>
		</div>
		<template #footer>
			<Button
				v-for="button in props.buttons"
				:key="button"
				:variant="button === primary ? 'default' : 'normal'"
				@click="handleResult(button)"
			>
				{{ props.buttonLabels?.[button] ?? MESSAGE_BOX_BUTTON_LABELS[button] }}
			</Button>
		</template>
	</Dialog>
</template>
