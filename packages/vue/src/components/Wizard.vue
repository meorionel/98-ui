<script lang="ts">
import type { VNode, VNodeChild } from "vue";
import type { DialogProps } from "./Dialog.vue";

export interface WizardStep {
	/** Stable identity for the step. */
	key: string;
	/** Caption in the step list. React's `ReactNode` is Vue's `VNodeChild`. */
	title: VNodeChild;
	/** The page itself. */
	content: VNodeChild;
	/** Optional line under the content. */
	description?: VNodeChild;
	/** Block "Next" while this step is showing. */
	disabled?: boolean;
}

export interface WizardLabels {
	back: string;
	next: string;
	finish: string;
	cancel: string;
	/** The "Step 2 of 4" readout. */
	stepOf: (step: number, count: number) => VNodeChild;
}

/** English wizard button labels. */
export const WIZARD_LABELS: WizardLabels = {
	back: "Back",
	next: "Next",
	finish: "Finish",
	cancel: "Cancel",
	stepOf: (step, count) => `Step ${step} of ${count}`,
};

export interface WizardProps {
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state while uncontrolled. */
	defaultOpen?: boolean;
	/** Caption in the title bar. A `title` slot overrides it and may hold markup. */
	title?: string;
	/** Accessible name, used when there is no `title`. */
	label?: string;
	steps: WizardStep[];
	/** Controlled step index, 0-based. Same name as React's. */
	step?: number;
	/** Initial step index while uncontrolled. */
	defaultStep?: number;
	/** Localised button labels and readout. */
	labels?: Partial<WizardLabels>;
	/** Show the list of steps on the left. Defaults to `true`. */
	showSteps?: boolean;
	width?: number | string;
	/** Extra props forwarded to the underlying `Dialog`. */
	dialogProps?: Omit<DialogProps, "title" | "label" | "width">;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}
</script>

<script setup lang="ts">
import { computed, createTextVNode, createVNode, Fragment, isVNode } from "vue";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/controllable";
import { focusElement } from "../utils/focusTrap";
import { RenderVNode } from "../utils/trigger";
import Button from "./Button.vue";
import ButtonGroup from "./ButtonGroup.vue";
import Dialog from "./Dialog.vue";

/**
 * A Windows 98 wizard: Back, Next and Finish over an ordered set of pages.
 *
 * ```vue
 * <Wizard
 *   v-model:open="open"
 *   title="Add Hardware Wizard"
 *   :steps="[
 *     { key: 'welcome', title: 'Welcome', content: h(WelcomePage) },
 *     { key: 'device', title: 'Device', content: h(DevicePicker) },
 *     { key: 'done', title: 'Finish', content: h(DonePage) },
 *   ]"
 *   @finish="install"
 * />
 * ```
 *
 * The step list on the left jumps between pages, the footer reports where you
 * are, and `Next` becomes `Finish` on the last step. `Enter` follows the default
 * button, so the whole wizard can be driven from the keyboard.
 *
 * The `title` slot replaces the `title` prop's caption, and the `step` scoped
 * slot (`{ step, index }`) overrides the current page's content when markup is
 * needed.
 */
defineOptions({ name: "Wizard" });

const props = withDefaults(defineProps<WizardProps>(), {
	open: undefined,
	defaultOpen: false,
	title: undefined,
	label: undefined,
	step: undefined,
	defaultStep: 0,
	labels: undefined,
	showSteps: true,
	width: 460,
	dialogProps: undefined,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	"open-change": [open: boolean];
	"update:step": [step: number];
	"step-change": [step: number];
	finish: [];
	cancel: [];
}>();

const slots = defineSlots<{
	/** Caption shown in the title bar, overriding the `title` prop. May hold markup. */
	title?: () => unknown;
	/** The current page, overriding `steps[index].content`. */
	step?: (props: { step: WizardStep | undefined; index: number }) => unknown;
}>();

const merged = computed<WizardLabels>(() => ({ ...WIZARD_LABELS, ...props.labels }));
const lastIndex = computed(() => Math.max(0, props.steps.length - 1));

const [step, setStep] = useControllableState<number>({
	value: () => props.step,
	defaultValue: props.defaultStep,
	onChange: (next) => {
		emit("update:step", next);
		emit("step-change", next);
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

// The controlled `step` may point outside the step list; Windows clamps rather
// than rendering nothing.
const current = computed(() => Math.min(Math.max(0, step.value), lastIndex.value));
const active = computed(() => props.steps[current.value]);
const isLast = computed(() => current.value >= lastIndex.value);

const goTo = (next: number) => {
	const target = Math.min(Math.max(0, next), lastIndex.value);
	if (props.steps[target]?.disabled) return;
	setStep(target);
	focusElement(
		typeof document === "undefined"
			? null
			: document.querySelector<HTMLElement>(`[data-wizard-step="${target}"]`),
	);
};

const finish = () => {
	emit("finish");
	setOpen(false);
};

const handleCancel = () => {
	emit("cancel");
	setOpen(false);
};

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
		class="wizard"
		@update:open="setOpen"
	>
		<template v-if="slots.title" #title>
			<slot name="title" />
		</template>

		<div class="wizard-body">
			<ol v-if="props.showSteps" class="wizard-steps">
				<li v-for="(entry, index) in props.steps" :key="entry.key">
					<button
						type="button"
						:data-wizard-step="index"
						class="wizard-step"
						:class="
							cx(
								index === current && 'wizard-step-active',
								index < current && 'wizard-step-done',
								entry.disabled && 'wizard-step-disabled',
							)
						"
						:aria-current="index === current ? 'step' : undefined"
						:disabled="entry.disabled"
						@click="goTo(index)"
					>
						<span class="wizard-step-number" aria-hidden="true">{{ index + 1 }}</span>
						<RenderVNode :vnode="toVNode(entry.title)" />
					</button>
				</li>
			</ol>
			<div class="wizard-page">
				<slot name="step" :step="active" :index="current">
					<RenderVNode :vnode="toVNode(active?.content)" />
				</slot>
				<p v-if="active?.description !== undefined" class="wizard-description">
					<RenderVNode :vnode="toVNode(active?.description)" />
				</p>
			</div>
		</div>

		<template #footer>
			<div class="wizard-footer">
				<span class="wizard-status">
					<RenderVNode :vnode="toVNode(merged.stepOf(current + 1, props.steps.length))" />
				</span>
				<ButtonGroup>
					<Button :disabled="current === 0" @click="goTo(current - 1)">
						{{ merged.back }}
					</Button>
					<Button v-if="isLast" variant="default" @click="finish">
						{{ merged.finish }}
					</Button>
					<Button
						v-else
						variant="default"
						:disabled="active?.disabled === true"
						@click="goTo(current + 1)"
					>
						{{ merged.next }}
					</Button>
					<Button @click="handleCancel">{{ merged.cancel }}</Button>
				</ButtonGroup>
			</div>
		</template>
	</Dialog>
</template>
