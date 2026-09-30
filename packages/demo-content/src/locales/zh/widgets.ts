/**
 * Strings for the widget sections — Chinese.
 *
 * Typed as part of `Messages` by `zh/index.ts`, so this file must mirror
 * `en/widgets.ts` key for key.
 */

export const widgets = {
	separator: {
		p1: "`Separator` 画出 Windows 98 用来分隔区块的那道蚀刻线，支持水平与垂直；纯粹当装饰用时传 `decorative`。`Kbd` 渲染一个键帽，让快捷键读起来和手册上印的一样。",
		left: "左侧区块",
		right: "右侧区块",
		shortcut: "按 `Ctrl` + `S` 保存，或按 `Escape` 取消。",
	},
	spinBox: {
		p1: "`SpinBox` 就是上下箭头控件：一个文本框加一对箭头。`step` 决定单击一次的步长，`pageStep` 对应 PageUp/PageDown，Home/End 直接跳到边界，输入超出范围的内容会在失焦时被夹回范围内。",
		fontSize: "字号",
		quantity: "数量",
		controlled: "受控取值",
		hint: "方向键一次走一格，PageUp/PageDown 一次走十格。",
		value: "当前值：{value}",
	},
	datePicker: {
		p1: "`DatePicker` 是一个只读输入框加一份下拉日历。从头到尾都用 ISO `YYYY-MM-DD` 字符串——`toIsoDate` 和 `parseIsoDate` 已导出用于转换——所以整条链路都不需要日期库。",
		installedOn: "安装日期",
		selected: "已选日期：{value}",
		previousMonth: "上个月",
		nextMonth: "下个月",
		weekdays: "日 一 二 三 四 五 六",
		monthHeading: "{year}年{month}月",
		dayLabel: "选择 {date}",
		p2: "里面的 `Calendar` 本身就是独立组件，也可以直接放到页面上。它同样接受 `min`、`max` 和 `weekStartsOn`，整张表格都能用键盘操作。",
		calendar: "单独的日历",
	},
	splitPane: {
		p1: "`SplitPane` 在两个面板之间放一条可拖动的分隔条。这条分隔条是真正的 `separator`：可以获得焦点、用 `aria-valuenow` 报告自己的尺寸、用方向键移动、用 Home/End 跳到两端、用 Enter 或双击复位，并且指针拖出窗口也不会断。",
		divider: "调整面板宽度",
		left: "拖动分隔条",
		right: "右侧面板占据剩余空间。",
		hint: "用 Tab 聚焦分隔条后按方向键，或者直接用指针拖动。",
	},
	balloonTip: {
		p1: "`BalloonTip` 就是 Windows 98 从托盘里冒出来的带尾巴通知。锚定到某个元素时它指向该元素，不给锚点就停靠在角落。它从不抢焦点，按 `Escape` 关闭，也可以用 `autoDismiss` 自己消失——这就是这套设计语言里的 toast。",
		showAnchored: "指向这个按钮",
		showDocked: "停靠到角落",
		anchoredTitle: "发现新硬件",
		anchoredBody: "Windows 正在为新设备安装驱动程序。",
		dockedTitle: "磁盘空间不足",
		dockedBody: "C 盘剩余空间不多了。",
	},
	propertySheet: {
		p1: "`PropertySheet` 是 Windows 98 的模态设置窗口：分页做成选项卡，底部是确定、取消和可选的「应用」。它就是 `Dialog` 加 `Tabs`，所以层叠、焦点陷阱、`Escape` 和背景变暗的行为与其他对话框完全一致。",
		open: "打开属性表",
		title: "显示 属性",
		background: "背景",
		settings: "设置",
		wallpaper: "墙纸",
		colours: "配色方案",
		pageBackground: "选一张墙纸。按下「应用」后预览会更新。",
		pageSettings: "为窗口、按钮和菜单选择一套配色方案。",
	},
	wizard: {
		p1: "`Wizard` 用「上一步 / 下一步 / 完成」串起一组固定页面。左侧列表可以跳转步骤，底部显示当前进度，最后一页的「下一步」会变成「完成」，`Enter` 跟随默认按钮——整套流程都能用键盘走完。",
		open: "启动向导",
		title: "添加硬件向导",
		welcome: "欢迎",
		welcomeBody: "本向导帮助你安装设备和它的驱动程序。",
		device: "设备",
		deviceBody: "你要安装哪一种设备？",
		deviceModem: "调制解调器",
		devicePrinter: "打印机",
		confirm: "完成",
		confirmBody: "安装程序现在将安装「{device}」。",
		done: "已完成——「{device}」已经装好。",
	},
};
