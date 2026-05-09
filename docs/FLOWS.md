# FLOWS：Rich Markdown 关键流程设计

> **读者**：核心开发者、渲染器实现者、AI skill 作者、插件作者
> **阅读时长**：20-30 分钟
> **最近更新**：2026-05-10

## 0. 这份文档解决什么问题

`VISION.md` 说明 `.rmd` 为什么存在，`PRINCIPLES.md` 给出不可轻易破坏的设计原则，`ARCHITECTURE.md` 画出系统分层，`CONTRACT.md` 和 `DATA-MODEL.md` 定义语法与 AST 字段。

这份文档只回答一个问题：**一份 `.rmd` 从 AI 生成，到解析、渲染、交互、导出、分享、失败降级，具体走哪些步骤？**

它是实现者的流程图，不是 API 字典。凡是字段名、属性类型、AST 结构，以 `CONTRACT.md` 和 `DATA-MODEL.md` 为准；凡是设计取舍，以 `PRINCIPLES.md` 为准。本文负责把这些规则串成可执行路径。

## 1. 总流程地图

`.rmd` 的生命周期分为五段：

```
Author Time        Parse Time          Render Time         Interaction Time     Distribution Time
AI / 人写源文  ->  文本转 AST      ->  AST 转 DOM/HTML  ->  读者调状态      ->  分享 / 导出
     │                  │                  │                    │                    │
     ▼                  ▼                  ▼                    ▼                    ▼
skill 选块         frontmatter        theme 解析           slider/tabs         Mode A/B/C
输出 .rmd          core blocks        block renderer       export/copy         CDN/inline/split
可选包装 HTML      validator          runtime lazy load    状态回流给 AI       短链/文件/嵌入
```

这五段的边界必须清晰：

| 阶段 | 输入 | 输出 | 不允许做的事 |
|---|---|---|---|
| Author Time | 用户意图 + skill 参考 | `.rmd` 源文本或 Mode B artifact | 写入视觉实现细节，如颜色、像素、JS 逻辑 |
| Parse Time | `.rmd` 文本 | JSON-able AST | 访问网络、读取主题、计算交互状态 |
| Render Time | AST + 主题名 + 插件表 | DOM / HTML 字符串 | 修改 AST 语义、静默丢弃未知字段 |
| Interaction Time | DOM + runtime 状态 | UI 状态变化 / 复制内容 | 回写源文件、改变主题语义 |
| Distribution Time | 源文 / AST / HTML | Mode A/B/C 产物或链接 | 依赖 `latest` CDN、破坏离线兜底 |

核心不变量：**源文件是唯一跨阶段契约，AST 是解析与渲染之间的唯一数据契约，主题只影响样式，runtime 只维护读者当前会话状态。**

## 2. Author Time：AI 生成 `.rmd`

Author Time 的目标不是让 AI “会写一个网页”，而是让 AI 把用户意图压缩成最少、最稳定、最容易 diff 的 `.rmd` 源文。

### 2.1 输入收束

AI skill 接到用户请求后，先把任务归到一种或多种文档意图：

| 用户意图 | 推荐块 | 典型输出 |
|---|---|---|
| 方案对比 / 选型 | `grid` + `chart` + `callout` | 候选并列、量化比较、结论提示 |
| PR 解释 / 代码审查 | `diff` + `callout` + `tabs` | 改动对比、风险提示、多视角展开 |
| 原型调参 / 配置生成 | `slider` + `export` | 参数可调、复制配置或提示词 |
| 流程说明 / 发布计划 | `flow` + `tabs` | 主流程、异常分支、不同角色视角 |
| 研究简报 / 指标报告 | `chart` + `grid` + `callout` | 数据、发现、建议 |

skill 不应要求 AI 学会渲染规则，只给它三类知识：

- 块速查：每个块一行用途、一个最小例子、一句何时使用。
- 少量 few-shot：真实场景如何组合块。
- 选择启发式：什么意图用什么块，什么时候退回普通 Markdown。

### 2.2 块选择流程

```
用户请求
  │
  ▼
识别文档意图
  │
  ├─ 是否只需要普通正文？ ── 是 ─→ 输出纯 Markdown
  │
  ▼ 否
选择最少块集合
  │
  ├─ 每个块是否有明确语义价值？
  │      └─ 否：删掉，改用 Markdown
  │
  ├─ 是否把视觉写进源文件？
  │      └─ 是：改成 semantic attrs，如 emphasis=primary
  │
  └─ 是否能优雅降级？
         └─ 否：换块或退回 Markdown
```

块选择遵守“少即是稳”：一份文档只要 `grid + chart + callout` 能讲清楚，就不要额外引入 `tabs`；只要 Markdown 表格能表达，就不要为了“富”而用新块。

### 2.3 源文生成流程

AI 输出 `.rmd` 时按固定顺序组织：

1. 可选 frontmatter：只写必要字段，通常是 `title` / `theme` / `share` / `lang`。
2. 一个 H1：与 `title` 对齐，便于 CommonMark 渲染器降级。
3. 普通 Markdown 正文：承担叙述、背景和解释。
4. 扩展块：只在信息密度或交互价值明显更高时使用。
5. 结论或下一步：保持人能在读完后行动。

示例骨架：

```rmd
---
title: 支付服务限流方案对比
theme: tech-dark
share: team
---

# 支付服务限流方案对比

背景说明。

:::grid 3
...
:::

:::chart bar title="P99 延迟"
...
:::

:::callout tip
推荐结论。
:::
```

### 2.4 可选预检

只要宿主能运行解析器，Author Time 应在交付前做一次轻量预检：

```
source
  │
  ▼
parse(source)
  │
  ├─ warnings 为空？ ── 是 ─→ 交付
  │
  ▼ 否
能自动修复？
  │
  ├─ 是：修源文并重跑 parse
  └─ 否：保留源文，但在回复里指出降级位置
```

预检只能修语法层问题，例如未闭合围栏、slider 缺少 `default` 时按契约补默认。预检不能替 AI 重写语义、不能重排整篇文档，避免破坏 P2 diff 干净。

## 3. Parse Time：文本转 AST

Parse Time 的目标是把源文本稳定、可重复地转成 JSON-able AST。它必须是纯函数：同样输入永远得到同样输出。

### 3.1 解析管线

```
UTF-8 source
  │
  ▼
读取 frontmatter
  │
  ├─ YAML 成功 → frontmatter object
  └─ YAML 失败 → frontmatter={} + root warning
  │
  ▼
CommonMark 解析
  │
  ▼
识别 ::: fenced blocks
  │
  ▼
属性词法解析
  │
  ▼
按 block registry 分派
  │
  ├─ core block parser
  ├─ plugin block parser
  └─ unknown block → code-block fallback
  │
  ▼
validator 校验
  │
  ├─ 通过 → typed AST node
  └─ 失败 → code-block fallback + warnings
  │
  ▼
RmdAst
```

### 3.2 frontmatter 流程

frontmatter 是文档级元数据，不参与正文语义。

处理规则：

- 文件开头是 `---` 时尝试读取到下一个 `---`。
- YAML 只接受平凡映射；复杂对象可以出现在 `x-` 自定义字段里，但核心字段必须是契约定义的简单类型。
- `theme` 未声明时默认为 `default`，但这个默认可由渲染器在 Render Time 补齐；AST 中可以只保留作者显式声明。
- YAML 失败时不终止解析，整段 frontmatter 当作普通文本或忽略，并在根节点 `warnings` 记录。

### 3.3 围栏块识别

解析器只把形如以下结构识别为扩展块：

```rmd
:::block-name attr=value
content
:::
```

识别后做三件事：

1. 提取 `block-name` 和原始属性字符串。
2. 保存 `raw` 源片段，至少供错误降级使用。
3. 查 registry：核心块优先，其次插件块，找不到就降级。

未知块的降级结果必须仍然可读：

```json
{
  "type": "code-block",
  "lang": "rmd",
  "value": ":::unknown\n...\n:::",
  "warnings": ["unknown-block: unknown"]
}
```

### 3.4 属性规范化

属性解析遵守“宽容输入、保守输出”：

- 允许属性顺序任意。
- 允许值无引号或双引号。
- 未声明属性进入 `unknownAttrs`，不得丢弃。
- 类型转换只做显式、可预测转换：`"10"` → number，`"true"` 不自动转 boolean，除非块契约明确需要。
- 位置参数按块定义解释，如 `:::chart bar` 的 `bar`。

解析器不得重新格式化属性行。格式化工具如未来存在，也必须默认保持原文。

### 3.5 校验与降级

每个块 parser 只负责从原始内容生成候选节点，validator 负责契约校验：

| 块 | 关键校验 | 失败行为 |
|---|---|---|
| `chart` | 类型合法、数据非空、系列长度一致 | 类型非法降级；系列不一致可截断并 warning |
| `grid` | 列数 1-6、cell ≤ 12、不嵌套 grid | 严重错误降级；超额截断并 warning |
| `slider` | name 合法且唯一、max > min、step > 0 | 非法 name 降级；重复 name 忽略运行时注册 |
| `export` | format 合法、references 可扫描 | format 非法改默认或降级 |
| `flow` | 能解析出 edges | 无 edge 时降级为 code-block |
| `diff` | 行前缀可识别 | 不可识别行作为 context |
| `tabs` | 至少一个 panel、default 存在 | default 缺失改第一个并 warning |

原则：**能保留语义就 warning，语义不可信才降级。**

## 4. Render Time：AST 转 HTML / DOM

Render Time 的目标是把 AST 可视化，同时保持主题边界、错误隔离和三种输出模式一致。

### 4.1 渲染入口

渲染器提供三个入口，它们共享同一条内部管线：

```ts
renderer.parse(source): RmdAst
renderer.render({ source, target, theme }): void
renderer.renderToString({ source, theme, mode }): string
```

内部流程：

```
source 或 AST
  │
  ├─ 如果是 source：parse(source)
  ▼
解析 theme name
  │
  ├─ 已知主题 → 加载对应 CSS
  └─ 未知主题 → default + warning
  │
  ▼
遍历 AST children
  │
  ├─ CommonMark renderer
  ├─ core block renderer
  └─ plugin block renderer
  │
  ▼
生成 DOM / HTML string
  │
  ▼
扫描是否需要 runtime
  │
  ├─ 无交互块 → 不加载 runtime
  └─ 有交互块 → 加载 runtime 并 hydrate
```

### 4.2 节点渲染规则

所有扩展块渲染出的 DOM 必须带稳定标记：

```html
<section class="rmd-block rmd-chart" data-rmd-block="chart">
  ...
</section>
```

这些标记有三层用途：

- 主题 CSS 定位样式。
- runtime 查找可交互节点。
- 测试套件做结构断言。

渲染器不应把块语义藏在匿名 `<div>` 里，也不应让主题依赖脆弱的 DOM 层级选择器。

### 4.3 输出模式流程

三种输出模式共享同一份 AST 和主题语义，只改变资源装配方式。

| 模式 | 装配方式 | 适用场景 | 关键约束 |
|---|---|---|---|
| Mode A self-contained | CSS/JS/源文全部内联 | 邮件、归档、离线、sandbox 兜底 | 零外部依赖 |
| Mode B inline + CDN | 源文内联，renderer/theme 走 CDN | AI artifact 默认、博客嵌入 | CDN version 必须锁定 semver |
| Mode C split files | HTML 引用本地 JS/CSS | 本地开发、桌面客户端、Web 集成 | 不作为 AI 默认输出 |

Mode B 的 artifact 生成流程：

```
.rmd source
  │
  ▼
选择主题与 renderer version
  │
  ▼
HTML shell 模板
  │
  ├─ <script src=".../{version}/rmd.min.js">
  ├─ <link href=".../{version}/themes/{theme}.css">
  └─ <script type="application/rmd">{source}</script>
  │
  ▼
artifact.html
```

禁止使用 `latest`、`next`、未锁版本 CDN。否则同一份 artifact 可能在未来突然改变渲染结果。

### 4.4 主题加载与切换

主题只通过 CSS 变量和稳定类名工作。

主题切换流程：

```
用户选择 theme
  │
  ▼
resolve theme URL
  │
  ├─ 已加载 → 替换 active link
  └─ 未加载 → loadTheme(url)
  │
  ▼
替换 <link data-rmd-theme>
  │
  ▼
浏览器重算 CSS
```

主题切换不得触发：

- 重新 parse。
- 重新生成 AST。
- 修改 DOM 内容。
- 改变 `export` 输出。
- 改变 `chart` 的数据含义。

如果某个主题需要这些能力，说明它不是主题，而是插件或宿主应用功能。

## 5. Interaction Time：读者状态与回流

Interaction Time 是 `.rmd` 区别于普通 Markdown 的关键：读者不只是看文档，还能调参数、切视角、复制结果，把反馈带回 AI 或代码。

### 5.1 runtime 初始化

runtime 只在文档包含交互块时加载。交互块包括：

- `slider`
- `export`
- `tabs`
- 未来可能加入的 `select` / `accordion`

初始化流程：

```
DOM ready
  │
  ▼
扫描 [data-rmd-block]
  │
  ├─ slider → 注册变量
  ├─ export → 绑定模板
  └─ tabs → 绑定 panel 状态
  │
  ▼
创建 documentState
  │
  ▼
绑定事件委托
```

`documentState` 是运行时状态，不属于 AST：

```ts
interface DocumentState {
  sliders: Record<string, number>;
  activeTabs: Record<string, string>;
}
```

它只在当前页面会话中存在。刷新页面后恢复默认值，除非宿主应用显式提供状态持久化。

### 5.2 slider 流程

```
用户拖动 slider
  │
  ▼
读取 name/value
  │
  ▼
校验 value 在 min/max/step 内
  │
  ▼
更新 documentState.sliders[name]
  │
  ▼
派发 rmd:statechange 事件
  │
  ▼
刷新依赖该变量的 export preview（如有）
```

slider 不能直接修改源文，也不能修改 AST。它只是改变 runtime state。

重复 slider name 的处理：

- 第一个合法 slider 注册变量。
- 后续重复 name 的 slider 显示 warning 状态，但不进入变量表。
- `export` 引用该变量时使用第一个 slider 的值。

### 5.3 export 流程

`export` 是“人重新进入循环”的主通道。它把当前读者状态转成可复制文本。

```
用户点击 export
  │
  ▼
读取 template
  │
  ▼
扫描 {{var}} references
  │
  ├─ var 存在 → 替换为当前值
  └─ var 缺失 → 替换为 [未定义:var] + warning
  │
  ▼
按 format 生成 clipboard payload
  │
  ├─ text
  ├─ markdown
  └─ json
  │
  ▼
写入剪贴板
  │
  ├─ 成功 → 按钮短暂显示成功状态
  └─ 失败 → 显示可手动复制的 textarea
```

剪贴板失败必须有手动兜底，因为很多 sandbox、iframe、文件协议环境会限制 Clipboard API。

### 5.4 tabs 流程

tabs 只改变可见 panel，不改变文档内容：

```
点击 tab label
  │
  ▼
更新 activeTabs[tabsId]
  │
  ▼
切换 aria-selected / hidden
  │
  ▼
派发 rmd:statechange
```

无 JS 或导出 PDF 时，tabs 按顺序展开为多个小节。这样读者永远不会因为没有 runtime 而丢内容。

## 6. Plugin Flow：第三方块如何进入系统

插件是 `.rmd` 的扩展边界，但它必须服从核心流程。

### 6.1 注册时机

插件注册发生在 parse 之前：

```
createRenderer({ plugins })
  │
  ▼
for plugin in plugins
  │
  ├─ 检查 manifest
  ├─ 检查 compatRange
  └─ plugin.register(api)
  │
  ▼
冻结 registry
  │
  ▼
开始 parse/render
```

registry 冻结后，不允许运行时热插拔插件。这样同一份源文不会因为页面中途加载插件而生成不同 AST。

### 6.2 插件块流程

插件块必须提供三件事：

- `parse`：原始内容 + attrs → AST 节点。
- `render`：AST 节点 → DOM / HTML string。
- `fallback`：无法渲染时 → 可读的降级节点。

流程：

```
遇到 :::custom
  │
  ├─ registry 有 custom？
  │      └─ 否 → code-block fallback
  ▼ 是
plugin.parse
  │
  ├─ 成功 → plugin AST node
  └─ 抛错 → code-block fallback + warning
  │
  ▼
plugin.render
  │
  ├─ 成功 → DOM/HTML
  └─ 抛错 → plugin.fallback → render fallback
```

插件不得：

- 修改 CommonMark 行为。
- 拦截核心块。
- 修改其他插件的输出。
- 注册主题。
- 在注册阶段访问网络。

## 7. Error Flow：失败如何继续

`.rmd` 的错误处理目标不是“没有错误”，而是“错误局部可见、整体继续可读”。

### 7.1 错误隔离层级

```
文档级错误
  └─ frontmatter 失败、文档过大、版本不兼容

块级错误
  └─ unknown block、属性非法、内容格式不可信

节点渲染错误
  └─ renderer 抛错、插件缺失、SVG/DOM 生成失败

runtime 错误
  └─ Clipboard API 失败、变量缺失、事件绑定失败
```

每一级错误只能影响当前级别的最小范围：

- frontmatter 失败不能影响正文渲染。
- 一个 `chart` 失败不能影响后面的 `callout`。
- 一个插件失败不能影响核心块。
- Clipboard 失败不能影响 slider 和 tabs。

### 7.2 错误可见性

开发模式下：

- `console.warn` / `console.error` 输出详细信息。
- DOM 节点带 `data-rmd-warning`。
- 可选显示调试面板。

生产模式下：

- 页面内只显示必要的可读降级。
- 不暴露堆栈或宿主路径。
- 保留 `warnings` 供测试和宿主应用读取。

### 7.3 “永不 throw 到调用方”

渲染器公共入口应捕获内部错误：

```ts
try {
  renderer.render({ source, target });
} catch (error) {
  // 这是渲染器 bug。正常实现不应该让调用方走到这里。
}
```

契约层要求：正常数据错误必须转成 warning 或 fallback，而不是抛出到调用方。只有编程错误（如 target 不是 DOM 节点）可以抛 TypeError。

## 8. Distribution Flow：构建、分享与归档

Distribution Time 把 `.rmd` 变成读者能打开的东西。它必须保留两件事：结果可复现、源文可追溯。

### 8.1 build 流程

```
rmd build doc.rmd --mode A/B/C
  │
  ▼
读取 source
  │
  ▼
parse + validate
  │
  ├─ warnings 超过阈值？
  │      ├─ 否 → 继续
  │      └─ 是 → 输出 warnings，但仍可构建
  ▼
renderToString
  │
  ▼
按模式装配资源
  │
  ▼
写出 HTML / dist files
```

构建不应因为普通 warning 失败。CI 或宿主应用可以选择把 warning 当成失败，但核心工具默认应让文档可打开。

### 8.2 分享流程

v0.1 没有 `rmd.sh`，分享主要靠 Mode A/B HTML 或宿主应用。

未来短链服务流程：

```
用户上传 .rmd 或 HTML artifact
  │
  ▼
服务端解析 frontmatter
  │
  ▼
校验 share 字段与大小限制
  │
  ▼
存储源文 + renderer version
  │
  ▼
生成短链
  │
  ▼
读者打开短链 → 固定版本 renderer 渲染
```

短链必须记录 renderer version，而不是永远使用最新版本。否则旧文档的视觉或交互可能漂移。

### 8.3 归档流程

长期归档优先使用 Mode A：

- HTML 自包含。
- 内含源文或 AST。
- 记录 renderer version、theme version、构建时间。
- 不依赖 CDN、字体服务或短链服务。

归档产物应能在断网浏览器里打开，并且至少显示静态 fallback。

## 9. Verification Flow：如何证明实现没跑偏

每条关键流程都有对应的验证方式。

| 流程 | 必测内容 | 证据 |
|---|---|---|
| Author Time | skill 生成的 `.rmd` 能被解析 | zero-shot 样本通过率 ≥ 95% |
| Parse Time | CommonMark + 8 核心块 + 错误恢复 | `spec/conformance` 通过 |
| Render Time | 三种输出模式一致 | Playwright 截图 / DOM 结构断言 |
| Interaction Time | slider/export/tabs 状态正确 | 浏览器端 E2E |
| Theme Flow | 切主题不改 DOM 语义 | DOM 快照对比 |
| Plugin Flow | 插件失败局部降级 | 插件异常测试 |
| Error Flow | 任一块失败不影响整页 | fallback 测试 |
| Distribution Flow | Mode A 离线可打开，Mode B 锁版本 | 离线测试 + HTML 检查 |

v0.1 发布前至少要有四类端到端样本：

- `plan-comparison.rmd`：grid/chart/callout。
- `pr-explainer.rmd`：diff/tabs/callout。
- `prototype.rmd`：slider/export。
- `workflow.rmd`：flow + 错误分支。

每个样本都要生成 Mode A、Mode B、Mode C，并在测试中确认：

- 解析无 fatal error。
- 未知块可降级。
- 无 JS 环境内容仍可读。
- 交互块在浏览器中可操作。
- 同主题下三种模式的可见结果一致。

## 10. 与其他文档的边界

| 问题 | 看哪篇 |
|---|---|
| 为什么要做 `.rmd` | `VISION.md` |
| 发生设计冲突时谁优先 | `PRINCIPLES.md` |
| 系统模块和技术选型 | `ARCHITECTURE.md` |
| 块语法、主题、插件 API 契约 | `CONTRACT.md` |
| AST 字段和不变量 | `DATA-MODEL.md` |
| 一份 `.rmd` 实际长什么样 | `QUICKSTART.md` |
| 一份 `.rmd` 如何穿过系统 | 本文 |

一句话总结本文：**`.rmd` 的流程设计让 AI 写意图、解析层产稳定 AST、渲染层负责呈现、runtime 承担会话交互、分发层固定版本与资源；任何失败都局部降级，任何主题都不改语义。**
