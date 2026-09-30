<script lang="ts">
import type { SectionMeta } from "./shared";

/** Docs metadata — ids, heading keys and levels copied verbatim from the React file. */
export const panelSections: SectionMeta[] = [
	{ id: "field-borders", titleKey: "nav.fieldBorders", level: 3 },
	{ id: "sunken-panel", titleKey: "nav.sunkenPanel", level: 3 },
	{ id: "misc", titleKey: "nav.misc", level: 3 },
];
</script>

<script setup lang="ts">
import {
	CodeBlock,
	FieldBorder,
	FieldBorderDisabled,
	FieldRow,
	StatusFieldBorder,
	SunkenPanel,
	VerticalBar,
} from "98-pink-vue";
import Example from "../Example.vue";
import { T, useI18n } from "../i18n";
import Section from "./Section.vue";

defineOptions({ name: "Panels" });

const { t } = useI18n();

/* ------------------------------------------------------------------ samples */

const fieldBordersCode = `
	<FieldBorder :style="{ padding: '8px' }">Work area</FieldBorder>
	<FieldBorderDisabled :style="{ padding: '8px' }">Disabled work area</FieldBorderDisabled>
	<StatusFieldBorder :style="{ padding: '8px' }">Dynamic content</StatusFieldBorder>
`;

const sunkenPanelCode = `
	<SunkenPanel :style="{ height: '90px', width: '320px', padding: '8px' }">
	  The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the
	  lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps
	  over the lazy dog. The quick brown fox jumps over the lazy dog.
	</SunkenPanel>
`;

const miscCode = `
	<FieldRow>
	  <span>Toolbar item</span>
	  <VerticalBar />
	  <span>Another item</span>
	</FieldRow>

	<p>
	  Read the <Link href="https://github.com/jdan/98.css">original project</Link>, or the
	  pink fork on <Link href="https://github.com/meorionel/98-pink.css">GitHub</Link>.
	</p>

	<CodeBlock>const flavour = "pink";</CodeBlock>
`;
</script>

<template>
	<Section id="field-borders" title-key="nav.fieldBorders">
		<blockquote>
			<T k="panels.fieldBorders.quote" />
			<footer>{{ t("panels.fieldBorders.quoteSource") }}</footer>
		</blockquote>

		<T k="panels.fieldBorders.p1" as="p" />

		<Example :code="fieldBordersCode">
			<FieldBorder :style="{ padding: '8px' }">
				{{ t("panels.fieldBorders.workArea") }}
			</FieldBorder>
			<FieldBorderDisabled :style="{ padding: '8px' }">
				{{ t("panels.fieldBorders.disabledWorkArea") }}
			</FieldBorderDisabled>
			<StatusFieldBorder :style="{ padding: '8px' }">
				{{ t("panels.fieldBorders.dynamicContent") }}
			</StatusFieldBorder>
		</Example>
	</Section>

	<Section id="sunken-panel" title-key="nav.sunkenPanel">
		<T k="panels.sunkenPanel.p1" as="p" />

		<Example :code="sunkenPanelCode">
			<SunkenPanel :style="{ height: '90px', width: '320px', padding: '8px' }">
				{{ t("panels.sunkenPanel.sample") }}
			</SunkenPanel>
		</Example>
	</Section>

	<Section id="misc" title-key="nav.misc">
		<T k="panels.misc.p1" as="p" />

		<Example :code="miscCode">
			<FieldRow>
				<span>{{ t("panels.misc.toolbarItem") }}</span>
				<VerticalBar />
				<span>{{ t("panels.misc.anotherItem") }}</span>
			</FieldRow>

			<T k="panels.misc.links" as="p" />

			<CodeBlock>const flavour = "pink";</CodeBlock>
		</Example>
	</Section>
</template>
