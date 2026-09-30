# 98-pink-react

**A React component library port of [98-pink.css](https://github.com/meorionel/98-pink.css)** — the pink & blue Windows 98 UI revival, itself a fork of [98.css](https://jdan.github.io/98.css/).

> **This package lives in the `98-ui` bun workspace.** The stylesheet it consumes
> is authored once in `packages/css`, and the floating/focus/layer logic it shares
> with the Vue port lives in `packages/shared`. See the workspace root `README.md`
> for the layout and the commands. This document covers the React port itself.

The upstream stylesheet is carried over **byte-for-byte** (verified by a test, see [Fidelity](#fidelity)). On top of it sits a typed React component for every control, plus the interactive behaviour the CSS-only version had to leave to the consumer: tab switching, table row selection, window controls, menu keyboard navigation, drop-down menus, modal dialogs, tooltips and popovers.

```tsx
import { Window, Button, Checkbox, FieldRow } from "98-pink-react";
import "98-pink-react/style.css";

export function App() {
  return (
    <Window title="Hello!" width={300} controls={["close"]}>
      <p>It is 1998 in here.</p>
      <FieldRow>
        <Checkbox defaultChecked label="Enable pink mode" />
      </FieldRow>
      <FieldRow>
        <Button variant="default">OK</Button>
        <Button>Cancel</Button>
      </FieldRow>
    </Window>
  );
}
```

---

## Install

```bash
npm install 98-pink-react
# or
bun add 98-pink-react
# or
pnpm add 98-pink-react
```

`react` and `react-dom` (`^18` or `^19`) are peer dependencies.

Import the stylesheet **once**, anywhere in your entry file:

```ts
import "98-pink-react/style.css";
```

> **Note** — the upstream stylesheet is a _global theme_: it styles `body`, `button`, `input`, `select`, `textarea`, `table`, `pre`, `a` and the scrollbars page-wide. That is deliberate and matches the CSS-only library. If you need it contained, scope it by importing the file and wrapping your app, or override the CSS variables (see [Theming](#theming)).

---

## Project layout

This package lives in the `98-ui` bun workspace. The styling it consumes is
authored once in `packages/css`; only `react-extras.css` is written here. See the
workspace root `README.md` for the whole picture.

```
98/
├── 98-pink.css/                 # the original CSS-only project (untouched)
├── 98-pink-react/               # the original React port (untouched)
├── 98-pink-vue/                 # the original Vue port (untouched)
└── 98-ui/                       # the workspace
    └── packages/
        ├── css/                 # style.css + additive/*.css — the source of truth
        ├── shared/              # floating / focus / layer stack, framework-free
        ├── tools/               # the stylesheet generator + fidelity checker
        └── react/               # this package
            ├── src/
            │   ├── index.ts             # the public API surface
            │   ├── components/          # one file per component
            │   ├── styles/
            │   │   ├── 98-pink.css      # GENERATED from packages/css/style.css
            │   │   ├── react-extras.css # the few additive rules React needs (authored)
            │   │   ├── overlays.css     # GENERATED — packages/css/additive
            │   │   ├── controls.css     # GENERATED — packages/css/additive
            │   │   ├── widgets.css      # GENERATED — packages/css/additive
            │   │   ├── display.css      # GENERATED — packages/css/additive
            │   │   ├── index.css        # GENERATED — imports all six
            │   │   └── fonts/           # GENERATED — the two MS Sans Serif fonts
            │   └── utils/               # thin bindings over 98-pink-shared
            ├── demo/                    # documentation + playground app
            │   ├── src/
            │   │   ├── App.tsx          # the documentation page
            │   │   ├── LocaleSwitcher.tsx
            │   │   ├── sections/        # one file per group of components
            │   │   └── i18n/            # overrides.ts — the shared tables live in @98-ui/demo-content
            │   └── ssr.tsx              # SSR entry used by the render checks
            └── scripts/                 # smoke / DOM / SSR tests
```

---

## Documentation site

The demo in `demo/` covers all 41 documented sections and can be browsed in
**English or 简体中文**. Start it with:

```bash
bun run dev          # http://localhost:5273
```

A `Language` toggle sits at the top of the sidebar, above the navigation tree.

### How the i18n works

It is a small, dependency-free layer — no `i18next`, no build plugin:

- `demo/src/i18n/index.tsx` — `I18nProvider`, `useI18n()` and the `<T>` component.
- `demo/src/i18n/locales/{en,zh}/` — the dictionaries, one module per domain.
- `demo/src/i18n/inline.tsx` — the inline markup renderer.

Messages are **plain strings**, and the active locale is auto-detected from
`localStorage` → `navigator.language` → `"en"`, then remembered across reloads.
`document.documentElement.lang` is kept in sync, and each switch button carries its
own `lang` attribute so screen readers pronounce it correctly.

Message strings may contain inline markup, which keeps a sentence with a technical
identifier in the middle as _one_ translatable unit instead of fragile fragments:

| Written in the dictionary | Rendered as               |
| ------------------------- | ------------------------- |
| `` `code` ``              | `<code>code</code>`       |
| `**strong**`              | `<strong>strong</strong>` |
| `*emphasis*`              | `<em>emphasis</em>`       |
| `[text](url)`             | `<a href="url">text</a>`  |

```tsx
// Plain label
<Button>{t("common.ok")}</Button>

// Prose with inline markup, rendered into a <p>
<T k="panels.fieldBorders.p1" as="p" />
```

Use `t()` for strings with no markup and `<T>` for everything else; `T` also
accepts `vars` for `{placeholder}` interpolation.

**Translation completeness is enforced by the compiler.** `zh/index.ts` is typed as
`Messages` (= `typeof en`), so a missing or extra key in the Chinese dictionary is a
TypeScript error rather than a silent English fallback. On top of that,
`scripts/ssr-check.mjs` renders the page in both locales and asserts that no message
ever falls back to its own key.

Code samples inside the docs stay in English on purpose — they document the React API,
not the UI — and a note on the page says so.

---

## Components

### Form controls

| Component                      | Renders                          | Notes                                                         |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------- |
| `Button`                       | `button`                         | `variant="default"`, `active`, `focused`                      |
| `Checkbox`                     | `input[type=checkbox]` + `label` | wires `id`/`htmlFor` for you                                  |
| `Radio`                        | `input[type=radio]` + `label`    | group via shared `name`                                       |
| `RadioGroup`                   | several `Radio`s                 | manages `name` + selected value                               |
| `GroupBox`                     | `fieldset` + `legend`            | engraved SVG `border-image`                                   |
| `TextBox`                      | `input` + `label`                | `layout="row" \| "stacked"`, `width`                          |
| `TextArea`                     | `textarea` + `label`             | stacked by default                                            |
| `Select`                       | `select`                         | `options` prop or `<option>` children                         |
| `Slider`                       | `input[type=range]`              | `vertical`, `boxIndicator`, `length`, `lowLabel`, `highLabel` |
| `ComboBox`                     | input + `role=listbox` popup     | filtering, type-ahead, `selectOnly`, custom `filter`          |
| `Field`                        | label + control + hint + error   | wires id / `aria-describedby` / `aria-invalid` by context     |
| `FieldRow` / `FieldRowStacked` | `div.field-row(-stacked)`        | the 6px grouping rhythm                                       |
| `FieldLabel`                   | `div.field-row`                  | caption row ("Select one:")                                   |

### Commands & toolbars

| Component                            | Renders / does                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `Toolbar`                            | `role="toolbar"` row of flat buttons, separators and spacers                       |
| `ToolbarButton`                      | a toolbar button — a command button, or a toggle once it has `pressed`             |
| `ToolbarSeparator` / `ToolbarSpacer` | the sunken rule between groups / the flexible gap                                  |
| `ToggleButton`                       | a button that stays pressed, exposed as `aria-pressed`                             |
| `ToggleGroup` / `ToggleGroupItem`    | one shared selection, `type="single"` (radio-like) or `"multiple"` (checkbox-like) |
| `ButtonGroup`                        | the grouped-button layout helper, horizontal or vertical                           |
| `Pagination`                         | first / previous / next / last plus a "Page 1 of 4" readout                        |

### Display & text

| Component             | Renders / does                                                            |
| --------------------- | ------------------------------------------------------------------------- |
| `Badge`               | status chip, tinted per variant, always with a text label                 |
| `Avatar`              | logon tile; square or circle, falls back to initials when the image fails |
| `Card` (+ five parts) | raised frame with header, title, description, content and footer          |
| `Heading` / `Text`    | the UI type scale, sized for an 11px interface rather than for prose      |
| `Prose`               | scopes rendered rich text (markdown, help pages) to the theme             |
| `Empty`               | the nothing-here-yet state: glyph, headline, hint, actions                |
| `Spinner`             | the flipping hourglass, announced as a `status`                           |
| `ProgressIndicator`   | determinate, or an animated marquee when it has no `value`                |

### Widgets

| Component           | Renders / does                                                              |
| ------------------- | --------------------------------------------------------------------------- |
| `SpinBox`           | text box + up/down arrows, `role="spinbutton"`, clamping, `step`/`pageStep` |
| `Calendar`          | month grid (`role="grid"`), keyboard driven, `min`/`max`/`weekStartsOn`     |
| `DatePicker`        | read-only box + drop-down `Calendar`, ISO `YYYY-MM-DD` values end to end    |
| `SplitPane`         | draggable, focusable divider between two panes                              |
| `BalloonTip`        | the tailed tray notification; anchored or docked, optional `autoDismiss`    |
| `PropertySheet`     | modal settings dialog whose pages are tabs, plus OK / Cancel / Apply        |
| `Wizard`            | Back / Next / Finish over ordered pages, with a step list and readout       |
| `Separator` / `Kbd` | the etched rule, horizontal or vertical, and the keycap for shortcuts       |

### Window chrome

| Component                             | Renders                                                             |
| ------------------------------------- | ------------------------------------------------------------------- |
| `Window`                              | `.window` + title bar + body + optional menu/status bars            |
| `WindowBody`                          | `.window-body`                                                      |
| `TitleBar` / `TitleBarText` behaviour | `.title-bar`, `.title-bar-text`, `.title-bar-controls`              |
| `TitleBarButton`                      | one command button (`minimize`/`maximize`/`restore`/`help`/`close`) |
| `MenuBar`                             | `ul.menu-bar[role=menubar]` with `<u>` accelerators                 |
| `StatusBar` / `StatusBarField`        | `.status-bar` / `.status-bar-field`                                 |

### Data display

| Component                                                                     | Renders                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| `TreeView`, `TreeViewItem`, `TreeViewBranch`, `TreeViewLink`                  | `ul.tree-view` + nested `<details>`                      |
| `Tabs`, `TabList`, `Tab`, `TabPanel`                                          | `menu[role=tablist]` + `.window[role=tabpanel]`          |
| `TableView`                                                                   | `.sunken-panel` + sticky-header table with row selection |
| `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell` | the primitives                                           |
| `ProgressIndicator`                                                           | `.progress-indicator[.segmented]`                        |

### Panels & misc

`FieldBorder`, `FieldBorderDisabled`, `StatusFieldBorder`, `SunkenPanel`, `VerticalBar`, `Link`, `CodeBlock`.

### Deliberately not ported

Everything in the shadcn/ui catalogue is accounted for by now. What follows is
the part of it this library will **not** grow, and why — so that a missing
component reads as a decision rather than an oversight.

| shadcn/ui       | Why not                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Sheet, Drawer   | Windows 98 has no slide-out panel; a `Dialog` or a second `Window` is the period-correct answer |
| Sonner          | `BalloonTip` is the 1998 notification — a tailed balloon, not a stack of toasts                 |
| Skeleton        | 1998 loads with an hourglass and a progress bar, not grey blocks                                |
| Chart, Carousel | they need a rendering library; a CSS-faithful port is the wrong place to add one                |
| Aspect Ratio    | one CSS declaration, not a component                                                            |
| Navigation Menu | multi-level site navigation is a web idiom; `MenuBar` covers the Windows one                    |
| Hover Card      | `Tooltip` and `Popover` already cover what it is for                                            |
| Accordion       | `TreeView` branches are native `<details>`, which is the same interaction                       |
| Sidebar         | a layout concern, not a control; `SplitPane` + `TreeView` build one                             |
| Breadcrumb      | no equivalent in the shell; `Link` and `Separator` are enough                                   |
| Alert           | `MessageBox` is the modal form, `Card` the inline one                                           |
| Input OTP       | not a 1998 control; a `TextBox` with `maxLength` is the honest version                          |
| Command         | the equivalent is a "Run" dialog, assembled from `Dialog` + `ComboBox`                          |
| Direction (RTL) | the pixel fonts and box-drawing borders assume a left-to-right shell                            |

### Menus, dialogs & overlays

Every layer below shares one engine: a portal into `document.body`, a monotonic
`z-index` stack, outside-click and `Escape` dismissal (only the topmost layer
reacts), a focus trap, and viewport-aware positioning that flips and shifts.

| Component      | Renders / does                                                                         |
| -------------- | -------------------------------------------------------------------------------------- |
| `MenuBar`      | `ul.menu-bar[role=menubar]`; entries that declare `items` open real drop-downs         |
| `MenuPopup`    | the menu surface on its own — keyboard, type-ahead, submenus, check/radio marks        |
| `DropdownMenu` | any trigger plus a menu under it, with `aria-haspopup` / `aria-expanded` wired for you |
| `ContextMenu`  | right-click menu, plus `Shift`+`F10` and the Menu key from the keyboard                |
| `Dialog`       | modal window: title bar, focus trap, scroll lock, `Escape`, optional backdrop          |
| `MessageBox`   | the Win98 message box: icon, message, `buttons` and an `onResult` callback             |
| `Tooltip`      | delayed tooltip on hover, immediate on focus, wired through `aria-describedby`         |
| `Popover`      | modeless floating panel — no backdrop, no trap, closes on `Escape` or an outside click |
| `Portal`       | renders a layer into `document.body`; nothing is emitted during SSR                    |

`MenuEntry` is plain data, so a menu can come from anywhere:

```tsx
type MenuEntry =
  | { label: ReactNode; onSelect?: () => void; shortcut?: string; accessKey?: string }
  | { type: "separator" }
  | { type: "label"; label: ReactNode }
  | {
      type: "checkbox";
      label: ReactNode;
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    }
  | {
      type: "radio";
      label: ReactNode;
      value: string;
      checked?: boolean;
      onCheckedChange?: (value: string) => void;
    }
  | { type: "submenu"; label: ReactNode; items: MenuEntry[] };
```

---

## Key examples

### Window with everything

```tsx
<Window
  title="A Window With Stuff In It"
  width={320}
  controls={["minimize", "maximize", "close"]}
  onControl={(action) => action === "close" && setOpen(false)}
  menuBar={
    <MenuBar
      items={[
        { label: "File", accessKey: "F" },
        { label: "Edit", accessKey: "E" },
      ]}
    />
  }
  statusBar={
    <StatusBar>
      <StatusBarField>Press F1 for help</StatusBarField>
      <StatusBarField>CPU Usage: 14%</StatusBarField>
    </StatusBar>
  }
>
  <p>There&apos;s so much room for activities!</p>
</Window>
```

Window command buttons can be labelled in any language; the glyph comes from a class, never from the label text:

```tsx
<Window
  title="本地化标题栏"
  controls={["minimize", "maximize", "close"]}
  labels={{ minimize: "最小化", maximize: "最大化", close: "关闭" }}
/>
```

### Tabs

The original docs say tabs "should be managed by adding custom javascript code". That bookkeeping now lives in the component — including `aria-selected`, panel visibility and ← / → keyboard navigation.

```tsx
<Tabs defaultValue="desktop">
  <TabList label="Control panel">
    <Tab value="desktop">Desktop</Tab>
    <Tab value="computer">My computer</Tab>
  </TabList>
  <TabPanel value="desktop">
    <p>Desktop settings</p>
  </TabPanel>
  <TabPanel value="computer">
    <p>My computer</p>
  </TabPanel>
</Tabs>
```

Use `keepMounted` on `<Tabs>` to hide inactive panels instead of unmounting them, and `multirows` on `<TabList>` to stretch the tabs evenly.

### Table view

```tsx
<TableView
  selectable
  height={140}
  width={300}
  selectedKey={selected}
  onSelect={(row, key) => setSelected(key)}
  getRowKey={(row) => row.id}
  columns={[
    { key: "name", header: "Name" },
    { key: "version", header: "Version" },
  ]}
  data={drivers}
/>
```

Row highlighting follows the original docs' script: clicking a body row moves the highlight to it.

### Menus

`MenuBar` entries that declare `items` behave like the real thing: clicking opens
the menu, ←/→ keep walking the menu bar while it is open, hovering another
caption switches to it, and submenus fly out to the side.

```tsx
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
        { type: "separator" },
        { label: "Exit", accessKey: "x", onSelect: quit },
      ],
    },
    {
      label: "View",
      accessKey: "V",
      items: [
        {
          type: "checkbox",
          label: "Status bar",
          checked: showStatusBar,
          onCheckedChange: setShowStatusBar,
        },
        { type: "radio", label: "100%", value: "100", checked: zoom === "100" },
      ],
    },
  ]}
/>
```

`DropdownMenu` and `ContextMenu` reuse the same entries behind any trigger:

```tsx
<DropdownMenu trigger={<Button>Options</Button>} items={items} />
<ContextMenu items={items}>
  <SunkenPanel>Right-click me</SunkenPanel>
</ContextMenu>
```

### Dialogs

```tsx
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

<MessageBox
  open={confirming}
  onOpenChange={setConfirming}
  title="Confirm file delete"
  icon="warning"
  buttons={["yes", "no", "cancel"]}
  defaultButton="no"
  onResult={(result) => console.log(result)}
>
  Deleting a file moves it to the Recycle Bin. Continue?
</MessageBox>
```

### Forms

`Field` owns the label, the hint and the error message; the control inside it
takes the id, `aria-describedby`, `aria-invalid` and `aria-required` from
context and drops its own label, so a caption is never announced twice.

```tsx
<Field
  label="User name"
  description="Letters, digits and underscores only."
  required
  error={error}
>
  <TextBox width={200} value={userName} onChange={change} />
</Field>

<Field label="Port" error="Choose a port before continuing.">
  <ComboBox options={ports} width={140} />
</Field>
```

### Toolbars

```tsx
<Toolbar label="Standard">
  <ToolbarButton onClick={newFile}>New</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton pressed={bold} onPressedChange={setBold}>Bold</ToolbarButton>
  <DropdownMenu trigger={<ToolbarButton>Zoom</ToolbarButton>} items={zoomItems} />
  <ToolbarSpacer />
  <ToolbarButton disabled>Help</ToolbarButton>
</Toolbar>

<ToggleGroup label="Alignment" value={alignment} onValueChange={setAlignment}>
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
</ToggleGroup>
```

### Sorting and paging a table

```tsx
<TableView
  sortable
  defaultSortKey="name"
  pageSize={10}
  columns={[
    { key: "name", header: "Name" },
    // Sort on the byte count while displaying the formatted size.
    { key: "size", header: "Size", align: "right", sortValue: (row) => row.bytes },
  ]}
  data={files}
/>
```

The header arrow is driven by `aria-sort`, so what you see and what a screen
reader announces cannot drift apart.

### Display & text

| Component             | Renders / does                                                            |
| --------------------- | ------------------------------------------------------------------------- |
| `Badge`               | status chip, tinted per variant, always with a text label                 |
| `Avatar`              | logon tile; square or circle, falls back to initials when the image fails |
| `Card` (+ five parts) | raised frame with header, title, description, content and footer          |
| `Heading` / `Text`    | the UI type scale, sized for an 11px interface rather than for prose      |
| `Prose`               | scopes rendered rich text (markdown, help pages) to the theme             |
| `Empty`               | the nothing-here-yet state: glyph, headline, hint, actions                |
| `Spinner`             | the flipping hourglass, announced as a `status`                           |
| `ProgressIndicator`   | determinate, or an animated marquee when it has no `value`                |

### Widgets

```tsx
<SpinBox label="Font size" min={8} max={72} defaultValue={11} />

<DatePicker
  label="Installed on"
  value={date}
  onValueChange={setDate}
  min="1995-08-24"
  max="1999-12-31"
/>

<SplitPane
  defaultSize={140}
  first={<TreeView>…</TreeView>}
  second={<TableView … />}
/>

<Wizard
  open={open}
  onOpenChange={setOpen}
  title="Add Hardware Wizard"
  onFinish={install}
  steps={[
    { key: "welcome", title: "Welcome", content: <p>…</p> },
    { key: "device", title: "Device", content: <DevicePicker /> },
  ]}
/>
```

### Display and text

```tsx
<Badge variant="success">Saved</Badge>
<Avatar src="/me.png" alt="Meorion" size={48} shape="circle" fallback="MO" />

<Card style={{ width: 280 }}>
  <CardHeader>
    <CardTitle>Modem</CardTitle>
    <CardDescription>Standard 56k modem</CardDescription>
  </CardHeader>
  <CardContent>Connected at 33.6 kbps.</CardContent>
  <CardFooter>
    <Button variant="default">Properties</Button>
  </CardFooter>
</Card>

<Empty title="This folder is empty" description="Drag files here.">
  <Button variant="default">New folder</Button>
</Empty>

<Spinner label="Copying files…" />
<ProgressIndicator width={300} />          {/* indeterminate: animated */}
```

### Theming

The upstream `dist` build runs `postcss-css-variables`, which flattens every `var()` into a literal colour. This port deliberately **keeps** the custom properties, so the whole library can be rethemed from a single scope:

```tsx
<div
  style={
    {
      "--surface": "hsl(210 60% 92%)",
      "--button-surface": "hsl(210 55% 82%)",
      "--border-color": "hsl(210 70% 25%)",
      "--text-color": "hsl(210 70% 25%)",
    } as React.CSSProperties
  }
>
  <Window title="Rethemed at runtime">…</Window>
</div>
```

Available tokens are the upstream `:root` block: `--color-pinkline-50` … `--color-pinkline-500`, `--text-color`, `--surface`, `--border-color`, `--button-surface`, `--button-highlight`, `--button-face`, `--button-shadow`, `--window-frame`, `--dialog-blue`, `--dialog-blue-light`, `--dialog-gray`, `--dialog-gray-light`, `--link-blue`, plus the spacing and border-composition tokens.

---

## Fidelity

The stylesheet in `src/styles/98-pink.css` is **generated**, never hand-edited:

```bash
bun run generate        # packages/css/style.css -> src/styles/98-pink.css + fonts
bun run generate:dist   # also -> dist/style.css
```

`packages/tools` (`98-generate-styles --port react`) runs the _same_ `postcss-inline-svg` pipeline the upstream project uses, so all 26 `svg-load("./icon/*.svg")` calls become `data:` URIs and the published stylesheet has no icon requests at all (only the two web fonts).

Five sheets are hand-written and shipped next to it, verbatim:
`react-extras.css` (the additive rules React needs, described above),
`overlays.css` (dialogs, menus, tooltips and popovers — layers the CSS-only
project never had), `controls.css` (toolbars, toggle buttons, combo boxes, form
fields, sortable headers and pagers) and `widgets.css` (spin boxes, calendars,
date pickers, splitters, balloon tips, property sheets and wizards) and
`display.css` (badges, avatars, cards, typography, empty states, the spinner and
the indeterminate progress marquee). Because the generator only ever rewrites `98-pink.css`, the
fidelity test keeps comparing that one generated sheet and stays byte-exact.

`bun run test:fidelity` then proves the transformation is lossless: it strips the inlined icons from both files and asserts the results are **character-for-character identical**. A dropped selector, a reordered declaration or an accidentally pre-resolved variable fails the build.

---

## Scripts

| Script               | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `bun run dev`        | Vite dev server for the documentation app (HMR)                      |
| `bun run build`      | Generate CSS → bundle ESM/CJS → emit `.d.ts` → copy `dist/style.css` |
| `bun run build:demo` | Production build of the documentation app                            |
| `bun run preview`    | Serve the built documentation app                                    |
| `bun run typecheck`  | Typecheck the library **and** the demo                               |
| `bun test`          | Fidelity + library smoke tests + DOM interaction tests + SSR render  |
| `bun run test:dom`   | Drive the overlay layers in a real DOM (click, Escape, focus, Tab)   |
| `bun run verify`     | `typecheck` + `build` + `test`                                       |
| `bun run format`     | Prettier                                                             |

### What the tests cover

- **`packages/tools` (`98-verify-fidelity --port react`)** — the stylesheet is a pure transformation of the upstream source; custom properties survive; both `@font-face` rules are intact.
- **`scripts/smoke-test.mjs`** — server-renders every exported component and asserts the markup contract the CSS depends on: `input` immediately before its `label`, `field-row` wrappers, `.window-body` nesting, tab ARIA, highlighted rows, clamped progress values, menu roles and states, and so on. It also unit-tests the layer maths (flip and shift), and checks that **every class the overlay components emit has a rule in the published stylesheet**.
- **`scripts/ssr-check.mjs`** — server-renders the **entire documentation app in both locales** and checks that every section renders, every expected control is present, no message falls back to its own key, the Chinese page actually replaced the English chrome, and _every class emitted actually has a rule in the stylesheet_.
- **`scripts/dom-test.mjs`** — mounts the interactive components in a real DOM (happy-dom) and drives them like a user: click a trigger and the pop-up must be measured and visible **immediately**, arrows walk a menu, `ArrowRight` opens a submenu, `Escape` closes the topmost layer only, outside clicks dismiss, `Dialog` focuses its default button and keeps `Tab` inside, `ContextMenu` opens at the pointer, a `ComboBox` filters as you type and selects with `Enter` (and restores the selected label on `Escape`), toggles flip `aria-pressed`, and a sortable `TableView` reorders its rows between pages, a `SpinBox` clamps what you type, a `Calendar` pages months without losing your selection, a `DatePicker` hands the day back to its box, and a `Wizard` walks to its last step and finishes. Server rendering executes no effects, so none of this is visible to the checks above — which is exactly how a "menus only appear after scrolling" regression once shipped.

---

## Differences from the CSS-only library

Everything below is additive; the class names and visual result are unchanged.

1. **State lives in React.** Tabs, table selection, menu focus and window controls are props/callbacks instead of `document.querySelectorAll`.
2. **Accessibility.** Tabs get roving tabindex + `aria-selected`/`aria-controls`; the menu bar supports ←/→/Home/End; progress bars get `role="progressbar"`; every label/input pair is wired automatically.
3. **`Button` gains `active` and `focused` props.** The upstream docs referenced `.active` and `.focused` classes that were _never defined_ in `style.css`; `react-extras.css` defines them as `.force-active` / `.force-focused` here.
4. **A `:focus-visible` ring** was added for radios and checkboxes.
5. **CSS variables are preserved** rather than pre-resolved (see [Theming](#theming)).
6. **Icons are inlined at build time** rather than through a runtime plugin.
7. **A progress bar with no `value` now animates.** Upstream renders an empty bar in that case; here it becomes the Windows 98 indeterminate marquee (and omits `aria-valuenow`). Pass `indeterminate={false}` for the old empty-bar behaviour.
8. **The P1 and P2 controls are new, not ported.** `ComboBox`, `Toolbar`, `ToggleButton`, `ToggleGroup`, `ButtonGroup`, `Field`, `Pagination`, the sortable/paged `TableView`, `SpinBox`, `SplitPane`, `Calendar`, `DatePicker`, `BalloonTip`, `PropertySheet`, `Wizard`, `Separator`, `Kbd`, `Badge`, `Avatar`, `Card`, `Heading`, `Text`,
   `Prose`, `Empty` and `Spinner` have no upstream equivalent either; their styling lives in `controls.css` and `widgets.css`, and their state uses the same controllable/uncontrolled convention as the rest of the library.
9. **The layers are new, not ported.** `Dialog`, `MessageBox`, `MenuPopup`, `DropdownMenu`, `ContextMenu`, `Tooltip` and `Popover` have no upstream equivalent. They live on a shared layer engine — portal, z-index stack, focus trap, Escape arbitration, viewport-aware positioning — and their styling sits in the hand-written `overlays.css`, so the generated upstream sheet stays byte-exact.

---

## Development

```bash
cd 98-pink-react
bun install          # or npm install
bun run dev          # http://localhost:5273
```

The demo imports the library straight from `src/`, so component edits hot-reload. The style generator reads `packages/css/` inside this workspace.

`happy-dom` is the only test-only dependency (it powers `bun run test:dom`, and needs Node 20+). The published library still has nothing but `react` / `react-dom` as peers.

---

## License

MIT.

- [98.css](https://github.com/jdan/98.css) — Copyright (c) 2020 Jordan Scales
- [98-pink.css](https://github.com/meorionel/98-pink.css) — pink & blue fork by Meorion
