<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const windowSections: SectionMeta[] = [
	{ id: "title-bar", titleKey: "nav.titleBar", level: 4 },
	{ id: "window-contents", titleKey: "nav.windowContents", level: 4 },
	{ id: "interactive-window", titleKey: "nav.interactiveWindow", level: 4 },
	{ id: "status-bar", titleKey: "nav.statusBar", level: 4 },
];
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
	Button,
	FieldRow,
	MenuBar,
	StatusBar,
	StatusBarField,
	TitleBar,
	Window,
	WindowBody,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Windows" });

const { t } = useI18n();

/* ------------------------------------------------------------------ samples */

const titleBarCode = `
	<TitleBar text="A Title Bar" :controls="['close']" />
	<TitleBar text="A Title Bar" :controls="['minimize', 'maximize', 'close']" />
	<TitleBar text="A Maximized Title Bar" :controls="['minimize', 'restore', 'close']" />
	<TitleBar text="A Helpful Bar" :controls="['help', 'close']" />
`;

const titleBarLabelsCode = `
	<TitleBar text="An inactive title bar" :controls="['close']" inactive />
	<TitleBar
	  text="本地化标题栏"
	  :controls="['minimize', 'maximize', 'close']"
	  :labels="{ minimize: '最小化', maximize: '最大化', close: '关闭' }"
	/>
`;

const windowContentsCode = `
	<Window
	  title="A Window With Stuff In It"
	  :width="320"
	  :controls="['minimize', 'maximize', 'close']"
	>
	  <template #menuBar>
	    <MenuBar
	      label="Window menu"
	      :items="[
	        { label: 'File', accessKey: 'F' },
	        { label: 'Edit', accessKey: 'E' },
	        { label: 'View', accessKey: 'V' },
	        { label: 'Go', accessKey: 'G' },
	        { label: 'Favorites', accessKey: 'a' },
	        { label: 'Help', accessKey: 'H' },
	      ]"
	    />
	  </template>
	  <p>There's so much room for activities!</p>
	</Window>
`;

const menuBarCode = `
	<!-- MenuBar supports arrow-key navigation out of the box -->
	<MenuBar
	  :items="[
	    { label: 'File', accessKey: 'F' },
	    { label: 'Edit', accessKey: 'E' },
	    { label: 'View', accessKey: 'V' },
	  ]"
	/>
`;

const interactiveWindowCode = `
	<script setup>
	import { ref } from "vue";
	import { Button, StatusBar, StatusBarField, Window } from "98-pink-vue";

	const open = ref(true);
	const maximized = ref(false);
	const log = ref([]);

	const handleControl = (action) => {
	  log.value = [...log.value.slice(-4), action];
	  if (action === "close") open.value = false;
	  if (action === "maximize") maximized.value = true;
	  if (action === "restore") maximized.value = false;
	};
	<\/script>

	<template>
	  <Window
	    v-if="open"
	    title="Interactive window"
	    :width="maximized ? 520 : 320"
	    :controls="['minimize', maximized ? 'restore' : 'maximize', 'close']"
	    @control="handleControl"
	  >
	    <p>Try the buttons in the title bar.</p>
	    <template #statusBar>
	      <StatusBar>
	        <StatusBarField>{{ maximized ? "Maximized" : "Restored" }}</StatusBarField>
	        <StatusBarField>{{ log.length > 0 ? log.join(" → ") : "No events yet" }}</StatusBarField>
	      </StatusBar>
	    </template>
	  </Window>
	  <Button v-else @click="open = true">Reopen window</Button>
	</template>
`;

const statusBarCode = `
	<Window title="A Window With A Status Bar" :width="320">
	  <p>There are just so many possibilities:</p>
	  <ul>
	    <li>A Task Manager</li>
	    <li>A Notepad</li>
	    <li>Or even a File Explorer!</li>
	  </ul>
	  <template #statusBar>
	    <StatusBar>
	      <StatusBarField>Press F1 for help</StatusBarField>
	      <StatusBarField>Slide 1</StatusBarField>
	      <StatusBarField>CPU Usage: 14%</StatusBarField>
	    </StatusBar>
	  </template>
	</Window>
`;

const handAssembledCode = `
	<div class="window" :style="{ width: '260px' }">
	  <TitleBar text="Hand assembled" :controls="['close']" />
	  <WindowBody>
	    <FieldRow>Body content</FieldRow>
	  </WindowBody>
	</div>
`;

/* ------------------------------------------------------------ window menus */

const contentsMenuItems = computed(() => [
	{ label: t("windows.contents.menuFile"), accessKey: "F" },
	{ label: t("windows.contents.menuEdit"), accessKey: "E" },
	{ label: t("windows.contents.menuView"), accessKey: "V" },
	{ label: t("windows.contents.menuGo"), accessKey: "G" },
	{ label: t("windows.contents.menuFavorites"), accessKey: "a" },
	{ label: t("windows.contents.menuHelp"), accessKey: "H" },
]);

const navigationMenuItems = computed(() => [
	{ label: t("windows.contents.menuFile"), accessKey: "F" },
	{ label: t("windows.contents.menuEdit"), accessKey: "E" },
	{ label: t("windows.contents.menuView"), accessKey: "V" },
]);

/* ------------------------------------------------------ interactive window */

const open = ref(true);
const maximized = ref(false);
const log = ref<string[]>([]);

const handleControl = (action: string) => {
	log.value = [...log.value.slice(-4), action];
	if (action === "close") open.value = false;
	if (action === "maximize") maximized.value = true;
	if (action === "restore") maximized.value = false;
};
</script>

<template>
	<Section id="title-bar" title-key="nav.titleBar" :level="4">
		<blockquote>
			<T k="windows.titleBar.quote" />
			<footer>{{ t("windows.titleBar.quoteSource") }}</footer>
		</blockquote>

		<T k="windows.titleBar.p1" as="p" />

		<Example :code="titleBarCode">
			<TitleBar :text="t('windows.titleBar.aTitleBar')" :controls="['close']" />
			<br />
			<TitleBar
				:text="t('windows.titleBar.aTitleBar')"
				:controls="['minimize', 'maximize', 'close']"
			/>
			<br />
			<TitleBar
				:text="t('windows.titleBar.aMaximizedTitleBar')"
				:controls="['minimize', 'restore', 'close']"
			/>
			<br />
			<TitleBar :text="t('windows.titleBar.aHelpfulBar')" :controls="['help', 'close']" />
		</Example>

		<T k="windows.titleBar.p2" as="p" />

		<Example :code="titleBarLabelsCode">
			<TitleBar
				:text="t('windows.titleBar.inactiveTitleBar')"
				:controls="['close']"
				inactive
			/>
			<br />
			<TitleBar
				text="本地化标题栏"
				:controls="['minimize', 'maximize', 'close']"
				:labels="{ minimize: '最小化', maximize: '最大化', close: '关闭' }"
			/>
		</Example>
	</Section>

	<Section id="window-contents" title-key="nav.windowContents" :level="4">
		<blockquote>
			<T k="windows.contents.quote" />
			<footer>{{ t("windows.contents.quoteSource") }}</footer>
		</blockquote>

		<T k="windows.contents.p1" as="p" />

		<Example :code="windowContentsCode">
			<Window
				:title="t('windows.contents.windowTitle')"
				:width="320"
				:controls="['minimize', 'maximize', 'close']"
			>
				<template #menuBar>
					<MenuBar
						:label="t('windows.contents.menuLabel')"
						:items="contentsMenuItems"
					/>
				</template>
				<p>{{ t("windows.contents.roomForActivities") }}</p>
			</Window>
		</Example>

		<T k="windows.contents.p2" as="p" />

		<Example :code="menuBarCode">
			<MenuBar :items="navigationMenuItems" />
		</Example>
	</Section>

	<Section id="interactive-window" title-key="nav.interactiveWindow" :level="4">
		<T k="windows.interactive.p1" as="p" />

		<Example :code="interactiveWindowCode">
			<Window
				v-if="open"
				:title="t('windows.interactive.windowTitle')"
				:width="maximized ? 520 : 320"
				:controls="['minimize', maximized ? 'restore' : 'maximize', 'close']"
				@control="handleControl"
			>
				<p>{{ t("windows.interactive.body") }}</p>
				<template #statusBar>
					<StatusBar>
						<StatusBarField>{{
							maximized
								? t("windows.interactive.maximized")
								: t("windows.interactive.restored")
						}}</StatusBarField>
						<StatusBarField>{{
							log.length > 0 ? log.join(" → ") : t("windows.interactive.noEvents")
						}}</StatusBarField>
					</StatusBar>
				</template>
			</Window>
			<Button v-else @click="open = true">{{ t("windows.interactive.reopen") }}</Button>
		</Example>
	</Section>

	<Section id="status-bar" title-key="nav.statusBar" :level="4">
		<blockquote>
			<T k="windows.statusBar.quote" />
			<footer>{{ t("windows.statusBar.quoteSource") }}</footer>
		</blockquote>

		<Example :code="statusBarCode">
			<Window :title="t('windows.statusBar.windowTitle')" :width="320">
				<p>{{ t("windows.statusBar.intro") }}</p>
				<ul>
					<li>{{ t("windows.statusBar.item1") }}</li>
					<li>{{ t("windows.statusBar.item2") }}</li>
					<li>{{ t("windows.statusBar.item3") }}</li>
				</ul>
				<template #statusBar>
					<StatusBar>
						<StatusBarField>{{ t("windows.statusBar.fieldHelp") }}</StatusBarField>
						<StatusBarField>{{ t("windows.statusBar.fieldSlide") }}</StatusBarField>
						<StatusBarField>{{ t("windows.statusBar.fieldCpu") }}</StatusBarField>
					</StatusBar>
				</template>
			</Window>
		</Example>

		<T k="windows.statusBar.p1" as="p" />

		<Example :code="handAssembledCode">
			<div class="window" :style="{ width: '260px' }">
				<TitleBar :text="t('windows.statusBar.handAssembled')" :controls="['close']" />
				<WindowBody>
					<FieldRow>{{ t("windows.statusBar.bodyContent") }}</FieldRow>
				</WindowBody>
			</div>
		</Example>
	</Section>
</template>
