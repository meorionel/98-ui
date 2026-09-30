/**
 * Strings for the overlay sections: menu bars with drop-downs, context menus,
 * dialogs and tooltips.
 *
 * Messages are plain strings. Inline markup is allowed:
 *   `code`     renders as <code>
 *   **strong** renders as <strong>
 *
 * NOTE: keys must stay in sync with `zh/overlays.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const overlays = {
	menus: {
		quote: '"File, Edit, View — the menu bar is where a Windows application tells you what it can do."',
		quoteSource: "Every Windows 98 manual, more or less",
		p1: "An entry that declares `items` opens a real drop-down menu. The arrows keep walking the menu bar while a menu is open and hovering another caption switches to it, exactly like the shell: submenus, separators, accelerator hints, check marks and radio marks are all supported.",
		p2: "`DropdownMenu` is the same menu engine without the menu bar — hand it any trigger element and it anchors the pop-up underneath. Its items are plain data, so a menu can be built from an array.",

		windowTitle: "A window with real menus",
		menuLabel: "Window menu",
		file: "File",
		view: "View",
		new: "New",
		open: "Open",
		sendTo: "Send to",
		desktop: "Desktop",
		mail: "Mail recipient",
		exit: "Exit",
		statusBar: "Status bar",
		zoom: "Zoom",
		zoom100: "100%",
		zoom200: "200%",
		body: "Open File and View. The status bar reports the last command you ran.",
		options: "Options",
		noSelection: "No command run yet",
		lastCommand: "Last command",
	},

	contextMenu: {
		p1: "`ContextMenu` wraps its children and opens a menu at the pointer on right-click. The keyboard works too: focus the area and press `Shift+F10` (or the Menu key) and the menu opens under the focused element, which is how Windows has done it since 95.",
		area: "Right-click this panel",
		hint: "Tab to the panel above and press Shift+F10 to open the menu from the keyboard.",
		label: "File actions",
		new: "New",
		folder: "Folder",
		shortcut: "Shortcut",
		rename: "Rename",
		delete: "Delete",
		properties: "Properties",
		wordWrap: "Word wrap",
		lastCommand: "Last command",
		none: "Nothing yet",
	},

	dialog: {
		p1: "`Dialog` is a real window: raised frame, title bar, command buttons, focus trap, `Escape` to close and a dimmed page behind it. Body scrolling is locked while it is open, and a second dialog stacks above the first because every layer gets its own place in the z-index stack.",
		p2: "`MessageBox` is the same dialog with the Windows 98 trim: an icon, a message and a row of command buttons. Give it `buttons` and it calls `onResult` with the button that was pressed.",
		openDialog: "Open dialog",
		openMessageBox: "Open message box",
		title: "Delete file",
		body: "Are you sure you want to send REPORT.DOC to the Recycle Bin?",
		boxTitle: "Confirm file delete",
		boxBody: "Deleting a file moves it to the Recycle Bin. Continue?",
		icon: "Icon",
		iconInfo: "Information",
		iconWarning: "Warning",
		iconError: "Stop",
		iconQuestion: "Question",
		result: "Result",
		none: "nothing yet",
	},

	tooltipPopover: {
		p1: "`Tooltip` shows after a short delay on hover, immediately on keyboard focus, and wires `aria-describedby` so it is announced rather than merely drawn. Escape hides it without closing anything else.",
		p2: "`Popover` is the modeless counterpart to `Dialog`: no backdrop, no focus trap, no scroll lock — the Win98 equivalent of a floating palette. It closes on `Escape`, on an outside click, or when its trigger is pressed again.",
		hoverMe: "Hover me",
		hoverMeRight: "Hover me too",
		tooltipText: "Sends the file to the Recycle Bin",
		details: "Details",
		popoverLabel: "File details",
		readOnly: "Read-only",
		hidden: "Hidden",
		name: "Name",
		apply: "Apply",
	},
};
