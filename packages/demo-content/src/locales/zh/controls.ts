/**
 * Strings for the control sections — Chinese.
 *
 * Typed as part of `Messages` by `zh/index.ts`, so this file must mirror
 * `en/controls.ts` key for key.
 */

export const controls = {
	comboBox: {
		p1: "`ComboBox` 就是 Windows 98 的组合框：一个文本框加一份下拉列表。输入时按开头字符过滤——原生控件就是这个行为——自由输入的文字会通过 `onInputChange` 报给你。",
		editable: "可编辑组合框",
		selected: "当前值：{value}",
		p2: "传入 `selectOnly` 就变成「下拉列表」样式：框里只显示选中项，输入变成首字母跳转，`Enter` 选中。列表是一个 `listbox`，用 `aria-activedescendant` 和输入框关联，所以焦点始终不会离开文本框。",
		port: "端口",
		showOptions: "显示选项",
		p3: "选项就是普通数据——`value`、`label`，以及可选的 `text`（当 `label` 不是纯字符串时，它就是显示到框里的文字）。自定义 `filter` 可以替换前缀匹配，`emptyMessage` 用于没有匹配项时占位。",
	},
	toolbar: {
		p1: "`Toolbar` 就是常用工具栏：平时扁平、指针移上去才出现边框的按钮、分隔条、弹性空隙，以及 `ToolbarButton`——给它 `pressed` 之前它是普通命令按钮，给了就变成切换按钮。",
		windowTitle: "带工具栏的窗口",
		label: "标准",
		new: "新建",
		open: "打开",
		bold: "加粗",
		italic: "倾斜",
		zoom: "缩放",
		zoom100: "100%",
		zoom200: "200%",
		help: "帮助",
		nothing: "还没有执行命令",
		lastCommand: "最后执行的命令：{value}",
		p2: "`ToggleGroup` 让若干 `ToggleGroupItem` 共用一份选择——`type` 决定它像单选还是像复选。`ButtonGroup` 则是给一排命令按钮用的纯布局辅助组件。",
		alignment: "对齐",
		left: "左对齐",
		center: "居中",
		right: "右对齐",
	},
	field: {
		p1: "`Field` 负责标签、提示和错误信息。里面的控件通过 context 拿到 id、`aria-describedby`、`aria-invalid` 和 `aria-required`，并且不再渲染自己的标签，所以读屏不会重复播报。有了它，接表单库就是顺手的事。",
		userName: "用户名",
		userHint: "只能使用字母、数字和下划线。",
		required: "用户名不能为空。",
		p2: "任何控件都能放进 field。`Select`、`TextArea` 和 `ComboBox` 都会继承同一套接线，包括出错时的红色描边。",
		port: "端口",
		portError: "请先选择端口再继续。",
		protocol: "协议",
	},
};
