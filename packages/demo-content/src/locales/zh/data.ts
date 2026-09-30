/**
 * 数据展示小节（中文）：TreeView、Tabs、TableView 与 ProgressIndicator。
 * 写法与 `en/data.ts` 一致：`code`、**strong**、*em*、[链接](url)。
 */

export const data = {
	treeView: {
		quote: "所谓*树视图控件*，是一种特殊的列表框控件：它按照对象之间逻辑上的层次关系，把这些对象以缩进大纲的形式显示出来。",
		quoteSource: "—— Microsoft Windows User Experience 第 178 页",
		weCanPut: "我们可以把",
		whatever: "✨ 随便什么 ✨",
		weWantInHere: "想要的东西都放进来",
		branchNote:
			"`TreeViewBranch` 会把嵌套列表包进原生的 `<details>`，`+`/`-` 标记就是这么来的。展开状态可以用 `open`/`onOpenChange` 控制。",
		tableOfContents: "目录",
		whatIsWebDevelopment: "什么是 Web 开发？",
		css: "CSS",
		selectors: "选择器",
		specificity: "优先级",
		properties: "属性",
		javascript: "JavaScript",
		html: "HTML",
		specialThanks: "特别感谢",
		avoidAtAllCosts: "不惜一切代价避开",
		unless: "除非",
		avoid: "避开",
		at: "不惜",
		all: "一切",
		cost: "代价",
		linkNote: "`TreeViewLink` 渲染出一条可获得焦点的链接行：",
	},

	tabs: {
		quote: "所谓*选项卡控件*，类似于文件柜或笔记本里的分隔页。你可以用它在一个窗口内划分出多个逻辑页面或信息区块。",
		quoteSource: "—— Microsoft Windows User Experience 第 193 页",
		p2: "原文档指出，选项卡“应当通过添加自定义 javascript 代码来管理”。而在这里，这些簿记工作都由 `Tabs` 负责，包括 `aria-selected`、面板的显隐以及 ← / → 键盘导航。",
		windowTitle: "控制面板",
		desktop: "桌面",
		myComputer: "我的电脑",
		controlPanel: "控制面板",
		devicesManager: "设备管理器",
		desktopSettings: "桌面设置",
		controlledIntro: "受控选项卡，再加上 `multirows` 让标签均匀铺开：",
		multirowTitle: "多行选项卡",
		settingsLabel: "设置",
		selected: "已选中：{value}",
	},

	tableView: {
		p1: "`TableView` 负责渲染 `sunken-panel` 外层容器、吸顶表头，以及原文档用一段手写的 `querySelectorAll` 脚本实现的交互式行高亮。",
		columnName: "名称",
		columnVersion: "版本",
		columnCompany: "公司",
		selected: "已选中：{value}",
		p3: "加上 `sortable` 表头即可点击排序——箭头跟随 `aria-sort`，所以画面和读屏状态不会脱节；加上 `pageSize` 就会分页并在下方显示翻页器。当列的 key 不是真正要排序的值时（例如显示格式化后的容量、排序用字节数），用 `sortValue` 取排序值。",
		p2: "更底层的 `Table`、`TableHead`、`TableBody`、`TableRow`、`TableHeaderCell` 和 `TableCell` 原语也对外导出，方便你手写表格标记；其中 `TableRow` 可以直接接受 `highlighted`：",
	},

	progress: {
		quote: "你可以用*进度指示器*（也就是进度条控件）来显示一项耗时操作的完成百分比。",
		quoteSource: "—— Microsoft Windows User Experience 第 189 页",
		p1: '`value` 默认按百分比处理，并会被限制在 `max` 以内；`segmented` 会切换到 16px 的分块样式。两者都会带上 `role="progressbar"` 以及与之匹配的 ARIA 值属性。',
		liveIntro: "下面是一个由计时器状态驱动的实时示例：",
		sliderLabel: "进度",
	},
};
