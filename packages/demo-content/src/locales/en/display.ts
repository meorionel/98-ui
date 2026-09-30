/**
 * Strings for the display sections: badges, avatars, cards, typography, empty
 * states and the busy indicators.
 *
 * Messages are plain strings. Inline markup is allowed:
 *   `code`     renders as <code>
 *   **strong** renders as <strong>
 *
 * NOTE: keys must stay in sync with `zh/display.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const display = {
	badgeAvatar: {
		p1: "`Badge` is a small status chip. Windows 98 had no such control, so it is a deliberate addition: a raised chip in the theme's own surfaces, with a tint per status — and always a text label, because colour alone is not a message.",
		new: "New",
		saved: "Saved",
		errors: "3 errors",
		warning: "Unsaved changes",
		info: "Beta",
		p2: "`Avatar` is the logon tile: a sunken square with the picture inside, or the initials when there is no picture. If the image fails to load it falls back too, which is the case that actually happens in production.",
		initials: "Initials when there is no picture",
		tile: "Square tile, 32px (the default)",
		circle: "Circle, 48px",
	},
	card: {
		p1: "`Card` is a raised frame with a header, content and footer. It uses the same border as `Window` — the difference is that a card has no title bar and is meant to sit in a page rather than float above one.",
		title: "Modem",
		description: "Standard 56k modem",
		content: "Connected at 33.6 kbps. Compression is on, error control is on.",
		properties: "Properties",
		disconnect: "Disconnect",
	},
	typography: {
		p1: "`Heading`, `Text` and `Prose` carry the type scale. The stylesheet sizes bare `h1`–`h4` for prose — 5rem and down — which is far too large for an 11px interface, so these classes put the UI sizes back.",
		heading: "Disk Defragmenter",
		lead: "Rearranges the files on your disk so programs start faster.",
		body: "You do not need to defragment a drive that is formatted with NTFS. Close other programs before you start, and leave the computer alone until it finishes.",
		muted: "C:\\Windows\\System",
		small: "Last run: never",
		p2: "`Prose` wraps rendered rich text — markdown, a help page, this documentation — and scopes everything inside it: headings, paragraphs, lists, quotes, code and links all pick up the theme instead of the browser defaults.",
		quote: '"A defragmented drive is a happy drive."',
		quoteSource: "Every Windows 98 manual, more or less",
		list1: "Close other programs first.",
		list2: "Do not run the screensaver while it works.",
		code: "Use `defrag C:` from a command prompt.",
	},
	empty: {
		p1: "`Empty` is the nothing-here-yet state: a glyph, a headline, a sentence and an action, centred in the page's own colours. No stock illustration — cheaper, and it matches the rest of the library.",
		title: "This folder is empty",
		description: "Drag files here, or use File, New, Folder.",
		action: "New folder",
		p2: "Pass `compact` for a panel inside a panel.",
		compactTitle: "No devices found",
		compactDescription: "Plug a device in and choose Refresh.",
	},
	feedback: {
		p1: "`Spinner` is the busy indicator: the hourglass that flips while the machine thinks, drawn as inline SVG so the two frames are a CSS animation rather than a sprite. It is announced as a status, so a screen reader says what is happening.",
		spinner: "Spinner",
		working: "Copying files…",
		p2: "A `ProgressIndicator` with no `value` is indeterminate and animates as a marquee, which is what Windows 98 does when it cannot say how long is left. It omits `aria-valuenow` entirely, so assistive technology announces progress without a percentage.",
		progress: "Progress",
		determinate: "Determinate: 60%",
		indeterminate: "Indeterminate",
		indeterminateSegmented: "Indeterminate, segmented",
		busyLabel: "Formatting drive C:",
	},
};
