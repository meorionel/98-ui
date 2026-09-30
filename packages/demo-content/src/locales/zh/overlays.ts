/**
 * Strings for the overlay sections — Chinese.
 *
 * Typed as part of `Messages` by `zh/index.ts`, so this file must mirror
 * `en/overlays.ts` key for key.
 */

export const overlays = {
	menus: {
		quote: "“文件、编辑、查看——菜单栏是 Windows 应用告诉你它能做什么的地方。”",
		quoteSource: "差不多每本 Windows 98 手册都会这么说",
		p1: "声明了 `items` 的条目会打开真正的下拉菜单。菜单打开时方向键会在菜单栏上继续移动，把指针移到别的标题上也会直接切换，和系统外壳完全一致：子菜单、分隔线、快捷键提示、勾选标记和单选标记都支持。",
		p2: "`DropdownMenu` 是同一套菜单引擎，只是没有菜单栏——给它任意一个触发元素，菜单就会挂在它下面。菜单项都是纯数据，可以直接用数组生成。",

		windowTitle: "带真实菜单的窗口",
		menuLabel: "窗口菜单",
		file: "文件",
		view: "查看",
		new: "新建",
		open: "打开",
		sendTo: "发送到",
		desktop: "桌面快捷方式",
		mail: "邮件收件人",
		exit: "退出",
		statusBar: "状态栏",
		zoom: "缩放",
		zoom100: "100%",
		zoom200: "200%",
		body: "打开「文件」和「查看」看看。状态栏会显示你最后执行的命令。",
		options: "选项",
		noSelection: "还没有执行命令",
		lastCommand: "最后执行的命令",
	},

	contextMenu: {
		p1: "`ContextMenu` 包住子元素，右键时在指针位置打开菜单。键盘同样可用：让区域获得焦点后按 `Shift+F10`（或菜单键），菜单会在焦点元素下方打开——Windows 从 95 开始就是这么做的。",
		area: "在这里点右键",
		hint: "用 Tab 聚焦上面的面板，再按 Shift+F10 就能用键盘打开菜单。",
		label: "文件操作",
		new: "新建",
		folder: "文件夹",
		shortcut: "快捷方式",
		rename: "重命名",
		delete: "删除",
		properties: "属性",
		wordWrap: "自动换行",
		lastCommand: "最后执行的命令",
		none: "还没有",
	},

	dialog: {
		p1: "`Dialog` 是一个真正的窗口：凸起边框、标题栏、命令按钮、焦点陷阱、`Escape` 关闭，背后还有一层变暗的页面。打开期间页面滚动被锁定；第二个对话框会叠在第一个上面，因为每一层都会拿到自己的 z-index 位置。",
		p2: "`MessageBox` 就是带上 Windows 98 装饰的同款对话框：一个图标、一段消息和一排命令按钮。传入 `buttons` 后，它会用 `onResult` 回调告诉你按下了哪个按钮。",
		openDialog: "打开对话框",
		openMessageBox: "打开消息框",
		title: "删除文件",
		body: "确定要把 REPORT.DOC 放入回收站吗？",
		boxTitle: "确认删除文件",
		boxBody: "删除文件会把它放进回收站。要继续吗？",
		icon: "图标",
		iconInfo: "信息",
		iconWarning: "警告",
		iconError: "停止",
		iconQuestion: "问号",
		result: "结果",
		none: "还没有",
	},

	tooltipPopover: {
		p1: "`Tooltip` 在指针悬停一小段时间后显示，键盘聚焦时立即显示，并自动接好 `aria-describedby`，所以它是被读屏朗读而不只是画出来。按 Escape 可以只隐藏提示，不影响其他东西。",
		p2: "`Popover` 是 `Dialog` 的非模态版本：没有遮罩、不锁焦点、不锁滚动——相当于 Win98 里的浮动面板。按 `Escape`、点击外部、或再按一次触发元素都会关闭它。",
		hoverMe: "把指针放上来",
		hoverMeRight: "这个也放上来",
		tooltipText: "把文件送入回收站",
		details: "详细资料",
		popoverLabel: "文件详细资料",
		readOnly: "只读",
		hidden: "隐藏",
		name: "名称",
		apply: "应用",
	},
};
