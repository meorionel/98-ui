<script lang="ts">
import type { VNodeChild } from "vue";

export interface ComboBoxOption {
	/** Value reported through `update:value` / `value-change`. */
	value: string;
	/** Content rendered in the list. */
	label: VNodeChild;
	/**
	 * Text placed in the text box when this option is chosen. Defaults to `label`
	 * when that is a string, otherwise to `value` — a `VNodeChild` label cannot be
	 * typed into an `<input>`.
	 */
	text?: string;
	disabled?: boolean;
}

export interface ComboBoxProps {
	/** The entries offered by the drop-down list. */
	options: ComboBoxOption[];
	/** Controlled selected value. Same name as React's. */
	value?: string;
	/** Alias for `value`, so plain `v-model` works. Wins when both are given. */
	modelValue?: string;
	/** Initial selected value while uncontrolled. */
	defaultValue?: string;
	/** Controlled text in the box. */
	inputValue?: string;
	/** Initial text while uncontrolled. */
	defaultInputValue?: string;
	/**
	 * Restrict the control to the listed options: the text box is read-only and
	 * typing runs type-ahead instead of editing. This is the Windows 98
	 * "drop-down list" style; leave it off for the editable "drop-down combo".
	 */
	selectOnly?: boolean;
	/**
	 * Replace the built-in filter with your own. The default matches the start of
	 * the option text, case-insensitively — what a Windows 98 combo box does.
	 * Pass e.g. `(option, query) => text(option).includes(query)` for substring
	 * matching, or a fuzzy scorer.
	 */
	filter?: (option: ComboBoxOption, query: string) => boolean;
	/** Content of the associated `<label>`, when the control is not inside a `Field`. */
	label?: string;
	/** `"row"` (default) puts the label beside the box, `"stacked"` above it. */
	layout?: "row" | "stacked" | "none";
	/** Width of the whole control. */
	width?: number | string;
	/** Shown in the list when no option matches. */
	emptyMessage?: string;
	/** Accessible name for the list box when neither `label` nor a `Field` is present. */
	listLabel?: string;
	/** Accessible name for the arrow button. Defaults to `"Show options"`. */
	buttonLabel?: string;
	id?: string;
	/** Submits the selected value through a hidden input. */
	name?: string;
	disabled?: boolean;
	/** Mark the field invalid. Inherited from a surrounding `Field` that has an error. */
	invalid?: boolean;
	placeholder?: string;
	/** Controlled list visibility. */
	open?: boolean;
	/** Initial list visibility while uncontrolled. */
	defaultOpen?: boolean;
	/** Render in place instead of portalling (documentation and tests). */
	inline?: boolean;
	container?: HTMLElement | null;
}

/** The text a combo box shows for an option. */
export function comboBoxOptionText(option: ComboBoxOption): string {
	if (option.text !== undefined) return option.text;
	return typeof option.label === "string" ? option.label : option.value;
}

function defaultFilter(option: ComboBoxOption, query: string): boolean {
	return comboBoxOptionText(option).toLowerCase().startsWith(query.trim().toLowerCase());
}
</script>

<script setup lang="ts">
import { computed, defineComponent, mergeProps, ref, useAttrs, useId, watch } from "vue";
import type { PropType } from "vue";
import { cx } from "../utils/cx";
import { useControllableState } from "../utils/controllable";
import { useField } from "../utils/fieldContext";
import { focusElement } from "../utils/focusTrap";
import FloatingSurface from "../utils/FloatingSurface.vue";
import { sizeStyle } from "../utils/css";

function firstEnabled(options: ComboBoxOption[], from = 0): number {
	for (let index = from; index < options.length; index += 1) {
		if (!options[index].disabled) return index;
	}
	return -1;
}

function lastEnabled(options: ComboBoxOption[]): number {
	for (let index = options.length - 1; index >= 0; index -= 1) {
		if (!options[index].disabled) return index;
	}
	return -1;
}

/**
 * Renders a `ReactNode`-style option label, which may be text or a vnode.
 *
 * A plain `{{ option.label }}` would stringify a vnode, so the cell delegates
 * to a render function — the Vue counterpart of React's `{option.label}`.
 */
const OptionContent = defineComponent({
	name: "ComboBoxOptionContent",
	props: {
		content: { type: null as unknown as PropType<VNodeChild>, default: undefined },
	},
	setup: (props) => () => props.content,
});

/**
 * The Windows 98 combo box: a text box with a drop-down list underneath.
 *
 * ```vue
 * <ComboBox
 *   label="Driver"
 *   :options="drivers.map((driver) => ({ value: driver.id, label: driver.name }))"
 *   @value-change="setDriver"
 * />
 * ```
 *
 * Editable by default — typing filters the list and free text is reported through
 * `input-value-change`. Pass `selectOnly` for the "drop-down list" style, where the
 * box only displays the selection and typing jumps through the entries.
 *
 * Keyboard: `↓`/`↑` open and walk the list, `Alt+↓` toggles it, `Home`/`End` jump,
 * `Enter` chooses, `Escape` cancels the edit, `Tab` moves on and commits a typed
 * option when it matches one exactly. The list is a `role="listbox"` wired to the
 * input through `aria-activedescendant`, so focus never leaves the text box.
 */
defineOptions({ name: "ComboBox", inheritAttrs: false });

const props = withDefaults(defineProps<ComboBoxProps>(), {
	value: undefined,
	modelValue: undefined,
	defaultValue: undefined,
	inputValue: undefined,
	defaultInputValue: undefined,
	selectOnly: false,
	filter: defaultFilter,
	label: undefined,
	layout: "row",
	width: undefined,
	emptyMessage: undefined,
	listLabel: undefined,
	buttonLabel: undefined,
	id: undefined,
	name: undefined,
	disabled: false,
	invalid: undefined,
	placeholder: undefined,
	open: undefined,
	defaultOpen: false,
	inline: false,
	container: null,
});

const emit = defineEmits<{
	"update:value": [value: string];
	"value-change": [value: string];
	"update:modelValue": [value: string];
	"update:inputValue": [value: string];
	"input-value-change": [value: string];
	"option-select": [option: ComboBoxOption];
	"update:open": [open: boolean];
	"open-change": [open: boolean];
}>();

const slots = defineSlots<{
	label?: () => unknown;
	emptyMessage?: () => unknown;
}>();
const attrs = useAttrs();

const field = useField();
const generatedId = useId();
const inputId = computed(() => props.id ?? field?.value.controlId ?? generatedId);
const listId = `${generatedId}list`;

const initialSelected = props.defaultValue;
const initialOption = props.options.find((option) => option.value === initialSelected);

const [selected, setSelected] = useControllableState<string | undefined>({
	value: () => props.modelValue ?? props.value,
	defaultValue: initialSelected,
	onChange: (next) => {
		if (next === undefined) return;
		emit("update:value", next);
		emit("value-change", next);
		emit("update:modelValue", next);
	},
});
const [text, setText] = useControllableState<string>({
	value: () => props.inputValue,
	defaultValue:
		props.defaultInputValue ??
		(initialOption ? comboBoxOptionText(initialOption) : (initialSelected ?? "")),
	onChange: (next) => {
		emit("update:inputValue", next);
		emit("input-value-change", next);
	},
});

const [open, setOpen] = useControllableState<boolean>({
	value: () => props.open,
	defaultValue: props.defaultOpen,
	onChange: (next) => {
		emit("update:open", next);
		emit("open-change", next);
	},
});
// `null` means "not filtering": the whole list is offered.
const query = ref<string | null>(null);
const highlighted = ref(-1);

const boxRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const typeahead = { query: "", timer: 0 };

const filtered = computed(() => {
	const current = query.value;
	if (current === null || current === "" || props.selectOnly) return props.options;
	return props.options.filter((option) => props.filter(option, current));
});

const selectedValue = computed(() => selected.value ?? "");
const isInvalid = computed(() => props.invalid ?? field?.value.invalid ?? false);

const focusInput = () => focusElement(inputRef.value);

const openList = (highlight?: number) => {
	setOpen(true);
	if (highlight !== undefined) {
		highlighted.value = highlight;
		return;
	}
	const selectedIndex = filtered.value.findIndex((option) => option.value === selectedValue.value);
	highlighted.value = selectedIndex > -1 ? selectedIndex : firstEnabled(filtered.value);
};

const closeList = () => {
	setOpen(false);
	query.value = null;
};

const choose = (option: ComboBoxOption) => {
	if (option.disabled) return;
	setSelected(option.value);
	setText(comboBoxOptionText(option));
	closeList();
	emit("option-select", option);
	focusInput();
};

/** Commits free text when it matches an option exactly; used on blur and Enter. */
const commitText = () => {
	if (props.selectOnly) {
		const current = props.options.find((option) => option.value === selectedValue.value);
		setText(current ? comboBoxOptionText(current) : "");
		return;
	}
	const typed = text.value.trim().toLowerCase();
	if (typed === "") return;
	const match = props.options.find(
		(option) => comboBoxOptionText(option).toLowerCase() === typed && !option.disabled,
	);
	if (match) {
		setSelected(match.value);
		setText(comboBoxOptionText(match));
		emit("option-select", match);
	}
};

/** Escape and outside clicks cancel the edit, as in Windows 98. */
const cancelEdit = () => {
	closeList();
	if (props.selectOnly) return;
	if (selectedValue.value === "") return;
	const current = props.options.find((option) => option.value === selectedValue.value);
	if (current) setText(comboBoxOptionText(current));
};

const move = (from: number, direction: -1 | 1) => {
	const total = filtered.value.length;
	if (total === 0) return;
	for (let step = 1; step <= total; step += 1) {
		const index = (from + direction * step + total * step) % total;
		if (!filtered.value[index].disabled) {
			highlighted.value = index;
			return;
		}
	}
};

const handleInputChange = (event: Event) => {
	const next = (event.target as HTMLInputElement).value;
	setText(next);
	query.value = next;
	if (!open.value) setOpen(true);
	highlighted.value = firstEnabled(
		next === "" ? props.options : props.options.filter((option) => props.filter(option, next)),
	);
};

const handleTypeahead = (key: string) => {
	typeahead.query += key.toLowerCase();
	window.clearTimeout(typeahead.timer);
	typeahead.timer = window.setTimeout(() => {
		typeahead.query = "";
	}, 500);

	const found = props.options.findIndex(
		(option) =>
			!option.disabled &&
			comboBoxOptionText(option).toLowerCase().startsWith(typeahead.query),
	);
	if (found > -1) {
		highlighted.value = found;
		if (!open.value) setOpen(true);
	}
};

const handleKeyDown = (event: KeyboardEvent) => {
	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			if (!open.value) openList();
			else move(highlighted.value, 1);
			return;
		case "ArrowUp":
			event.preventDefault();
			if (!open.value) openList(lastEnabled(filtered.value));
			else move(highlighted.value, -1);
			return;
		case "Home":
			if (!open.value) return;
			event.preventDefault();
			highlighted.value = firstEnabled(filtered.value);
			return;
		case "End":
			if (!open.value) return;
			event.preventDefault();
			highlighted.value = lastEnabled(filtered.value);
			return;
		case "Enter": {
			const option = open.value ? filtered.value[highlighted.value] : undefined;
			if (option && !option.disabled) {
				event.preventDefault();
				choose(option);
				return;
			}
			commitText();
			return;
		}
		case "Escape":
			// The layer's dismiss handler closes the list and calls `cancelEdit`.
			return;
		case "Tab":
			closeList();
			commitText();
			return;
		default:
			if (props.selectOnly && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
				handleTypeahead(event.key);
			}
			return;
	}
};

// Keep the highlighted option visible while arrowing through a long list.
watch(
	[open, highlighted],
	() => {
		if (!open.value || highlighted.value < 0) return;
		const node = listRef.value?.children[highlighted.value] as HTMLElement | undefined;
		if (node && typeof node.scrollIntoView === "function") node.scrollIntoView();
	},
	{ flush: "post" },
);

const widthStyle = computed(() => sizeStyle("width", props.width));
const standalone = computed(() => field !== null || props.layout === "none");

/** React's `className` went to the `.combo-box` wrapper, never to the row. */
const controlBindings = computed(() =>
	mergeProps(
		{
			class: ["combo-box", isInvalid.value && "invalid"],
			style: standalone.value ? widthStyle.value : undefined,
		},
		attrs,
	),
);

const inputBindings = computed<Record<string, unknown>>(() => ({
	id: inputId.value,
	type: "text",
	role: "combobox",
	class: "combo-box-input",
	autocomplete: "off",
	placeholder: props.placeholder,
	disabled: props.disabled,
	readonly: props.selectOnly,
	value: text.value,
	"aria-expanded": open.value,
	"aria-controls": open.value ? listId : undefined,
	"aria-autocomplete": props.selectOnly ? undefined : "list",
	"aria-activedescendant":
		open.value && highlighted.value > -1 ? `${listId}-option-${highlighted.value}` : undefined,
	"aria-invalid": isInvalid.value || undefined,
	"aria-required": field?.value.required || undefined,
	"aria-describedby": field?.value.describedBy,
	onInput: handleInputChange,
	onKeydown: handleKeyDown,
	onMousedown: () => {
		// The editable box stays an editing surface: only the arrow
		// opens the list with a pointer, as in Windows 98.
		if (props.selectOnly && !open.value && !props.disabled) openList();
	},
	onBlur: commitText,
}));

const buttonBindings = computed<Record<string, unknown>>(() => ({
	type: "button",
	class: "combo-box-button",
	tabindex: -1,
	disabled: props.disabled,
	"aria-label": props.buttonLabel ?? "Show options",
	onClick: () => (open.value ? closeList() : openList()),
}));

defineExpose({ el: inputRef });
</script>

<template>
	<div v-if="standalone" v-bind="controlBindings" ref="boxRef">
		<input ref="inputRef" v-bind="inputBindings" />
		<button v-bind="buttonBindings" />
		<input
			v-if="props.name !== undefined"
			type="hidden"
			:name="props.name"
			:value="selectedValue"
		/>
	</div>

	<div
		v-else
		:class="props.layout === 'stacked' ? 'field-row-stacked' : 'field-row'"
		:style="widthStyle"
	>
		<label v-if="props.label !== undefined || slots.label" :for="inputId">
			<slot name="label">{{ props.label }}</slot>
		</label>
		<div v-bind="controlBindings" ref="boxRef">
			<input ref="inputRef" v-bind="inputBindings" />
			<button v-bind="buttonBindings" />
			<input
				v-if="props.name !== undefined"
				type="hidden"
				:name="props.name"
				:value="selectedValue"
			/>
		</div>
	</div>

	<FloatingSurface
		:open="open && !props.disabled"
		:anchor="boxRef"
		:match-anchor-width="true"
		role="listbox"
		:id="listId"
		:label="props.listLabel ?? props.label"
		surface-class="combo-box-list"
		@dismiss="cancelEdit"
		:inline="props.inline"
		:container="props.container"
	>
		<div ref="listRef" role="presentation">
			<template v-if="filtered.length === 0 && props.emptyMessage !== undefined">
				<div class="combo-box-empty">
					<slot name="emptyMessage">{{ props.emptyMessage }}</slot>
				</div>
			</template>
			<template v-else>
				<div
					v-for="(option, index) in filtered"
					:id="`${listId}-option-${index}`"
					:key="option.value"
					role="option"
					:aria-selected="option.value === selectedValue"
					:aria-disabled="option.disabled || undefined"
					:class="
						cx(
							'combo-box-option',
							index === highlighted && 'combo-box-option-highlighted',
							option.disabled && 'combo-box-option-disabled',
						)
					"
					@mousedown.prevent
					@mouseenter="highlighted = index"
					@click="choose(option)"
				>
					<OptionContent :content="option.label" />
				</div>
			</template>
		</div>
	</FloatingSurface>
</template>
