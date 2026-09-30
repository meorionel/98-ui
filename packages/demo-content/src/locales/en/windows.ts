/**
 * Windows section.
 *
 * Pattern used by every section file:
 *  - prose lives in this dictionary and is rendered with <T k="…" /> (which
 *    understands `code`, **strong**, *em* and [links](url));
 *  - plain labels and headings use t("…") directly;
 *  - `Example` code samples stay in English on purpose — they document the API.
 *
 * NOTE: keys must stay in sync with `zh/windows.ts` — `zh/index.ts` is typed as
 * `typeof en`, so a missing or extra key is a compile error.
 */

export const windows = {
	titleBar: {
		quote: "At the top edge of the window, inside its border, is the title bar, which extends across the width of the window. Include command buttons associated with the common commands of the primary window in the title bar.",
		quoteSource: "— Microsoft Windows User Experience p. 118, p. 122",
		p1: "`TitleBar` takes the caption through `text` and the buttons through `controls`. Accessible names default to English but can be localised through `labels`; the glyph is drawn from a class, never from the label text.",
		aTitleBar: "A Title Bar",
		aMaximizedTitleBar: "A Maximized Title Bar",
		aHelpfulBar: "A Helpful Bar",
		p2: "The `inactive` flag greys the bar out, and a `labels` map keeps the buttons accessible in any language:",
		inactiveTitleBar: "An inactive title bar",
	},

	contents: {
		quote: "Every window has a boundary that defines its shape.",
		quoteSource: "— Microsoft Windows User Experience p. 118",
		p1: "`Window` gives the title bar a home: a raised outer and inner border plus padding. `width` and `height` map straight onto the container style.",
		windowTitle: "A Window With Stuff In It",
		menuLabel: "Window menu",
		menuFile: "File",
		menuEdit: "Edit",
		menuView: "View",
		menuGo: "Go",
		menuFavorites: "Favorites",
		menuHelp: "Help",
		roomForActivities: "There's so much room for activities!",
		p2: "The building blocks are exported too, so a window can be assembled by hand. `MenuBar` supports ← / → / Home / End navigation with a roving tabindex.",
	},

	interactive: {
		p1: "Because the window chrome is driven by state. The window below actually closes, maximizes and restores:",
		windowTitle: "Interactive window",
		maximized: "Maximized",
		restored: "Restored",
		noEvents: "No events yet",
		body: "Try the buttons in the title bar.",
		reopen: "Reopen window",
	},

	statusBar: {
		quote: "A status bar is a special area within a window, typically the bottom, that displays information about the current state of what is being viewed in the window.",
		quoteSource: "— Microsoft Windows User Experience p. 146",
		windowTitle: "A Window With A Status Bar",
		intro: "There are just so many possibilities:",
		item1: "A Task Manager",
		item2: "A Notepad",
		item3: "Or even a File Explorer!",
		fieldHelp: "Press F1 for help",
		fieldSlide: "Slide 1",
		fieldCpu: "CPU Usage: 14%",
		p1: "`WindowBody` and `TitleBar` can be composed manually when the convenience props do not fit:",
		handAssembled: "Hand assembled",
		bodyContent: "Body content",
	},
};
