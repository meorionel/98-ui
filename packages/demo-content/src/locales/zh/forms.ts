/**
 * 表单控件小节（中文）：Button、Checkbox、OptionButton、GroupBox、TextBox、
 * Slider 与 Dropdown。
 *
 * 写法与 `en/forms.ts` 一致：`code`、**strong**、*em*、[链接](url)。
 * 键名必须与英文版完全对应，`zh/index.ts` 的类型是 `typeof en`，
 * 少一个或多一个键都会导致编译失败。
 */

export const forms = {
	button: {
		quote: "所谓*命令按钮*，也就是常说的下压按钮（push button），是一种在用户点击时让应用程序执行某个动作的控件。",
		quoteSource: "—— Microsoft Windows User Experience 第 160 页",
		p1: "标准按钮宽 75px、高 23px，具有凸起的外层与内层边框。默认情况下左右内边距为 12px。",
		clickMe: "点我",
		cannotBeClicked: "我无法被点击",
		// 这里为了保留 <kbd> 元素而拆成两段。
		p2a: '用 `variant="default"` 标记在活动窗口中响应',
		enterKey: "Enter",
		p2b: "键的按钮。",
		p3: "按钮被按下时边框会凹陷，获得焦点时会在内缩 4px 处绘制虚线焦点框。由于样式表是依靠 `:active` 和 `:focus` 来驱动这两种状态的，本移植版额外提供了 `active` 与 `focused` 属性，以便在文档和视觉测试中固定某个状态：",
		pressedState: "我正在被按下",
		focusedState: "我处于焦点状态",
		defaultPressed: "默认按钮，已按下",
	},

	checkbox: {
		quote: "*复选框*（check box）表示一个独立、互不排斥的选项。",
		quoteSource: "—— Microsoft Windows User Experience 第 167 页",
		p1: "`Checkbox` 会把输入框和它的 `<label>` 一起渲染出来，并替你接好 `htmlFor`/`id` 配对 —— 原版需要你手工完成这件事。",
		thisIsACheckbox: "这是一个复选框",
		checkedLabel: "我已选中",
		inactiveLabel: "我处于禁用状态",
		inactiveCheckedLabel: "已禁用但仍处于选中状态",
		p2: "完全受控的写法，配合 `checked` 与 `onChange`：",
		firstOption: "第一个选项",
		secondOption: "第二个选项",
	},

	optionButton: {
		quote: "*单选按钮*（option button）也叫 radio button，表示在一组互斥选项中做出的单一选择。",
		quoteSource: "—— Microsoft Windows User Experience 第 164 页",
		p1: "`RadioGroup` 会统一管理共享的 `name`、当前选中值，以及在各选项之间轮转的 `checked` 状态，因此不必手写分组簿记逻辑。",
		yes: "是",
		no: "否",
		p2: "下面是受控用法，其中还包含禁用项 —— 第二组是一个可交互的受控分组：",
		smoothOption: "花生酱应该是顺滑型的",
		understandOption: "我理解为什么有人喜欢颗粒型",
		crunchyOption: "颗粒型花生酱很好吃",
		selected: "已选：{value}",
		p3: "如果需要完全掌控，仍然可以直接使用底层的 `Radio`：",
		checkedByDefault: "默认选中",
		unchecked: "未选中",
	},

	groupBox: {
		quote: "*分组框*（group box）是一种可以用来组织一组控件的特殊控件：一个矩形边框，带有可选标签，把一组控件包围在其中。",
		quoteSource: "—— Microsoft Windows User Experience 第 189 页",
		p1: "`GroupBox` 渲染的是原生 `fieldset`，边框本身则来自内联的 SVG `border-image`。",
		selectOne: "请选择一项：",
		diners: "小餐馆",
		driveIns: "汽车影院",
		dives: "街边小馆",
		todayMood: "今日心情",
		claireSaffitz: "Claire Saffitz",
		bradLeone: "Brad Leone",
		chrisMorocco: "Chris Morocco",
		carlaLalliMusic: "Carla Lalli Music",
	},

	textBox: {
		quote: "*文本框*（text box）是一个矩形控件，用户可以在其中输入或编辑文本。它既可以定义为支持单行文本，也可以支持多行文本。",
		quoteSource: "—— Microsoft Windows User Experience 第 181 页",
		occupation: "职业",
		favoriteColor: "最喜欢的颜色",
		p1: '`layout="stacked"` 会把标签放到控件上方：',
		addressLine1: "地址（第一行）",
		addressLine2: "地址（第二行）",
		additionalNotes: "补充说明",
	},

	slider: {
		quote: "*滑块*（slider）有时也称为跟踪条（trackbar）控件，它由一条定义调整范围的长条和一个显示当前值的指示器组成。",
		quoteSource: "—— Microsoft Windows User Experience 第 146 页",
		volumeLabel: "音量：{value}",
		low: "低",
		high: "高",
		p1: "`boxIndicator` 会换成矩形指示器，`vertical` 则把控件旋转为垂直方向。可以用 `length` 指定轨道长度。",
		cowbellLabel: "牛铃：{value}",
	},

	dropdown: {
		quote: "*下拉列表框*（drop-down list box）只允许从列表中选择单个项目。",
		quoteSource: "—— Microsoft Windows User Experience 第 175 页",
		rating5: "5 - 令人难以置信！",
		rating4: "4 - 很棒！",
		rating3: "3 - 还不错",
		rating2: "2 - 不太行",
		rating1: "1 - 很糟糕",
		p1: "受控用法，标签放在 `field-row` 里：",
		rating: "评分",
	},
};
