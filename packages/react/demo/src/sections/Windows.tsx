import { useState } from "react";
import {
	Button,
	FieldRow,
	MenuBar,
	StatusBar,
	StatusBarField,
	TitleBar,
	Window,
	WindowBody,
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

function TitleBarSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="windows.titleBar.quote" />
				<footer>{t("windows.titleBar.quoteSource")}</footer>
			</blockquote>

			<T k="windows.titleBar.p1" as="p" />

			<Example
				code={`
					<TitleBar text="A Title Bar" controls={["close"]} />
					<TitleBar text="A Title Bar" controls={["minimize", "maximize", "close"]} />
					<TitleBar text="A Maximized Title Bar" controls={["minimize", "restore", "close"]} />
					<TitleBar text="A Helpful Bar" controls={["help", "close"]} />
				`}
			>
				<TitleBar text={t("windows.titleBar.aTitleBar")} controls={["close"]} />
				<br />
				<TitleBar
					text={t("windows.titleBar.aTitleBar")}
					controls={["minimize", "maximize", "close"]}
				/>
				<br />
				<TitleBar
					text={t("windows.titleBar.aMaximizedTitleBar")}
					controls={["minimize", "restore", "close"]}
				/>
				<br />
				<TitleBar text={t("windows.titleBar.aHelpfulBar")} controls={["help", "close"]} />
			</Example>

			<T k="windows.titleBar.p2" as="p" />

			<Example
				code={`
					<TitleBar text="An inactive title bar" controls={["close"]} inactive />
					<TitleBar
					  text="本地化标题栏"
					  controls={["minimize", "maximize", "close"]}
					  labels={{ minimize: "最小化", maximize: "最大化", close: "关闭" }}
					/>
				`}
			>
				<TitleBar
					text={t("windows.titleBar.inactiveTitleBar")}
					controls={["close"]}
					inactive
				/>
				<br />
				<TitleBar
					text="本地化标题栏"
					controls={["minimize", "maximize", "close"]}
					labels={{ minimize: "最小化", maximize: "最大化", close: "关闭" }}
				/>
			</Example>
		</Component>
	);
}

function InteractiveWindowSection() {
	const { t } = useI18n();
	const [open, setOpen] = useState(true);
	const [maximized, setMaximized] = useState(false);
	const [log, setLog] = useState<string[]>([]);

	const handleControl = (action: string) => {
		setLog((entries) => [...entries.slice(-4), action]);
		if (action === "close") setOpen(false);
		if (action === "maximize") setMaximized(true);
		if (action === "restore") setMaximized(false);
	};

	return (
		<Component>
			<T k="windows.interactive.p1" as="p" />

			<Example
				code={`
					const [open, setOpen] = useState(true);
					const [maximized, setMaximized] = useState(false);
					const [log, setLog] = useState([]);

					const handleControl = (action) => {
					  setLog((entries) => [...entries.slice(-4), action]);
					  if (action === "close") setOpen(false);
					  if (action === "maximize") setMaximized(true);
					  if (action === "restore") setMaximized(false);
					};

					{open ? (
					  <Window
					    title="Interactive window"
					    width={maximized ? 520 : 320}
					    controls={["minimize", maximized ? "restore" : "maximize", "close"]}
					    onControl={handleControl}
					    statusBar={
					      <StatusBar>
					        <StatusBarField>{maximized ? "Maximized" : "Restored"}</StatusBarField>
					        <StatusBarField>
					          {log.length > 0 ? log.join(" → ") : "No events yet"}
					        </StatusBarField>
					      </StatusBar>
					    }
					  >
					    <p>Try the buttons in the title bar.</p>
					  </Window>
					) : (
					  <Button onClick={() => setOpen(true)}>Reopen window</Button>
					)}
				`}
			>
				{open ? (
					<Window
						title={t("windows.interactive.windowTitle")}
						width={maximized ? 520 : 320}
						controls={["minimize", maximized ? "restore" : "maximize", "close"]}
						onControl={handleControl}
						statusBar={
							<StatusBar>
								<StatusBarField>
									{maximized
										? t("windows.interactive.maximized")
										: t("windows.interactive.restored")}
								</StatusBarField>
								<StatusBarField>
									{log.length > 0
										? log.join(" → ")
										: t("windows.interactive.noEvents")}
								</StatusBarField>
							</StatusBar>
						}
					>
						<p>{t("windows.interactive.body")}</p>
					</Window>
				) : (
					<Button onClick={() => setOpen(true)}>{t("windows.interactive.reopen")}</Button>
				)}
			</Example>
		</Component>
	);
}

function WindowContentsSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="windows.contents.quote" />
				<footer>{t("windows.contents.quoteSource")}</footer>
			</blockquote>

			<T k="windows.contents.p1" as="p" />

			<Example
				code={`
					<Window
					  title="A Window With Stuff In It"
					  width={320}
					  controls={["minimize", "maximize", "close"]}
					  menuBar={
					    <MenuBar
					      label="Window menu"
					      items={[
					        { label: "File", accessKey: "F" },
					        { label: "Edit", accessKey: "E" },
					        { label: "View", accessKey: "V" },
					        { label: "Go", accessKey: "G" },
					        { label: "Favorites", accessKey: "a" },
					        { label: "Help", accessKey: "H" },
					      ]}
					    />
					  }
					>
					  <p>There's so much room for activities!</p>
					</Window>
				`}
			>
				<Window
					title={t("windows.contents.windowTitle")}
					width={320}
					controls={["minimize", "maximize", "close"]}
					menuBar={
						<MenuBar
							label={t("windows.contents.menuLabel")}
							items={[
								{ label: t("windows.contents.menuFile"), accessKey: "F" },
								{ label: t("windows.contents.menuEdit"), accessKey: "E" },
								{ label: t("windows.contents.menuView"), accessKey: "V" },
								{ label: t("windows.contents.menuGo"), accessKey: "G" },
								{ label: t("windows.contents.menuFavorites"), accessKey: "a" },
								{ label: t("windows.contents.menuHelp"), accessKey: "H" },
							]}
						/>
					}
				>
					<p>{t("windows.contents.roomForActivities")}</p>
				</Window>
			</Example>

			<T k="windows.contents.p2" as="p" />

			<Example
				code={`
					{/* MenuBar supports arrow-key navigation out of the box */}
					<MenuBar
					  items={[
					    { label: "File", accessKey: "F" },
					    { label: "Edit", accessKey: "E" },
					    { label: "View", accessKey: "V" },
					  ]}
					/>
				`}
			>
				<MenuBar
					items={[
						{ label: t("windows.contents.menuFile"), accessKey: "F" },
						{ label: t("windows.contents.menuEdit"), accessKey: "E" },
						{ label: t("windows.contents.menuView"), accessKey: "V" },
					]}
				/>
			</Example>
		</Component>
	);
}

function StatusBarSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="windows.statusBar.quote" />
				<footer>{t("windows.statusBar.quoteSource")}</footer>
			</blockquote>

			<Example
				code={`
					<Window title="A Window With A Status Bar" width={320}>
					  <p>There are just so many possibilities:</p>
					  <ul>
					    <li>A Task Manager</li>
					    <li>A Notepad</li>
					    <li>Or even a File Explorer!</li>
					  </ul>
					  <StatusBar>
					    <StatusBarField>Press F1 for help</StatusBarField>
					    <StatusBarField>Slide 1</StatusBarField>
					    <StatusBarField>CPU Usage: 14%</StatusBarField>
					  </StatusBar>
					</Window>
				`}
			>
				<Window
					title={t("windows.statusBar.windowTitle")}
					width={320}
					statusBar={
						<StatusBar>
							<StatusBarField>{t("windows.statusBar.fieldHelp")}</StatusBarField>
							<StatusBarField>{t("windows.statusBar.fieldSlide")}</StatusBarField>
							<StatusBarField>{t("windows.statusBar.fieldCpu")}</StatusBarField>
						</StatusBar>
					}
				>
					<p>{t("windows.statusBar.intro")}</p>
					<ul>
						<li>{t("windows.statusBar.item1")}</li>
						<li>{t("windows.statusBar.item2")}</li>
						<li>{t("windows.statusBar.item3")}</li>
					</ul>
				</Window>
			</Example>

			<T k="windows.statusBar.p1" as="p" />

			<Example
				code={`
					<div className="window" style={{ width: 260 }}>
					  <TitleBar text="Hand assembled" controls={["close"]} />
					  <WindowBody>Body content</WindowBody>
					</div>
				`}
			>
				<div className="window" style={{ width: 260 }}>
					<TitleBar text={t("windows.statusBar.handAssembled")} controls={["close"]} />
					<WindowBody>
						<FieldRow>{t("windows.statusBar.bodyContent")}</FieldRow>
					</WindowBody>
				</div>
			</Example>
		</Component>
	);
}

export const windowSections: SectionDef[] = [
	{ id: "title-bar", titleKey: "nav.titleBar", level: 4, body: <TitleBarSection /> },
	{
		id: "window-contents",
		titleKey: "nav.windowContents",
		level: 4,
		body: <WindowContentsSection />,
	},
	{
		id: "interactive-window",
		titleKey: "nav.interactiveWindow",
		level: 4,
		body: <InteractiveWindowSection />,
	},
	{ id: "status-bar", titleKey: "nav.statusBar", level: 4, body: <StatusBarSection /> },
];
