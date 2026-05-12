# CONTRACT：Rich Markdown 接入契约规范

> **读者**：第三方渲染器实现者、主题作者、插件作者、AI skill 作者、任何要把 `.rmd` 接入自己产品的工程师
> **阅读时长**：30–45 分钟（也可作为日常翻字典）
> **最近更新**：2026-05-10
> **本契约版本**：v0.2-draft

## 0. 这份文档的契约性质

这是一份**字典**，不是教程。它精确定义"什么是合法的 `.rmd`"以及"接入方必须实现 / 可以实现 / 不允许实现"的边界。

- **遵循 semver**：v0.x 阶段允许小破坏（仅在小版本号变更时），v1.0 起所有契约锁定，破坏需要主版本号升级。
- **凡是本文档没明确允许的，都视为未定义行为**——接入方不应依赖未定义行为。
- **本文档与 [`PRINCIPLES.md`](./PRINCIPLES.md) 冲突时，以 PRINCIPLES 为准**——契约不能违反原则。
- **AST 字段细节**见 [`DATA-MODEL.md`](./DATA-MODEL.md)，本文只列高层契约。

如果你在实现兼容渲染器，把这份文档当作合规清单逐项核对。如果你在做插件或主题，本文 §3–§4 是你的入口。如果你在写 AI skill，本文 §7 是你的入口。

## 1. 文件契约

### 1.1 文件命名与编码

- **后缀名**：推荐 `.rmd`。允许 `.md`（向下兼容），但 `.md` 文件必须在 frontmatter 里显式声明 `format: rmd` 才会启用扩展块解析；否则按纯 CommonMark 处理。
- **编码**：必须 UTF-8（含或不含 BOM）。其他编码视为非法。
- **换行**：渲染器必须同时接受 `\n` 和 `\r\n`。建议作者侧统一为 `\n`。
- **最大长度**：契约层不限制，但接入方应公布自身限制（如 1MB、10MB）。

### 1.2 文档总体结构

一份合法的 `.rmd` 文件由两部分组成（顺序固定）：

```
[可选] frontmatter（YAML）
[必需] 文档主体（CommonMark + 围栏块）
```

完整最小例子：

```rmd
---
title: 示例
theme: default
---

# 标题

正文段落。

:::chart bar
A 1
B 2
:::
```

### 1.3 frontmatter 字段

frontmatter 用 `---` 包围，YAML 1.2 子集（仅平凡映射）。**核心字段**列表如下；任何渲染器都必须识别，不识别视为破坏契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` | string | 文档首个 H1 文本 | 文档标题，影响浏览器 tab 和 OG 元数据 |
| `theme` | string | `"default"` | 渲染时使用的主题 ID；未知主题降级到 `default` |
| `format` | string | `"rmd"` | 必须为 `"rmd"`；当文件后缀为 `.md` 时此字段强制必填 |
| `version` | string | 当前渲染器最高支持版本 | 此文档基于哪个 `.rmd` 规范版本撰写 |
| `share` | enum | `"private"` | `private` / `team` / `public`，仅对短链服务有意义，本地渲染忽略 |
| `description` | string | 空 | 用于 OG/SEO/分享卡片 |
| `cover` | string | 空 | 封面图 URL，用于分享卡片 |
| `lang` | string | `"zh-CN"` | BCP 47 语言标签，影响排版与字体 |

**自定义字段**：以 `x-` 开头的字段一律允许，渲染器必须保留但可以忽略；不以 `x-` 开头的非核心字段视为未定义行为。

### 1.4 块语法通用规则

所有扩展块遵循统一围栏语法：

```
:::block-name [attr1=value attr2="quoted value" ...]
[block content lines]
:::
```

- **起止标记**：开头与结尾各一行，每行恰好为 `:::` 或 `:::block-name [attrs]`，前后允许空白但同一行不能有其他可见字符。
- **嵌套**：v0.1 不支持嵌套块（除非块定义显式允许，如 `:::tabs` 内允许 `:::chart`）。嵌套行为由块定义说明。
- **属性**：键值对，用空格分隔；值不含空格可不加引号，含空格用双引号；不允许 JSON / 复杂表达式。
- **属性顺序无关**：`min=0 max=100` 与 `max=100 min=0` 等价。
- **未声明属性**：解析器必须保留并以 `attrs.unknown` 数组形式传给渲染器；渲染器可忽略，不应报错（满足 P8 优雅降级）。
- **错误恢复**：未闭合的块在文档结尾自动闭合，并在该节点 AST 上标记 `warnings: ["unclosed"]`。

## 2. 核心块规范

每个块的定义遵循统一模板：用途 / 语法 / 属性 / 内容格式 / AST / Fallback / 示例。

§2.1–2.8 是 **v0.1 必须实现的 8 个核心块**（CommonMark 之外的最小可用集合）；§2.9–2.14 是 **v0.2 起新增的扩展块**——它们的语法稳定但实现尚在打磨，文档与代码版本均标注 `v0.2`。所有 14 个块都已在 `@rmd/parser-core` + `@rmd/blocks-core` + `@rmd/renderer-core` 中可解析、可渲染。块完成度详见 [`PROGRESS.md`](./PROGRESS.md)。

### 2.1 `:::chart` — 数据图表

**用途**：以最小语法表达柱状/折线/饼图等数据可视化。

**语法**：

```
:::chart {type} [title="..."] [x="..."] [y="..."] [emphasis="primary|secondary|none"]
{label} {value} [{value2} ...]
...
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `type`（位置参数） | enum | — | ✅ | `bar` / `line` / `pie` / `scatter` / `radar` / `area` / `donut` / `heatmap` |
| `title` | string | 空 | ❌ | 图表标题 |
| `x` | string | 空 | ❌ | X 轴标签 |
| `y` | string | 空 | ❌ | Y 轴标签 |
| `y2` | string | 空 | ❌ | 双 Y 轴的第二轴标签 |
| `legend` | enum | `bottom` | ❌ | 图例位置 `top` / `bottom` / `left` / `right` / `none` |
| `tooltip` | boolean| `true` | ❌ | 是否开启悬浮提示 |
| `emphasis` | enum | `none` | ❌ | 主色强调级别，由主题决定具体颜色 |

**内容格式**：每行一个数据点，"标签 + 一到多个数值"，空格分隔。多个数值视为分组数据（多系列）。

**AST 节点**：

```json
{
  "type": "chart",
  "chartType": "bar",
  "title": "1000 RPS 下的 P99 延迟（ms）",
  "x": null, "y": null,
  "emphasis": "none",
  "data": [
    { "label": "令牌桶", "values": [23] },
    { "label": "漏桶",   "values": [19] },
    { "label": "滑动窗口", "values": [41] }
  ],
  "raw": "<原始内容字符串，供降级>"
}
```

**Fallback**：在不支持图表的渲染器或无 JS 环境，必须降级为表格 + 标题（数据始终可读）。

**示例**：

```rmd
:::chart bar title="1000 RPS 下的 P99 延迟（ms）"
令牌桶 23
漏桶 19
滑动窗口 41
:::
```

---

### 2.2 `:::grid` — 多列布局

**用途**：把内容横向分栏对比。

**语法**：

```
:::grid {n} [gap="sm|md|lg"]
[cell 1 内容（任意 markdown / 块）]
---
[cell 2 内容]
---
...
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `columns`（位置参数） | int 或 array | — | ✅ | 列数或响应式断点数组（如 `1,2,4`） |
| `gap` | enum | `md` | ❌ | 列间距，主题决定具体像素 |
| `layout` | enum | `default` | ❌ | `default` 或 `masonry`（瀑布流） |

**内容格式**：cell 由独立成行的 `---` 分隔。**最多 12 个 cell**，超出报错。每个 cell 内可嵌套 markdown 与其他扩展块（除 `:::grid` 自身）。

**AST 节点**：

```json
{
  "type": "grid",
  "columns": 3,
  "gap": "md",
  "cells": [<children AST>, <children AST>, <children AST>]
}
```

**Fallback**：不支持 grid 时垂直堆叠，每个 cell 之间用 `<hr>`。

---

### 2.3 `:::callout` — 强调框

**用途**：突出提示、警告、要点。

**语法**：

```
:::callout {kind} [title="..."]
[markdown 内容]
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `kind`（位置参数） | enum | `info` | ❌ | `info` / `tip` / `warning` / `danger` / `success` |
| `title` | string | 空 | ❌ | 标题，无标题时只显示图标和内容 |

**AST 节点**：

```json
{ "type": "callout", "kind": "tip", "title": "推荐令牌桶", "children": [<md AST>] }
```

**Fallback**：降级为 `> [{kind}] {title}` + 引用块内容，CommonMark 原生可读。

---

### 2.4 `:::slider` — 数值滑块

**用途**：让读者在文档内调节一个命名变量；变量可被 `:::export` 模板引用。

**语法**：

```
:::slider name="..." min={n} max={n} [step={n}] [default={n}] [unit="..."] [label="..."]
:::
```

属性全在标签行，块体必须为空（否则视为非法）。

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `name` | identifier | — | ✅ | 变量名；范围滑块用逗号分隔（如 `min,max`） |
| `min` | number | — | ✅ | 下限 |
| `max` | number | — | ✅ | 上限，必须 > min |
| `step` | number | `1` | ❌ | 步长 |
| `default` | number/array | `min` | ❌ | 初始值，范围滑块为两个值（如 `10,50`） |
| `unit` | string | 空 | ❌ | 显示单位（如 `"ms"`） |
| `label` | string | name 值 | ❌ | 显示标签 |
| `scale` | enum | `linear` | ❌ | `linear` / `log` / `pow` 缩放 |
| `marks` | array | 空 | ❌ | 离散吸附刻度（如 `10,50,100`） |

**AST 节点**：

```json
{ "type": "slider", "name": "capacity", "min": 10, "max": 1000,
  "step": 10, "default": 200, "unit": "", "label": "capacity" }
```

**Fallback**：在无 JS 环境（PDF / 邮件）显示为 "**capacity**: 200（可调范围 10-1000）"。

**变量作用域**：slider 注册的变量在**当前文档全局可用**，只能被 `:::export` 块的模板引用。变量值的运行时状态由 runtime 维护。

---

### 2.5 `:::export` — 复制/导出按钮

**用途**：把当前文档内的滑块状态/任意模板内容打包成可复制文本。**这是"保持人在循环中"的关键块**。

**语法**：

```
:::export label="..." [format="text|markdown|json"]
[模板正文，支持 {{var}} 占位]
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `label` | string | `"复制"` | ❌ | 按钮文字 |
| `format` | enum | `text` | ❌ | `text` / `markdown` / `json`；影响剪贴板 MIME |

**模板语法**：`{{name}}` 替换为 slider 变量当前值；`{{name | format}}` 支持简单格式化（如 `{{capacity | int}}`）。未知变量替换为 `[未定义:name]`，并在 console 警告。

**AST 节点**：

```json
{ "type": "export", "label": "复制为限流配置", "format": "text",
  "template": "rate_limiter:\n  capacity: {{capacity}}\n..." }
```

**Fallback**：无 JS 环境显示静态模板（带占位符 `{{capacity}}` 原文），并附加一行说明 "在浏览器打开以填充实时值"。

---

### 2.6 `:::flow` — 流程图

**用途**：表达节点间的有向关系，支持线性与简单分支。

**语法**：

```
:::flow [direction="lr|tb"]
A -> B -> C
B -> D
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `direction` | enum | `lr` | ❌ | `lr`（左→右）/ `tb`（上→下） |

**内容格式**：每行一条流向链 `Node1 -> Node2 -> Node3 [...]`。节点名可含中英文与空格（首尾去空白）；同名节点会被合并。**v0.1 不支持节点形状、边标签、子图**——这些走 `:::diagram` (v0.2)。

**AST 节点**：

```json
{
  "type": "flow",
  "direction": "lr",
  "nodes": [{ "id": "A" }, { "id": "B" }, { "id": "C" }, { "id": "D" }],
  "edges": [
    { "from": "A", "to": "B" },
    { "from": "B", "to": "C" },
    { "from": "B", "to": "D" }
  ]
}
```

**Fallback**：无 SVG 支持时降级为有序列表 + 缩进表示分支。

---

### 2.7 `:::diff` — 代码差异

**用途**：清晰展示代码改动，支持内联注释。

**语法**：

```
:::diff [lang="..."] [title="..."]
- old_line
+ new_line  @注: 可选注释
  context_line
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `lang` | string | 空 | ❌ | 语法高亮语言 ID（同 markdown code block） |
| `title` | string | 空 | ❌ | 顶部标题 |

**内容格式**：兼容 unified diff 简化形式。`-` 删除、`+` 新增、空格或两空格起始为上下文。`@注:` 后跟内联注释（必须在 `+` 或 `-` 行末）。

**AST 节点**：

```json
{
  "type": "diff",
  "lang": "python",
  "title": null,
  "lines": [
    { "kind": "remove", "text": "old_line", "note": null },
    { "kind": "add",    "text": "new_line", "note": "可选注释" },
    { "kind": "context","text": "context_line", "note": null }
  ]
}
```

**Fallback**：降级为带 `+`/`-` 前缀的代码块，CommonMark 原生可读。

---

### 2.8 `:::tabs` — 标签页

**用途**：把多个视角折叠到同一区域。

**语法**：

```
:::tabs [default="{label}"]
@{label1}
[内容 1]
@{label2}
[内容 2]
:::
```

**属性**：

| 属性 | 类型 | 默认 | 必填 | 说明 |
|---|---|---|---|---|
| `default` | string | 第一个标签 | ❌ | 初始激活标签 |

**内容格式**：`@label` 必须独立成行；其后到下一个 `@label` 或 `:::` 之间的内容视为该标签的正文（任意 markdown / 块，但不能再嵌套 `:::tabs`）。

**AST 节点**：

```json
{
  "type": "tabs",
  "default": "概念",
  "panels": [
    { "label": "概念", "children": [<md AST>] },
    { "label": "代码", "children": [<md AST>] }
  ]
}
```

**Fallback**：无 JS 时按顺序展开所有标签，每个 panel 前加 `### {label}` 标题。

---

### 2.9 `:::timeline` — 时间轴 (v0.2)

**用途**：用于展示项目规划、操作步骤、历史发展沿革。

**语法**：

```
:::timeline [direction="vertical|horizontal"]
@ {time} [title="..."] [status="default|success|warning|danger|pending"]
[内容]
@ {time}
[内容]
:::
```

**Fallback**：降级为有序列表或普通列表，节点标题加粗。

---

### 2.10 `:::kanban` — 看板 (v0.2)

**用途**：用于任务管理、状态机流转展示。

**语法**：

```
:::kanban
@ {column_title}
[内容，通常为列表]
@ {column_title}
[内容]
:::
```

**Fallback**：降级为带有三级标题 `### {column_title}` 的多个列表。

---

### 2.11 `:::details` — 折叠面板 (v0.2)

**用途**：隐藏次要信息，保持页面整洁，用户点击展开。

**语法**：

```
:::details title="..." [open="true|false"]
[内容]
:::
```

**Fallback**：无 JS 环境默认展示，前置一个 `### {title}`。

---

### 2.12 `:::carousel` — 轮播图 (v0.2)

**用途**：在有限的空间内并排展示多张图片、图表或信息卡片。

**语法**：

```
:::carousel [autoplay="true|false"] [interval="{n}"]
[卡片 1]
---
[卡片 2]
---
[卡片 3]
:::
```

**Fallback**：垂直堆叠展示，或者降级为水平滚动的原生列表。

---

### 2.13 `:::embed` — 外部富媒体嵌入 (v0.2)

**用途**：安全地嵌入第三方服务。

**语法**：

```
:::embed type="..." id="..." [aspect-ratio="16/9"]
:::
```

**Fallback**：降级为普通的 Markdown 链接。

---

### 2.14 `:::math` — 块级数学公式 (v0.2)

**用途**：支持块级 LaTeX 公式渲染。

**语法**：

```
:::math
[LaTeX 内容]
:::
```

**Fallback**：降级为普通的代码块，标记 `lang="latex"`。

## 3. 渲染器插件 API（TypeScript 签名）

接入方通过插件 API 注册新块、新图表类型、新导出器。所有 API 同步注册，不可热插拔（满足 TD-006）。

### 3.1 总入口

```ts
import { createRenderer, type RendererAPI } from '@rmd/renderer';

const renderer = createRenderer({
  plugins: [myPlugin1, myPlugin2],
  theme: 'tech-dark',
});

renderer.render({ source, target });          // 浏览器 DOM 注入
renderer.renderToString({ source }): string;   // 返回 HTML 字符串（Node 可用）
renderer.parse(source): RmdAst;                // 仅解析
```

### 3.2 插件清单（Plugin Manifest）

```ts
export interface RmdPlugin {
  /** 唯一名称，建议带命名空间，如 "company.charts.heatmap" */
  name: string;
  /** semver */
  version: string;
  /** 兼容的 .rmd 规范版本范围，如 ">=0.1 <0.3" */
  compatRange: string;
  /** 注册函数，在解析前同步调用 */
  register(api: RendererAPI): void;
}
```

### 3.3 注册新块

```ts
api.registerBlock({
  name: 'heatmap',
  parse(rawContent: string, attrs: Record<string, string>): AstNode {
    // 自定义解析，返回 AST 节点
    return { type: 'heatmap', data: parseLines(rawContent), ...attrs };
  },
  render(node: AstNode, ctx: RenderContext): HTMLElement | string {
    // 浏览器：返回 HTMLElement；Node：返回 HTML string
    return ctx.html`<div class="rmd-heatmap" data-rows="${node.data.length}">...</div>`;
  },
  /** 必填：在不支持本块时如何降级 */
  fallback(node: AstNode): AstNode {
    return { type: 'code-block', lang: '', text: node.raw };
  },
});
```

**约束**：
- `name` 必须匹配 `[a-z][a-z0-9-]*`，全局唯一；冲突时后注册的报错
- `parse` 必须是纯函数（同样输入 → 同样输出）
- `render` 必须返回字符串或 DOM 节点；不允许返回 Promise（保持渲染同步）

### 3.4 注册新图表类型

```ts
api.registerChartType({
  name: 'scatter',
  render(spec: ChartSpec, ctx: RenderContext): SVGElement | string {
    // 返回 SVG 元素或字符串
  },
});
```

注册后 `:::chart scatter` 自动可用，无需扩展核心规范。

### 3.5 注册新导出目标

```ts
api.registerExporter({
  name: 'slack-message',
  /** 用户点击 :::export 按钮且 format="slack-message" 时调用 */
  export(content: string, ctx: ExportContext): Promise<void> {
    // 自定义行为，如打开 Slack share dialog
  },
});
```

### 3.6 不允许的事

- ❌ 修改 CommonMark 行为（受 P1 保护）
- ❌ 拦截或修改其他插件注册的块
- ❌ 注册主题（主题不是插件，详见 §4）
- ❌ 注册全局事件监听器
- ❌ 在 register 阶段执行任何异步操作或网络请求

## 4. 主题包契约

主题是**纯 CSS + 配置**，禁止 JS（满足 TD-004）。

### 4.1 主题包文件结构

```
my-theme/
├── theme.json          # 元信息
├── theme.css           # 主样式
├── theme.inline.css    # 给 Mode A 内联用的同内容副本
└── preview.png         # 256x160 缩略图
```

`theme.json`：

```json
{
  "name": "my-company",
  "displayName": "My Company",
  "version": "1.0.0",
  "compatRange": ">=0.1 <1.0",
  "author": "...",
  "description": "...",
  "preview": "preview.png"
}
```

### 4.2 必须实现的 CSS 变量

主题必须定义以下 CSS 变量（前缀 `--rmd-`）：

| 变量 | 用途 | 类型 |
|---|---|---|
| `--rmd-color-bg` | 文档背景 | color |
| `--rmd-color-fg` | 主文字色 | color |
| `--rmd-color-muted` | 次要文字 | color |
| `--rmd-color-primary` | 主强调色 | color |
| `--rmd-color-success` / `warning` / `danger` / `info` | 语义色 | color |
| `--rmd-font-body` / `font-mono` | 字体栈 | font-family |
| `--rmd-radius-sm` / `md` / `lg` | 圆角档位 | length |
| `--rmd-spacing-sm` / `md` / `lg` | 间距档位 | length |
| `--rmd-shadow-sm` / `md` / `lg` | 阴影档位 | shadow |

**未实现的变量**会回退到 `default` 主题的对应值。

### 4.3 必须保留的 DOM 类名（不允许覆盖语义）

主题 CSS 只能改样式，不能用 `display: none` 或 `content: ""` 隐藏以下语义节点的内容：

- `.rmd-chart` 内的 `<title>`、`<desc>` SVG 节点
- `.rmd-export` 按钮内的 label 文本
- `.rmd-slider` 的 `aria-label` 文本
- `.rmd-callout` 的 `kind` 类名（`callout-tip` 等）

违反者视为破坏 P6（主题不改语义）。CI 应有自动化检查。

### 4.4 主题切换 API

```ts
renderer.setTheme(name: string): void;           // 同步切换
renderer.listThemes(): { name, displayName }[];  // 已加载主题
renderer.loadTheme(url: string): Promise<void>;  // 动态加载（仅浏览器）
```

切换主题不触发 DOM 重建，只替换 `<link>` 的 href（< 16ms 一帧完成）。

## 5. AST 接口（高层）

完整字段在 [`DATA-MODEL.md`](./DATA-MODEL.md)。本节列出契约边界。

### 5.1 顶层结构

```ts
interface RmdAst {
  version: string;        // 例 "0.1.0"，跟随 .rmd 规范
  frontmatter: Record<string, unknown>;
  children: AstNode[];
}
```

### 5.2 节点类型（v0.1）

CommonMark 节点：`heading` / `paragraph` / `list` / `list-item` / `code-block` / `inline-code` / `link` / `image` / `emph` / `strong` / `blockquote` / `hr` / `table` / `table-row` / `table-cell` / `text`

扩展节点：`chart` / `grid` / `callout` / `slider` / `export` / `flow` / `diff` / `tabs` / `timeline` / `kanban` / `details` / `carousel` / `embed` / `math`

### 5.3 序列化承诺

- AST 必须可 `JSON.stringify` 无损往返
- 节点上不能存放函数、Symbol、循环引用
- 字段名稳定：v0.x 阶段允许加新字段，不允许删/改已有字段语义；v1.0 起完全锁定

## 6. 错误与降级契约

接入方处理错误必须遵循以下行为：

| 情况 | 行为 |
|---|---|
| 不认识的块名 | 视为 `code-block`，块内容当代码显示，AST 上加 `warnings: ["unknown-block: name"]` |
| 块属性校验失败（如 slider min > max） | 整个块降级为 `code-block`，AST `warnings` 记录 |
| frontmatter YAML 解析失败 | 整个 frontmatter 视为不存在，文档继续渲染，console.warn |
| 未知主题 | 自动回退到 `default`，console.warn |
| 插件 register 抛错 | 跳过该插件，记录 console.error，继续渲染 |
| AST 节点 render 抛错 | 该节点降级为 `<pre>` 显示原始内容，其他节点继续 |
| 文档 > 接入方限制 | 在文档头部插入 `:::callout danger` 提示，但仍渲染部分内容 |

**核心原则（再次申明 P8）**：渲染器永远不能 throw 到调用方；任何错误必须在文档内可见地降级。

## 7. AI Skill 接入契约

写 AI skill 让 Claude Code / Codex 等学会输出 `.rmd` 时，必须遵守以下契约。

### 7.1 Skill 文件结构

```
skill-claude-code/
├── SKILL.md              # 入口，描述、触发词、何时启用
├── reference.md          # 块速查（精简版，< 5KB，必须包含全部 8 块）
├── examples/
│   ├── plan-comparison.rmd
│   ├── pr-explainer.rmd
│   ├── prototype.rmd
│   └── research-brief.rmd
└── output-template.md    # 默认输出模板（Mode B 壳）
```

### 7.2 默认输出形态：Mode B

skill 必须教 AI 默认输出 Mode B 形态的 HTML artifact，而不是裸 `.rmd`：

```html
<!DOCTYPE html><html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/rmd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/themes/{theme}.css">
</head><body>
<div id="rmd-root"></div>
<script type="application/rmd">
{用户的 .rmd 源文本}
</script>
<script>RMD.render({source: document.querySelector('script[type="application/rmd"]').textContent, target: document.getElementById('rmd-root'), theme: '{theme}'});</script>
</body></html>
```

`{version}` 字段由 skill 维护者在发布时锁定到具体版本，避免 CDN 漂移。

### 7.3 reference.md 内容契约

reference.md 必须包含：每个块的 1 行用途 + 1 个最小例子 + 1 句使用建议。**禁止超过 500 行**——否则 skill 加载时吃掉太多 context。

### 7.4 zero-shot 正确率验收

skill 上线前必须用 ≥ 3 个主流模型在零示例（仅加载 SKILL.md + reference.md）情况下生成 ≥ 30 份 `.rmd`，**解析无错误率 ≥ 95%**。低于此线必须重写 skill。

## 8. CDN 与版本契约

### 8.1 CDN 路径规则

```
https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/rmd.min.js
https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/rmd.esm.js
https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/themes/{theme}.css
```

`{version}` 必须为完整 semver（如 `0.1.0`），不允许 `latest` 通配——避免 sandbox 因 CDN 漂移突然失效。

镜像同步到 `cdn.jsdelivr.net/npm/@rmd/renderer@{version}/dist/...` 与 `unpkg.com/@rmd/renderer@{version}/dist/...`。

### 8.2 版本号规则（semver）

- **主版本号**：破坏契约（核心字段、AST 字段、CSS 变量等）
- **次版本号**：新增块、新增字段、新增 API
- **修订号**：bug 修复、性能改进、文档修订

v0.x 阶段的特殊规定：**任何破坏都必须通过次版本号体现**，不允许在修订号里偷偷破坏。

### 8.3 兼容性承诺时间表

| 阶段 | 承诺 |
|---|---|
| v0.1 – v0.9 | 字段名、API 签名、CSS 变量名仅在次版本号变更时允许小破坏；变更必须有迁移说明 |
| v1.0 起 | 上述全部锁定。破坏需要主版本号升级，并提供至少 12 个月并行支持 |
| 自定义字段（`x-` 前缀） | 永远不锁定，由扩展方自行管理 |

## 9. 一致性测试套件

`spec/conformance/` 目录下提供官方测试套件，任何接入方应通过以下三类测试才能自称"兼容渲染器"：

1. **CommonMark 合规**：以 CommonMark 模式解析标准 Markdown，并持续扩大官方 spec 用例覆盖；v1.0 前不得宣称 600+ 官方用例 100% 通过，除非 CI 已实际引入并锁定该套件
2. **核心块行为**：8 个核心块各 ≥ 10 个测试用例，覆盖正常 / 边界 / 错误降级
3. **三种输出模式**：每种模式各 ≥ 5 个端到端用例（生成的 HTML 在沙盒中可渲染）

`spec/conformance/runner.js` 提供测试运行入口，可被任何 JS / Node 项目集成到 CI。

## 10. 这份契约怎么演化

修订本文档遵循比 PRINCIPLES 更宽松、比 ARCHITECTURE 更严格的规则：

- 增加新块、新字段、新 API：次版本号变更，PR + 1 位核心维护者签字
- 修改已有块的属性默认值或行为：次版本号变更，PR + 2 位核心维护者签字 + 14 天 RFC
- 删除 / 重命名已有字段：主版本号变更，PR + 3 位核心维护者签字 + 30 天 RFC + 迁移指南
- 修改 §6 错误降级契约：受 P8 保护，等同 PRINCIPLES 修订流程

每次发布在 [`adr/`](./adr/) 留存"本版契约变化清单"，便于接入方追溯。
