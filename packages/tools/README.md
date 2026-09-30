# @98-ui/tools

Build tooling shared by every package in the `98-ui` workspace. Private — it is
never published.

Both ports used to carry a near-identical copy of each of these scripts. A port
is now described by a few lines in `src/ports.mjs`: its directory, its package
name and the one additive sheet that is genuinely framework-specific.

## `98-generate-styles --port react|vue [--dist]`

Generates a port's stylesheet from `packages/css`.

- Inlines every `svg-load("./icon/*.svg")` in the core sheet — the source is not
  valid CSS on its own.
- Deliberately **skips** `postcss-css-variables`, so every `var(--token)` survives
  and the whole theme stays overridable. The upstream minified dist pre-resolves
  them, which is why the ports cannot simply consume it.
- Mirrors the shared additive sheets into the port's `src/styles/`, so its
  `@import` barrel resolves without reaching across packages.

```
packages/css/style.css + additive/*.css
        |
        v
packages/<port>/src/styles/98-pink.css   (+ mirrored sheets and fonts)
packages/<port>/dist/style.css           (with --dist)
```

## `98-verify-fidelity --port react|vue | --all`

Proves the generated stylesheet is still a *pure transformation* of
`packages/css/style.css`: same selectors, same declarations, same custom
properties, same order — the inlined icons are the only permitted difference. It
also asserts that custom properties were not pre-resolved and that both
`@font-face` rules survived.

A port that silently loses styling fails here, and the three projects can no
longer disagree about what the CSS says.

## Usage

```bash
bun run --filter 98-pink-react generate
bun run --filter 98-pink-vue test:fidelity
bun run --filter 98-pink-react build      # generate + bundle + generate:dist
```
