<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const widgetSections: SectionMeta[] = [
	{ id: "separator", titleKey: "nav.separator", level: 3 },
	{ id: "spin-box", titleKey: "nav.spinBox", level: 3 },
	{ id: "date-picker", titleKey: "nav.datePicker", level: 3 },
	{ id: "split-pane", titleKey: "nav.splitPane", level: 3 },
	{ id: "balloon-tip", titleKey: "nav.balloonTip", level: 3 },
	{ id: "property-sheet", titleKey: "nav.propertySheet", level: 3 },
	{ id: "wizard", titleKey: "nav.wizard", level: 3 },
];
</script>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import {
	BalloonTip,
	Button,
	Calendar,
	Checkbox,
	DatePicker,
	Field,
	FieldRow,
	Kbd,
	PropertySheet,
	RadioGroup,
	Select,
	Separator,
	SpinBox,
	SplitPane,
	SunkenPanel,
	Wizard,
	type CalendarLabels,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Widgets" });

const { t } = useI18n();

/* ------------------------------------------------------------- code samples */

const separatorCode = `
	<FieldRow>
	  <span>Left block</span>
	  <Separator orientation="vertical" />
	  <span>Right block</span>
	</FieldRow>

	<Separator />

	<p>Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save, or <Kbd>Escape</Kbd> to cancel.</p>
`;

const spinBoxCode = `
	<SpinBox label="Font size" :min="8" :max="72" :default-value="11" :width="90" />
	<SpinBox label="Quantity" :min="1" :max="99" :step="5" :default-value="10" :width="90" />

	<Field label="Controlled value" description="Arrows step by one, PageUp/PageDown by ten.">
	  <SpinBox :value="size" @value-change="size = $event" :min="8" :max="72" :width="90" />
	</Field>
`;

const datePickerCode = `
	const date = ref("1998-06-25");

	<DatePicker
	  label="Installed on"
	  :width="150"
	  :value="date"
	  @value-change="date = $event"
	  min="1995-08-24"
	  max="1999-12-31"
	  :labels="{ previousMonth: 'Previous month', nextMonth: 'Next month' }"
	/>
	<p>Selected date: {{ date }}</p>
`;

const calendarCode = `
	<Calendar
	  default-value="1998-06-25"
	  :week-starts-on="1"
	  min="1998-06-01"
	  max="1998-06-30"
	  @value-change="date = $event"
	/>
`;

const splitPaneCode = `
	<SplitPane
	  :default-size="140"
	  :min="80"
	  label="Resize the panes"
	  :style="{ height: '160px', width: '420px' }"
	>
	  <template #first>
	    <SunkenPanel :style="{ height: '100%', padding: '8px' }">Drag the divider</SunkenPanel>
	  </template>
	  <template #second>
	    <SunkenPanel :style="{ height: '100%', padding: '8px' }">The rest of the space</SunkenPanel>
	  </template>
	</SplitPane>
`;

const balloonTipCode = `
	const anchor = ref(null);
	const open = ref(false);
	const setAnchor = (el) => { anchor.value = el?.$el ?? el; };

	<Button :ref="setAnchor" @click="open = true">Point at this button</Button>
	<BalloonTip
	  :open="open"
	  @open-change="open = $event"
	  :anchor="anchor"
	  side="top"
	  icon="info"
	  title="New hardware found"
	  closable
	>
	  Windows is installing the driver for your new device.
	</BalloonTip>
`;

const propertySheetCode = `
	const open = ref(false);

	<PropertySheet
	  :open="open"
	  @open-change="open = $event"
	  title="Display Properties"
	  :tabs="[
	    { value: 'background', label: 'Background', content: h(BackgroundPage) },
	    { value: 'settings', label: 'Settings', content: h(SettingsPage) },
	  ]"
	  @apply="apply"
	/>
`;

const wizardCode = `
	const open = ref(false);

	<Wizard
	  :open="open"
	  @open-change="open = $event"
	  title="Add Hardware Wizard"
	  @finish="done = true"
	  :steps="[
	    { key: 'welcome', title: 'Welcome', content: h('p', 'This wizard helps you install a device.') },
	    { key: 'device', title: 'Device', content: h(DevicePicker) },
	    { key: 'confirm', title: 'Finish', content: h('p', 'Setup will now install the device.') },
	  ]"
	/>
`;

/* ---------------------------------------------------------------- spin box */

const size = ref(11);

/* ------------------------------------------------------------- date picker */

const date = ref("1998-06-25");

const calendarLabels = computed<Partial<CalendarLabels>>(() => ({
	previousMonth: t("widgets.datePicker.previousMonth"),
	nextMonth: t("widgets.datePicker.nextMonth"),
	weekdays: t("widgets.datePicker.weekdays").split(" "),
	monthHeading: (year, month) => t("widgets.datePicker.monthHeading", { year, month: month + 1 }),
	dayLabel: (iso) => t("widgets.datePicker.dayLabel", { date: iso }),
}));

/* ------------------------------------------------------------- balloon tip */

/**
 * `BalloonTip` points at a DOM element, so the `Button` template ref has to be
 * unwrapped: a component ref is the instance, whose `$el` is the element.
 */
const anchorRef = ref<HTMLElement | null>(null);
const setAnchor = (el: unknown) => {
	const instance = el as { $el?: HTMLElement } | null;
	anchorRef.value = instance?.$el ?? (el as HTMLElement | null) ?? null;
};

const anchored = ref(false);
const docked = ref(false);

/* ----------------------------------------------------------- property sheet */

const propertyOpen = ref(false);

/** React passed `onApply={() => undefined}`: the Apply button is documented, not wired. */
const noop = () => undefined;

const propertyTabs = computed(() => [
	{
		value: "background",
		label: t("widgets.propertySheet.background"),
		content: [
			h("p", t("widgets.propertySheet.pageBackground")),
			h(FieldRow, null, {
				default: () =>
					h(Select, {
						label: t("widgets.propertySheet.wallpaper"),
						defaultValue: "clouds",
						options: [
							{ label: "(None)", value: "none" },
							{ label: "Clouds", value: "clouds" },
							{ label: "Straw Mat", value: "straw" },
						],
					}),
			}),
		],
	},
	{
		value: "settings",
		label: t("widgets.propertySheet.settings"),
		content: [
			h("p", t("widgets.propertySheet.pageSettings")),
			h(FieldRow, null, {
				default: () =>
					h(Select, {
						label: t("widgets.propertySheet.colours"),
						defaultValue: "pink",
						options: [
							{ label: "Pink Line", value: "pink" },
							{ label: "Windows Standard", value: "win" },
						],
					}),
			}),
			h(FieldRow, null, {
				default: () =>
					h(Checkbox, {
						defaultChecked: true,
						label: "Show window contents while dragging",
					}),
			}),
		],
	},
]);

/* ----------------------------------------------------------------- wizard */

const wizardOpen = ref(false);
const device = ref("modem");
const done = ref(false);

const deviceLabel = computed(() =>
	device.value === "modem" ? t("widgets.wizard.deviceModem") : t("widgets.wizard.devicePrinter"),
);

const wizardLabels = computed(() => ({
	back: t("common.back"),
	next: t("common.next"),
	finish: t("common.finish"),
	cancel: t("common.cancel"),
	stepOf: (step: number, count: number) => t("common.stepOf", { step, count }),
}));

const wizardSteps = computed(() => [
	{
		key: "welcome",
		title: t("widgets.wizard.welcome"),
		content: h("p", t("widgets.wizard.welcomeBody")),
	},
	{
		key: "device",
		title: t("widgets.wizard.device"),
		content: [
			h("p", t("widgets.wizard.deviceBody")),
			h(RadioGroup, {
				name: "wizard-device",
				value: device.value,
				options: [
					{ value: "modem", label: t("widgets.wizard.deviceModem") },
					{ value: "printer", label: t("widgets.wizard.devicePrinter") },
				],
				onValueChange: (value: string) => {
					device.value = value;
				},
			}),
		],
	},
	{
		key: "confirm",
		title: t("widgets.wizard.confirm"),
		content: h("p", t("widgets.wizard.confirmBody", { device: deviceLabel.value })),
	},
]);
</script>

<template>
	<Section id="separator" title-key="nav.separator">
		<T k="widgets.separator.p1" as="p" />

		<Example :code="separatorCode">
			<FieldRow>
				<span>{{ t("widgets.separator.left") }}</span>
				<Separator orientation="vertical" />
				<span>{{ t("widgets.separator.right") }}</span>
			</FieldRow>
			<Separator />
			<T k="widgets.separator.shortcut" as="p" />
			<FieldRow>
				<Kbd>Ctrl</Kbd>
				<span>+</span>
				<Kbd>S</Kbd>
				<Separator orientation="vertical" />
				<Kbd>Escape</Kbd>
			</FieldRow>
		</Example>
	</Section>

	<Section id="spin-box" title-key="nav.spinBox">
		<T k="widgets.spinBox.p1" as="p" />

		<Example :code="spinBoxCode">
			<SpinBox
				:label="t('widgets.spinBox.fontSize')"
				:min="8"
				:max="72"
				:default-value="11"
				:width="90"
				:labels="{ up: t('common.increase'), down: t('common.decrease') }"
			/>
			<br />
			<SpinBox
				:label="t('widgets.spinBox.quantity')"
				:min="1"
				:max="99"
				:step="5"
				:default-value="10"
				:width="90"
				:labels="{ up: t('common.increase'), down: t('common.decrease') }"
			/>
			<br />
			<Field
				:label="t('widgets.spinBox.controlled')"
				:description="t('widgets.spinBox.hint')"
			>
				<SpinBox
					:value="size"
					@value-change="size = $event"
					:min="8"
					:max="72"
					:width="90"
					:labels="{ up: t('common.increase'), down: t('common.decrease') }"
				/>
			</Field>
			<p>{{ t("widgets.spinBox.value", { value: size }) }}</p>
		</Example>
	</Section>

	<Section id="date-picker" title-key="nav.datePicker">
		<T k="widgets.datePicker.p1" as="p" />

		<Example :code="datePickerCode">
			<DatePicker
				:label="t('widgets.datePicker.installedOn')"
				:width="150"
				:value="date"
				@value-change="date = $event"
				min="1995-08-24"
				max="1999-12-31"
				:labels="calendarLabels"
				:button-label="t('widgets.datePicker.installedOn')"
			/>
			<p>{{ t("widgets.datePicker.selected", { value: date }) }}</p>
		</Example>

		<T k="widgets.datePicker.p2" as="p" />

		<Example :code="calendarCode">
			<Calendar
				:default-value="date"
				:week-starts-on="1"
				min="1998-06-01"
				max="1998-06-30"
				@value-change="date = $event"
				:labels="calendarLabels"
			/>
		</Example>
	</Section>

	<Section id="split-pane" title-key="nav.splitPane">
		<T k="widgets.splitPane.p1" as="p" />

		<Example :code="splitPaneCode">
			<SplitPane
				:default-size="140"
				:min="80"
				:label="t('widgets.splitPane.divider')"
				:style="{ height: '160px', width: '420px' }"
			>
				<template #first>
					<SunkenPanel :style="{ height: '100%', padding: '8px' }">
						{{ t("widgets.splitPane.left") }}
					</SunkenPanel>
				</template>
				<template #second>
					<SunkenPanel :style="{ height: '100%', padding: '8px' }">
						{{ t("widgets.splitPane.right") }}
					</SunkenPanel>
				</template>
			</SplitPane>
			<p class="note">{{ t("widgets.splitPane.hint") }}</p>
		</Example>
	</Section>

	<Section id="balloon-tip" title-key="nav.balloonTip">
		<T k="widgets.balloonTip.p1" as="p" />

		<Example :code="balloonTipCode">
			<FieldRow>
				<Button :ref="setAnchor" @click="anchored = true">
					{{ t("widgets.balloonTip.showAnchored") }}
				</Button>
				<Button @click="docked = true">{{ t("widgets.balloonTip.showDocked") }}</Button>
			</FieldRow>

			<BalloonTip
				:open="anchored"
				@open-change="anchored = $event"
				:anchor="anchorRef"
				side="top"
				icon="info"
				:title="t('widgets.balloonTip.anchoredTitle')"
				:auto-dismiss="8000"
				closable
				:close-label="t('common.close')"
			>
				{{ t("widgets.balloonTip.anchoredBody") }}
			</BalloonTip>

			<BalloonTip
				:open="docked"
				@open-change="docked = $event"
				corner="bottom-right"
				icon="warning"
				:title="t('widgets.balloonTip.dockedTitle')"
				:auto-dismiss="8000"
				closable
				:close-label="t('common.close')"
			>
				{{ t("widgets.balloonTip.dockedBody") }}
			</BalloonTip>
		</Example>
	</Section>

	<Section id="property-sheet" title-key="nav.propertySheet">
		<T k="widgets.propertySheet.p1" as="p" />

		<Example :code="propertySheetCode">
			<Button variant="default" @click="propertyOpen = true">
				{{ t("widgets.propertySheet.open") }}
			</Button>

			<PropertySheet
				:open="propertyOpen"
				@open-change="propertyOpen = $event"
				:title="t('widgets.propertySheet.title')"
				:label="t('widgets.propertySheet.title')"
				:ok-label="t('common.ok')"
				:cancel-label="t('common.cancel')"
				:apply-label="t('common.apply')"
				:tabs="propertyTabs"
				@apply="noop"
			/>
		</Example>
	</Section>

	<Section id="wizard" title-key="nav.wizard">
		<T k="widgets.wizard.p1" as="p" />

		<Example :code="wizardCode">
			<Button variant="default" @click="wizardOpen = true">
				{{ t("widgets.wizard.open") }}
			</Button>
			<p v-if="done" class="note">
				{{ t("widgets.wizard.done", { device: deviceLabel }) }}
			</p>

			<Wizard
				:open="wizardOpen"
				@open-change="wizardOpen = $event"
				:title="t('widgets.wizard.title')"
				:label="t('widgets.wizard.title')"
				:labels="wizardLabels"
				:steps="wizardSteps"
				@finish="done = true"
			/>
		</Example>
	</Section>
</template>
