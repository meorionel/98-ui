<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const controlSections: SectionMeta[] = [
	{ id: "combo-box", titleKey: "nav.comboBox", level: 3 },
	{ id: "toolbar", titleKey: "nav.toolbar", level: 3 },
	{ id: "form-field", titleKey: "nav.formField", level: 3 },
];
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
	Button,
	ButtonGroup,
	ComboBox,
	DropdownMenu,
	Field,
	Select,
	TextBox,
	ToggleGroup,
	ToggleGroupItem,
	Toolbar,
	ToolbarButton,
	ToolbarSeparator,
	ToolbarSpacer,
	Window,
	type MenuEntry,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Controls" });

const { t } = useI18n();

/** Sample data — deliberately not translated, like the table view's. */
const DRIVERS = [
	{ id: "mysql", name: "MySQL ODBC 3.51 Driver" },
	{ id: "sqlserver", name: "SQL Server" },
	{ id: "oracle", name: "Oracle in OraHome92" },
	{ id: "access", name: "Microsoft Access Driver (*.mdb)" },
];

const PORTS = ["COM1", "COM2", "LPT1", "FILE"].map((port) => ({ value: port, label: port }));

/* ------------------------------------------------------------- code samples */

const comboBoxCode = `
	const driver = ref("sqlserver");

	<ComboBox
	  label="Driver"
	  :width="220"
	  :value="driver"
	  :options="drivers.map((driver) => ({ value: driver.id, label: driver.name }))"
	  @value-change="driver = $event"
	/>
	<p>Selected value: {{ driver }}</p>
`;

const comboBoxSelectOnlyCode = `
	<!-- The drop-down list style: read-only box, type-ahead, Enter chooses -->
	<ComboBox
	  select-only
	  label="Port"
	  :width="140"
	  :value="port"
	  :options="['COM1', 'COM2', 'LPT1'].map((port) => ({ value: port, label: port }))"
	  @value-change="port = $event"
	/>
`;

const toolbarCode = `
	const bold = ref(true);

	<Window title="A window with a toolbar" :width="380" :controls="['close']">
	  <Toolbar label="Standard">
	    <ToolbarButton @click="newFile">New</ToolbarButton>
	    <ToolbarButton @click="openFile">Open</ToolbarButton>
	    <ToolbarSeparator />
	    <ToolbarButton :pressed="bold" @pressed-change="bold = $event">Bold</ToolbarButton>
	    <ToolbarButton default-pressed>Italic</ToolbarButton>
	    <ToolbarSeparator />
	    <DropdownMenu :items="zoomItems">
	      <template #trigger>
	        <ToolbarButton>Zoom</ToolbarButton>
	      </template>
	    </DropdownMenu>
	    <ToolbarSpacer />
	    <ToolbarButton disabled>Help</ToolbarButton>
	  </Toolbar>
	  <p>Last command: {{ last }}</p>
	</Window>
`;

const toggleGroupCode = `
	<ToggleGroup label="Alignment" :value="alignment" @value-change="alignment = String($event)">
	  <ToggleGroupItem value="left">Left</ToggleGroupItem>
	  <ToggleGroupItem value="center">Center</ToggleGroupItem>
	  <ToggleGroupItem value="right">Right</ToggleGroupItem>
	</ToggleGroup>

	<ButtonGroup aria-label="Commands">
	  <Button variant="default">OK</Button>
	  <Button>Cancel</Button>
	</ButtonGroup>
`;

const fieldCode = `
	const userName = ref("");
	const error = ref<string | null>(null);

	function onUserNameChange(event: Event) {
	  const next = (event.target as HTMLInputElement).value;
	  userName.value = next;
	  error.value = next.trim() === "" ? "A user name is required." : null;
	}

	<Field
	  label="User name"
	  description="Letters, digits and underscores only."
	  required
	  :error="error"
	>
	  <TextBox :width="200" :value="userName" @input="onUserNameChange" />
	</Field>
`;

const fieldErrorCode = `
	<Field label="Port" error="Choose a port before continuing.">
	  <ComboBox :options="ports" :width="140" />
	</Field>

	<Field label="Protocol">
	  <Select :options="[{ label: 'TCP/IP', value: 'tcp' }]" />
	</Field>
`;

/* --------------------------------------------------------- interactive state */

const driver = ref("sqlserver");
const port = ref("COM1");

const bold = ref(true);
const alignment = ref("left");
const last = ref<string | null>(null);

/** React's `run(label)` factory: the menu entries carry their own handler. */
const run = (label: string) => () => {
	last.value = label;
};

const zoomItems = computed<MenuEntry[]>(() => [
	{ label: t("controls.toolbar.zoom100"), onSelect: run(t("controls.toolbar.zoom100")) },
	{ label: t("controls.toolbar.zoom200"), onSelect: run(t("controls.toolbar.zoom200")) },
]);

const userName = ref("");
const error = ref<string | null>(null);

/**
 * React's `(event) => { const next = event.target.value; … }`, unrolled.
 *
 * React's `onChange` fires on every keystroke, so its Vue counterpart is the
 * native `input` event — `change` would only fire on blur and the error would
 * appear late.
 */
const onUserNameChange = (event: Event) => {
	const next = (event.target as HTMLInputElement).value;
	userName.value = next;
	error.value = next.trim() === "" ? t("controls.field.required") : null;
};
</script>

<template>
	<Section id="combo-box" title-key="nav.comboBox">
		<T k="controls.comboBox.p1" as="p" />

		<Example :code="comboBoxCode">
			<ComboBox
				:label="t('controls.comboBox.editable')"
				:width="220"
				:value="driver"
				:list-label="t('controls.comboBox.editable')"
				:button-label="t('controls.comboBox.showOptions')"
				:options="DRIVERS.map((entry) => ({ value: entry.id, label: entry.name }))"
				@value-change="driver = $event"
			/>
			<p>{{ t("controls.comboBox.selected", { value: driver }) }}</p>
		</Example>

		<T k="controls.comboBox.p2" as="p" />

		<Example :code="comboBoxSelectOnlyCode">
			<ComboBox
				select-only
				:label="t('controls.comboBox.port')"
				:width="140"
				:value="port"
				:list-label="t('controls.comboBox.port')"
				:button-label="t('controls.comboBox.showOptions')"
				:options="PORTS"
				@value-change="port = $event"
			/>
		</Example>

		<T k="controls.comboBox.p3" as="p" />
	</Section>

	<Section id="toolbar" title-key="nav.toolbar">
		<T k="controls.toolbar.p1" as="p" />

		<Example :code="toolbarCode">
			<Window
				:title="t('controls.toolbar.windowTitle')"
				:width="380"
				:controls="['close']"
			>
				<Toolbar :label="t('controls.toolbar.label')">
					<ToolbarButton @click="last = t('controls.toolbar.new')">
						{{ t("controls.toolbar.new") }}
					</ToolbarButton>
					<ToolbarButton @click="last = t('controls.toolbar.open')">
						{{ t("controls.toolbar.open") }}
					</ToolbarButton>
					<ToolbarSeparator />
					<ToolbarButton :pressed="bold" @pressed-change="bold = $event">
						{{ t("controls.toolbar.bold") }}
					</ToolbarButton>
					<ToolbarButton default-pressed>{{ t("controls.toolbar.italic") }}</ToolbarButton>
					<ToolbarSeparator />
					<DropdownMenu :items="zoomItems" :label="t('controls.toolbar.zoom')">
						<template #trigger>
							<ToolbarButton>{{ t("controls.toolbar.zoom") }}</ToolbarButton>
						</template>
					</DropdownMenu>
					<ToolbarSpacer />
					<ToolbarButton disabled>{{ t("controls.toolbar.help") }}</ToolbarButton>
				</Toolbar>
				<p>
					{{
						last === null
							? t("controls.toolbar.nothing")
							: t("controls.toolbar.lastCommand", { value: last })
					}}
				</p>
			</Window>
		</Example>

		<T k="controls.toolbar.p2" as="p" />

		<Example :code="toggleGroupCode">
			<ToggleGroup
				:label="t('controls.toolbar.alignment')"
				:value="alignment"
				@value-change="alignment = String($event)"
			>
				<ToggleGroupItem value="left">{{ t("controls.toolbar.left") }}</ToggleGroupItem>
				<ToggleGroupItem value="center">{{ t("controls.toolbar.center") }}</ToggleGroupItem>
				<ToggleGroupItem value="right">{{ t("controls.toolbar.right") }}</ToggleGroupItem>
			</ToggleGroup>
			<br />
			<ButtonGroup :aria-label="t('controls.toolbar.label')">
				<Button variant="default">{{ t("common.ok") }}</Button>
				<Button>{{ t("common.cancel") }}</Button>
			</ButtonGroup>
		</Example>
	</Section>

	<Section id="form-field" title-key="nav.formField">
		<T k="controls.field.p1" as="p" />

		<Example :code="fieldCode">
			<Field
				:label="t('controls.field.userName')"
				:description="t('controls.field.userHint')"
				required
				:error="error ?? undefined"
			>
				<TextBox :width="200" :value="userName" @input="onUserNameChange" />
			</Field>
		</Example>

		<T k="controls.field.p2" as="p" />

		<Example :code="fieldErrorCode">
			<Field :label="t('controls.field.port')" :error="t('controls.field.portError')">
				<ComboBox :options="PORTS" :width="140" />
			</Field>
			<br />
			<Field :label="t('controls.field.protocol')">
				<Select
					:options="[
						{ label: 'TCP/IP', value: 'tcp' },
						{ label: 'Named pipes', value: 'pipe' },
					]"
				/>
			</Field>
		</Example>
	</Section>
</template>
