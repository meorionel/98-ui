<script setup lang="ts">
import { computed, ref } from "vue";
import {
	Button,
	Checkbox,
	CodeBlock,
	FieldRow,
	Link,
	Slider,
	SunkenPanel,
	TreeView,
	TreeViewItem,
	TreeViewLink,
	Window,
} from "98-pink-vue";
import Example from "./Example.vue";
import LocaleSwitcher from "./LocaleSwitcher.vue";
import { T, useI18n, type MessageKey } from "./i18n";
import Component from "./sections/Component.vue";
import Section from "./sections/Section.vue";
import type { SectionMeta } from "./sections/shared";
import Controls, { controlSections } from "./sections/Controls.vue";
import DataDisplay, { dataDisplaySections } from "./sections/DataDisplay.vue";
import Display, { displaySections } from "./sections/Display.vue";
import FormControls, { formControlSections } from "./sections/FormControls.vue";
import Overlays, { overlaySections } from "./sections/Overlays.vue";
import Panels, { panelSections } from "./sections/Panels.vue";
import Widgets, { widgetSections } from "./sections/Widgets.vue";
import Windows, { windowSections } from "./sections/Windows.vue";

/**
 * The whole documentation page.
 *
 * Section *content* lives in `sections/*.vue` (one file per React section file,
 * each rendering its own headings in order); this file owns the two-column
 * shell, the sidebar, and the three prose chapters that are not component
 * sections.
 */
defineOptions({ name: "DemoPage" });

const { t } = useI18n();

/* ------------------------------------------------------------------ theming */

const hue = ref(210);

const themingStyle = computed(() => ({
	"--surface": `hsl(${hue.value} 60% 92%)`,
	"--button-surface": `hsl(${hue.value} 55% 82%)`,
	"--color-pinkline-100": `hsl(${hue.value} 55% 82%)`,
	"--border-color": `hsl(${hue.value} 70% 25%)`,
	"--text-color": `hsl(${hue.value} 70% 25%)`,
	"--button-shadow": `hsl(${hue.value} 30% 55%)`,
	"--button-face": `hsl(${hue.value} 40% 72%)`,
}));

const themingSections: SectionMeta[] = [{ id: "theming", titleKey: "nav.theming", level: 3 }];

/** Every documented section, in page order — the sidebar iterates this. */
const allSections: SectionMeta[] = [
	...formControlSections,
	...controlSections,
	...windowSections,
	...dataDisplaySections,
	...panelSections,
	...overlaySections,
	...widgetSections,
	...displaySections,
	...themingSections,
];

/* ------------------------------------------------------------- code samples */

const installCode = `npm install 98-pink-vue
# or
bun add 98-pink-vue`;

const importCode = `import "98-pink-vue/style.css";`;

const helloCode = `
	import { Window, Button, Checkbox, FieldRow } from "98-pink-vue";
	import "98-pink-vue/style.css";

	<template>
	  <Window title="Hello!" :width="300" :controls="['close']">
	    <p>It is 1998 in here.</p>
	    <FieldRow>
	      <Checkbox v-model="pink" label="Enable pink mode" />
	    </FieldRow>
	    <FieldRow>
	      <Button variant="default">OK</Button>
	      <Button>Cancel</Button>
	    </FieldRow>
	  </Window>
	</template>

	<script setup>
	import { ref } from "vue";
	const pink = ref(true);
	<\/script>
`;

const themingCode = `
	<script setup>
	import { ref } from "vue";
	const hue = ref(210);
	<\/script>

	<template>
	  <div :style="{
	    '--surface': \`hsl(\${hue} 60% 92%)\`,
	    '--button-surface': \`hsl(\${hue} 55% 82%)\`,
	    '--border-color': \`hsl(\${hue} 70% 25%)\`,
	    '--text-color': \`hsl(\${hue} 70% 25%)\`,
	  }">
	    <Window title="Rethemed at runtime" :width="280" :controls="['close']">
	      <p>Same components, different tokens.</p>
	    </Window>
	  </div>
	</template>
`;

/* ------------------------------------------------------- porting notes list */

const noteItems: Array<[MessageKey, MessageKey]> = [
	["app.note1Title", "app.note1Body"],
	["app.note2Title", "app.note2Body"],
	["app.note3Title", "app.note3Body"],
	["app.note4Title", "app.note4Body"],
	["app.note5Title", "app.note5Body"],
	["app.note6Title", "app.note6Body"],
];
</script>

<template>
	<aside>
		<LocaleSwitcher />
		<TreeView>
			<TreeViewItem>
				<TreeViewLink href="#intro">{{ t("nav.intro") }}</TreeViewLink>
			</TreeViewItem>
			<TreeViewItem>
				<TreeViewLink href="#install">{{ t("nav.install") }}</TreeViewLink>
			</TreeViewItem>
			<TreeViewItem>
				{{ t("nav.components") }}
				<ul>
					<li v-for="section in allSections" :key="section.id">
						<TreeViewLink :href="`#${section.id}`">{{ t(section.titleKey) }}</TreeViewLink>
					</li>
				</ul>
			</TreeViewItem>
			<TreeViewItem>
				{{ t("nav.notes") }}
				<ul>
					<li>
						<TreeViewLink href="#notes">{{ t("nav.portingNotes") }}</TreeViewLink>
					</li>
					<li>
						<TreeViewLink href="#license">{{ t("nav.license") }}</TreeViewLink>
					</li>
				</ul>
			</TreeViewItem>
		</TreeView>
	</aside>

	<main>
		<h1>98-pink-vue</h1>
		<T k="app.subtitle" :vars="{ count: allSections.length }" as="p" />

		<h2 id="intro">{{ t("app.introHeading") }}</h2>
		<Component>
			<p><strong style="color: purple">✨ 98-pink-vue ✨</strong> {{ t("app.introA") }}<Link href="https://github.com/meorionel/98-pink.css">98-pink.css</Link>{{ t("app.introB") }}<Link href="https://jdan.github.io/98.css/">98.css</Link>{{ t("app.introC") }}</p>

			<h3 id="install">{{ t("app.installHeading") }}</h3>
			<CodeBlock>{{ installCode }}</CodeBlock>

			<p>{{ t("app.installImportHint") }}</p>
			<CodeBlock>{{ importCode }}</CodeBlock>

			<p>{{ t("app.installThen") }}</p>
			<Example :code="helloCode">
				<Window :title="t('app.helloTitle')" :width="300" :controls="['close']">
					<p>{{ t("app.helloBody") }}</p>
					<FieldRow>
						<Checkbox :default-checked="true" :label="t('app.enablePinkMode')" />
					</FieldRow>
					<FieldRow>
						<Button variant="default">{{ t("common.ok") }}</Button>
						<Button>{{ t("common.cancel") }}</Button>
					</FieldRow>
				</Window>
			</Example>

			<p class="note"><strong>{{ t("app.noteLabel") }}:</strong> <T k="app.noteBody" /></p>
		</Component>

		<h2 id="components">{{ t("app.componentsHeading") }}</h2>
		<p class="note">{{ t("app.codeSamplesNote") }}</p>

		<FormControls />
		<Controls />
		<Windows />
		<DataDisplay />
		<Panels />
		<Overlays />
		<Widgets />
		<Display />

		<Section id="theming" title-key="nav.theming" :level="3">
			<T k="app.themingP1" as="p" />

			<Example :code="themingCode">
				<div :style="themingStyle">
					<Window :title="t('app.themingWindowTitle')" :width="280" :controls="['close']">
						<p>{{ t("app.themingWindowBody") }}</p>
						<FieldRow>
							<Button variant="default">{{ t("common.ok") }}</Button>
							<Button>{{ t("common.cancel") }}</Button>
						</FieldRow>
					</Window>
				</div>

				<div class="row" :style="{ marginTop: '12px', alignItems: 'center' }">
					<label for="hue-slider">{{ t("common.hue") }}</label>
					<Slider
						id="hue-slider"
						:min="0"
						:max="360"
						:value="hue"
						:style="{ width: '200px' }"
						@value-change="hue = Number($event)"
					/>
					<span>{{ hue }}</span>
				</div>
			</Example>
		</Section>

		<h2 id="notes">{{ t("app.portingNotesHeading") }}</h2>
		<Component>
			<p>{{ t("app.notesIntro") }}</p>
			<ul>
				<li v-for="[titleKey, bodyKey] in noteItems" :key="titleKey">
					<strong>{{ t(titleKey) }}</strong> <T :k="bodyKey" />
				</li>
			</ul>

			<p>{{ t("app.notesTreeIntro") }}</p>
			<SunkenPanel :style="{ maxHeight: '160px', padding: '8px' }">
				<ul>
					<li>
						<T k="app.treeItem1" />
					</li>
					<li>
						<T k="app.treeItem2" />
					</li>
					<li>
						<T k="app.treeItem3" />
					</li>
				</ul>
			</SunkenPanel>
		</Component>

		<h2 id="license">{{ t("app.licenseHeading") }}</h2>
		<Component>
			<p>{{ t("app.licenseA") }}<Link href="https://github.com/jdan/98.css">98.css</Link>{{ t("app.licenseB") }}<Link href="https://github.com/meorionel">Meorion</Link>{{ t("app.licenseC") }}</p>
		</Component>
	</main>
</template>
