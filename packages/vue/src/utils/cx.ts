/**
 * `cx` is framework-agnostic — it lives in `98-pink-shared` so the Vue and the
 * React port cannot drift apart. Re-exported here so every component keeps
 * importing it from `../utils/cx`.
 */
export { cx, type ClassValue } from "98-pink-shared";
