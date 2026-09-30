/**
 * Strings for the display sections — Chinese.
 *
 * Typed as part of `Messages` by `zh/index.ts`, so this file must mirror
 * `en/display.ts` key for key.
 */

export const display = {
	badgeAvatar: {
		p1: "`Badge` 是一个小的状态标签。Windows 98 并没有这种控件，所以这是有意新增的：用主题自身的表面色做成凸起小片，按状态着色——并且永远带文字标签，因为只靠颜色说明不了问题。",
		new: "新",
		saved: "已保存",
		errors: "3 个错误",
		warning: "有未保存的修改",
		info: "测试版",
		p2: "`Avatar` 就是登录磁贴：凹陷方块里放头像，没有图片时就显示首字母。图片加载失败时同样会退回首字母——这才是线上真正会发生的情况。",
		initials: "没有图片时显示首字母",
		tile: "方形磁贴，32px（默认）",
		circle: "圆形，48px",
	},
	card: {
		p1: "`Card` 是带页眉、内容和页脚的凸起容器。它用的边框和 `Window` 一样——区别在于卡片没有标题栏，是用来放在页面里的，而不是浮在页面上。",
		title: "调制解调器",
		description: "标准 56k 调制解调器",
		content: "已连接，速率 33.6 kbps。压缩已开启，差错控制已开启。",
		properties: "属性",
		disconnect: "断开连接",
	},
	typography: {
		p1: "`Heading`、`Text` 和 `Prose` 负责字号体系。上游样式表把裸 `h1`–`h4` 按正文排版来设（最大 5rem），对 11px 的界面来说太大了，这几个 class 把 UI 的字号还了回来。",
		heading: "磁盘碎片整理程序",
		lead: "重新整理磁盘上的文件，让程序启动得更快。",
		body: "使用 NTFS 格式化的驱动器不需要整理碎片。开始前请关闭其他程序，整理过程中不要操作电脑。",
		muted: "C:\\Windows\\System",
		small: "上次运行：从未",
		p2: "`Prose` 用来包住渲染出来的富文本——Markdown、帮助页面、这份文档本身——并把内部的一切限定在主题里：标题、段落、列表、引用、代码和链接都会采用主题样式，而不是浏览器默认样式。",
		quote: "“整理过碎片的硬盘，才是幸福的硬盘。”",
		quoteSource: "差不多每本 Windows 98 手册都会这么说",
		list1: "先关闭其他程序。",
		list2: "整理期间不要运行屏幕保护程序。",
		code: "在命令提示符下执行 `defrag C:`。",
	},
	empty: {
		p1: "`Empty` 就是「这里还什么都没有」的状态：一个图标、一句标题、一句说明和一个操作，用页面自己的配色居中排布。没有素材插画——成本更低，也更契合这个库。",
		title: "此文件夹为空",
		description: "把文件拖到这里，或使用「文件 → 新建 → 文件夹」。",
		action: "新建文件夹",
		p2: "放在面板里时传 `compact` 收紧内边距。",
		compactTitle: "未找到设备",
		compactDescription: "接入设备后选择「刷新」。",
	},
	feedback: {
		p1: "`Spinner` 是忙碌指示器：机器思考时不断翻转的沙漏。它用内联 SVG 绘制，两帧切换是 CSS 动画而不是雪碧图。它会以 status 角色播报，读屏会说明当前在做什么。",
		spinner: "沙漏 Spinner",
		working: "正在复制文件…",
		p2: "没有 `value` 的 `ProgressIndicator` 是不确定态，会以跑马灯方式动画——Windows 98 在无法预估剩余时间时就是这么做的。它完全不输出 `aria-valuenow`，所以读屏只报「进行中」，不会编造百分比。",
		progress: "进度",
		determinate: "确定进度：60%",
		indeterminate: "不确定进度",
		indeterminateSegmented: "不确定进度（分块）",
		busyLabel: "正在格式化 C 盘：",
	},
};
