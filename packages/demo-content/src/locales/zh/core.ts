/**
 * 中文文案（演示站点框架部分）。
 *
 * 行内标记写法与英文版一致：
 *   `code`     -> <code>
 *   **strong** -> <strong>
 *
 * 键名必须与 `en/core.ts` 完全一致，`zh/index.ts` 的类型是 `typeof en`，
 * 少一个或多一个键都会导致编译失败。
 */

export const common = {
	showCode: "显示代码",
	language: "语言",
	english: "English",
	chinese: "中文",
	ok: "确定",
	cancel: "取消",
	yes: "是",
	no: "否",
	firstPage: "第一页",
	previousPage: "上一页",
	nextPage: "下一页",
	lastPage: "最后一页",
	pagination: "分页",
	pageStatus: "第 {page} 页，共 {count} 页",
	apply: "应用",
	back: "上一步",
	next: "下一步",
	finish: "完成",
	close: "关闭",
	increase: "增加",
	decrease: "减少",
	stepOf: "第 {step} 步，共 {count} 步",
	hue: "色相",
};

export const nav = {
	intro: "简介",
	install: "安装",
	components: "组件",
	notes: "说明",
	portingNotes: "移植说明",
	license: "许可",

	// 组件小节
	button: "按钮 Button",
	checkbox: "复选框 Checkbox",
	optionButton: "单选按钮 OptionButton",
	groupBox: "分组框 GroupBox",
	textBox: "文本框 TextBox",
	slider: "滑块 Slider",
	dropdown: "下拉列表 Dropdown",
	titleBar: "标题栏 Title Bar",
	windowContents: "窗口内容",
	interactiveWindow: "交互式窗口",
	statusBar: "状态栏 Status Bar",
	treeView: "树视图 TreeView",
	tabs: "选项卡 Tabs",
	tableView: "表格视图 TableView",
	progressIndicator: "进度指示器 Progress Indicator",
	fieldBorders: "字段边框 Field borders",
	sunkenPanel: "凹陷面板 SunkenPanel",
	misc: "竖分隔条、Link 与 CodeBlock",
	theming: "主题定制 Theming",
	badgeAvatar: "状态标签与头像",
	card: "卡片 Card",
	typography: "排版 Typography",
	empty: "空状态 Empty",
	spinner: "沙漏与进度",
	separator: "Separator 与 Kbd",
	spinBox: "数字微调框 SpinBox",
	datePicker: "日期选择器与日历",
	splitPane: "可拖动分栏 SplitPane",
	balloonTip: "气泡提示 BalloonTip",
	propertySheet: "属性表 PropertySheet",
	wizard: "向导 Wizard",
	comboBox: "组合框 ComboBox",
	toolbar: "工具栏与 ToggleGroup",
	formField: "表单字段 Field",
	menus: "菜单栏与菜单",
	contextMenu: "右键菜单 ContextMenu",
	dialog: "对话框与消息框",
	tooltipPopover: "Tooltip 与 Popover",
};

export const app = {
	subtitle:
		"一套粉蓝配色的 Windows 98 组件库 —— 共 **{count}** 个文档小节，原 CSS 中的每个控件都有对应的带类型组件。",
	introHeading: "简介",

	introA: "是",
	introB: "的类型化组件移植版；而它本身又是",
	introC: "的粉蓝配色分支。样式表原样保留，在其之上为每个控件提供了带类型的组件，也补上了纯 CSS 版本只能交给使用者的交互行为。",

	installHeading: "安装",
	installImportHint: "在应用入口处导入一次样式表即可：",
	installThen: "然后就可以直接使用组件：",

	noteLabel: "注意",
	noteBody:
		"上游样式表是一套全局主题 —— 它会在整个页面范围内作用于 `body`、`button`、`input`、`table`、`pre`、`a` 以及滚动条。这是有意为之，与纯 CSS 版本保持一致。",

	helloTitle: "你好！",
	helloBody: "现在是 1998 年。",
	enablePinkMode: "开启粉色模式",

	componentsHeading: "组件",

	portingNotesHeading: "移植说明",
	notesIntro: "相对纯 CSS 版本发生的变化：",

	note1Title: "类名完全一致。",
	note1Body: "每个组件输出的都是样式表所期望的钩子，因此两者可以在同一个页面中混用。",

	note2Title: "状态交由组件管理。",
	note2Body:
		"选项卡选中、表格行高亮、菜单焦点与窗口控制都改成了 props 与事件，不再需要 `document.querySelectorAll`。",

	note3Title: "无障碍支持更完善。",
	note3Body:
		'选项卡具备 roving tabindex 与 `aria-selected`，菜单栏支持方向键，进度条带有 `role="progressbar"`，每一组 label/input 也都会自动关联到对应的控件。',

	note4Title: "图标已内联。",
	note4Body:
		"构建时会把 `icon/` 下的 22 个 SVG 全部转成 `data:` URI，因此样式表除了两个 Web 字体之外不再有任何资源请求。",

	note5Title: "保留 CSS 变量。",
	note5Body:
		"上游的 `dist` 构建会用 postcss-css-variables 把所有 `var()` 预先解析掉；本移植版保留了它们，这也正是上面的主题定制示例得以实现的原因。",

	note6Title: "额外补充了两点：",
	note6Body:
		"`active`/`focused` 两个按钮 props（原始文档引用了从未定义的 `.active` 与 `.focused` 类），以及为单选按钮和复选框补充的 `:focus-visible` 焦点框。",

	notesTreeIntro: "原项目的目录结构，供参考：",
	treeItem1: "`98-pink.css/style.css` —— 主题的唯一真实来源",
	treeItem2: "`98-pink.css/icon/*.svg` —— 22 个图标，由生成脚本内联",
	treeItem3: "生成脚本 —— 运行与上游相同的 postcss-inline-svg 流程",

	licenseHeading: "许可",
	licenseA: "MIT 协议。基于",
	licenseB: "（作者 Jordan Scales），以及 ",
	licenseC: " 的粉蓝分支。",

	themingP1:
		"由于生成的样式表保留了上游所有的 `var(--…)` 变量而没有被预先解析，整套组件库可以在单个作用域内完成换肤。下面的面板通过在普通 `<div>` 上覆盖这些变量来实现：",
	themingWindowTitle: "运行时换肤",
	themingWindowBody: "同样的组件，不同的变量。",
	codeSamplesNote: "代码示例保持英文 —— 它们描述的是 API，而不是界面文案。",
};
