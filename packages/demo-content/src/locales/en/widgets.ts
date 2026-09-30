/**
 * Strings for the widget sections: separators, spin boxes, date pickers, split
 * panes, balloon tips, property sheets and wizards.
 *
 * Messages are plain strings. Inline markup is allowed:
 *   `code`     renders as <code>
 *   **strong** renders as <strong>
 *
 * `datePicker.weekdays` is a space-separated list — the demo splits it into the
 * seven column headers, because the calendar needs names, not a sentence.
 *
 * NOTE: keys must stay in sync with `zh/widgets.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const widgets = {
	separator: {
		p1: "`Separator` draws the etched rule Windows 98 uses between blocks, horizontally or vertically; pass `decorative` when it is only there for the eye. `Kbd` renders a keycap, so a shortcut reads the way it is printed in a manual.",
		left: "Left block",
		right: "Right block",
		shortcut: "Press `Ctrl` + `S` to save, or `Escape` to cancel.",
	},
	spinBox: {
		p1: "`SpinBox` is the up-down control: a text box with a pair of arrows. `step` sets one press, `pageStep` sets PageUp/PageDown, Home/End jump to the bounds, and anything typed outside the range is clamped when the box loses focus.",
		fontSize: "Font size",
		quantity: "Quantity",
		controlled: "Controlled value",
		hint: "Arrows step by one, PageUp/PageDown by ten.",
		value: "Value: {value}",
	},
	datePicker: {
		p1: "`DatePicker` is a read-only box with a drop-down calendar. Values are ISO `YYYY-MM-DD` strings from end to end — `toIsoDate` and `parseIsoDate` are exported for the conversions — so nothing in the chain needs a date library.",
		installedOn: "Installed on",
		selected: "Selected date: {value}",
		previousMonth: "Previous month",
		nextMonth: "Next month",
		weekdays: "Su Mo Tu We Th Fr Sa",
		monthHeading: "{month}/{year}",
		dayLabel: "Select {date}",
		p2: "The `Calendar` inside is a component in its own right, so it can also be placed on a page directly. It takes the same `min`, `max` and `weekStartsOn`, and the whole grid is keyboard driven.",
		calendar: "A bare calendar",
	},
	splitPane: {
		p1: "`SplitPane` puts a draggable divider between two panes. The divider is a real `separator`: it takes focus, reports its size through `aria-valuenow`, moves with the arrow keys, jumps with Home/End, resets with Enter or a double click, and keeps dragging when the pointer leaves the window.",
		divider: "Resize the panes",
		left: "Drag the divider",
		right: "The second pane takes the rest of the space.",
		hint: "Tab to the divider and use the arrow keys, or drag it with the pointer.",
	},
	balloonTip: {
		p1: "`BalloonTip` is the tailed notification Windows 98 pops out of the tray. Anchored to an element it points at it; without an anchor it docks in a corner. It never steals focus, closes on `Escape`, and can dismiss itself after `autoDismiss` — a toast in this design language.",
		showAnchored: "Point at this button",
		showDocked: "Dock in the corner",
		anchoredTitle: "New hardware found",
		anchoredBody: "Windows is installing the driver for your new device.",
		dockedTitle: "Low disk space",
		dockedBody: "You are running out of space on drive C.",
	},
	propertySheet: {
		p1: "`PropertySheet` is the Windows 98 modal settings window: pages as tabs, with OK, Cancel and an optional Apply. It is `Dialog` plus `Tabs`, so stacking, the focus trap, `Escape` and the dimmed backdrop behave exactly like any other dialog.",
		open: "Open property sheet",
		title: "Display Properties",
		background: "Background",
		settings: "Settings",
		wallpaper: "Wallpaper",
		colours: "Colour scheme",
		pageBackground: "Pick a wallpaper. The preview updates when you press Apply.",
		pageSettings: "Choose a colour scheme for windows, buttons and menus.",
	},
	wizard: {
		p1: "`Wizard` walks a fixed set of pages with Back, Next and Finish. The list on the left jumps between steps, the footer says where you are, `Next` becomes `Finish` on the last page, and `Enter` follows the default button — so the whole thing works from the keyboard.",
		open: "Start the wizard",
		title: "Add Hardware Wizard",
		welcome: "Welcome",
		welcomeBody: "This wizard helps you install a device and its driver.",
		device: "Device",
		deviceBody: "Which device would you like to install?",
		deviceModem: "Modem",
		devicePrinter: "Printer",
		confirm: "Finish",
		confirmBody: "Setup will now install the {device}.",
		done: "Finished — the {device} is installed.",
	},
};
