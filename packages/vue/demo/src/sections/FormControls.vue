<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const formControlSections: SectionMeta[] = [
	{ id: "button", titleKey: "nav.button", level: 3 },
	{ id: "checkbox", titleKey: "nav.checkbox", level: 3 },
	{ id: "option-button", titleKey: "nav.optionButton", level: 3 },
	{ id: "group-box", titleKey: "nav.groupBox", level: 3 },
	{ id: "text-box", titleKey: "nav.textBox", level: 3 },
	{ id: "slider", titleKey: "nav.slider", level: 3 },
	{ id: "dropdown", titleKey: "nav.dropdown", level: 3 },
];
</script>

<script setup lang="ts">
import { ref } from "vue";
import {
	Button,
	Checkbox,
	FieldLabel,
	FieldRow,
	GroupBox,
	Radio,
	RadioGroup,
	Select,
	Slider,
	TextArea,
	TextBox,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "FormControls" });

const { t } = useI18n();

/* ------------------------------------------------------------- code samples */

const buttonCode = `
	<Button>Click me</Button>
	<Button variant="default">OK</Button>
	<Button disabled>I cannot be clicked</Button>
`;

const buttonStatesCode = `
	<Button active>I am being pressed</Button>
	<Button focused>I am focused</Button>
	<Button variant="default" active>Default, pressed</Button>
`;

const checkboxCode = `
	<Checkbox label="This is a checkbox" />
	<Checkbox default-checked label="I am checked" />
	<Checkbox disabled label="I am inactive" />
	<Checkbox disabled default-checked label="Inactive but still checked" />
`;

const checkboxControlledCode = `
	const checked = ref({ first: true, second: false });

	<Checkbox
	  :checked="checked.first"
	  label="First option"
	  @change="checked.first = ($event.target as HTMLInputElement).checked"
	/>
	<Checkbox
	  :checked="checked.second"
	  label="Second option"
	  @change="checked.second = ($event.target as HTMLInputElement).checked"
	/>
`;

const optionButtonCode = `
	<RadioGroup
	  name="first-example"
	  default-value="yes"
	  :options="[
	    { label: 'Yes', value: 'yes' },
	    { label: 'No', value: 'no' },
	  ]"
	/>
`;

const optionButtonControlledCode = `
	const flavour = ref("smooth");

	<RadioGroup
	  :value="flavour"
	  @value-change="flavour = $event"
	  :options="[
	    { label: 'Peanut butter should be smooth', value: 'smooth' },
	    { label: 'I understand why people like crunchy', value: 'understand' },
	    { label: 'Crunchy peanut butter is good', value: 'crunchy', disabled: true },
	  ]"
	/>
	<p>Selected: {{ flavour }}</p>
`;

const optionButtonLowLevelCode = `
	<Radio name="low-level" default-checked label="Checked by default" />
	<Radio name="low-level" label="Unchecked" />
`;

const groupBoxCode = `
	<GroupBox>
	  <FieldLabel>Select one:</FieldLabel>
	  <Radio name="fieldset-example" label="Diners" />
	  <Radio name="fieldset-example" label="Drive-Ins" />
	  <Radio name="fieldset-example" label="Dives" />
	</GroupBox>
`;

const groupBoxLegendCode = `
	<GroupBox legend="Today's mood">
	  <Radio name="fieldset-example2" default-checked label="Claire Saffitz" />
	  <Radio name="fieldset-example2" label="Brad Leone" />
	  <Radio name="fieldset-example2" label="Chris Morocco" />
	  <Radio name="fieldset-example2" label="Carla Lalli Music" />
	</GroupBox>
`;

const textBoxCode = `
	<TextBox label="Occupation" />
	<TextBox label="Favorite color" disabled value="Windows Green" />
`;

const textBoxStackedCode = `
	<TextBox layout="stacked" :width="200" label="Address (Line 1)" />
	<TextBox layout="stacked" :width="200" label="Address (Line 2)" />
	<TextArea layout="stacked" :width="200" :rows="5" label="Additional notes" />
`;

const sliderCode = `
	const volume = ref(5);

	<div class="field-row" :style="{ width: '300px' }">
	  <label for="volume">Volume: {{ volume }}</label>
	  <label for="volume">Low</label>
	  <input id="volume" v-model.number="volume" type="range" :min="1" :max="11" />
	  <label for="volume">High</label>
	</div>
`;

const sliderVerticalCode = `
	<Slider label="Cowbell" vertical box-indicator :length="120" :min="1" :max="3" :step="1"
	  :value="cowbell" @value-change="cowbell = Number($event)" />
`;

const dropdownCode = `
	<Select
	  value="3"
	  :options="[
	    { label: '5 - Incredible!', value: '5' },
	    { label: '4 - Great!', value: '4' },
	    { label: '3 - Pretty good', value: '3' },
	    { label: '2 - Not so great', value: '2' },
	    { label: '1 - Unfortunate', value: '1' },
	  ]"
	/>
`;

const dropdownControlledCode = `
	const rating = ref("3");

	<Select
	  label="Rating"
	  :value="rating"
	  @change="rating = ($event.target as HTMLSelectElement).value"
	  :options="[/* … */]"
	/>
`;

/* --------------------------------------------------------- interactive state */

const checked = ref({ first: true, second: false });

/**
 * React's `setChecked((state) => ({ ...state, first: event.target.checked }))`,
 * unrolled. The native `change` event is used because `Checkbox` declares
 * `update:checked` as an emit, so a `v-model:checked` listener would be stripped
 * from its fallthrough attrs and the box would render read-only.
 */
const onFirstChange = (event: Event) => {
	checked.value = { ...checked.value, first: (event.target as HTMLInputElement).checked };
};

const onSecondChange = (event: Event) => {
	checked.value = { ...checked.value, second: (event.target as HTMLInputElement).checked };
};

const flavour = ref("smooth");
const volume = ref(5);
const cowbell = ref(2);
const rating = ref("3");

/** React's `(event) => setRating(event.target.value)`, unrolled. */
const onRatingChange = (event: Event) => {
	rating.value = (event.target as HTMLSelectElement).value;
};
</script>

<template>
	<Section id="button" title-key="nav.button">
		<blockquote>
			<T k="forms.button.quote" />
			<footer>{{ t("forms.button.quoteSource") }}</footer>
		</blockquote>

		<T k="forms.button.p1" as="p" />

		<Example :code="buttonCode">
			<Button>{{ t("forms.button.clickMe") }}</Button>
			{{ " " }}
			<Button variant="default">{{ t("common.ok") }}</Button>
			{{ " " }}
			<Button disabled>{{ t("forms.button.cannotBeClicked") }}</Button>
		</Example>

		<p>
			<T k="forms.button.p2a" /> <kbd>{{ t("forms.button.enterKey") }}</kbd>
			{{ " " }}
			<T k="forms.button.p2b" />
		</p>

		<T k="forms.button.p3" as="p" />

		<Example :code="buttonStatesCode">
			<Button active>{{ t("forms.button.pressedState") }}</Button>
			{{ " " }}
			<Button focused>{{ t("forms.button.focusedState") }}</Button>
			{{ " " }}
			<Button variant="default" active>{{ t("forms.button.defaultPressed") }}</Button>
		</Example>
	</Section>

	<Section id="checkbox" title-key="nav.checkbox">
		<blockquote>
			<T k="forms.checkbox.quote" />
			<footer>{{ t("forms.checkbox.quoteSource") }}</footer>
		</blockquote>

		<T k="forms.checkbox.p1" as="p" />

		<Example :code="checkboxCode">
			<Checkbox :label="t('forms.checkbox.thisIsACheckbox')" />
			<Checkbox default-checked :label="t('forms.checkbox.checkedLabel')" />
			<Checkbox disabled :label="t('forms.checkbox.inactiveLabel')" />
			<Checkbox disabled default-checked :label="t('forms.checkbox.inactiveCheckedLabel')" />
		</Example>

		<T k="forms.checkbox.p2" as="p" />

		<Example :code="checkboxControlledCode">
			<Checkbox
				:checked="checked.first"
				:label="t('forms.checkbox.firstOption')"
				@change="onFirstChange"
			/>
			<Checkbox
				:checked="checked.second"
				:label="t('forms.checkbox.secondOption')"
				@change="onSecondChange"
			/>
		</Example>
	</Section>

	<Section id="option-button" title-key="nav.optionButton">
		<blockquote>
			<T k="forms.optionButton.quote" />
			<footer>{{ t("forms.optionButton.quoteSource") }}</footer>
		</blockquote>

		<T k="forms.optionButton.p1" as="p" />

		<Example :code="optionButtonCode">
			<RadioGroup
				name="first-example"
				default-value="yes"
				:options="[
					{ label: t('forms.optionButton.yes'), value: 'yes' },
					{ label: t('forms.optionButton.no'), value: 'no' },
				]"
			/>
		</Example>

		<T k="forms.optionButton.p2" as="p" />

		<Example :code="optionButtonControlledCode">
			<RadioGroup
				:value="flavour"
				:options="[
					{ label: t('forms.optionButton.smoothOption'), value: 'smooth' },
					{ label: t('forms.optionButton.understandOption'), value: 'understand' },
					{ label: t('forms.optionButton.crunchyOption'), value: 'crunchy', disabled: true },
				]"
				@value-change="flavour = $event"
			/>
			<FieldRow>
				<span>{{ t("forms.optionButton.selected", { value: flavour }) }}</span>
			</FieldRow>
		</Example>

		<T k="forms.optionButton.p3" as="p" />

		<Example :code="optionButtonLowLevelCode">
			<Radio name="low-level" default-checked :label="t('forms.optionButton.checkedByDefault')" />
			<Radio name="low-level" :label="t('forms.optionButton.unchecked')" />
		</Example>
	</Section>

	<Section id="group-box" title-key="nav.groupBox">
		<blockquote>
			<T k="forms.groupBox.quote" />
			<footer>{{ t("forms.groupBox.quoteSource") }}</footer>
		</blockquote>

		<T k="forms.groupBox.p1" as="p" />

		<Example :code="groupBoxCode">
			<GroupBox>
				<FieldLabel>{{ t("forms.groupBox.selectOne") }}</FieldLabel>
				<Radio name="fieldset-example" :label="t('forms.groupBox.diners')" />
				<Radio name="fieldset-example" :label="t('forms.groupBox.driveIns')" />
				<Radio name="fieldset-example" :label="t('forms.groupBox.dives')" />
			</GroupBox>
		</Example>

		<Example :code="groupBoxLegendCode">
			<GroupBox :legend="t('forms.groupBox.todayMood')">
				<Radio name="fieldset-example2" default-checked :label="t('forms.groupBox.claireSaffitz')" />
				<Radio name="fieldset-example2" :label="t('forms.groupBox.bradLeone')" />
				<Radio name="fieldset-example2" :label="t('forms.groupBox.chrisMorocco')" />
				<Radio name="fieldset-example2" :label="t('forms.groupBox.carlaLalliMusic')" />
			</GroupBox>
		</Example>
	</Section>

	<Section id="text-box" title-key="nav.textBox">
		<blockquote>
			<T k="forms.textBox.quote" />
			<footer>{{ t("forms.textBox.quoteSource") }}</footer>
		</blockquote>

		<Example :code="textBoxCode">
			<TextBox :label="t('forms.textBox.occupation')" />
			<TextBox :label="t('forms.textBox.favoriteColor')" disabled value="Windows Green" />
		</Example>

		<T k="forms.textBox.p1" as="p" />

		<Example :code="textBoxStackedCode">
			<TextBox layout="stacked" :width="200" :label="t('forms.textBox.addressLine1')" />
			<TextBox layout="stacked" :width="200" :label="t('forms.textBox.addressLine2')" />
			<TextArea
				layout="stacked"
				:width="200"
				:rows="5"
				:label="t('forms.textBox.additionalNotes')"
			/>
		</Example>
	</Section>

	<Section id="slider" title-key="nav.slider">
		<blockquote>
			<T k="forms.slider.quote" />
			<footer>{{ t("forms.slider.quoteSource") }}</footer>
		</blockquote>

		<Example :code="sliderCode">
			<Slider
				:label="t('forms.slider.volumeLabel', { value: volume })"
				:low-label="t('forms.slider.low')"
				:high-label="t('forms.slider.high')"
				:min="1"
				:max="11"
				:value="volume"
				:style="{ width: '180px' }"
				@value-change="volume = Number($event)"
			/>
		</Example>

		<T k="forms.slider.p1" as="p" />

		<Example :code="sliderVerticalCode">
			<Slider
				:label="t('forms.slider.cowbellLabel', { value: cowbell })"
				vertical
				box-indicator
				:length="120"
				:min="1"
				:max="3"
				:step="1"
				:value="cowbell"
				@value-change="cowbell = Number($event)"
			/>
		</Example>
	</Section>

	<Section id="dropdown" title-key="nav.dropdown">
		<blockquote>
			<T k="forms.dropdown.quote" />
			<footer>{{ t("forms.dropdown.quoteSource") }}</footer>
		</blockquote>

		<Example :code="dropdownCode">
			<Select
				value="3"
				:options="[
					{ label: t('forms.dropdown.rating5'), value: '5' },
					{ label: t('forms.dropdown.rating4'), value: '4' },
					{ label: t('forms.dropdown.rating3'), value: '3' },
					{ label: t('forms.dropdown.rating2'), value: '2' },
					{ label: t('forms.dropdown.rating1'), value: '1' },
				]"
			/>
		</Example>

		<T k="forms.dropdown.p1" as="p" />

		<Example :code="dropdownControlledCode">
			<Select
				:label="t('forms.dropdown.rating')"
				:value="rating"
				:options="[
					{ label: t('forms.dropdown.rating5'), value: '5' },
					{ label: t('forms.dropdown.rating4'), value: '4' },
					{ label: t('forms.dropdown.rating3'), value: '3' },
					{ label: t('forms.dropdown.rating2'), value: '2' },
					{ label: t('forms.dropdown.rating1'), value: '1' },
				]"
				@change="onRatingChange"
			/>
		</Example>
	</Section>
</template>
