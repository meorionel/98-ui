import { baseEn, baseZh, withOverrides, type Messages } from "@98-ui/demo-content";
import { overrides } from "./overrides";

/**
 * The demo's dictionaries: the shared tables with this port's wording on top.
 *
 * `zh` is typed against the English schema in `@98-ui/demo-content`, so a key
 * added there must be translated here and in the React port in the same commit.
 */
export const en: Messages = withOverrides(baseEn, overrides.en);
export const zh: Messages = withOverrides(baseZh, overrides.zh);
