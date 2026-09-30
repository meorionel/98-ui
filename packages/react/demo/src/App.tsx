import { useState, type CSSProperties } from "react";
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
} from "98-pink-react";
import { Example } from "./Example";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { I18nProvider, T, useI18n, type Locale, type MessageKey } from "./i18n";
import { Component, type SectionDef } from "./sections/shared";
import { formControlSections } from "./sections/FormControls";
import { windowSections } from "./sections/Windows";
import { dataDisplaySections } from "./sections/DataDisplay";
import { panelSections } from "./sections/Panels";
import { overlaySections } from "./sections/Overlays";
import { controlSections } from "./sections/Controls";
import { widgetSections } from "./sections/Widgets";
import { displaySections } from "./sections/Display";

/* ------------------------------------------------------------------ theming */

function ThemingSection() {
	const { t } = useI18n();
	const [hue, setHue] = useState(210);

	return (
		<Component>
			<T k="app.themingP1" as="p" />

			<Example
				code={`
					<div style={{
					  "--surface": \`hsl(\${hue} 60% 92%)\`,
					  "--button-surface": \`hsl(\${hue} 55% 82%)\`,
					  "--border-color": \`hsl(\${hue} 70% 25%)\`,
					  "--text-color": \`hsl(\${hue} 70% 25%)\`,
					}}>
					  <Window title="Rethemed at runtime" width={280} controls={["close"]}>
					    <p>Same components, different tokens.</p>
					  </Window>
					</div>
				`}
			>
				<div
					style={
						{
							"--surface": `hsl(${hue} 60% 92%)`,
							"--button-surface": `hsl(${hue} 55% 82%)`,
							"--color-pinkline-100": `hsl(${hue} 55% 82%)`,
							"--border-color": `hsl(${hue} 70% 25%)`,
							"--text-color": `hsl(${hue} 70% 25%)`,
							"--button-shadow": `hsl(${hue} 30% 55%)`,
							"--button-face": `hsl(${hue} 40% 72%)`,
						} as CSSProperties
					}
				>
					<Window title={t("app.themingWindowTitle")} width={280} controls={["close"]}>
						<p>{t("app.themingWindowBody")}</p>
						<FieldRow>
							<Button variant="default">{t("common.ok")}</Button>
							<Button>{t("common.cancel")}</Button>
						</FieldRow>
					</Window>
				</div>

				<div className="row" style={{ marginTop: 12, alignItems: "center" }}>
					<label htmlFor="hue-slider">{t("common.hue")}</label>
					<Slider
						id="hue-slider"
						min={0}
						max={360}
						value={hue}
						onChange={(event) => setHue(Number(event.target.value))}
						style={{ width: 200 }}
					/>
					<span>{hue}</span>
				</div>
			</Example>
		</Component>
	);
}

const themingSections: SectionDef[] = [
	{ id: "theming", titleKey: "nav.theming", level: 3, body: <ThemingSection /> },
];

/* ------------------------------------------------------------------ app */

const ALL_SECTIONS: SectionDef[] = [
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

function Heading({ section }: { section: SectionDef }) {
	const { t } = useI18n();
	const label = t(section.titleKey);
	return section.level === 4 ? (
		<h4 id={section.id}>{label}</h4>
	) : (
		<h3 id={section.id}>{label}</h3>
	);
}

function IntroSection() {
	const { t } = useI18n();
	return (
		<Component>
			<p>
				<strong style={{ color: "purple" }}>✨ 98-pink-react ✨</strong> {t("app.introA")}
				<Link href="https://github.com/meorionel/98-pink.css">98-pink.css</Link>
				{t("app.introB")}
				<Link href="https://jdan.github.io/98.css/">98.css</Link>
				{t("app.introC")}
			</p>

			<h3 id="install">{t("app.installHeading")}</h3>
			<CodeBlock>{`npm install 98-pink-react
# or
bun add 98-pink-react`}</CodeBlock>

			<p>{t("app.installImportHint")}</p>
			<CodeBlock>{`import "98-pink-react/style.css";`}</CodeBlock>

			<p>{t("app.installThen")}</p>
			<Example
				code={`
					import { Window, Button, Checkbox, FieldRow } from "98-pink-react";
					import "98-pink-react/style.css";

					export function App() {
					  return (
					    <Window title="Hello!" width={300} controls={["close"]}>
					      <p>It is 1998 in here.</p>
					      <FieldRow>
					        <Checkbox defaultChecked label="Enable pink mode" />
					      </FieldRow>
					      <FieldRow>
					        <Button variant="default">OK</Button>
					        <Button>Cancel</Button>
					      </FieldRow>
					    </Window>
					  );
					}
				`}
			>
				<Window title={t("app.helloTitle")} width={300} controls={["close"]}>
					<p>{t("app.helloBody")}</p>
					<FieldRow>
						<Checkbox defaultChecked label={t("app.enablePinkMode")} />
					</FieldRow>
					<FieldRow>
						<Button variant="default">{t("common.ok")}</Button>
						<Button>{t("common.cancel")}</Button>
					</FieldRow>
				</Window>
			</Example>

			<p className="note">
				<strong>{t("app.noteLabel")}:</strong> <T k="app.noteBody" />
			</p>
		</Component>
	);
}

function PortingNotes() {
	const { t } = useI18n();
	const items: Array<[MessageKey, MessageKey]> = [
		["app.note1Title", "app.note1Body"],
		["app.note2Title", "app.note2Body"],
		["app.note3Title", "app.note3Body"],
		["app.note4Title", "app.note4Body"],
		["app.note5Title", "app.note5Body"],
		["app.note6Title", "app.note6Body"],
	];

	return (
		<Component>
			<p>{t("app.notesIntro")}</p>
			<ul>
				{items.map(([titleKey, bodyKey]) => (
					<li key={titleKey}>
						<strong>{t(titleKey)}</strong> <T k={bodyKey} />
					</li>
				))}
			</ul>

			<p>{t("app.notesTreeIntro")}</p>
			<SunkenPanel style={{ maxHeight: 160, padding: 8 }}>
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
	);
}

function DemoPage() {
	const { t } = useI18n();
	return (
		<>
			<aside>
				<LocaleSwitcher />
				<TreeView>
					<TreeViewItem>
						<TreeViewLink href="#intro">{t("nav.intro")}</TreeViewLink>
					</TreeViewItem>
					<TreeViewItem>
						<TreeViewLink href="#install">{t("nav.install")}</TreeViewLink>
					</TreeViewItem>
					<TreeViewItem>
						{t("nav.components")}
						<ul>
							{ALL_SECTIONS.map((section) => (
								<li key={section.id}>
									<TreeViewLink href={`#${section.id}`}>
										{t(section.titleKey)}
									</TreeViewLink>
								</li>
							))}
						</ul>
					</TreeViewItem>
					<TreeViewItem>
						{t("nav.notes")}
						<ul>
							<li>
								<TreeViewLink href="#notes">{t("nav.portingNotes")}</TreeViewLink>
							</li>
							<li>
								<TreeViewLink href="#license">{t("nav.license")}</TreeViewLink>
							</li>
						</ul>
					</TreeViewItem>
				</TreeView>
			</aside>

			<main>
				<h1>98-pink-react</h1>
				<T k="app.subtitle" vars={{ count: ALL_SECTIONS.length }} as="p" />

				<h2 id="intro">{t("app.introHeading")}</h2>
				<IntroSection />

				<h2 id="components">{t("app.componentsHeading")}</h2>
				<p className="note">{t("app.codeSamplesNote")}</p>
				{ALL_SECTIONS.map((section) => (
					<div key={section.id}>
						<Heading section={section} />
						{section.body}
					</div>
				))}

				<h2 id="notes">{t("app.portingNotesHeading")}</h2>
				<PortingNotes />

				<h2 id="license">{t("app.licenseHeading")}</h2>
				<Component>
					<p>
						{t("app.licenseA")}
						<Link href="https://github.com/jdan/98.css">98.css</Link>
						{t("app.licenseB")}
						<Link href="https://github.com/meorionel">Meorion</Link>
						{t("app.licenseC")}
					</p>
				</Component>
			</main>
		</>
	);
}

export interface AppProps {
	/** Force a language. Used by the SSR checks to render both locales. */
	locale?: Locale;
}

export function App({ locale }: AppProps = {}) {
	return (
		<I18nProvider locale={locale}>
			<DemoPage />
		</I18nProvider>
	);
}
