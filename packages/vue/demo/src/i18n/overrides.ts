import type { DeepPartial, Messages } from "@98-ui/demo-content";

/**
 * The only prose the Vue demo owns.
 *
 * Everything else is in `@98-ui/demo-content`; these are the sentences that name
 * the framework, plus the one porting note that exists only on this side.
 * `satisfies` means a typo in a key is a type error, and `@98-ui/demo-content`'s
 * own test fails if a key here disappears from the base.
 */
export const overrides = {
	en: {
		app: {
			subtitle:
				"A pink & blue Windows 98 component library for Vue 3 — **{count}** documented sections, every control from the original CSS ported to a typed component.",
			introA: "is the Vue 3 port of ",
			note2Title: "State moved into Vue.",
			treeItem3:
				"`98-pink-vue/scripts/generate-styles.mjs` — runs the same postcss-inline-svg pipeline",
		},
	},
	zh: {
		app: {
			subtitle:
				"一套粉蓝配色的 Windows 98 Vue 3 组件库 —— 共 **{count}** 个文档小节，原 CSS 中的每个控件都有对应的带类型组件。",
			introB: "的 Vue 3 移植版；而它本身又是",
			introC:
				"的粉蓝配色分支。样式表原样保留，在其之上为每个控件提供了带类型的 Vue 组件，也补上了纯 CSS 版本只能交给使用者的交互行为。",
			note2Title: "状态交由 Vue 管理。",
			treeItem3: "`98-pink-vue/scripts/generate-styles.mjs` —— 运行与上游相同的 postcss-inline-svg 流程",
		},
	},
} satisfies Record<"en" | "zh", DeepPartial<Messages>>;
