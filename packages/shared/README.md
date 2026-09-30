# 98-pink-shared

The framework-agnostic core of the 98-pink component libraries.

Both the React and the Vue port are built on this package, which is why it
imports neither `react` nor `vue`:

| Module | What it gives you |
| --- | --- |
| `floating` | `computeFloatingPosition`, `pointToRect` and the `Side` / `Align` / `Rect` types — pure maths, no DOM access beyond the viewport size. |
| `focus` | `getFocusable`, `focusElement`, `tabWrapTarget` — the focusable query and the Tab-wrapping decision. |
| `layers` | `nextLayerZIndex`, `registerLayer`, `unregisterLayer`, `isTopLayer`, `lockBodyScroll`, `LAYER_BASE_Z_INDEX` — the process-wide layer stack. |
| `cx` | The tiny class-name joiner. |

Before the `98-ui` workspace existed, all of this was written out twice and kept
in sync by hand. The layer stack was the worst of it: it is module-level state, so
two copies on one page could disagree about which layer is on top.

## Why it is a real, built package

The ports list it in `dependencies` and keep it in `rollupOptions.external`. One
copy ships, and every layer on the page sees the same stack. It builds to both
ESM (`dist/esm`) and CJS (`dist/cjs`), because the ports publish both formats.

```bash
bun run --filter 98-pink-shared build   # tsc (esm + types) then tsc (cjs)
bun run --filter 98-pink-shared test    # behaviour of the shared core
```

`packages/{react,vue}` define `build:deps`, which builds this package first, so
their own `build`, `typecheck`, `test` and `dev` work standalone.
