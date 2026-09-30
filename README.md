# 98-ui

**98-pink** Windows 98 复刻项目的 bun workspaces monorepo：唯一真实来源的 CSS、
它的 React 与 Vue 移植版，以及三者共享的代码。

这三个项目原本是三个独立仓库并排放着，同一份样式表、同一份文档文案、同一套浮层
定位运算，都要在两三个地方手工维护。现在这个 workspace 把它们各自收敛回单一来源，
而且**不改变任何一个包对外发布的内容**。

## 目录结构

| 包 | 发布名 | 说明 |
| --- | --- | --- |
| `packages/css` | `98-pink.css` | **样式的唯一真实来源。** 核心 `style.css`、增量组件样式、22 个 SVG 图标与字体。 |
| `packages/shared` | `98-pink-shared` | **框架无关的核心。** 浮层定位、焦点管理、层级 `z-index` 栈与 `cx`。不引入 `react`，也不引入 `vue`。 |
| `packages/react` | `98-pink-react` | React 移植版。组件渲染 + 基于 `98-pink-shared` 的一层薄绑定。 |
| `packages/vue` | `98-pink-vue` | Vue 3 移植版。组件渲染 + 基于同一核心的一层薄绑定。 |
| `packages/demo-content` | *（私有）* | 两个文档应用共用的文案表与多语言辅助函数。 |
| `packages/tools` | *（私有）* | 样式生成器与 CSS 保真校验，各一份，而不是每个移植版一份。 |

每个移植版各自保留 `demo/` 文档应用和 `scripts/` 测试套件。

## 要改东西时该动哪里？

这正是这套结构的意义所在 —— 现在几乎没有需要做两遍的事了：

| 我想…… | 改这里 | 然后 |
| --- | --- | --- |
| 增删改一条 CSS 规则 | `packages/css/style.css`（核心）或 `packages/css/additive/*.css` | `bun run generate` —— 两个移植版同时生效 |
| 加一个图标 | `packages/css/icon/*.svg` | `bun run generate` |
| 修浮层定位运算、焦点处理或层级栈 | `packages/shared/src/` | `bun run --filter 98-pink-shared build` |
| 加一句文档文案 | `packages/demo-content/src/locales/{en,zh}/` | 什么都不用做 —— 两个 demo 都读它 |
| 改某个框架特有的文案 | `packages/{react,vue}/demo/src/i18n/overrides.ts` | 什么都不用做 |
| 加一个组件 | `packages/css/additive/` **和** `packages/react/src/components/` **和** `packages/vue/src/components/` | `bun run generate && bun run build` |

只有最后一行仍然意味着要把同一个组件写两遍 —— 因为 React 移植版和 Vue 移植版
*本来就是这样*。除此之外的一切都已经单源化，而 `packages/tools` 保证样式表不会再
悄悄跑偏。

## 命令

都在仓库根目录执行。

```bash
bun install          # 链接 workspace
bun run generate     # 从 packages/css 重新生成两个移植版的样式表
bun run typecheck    # 对每个包跑 tsc / vue-tsc
bun run build        # css -> shared -> react -> vue
bun run test         # css、shared、demo-content，然后是两个移植版的完整测试
bun run verify       # typecheck && build && test

bun run dev:react    # 文档应用，:5273
bun run dev:vue      # 文档应用，:5274
```

只对单个包操作：

```bash
bun run --filter 98-pink-react test
bun run --filter 98-pink-vue build
bun run --filter 98-pink.css build
```

`packages/react` 与 `packages/vue` 各自定义了 `build:deps`，会先构建
`98-pink-shared`，所以它们自己的 `build`、`typecheck`、`test`、`dev` 都能独立跑通。

## 样式是怎么流转的

**只有 `packages/css` 是写规则的地方。**

```
packages/css/style.css            核心样式表，使用 svg-load("./icon/*.svg")
packages/css/additive/*.css       移植版在核心之上补充的组件样式
packages/css/icon/                22 个图标，构建时内联
        |
        |  packages/tools —— 一个生成器，服务两个移植版
        v
packages/react/src/styles/        生成物：98-pink.css + 镜像过来的增量样式
packages/vue/src/styles/          生成物：98-pink.css + 镜像过来的增量样式
```

生成器跑的是两个移植版一直在跑的那条 `postcss-inline-svg` 流水线，但**刻意不启用**
`postcss-css-variables`，这样每一个 `var(--token)` 都能保留下来，整套主题才可以被
覆盖换肤。生成之后，`98-verify-fidelity --port react|vue` 会证明产物仍是
`packages/css/style.css` 的**纯变换**：选择器一致、声明一致、顺序一致，唯一的差别
只有内联进去的图标。移植版不可能悄悄丢掉样式。

`packages/css` 自己会产出三种产物：

- `dist/98-pink.css` —— 旧版产物，已压缩、自包含，CDN 上服务的就是它。
- `dist/98-pink.raw.css` —— 核心样式表，图标已内联，自定义属性完整保留。
- `dist/98-pink.full.css` —— 上面这个**再加上**增量样式表，于是纯 CSS 使用者现在也能
  用上较新的组件（以前它们只存在于两个框架移植版内部）。

每个移植版自己唯一手工编写的样式文件，只有 `src/styles/{react,vue}-extras.css`。

## 为什么 `98-pink-shared` 在库构建里是外置的

层级栈 —— 也就是 `z-index` 计数器和当前打开的浮层列表 —— 是进程级的全局状态。
如果两个移植版各自打包一份拷贝，同一页面上的两个浮层就可能对"谁在最上层"产生分歧。
所以两个移植版都把 `98-pink-shared` 列在 `dependencies` 里，并保留在
`rollupOptions.external` 中：只会发布一份，所有浮层看到的是同一个栈。

demo 与 SSR 构建则把它打进去，所以 `bun run dev` 之前需要先构建一次
（`bun run --filter 98-pink-shared build`；`build:deps` 已经帮你做了）。

## 环境要求

Bun ≥ 1.2，Node ≥ 20（测试脚本跑在 Node 上；CSS 与文案检查跑在 Bun 上）。

## 许可

MIT。基于 Jordan Scales 的 [98.css](https://github.com/jdan/98.css)。
