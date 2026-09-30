# @98-ui/demo-content

Everything the two documentation apps say. Private — never published. It imports
neither React nor Vue; it is data plus a few pure helpers.

## Why it exists

The React and the Vue demo carried 1459 lines of message tables each. Ten of the
twelve files were byte-identical; the only differences were seven sentences that
mention the framework by name, plus two porting notes that describe
framework-specific behaviour.

The tables now live here once. Each port keeps a small
`demo/src/i18n/overrides.ts` with just those sentences, and the rest is shared.

```ts
// packages/demo-content/src/locales/en/index.ts   <- the schema of record
// packages/react/demo/src/i18n/locales.ts
import { baseEn, withOverrides } from "@98-ui/demo-content";
import { overrides } from "./overrides";

export const en = withOverrides(baseEn, overrides.en);
```

`overrides` is `satisfies Record<"en" | "zh", DeepPartial<Messages>>`, so a typo
in a key is a type error rather than a string that silently falls back to its own
key at runtime.

## What it exports

| Export | What it is |
| --- | --- |
| `baseEn`, `baseZh` | The framework-neutral dictionaries, 469 keys each. |
| `Messages`, `MessageKey`, `MessageVars`, `Locale` | The key schema. `MessageKey` is every valid dotted path. |
| `withOverrides(base, overrides)` | Deep merge; never mutates `base`, returns it untouched when there is nothing to override. |
| `lookup`, `interpolate`, `translate` | Dotted-path lookup, `{name}` substitution, and both together. |
| `LOCALES` | The language choices the switcher renders. |
| `detectLocale`, `readStoredLocale`, `applyLocaleToDocument` | The stored-choice → browser-language → default cascade, and keeping `<html lang>` in sync. |
| `flattenKeys` | Every dotted leaf path — used by the SSR leak detection. |

## Checks

```bash
bun run --filter @98-ui/demo-content test
```

Runs under Bun, because the tables are extensionless TypeScript imports. The
checks keep the two dictionaries honest in the ways the type system cannot: equal
key sets, no empty message, matching `{placeholder}` sets per key, and that an
override wins without disturbing its siblings.
