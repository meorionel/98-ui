<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const overlaySections: SectionMeta[] = [
	{ id: "menus", titleKey: "nav.menus", level: 3 },
	{ id: "context-menu", titleKey: "nav.contextMenu", level: 3 },
	{ id: "dialog", titleKey: "nav.dialog", level: 3 },
	{ id: "tooltip-popover", titleKey: "nav.tooltipPopover", level: 3 },
];
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
	Button,
	Checkbox,
	ContextMenu,
	Dialog,
	DropdownMenu,
	FieldRow,
	MenuBar,
	MessageBox,
	Popover,
	Select,
	StatusBar,
	StatusBarField,
	SunkenPanel,
	TextBox,
	Tooltip,
	Window,
	type MenuEntry,
	type MessageBoxIcon,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Overlays" });

const { t } = useI18n();

/* ------------------------------------------------------------------ samples */

const menusCode = `
	<Window title="A window with real menus" :controls="['close']">
	  <template #menuBar>
	    <MenuBar
	      :items="[
	        {
	          label: 'File',
	          accessKey: 'F',
	          items: [
	            { label: 'New', accessKey: 'N', shortcut: 'Ctrl+N', onSelect: newFile },
	            { type: 'separator' },
	            {
	              type: 'submenu',
	              label: 'Send to',
	              items: [{ label: 'Desktop' }, { label: 'Mail recipient' }],
	            },
	          ],
	        },
	        {
	          label: 'View',
	          accessKey: 'V',
	          items: [
	            { type: 'checkbox', label: 'Status bar', checked: statusBar, onCheckedChange: setStatusBar, keepOpen: true },
	            { type: 'separator' },
	            { type: 'radio', label: '100%', value: '100', checked: zoom === '100' },
	          ],
	        },
	      ]"
	    />
	  </template>
	  <p>Open File and View.</p>
	</Window>
`;

const dropdownMenuCode = `
	<DropdownMenu
	  :items="[
	    { type: 'checkbox', label: 'Status bar', checked: true },
	    { type: 'separator' },
	    { type: 'submenu', label: 'Send to', items: [{ label: 'Desktop' }] },
	  ]"
	>
	  <template #trigger>
	    <Button>Options</Button>
	  </template>
	</DropdownMenu>
`;

const contextMenuCode = `
	<ContextMenu
	  :items="[
	    { label: 'Rename', accessKey: 'R', onSelect: rename },
	    { label: 'Delete', accessKey: 'D', onSelect: remove },
	    { type: 'separator' },
	    { type: 'submenu', label: 'New', items: [{ label: 'Folder' }, { label: 'Shortcut' }] },
	  ]"
	>
	  <SunkenPanel :style="{ padding: '16px' }">Right-click this panel</SunkenPanel>
	</ContextMenu>
`;

const dialogCode = `
	<Dialog
	  :open="open"
	  @open-change="open = $event"
	  title="Delete file"
	  :width="320"
	>
	  <p>Are you sure you want to send REPORT.DOC to the Recycle Bin?</p>
	  <template #footer>
	    <Button variant="default" @click="open = false">OK</Button>
	    <Button @click="open = false">Cancel</Button>
	  </template>
	</Dialog>
`;

const messageBoxCode = `
	<MessageBox
	  :open="open"
	  @open-change="open = $event"
	  title="Confirm file delete"
	  icon="warning"
	  :buttons="['yes', 'no', 'cancel']"
	  default-button="no"
	  @result="(result) => console.log(result)"
	>
	  Deleting a file moves it to the Recycle Bin. Continue?
	</MessageBox>
`;

const tooltipCode = `
	<Tooltip content="Sends the file to the Recycle Bin">
	  <Button>Hover me</Button>
	</Tooltip>

	<!-- Any side, and it flips automatically when there is no room -->
	<Tooltip content="Tooltips can sit on any side" side="right">
	  <Button>Hover me too</Button>
	</Tooltip>
`;

const popoverCode = `
	<Popover label="File details">
	  <template #trigger>
	    <Button>Details</Button>
	  </template>
	  <FieldRow>
	    <Checkbox :default-checked="true" label="Read-only" />
	  </FieldRow>
	  <FieldRow>
	    <TextBox label="Name" value="AUTOEXEC.BAT" />
	  </FieldRow>
	  <FieldRow>
	    <Button variant="default">Apply</Button>
	  </FieldRow>
	</Popover>
`;

/* -------------------------------------------------------------------- menus */

const menusLast = ref<string | null>(null);
const statusBar = ref(true);
const zoom = ref("100");

const runMenus = (label: string) => () => {
	menusLast.value = label;
};

const fileItems = computed<MenuEntry[]>(() => [
	{
		label: t("overlays.menus.new"),
		accessKey: "N",
		shortcut: "Ctrl+N",
		onSelect: runMenus(t("overlays.menus.new")),
	},
	{
		label: t("overlays.menus.open"),
		accessKey: "O",
		shortcut: "Ctrl+O",
		onSelect: runMenus(t("overlays.menus.open")),
	},
	{ type: "separator" },
	{
		type: "submenu",
		label: t("overlays.menus.sendTo"),
		items: [
			{ label: t("overlays.menus.desktop"), onSelect: runMenus(t("overlays.menus.desktop")) },
			{ label: t("overlays.menus.mail"), onSelect: runMenus(t("overlays.menus.mail")) },
		],
	},
	{ type: "separator" },
	{
		label: t("overlays.menus.exit"),
		accessKey: "x",
		onSelect: runMenus(t("overlays.menus.exit")),
	},
]);

const viewItems = computed<MenuEntry[]>(() => [
	{
		type: "checkbox",
		label: t("overlays.menus.statusBar"),
		checked: statusBar.value,
		onCheckedChange: (checked) => {
			statusBar.value = checked;
		},
		keepOpen: true,
	},
	{ type: "separator" },
	{ type: "label", label: t("overlays.menus.zoom") },
	{
		type: "radio",
		label: t("overlays.menus.zoom100"),
		value: "100",
		checked: zoom.value === "100",
		onCheckedChange: () => {
			zoom.value = "100";
		},
	},
	{
		type: "radio",
		label: t("overlays.menus.zoom200"),
		value: "200",
		checked: zoom.value === "200",
		onCheckedChange: () => {
			zoom.value = "200";
		},
	},
]);

const windowMenuItems = computed(() => [
	{ label: t("overlays.menus.file"), accessKey: "F", items: fileItems.value },
	{ label: t("overlays.menus.view"), accessKey: "V", items: viewItems.value },
]);

/* ------------------------------------------------------------- context menu */

const contextLast = ref<string | null>(null);
const contextWordWrap = ref(true);

const runContext = (label: string) => () => {
	contextLast.value = label;
};

const contextItems = computed<MenuEntry[]>(() => [
	{
		type: "submenu",
		label: t("overlays.contextMenu.new"),
		items: [
			{
				label: t("overlays.contextMenu.folder"),
				onSelect: runContext(t("overlays.contextMenu.folder")),
			},
			{
				label: t("overlays.contextMenu.shortcut"),
				onSelect: runContext(t("overlays.contextMenu.shortcut")),
			},
		],
	},
	{ type: "separator" },
	{
		label: t("overlays.contextMenu.rename"),
		accessKey: "R",
		onSelect: runContext(t("overlays.contextMenu.rename")),
	},
	{
		label: t("overlays.contextMenu.delete"),
		accessKey: "D",
		onSelect: runContext(t("overlays.contextMenu.delete")),
	},
	{ type: "separator" },
	{
		type: "checkbox",
		label: t("overlays.contextMenu.wordWrap"),
		checked: contextWordWrap.value,
		onCheckedChange: (checked) => {
			contextWordWrap.value = checked;
		},
		keepOpen: true,
	},
	{
		label: t("overlays.contextMenu.properties"),
		accessKey: "P",
		onSelect: runContext(t("overlays.contextMenu.properties")),
	},
]);

/* ------------------------------------------------------------------ dialogs */

const dialogOpen = ref(false);
const boxOpen = ref(false);
const icon = ref<MessageBoxIcon>("warning");
const result = ref<string | null>(null);

const iconOptions = computed(() => [
	{ label: t("overlays.dialog.iconInfo"), value: "info" },
	{ label: t("overlays.dialog.iconWarning"), value: "warning" },
	{ label: t("overlays.dialog.iconError"), value: "error" },
	{ label: t("overlays.dialog.iconQuestion"), value: "question" },
]);

const handleIconChange = (event: Event) => {
	icon.value = (event.target as HTMLSelectElement).value as MessageBoxIcon;
};

const handleMessageResult = (value: string) => {
	result.value = value;
};
</script>

<template>
	<Section id="menus" title-key="nav.menus">
		<blockquote>
			<T k="overlays.menus.quote" />
			<footer>{{ t("overlays.menus.quoteSource") }}</footer>
		</blockquote>

		<T k="overlays.menus.p1" as="p" />

		<Example :code="menusCode">
			<Window
				:title="t('overlays.menus.windowTitle')"
				:width="340"
				:controls="['close']"
			>
				<template #menuBar>
					<MenuBar
						:label="t('overlays.menus.menuLabel')"
						:items="windowMenuItems"
					/>
				</template>
				<template #statusBar>
					<StatusBar v-if="statusBar">
						<StatusBarField>
							{{
								menusLast === null
									? t("overlays.menus.noSelection")
									: t("overlays.menus.lastCommand") + ": " + menusLast
							}}
						</StatusBarField>
						<StatusBarField>{{ zoom }}%</StatusBarField>
					</StatusBar>
				</template>
				<p>{{ t("overlays.menus.body") }}</p>
			</Window>
		</Example>

		<T k="overlays.menus.p2" as="p" />

		<Example :code="dropdownMenuCode">
			<FieldRow>
				<DropdownMenu
					:items="viewItems"
					:label="t('overlays.menus.options')"
				>
					<template #trigger>
						<Button>{{ t("overlays.menus.options") }}</Button>
					</template>
				</DropdownMenu>
				<DropdownMenu
					:items="fileItems"
					:label="t('overlays.menus.sendTo')"
				>
					<template #trigger>
						<Button variant="default">{{ t("overlays.menus.sendTo") }}</Button>
					</template>
				</DropdownMenu>
			</FieldRow>
		</Example>
	</Section>

	<Section id="context-menu" title-key="nav.contextMenu">
		<T k="overlays.contextMenu.p1" as="p" />

		<Example :code="contextMenuCode">
			<ContextMenu
				:items="contextItems"
				:label="t('overlays.contextMenu.label')"
			>
				<SunkenPanel :style="{ padding: '16px', width: '220px', textAlign: 'center' }">
					{{ t("overlays.contextMenu.area") }}
				</SunkenPanel>
			</ContextMenu>
			<p class="note">{{ t("overlays.contextMenu.hint") }}</p>
			<p>
				{{
					contextLast === null
						? t("overlays.contextMenu.none")
						: t("overlays.contextMenu.lastCommand") + ": " + contextLast
				}}
			</p>
		</Example>
	</Section>

	<Section id="dialog" title-key="nav.dialog">
		<T k="overlays.dialog.p1" as="p" />

		<Example :code="dialogCode">
			<FieldRow>
				<Button variant="default" @click="dialogOpen = true">
					{{ t("overlays.dialog.openDialog") }}
				</Button>
			</FieldRow>

			<Dialog
				:open="dialogOpen"
				@open-change="dialogOpen = $event"
				:title="t('overlays.dialog.title')"
				:width="320"
			>
				<p>{{ t("overlays.dialog.body") }}</p>
				<template #footer>
					<Button variant="default" @click="dialogOpen = false">
						{{ t("common.ok") }}
					</Button>
					<Button @click="dialogOpen = false">{{ t("common.cancel") }}</Button>
				</template>
			</Dialog>
		</Example>

		<T k="overlays.dialog.p2" as="p" />

		<Example :code="messageBoxCode">
			<FieldRow>
				<Select
					:label="t('overlays.dialog.icon')"
					:value="icon"
					:options="iconOptions"
					@change="handleIconChange"
				/>
				<Button variant="default" @click="boxOpen = true">
					{{ t("overlays.dialog.openMessageBox") }}
				</Button>
			</FieldRow>

			<MessageBox
				:open="boxOpen"
				@open-change="boxOpen = $event"
				:title="t('overlays.dialog.boxTitle')"
				:icon="icon"
				:buttons="['yes', 'no', 'cancel']"
				default-button="no"
				:button-labels="{
					yes: t('common.yes'),
					no: t('common.no'),
					cancel: t('common.cancel'),
				}"
				@result="handleMessageResult"
			>
				{{ t("overlays.dialog.boxBody") }}
			</MessageBox>

			<p class="note">
				{{ t("overlays.dialog.result") }}:
				{{ result === null ? t("overlays.dialog.none") : result }}
			</p>
		</Example>
	</Section>

	<Section id="tooltip-popover" title-key="nav.tooltipPopover">
		<T k="overlays.tooltipPopover.p1" as="p" />

		<Example :code="tooltipCode">
			<FieldRow>
				<Tooltip :content="t('overlays.tooltipPopover.tooltipText')">
					<Button>{{ t("overlays.tooltipPopover.hoverMe") }}</Button>
				</Tooltip>
				<Tooltip
					:content="t('overlays.tooltipPopover.tooltipText')"
					side="right"
				>
					<Button>{{ t("overlays.tooltipPopover.hoverMeRight") }}</Button>
				</Tooltip>
			</FieldRow>
		</Example>

		<T k="overlays.tooltipPopover.p2" as="p" />

		<Example :code="popoverCode">
			<Popover :label="t('overlays.tooltipPopover.popoverLabel')">
				<template #trigger>
					<Button>{{ t("overlays.tooltipPopover.details") }}</Button>
				</template>
				<FieldRow>
					<Checkbox
						:default-checked="true"
						:label="t('overlays.tooltipPopover.readOnly')"
					/>
				</FieldRow>
				<FieldRow>
					<Checkbox :label="t('overlays.tooltipPopover.hidden')" />
				</FieldRow>
				<FieldRow>
					<TextBox
						:label="t('overlays.tooltipPopover.name')"
						value="AUTOEXEC.BAT"
						:width="130"
					/>
				</FieldRow>
				<FieldRow>
					<Button variant="default">{{ t("overlays.tooltipPopover.apply") }}</Button>
				</FieldRow>
			</Popover>
		</Example>
	</Section>
</template>
