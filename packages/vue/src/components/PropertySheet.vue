<script lang="ts">
import type { VNode, VNodeChild } from "vue";
import type { DialogProps } from "./Dialog.vue";

export interface PropertySheetTab {
	/** Identifies the tab and its page. */
	value: string;
	/** The tab caption. React's `ReactNode` is Vue's `VNodeChild`. */
	label: VNodeChild;
	/** The page content. */
	content: VNodeChild;
	disabled?: boolean;
}

export interface PropertySheetProps {
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	/** Caption in the title bar. A `title` slot overrides it and may hold markup. */
	title?: string;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	tabs: PropertySheetTab[];
	/** Controlled active tab. Same name as React's. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial active tab while uncontrolled. Defaults to the first tab. */
	defaultValue?: string;
	/** The OK button. Closes the sheet unless `closeOnOk` is `false`. */
	closeOnOk?: boolean;
	okLabel?: string;
	cancelLabel?: string;
	applyLabel?: string;
	width?: number | string;
	/** Extra props forwarded to the underlying `Dialog`. */
	dialogProps?: Omit<DialogProps, "title" | "label" | "width">;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import {
	computed,
	createTextVNode,
	createVNode,
	Fragment,
	getCurrentInstance,
	isVNode,
} from "vue";
import { useControllableState } from "../utils/controllable";
import { RenderVNode } from "../utils/trigger";
import Button from "./Button.vue";
import Dialog from "./Dialog.vue";
import Tab from "./Tab.vue";
import TabList from "./TabList.vue";
import TabPanel from "./TabPanel.vue";
import Tabs from "./Tabs.vue";

/**
 * A Windows 98 property sheet: a modal dialog whose pages are tabs, with OK,
 * Cancel and an optional Apply.
 *
 * ```vue
 * <PropertySheet
 *   v-model:open="open"
 *   title="Display Properties"
 *   :tabs="[
 *     { value: 'background', label: 'Background', content: h(BackgroundPage) },
 *     { value: 'settings', label: 'Settings', content: h(SettingsPage) },
 *   ]"
 *   @apply="apply"
 * />
 * ```
 *
 * It is `Dialog` plus `Tabs`, so stacking, focus trapping, `Escape` and the
 * dimmed backdrop all behave exactly as they do for any other dialog.
 *
 * The `title` slot replaces the `title` prop's caption. The `tab` scoped slot
 * (`{ tab, index }`) and the `tab-label` scoped slot (`{ tab, index }`) override
 * one page's content and one tab's caption when markup is needed.
 */
defineOptions({ name: "PropertySheet" });

const props = withDefaults(defineProps<PropertySheetProps>(), {
	open: undefined,
	defaultOpen: false,
	title: undefined,
	label: undefined,
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	closeOnOk: true,
	okLabel: "OK",
	cancelLabel: "Cancel",
	applyLabel: "Apply",
	width: 420,
	dialogProps: undefined,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	"update:value": [value: string];
	"value-change": [value: string];
	"update:modelValue": [value: string];
	ok: [];
	cancel: [];
	apply: [];
}>();

const slots = defineSlots<{
	/** Caption shown in the title bar, overriding the `title` prop. May hold markup. */
	title?: () => unknown;
	/** Page content for one tab, overriding `tab.content`. */
	tab?: (props: { tab: PropertySheetTab; index: number }) => unknown;
	/** Caption for one tab, overriding `tab.label`. */
	"tab-label"?: (props: { tab: PropertySheetTab; index: number }) => unknown;
}>();

const instance = getCurrentInstance();

const [activeTab, setActiveTab] = useControllableState<string>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue ?? props.tabs[0]?.value ?? "",
	onChange: (next) => {
		emit("update:modelValue", next);
		emit("update:value", next);
		emit("value-change", next);
	},
});
const [isOpen, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});

/**
 * React rendered the Apply button only when an `onApply` handler was supplied.
 * A declared emit is pulled out of `attrs`, so the listener has to be read off
 * the vnode — the same trick `MenuPopup` uses for `onNavigateSibling`.
 */
const hasApply = () => typeof instance?.vnode.props?.onApply === "function";

/**
 * The tab strip's accessible name. React fell back to the `title` only while it
 * was a plain string, which is all a Vue `title` prop can be.
 */
const listLabel = computed(() => props.label ?? props.title);

/**
 * Renders any `VNodeChild` through `RenderVNode`, which only accepts a single
 * vnode: text and numbers become text nodes, vnode arrays a fragment.
 */
const toVNode = (node: VNodeChild): VNode | null => {
	if (node === null || node === undefined || typeof node === "boolean") return null;
	if (isVNode(node)) return node;
	if (Array.isArray(node)) return createVNode(Fragment, null, node);
	return createTextVNode(String(node));
};

const handleApply = () => {
	emit("apply");
};

const handleOk = () => {
	emit("ok");
	if (props.closeOnOk) setOpen(false);
};

const handleCancel = () => {
	emit("cancel");
	setOpen(false);
};
</script>

<template>
	<Dialog
		v-bind="props.dialogProps"
		:open="isOpen"
		:title="props.title"
		:label="props.label"
		:width="props.width"
		:inline="props.inline"
		:container="props.container"
		class="property-sheet"
		@update:open="setOpen"
	>
		<template v-if="slots.title" #title>
			<slot name="title" />
		</template>

		<Tabs :value="activeTab" keep-mounted @change="setActiveTab">
			<TabList :label="listLabel" multirows>
				<Tab
					v-for="(tab, index) in props.tabs"
					:key="tab.value"
					:value="tab.value"
					:disabled="tab.disabled"
				>
					<slot name="tab-label" :tab="tab" :index="index">
						<RenderVNode :vnode="toVNode(tab.label)" />
					</slot>
				</Tab>
			</TabList>
			<TabPanel
				v-for="(tab, index) in props.tabs"
				:key="tab.value"
				:value="tab.value"
				variant="flat"
				:body="false"
				class="property-page"
			>
				<slot name="tab" :tab="tab" :index="index">
					<RenderVNode :vnode="toVNode(tab.content)" />
				</slot>
			</TabPanel>
		</Tabs>

		<template #footer>
			<Button v-if="hasApply()" @click="handleApply">{{ props.applyLabel }}</Button>
			<Button variant="default" @click="handleOk">{{ props.okLabel }}</Button>
			<Button @click="handleCancel">{{ props.cancelLabel }}</Button>
		</template>
	</Dialog>
</template>
