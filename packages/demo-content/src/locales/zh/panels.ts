/**
 * 面板与边框小节（中文）。
 * 写法与 `en/panels.ts` 一致：`code`、**strong**、*em*、[链接](url)。
 */

export const panels = {
	fieldBorders: {
		quote: "文本框、复选框、下拉列表、微调框和列表框都使用 *字段边框样式*。状态字段使用 *状态字段边框样式*，它只使用凹陷的外层基础边框。",
		quoteSource: "—— Microsoft Windows User Experience 第 421、422 页",
		p1: "这些边框在表单控件之外同样有用 —— 比如用作工作区或动态内容区域。这三个辅助组件只定义边框与背景，因此你需要自己补充内边距。",
		workArea: "工作区",
		disabledWorkArea: "已禁用的工作区",
		dynamicContent: "动态内容",
	},

	sunkenPanel: {
		p1: "`SunkenPanel` 就是表格视图中那个可滚动的凹陷容器：2px 的凹槽边框加上 `overflow: auto`。",
		sample: "敏捷的棕色狐狸跃过懒狗。敏捷的棕色狐狸跃过懒狗。敏捷的棕色狐狸跃过懒狗。敏捷的棕色狐狸跃过懒狗。敏捷的棕色狐狸跃过懒狗。敏捷的棕色狐狸跃过懒狗。",
	},

	misc: {
		p1: "剩下的零碎组件：工具栏用的 `VerticalBar` 分隔条、带样式的 `Link`，以及用于预格式化文本的 `CodeBlock`。",
		toolbarItem: "工具栏项目",
		anotherItem: "另一个项目",
		links: "可以阅读[原项目](https://github.com/jdan/98.css)，或者 [GitHub](https://github.com/meorionel/98-pink.css) 上的粉蓝分支。",
	},
};
