import { useRef, useState } from "react";
import {
	BalloonTip,
	Button,
	Calendar,
	Checkbox,
	DatePicker,
	Field,
	FieldRow,
	Kbd,
	PropertySheet,
	RadioGroup,
	Select,
	Separator,
	SpinBox,
	SplitPane,
	SunkenPanel,
	Wizard,
	type CalendarLabels,
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

/* --------------------------------------------------- separator and keycaps */

function SeparatorSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="widgets.separator.p1" as="p" />

			<Example
				code={`
					<FieldRow>
					  <span>Left block</span>
					  <Separator orientation="vertical" />
					  <span>Right block</span>
					</FieldRow>

					<Separator />

					<p>Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save, or <Kbd>Escape</Kbd> to cancel.</p>
				`}
			>
				<FieldRow>
					<span>{t("widgets.separator.left")}</span>
					<Separator orientation="vertical" />
					<span>{t("widgets.separator.right")}</span>
				</FieldRow>
				<Separator />
				<T k="widgets.separator.shortcut" as="p" />
				<FieldRow>
					<Kbd>Ctrl</Kbd>
					<span>+</span>
					<Kbd>S</Kbd>
					<Separator orientation="vertical" />
					<Kbd>Escape</Kbd>
				</FieldRow>
			</Example>
		</Component>
	);
}

/* ---------------------------------------------------------------- spin box */

function SpinBoxSection() {
	const { t } = useI18n();
	const [size, setSize] = useState(11);

	return (
		<Component>
			<T k="widgets.spinBox.p1" as="p" />

			<Example
				code={`
					<SpinBox label="Font size" min={8} max={72} defaultValue={11} width={90} />
					<SpinBox label="Quantity" min={1} max={99} step={5} defaultValue={10} width={90} />

					<Field label="Controlled value" description="Arrows step by one, PageUp/PageDown by ten.">
					  <SpinBox value={size} onValueChange={setSize} min={8} max={72} width={90} />
					</Field>
				`}
			>
				<SpinBox
					label={t("widgets.spinBox.fontSize")}
					min={8}
					max={72}
					defaultValue={11}
					width={90}
					labels={{ up: t("common.increase"), down: t("common.decrease") }}
				/>
				<br />
				<SpinBox
					label={t("widgets.spinBox.quantity")}
					min={1}
					max={99}
					step={5}
					defaultValue={10}
					width={90}
					labels={{ up: t("common.increase"), down: t("common.decrease") }}
				/>
				<br />
				<Field
					label={t("widgets.spinBox.controlled")}
					description={t("widgets.spinBox.hint")}
				>
					<SpinBox
						value={size}
						onValueChange={setSize}
						min={8}
						max={72}
						width={90}
						labels={{ up: t("common.increase"), down: t("common.decrease") }}
					/>
				</Field>
				<p>{t("widgets.spinBox.value", { value: size })}</p>
			</Example>
		</Component>
	);
}

/* ------------------------------------------------------------- date picker */

function DatePickerSection() {
	const { t } = useI18n();
	const [date, setDate] = useState("1998-06-25");

	const labels: Partial<CalendarLabels> = {
		previousMonth: t("widgets.datePicker.previousMonth"),
		nextMonth: t("widgets.datePicker.nextMonth"),
		weekdays: t("widgets.datePicker.weekdays").split(" "),
		monthHeading: (year, month) =>
			t("widgets.datePicker.monthHeading", { year, month: month + 1 }),
		dayLabel: (iso) => t("widgets.datePicker.dayLabel", { date: iso }),
	};

	return (
		<Component>
			<T k="widgets.datePicker.p1" as="p" />

			<Example
				code={`
					const [date, setDate] = useState("1998-06-25");

					<DatePicker
					  label="Installed on"
					  width={150}
					  value={date}
					  onValueChange={setDate}
					  min="1995-08-24"
					  max="1999-12-31"
					  labels={{ previousMonth: "Previous month", nextMonth: "Next month" }}
					/>
					<p>Selected date: {date}</p>
				`}
			>
				<DatePicker
					label={t("widgets.datePicker.installedOn")}
					width={150}
					value={date}
					onValueChange={setDate}
					min="1995-08-24"
					max="1999-12-31"
					labels={labels}
					buttonLabel={t("widgets.datePicker.installedOn")}
				/>
				<p>{t("widgets.datePicker.selected", { value: date })}</p>
			</Example>

			<T k="widgets.datePicker.p2" as="p" />

			<Example
				code={`
					<Calendar
					  defaultValue="1998-06-25"
					  weekStartsOn={1}
					  min="1998-06-01"
					  max="1998-06-30"
					  onValueChange={setDate}
					/>
				`}
			>
				<Calendar
					defaultValue={date}
					weekStartsOn={1}
					min="1998-06-01"
					max="1998-06-30"
					onValueChange={setDate}
					labels={labels}
				/>
			</Example>
		</Component>
	);
}

/* -------------------------------------------------------------- split pane */

function SplitPaneSection() {
	const { t } = useI18n();
	return (
		<Component>
			<T k="widgets.splitPane.p1" as="p" />

			<Example
				code={`
					<SplitPane
					  defaultSize={140}
					  min={80}
					  label="Resize the panes"
					  style={{ height: 160, width: 420 }}
					  first={<SunkenPanel style={{ height: "100%", padding: 8 }}>Drag the divider</SunkenPanel>}
					  second={<SunkenPanel style={{ height: "100%", padding: 8 }}>The rest of the space</SunkenPanel>}
					/>
				`}
			>
				<SplitPane
					defaultSize={140}
					min={80}
					label={t("widgets.splitPane.divider")}
					style={{ height: 160, width: 420 }}
					first={
						<SunkenPanel style={{ height: "100%", padding: 8 }}>
							{t("widgets.splitPane.left")}
						</SunkenPanel>
					}
					second={
						<SunkenPanel style={{ height: "100%", padding: 8 }}>
							{t("widgets.splitPane.right")}
						</SunkenPanel>
					}
				/>
				<p className="note">{t("widgets.splitPane.hint")}</p>
			</Example>
		</Component>
	);
}

/* ------------------------------------------------------------- balloon tip */

function BalloonTipSection() {
	const { t } = useI18n();
	const anchorRef = useRef<HTMLButtonElement | null>(null);
	const [anchored, setAnchored] = useState(false);
	const [docked, setDocked] = useState(false);

	return (
		<Component>
			<T k="widgets.balloonTip.p1" as="p" />

			<Example
				code={`
					const anchor = useRef(null);
					const [open, setOpen] = useState(false);

					<Button ref={anchor} onClick={() => setOpen(true)}>Point at this button</Button>
					<BalloonTip
					  open={open}
					  onOpenChange={setOpen}
					  anchorRef={anchor}
					  side="top"
					  icon="info"
					  title="New hardware found"
					  closable
					>
					  Windows is installing the driver for your new device.
					</BalloonTip>
				`}
			>
				<FieldRow>
					<Button ref={anchorRef} onClick={() => setAnchored(true)}>
						{t("widgets.balloonTip.showAnchored")}
					</Button>
					<Button onClick={() => setDocked(true)}>
						{t("widgets.balloonTip.showDocked")}
					</Button>
				</FieldRow>

				<BalloonTip
					open={anchored}
					onOpenChange={setAnchored}
					anchorRef={anchorRef}
					side="top"
					icon="info"
					title={t("widgets.balloonTip.anchoredTitle")}
					autoDismiss={8000}
					closable
					closeLabel={t("common.close")}
				>
					{t("widgets.balloonTip.anchoredBody")}
				</BalloonTip>

				<BalloonTip
					open={docked}
					onOpenChange={setDocked}
					corner="bottom-right"
					icon="warning"
					title={t("widgets.balloonTip.dockedTitle")}
					autoDismiss={8000}
					closable
					closeLabel={t("common.close")}
				>
					{t("widgets.balloonTip.dockedBody")}
				</BalloonTip>
			</Example>
		</Component>
	);
}

/* ----------------------------------------------------------- property sheet */

function PropertySheetSection() {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);

	return (
		<Component>
			<T k="widgets.propertySheet.p1" as="p" />

			<Example
				code={`
					<PropertySheet
					  open={open}
					  onOpenChange={setOpen}
					  title="Display Properties"
					  onApply={apply}
					  tabs={[
					    { value: "background", label: "Background", content: <BackgroundPage /> },
					    { value: "settings", label: "Settings", content: <SettingsPage /> },
					  ]}
					/>
				`}
			>
				<Button variant="default" onClick={() => setOpen(true)}>
					{t("widgets.propertySheet.open")}
				</Button>

				<PropertySheet
					open={open}
					onOpenChange={setOpen}
					title={t("widgets.propertySheet.title")}
					label={t("widgets.propertySheet.title")}
					okLabel={t("common.ok")}
					cancelLabel={t("common.cancel")}
					applyLabel={t("common.apply")}
					onApply={() => undefined}
					tabs={[
						{
							value: "background",
							label: t("widgets.propertySheet.background"),
							content: (
								<>
									<p>{t("widgets.propertySheet.pageBackground")}</p>
									<FieldRow>
										<Select
											label={t("widgets.propertySheet.wallpaper")}
											defaultValue="clouds"
											options={[
												{ label: "(None)", value: "none" },
												{ label: "Clouds", value: "clouds" },
												{ label: "Straw Mat", value: "straw" },
											]}
										/>
									</FieldRow>
								</>
							),
						},
						{
							value: "settings",
							label: t("widgets.propertySheet.settings"),
							content: (
								<>
									<p>{t("widgets.propertySheet.pageSettings")}</p>
									<FieldRow>
										<Select
											label={t("widgets.propertySheet.colours")}
											defaultValue="pink"
											options={[
												{ label: "Pink Line", value: "pink" },
												{ label: "Windows Standard", value: "win" },
											]}
										/>
									</FieldRow>
									<FieldRow>
										<Checkbox
											defaultChecked
											label="Show window contents while dragging"
										/>
									</FieldRow>
								</>
							),
						},
					]}
				/>
			</Example>
		</Component>
	);
}

/* ----------------------------------------------------------------- wizard */

function WizardSection() {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const [device, setDevice] = useState("modem");
	const [done, setDone] = useState(false);

	return (
		<Component>
			<T k="widgets.wizard.p1" as="p" />

			<Example
				code={`
					<Wizard
					  open={open}
					  onOpenChange={setOpen}
					  title="Add Hardware Wizard"
					  onFinish={() => setDone(true)}
					  steps={[
					    { key: "welcome", title: "Welcome", content: <p>This wizard helps you install a device.</p> },
					    { key: "device", title: "Device", content: <DevicePicker /> },
					    { key: "confirm", title: "Finish", content: <p>Setup will now install the device.</p> },
					  ]}
					/>
				`}
			>
				<Button variant="default" onClick={() => setOpen(true)}>
					{t("widgets.wizard.open")}
				</Button>
				{done && (
					<p className="note">
						{t("widgets.wizard.done", {
							device:
								device === "modem"
									? t("widgets.wizard.deviceModem")
									: t("widgets.wizard.devicePrinter"),
						})}
					</p>
				)}

				<Wizard
					open={open}
					onOpenChange={setOpen}
					title={t("widgets.wizard.title")}
					label={t("widgets.wizard.title")}
					onFinish={() => setDone(true)}
					labels={{
						back: t("common.back"),
						next: t("common.next"),
						finish: t("common.finish"),
						cancel: t("common.cancel"),
						stepOf: (step, count) => t("common.stepOf", { step, count }),
					}}
					steps={[
						{
							key: "welcome",
							title: t("widgets.wizard.welcome"),
							content: <p>{t("widgets.wizard.welcomeBody")}</p>,
						},
						{
							key: "device",
							title: t("widgets.wizard.device"),
							content: (
								<>
									<p>{t("widgets.wizard.deviceBody")}</p>
									<RadioGroup
										name="wizard-device"
										value={device}
										onChange={setDevice}
										options={[
											{
												value: "modem",
												label: t("widgets.wizard.deviceModem"),
											},
											{
												value: "printer",
												label: t("widgets.wizard.devicePrinter"),
											},
										]}
									/>
								</>
							),
						},
						{
							key: "confirm",
							title: t("widgets.wizard.confirm"),
							content: (
								<p>
									{t("widgets.wizard.confirmBody", {
										device:
											device === "modem"
												? t("widgets.wizard.deviceModem")
												: t("widgets.wizard.devicePrinter"),
									})}
								</p>
							),
						},
					]}
				/>
			</Example>
		</Component>
	);
}

export const widgetSections: SectionDef[] = [
	{ id: "separator", titleKey: "nav.separator", level: 3, body: <SeparatorSection /> },
	{ id: "spin-box", titleKey: "nav.spinBox", level: 3, body: <SpinBoxSection /> },
	{ id: "date-picker", titleKey: "nav.datePicker", level: 3, body: <DatePickerSection /> },
	{ id: "split-pane", titleKey: "nav.splitPane", level: 3, body: <SplitPaneSection /> },
	{ id: "balloon-tip", titleKey: "nav.balloonTip", level: 3, body: <BalloonTipSection /> },
	{
		id: "property-sheet",
		titleKey: "nav.propertySheet",
		level: 3,
		body: <PropertySheetSection />,
	},
	{ id: "wizard", titleKey: "nav.wizard", level: 3, body: <WizardSection /> },
];
