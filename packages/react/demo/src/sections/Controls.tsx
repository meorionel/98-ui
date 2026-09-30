import { useState } from "react";
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
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

/** Sample data — deliberately not translated, like the table view's. */
const DRIVERS = [
	{ id: "mysql", name: "MySQL ODBC 3.51 Driver" },
	{ id: "sqlserver", name: "SQL Server" },
	{ id: "oracle", name: "Oracle in OraHome92" },
	{ id: "access", name: "Microsoft Access Driver (*.mdb)" },
];

const PORTS = ["COM1", "COM2", "LPT1", "FILE"].map((port) => ({ value: port, label: port }));

/* ---------------------------------------------------------------- combo box */

function ComboBoxSection() {
	const { t } = useI18n();
	const [driver, setDriver] = useState("sqlserver");
	const [port, setPort] = useState("COM1");

	return (
		<Component>
			<T k="controls.comboBox.p1" as="p" />

			<Example
				code={`
					const [driver, setDriver] = useState("sqlserver");

					<ComboBox
					  label="Driver"
					  width={220}
					  value={driver}
					  onValueChange={setDriver}
					  options={drivers.map((driver) => ({ value: driver.id, label: driver.name }))}
					/>
					<p>Selected value: {driver}</p>
				`}
			>
				<ComboBox
					label={t("controls.comboBox.editable")}
					width={220}
					value={driver}
					onValueChange={setDriver}
					listLabel={t("controls.comboBox.editable")}
					buttonLabel={t("controls.comboBox.showOptions")}
					options={DRIVERS.map((entry) => ({ value: entry.id, label: entry.name }))}
				/>
				<p>{t("controls.comboBox.selected", { value: driver })}</p>
			</Example>

			<T k="controls.comboBox.p2" as="p" />

			<Example
				code={`
					{/* The drop-down list style: read-only box, type-ahead, Enter chooses */}
					<ComboBox
					  selectOnly
					  label="Port"
					  width={140}
					  value={port}
					  onValueChange={setPort}
					  options={["COM1", "COM2", "LPT1"].map((port) => ({ value: port, label: port }))}
					/>
				`}
			>
				<ComboBox
					selectOnly
					label={t("controls.comboBox.port")}
					width={140}
					value={port}
					onValueChange={setPort}
					listLabel={t("controls.comboBox.port")}
					buttonLabel={t("controls.comboBox.showOptions")}
					options={PORTS}
				/>
			</Example>

			<T k="controls.comboBox.p3" as="p" />
		</Component>
	);
}

/* ----------------------------------------------------------------- toolbar */

function ToolbarSection() {
	const { t } = useI18n();
	const [bold, setBold] = useState(true);
	const [alignment, setAlignment] = useState("left");
	const [last, setLast] = useState<string | null>(null);

	const run = (label: string) => () => setLast(label);

	const zoomItems: MenuEntry[] = [
		{ label: t("controls.toolbar.zoom100"), onSelect: run(t("controls.toolbar.zoom100")) },
		{ label: t("controls.toolbar.zoom200"), onSelect: run(t("controls.toolbar.zoom200")) },
	];

	return (
		<Component>
			<T k="controls.toolbar.p1" as="p" />

			<Example
				code={`
					const [bold, setBold] = useState(true);

					<Window title="A window with a toolbar" width={380} controls={["close"]}>
					  <Toolbar label="Standard">
					    <ToolbarButton onClick={newFile}>New</ToolbarButton>
					    <ToolbarButton onClick={openFile}>Open</ToolbarButton>
					    <ToolbarSeparator />
					    <ToolbarButton pressed={bold} onPressedChange={setBold}>Bold</ToolbarButton>
					    <ToolbarButton defaultPressed>Italic</ToolbarButton>
					    <ToolbarSeparator />
					    <DropdownMenu trigger={<ToolbarButton>Zoom</ToolbarButton>} items={zoomItems} />
					    <ToolbarSpacer />
					    <ToolbarButton disabled>Help</ToolbarButton>
					  </Toolbar>
					  <p>Last command: {last}</p>
					</Window>
				`}
			>
				<Window title={t("controls.toolbar.windowTitle")} width={380} controls={["close"]}>
					<Toolbar label={t("controls.toolbar.label")}>
						<ToolbarButton onClick={run(t("controls.toolbar.new"))}>
							{t("controls.toolbar.new")}
						</ToolbarButton>
						<ToolbarButton onClick={run(t("controls.toolbar.open"))}>
							{t("controls.toolbar.open")}
						</ToolbarButton>
						<ToolbarSeparator />
						<ToolbarButton pressed={bold} onPressedChange={setBold}>
							{t("controls.toolbar.bold")}
						</ToolbarButton>
						<ToolbarButton defaultPressed>{t("controls.toolbar.italic")}</ToolbarButton>
						<ToolbarSeparator />
						<DropdownMenu
							trigger={<ToolbarButton>{t("controls.toolbar.zoom")}</ToolbarButton>}
							label={t("controls.toolbar.zoom")}
							items={zoomItems}
						/>
						<ToolbarSpacer />
						<ToolbarButton disabled>{t("controls.toolbar.help")}</ToolbarButton>
					</Toolbar>
					<p>
						{last === null
							? t("controls.toolbar.nothing")
							: t("controls.toolbar.lastCommand", { value: last })}
					</p>
				</Window>
			</Example>

			<T k="controls.toolbar.p2" as="p" />

			<Example
				code={`
					<ToggleGroup label="Alignment" value={alignment} onValueChange={setAlignment}>
					  <ToggleGroupItem value="left">Left</ToggleGroupItem>
					  <ToggleGroupItem value="center">Center</ToggleGroupItem>
					  <ToggleGroupItem value="right">Right</ToggleGroupItem>
					</ToggleGroup>

					<ButtonGroup aria-label="Commands">
					  <Button variant="default">OK</Button>
					  <Button>Cancel</Button>
					</ButtonGroup>
				`}
			>
				<ToggleGroup
					label={t("controls.toolbar.alignment")}
					value={alignment}
					onValueChange={(value) => setAlignment(String(value))}
				>
					<ToggleGroupItem value="left">{t("controls.toolbar.left")}</ToggleGroupItem>
					<ToggleGroupItem value="center">{t("controls.toolbar.center")}</ToggleGroupItem>
					<ToggleGroupItem value="right">{t("controls.toolbar.right")}</ToggleGroupItem>
				</ToggleGroup>
				<br />
				<ButtonGroup aria-label={t("controls.toolbar.label")}>
					<Button variant="default">{t("common.ok")}</Button>
					<Button>{t("common.cancel")}</Button>
				</ButtonGroup>
			</Example>
		</Component>
	);
}

/* ------------------------------------------------------------------- field */

function FieldSection() {
	const { t } = useI18n();
	const [userName, setUserName] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<Component>
			<T k="controls.field.p1" as="p" />

			<Example
				code={`
					const [userName, setUserName] = useState("");
					const [error, setError] = useState(null);

					<Field
					  label="User name"
					  description="Letters, digits and underscores only."
					  required
					  error={error}
					>
					  <TextBox
					    width={200}
					    value={userName}
					    onChange={(event) => {
					      setUserName(event.target.value);
					      setError(event.target.value.trim() === "" ? "A user name is required." : null);
					    }}
					  />
					</Field>
				`}
			>
				<Field
					label={t("controls.field.userName")}
					description={t("controls.field.userHint")}
					required
					error={error ?? undefined}
				>
					<TextBox
						width={200}
						value={userName}
						onChange={(event) => {
							const next = event.target.value;
							setUserName(next);
							setError(next.trim() === "" ? t("controls.field.required") : null);
						}}
					/>
				</Field>
			</Example>

			<T k="controls.field.p2" as="p" />

			<Example
				code={`
					<Field label="Port" error="Choose a port before continuing.">
					  <ComboBox options={ports} width={140} />
					</Field>

					<Field label="Protocol">
					  <Select options={[{ label: "TCP/IP", value: "tcp" }]} />
					</Field>
				`}
			>
				<Field label={t("controls.field.port")} error={t("controls.field.portError")}>
					<ComboBox options={PORTS} width={140} />
				</Field>
				<br />
				<Field label={t("controls.field.protocol")}>
					<Select
						options={[
							{ label: "TCP/IP", value: "tcp" },
							{ label: "Named pipes", value: "pipe" },
						]}
					/>
				</Field>
			</Example>
		</Component>
	);
}

export const controlSections: SectionDef[] = [
	{ id: "combo-box", titleKey: "nav.comboBox", level: 3, body: <ComboBoxSection /> },
	{ id: "toolbar", titleKey: "nav.toolbar", level: 3, body: <ToolbarSection /> },
	{ id: "form-field", titleKey: "nav.formField", level: 3, body: <FieldSection /> },
];
