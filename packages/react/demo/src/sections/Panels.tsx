import {
	CodeBlock,
	FieldBorder,
	FieldBorderDisabled,
	FieldRow,
	StatusFieldBorder,
	SunkenPanel,
	VerticalBar,
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

function FieldBordersSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="panels.fieldBorders.quote" />
				<footer>{t("panels.fieldBorders.quoteSource")}</footer>
			</blockquote>

			<T k="panels.fieldBorders.p1" as="p" />

			<Example
				code={`
					<FieldBorder style={{ padding: 8 }}>Work area</FieldBorder>
					<FieldBorderDisabled style={{ padding: 8 }}>Disabled work area</FieldBorderDisabled>
					<StatusFieldBorder style={{ padding: 8 }}>Dynamic content</StatusFieldBorder>
				`}
			>
				<FieldBorder style={{ padding: 8 }}>
					{t("panels.fieldBorders.workArea")}
				</FieldBorder>
				<FieldBorderDisabled style={{ padding: 8 }}>
					{t("panels.fieldBorders.disabledWorkArea")}
				</FieldBorderDisabled>
				<StatusFieldBorder style={{ padding: 8 }}>
					{t("panels.fieldBorders.dynamicContent")}
				</StatusFieldBorder>
			</Example>
		</Component>
	);
}

function SunkenPanelSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="panels.sunkenPanel.p1" as="p" />

			<Example
				code={`
					<SunkenPanel style={{ height: 90, width: 320, padding: 8 }}>
					  The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the
					  lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps
					  over the lazy dog. The quick brown fox jumps over the lazy dog.
					</SunkenPanel>
				`}
			>
				<SunkenPanel style={{ height: 90, width: 320, padding: 8 }}>
					{t("panels.sunkenPanel.sample")}
				</SunkenPanel>
			</Example>
		</Component>
	);
}

function MiscSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="panels.misc.p1" as="p" />

			<Example
				code={`
					<FieldRow>
					  <span>Toolbar item</span>
					  <VerticalBar />
					  <span>Another item</span>
					</FieldRow>

					<p>
					  Read the <Link href="https://github.com/jdan/98.css">original project</Link>, or the
					  pink fork on <Link href="https://github.com/meorionel/98-pink.css">GitHub</Link>.
					</p>

					<CodeBlock>{"const flavour = 'pink';"}</CodeBlock>
				`}
			>
				<FieldRow>
					<span>{t("panels.misc.toolbarItem")}</span>
					<VerticalBar />
					<span>{t("panels.misc.anotherItem")}</span>
				</FieldRow>

				<T k="panels.misc.links" as="p" />

				<CodeBlock>{`const flavour = "pink";`}</CodeBlock>
			</Example>
		</Component>
	);
}

export const panelSections: SectionDef[] = [
	{ id: "field-borders", titleKey: "nav.fieldBorders", level: 3, body: <FieldBordersSection /> },
	{ id: "sunken-panel", titleKey: "nav.sunkenPanel", level: 3, body: <SunkenPanelSection /> },
	{ id: "misc", titleKey: "nav.misc", level: 3, body: <MiscSection /> },
];
