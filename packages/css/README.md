## 98.css

一套兼顾情怀&还原度&可爱的经典UI复刻方案

<img alt="window" src="https://cdn.jsdelivr.net/gh/meorionel/98-pink.css@0.0.2/docs/window.png" height="133">

### 这是什么

这是98.css的分支版本<strong style="color: purple">✨ 98-pink.css ✨</strong>

在原来的基础上将色调修改为粉红色和蓝色。

这个包现在是 [`98-ui`](../../README.md) bun workspace 的一员，并且是**整套项目样式的唯一真实来源**：
React 移植版（`packages/react`）与 Vue 移植版（`packages/vue`）的样式表都由 `packages/tools`
从这里生成，再由 `98-verify-fidelity` 校验生成结果是纯变换（除图标内联外逐字符一致）。

### 如何开始

通过 cdn 导入!

```bash
https://cdn.jsdelivr.net/gh/meorionel/98-pink.css/dist/98-pink.css
```

### 三个产物

`bun run build` 会在 `dist/` 下生成三种样式表：

| 文件 | 内容 |
| --- | --- |
| `98-pink.css` | 旧版产物：图标内联、`var()` 已预先展开、已压缩。CDN 与既有使用者用的就是它，保持不变。 |
| `98-pink.raw.css` | 核心样式表，图标内联，但**保留全部自定义属性**，可以整套换主题。 |
| `98-pink.full.css` | 上面这个 **加上** `additive/` 里的组件样式 —— toolbar、card、badge、pagination、spin-box、popover……这些以前只存在于 React / Vue 移植版里，纯 CSS 使用者拿不到。 |

### 开发

首先在 workspace 根目录执行 `bun install`。

`style.css` 是核心样式表，`additive/` 下是各组件补充的样式 ——
**这两处是本仓库唯一需要手工编辑 CSS 的地方**，两个移植版的样式表都从这里生成。

运行 `bun run dev` 启动开发环境：它会监视文件的改动并重建，然后重新加载浏览器。

做完之后运行 `bun run build` 打包，产物会生成在 `dist` 目录下。

### Issues, Contributing, etc.

Refer to [the GitHub issues page](https://github.com/jdan/98.css/issues) to see bugs in my CSS or report new ones. I'd really like to see your pull requests (especially those new to open-source!) and will happily provide code review. 98.css is a fun, silly project and I'd like to make it a fun place to build your open-source muscle.

Thank you for checking my little project out, I hope it brought you some joy today. Consider [starring/following along on GitHub](https://github.com/jdan/98.css/stargazers) and maybe subscribing to more fun things on [my twitter](https://twitter.com/jdan). 👋

### Publishing

Building the docs site: `bun run deploy:docs`

Publishing to npm: `bun run release`

### License

[MIT](https://github.com/jdan/98.css/blob/main/LICENSE)
