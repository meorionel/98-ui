# Porting 98-pink-react to 98-pink-vue

This document is the contract every file in this repository follows. It exists so
that the Vue port stays mechanically recognisable next to its React original:
same class names, same DOM structure, same ARIA wiring, same public API surface —
only the framework idioms change.

The React original lives next door at `../98-pink-react`. **Always read the React
source of a component before porting it.** The comments in it explain *why* a
rule exists; keep that reasoning, translated to Vue.

---

## 1. File layout

```
src/
  components/<Name>.vue     one file per React component file (a file may export several)
  utils/*.ts                framework-agnostic helpers and composables
  utils/*.vue               the two shared layer components (Portal, FloatingSurface)
  styles/                   additive CSS, copied verbatim from the React port
  index.ts                  public surface, mirrors src/index.ts of the React port
demo/                       documentation app (Vue), mirrors the React demo
scripts/                    generation + verification scripts
```

A React file that exports several components (`Window` + `WindowBody`,
`Dialog` + `MessageBox`, `Card` + `CardHeader` + …, `Panel` + the four panel
helpers) becomes **one `.vue` file per component**. `src/components/Window.vue`
exports `Window`, `src/components/WindowBody.vue` exports `WindowBody`.

## 2. Anatomy of a component

```vue
<script lang="ts">
// Plain <script> block: types only. Everything that must be importable by
// consumers (props interfaces, unions, label tables) is exported here.
export interface ButtonProps {
	/** Props the component actually reads. */
	variant?: "normal" | "default" | "toolbar";
	active?: boolean;
	focused?: boolean;
	pressed?: boolean;
	type?: "button" | "submit" | "reset";
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import { cx } from "../utils/cx";

defineOptions({ name: "Button" });

const props = withDefaults(defineProps<ButtonProps>(), {
	variant: "normal",
	active: false,
	focused: false,
	type: "button",
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
	<button
		:type="type"
		:aria-pressed="pressed"
		:class="
			cx(
				variant === 'default' && 'default',
				variant === 'toolbar' && 'toolbar-button',
				(active || pressed === true) && 'force-active',
				focused && 'force-focused',
			)
		"
	>
		<slot />
	</button>
</template>
```

Hard rules:

1. **Types live in the plain `<script lang="ts">` block; logic lives in
   `<script setup lang="ts">`.** `export` is illegal inside `<script setup>`.
   Give every component `defineOptions({ name: "Name" })`.
2. **Declare only the props the component reads.** Everything else (`id`,
   `style`, `data-*`, `aria-*`, `disabled`, extra event listeners, …) reaches the
   root element through Vue's attribute fallthrough, exactly like React's
   `...rest`. Never declare a prop just to forward it.
3. **Never add `className` to a `:class` binding.** Vue already merges the
   parent's `class` into the root element. React's
   `cx("window", className)` becomes `class="window"` in the template.
4. **Static classes are literals in the same order as the React source**, so the
   rendered attribute is byte-identical:
   `<div class="window dialog property-sheet">`, not a computed join. Use
   `:class="cx(...)"` only for the conditional part.
5. **Multiple root nodes need care.** Vue cannot apply fallthrough attributes to
   a fragment. When the React component returned a fragment, add
   `defineOptions({ inheritAttrs: false })`, capture `const attrs = useAttrs()`,
   and `v-bind="$attrs"` on the element React put the props on. Never wrap in an
   extra `<div>` to dodge this: the markup is part of the contract.
6. **`forwardRef` becomes `$el`.** A Vue component instance exposes its root
   element as `$el`; where the React component needed an explicit handle
   (`input`, `textarea`), also `defineExpose({ el: inputRef })`.
7. **`useId()` replaces React's `useId()`** for generated ids. Do not use
   counters or `Math.random()`: SSR and hydration must agree.
8. Keep every comment, JSDoc block and example from the React source, adjusted to
   Vue syntax. They are the documentation.

## 3. Props ↔ slots ↔ events

| React                                                  | Vue                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| `children`                                             | default slot                                                   |
| `X: ReactNode` (structural: `trigger`, `footer`, `icon`, `first`, `second`, `content`, `anchor`, `menuBar`, `statusBar`, `label`, `title`, `description`, `empty`, …) | slot named `X`; when the React prop is normally a plain string, also accept a `X?: string` prop used as the slot's fallback |
| `X: string` / `X: number` / `X: boolean`               | prop of the same name                                          |
| `className`                                            | no prop — plain `class` fallthrough                            |
| `style`                                                | no prop — plain `style` fallthrough                            |
| `onX` handler prop                                     | `defineEmits` entry `emit("x-kebab", …)`                       |

`emit("value-change")` is matched by a listener written either as
`@value-change` or as React's `:on-value-change` / `onValueChange`, because Vue
camelizes the event name when it looks the handler up. That is deliberate: the
React-style prop name keeps working.

### 3.1 Controllable state

React's `useControllableState` is ported 1:1 to `useControllableState`
(`src/utils/controllable.ts`), which takes getters:

```ts
export function useControllableState<T>(options: {
	value: () => T | undefined;
	defaultValue: T;
	onChange?: (value: T) => void;
}): [ComputedRef<T>, (next: T | ((prev: T) => T)) => void];
```

For a state whose React prop is `NAME` (a prop name that is **not**
`modelValue`), a component exposes:

* `NAME?: T` — controlled (same name as React),
* `defaultNAME: T` — uncontrolled (same name as React),
* prop `modelValue?: T` **only** when `NAME` is the component's primary value
  (`value`, `checked`). `modelValue` wins over `NAME` when both are given, so
  plain `v-model` works as well as `v-model:value` / the React-style `:value`.
* emits `update:NAME` (so `v-model:NAME` works) **and** `NAME-change`
  (so React's `onNameChange` works); plus `update:modelValue` for a primary
  value.

```ts
const [current, setCurrent] = useControllableState<string>({
	value: () => props.modelValue ?? props.value,
	defaultValue: props.defaultValue ?? "",
	onChange: (next) => {
		emit("update:modelValue", next);
		emit("update:value", next);
		emit("value-change", next);
	},
});
```

A state that React documented as "controlled only" (`open` on `Tooltip` when
passed, …) keeps exactly the same precedence rules as the React code.

### 3.2 Trigger props

`DropdownMenu`, `Popover` and `Tooltip` take a trigger **element** in React and
clone it (`cloneTrigger`). The Vue port does the same with
`cloneTrigger` from `src/utils/trigger.ts`, which is `cloneElement`'s
counterpart: it merges props through `mergeProps` (so the caller's own event
handlers run first and their `ref` is preserved) and resolves the DOM element
behind a component instance.

The trigger is a slot, and the cloned node is rendered with `RenderVNode`:

```vue
<script setup lang="ts">
import { cloneTrigger, firstVNode, RenderVNode } from "../utils/trigger";

const slots = defineSlots<{ trigger?: () => unknown }>();
const triggerEl = ref<HTMLElement | null>(null);
const triggerNode = computed(() =>
	cloneTrigger(firstVNode(slots.trigger?.()), { "aria-expanded": isOpen.value }, (el) => {
		triggerEl.value = el;
	}),
);
</script>

<template>
	<RenderVNode :vnode="triggerNode" />
	<FloatingSurface :open="isOpen" :anchor="triggerEl">…</FloatingSurface>
</template>
```

The anchor is passed as an **element** (`:anchor="triggerEl"`), not a ref object.

### 3.3 Overlays

Every floating layer is built on `FloatingSurface.vue`, the port of React's
`FloatingSurface`. It owns the teleport, the position, the layer `z-index`,
Escape/outside-press dismissal and focus movement. Read
`src/utils/FloatingSurface.vue` before porting any overlay, and use it exactly
the way the React component used `FloatingSurface`.

Modal surfaces (`Dialog`, `PropertySheet`, `Wizard`, `MessageBox`) additionally
use `lockBodyScroll()` from `src/utils/layers.ts`.

`inline` renders the layer in place instead of teleporting it — documentation
and tests depend on it, because a teleported node does not exist during SSR.

## 4. Style

The `src/styles/*.css` files are framework-agnostic and are copied from the React
port (`react-extras.css` is renamed `vue-extras.css`). **Do not edit them** unless
the React original changed. Class names, DOM structure and ARIA attributes are
the contract the stylesheet relies on; a port that renames a class breaks the
look without breaking a type check.

## 5. Verification

```bash
npm run typecheck     # vue-tsc over src and demo
npm run build         # styles + library bundle + .d.ts
npm run build:demo    # documentation app
npm test              # fidelity + library SSR smoke + happy-dom + demo SSR
```

`scripts/smoke-test.mjs` renders every exported component through
`@vue/server-renderer` and asserts the class names and structure the stylesheet
depends on. `scripts/dom-test.mjs` drives the overlays in a real DOM
(happy-dom). Both are ports of the React originals and must keep the same
coverage.

## 6. Vue-specific gotchas (learned the hard way)

* **Vue does not append `px` to numeric style values; React does.** React turned
  `style={{ width: 320 }}` into `width:320px`. In Vue, `:style="{ width: 320 }"`
  is an *invalid* CSS value and the browser drops it. Every component that takes
  a numeric size prop (`width`, `height`, `length`, `size`, …) must convert it
  itself: `:style="typeof width === 'number' ? { width: `${width}px` } : { width }"`.
  The tests assert the rendered `px` values.
* **Never create two files whose names differ only in case** — `accessKey.ts` and
  `AccessKey.ts` are the same file on macOS and Windows. The accelerator helper
  is therefore `utils/access-key.ts` while the component is
  `components/AccessKey.ts`.
* **A vnode that carries a `ref` must be created inside a render function.**
  Vue records the ref's owner at creation time and otherwise drops it with a
  `Missing ref owner context` warning. That is why trigger cloning lives in the
  `TriggerHost` component instead of a `computed`.
* **`cloneTrigger` merges the ref through `cloneVNode`** (`mergeRef = true`).
  Assigning `vnode.ref = fn` afterwards produces a ref Vue cannot resolve.
* **Vue's SSR wraps slot content in `<!--[-->` … `<!--]-->` fragment markers.**
  Assertions must not span a slot boundary; assert on the inner fragment or use
  two separate `includes` checks.
* **`:class="cx(...)"` with an empty result renders `class=""`.** React omitted
  the attribute. Harmless for the stylesheet, but do not write an assertion that
  a bare component has no `class` attribute.
* **Never pass a DOM node to `assert.equal`** in the tests: Node inspects the
  value to build its failure message, and a circular DOM graph can take the whole
  process down. Compare `textContent`, attributes, or booleans.
* **happy-dom keeps timers alive**: `scripts/dom-test.mjs` ends with an explicit
  `process.exit()`.
* Vue's `useId()` yields `v-0`, `v-1`, … rather than React's `:r0:`. Anything
  asserting an id must read it out of the markup rather than hard-code it.

## 7. Frozen internal interfaces

These modules are the shared foundation; every component is built on them
exactly as written. Read the files for the full types, and change them only when
every consumer is updated in the same commit.

| Module                              | What it gives you |
| ----------------------------------- | ----------------- |
| `utils/cx`                          | `cx(...values): string \| undefined` |
| `utils/controllable`                | `useControllableState<T>({ value, defaultValue, onChange })` → `[ComputedRef<T>, setValue]` |
| `utils/fieldContext`                | `FIELD_CONTEXT` injection key + `useField(): ComputedRef<FieldContextValue> \| null` |
| `utils/access-key`                  | `accessKeyParts(label, key)`, `renderAccessKey(label, key): VNodeChild[]` |
| `components/AccessKey.ts`           | `<AccessKey label="File" access-key="F" />` |
| `utils/layers`                      | `useLayerZIndex(active, fixed?)`, `lockBodyScroll()`, `isTopLayer(z)` |
| `utils/focusTrap`                   | `useFocusTrap({ target, active, wrap?, initialFocus?, restoreFocus?, layer? })`, `getFocusable`, `focusElement` |
| `utils/dismissable`                 | `useDismissable({ enabled, onDismiss, refs, layer, escape?, outsidePointerDown? })` — all but `onDismiss` are getters |
| `utils/floating`                    | `computeFloatingPosition(...)`, `useFloating({ open, floatingRef, anchor, point, side, align, offset, matchAnchorWidth })` → `{ style, side }` |
| `utils/trigger`                     | `cloneTrigger`, `firstVNode`, `TriggerHost`, `refToElement`, `RenderVNode` |
| `utils/Portal.vue`                  | `<Portal :to="container" :disabled="inline">` |
| `utils/FloatingSurface.vue`         | `<FloatingSurface :open :anchor :point :side :align :offset :match-anchor-width :ignore :surface-class :surface-style :role :label :id :auto-focus :initial-focus :trap-focus :restore-focus :z-index :inline :container :close-on-escape :close-on-outside-pointer-down @dismiss>` with a default slot; parent `class`/`style`/attrs land on the surface element |

`useFloating` / `useFocusTrap` / `useDismissable` / `useLayerZIndex` take plain
values *or* getters; pass getters (`() => props.open`) so they stay reactive.
`FloatingSurface`'s anchor is an **element**, not a ref object.

### 7.1 Interfaces owned by sibling components

* `Tabs.vue` — props `value?`, `defaultValue?`, `keepMounted?`; emits
  `update:value`, `value-change`, `change`; default slot. `TabList.vue` — props
  `label?`, `multirows?`. `Tab.vue` — props `value: string`, `disabled?`.
  `TabPanel.vue` — props `value: string`, `body?` (default true), `variant?`
  (`"window" \| "flat"`). The shared injection key lives in
  `Tabs.vue`'s plain `<script>` block (`TABS_CONTEXT`, `useTabsContext()`).
* `Dialog.vue` — props `open?`, `defaultOpen?`, `title?`, `label?`, `controls?`
  (default `["close"]`), `labels?`, `overlay?` (true), `closeOnOverlayClick?`
  (false), `closeOnEscape?` (true), `modal?` (true), `width?`, `inline?`,
  `container?`; emits `update:open`, `open-change`, `control`; slots `default`,
  `footer`, `title`; static classes `window dialog`.
* `MenuPopup.vue` — props `open`, `items`, `anchor?`, `point?`, `side?`,
  `align?`, `offset?`, `label?`, `inline?`, `container?`, `depth?`; emits
  `dismiss`, `select`, `navigate-sibling`. `MenuBar.vue` / `DropdownMenu.vue` /
  `ContextMenu.vue` are its three front ends.

`src/index.ts` is the authoritative public surface; if this table and that file
disagree, the file wins.

## 8. Pitfalls the React port already paid for

* `input` must stay *immediately* before its `label` — the stylesheet uses
  `input + label`.
* A menu bar must be rendered *inside* `.window-body`.
* A closed overlay renders nothing at all (not an empty element, not
  `visibility: hidden`), so `document.body.querySelector(".menu-popup")` is a
  valid "is it open" probe.
* Only the topmost layer reacts to Escape (`isTopLayer`).
* Never emit the literal strings `undefined`, `NaN` or `[object Object]` into
  markup: `ssr-check.mjs` fails on all three.
