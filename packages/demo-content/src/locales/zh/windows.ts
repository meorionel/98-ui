/**
 * 窗口小节（中文）。
 * 写法与 `en/windows.ts` 一致：`code`、**strong**、*em*、[链接](url)。
 * 键名必须与英文版完全一致，少一个或多一个键都会导致编译失败。
 */

export const windows = {
	titleBar: {
		quote: "窗口顶部边缘、边框之内就是标题栏，它的宽度与整个窗口相同。标题栏中应包含与主窗口常用命令相对应的命令按钮。",
		quoteSource: "—— Microsoft Windows User Experience 第 118、122 页",
		p1: "`TitleBar` 通过 `text` 接收标题文字，通过 `controls` 接收按钮。无障碍名称默认为英文，但可以用 `labels` 本地化；图标由 CSS 类绘制，与标签文字无关。",
		aTitleBar: "标题栏",
		aMaximizedTitleBar: "最大化的标题栏",
		aHelpfulBar: "带帮助按钮的标题栏",
		p2: "`inactive` 标志会让标题栏变成灰色，而 `labels` 映射则能让按钮在任何语言下都保持无障碍：",
		inactiveTitleBar: "非活动状态的标题栏",
	},

	contents: {
		quote: "每个窗口都有一条定义自身形状的边界。",
		quoteSource: "—— Microsoft Windows User Experience 第 118 页",
		p1: "`Window` 给标题栏提供了容身之处：凸起的外层与内层边框，再加上内边距。`width` 与 `height` 会直接映射到容器的样式上。",
		windowTitle: "一个装了东西的窗口",
		menuLabel: "窗口菜单",
		menuFile: "文件",
		menuEdit: "编辑",
		menuView: "查看",
		menuGo: "转到",
		menuFavorites: "收藏",
		menuHelp: "帮助",
		roomForActivities: "这里可有的是地方折腾！",
		p2: "这些基础组件同样对外导出，因此也可以手工组装窗口。`MenuBar` 支持 ← / → / Home / End 键导航，并采用 roving tabindex。",
	},

	interactive: {
		p1: "因为窗口边框完全由状态驱动。下面的窗口会真正地关闭、最大化和还原：",
		windowTitle: "交互式窗口",
		maximized: "已最大化",
		restored: "已还原",
		noEvents: "暂无事件",
		body: "试试标题栏上的按钮。",
		reopen: "重新打开窗口",
	},

	statusBar: {
		quote: "状态栏是窗口中一块特殊的区域，通常位于底部，用于显示窗口中当前所查看内容的状态信息。",
		quoteSource: "—— Microsoft Windows User Experience 第 146 页",
		windowTitle: "带状态栏的窗口",
		intro: "可能性真是太多了：",
		item1: "任务管理器",
		item2: "记事本",
		item3: "甚至可以是文件资源管理器！",
		fieldHelp: "按 F1 获取帮助",
		fieldSlide: "第 1 张幻灯片",
		fieldCpu: "CPU 占用率：14%",
		p1: "当这些便捷 props 不适用时，也可以手动组合 `WindowBody` 与 `TitleBar`：",
		handAssembled: "手工组装",
		bodyContent: "正文内容",
	},
};
