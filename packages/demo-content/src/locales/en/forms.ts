/**
 * Form controls section: Button, Checkbox, OptionButton, GroupBox, TextBox,
 * Slider and Dropdown.
 *
 * Pattern used by every section file:
 *  - prose lives in this dictionary and is rendered with <T k="…" /> (which
 *    understands `code`, **strong**, *em* and [links](url));
 *  - plain labels and headings use t("…") directly;
 *  - `Example` code samples stay in English on purpose — they document the API.
 *
 * Keys must stay in sync with `zh/forms.ts`: `zh/index.ts` is typed as `typeof
 * en`, so a missing or extra key is a compile error.
 */

export const forms = {
	button: {
		quote: "A *command button*, also referred to as a push button, is a control that causes the application to perform some action when the user clicks it.",
		quoteSource: "— Microsoft Windows User Experience p. 160",
		p1: "A standard button measures 75px wide and 23px tall, with a raised outer and inner border. They are given 12px of horizontal padding by default.",
		clickMe: "Click me",
		cannotBeClicked: "I cannot be clicked",
		// Split around a <kbd>, which the inline renderer does not cover.
		p2a: 'Use `variant="default"` for the button that responds to',
		enterKey: "Enter",
		p2b: "in the active window.",
		p3: "Pressing a button sinks its borders. Focus draws a dotted ring 4px inside. Because the stylesheet drives both from `:active` and `:focus`, the port adds `active` and `focused` props so a state can be pinned for docs and visual tests:",
		pressedState: "I am being pressed",
		focusedState: "I am focused",
		defaultPressed: "Default, pressed",
	},

	checkbox: {
		quote: "A *check box* represents an independent or non-exclusive choice.",
		quoteSource: "— Microsoft Windows User Experience p. 167",
		p1: "`Checkbox` renders the input and its `<label>` together and wires the `htmlFor`/`id` pair for you — the original required you to do that by hand.",
		thisIsACheckbox: "This is a checkbox",
		checkedLabel: "I am checked",
		inactiveLabel: "I am inactive",
		inactiveCheckedLabel: "Inactive but still checked",
		p2: "Fully controlled, with `checked` plus `onChange`:",
		firstOption: "First option",
		secondOption: "Second option",
	},

	optionButton: {
		quote: "An *option button*, also referred to as a radio button, represents a single choice within a limited set of mutually exclusive choices.",
		quoteSource: "— Microsoft Windows User Experience p. 164",
		p1: "`RadioGroup` manages the shared `name`, the selected value and the roving `checked` state, so there is no hand-written group bookkeeping.",
		yes: "Yes",
		no: "No",
		p2: "Controlled, with disabled entries — the second group below is a live controlled group:",
		smoothOption: "Peanut butter should be smooth",
		understandOption: "I understand why people like crunchy",
		crunchyOption: "Crunchy peanut butter is good",
		selected: "Selected: {value}",
		p3: "The low-level `Radio` is still available when you want full control:",
		checkedByDefault: "Checked by default",
		unchecked: "Unchecked",
	},

	groupBox: {
		quote: "A *group box* is a special control you can use to organize a set of controls: a rectangular frame with an optional label that surrounds a set of controls.",
		quoteSource: "— Microsoft Windows User Experience p. 189",
		p1: "`GroupBox` renders a native `fieldset`, and the border itself comes from an inlined SVG `border-image`.",
		selectOne: "Select one:",
		diners: "Diners",
		driveIns: "Drive-Ins",
		dives: "Dives",
		todayMood: "Today's mood",
		claireSaffitz: "Claire Saffitz",
		bradLeone: "Brad Leone",
		chrisMorocco: "Chris Morocco",
		carlaLalliMusic: "Carla Lalli Music",
	},

	textBox: {
		quote: "A *text box* is a rectangular control where the user enters or edits text. It can be defined to support a single line or multiple lines of text.",
		quoteSource: "— Microsoft Windows User Experience p. 181",
		occupation: "Occupation",
		favoriteColor: "Favorite color",
		p1: '`layout="stacked"` puts the label above the control:',
		addressLine1: "Address (Line 1)",
		addressLine2: "Address (Line 2)",
		additionalNotes: "Additional notes",
	},

	slider: {
		quote: "A *slider*, sometimes called a trackbar control, consists of a bar that defines the extent or range of the adjustment and an indicator that shows the current value.",
		quoteSource: "— Microsoft Windows User Experience p. 146",
		volumeLabel: "Volume: {value}",
		low: "Low",
		high: "High",
		p1: "`boxIndicator` swaps in the rectangular indicator and `vertical` rotates the control. Use `length` to size the track.",
		cowbellLabel: "Cowbell: {value}",
	},

	dropdown: {
		quote: "A *drop-down list box* allows the selection of only a single item from a list.",
		quoteSource: "— Microsoft Windows User Experience p. 175",
		rating5: "5 - Incredible!",
		rating4: "4 - Great!",
		rating3: "3 - Pretty good",
		rating2: "2 - Not so great",
		rating1: "1 - Unfortunate",
		p1: "Controlled, with a label in a `field-row`:",
		rating: "Rating",
	},
};
