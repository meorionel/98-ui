import { useState } from "react";
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
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

/* ------------------------------------------------------------------- menus */

function MenusSection() {
	const { t } = useI18n();
	const [last, setLast] = useState<string | null>(null);
	const [statusBar, setStatusBar] = useState(true);
	const [zoom, setZoom] = useState("100");

	const run = (label: string) => () => setLast(label);

	const fileItems: MenuEntry[] = [
		{
			label: t("overlays.menus.new"),
			accessKey: "N",
			shortcut: "Ctrl+N",
			onSelect: run(t("overlays.menus.new")),
		},
		{
			label: t("overlays.menus.open"),
			accessKey: "O",
			shortcut: "Ctrl+O",
			onSelect: run(t("overlays.menus.open")),
		},
		{ type: "separator" },
		{
			type: "submenu",
			label: t("overlays.menus.sendTo"),
			items: [
				{ label: t("overlays.menus.desktop"), onSelect: run(t("overlays.menus.desktop")) },
				{ label: t("overlays.menus.mail"), onSelect: run(t("overlays.menus.mail")) },
			],
		},
		{ type: "separator" },
		{
			label: t("overlays.menus.exit"),
			accessKey: "x",
			onSelect: run(t("overlays.menus.exit")),
		},
	];

	const viewItems: MenuEntry[] = [
		{
			type: "checkbox",
			label: t("overlays.menus.statusBar"),
			checked: statusBar,
			onCheckedChange: setStatusBar,
			keepOpen: true,
		},
		{ type: "separator" },
		{ type: "label", label: t("overlays.menus.zoom") },
		{
			type: "radio",
			label: t("overlays.menus.zoom100"),
			value: "100",
			checked: zoom === "100",
			onCheckedChange: () => setZoom("100"),
		},
		{
			type: "radio",
			label: t("overlays.menus.zoom200"),
			value: "200",
			checked: zoom === "200",
			onCheckedChange: () => setZoom("200"),
		},
	];

	return (
		<Component>
			<blockquote>
				<T k="overlays.menus.quote" />
				<footer>{t("overlays.menus.quoteSource")}</footer>
			</blockquote>

			<T k="overlays.menus.p1" as="p" />

			<Example
				code={`
					<Window
					  title="A window with real menus"
					  controls={["close"]}
					  menuBar={
					    <MenuBar
					      items={[
					        {
					          label: "File",
					          accessKey: "F",
					          items: [
					            { label: "New", accessKey: "N", shortcut: "Ctrl+N", onSelect: newFile },
					            { type: "separator" },
					            {
					              type: "submenu",
					              label: "Send to",
					              items: [{ label: "Desktop" }, { label: "Mail recipient" }],
					            },
					          ],
					        },
					        {
					          label: "View",
					          accessKey: "V",
					          items: [
					            { type: "checkbox", label: "Status bar", checked: statusBar, onCheckedChange: setStatusBar, keepOpen: true },
					            { type: "separator" },
					            { type: "radio", label: "100%", value: "100", checked: zoom === "100" },
					          ],
					        },
					      ]}
					    />
					  }
					>
					  <p>Open File and View.</p>
					</Window>
				`}
			>
				<Window
					title={t("overlays.menus.windowTitle")}
					width={340}
					controls={["close"]}
					menuBar={
						<MenuBar
							label={t("overlays.menus.menuLabel")}
							items={[
								{
									label: t("overlays.menus.file"),
									accessKey: "F",
									items: fileItems,
								},
								{
									label: t("overlays.menus.view"),
									accessKey: "V",
									items: viewItems,
								},
							]}
						/>
					}
					statusBar={
						statusBar ? (
							<StatusBar>
								<StatusBarField>
									{last === null
										? t("overlays.menus.noSelection")
										: `${t("overlays.menus.lastCommand")}: ${last}`}
								</StatusBarField>
								<StatusBarField>{zoom}%</StatusBarField>
							</StatusBar>
						) : undefined
					}
				>
					<p>{t("overlays.menus.body")}</p>
				</Window>
			</Example>

			<T k="overlays.menus.p2" as="p" />

			<Example
				code={`
					<DropdownMenu
					  trigger={<Button>Options</Button>}
					  items={[
					    { type: "checkbox", label: "Status bar", checked: true },
					    { type: "separator" },
					    { type: "submenu", label: "Send to", items: [{ label: "Desktop" }] },
					  ]}
					/>
				`}
			>
				<FieldRow>
					<DropdownMenu
						trigger={<Button>{t("overlays.menus.options")}</Button>}
						label={t("overlays.menus.options")}
						items={viewItems}
					/>
					<DropdownMenu
						trigger={<Button variant="default">{t("overlays.menus.sendTo")}</Button>}
						label={t("overlays.menus.sendTo")}
						items={fileItems}
					/>
				</FieldRow>
			</Example>
		</Component>
	);
}

/* ------------------------------------------------------------ context menu */

function ContextMenuSection() {
	const { t } = useI18n();
	const [last, setLast] = useState<string | null>(null);
	const [wordWrap, setWordWrap] = useState(true);

	const run = (label: string) => () => setLast(label);

	const items: MenuEntry[] = [
		{
			type: "submenu",
			label: t("overlays.contextMenu.new"),
			items: [
				{
					label: t("overlays.contextMenu.folder"),
					onSelect: run(t("overlays.contextMenu.folder")),
				},
				{
					label: t("overlays.contextMenu.shortcut"),
					onSelect: run(t("overlays.contextMenu.shortcut")),
				},
			],
		},
		{ type: "separator" },
		{
			label: t("overlays.contextMenu.rename"),
			accessKey: "R",
			onSelect: run(t("overlays.contextMenu.rename")),
		},
		{
			label: t("overlays.contextMenu.delete"),
			accessKey: "D",
			onSelect: run(t("overlays.contextMenu.delete")),
		},
		{ type: "separator" },
		{
			type: "checkbox",
			label: t("overlays.contextMenu.wordWrap"),
			checked: wordWrap,
			onCheckedChange: setWordWrap,
			keepOpen: true,
		},
		{
			label: t("overlays.contextMenu.properties"),
			accessKey: "P",
			onSelect: run(t("overlays.contextMenu.properties")),
		},
	];

	return (
		<Component>
			<T k="overlays.contextMenu.p1" as="p" />

			<Example
				code={`
					<ContextMenu
					  items={[
					    { label: "Rename", accessKey: "R", onSelect: rename },
					    { label: "Delete", accessKey: "D", onSelect: remove },
					    { type: "separator" },
					    { type: "submenu", label: "New", items: [{ label: "Folder" }, { label: "Shortcut" }] },
					  ]}
					>
					  <SunkenPanel style={{ padding: 16 }}>Right-click this panel</SunkenPanel>
					</ContextMenu>
				`}
			>
				<ContextMenu items={items} label={t("overlays.contextMenu.label")}>
					<SunkenPanel style={{ padding: 16, width: 220, textAlign: "center" }}>
						{t("overlays.contextMenu.area")}
					</SunkenPanel>
				</ContextMenu>
				<p className="note">{t("overlays.contextMenu.hint")}</p>
				<p>
					{last === null
						? t("overlays.contextMenu.none")
						: `${t("overlays.contextMenu.lastCommand")}: ${last}`}
				</p>
			</Example>
		</Component>
	);
}

/* --------------------------------------------------------------- dialogs */

function DialogSection() {
	const { t } = useI18n();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [boxOpen, setBoxOpen] = useState(false);
	const [icon, setIcon] = useState<MessageBoxIcon>("warning");
	const [result, setResult] = useState<string | null>(null);

	return (
		<Component>
			<T k="overlays.dialog.p1" as="p" />

			<Example
				code={`
					<Dialog
					  open={open}
					  onOpenChange={setOpen}
					  title="Delete file"
					  width={320}
					  footer={
					    <>
					      <Button variant="default" onClick={() => setOpen(false)}>OK</Button>
					      <Button onClick={() => setOpen(false)}>Cancel</Button>
					    </>
					  }
					>
					  <p>Are you sure you want to send REPORT.DOC to the Recycle Bin?</p>
					</Dialog>
				`}
			>
				<FieldRow>
					<Button variant="default" onClick={() => setDialogOpen(true)}>
						{t("overlays.dialog.openDialog")}
					</Button>
				</FieldRow>

				<Dialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					title={t("overlays.dialog.title")}
					width={320}
					footer={
						<>
							<Button variant="default" onClick={() => setDialogOpen(false)}>
								{t("common.ok")}
							</Button>
							<Button onClick={() => setDialogOpen(false)}>
								{t("common.cancel")}
							</Button>
						</>
					}
				>
					<p>{t("overlays.dialog.body")}</p>
				</Dialog>
			</Example>

			<T k="overlays.dialog.p2" as="p" />

			<Example
				code={`
					<MessageBox
					  open={open}
					  onOpenChange={setOpen}
					  title="Confirm file delete"
					  icon="warning"
					  buttons={["yes", "no", "cancel"]}
					  defaultButton="no"
					  onResult={(result) => console.log(result)}
					>
					  Deleting a file moves it to the Recycle Bin. Continue?
					</MessageBox>
				`}
			>
				<FieldRow>
					<Select
						label={t("overlays.dialog.icon")}
						value={icon}
						onChange={(event) => setIcon(event.target.value as MessageBoxIcon)}
						options={[
							{ label: t("overlays.dialog.iconInfo"), value: "info" },
							{ label: t("overlays.dialog.iconWarning"), value: "warning" },
							{ label: t("overlays.dialog.iconError"), value: "error" },
							{ label: t("overlays.dialog.iconQuestion"), value: "question" },
						]}
					/>
					<Button variant="default" onClick={() => setBoxOpen(true)}>
						{t("overlays.dialog.openMessageBox")}
					</Button>
				</FieldRow>

				<MessageBox
					open={boxOpen}
					onOpenChange={setBoxOpen}
					title={t("overlays.dialog.boxTitle")}
					icon={icon}
					buttons={["yes", "no", "cancel"]}
					defaultButton="no"
					buttonLabels={{
						yes: t("common.yes"),
						no: t("common.no"),
						cancel: t("common.cancel"),
					}}
					onResult={(value) => setResult(value)}
				>
					{t("overlays.dialog.boxBody")}
				</MessageBox>

				<p className="note">
					{t("overlays.dialog.result")}: {result ?? t("overlays.dialog.none")}
				</p>
			</Example>
		</Component>
	);
}

/* -------------------------------------------------------- tooltip, popover */

function TooltipPopoverSection() {
	const { t } = useI18n();

	return (
		<Component>
			<T k="overlays.tooltipPopover.p1" as="p" />

			<Example
				code={`
					<Tooltip content="Sends the file to the Recycle Bin">
					  <Button>Hover me</Button>
					</Tooltip>

					{/* Any side, and it flips automatically when there is no room */}
					<Tooltip content="Tooltips can sit on any side" side="right">
					  <Button>Hover me too</Button>
					</Tooltip>
				`}
			>
				<FieldRow>
					<Tooltip content={t("overlays.tooltipPopover.tooltipText")}>
						<Button>{t("overlays.tooltipPopover.hoverMe")}</Button>
					</Tooltip>
					<Tooltip content={t("overlays.tooltipPopover.tooltipText")} side="right">
						<Button>{t("overlays.tooltipPopover.hoverMeRight")}</Button>
					</Tooltip>
				</FieldRow>
			</Example>

			<T k="overlays.tooltipPopover.p2" as="p" />

			<Example
				code={`
					<Popover trigger={<Button>Details</Button>} label="File details">
					  <FieldRow>
					    <Checkbox defaultChecked label="Read-only" />
					  </FieldRow>
					  <FieldRow>
					    <TextBox label="Name" defaultValue="AUTOEXEC.BAT" />
					  </FieldRow>
					  <FieldRow>
					    <Button variant="default">Apply</Button>
					  </FieldRow>
					</Popover>
				`}
			>
				<Popover
					trigger={<Button>{t("overlays.tooltipPopover.details")}</Button>}
					label={t("overlays.tooltipPopover.popoverLabel")}
				>
					<FieldRow>
						<Checkbox defaultChecked label={t("overlays.tooltipPopover.readOnly")} />
					</FieldRow>
					<FieldRow>
						<Checkbox label={t("overlays.tooltipPopover.hidden")} />
					</FieldRow>
					<FieldRow>
						<TextBox
							label={t("overlays.tooltipPopover.name")}
							defaultValue="AUTOEXEC.BAT"
							width={130}
						/>
					</FieldRow>
					<FieldRow>
						<Button variant="default">{t("overlays.tooltipPopover.apply")}</Button>
					</FieldRow>
				</Popover>
			</Example>
		</Component>
	);
}

export const overlaySections: SectionDef[] = [
	{ id: "menus", titleKey: "nav.menus", level: 3, body: <MenusSection /> },
	{ id: "context-menu", titleKey: "nav.contextMenu", level: 3, body: <ContextMenuSection /> },
	{ id: "dialog", titleKey: "nav.dialog", level: 3, body: <DialogSection /> },
	{
		id: "tooltip-popover",
		titleKey: "nav.tooltipPopover",
		level: 3,
		body: <TooltipPopoverSection />,
	},
];
