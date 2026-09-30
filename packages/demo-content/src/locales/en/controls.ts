/**
 * Strings for the control sections: combo boxes, toolbars and form fields.
 *
 * Messages are plain strings. Inline markup is allowed:
 *   `code`     renders as <code>
 *   **strong** renders as <strong>
 *
 * NOTE: keys must stay in sync with `zh/controls.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const controls = {
	comboBox: {
		p1: "`ComboBox` is the Windows 98 combo box: a text box with a drop-down list. Typing filters on the leading characters — what the original control does — and free text is reported through `onInputChange`.",
		editable: "Editable box",
		selected: "Selected value: {value}",
		p2: "Pass `selectOnly` for the drop-down list style: the box only displays the selection, typing runs type-ahead, and `Enter` chooses. The list is a `listbox` wired to the input with `aria-activedescendant`, so focus never leaves the text box.",
		port: "Port",
		showOptions: "Show options",
		p3: "The entries are ordinary data — `value`, `label` and an optional `text`, which is what lands in the box when `label` is not a plain string. A custom `filter` replaces the prefix matching, and `emptyMessage` fills the list when nothing matches.",
	},
	toolbar: {
		p1: "`Toolbar` is the common toolbar: flat buttons that only show their border under the pointer, separators, a spacer — and `ToolbarButton`, which is a command button until you give it `pressed`, at which point it becomes a toggle.",
		windowTitle: "A window with a toolbar",
		label: "Standard",
		new: "New",
		open: "Open",
		bold: "Bold",
		italic: "Italic",
		zoom: "Zoom",
		zoom100: "100%",
		zoom200: "200%",
		help: "Help",
		nothing: "No command run yet",
		lastCommand: "Last command: {value}",
		p2: "`ToggleGroup` shares one selection between its `ToggleGroupItem`s — `type` switches it between radio-like and check-box-like. `ButtonGroup` is the plain layout helper for a row of command buttons.",
		alignment: "Alignment",
		left: "Left",
		center: "Center",
		right: "Right",
	},
	field: {
		p1: "`Field` owns the label, the hint and the error message. The control inside it picks up the id, `aria-describedby`, `aria-invalid` and `aria-required` from context, and drops its own label, so nothing is announced twice. This is the piece that makes a form library a drop-in.",
		userName: "User name",
		userHint: "Letters, digits and underscores only.",
		required: "A user name is required.",
		p2: "Any control works inside a field. `Select`, `TextArea` and `ComboBox` inherit the same wiring, including the red invalid outline.",
		port: "Port",
		portError: "Choose a port before continuing.",
		protocol: "Protocol",
	},
};
