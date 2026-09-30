import { useState } from "react";
import {
	Button,
	Checkbox,
	FieldLabel,
	FieldRow,
	GroupBox,
	Radio,
	RadioGroup,
	Select,
	Slider,
	TextArea,
	TextBox,
} from "98-pink-react";
import { Example } from "../Example";
import { T, useI18n } from "../i18n";
import { Component, type SectionDef } from "./shared";

function ButtonSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="forms.button.quote" />
				<footer>{t("forms.button.quoteSource")}</footer>
			</blockquote>

			<T k="forms.button.p1" as="p" />

			<Example
				code={`
					<Button>Click me</Button>
					<Button variant="default">OK</Button>
					<Button disabled>I cannot be clicked</Button>
				`}
			>
				<Button>{t("forms.button.clickMe")}</Button>{" "}
				<Button variant="default">{t("common.ok")}</Button>{" "}
				<Button disabled>{t("forms.button.cannotBeClicked")}</Button>
			</Example>

			<p>
				<T k="forms.button.p2a" /> <kbd>{t("forms.button.enterKey")}</kbd>{" "}
				<T k="forms.button.p2b" />
			</p>

			<T k="forms.button.p3" as="p" />

			<Example
				code={`
					<Button active>I am being pressed</Button>
					<Button focused>I am focused</Button>
					<Button variant="default" active>Default, pressed</Button>
				`}
			>
				<Button active>{t("forms.button.pressedState")}</Button>{" "}
				<Button focused>{t("forms.button.focusedState")}</Button>{" "}
				<Button variant="default" active>
					{t("forms.button.defaultPressed")}
				</Button>
			</Example>
		</Component>
	);
}

function CheckboxSection() {
	const [checked, setChecked] = useState({ first: true, second: false });
	const { t } = useI18n();

	return (
		<Component>
			<blockquote>
				<T k="forms.checkbox.quote" />
				<footer>{t("forms.checkbox.quoteSource")}</footer>
			</blockquote>

			<T k="forms.checkbox.p1" as="p" />

			<Example
				code={`
					<Checkbox label="This is a checkbox" />
					<Checkbox defaultChecked label="I am checked" />
					<Checkbox disabled label="I am inactive" />
					<Checkbox disabled defaultChecked label="Inactive but still checked" />
				`}
			>
				<Checkbox label={t("forms.checkbox.thisIsACheckbox")} />
				<Checkbox defaultChecked label={t("forms.checkbox.checkedLabel")} />
				<Checkbox disabled label={t("forms.checkbox.inactiveLabel")} />
				<Checkbox
					disabled
					defaultChecked
					label={t("forms.checkbox.inactiveCheckedLabel")}
				/>
			</Example>

			<T k="forms.checkbox.p2" as="p" />

			<Example
				code={`
					const [checked, setChecked] = useState({ first: true, second: false });

					<Checkbox
					  checked={checked.first}
					  onChange={(e) => setChecked((s) => ({ ...s, first: e.target.checked }))}
					  label="First option"
					/>
					<Checkbox
					  checked={checked.second}
					  onChange={(e) => setChecked((s) => ({ ...s, second: e.target.checked }))}
					  label="Second option"
					/>
				`}
			>
				<Checkbox
					checked={checked.first}
					onChange={(event) =>
						setChecked((state) => ({ ...state, first: event.target.checked }))
					}
					label={t("forms.checkbox.firstOption")}
				/>
				<Checkbox
					checked={checked.second}
					onChange={(event) =>
						setChecked((state) => ({ ...state, second: event.target.checked }))
					}
					label={t("forms.checkbox.secondOption")}
				/>
			</Example>
		</Component>
	);
}

function OptionButtonSection() {
	const [flavour, setFlavour] = useState("smooth");
	const { t } = useI18n();

	return (
		<Component>
			<blockquote>
				<T k="forms.optionButton.quote" />
				<footer>{t("forms.optionButton.quoteSource")}</footer>
			</blockquote>

			<T k="forms.optionButton.p1" as="p" />

			<Example
				code={`
					<RadioGroup
					  name="first-example"
					  defaultValue="yes"
					  options={[
					    { label: "Yes", value: "yes" },
					    { label: "No", value: "no" },
					  ]}
					/>
				`}
			>
				<RadioGroup
					name="first-example"
					defaultValue="yes"
					options={[
						{ label: t("forms.optionButton.yes"), value: "yes" },
						{ label: t("forms.optionButton.no"), value: "no" },
					]}
				/>
			</Example>

			<T k="forms.optionButton.p2" as="p" />

			<Example
				code={`
					const [flavour, setFlavour] = useState("smooth");

					<RadioGroup
					  value={flavour}
					  onChange={setFlavour}
					  options={[
					    { label: "Peanut butter should be smooth", value: "smooth" },
					    { label: "I understand why people like crunchy", value: "understand" },
					    { label: "Crunchy peanut butter is good", value: "crunchy", disabled: true },
					  ]}
					/>
					<p>Selected: {flavour}</p>
				`}
			>
				<RadioGroup
					value={flavour}
					onChange={setFlavour}
					options={[
						{ label: t("forms.optionButton.smoothOption"), value: "smooth" },
						{ label: t("forms.optionButton.understandOption"), value: "understand" },
						{
							label: t("forms.optionButton.crunchyOption"),
							value: "crunchy",
							disabled: true,
						},
					]}
				/>
				<FieldRow>
					<span>{t("forms.optionButton.selected", { value: flavour })}</span>
				</FieldRow>
			</Example>

			<T k="forms.optionButton.p3" as="p" />

			<Example
				code={`
					<Radio name="low-level" defaultChecked label="Checked by default" />
					<Radio name="low-level" label="Unchecked" />
				`}
			>
				<Radio
					name="low-level"
					defaultChecked
					label={t("forms.optionButton.checkedByDefault")}
				/>
				<Radio name="low-level" label={t("forms.optionButton.unchecked")} />
			</Example>
		</Component>
	);
}

function GroupBoxSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="forms.groupBox.quote" />
				<footer>{t("forms.groupBox.quoteSource")}</footer>
			</blockquote>

			<T k="forms.groupBox.p1" as="p" />

			<Example
				code={`
					<GroupBox>
					  <FieldLabel>Select one:</FieldLabel>
					  <Radio name="fieldset-example" label="Diners" />
					  <Radio name="fieldset-example" label="Drive-Ins" />
					  <Radio name="fieldset-example" label="Dives" />
					</GroupBox>
				`}
			>
				<GroupBox>
					<FieldLabel>{t("forms.groupBox.selectOne")}</FieldLabel>
					<Radio name="fieldset-example" label={t("forms.groupBox.diners")} />
					<Radio name="fieldset-example" label={t("forms.groupBox.driveIns")} />
					<Radio name="fieldset-example" label={t("forms.groupBox.dives")} />
				</GroupBox>
			</Example>

			<Example
				code={`
					<GroupBox legend="Today's mood">
					  <Radio name="fieldset-example2" defaultChecked label="Claire Saffitz" />
					  <Radio name="fieldset-example2" label="Brad Leone" />
					  <Radio name="fieldset-example2" label="Chris Morocco" />
					  <Radio name="fieldset-example2" label="Carla Lalli Music" />
					</GroupBox>
				`}
			>
				<GroupBox legend={t("forms.groupBox.todayMood")}>
					<Radio
						name="fieldset-example2"
						defaultChecked
						label={t("forms.groupBox.claireSaffitz")}
					/>
					<Radio name="fieldset-example2" label={t("forms.groupBox.bradLeone")} />
					<Radio name="fieldset-example2" label={t("forms.groupBox.chrisMorocco")} />
					<Radio name="fieldset-example2" label={t("forms.groupBox.carlaLalliMusic")} />
				</GroupBox>
			</Example>
		</Component>
	);
}

function TextBoxSection() {
	const { t } = useI18n();
	return (
		<Component>
			<blockquote>
				<T k="forms.textBox.quote" />
				<footer>{t("forms.textBox.quoteSource")}</footer>
			</blockquote>

			<Example
				code={`
					<TextBox label="Occupation" />
					<TextBox label="Favorite color" disabled defaultValue="Windows Green" />
				`}
			>
				<TextBox label={t("forms.textBox.occupation")} />
				<TextBox
					label={t("forms.textBox.favoriteColor")}
					disabled
					defaultValue="Windows Green"
				/>
			</Example>

			<T k="forms.textBox.p1" as="p" />

			<Example
				code={`
					<TextBox layout="stacked" width={200} label="Address (Line 1)" />
					<TextBox layout="stacked" width={200} label="Address (Line 2)" />
					<TextArea layout="stacked" width={200} rows={5} label="Additional notes" />
				`}
			>
				<TextBox layout="stacked" width={200} label={t("forms.textBox.addressLine1")} />
				<TextBox layout="stacked" width={200} label={t("forms.textBox.addressLine2")} />
				<TextArea
					layout="stacked"
					width={200}
					rows={5}
					label={t("forms.textBox.additionalNotes")}
				/>
			</Example>
		</Component>
	);
}

function SliderSection() {
	const [volume, setVolume] = useState(5);
	const [cowbell, setCowbell] = useState(2);
	const { t } = useI18n();

	return (
		<Component>
			<blockquote>
				<T k="forms.slider.quote" />
				<footer>{t("forms.slider.quoteSource")}</footer>
			</blockquote>

			<Example
				code={`
					const [volume, setVolume] = useState(5);

					<div className="field-row" style={{ width: 300 }}>
					  <label htmlFor="volume">Volume: {volume}</label>
					  <label htmlFor="volume">Low</label>
					  <input
					    id="volume"
					    type="range"
					    min={1}
					    max={11}
					    value={volume}
					    onChange={(e) => setVolume(Number(e.target.value))}
					  />
					  <label htmlFor="volume">High</label>
					</div>
				`}
			>
				<Slider
					label={t("forms.slider.volumeLabel", { value: volume })}
					lowLabel={t("forms.slider.low")}
					highLabel={t("forms.slider.high")}
					min={1}
					max={11}
					value={volume}
					onChange={(event) => setVolume(Number(event.target.value))}
					style={{ width: 180 }}
				/>
			</Example>

			<T k="forms.slider.p1" as="p" />

			<Example
				code={`
					<Slider label="Cowbell" vertical boxIndicator length={120} min={1} max={3} step={1}
					  value={cowbell} onChange={(e) => setCowbell(Number(e.target.value))} />
				`}
			>
				<Slider
					label={t("forms.slider.cowbellLabel", { value: cowbell })}
					vertical
					boxIndicator
					length={120}
					min={1}
					max={3}
					step={1}
					value={cowbell}
					onChange={(event) => setCowbell(Number(event.target.value))}
				/>
			</Example>
		</Component>
	);
}

function DropdownSection() {
	const [rating, setRating] = useState("3");
	const { t } = useI18n();

	return (
		<Component>
			<blockquote>
				<T k="forms.dropdown.quote" />
				<footer>{t("forms.dropdown.quoteSource")}</footer>
			</blockquote>

			<Example
				code={`
					<Select
					  defaultValue="3"
					  options={[
					    { label: "5 - Incredible!", value: "5" },
					    { label: "4 - Great!", value: "4" },
					    { label: "3 - Pretty good", value: "3" },
					    { label: "2 - Not so great", value: "2" },
					    { label: "1 - Unfortunate", value: "1" },
					  ]}
					/>
				`}
			>
				<Select
					defaultValue="3"
					options={[
						{ label: t("forms.dropdown.rating5"), value: "5" },
						{ label: t("forms.dropdown.rating4"), value: "4" },
						{ label: t("forms.dropdown.rating3"), value: "3" },
						{ label: t("forms.dropdown.rating2"), value: "2" },
						{ label: t("forms.dropdown.rating1"), value: "1" },
					]}
				/>
			</Example>

			<T k="forms.dropdown.p1" as="p" />

			<Example
				code={`
					const [rating, setRating] = useState("3");

					<Select
					  label="Rating"
					  value={rating}
					  onChange={(e) => setRating(e.target.value)}
					  options={[/* … */]}
					/>
				`}
			>
				<Select
					label={t("forms.dropdown.rating")}
					value={rating}
					onChange={(event) => setRating(event.target.value)}
					options={[
						{ label: t("forms.dropdown.rating5"), value: "5" },
						{ label: t("forms.dropdown.rating4"), value: "4" },
						{ label: t("forms.dropdown.rating3"), value: "3" },
						{ label: t("forms.dropdown.rating2"), value: "2" },
						{ label: t("forms.dropdown.rating1"), value: "1" },
					]}
				/>
			</Example>
		</Component>
	);
}

export const formControlSections: SectionDef[] = [
	{ id: "button", titleKey: "nav.button", level: 3, body: <ButtonSection /> },
	{ id: "checkbox", titleKey: "nav.checkbox", level: 3, body: <CheckboxSection /> },
	{ id: "option-button", titleKey: "nav.optionButton", level: 3, body: <OptionButtonSection /> },
	{ id: "group-box", titleKey: "nav.groupBox", level: 3, body: <GroupBoxSection /> },
	{ id: "text-box", titleKey: "nav.textBox", level: 3, body: <TextBoxSection /> },
	{ id: "slider", titleKey: "nav.slider", level: 3, body: <SliderSection /> },
	{ id: "dropdown", titleKey: "nav.dropdown", level: 3, body: <DropdownSection /> },
];
