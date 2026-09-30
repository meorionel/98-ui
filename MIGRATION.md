# Migration record

The three original projects are **untouched** and still at their original paths:

```
98/
├── 98-pink.css        unchanged
├── 98-pink-react      unchanged
├── 98-pink-vue        unchanged
└── 98-ui              the new workspace
```

Nothing was moved or deleted; `98-ui` was built from copies. The two can be
compared side by side, and the originals can be archived or removed once the
workspace has been published from.

## What went where

| From | To |
| --- | --- |
| `98-pink.css/style.css` | `packages/css/style.css` |
| `98-pink.css/{icon,fonts,docs,build.js,server.js,now.json}` | `packages/css/` (same names) |
| `98-pink-react/src/styles/{overlays,controls,widgets,display}.css` | `packages/css/additive/` |
| `98-pink-react/src/styles/react-extras.css` | `packages/react/src/styles/react-extras.css` (authored; kept) |
| `98-pink-vue/src/styles/vue-extras.css` | `packages/vue/src/styles/vue-extras.css` (authored; kept) |
| `98-pink-react/scripts/generate-styles.mjs` | `packages/tools/src/generate-styles.mjs` |
| `98-pink-vue/scripts/generate-styles.mjs` | *deleted — same file, parameterised by `--port`* |
| `98-pink-react/scripts/verify-fidelity.mjs` | `packages/tools/src/verify-fidelity.mjs` |
| `98-pink-vue/scripts/verify-fidelity.mjs` | *deleted — same file, parameterised by `--port`* |
| React/Vue `utils/{cx,floating,focusTrap,layers}` logic | `packages/shared/src/` |
| React/Vue `demo/src/i18n/locales/**` + `keys.ts` | `packages/demo-content/src/` |
| `98-pink-react/*`, `98-pink-vue/*` (rest) | `packages/react/`, `packages/vue/` (same shape) |

## What was actually duplicated

Measured on the originals before the migration:

| Thing | Copies | Now |
| --- | --- | --- |
| Additive component CSS (`overlays`, `controls`, `widgets`, `display`) | 2 (react, vue), byte-identical apart from a banner line | 1, in `packages/css/additive` |
| Generated core stylesheet | 2, plus the upstream `style.css` | generated from 1 source, guarded by the fidelity check |
| Demo message tables | 2 × 1459 lines, 10 of 12 files byte-identical, 469 keys | 1 table + 7 override keys per port |
| `flattenKeys`, `lookup`, `interpolate`, `detectLocale`, `LOCALES`, key types | 2 | 1, in `packages/demo-content` |
| `cx` | 2 (identical but for a doc comment) | 1 |
| `computeFloatingPosition` + `pointToRect` + its types | 2, byte-identical | 1 |
| `FOCUSABLE_SELECTOR`, `getFocusable`, `focusElement`, Tab-wrap logic | 2, byte-identical | 1 |
| Layer stack (`nextLayerZIndex`, `registerLayer`, `isTopLayer`, `lockBodyScroll`) | 2, byte-identical | 1 |
| Stylesheet generation + fidelity check | 2 | 1, in `packages/tools` |

The layer stack was the most valuable of these: it is process-wide state, so two
copies on one page could disagree about which layer is on top.

## Deliberate deviations from the originals

1. **`98-pink.css` now publishes the additive sheets.** Previously `toolbar`,
   `card`, `badge`, `avatar`, `pagination`, `spin-box`, `popover` and `tooltip`
   existed only inside the React and Vue ports — CSS-only consumers could not use
   them. `dist/98-pink.full.css` fixes that. The legacy `dist/98-pink.css` is
   unchanged, so existing CDN consumers are unaffected. Version bumped to `0.2.0`.
2. **Two new packages.** `98-pink-shared` is a real, published dependency of both
   ports (dual ESM + CJS). `@98-ui/demo-content` and `@98-ui/tools` are private.
3. **`scripts/check-sfc.mjs` in the Vue port** now compiles every SFC in the
   package when given no arguments, and is wired into `test` as `test:sfc`. It
   was previously a manual helper — it is a real check, and all 99 SFCs pass.
4. **Banner text** in the generated stylesheets and the additive sheets now names
   the workspace (`packages/css`, `packages/tools`) instead of the old per-port
   script paths. The demo prose that quoted the old path — the one React key that
   read `` `98-pink-react/scripts/generate-styles.mjs` `` — is preserved verbatim
   through the per-port override, so no rendered copy changed.
5. **`bunfig.toml` sets `linker = "hoisted"`.** Bun's default isolated linker
   gives each package its own `node_modules`; the ports were written against a
   single hoisted tree, and it is also what lets React stay on Vite 5 while Vue
   is on Vite 7 without either noticing the other.
6. **Shared demo prose was neutralised.** The base dictionary in
   `packages/demo-content` says "a component library" where the React original
   said "for React"; each port overrides the sentence back to its exact original
   wording. The rendered text is byte-identical — see verification below.

## Verification

Run against the migrated workspace:

| Check | Result |
| --- | --- |
| `98-pink.css` build (3 flavours + docs + fonts) | 6/6 |
| `98-pink-shared` ESM + CJS + behaviour | 10/10 |
| `@98-ui/demo-content` key parity, placeholders, overrides | 8/8 |
| `98-pink-react` CSS fidelity | 6/6 |
| `98-pink-react` library / DOM / demo-SSR suites | 66 / 34 / 25 |
| `98-pink-vue` CSS fidelity | 6/6 |
| `98-pink-vue` SFC compile | 99 SFCs |
| `98-pink-vue` library / DOM / demo-SSR suites | 55 / 34 / 26 |
| `tsc` / `vue-tsc` across all packages | clean |

And, one-off, against the originals:

- The generated `packages/react/src/styles/98-pink.css` is **byte-identical** to
  `98-pink-react/src/styles/98-pink.css` apart from the banner.
- The four additive sheets are **byte-identical** in body to both ports' copies.
- All four rebuilt dictionaries (`react`/`vue` × `en`/`zh`, 469 keys each) are
  **key-for-key and value-for-value identical** to the originals.

## Known follow-ups

- **Vite majors still differ** between the ports (React 5 / Vue 7). They were
  left alone to keep this migration behaviour-preserving. Unifying them means
  moving React to `@vitejs/plugin-react` v5 + Vite 7, and should be its own
  change.
- **`packages/*/scripts/{smoke-test,dom-test,ssr-check}.mjs` are still ports of
  each other.** They assert per-framework markup, so they genuinely differ in
  places — but the shared parts (the demo section list, the class-name inventory)
  could move next.
- **`packages/demo-content` runs under Bun**, because its tables are
  extensionless TypeScript imports. If it should ever run under plain Node, the
  locale barrels need explicit `.js` extensions.
- **Bun's package cache** was pointed at `.tmp/bun-cache` in this environment
  because the sandbox blocked writes to the default global cache. That directory
  is gitignored; a normal checkout uses `~/.bun/install/cache`.
