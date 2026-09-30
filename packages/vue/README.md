# 98-pink-vue

**A Vue 3 component library port of [98-pink.css](https://github.com/meorionel/98-pink.css)** — the pink & blue Windows 98 UI revival, itself a fork of [98.css](https://jdan.github.io/98.css/).

> **This package lives in the `98-ui` bun workspace.** The stylesheet it consumes
> is authored once in `packages/css`, and the floating/focus/layer logic it shares
> with the React port lives in `packages/shared`. See the workspace root `README.md`
> for the layout and the commands. This document covers the Vue port itself.

The upstream stylesheet is carried over **byte-for-byte** (verified by a test, see [Fidelity](#fidelity)). On top of it sits a typed Vue component for every control, plus the interactive behaviour the CSS-only version had to leave to the consumer: tab switching, table row selection, window controls, menu keyboard navigation, drop-down menus, modal dialogs, tooltips and popovers.

```vue
<script setup lang="ts">
import { Window, Button, Checkbox, FieldRow } from "98-pink-vue";
import "98-pink-vue/style.css";
</script>

<template>
  <Window title="Hello!" :width="300" :controls="['close']">
    <p>It is 1998 in here.</p>
    <FieldRow>
      <Checkbox :default-checked="true" label="Enable pink mode" />
    </FieldRow>
    <FieldRow>
      <Button variant="default">OK</Button>
      <Button>Cancel</Button>
    </FieldRow>
  </Window>
</template>
```

---

## Install

```bash
npm install 98-pink-vue
# or
bun add 98-pink-vue
# or
pnpm add 98-pink-vue
```

`vue` (`^3.5.0`) is the only peer dependency. The components generate their ids with Vue's `useId()`, which is available from Vue 3.5 — hence the floor.

Import the stylesheet **once**, anywhere in your entry file:

```ts
import "98-pink-vue/style.css";
```

> **Note** — the upstream stylesheet is a _global theme_: it styles `body`, `button`, `input`, `select`, `textarea`, `table`, `pre`, `a` and the scrollbars page-wide. That is deliberate and matches the CSS-only library. If you need it contained, scope it by importing the file and wrapping your app, or override the CSS variables (see [Theming](#theming)).

---

## Project layout

```
98/
├── 98-pink.css/                 # the original CSS-only project (untouched)
└── 98-pink-vue/                 # this Vue 3 port
    ├── src/
    │   ├── index.ts             # the public API surface
    │   ├── components/          # one .vue file per component (AccessKey.ts is the exception)
    │   ├── styles/
    │   │   ├── 98-pink.css      # GENERATED from packages/css/style.css
    │   │   ├── vue-extras.css   # the few additive rules the port needs
    │   │   ├── overlays.css     # hand-written styling for dialogs & menus
    │   │   ├── controls.css     # hand-written styling for toolbars & fields
    │   │   ├── widgets.css      # spin boxes, calendars, splitters, wizards
    │   │   ├── display.css      # badges, cards, typography, spinners
    │   │   ├── index.css        # imports all six
    │   │   └── fonts/converted/ # the two MS Sans Serif web fonts
    │   └── utils/               # cx, controllable, fieldContext, access-key,
    │                            # layers, focusTrap, dismissable, floating,
    │                            # trigger (cloneTrigger / TriggerHost),
    │                            # Portal.vue, FloatingSurface.vue, css
    ├── demo/                    # documentation + playground app
    │   ├── src/
    │   │   ├── App.vue          # the i18n provider shell
    │   │   ├── DemoPage.vue     # the documentation page
    │   │   ├── Example.vue      # live preview + "Show code"
    │   │   ├── LocaleSwitcher.vue
    │   │   ├── sections/        # one .vue file per group of components
    │   │   └── i18n/            # English + Chinese dictionaries
    │   └── ssr.ts               # SSR entry used by the render checks
    ├── scripts/                 # style generator, fidelity / smoke / DOM / SSR tests
    ├── vite.config.ts           # library build (ESM + CJS, `vue` external)
    ├── vite.demo.config.ts      # the documentation app
    └── vite.ssr.config.ts       # SSR bundle used by `test:demo`
```

---

## Documentation site

The demo in `demo/` covers all 38 documented sections and can be browsed in
**English or 简体中文**. Start it with:

```bash
bun run dev          # http://localhost:5274
```

A `Language` toggle sits at the top of the sidebar, above the navigation tree.

### How the i18n works

It is a small, dependency-free layer — no `vue-i18n`, no build plugin:

- `demo/src/i18n/index.ts` — `createI18n()`, the `I18n` interface, `useI18n()` and the
  `I18N_KEY` injection key; `I18nProvider.vue` provides the translator.
- `demo/src/i18n/T.ts` — the `<T>` component that renders inline markup.
- `demo/src/i18n/locales/{en,zh}/` — the dictionaries, one module per domain.
- `demo/src/i18n/inline.ts` — the inline markup renderer.
- `demo/src/i18n/keys.ts` — `flattenKeys()`, used by the SSR check to spot a
  message that leaked its own key.

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

```vue
<!-- Plain label, resolved with t() -->
<Button>{{ t("common.ok") }}</Button>

<!-- Prose with inline markup, rendered into a <p> -->
<T k="panels.fieldBorders.p1" as="p" />
```

Use `t()` for strings with no markup and `<T>` for everything else; `T` also
accepts `vars` for `{placeholder}` interpolation.

**Translation completeness is enforced by the compiler.** `zh/index.ts` is typed as
`Messages` (= `typeof en`), so a missing or extra key in the Chinese dictionary is a
TypeScript error rather than a silent English fallback. On top of that,
`scripts/ssr-check.mjs` renders the page in both locales and asserts that no message
ever falls back to its own key.

Code samples inside the docs stay in English on purpose — they document the Vue API,
not the UI — and a note on the page says so.

---

## Components

### Form controls

| Component                      | Renders                          | Notes                                                         |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------- |
| `Button`                       | `button`                         | `variant="default"`, `active`, `focused`, `pressed`           |
| `Checkbox`                     | `input[type=checkbox]` + `label` | wires `id`/`for` for you                                      |
| `Radio`                        | `input[type=radio]` + `label`    | group via shared `name`                                       |
| `RadioGroup`                   | several `Radio`s                 | manages `name` + selected value, or takes `options`           |
| `GroupBox`                     | `fieldset` + `legend`            | engraved SVG `border-image`                                   |
| `TextBox`                      | `input` + `label`                | `layout="row" \| "stacked"`, `width`                          |
| `TextArea`                     | `textarea` + `label`             | stacked by default                                            |
| `Select`                       | `select`                         | `options` prop or `<option>` slot                             |
| `Slider`                       | `input[type=range]`              | `vertical`, `boxIndicator`, `length`, `lowLabel`, `highLabel` |
| `ComboBox`                     | input + `role=listbox` popup     | filtering, type-ahead, `selectOnly`, custom `filter`          |
| `Field`                        | label + control + hint + error   | wires id / `aria-describedby` / `aria-invalid` by injection   |
| `FieldRow` / `FieldRowStacked` | `div.field-row(-stacked)`        | the 6px grouping rhythm                                       |
| `FieldLabel`                   | `div.field-row`                  | caption row ("Select one:")                                   |

`Checkbox` and `Radio` render `readonly` when they are given `checked` but nobody
listens for a change. React added that attribute purely to silence its own
controlled-input warning; Vue has no such warning, so the port does not need it for
that reason — it is kept only as a hint for static previews and visual tests. What
actually keeps such a control from moving is that the state has no listener to
update it.

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
| `SplitPane`         | draggable, focusable divider between two panes (`#first` / `#second`)       |
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

`FieldBorder`, `FieldBorderDisabled`, `StatusFieldBorder`, `SunkenPanel`, `VerticalBar`, `Link`, `CodeBlock`, and `AccessKey` —
the Vue component that wraps `renderAccessKey()` so an accelerator can be
underlined straight from a template.

### Deliberately not ported

Everything in the shadcn/ui catalogue is accounted for by now. What follows is
the part of it this library will **not** grow, and why — so that a missing
component reads as a decision rather than an oversight.

The port re-checked every row against the Vue ecosystem instead of inheriting the
table wholesale; none of the verdicts changed. Vue's built-in `<Teleport>` would
make a sheet cheap to build, for instance, but the blocker was never the cost — it
is that a 1998 shell has no slide-out surface, and the same goes for every row
below.

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
| Input OTP       | not a 1998 control; a `TextBox` with `maxlength` is the honest version                          |
| Command         | the equivalent is a "Run" dialog, assembled from `Dialog` + `ComboBox`                          |
| Direction (RTL) | the pixel fonts and box-drawing borders assume a left-to-right shell                            |

Vue-router integration, a toast queue and a data-fetching layer are absent for the
same reason: they are framework plumbing, not Windows 98 controls.

### Menus, dialogs & overlays

Every layer below shares one engine: `FloatingSurface.vue` — a portal into
`document.body`, a monotonic `z-index` stack, outside-click and `Escape` dismissal
(only the topmost layer reacts), a focus trap, and viewport-aware positioning that
flips and shifts. `inline` renders a layer in place instead of teleporting it,
which is what lets the docs and the SSR checks render overlays at all.

| Component        | Renders / does                                                                         |
| ---------------- | -------------------------------------------------------------------------------------- |
| `MenuBar`        | `ul.menu-bar[role=menubar]`; entries that declare `items` open real drop-downs         |
| `MenuPopup`      | the menu surface on its own — keyboard, type-ahead, submenus, check/radio marks        |
| `DropdownMenu`   | any trigger plus a menu under it, with `aria-haspopup` / `aria-expanded` wired for you |
| `ContextMenu`    | right-click menu, plus `Shift`+`F10` and the Menu key from the keyboard                |
| `Dialog`         | modal window: title bar, focus trap, scroll lock, `Escape`, optional backdrop          |
| `MessageBox`     | the Win98 message box: icon, message, `buttons` and a `result` event                   |
| `Tooltip`        | delayed tooltip on hover, immediate on focus, wired through `aria-describedby`         |
| `Popover`        | modeless floating panel — no backdrop, no trap, closes on `Escape` or an outside click |
| `Portal`         | renders a layer into `document.body`; nothing is emitted during SSR                    |
| `FloatingSurface` | the shared layer primitive the overlays above are built on                            |

`MenuEntry` is plain data, so a menu can come from anywhere:

```ts
type MenuEntry =
  | { type?: "item"; label: VNodeChild; onSelect?: () => void; shortcut?: string; accessKey?: string }
  | { type: "separator" }
  | { type: "label"; label: VNodeChild }
  | {
      type: "checkbox";
      label: VNodeChild;
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
    }
  | {
      type: "radio";
      label: VNodeChild;
      value: string;
      checked?: boolean;
      onCheckedChange?: (value: string) => void;
    }
  | { type: "submenu"; label: VNodeChild; items: MenuEntry[] };
```

React's `ReactNode` is Vue's `VNodeChild` throughout — a menu label, a cell value or
a wizard page may be a string, a number or a vnode.

---

## Key examples

### Window with everything

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Window, MenuBar, StatusBar, StatusBarField } from "98-pink-vue";

const open = ref(true);
</script>

<template>
  <Window
    title="A Window With Stuff In It"
    :width="320"
    :controls="['minimize', 'maximize', 'close']"
    @control="(action) => action === 'close' && (open = false)"
  >
    <template #menuBar>
      <MenuBar
        :items="[
          { label: 'File', accessKey: 'F' },
          { label: 'Edit', accessKey: 'E' },
        ]"
      />
    </template>

    <p>There's so much room for activities!</p>

    <template #statusBar>
      <StatusBar>
        <StatusBarField>Press F1 for help</StatusBarField>
        <StatusBarField>CPU Usage: 14%</StatusBarField>
      </StatusBar>
    </template>
  </Window>
</template>
```

Window command buttons can be labelled in any language; the glyph comes from a class, never from the label text:

```vue
<Window
  title="本地化标题栏"
  :controls="['minimize', 'maximize', 'close']"
  :labels="{ minimize: '最小化', maximize: '最大化', close: '关闭' }"
/>
```

### Tabs

The original docs say tabs "should be managed by adding custom javascript code". That bookkeeping now lives in the component — including `aria-selected`, panel visibility and ← / → keyboard navigation.

```vue
<Tabs default-value="desktop">
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

Use `keep-mounted` on `<Tabs>` to hide inactive panels instead of unmounting them,
and `multirows` on `<TabList>` to stretch the tabs evenly. Both `v-model` and the
React-style `:value` / `@value-change` pair work.

### Table view

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TableView } from "98-pink-vue";

const selected = ref<number | string | null>(null);
const columns = [
  { key: "name", header: "Name" },
  { key: "version", header: "Version" },
];
</script>

<template>
  <TableView
    selectable
    :height="140"
    :width="300"
    :selected-key="selected"
    :get-row-key="(row) => row.id"
    :columns="columns"
    :data="drivers"
    @select="(row, key) => (selected = key)"
  />
</template>
```

Row highlighting follows the original docs' script: clicking a body row moves the highlight to it.
`v-model:selected-key` is the shorthand for the same thing.

### Menus

`MenuBar` entries that declare `items` behave like the real thing: clicking opens
the menu, ←/→ keep walking the menu bar while it is open, hovering another
caption switches to it, and submenus fly out to the side.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { MenuBar, type MenuBarItem } from "98-pink-vue";

const showStatusBar = ref(true);
const zoom = ref("100");

const items: MenuBarItem[] = [
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
        checked: showStatusBar.value,
        onCheckedChange: (checked) => (showStatusBar.value = checked),
      },
      { type: "radio", label: "100%", value: "100", checked: zoom.value === "100" },
    ],
  },
];
</script>

<template>
  <MenuBar :items="items" />
</template>
```

`DropdownMenu` and `ContextMenu` reuse the same entries behind any trigger:

```vue
<DropdownMenu :items="items">
  <template #trigger>
    <Button>Options</Button>
  </template>
</DropdownMenu>

<ContextMenu :items="items">
  <SunkenPanel>Right-click me</SunkenPanel>
</ContextMenu>
```

The trigger is a slot, and the component clones it — so an event handler you put on
your own `<Button>` still runs, and its `ref` is preserved.

### Dialogs

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog, MessageBox, Button } from "98-pink-vue";

const open = ref(false);
const confirming = ref(false);
</script>

<template>
  <Dialog v-model:open="open" title="Delete file" :width="320">
    <p>Are you sure you want to send REPORT.DOC to the Recycle Bin?</p>
    <template #footer>
      <Button variant="default" @click="open = false">OK</Button>
      <Button @click="open = false">Cancel</Button>
    </template>
  </Dialog>

  <MessageBox
    v-model:open="confirming"
    title="Confirm file delete"
    icon="warning"
    :buttons="['yes', 'no', 'cancel']"
    default-button="no"
    @result="(result) => console.log(result)"
  >
    Deleting a file moves it to the Recycle Bin. Continue?
  </MessageBox>
</template>
```

### Forms

`Field` owns the label, the hint and the error message; the control inside it
takes the id, `aria-describedby`, `aria-invalid` and `aria-required` from the
injected field context and renders without a caption of its own (unless you
deliberately give it one), so a label is never announced twice.

```vue
<Field
  label="User name"
  description="Letters, digits and underscores only."
  required
  :error="error"
>
  <TextBox :width="200" v-model="userName" />
</Field>

<Field label="Port" error="Choose a port before continuing.">
  <ComboBox :options="ports" :width="140" />
</Field>
```

### Toolbars

```vue
<Toolbar label="Standard">
  <ToolbarButton @click="newFile">New</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton v-model:pressed="bold">Bold</ToolbarButton>
  <DropdownMenu :items="zoomItems">
    <template #trigger>
      <ToolbarButton>Zoom</ToolbarButton>
    </template>
  </DropdownMenu>
  <ToolbarSpacer />
  <ToolbarButton disabled>Help</ToolbarButton>
</Toolbar>

<ToggleGroup label="Alignment" v-model="alignment">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
</ToggleGroup>
```

### Sorting and paging a table

```vue
<TableView
  sortable
  default-sort-key="name"
  :page-size="10"
  :columns="[
    { key: 'name', header: 'Name' },
    // Sort on the byte count while displaying the formatted size.
    { key: 'size', header: 'Size', align: 'right', sortValue: (row) => row.bytes },
  ]"
  :data="files"
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

```vue
<script setup lang="ts">
import { h, ref } from "vue";
import { SpinBox, DatePicker, SplitPane, TreeView, TableView, Wizard } from "98-pink-vue";

const date = ref("1998-06-25");
const open = ref(false);

// A step's `content` is a VNodeChild, so a component reference is wrapped in h().
const steps = [
  { key: "welcome", title: "Welcome", content: h("p", "…") },
  { key: "device", title: "Device", content: h(DevicePicker) },
];
</script>

<template>
  <SpinBox label="Font size" :min="8" :max="72" :default-value="11" />

  <DatePicker v-model="date" label="Installed on" min="1995-08-24" max="1999-12-31" />

  <SplitPane :default-size="140">
    <template #first>
      <TreeView>…</TreeView>
    </template>
    <template #second>
      <TableView :columns="columns" :data="rows" />
    </template>
  </SplitPane>

  <Wizard
    v-model:open="open"
    title="Add Hardware Wizard"
    :steps="steps"
    @finish="install"
  />
</template>
```

`Wizard`, `PropertySheet` and `TableView` also expose scoped slots (`#step`, `#tab`,
`#emptyMessage`) when you would rather write the pages as template markup than as
an array of vnodes.

### Display and text

```vue
<Badge variant="success">Saved</Badge>
<Avatar src="/me.png" alt="Meorion" :size="48" shape="circle" fallback="MO" />

<Card :style="{ width: '280px' }">
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
<ProgressIndicator :width="300" />          <!-- indeterminate: animated -->
```

### Theming

The upstream `dist` build runs `postcss-css-variables`, which flattens every `var()` into a literal colour. This port deliberately **keeps** the custom properties, so the whole library can be rethemed from a single scope:

```vue
<template>
  <div
    :style="{
      '--surface': 'hsl(210 60% 92%)',
      '--button-surface': 'hsl(210 55% 82%)',
      '--border-color': 'hsl(210 70% 25%)',
      '--text-color': 'hsl(210 70% 25%)',
    }"
  >
    <Window title="Rethemed at runtime">…</Window>
  </div>
</template>
```

Available tokens are the upstream `:root` block: `--color-pinkline-50` … `--color-pinkline-500`, `--text-color`, `--surface`, `--border-color`, `--button-surface`, `--button-highlight`, `--button-face`, `--button-shadow`, `--window-frame`, `--dialog-blue`, `--dialog-blue-light`, `--dialog-gray`, `--dialog-gray-light`, `--link-blue`, plus the spacing and border-composition tokens.

---

## Fidelity

The stylesheet in `src/styles/98-pink.css` is **generated**, never hand-edited:

```bash
bun run generate        # packages/css/style.css -> src/styles/98-pink.css + fonts
bun run generate:dist   # also -> dist/style.css
```

`packages/tools` (`98-generate-styles --port vue`) runs the _same_ `postcss-inline-svg` pipeline the upstream project uses, so all 26 `svg-load("./icon/*.svg")` calls become `data:` URIs and the published stylesheet has no icon requests at all (only the two web fonts, copied into `fonts/converted/`).

Five sheets are hand-written and shipped next to it, verbatim:
`vue-extras.css` (the additive rules the port needs, described above),
`overlays.css` (dialogs, menus, tooltips and popovers — layers the CSS-only
project never had), `controls.css` (toolbars, toggle buttons, combo boxes, form
fields, sortable headers and pagers), `widgets.css` (spin boxes, calendars,
date pickers, splitters, balloon tips, property sheets and wizards) and
`display.css` (badges, avatars, cards, typography, empty states, the spinner and
the indeterminate progress marquee). `src/styles/index.css` imports all six, and
`dist/style.css` is the generated upstream sheet with the five additive ones
appended, so a consumer only ever needs a single `import "98-pink-vue/style.css"`.
Because the generator only ever rewrites `98-pink.css`, the
fidelity test keeps comparing that one generated sheet and stays byte-exact.

`bun run test:fidelity` then proves the transformation is lossless: it strips the inlined icons from both files and asserts the results are **character-for-character identical**. A dropped selector, a reordered declaration or an accidentally pre-resolved variable fails the build.

---

## Scripts

| Script                    | What it does                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| `bun run dev`             | Vite dev server for the documentation app (HMR) — http://localhost:5274       |
| `bun run generate`        | `packages/css/style.css` → `src/styles/98-pink.css` + fonts                    |
| `bun run generate:dist`   | Also emit `dist/style.css` + fonts                                            |
| `bun run build`           | Generate CSS → bundle ESM/CJS → emit `.d.ts` → copy `dist/style.css`          |
| `bun run build:demo`      | Production build of the documentation app                                     |
| `bun run build:ssr`       | Build the SSR bundle the demo render check runs against                       |
| `bun run preview`         | Serve the built documentation app                                             |
| `bun run typecheck`       | `vue-tsc` over the library **and** the demo                                   |
| `bun test`               | Fidelity + library smoke tests + DOM interaction tests + demo SSR render      |
| `bun run test:fidelity`   | The stylesheet is a pure transformation of the upstream source                |
| `bun run test:library`    | Server-render every exported component (`@vue/server-renderer`)               |
| `bun run test:dom`        | Drive the overlay layers in a real DOM (click, Escape, focus, Tab)            |
| `bun run test:demo`       | SSR-render the whole docs site in English and Chinese                         |
| `bun run verify`          | `typecheck` + `build` + `test`                                                |
| `bun run format`          | Prettier                                                                      |

`test:library` and `test:dom` import `dist/index.js`, so run `bun run build` first
(`bun test` expects a build, exactly like the React original).

`scripts/check-sfc.mjs` is run by `test:sfc` over every SFC in the package, and can
also be pointed at individual files while writing a component (see
[Development](#development)).

### What the tests cover

- **`packages/tools` (`98-verify-fidelity --port vue`)** — the stylesheet is a pure transformation of the upstream source; custom properties survive; both `@font-face` rules are intact.
- **`scripts/smoke-test.mjs`** — server-renders every exported component and asserts the markup contract the CSS depends on: `input` immediately before its `label`, `field-row` wrappers, `.window-body` nesting, tab ARIA, highlighted rows, clamped progress values, menu roles and states, and so on. It also unit-tests `cx()`, checks that the published stylesheet kept its custom properties and inlined every icon, and guards two invariants that would otherwise render a glyph invisible — the button `text-shadow` trick, which *is* the label, and the progress marquee's trough.
- **`scripts/ssr-check.mjs`** — server-renders the **entire documentation app in both locales** and checks that every section renders, every expected control is present, no message falls back to its own key, the Chinese page actually replaced the English chrome, and _every class emitted actually has a rule in the stylesheet_.
- **`scripts/dom-test.mjs`** — mounts the interactive components in a real DOM (happy-dom) and drives them like a user: click a trigger and the pop-up must be measured and visible **immediately**, arrows walk a menu, `ArrowRight` opens a submenu, `Escape` closes the topmost layer only, outside clicks dismiss, `Dialog` focuses its default button and keeps `Tab` inside, `ContextMenu` opens at the pointer, a `ComboBox` filters as you type and selects with `Enter` (and restores the selected label on `Escape`), toggles flip `aria-pressed`, and a sortable, paged `TableView` reorders its rows, a `SpinBox` clamps what you type, a `Calendar` selects from the keyboard, a `DatePicker` hands the day back to its box, a `SplitPane` divider moves with the arrow keys, and a `Wizard` walks to its last step and finishes. Server rendering executes no effects, so none of this is visible to the checks above — which is exactly how a "menus only appear after scrolling" regression once shipped.

---

## Differences from the CSS-only library

Everything below is additive; the class names and visual result are unchanged.

1. **State lives in Vue.** Tabs, table selection, menu focus and window controls are props/events (`v-model`, `@select`, `@control`) instead of `document.querySelectorAll`.
2. **Accessibility.** Tabs get roving tabindex + `aria-selected`/`aria-controls`; the menu bar supports ←/→/Home/End; progress bars get `role="progressbar"`; every label/input pair is wired automatically.
3. **`Button` gains `active` and `focused` props.** The upstream docs referenced `.active` and `.focused` classes that were _never defined_ in `style.css`; `vue-extras.css` defines them as `.force-active` / `.force-focused` here.
4. **A `:focus-visible` ring** was added for radios and checkboxes.
5. **CSS variables are preserved** rather than pre-resolved (see [Theming](#theming)).
6. **Icons are inlined at build time** rather than through a runtime plugin.
7. **A progress bar with no `value` now animates.** Upstream renders an empty bar in that case; here it becomes the Windows 98 indeterminate marquee (and omits `aria-valuenow`). Pass `:indeterminate="false"` for the old empty-bar behaviour.
8. **The P1 and P2 controls are new, not ported.** `ComboBox`, `Toolbar`, `ToggleButton`, `ToggleGroup`, `ButtonGroup`, `Field`, `Pagination`, the sortable/paged `TableView`, `SpinBox`, `SplitPane`, `Calendar`, `DatePicker`, `BalloonTip`, `PropertySheet`, `Wizard`, `Separator`, `Kbd`, `Badge`, `Avatar`, `Card`, `Heading`, `Text`,
   `Prose`, `Empty` and `Spinner` have no upstream equivalent either; their styling lives in `controls.css` and `widgets.css`, and their state uses the same controllable/uncontrolled convention as the rest of the library.
9. **The layers are new, not ported.** `Dialog`, `MessageBox`, `MenuPopup`, `DropdownMenu`, `ContextMenu`, `Tooltip` and `Popover` have no upstream equivalent. They live on a shared layer engine (`Portal.vue` + `FloatingSurface.vue`: z-index stack, focus trap, Escape arbitration, viewport-aware positioning), and their styling sits in the hand-written `overlays.css`, so the generated upstream sheet stays byte-exact.
10. **`AccessKey` is a component.** React exposed only a `renderAccessKey()` helper; the Vue port keeps the same helper (`renderAccessKey` / `accessKeyParts`) and wraps it in a tiny render-function component, so an underlined accelerator can be written straight into a template.

---

## Vue-specific gotchas

Two framework differences shaped the port; both are worth knowing before you add a
component.

1. **Vue does not append `px` to numeric style values; React does.** React turned
   `style={{ width: 320 }}` into `width:320px`, but in Vue `:style="{ width: 320 }"`
   is an *invalid* CSS value and the browser drops the declaration, silently losing
   the size. Every component that takes a numeric size prop (`width`, `height`,
   `length`, `size`, …) converts it itself through `sizeStyle()` / `cssSize()` in
   `src/utils/css.ts`, and the tests assert the rendered `px` values. When you pass
   a size by hand, write it as a string: `:style="{ width: '280px' }"`.

2. **A vnode that carries a `ref` must be created inside a render function.** Vue
   records the ref's owner at creation time; a vnode built in a `computed` and
   rendered elsewhere loses the ref with a `Missing ref owner context` warning.
   That is why trigger cloning for `DropdownMenu`, `Popover` and `Tooltip` lives in
   the `TriggerHost` component (`src/utils/trigger.ts`) instead of a `computed`, and
   why `cloneTrigger` merges the ref *through* `cloneVNode` rather than assigning
   `vnode.ref` afterwards.

A few smaller ones the port also had to handle:

- **Never create two files whose names differ only in case** — `accessKey.ts` and
  `AccessKey.ts` are the same file on macOS and Windows. The accelerator helper is
  therefore `src/utils/access-key.ts` while the component is
  `src/components/AccessKey.ts`.
- **Vue's `useId()` yields `v-0`, `v-1`, …** rather than React's `:r0:`, so
  anything asserting an id reads it out of the markup instead of hard-coding it.
- **`:class="cx(...)"` with an empty result renders `class=""`** where React omitted
  the attribute. Harmless for the stylesheet, but never assert that a bare component
  has no `class` attribute.
- **There is no `className` prop.** Vue merges a parent's `class` into the
  component's root element itself, so components never declare one.

---

## Development

```bash
cd 98-pink-vue
bun install          # or npm install
bun run dev          # http://localhost:5274
```

The demo resolves `98-pink-vue` to `src/index.ts`, so it imports the library straight
from source and component edits hot-reload. The style generator reads
`packages/css/` inside this workspace.

While a component is still being written, `node scripts/check-sfc.mjs src/components/*.vue`
parses, compiles and styles just the files it is handed — much faster feedback than
`vue-tsc` over the whole project.

`happy-dom` is the only test-only dependency (it powers `bun run test:dom`);
`postcss` + `postcss-inline-svg` drive the style generator and the rest is the
Vite/Vue toolchain. The published library still has nothing but `vue` as a peer.

---

## License

MIT.

- [98.css](https://github.com/jdan/98.css) — Copyright (c) 2020 Jordan Scales
- [98-pink.css](https://github.com/meorionel/98-pink.css) — pink & blue fork by Meorion
