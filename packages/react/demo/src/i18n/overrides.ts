import type { DeepPartial, Messages } from "@98-ui/demo-content";

/**
 * The only prose the React demo owns.
 *
 * Everything else is in `@98-ui/demo-content`; these are the sentences that name
 * the framework, plus the two porting notes that describe React-specific
 * behaviour. `satisfies` means a typo in a key is a type error, and
 * `@98-ui/demo-content`'s own test fails if a key here disappears from the base.
 */
export const overrides = {
	en: {
		app: {
			subtitle:
				"A pink & blue Windows 98 component library for React — **{count}** documented sections, every control from the original CSS ported to a typed component.",
			introA: "is the React port of ",
			note2Title: "State moved into React.",
			note2Body:
				"Tab selection, table row highlighting, menu focus and window controls are props and callbacks instead of `document.querySelectorAll`.",
			note3Body:
				'Tabs get roving tabindex and `aria-selected`, the menu bar supports arrow keys, progress bars get `role="progressbar"`, and every label/input pair is wired with `htmlFor`.',
			treeItem3:
				"`98-pink-react/scripts/generate-styles.mjs` — runs the same postcss-inline-svg pipeline",
		},
		windows: {
			interactive: {
				p1: "Because this is React, the window chrome is driven by state. The window below actually closes, maximizes and restores:",
			},
		},
	},
	zh: {
		app: {
			subtitle:
				"一套粉蓝配色的 Windows 98 React 组件库 —— 共 **{count}** 个文档小节，原 CSS 中的每个控件都有对应的带类型组件。",
			introB: "的 React 移植版；而它本身又是",
			introC:
				"的粉蓝配色分支。样式表原样保留，在其之上为每个控件提供了带类型的 React 组件，也补上了纯 CSS 版本只能交给使用者的交互行为。",
			note2Title: "状态交由 React 管理。",
			note2Body:
				"选项卡选中、表格行高亮、菜单焦点与窗口控制都改成了 props 与回调，不再需要 `document.querySelectorAll`。",
			note3Body:
				'选项卡具备 roving tabindex 与 `aria-selected`，菜单栏支持方向键，进度条带有 `role="progressbar"`，每一组 label/input 也都会自动关联 `htmlFor`。',
			treeItem3: "`98-pink-react/scripts/generate-styles.mjs` —— 运行与上游相同的 postcss-inline-svg 流程",
		},
		windows: {
			interactive: {
				p1: "因为这是 React，窗口边框完全由状态驱动。下面的窗口会真正地关闭、最大化和还原：",
			},
		},
	},
} satisfies Record<"en" | "zh", DeepPartial<Messages>>;
