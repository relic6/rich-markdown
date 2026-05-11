# ARCHITECTURE：Rich Markdown 架构概览

> **读者**：核心开发者、想为项目贡献代码或写第三方实现的工程师
> **阅读时长**：20–30 分钟
> **最近更新**：2026-05-10

## 0. 这份文档怎么读

这是一份**设计阶段**的架构说明，目的是让任何有能力为 `.rmd` 写代码的人，能在半小时内对系统的"形状"建立完整心智模型，并知道：

- 系统由哪些模块构成、各自职责是什么
- 数据从源文件到屏幕走完了哪几道工序
- 哪些扩展点是开放的、哪些是封闭的
- 哪些功能在 v0.1 必须、哪些可以延后、哪些永远不做
- 关键技术选型的理由（避免后人重复争论）

更细的接口形态见 [`CONTRACT.md`](./CONTRACT.md)，AST 字段定义见 [`DATA-MODEL.md`](./DATA-MODEL.md)，写期/读期的具体步骤见 [`FLOWS.md`](./FLOWS.md)。本文不重复它们的内容。

## 1. 系统总览

```
┌──────────────────────────────────────────────────────────────────────┐
│                          作者侧（Author Time）                        │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐                   │
│  │  AI      │ →  │  Skill / │ →  │   .rmd       │                   │
│  │ Client   │    │  Plugin  │    │   源文件     │                   │
│  └──────────┘    └──────────┘    └──────┬───────┘                   │
│  Claude Code     提供块速查表            │                           │
│  Codex / etc.    + few-shot              │                           │
└──────────────────────────────────────────┼───────────────────────────┘
                                           │  写入 / 提交 / 分享
                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      读者侧（Read / Render Time）                    │
│                                                                      │
│   ┌────────────┐   ┌──────────┐   ┌────────────┐   ┌─────────────┐  │
│   │  .rmd      │ → │  Parser  │ → │  AST(JSON) │ → │  Renderer   │  │
│   │  text      │   │          │   │            │   │             │  │
│   └────────────┘   └──────────┘   └────────────┘   └──────┬──────┘  │
│                         ▲                                  │         │
│                         │ extension                        ▼         │
│                    ┌────┴─────┐                  ┌──────────────┐    │
│                    │ Block    │                  │  HTML+CSS+JS │    │
│                    │ Plugins  │                  │  (in-page)   │    │
│                    └──────────┘                  └──────┬───────┘    │
│                                                         │            │
│                                                         ▼            │
│                                           ┌──────────────────────┐   │
│                                           │  Theme (CSS vars)    │   │
│                                           │  + Interactive       │   │
│                                           │    Runtime (~10KB)   │   │
│                                           └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

这张图同时展示了两件事：

- **作者侧**：AI 客户端通过 skill / plugin 学会 `.rmd` 块语法，产出 `.rmd` 源文件。
- **读者侧**：源文件经过解析层 → AST → 渲染层 → 注入主题与交互运行时，最终在浏览器/客户端里成为可视、可交互的页面。

两侧通过 **`.rmd` 源文件**这唯一的契约对接。这意味着：作者侧根本不需要知道渲染器存在，渲染器也不需要知道源文件是 AI 还是人写的——它们只通过文本通信。这是"格式即协议"的好处。

## 2. 三层架构展开

PRINCIPLES 里的三层心智模型在工程上对应三组模块：

### 2.1 源文件层（Source Layer）

**只有一种制品：纯文本 `.rmd` 文件。**

- 文件后缀：`.rmd`（推荐）/ `.md`（向下兼容，需要在 frontmatter 里 `format: rmd` 显式声明）
- 编码：UTF-8 强制
- frontmatter：YAML，可选；定义元数据如 `title` / `theme` / `share` / `version`
- 块语法：CommonMark 全集 + `:::block-name [attrs]\n...\n:::` 围栏块扩展
- **它不是数据结构，它就是文本**——这是 P1（CommonMark 兼容）和 P2（diff 干净）的物理基础

源文件层无代码模块。它是约定，不是软件。

### 2.2 解析层（Parse Layer）

**职责**：把文本变成结构化 AST。

模块构成：

| 模块 | 职责 | 依赖 |
|---|---|---|
| `@rmd/parser-core` | CommonMark 解析 + 围栏块识别 | `markdown-it`（外部，浏览器 bundle 约 170KB raw）|
| `@rmd/blocks-core` | 8 个核心块的语法注册（chart/grid/callout/slider/export/flow/diff/tabs）| `parser-core` |
| `@rmd/ast` | AST 节点类型定义、序列化、版本标识 | 无 |
| `@rmd/validator` | 块属性校验（min/max、必填、枚举）| `ast` |

**关键设计**：
- 解析层**输出**严格的 JSON-able AST（见 `DATA-MODEL.md`）
- 解析层**不知道**渲染或主题的存在——它只产数据
- 不认识的 `:::xxx` 块降级为 `code-block` 节点（满足 P8 优雅降级）
- 解析必须是**幂等且无副作用**的：同样输入永远同样输出

**为什么不自己写 CommonMark 解析器**：
- CommonMark 规范有 600+ 测试用例，自己实现的 ROI 极低
- `markdown-it` 是成熟度 / CommonMark 覆盖 / 可扩展性的最佳平衡；代价是浏览器 bundle 会明显大于手写轻量解析器
- 备选 `marked.js` API 简单但扩展弱；`unified/remark` 模块化最好但体积大
- **决定**：v0.1 用 `markdown-it` + RMD 围栏块预扫描。如未来需要更小体积或更强类型，再考虑替换（届时 AST 接口已经稳定，替换不影响下游）

### 2.3 渲染层（Render Layer）

**职责**：把 AST 变成 HTML/CSS/JS，并按主题决定视觉。

模块构成：

| 模块 | 职责 | 大小目标 |
|---|---|---|
| `@rmd/renderer-core` | AST 遍历、节点 → DOM 转换、降级处理 | ~15KB gz |
| `@rmd/runtime` | 交互块的运行时（slider 状态、export 按钮、tab 切换）| ~10KB gz |
| `@rmd/charts-mini` | 内置极简 SVG 图表（bar/line/pie）| ~8KB gz |
| `@rmd/flow-mini` | 内置流程图渲染（含分支）| ~6KB gz |
| `@rmd/themes/*` | 主题包，纯 CSS + 配置 | 每个 ~5KB gz |

**核心渲染 + 运行时合计目标 < 30KB gzipped**（满足 PRINCIPLES P5 的精神延伸：渲染器自己也要克制体积）。完整浏览器 parser bundle 是单独预算；如果某次发版超出，触发 ADR 评审。

**为什么用 vanilla JS、不用 React/Vue**：
- 框架本身 30-50KB，吃掉整个体积预算
- `.rmd` 渲染器要嵌入到任何宿主（普通网页、Notion 插件、VSCode 预览）——框架会和宿主冲突
- 交互模型简单：滑块改值 → 触发 export 模板替换。Web Components + 事件委托足够
- **决定**：v0.1 vanilla JS + 极少量 Web Components。v0.2 评估 lit-html（5KB）以提升组件可维护性

**为什么不用 Mermaid 做流程图**：
- Mermaid 解压后 ~700KB，单独加载也要 200KB+
- 我们 v0.1 的 `:::flow` 只支持线性 + 简单分支，自己写 SVG 渲染 < 6KB
- v0.2 提供 `:::diagram` 块作为 Mermaid 兼容入口（按需懒加载，不进核心包）

**为什么不用 Chart.js**：
- 同上，Chart.js 80KB。v0.1 的图表需求只有 bar/line/pie 三类
- 自己写极简 SVG 图表（≈300 行代码、8KB），覆盖 80% 场景
- 高级图表（散点、热力图、地图等）走 v0.2 插件路线

## 3. 数据流：写期 vs 读期

### 3.1 写期（AI 生成 `.rmd`）

```
用户提示（"写一份方案对比"）
        │
        ▼
AI 客户端（Claude Code / Codex / ...）
        │
        │  加载 rich-markdown skill
        │  ├─ 块语法速查（500 行 md）
        │  ├─ Few-shot 示例（5 个真实 .rmd）
        │  └─ 决策启发式（什么场景用什么块）
        ▼
模型推理 → 输出 .rmd 文本
        │
        ▼
写入文件系统 / 返回给用户
```

**关键约束**：
- skill 的"块速查 + few-shot"必须 < 5KB（一次加载不爆 context）
- skill 不要求 AI 学习渲染细节，只学"什么场景用什么块"
- AI 输出的 `.rmd` 必须能被解析层零容忍解析（否则 skill 失败，需要更多 few-shot）

### 3.2 读期（浏览器渲染 `.rmd`）

```
.rmd 文本（来自文件 / fetch / iframe）
        │
        ▼
parser-core 解析 ─→ blocks-core 识别块 ─→ validator 校验属性
        │
        ▼
AST (JSON)
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
renderer-core 遍历      可选：序列化导出（供其他工具消费）
        │
        ▼
DOM 节点（带 data-rmd-block 标记）
        │
        ▼
主题 CSS 加载（<link rel="stylesheet" href="themes/{theme}.css">）
        │
        ▼
runtime 注册交互块事件（仅当文档含交互块）
        │
        ▼
用户可见 + 可交互
```

**关键约束**：
- 整个读期流程必须能在 **< 100ms**（典型 50KB `.rmd`）完成首次渲染
- 主题切换是**纯 CSS 替换**，不重新解析、不重新渲染 DOM——只改 `<link>` 的 href
- 交互运行时**懒加载**：文档若不含 `:::slider` / `:::export` / `:::tabs` 等，runtime 根本不下载

### 3.3 三种渲染输出模式（必须全部支持）

不同的宿主环境对"能加载几个文件"的限制天差地别。我们必须从一开始就支持三种输出形态，且**任何一份 `.rmd` 都能在三种模式间无损切换**：

```
        模式 A：单文件内联                 模式 B：内联 + CDN              模式 C：多文件分离
        (Self-Contained)                  (Inline + CDN)                 (Split Files)
   ┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
   │  .html               │         │  .html               │         │  .html  ─→ refs  │
   │  ├ <style> 全部内联  │         │  ├ <link href=cdn>   │         │  theme.css       │
   │  ├ <script> JS 内联  │         │  ├ <script src=cdn>  │         │  runtime.js      │
   │  └ <script type=rmd> │         │  └ <script type=rmd> │         │  charts.js       │
   │      AST/源文 内联   │         │      源文 内联       │         │                  │
   └──────────────────────┘         └──────────────────────┘         └──────────────────┘
   适用：邮件附件、归档、              适用：Claude 桌面版 artifact、     适用：本地开发、桌面
        离线分发、Claude artifact      博客嵌入、Notion 嵌入            客户端、Web 应用集成
   体积：约 50-150KB                  体积：约 5-30KB（仅源文 + 壳）   体积：HTML 极小
```

**模式 A：单文件内联（Self-Contained）**

`rmd build --inline demo.rmd > demo.html` 产出一个完全自包含的 HTML：

- 主题 CSS、运行时 JS、字体（必要时）全部内联进 `<style>` 和 `<script>`
- AST 或源文本嵌在 `<script type="application/rmd">` 标签里
- 体积偏大（典型 50-150KB），但**零外部依赖**
- 适合邮件附件、长期归档、断网环境、SaaS 沙盒
- **是 Claude 桌面版 artifact 的兼容兜底**

**模式 B：内联 + CDN 渲染器（Inline + CDN）**

源文档保留为短小的 `.rmd` 文本，渲染器和主题从公共 CDN 加载：

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/0.1.0/rmd.min.js"></script>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/0.1.0/themes/tech-dark.css">
</head>
<body>
  <div id="rmd-root"></div>
  <script type="application/rmd">
# 季度业绩
:::chart bar
Q1 100
Q2 150
Q3 220
Q4 380
:::
  </script>
  <script>
    RMD.render({
      source: document.querySelector('script[type="application/rmd"]').textContent,
      target: document.getElementById('rmd-root'),
      theme: 'tech-dark'
    });
  </script>
</body>
</html>
```

- 适合 Claude 桌面版、Web 嵌入、博客文章
- **是 AI agent 输出 .rmd 时的默认推荐形态**——skill 教 AI 输出的就是这个壳
- 整份 artifact 的 token 成本 ≈ `.rmd` 源文本 + ~30 行壳，比同等表现力的 HTML 节省 5-10×
- CDN 必须发布到主流 artifact 沙盒的白名单域（cdnjs / jsdelivr / unpkg）

**模式 C：多文件分离（Split Files）**

经典的 Web 工程结构，HTML 引用同目录下的 `theme.css` 和 `runtime.js`：

- 适合本地开发（热重载方便）、桌面客户端预装（renderer 走 NPM）、Web 应用集成
- **不能用于 sandbox 类 artifact**（如 Claude 桌面版）——相对路径会 404

**强约束（写入 PRINCIPLES 候选清单）**：

- **同一份 `.rmd`，在三种模式下渲染结果必须像素级一致**——主题不能因为加载方式不同而改变。
- **Mode A 是兜底**：任何环境只要支持单 HTML 文件就能用。
- **Mode B 是 AI 默认**：skill 必须教 AI 输出 Mode B 形态的 artifact，而不是裸 `.rmd` 或纯 HTML。
- **Mode C 仅供工程内部**：不应该出现在 AI 输出或分享链接中。

### 3.4 第四种模式：CLI 编程接入

`rmd build` / `rmd render` / `rmd open` 只是上面三种模式的命令行包装。它们不是新模式，而是封装：

```bash
rmd build doc.rmd                       # 默认 Mode B（CDN）
rmd build doc.rmd --inline              # Mode A（自包含）
rmd build doc.rmd --split --out ./dist/ # Mode C（多文件）
rmd open doc.rmd                        # 启动本地服务器 + 浏览器，调试用
```

CLI 不是 v0.1 必须，但 ARCHITECTURE 必须为它留好接口——`renderer-core` 必须能在 Node 调用、能返回字符串/AST/HTML，而不只是浏览器 DOM 操作。

## 4. 扩展点

`.rmd` 的扩展性是分层开放的。下表明确什么开放、什么封闭：

| 扩展点 | 是否开放 | 通过什么 | 谁可以做 |
|---|---|---|---|
| 新块（`:::xxx`） | ✅ 开放 | `registerBlock(name, parser, renderer)` | 第三方插件 |
| 新主题 | ✅ 开放 | CSS 变量 + slot 接口 | 任何人 |
| 自定义图表实现 | ✅ 开放 | `registerChartType(type, renderFn)` | 第三方插件 |
| 自定义 export 目标 | ✅ 开放 | `registerExporter(name, fn)`（如导出到 Slack） | 第三方插件 |
| frontmatter 字段 | ⚠️ 半开放 | 自定义字段允许，但不能改核心字段语义 | 渲染器实现者 |
| 修改 CommonMark 行为 | ❌ 关闭 | 受 P1 保护 | 任何人都不可以 |
| 主题改 DOM 结构/语义 | ❌ 关闭 | 受 P6 保护 | 任何人都不可以 |
| AST 节点类型 | ❌ 关闭（v0.1）/ ⚠️（v1.0+）| 核心团队评审 | 仅核心团队 |

**插件系统的核心设计**：

- 插件是 ES 模块，导出 `{ name, version, register(api) }`
- 插件在解析前注册（同步）；运行时不允许动态注册（保证 AST 可重现）
- 插件有版本号，渲染器在 AST 中记录"这份文档需要哪些插件"，缺失时走 P8 降级
- 详见 `CONTRACT.md` 第 4 章

## 5. 分发产物

`.rmd` 项目对外发布的实体很少，刻意保持精简。**注意区分"建造产物（packages）"和"运行时产物（dist artifacts）"**——前者给开发者 import，后者给浏览器 / artifact / CDN 直接用。

### 5.1 建造产物（npm packages）

| 包名 | 形态 | 用途 | v0.1? |
|---|---|---|---|
| `@rmd/renderer` | npm 包，多入口 | 浏览器/Node 引入；包含下文所有 dist 文件 | ✅ |
| `@rmd/themes-default` | npm 包 | 默认 + 3 套官方主题 CSS | ✅ |
| `@rmd/skill-claude-code` | git 仓库目录 | Claude Code skill 文件 | ✅ |
| `rmd` | npm 命令 | `rmd init` / `rmd open` / `rmd build` / `rmd preview` | ⏳ v0.2 |
| `@rmd/skill-codex` | git 仓库目录 | Codex 用 skill | ⏳ v0.2 |
| `@rmd/skill-cherry-studio` | git 仓库目录 | Cherry Studio 用 skill | ⏳ v0.2 |
| `vscode-rmd` | VSCode 插件 | 编辑预览、语法高亮 | ⏳ v0.2 |
| `rmd.sh` | Web 服务 | 上传 → 短链分享 | ⏳ v1.0 |
| `@rmd/desktop` | Electron 应用 | Obsidian-like 客户端 | ⏳ v2.0 |

### 5.2 运行时产物（dist artifacts）

`@rmd/renderer` 实际向 CDN / 浏览器交付的物理文件：

| 文件 | 用途 | 体积目标 (gz) | 出现在哪种模式 |
|---|---|---|---|
| `rmd.min.js`（IIFE） | 浏览器 `<script src>` 直接用，挂在全局 `window.RMD`，包含完整 CommonMark parser | 当前约 170KB raw / 待 gzip 预算化 | Mode B 默认 |
| `rmd.esm.js` | 现代构建工具 import，可 tree-shake | < 25KB | Mode C / 集成 |
| `rmd-inline.html.tpl` | 模板文件，CLI 用它生成 Mode A 自包含 HTML | < 30KB（含运行时）| Mode A |
| `themes/{name}.css` | 主题样式，独立加载 | 每个 < 5KB | 任一模式 |
| `themes/{name}.inline.css` | 主题的 `<style>` 内联版本 | 每个 < 5KB | Mode A |

**CDN 部署**：

```
https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/rmd.min.js
https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/{version}/themes/tech-dark.css
```

也镜像到 jsdelivr 和 unpkg。版本号严格遵循 semver。

### 5.3 仓库结构（monorepo, pnpm workspace）

```
rich-markdown/
├── docs/                  # 这套文档
├── spec/                  # 形式化规范、测试用例
├── packages/
│   ├── ast/
│   ├── parser-core/
│   ├── blocks-core/
│   ├── renderer-core/
│   ├── runtime/
│   ├── charts-mini/
│   ├── flow-mini/
│   ├── themes-default/
│   └── cli/               # v0.2 启用
├── skills/
│   ├── claude-code/
│   ├── codex/             # v0.2
│   └── cherry-studio/     # v0.2
└── examples/              # 真实 .rmd 样本（含三种输出模式各一份）
```

## 6. 关键技术选型决策（速记）

每条决策都应该**未来在 ADR 里展开一篇**。这里只列决策本身和一句理由，避免后人重复争论。

| # | 决策 | 一句话理由 |
|---|---|---|
| TD-001 | Parser 用 markdown-it，不用 marked / remark | 体积 / 扩展性 / 成熟度三角的最佳点 |
| TD-002 | AST 用 JSON，不用 AST 类实例 | 跨语言、可序列化、可被 LLM 直接读写 |
| TD-003 | Renderer 用 vanilla JS，不用 React/Vue | 体积预算 + 嵌入兼容性 |
| TD-004 | 主题用 CSS 变量 + CSS 文件，禁止 JS | 强制 P6（主题不改语义）在物理上无法被破坏 |
| TD-005 | 内置极简 chart / flow 渲染器，不引 Chart.js / Mermaid | 体积控制；高级需求走插件 |
| TD-006 | 插件系统同步注册、不可热插拔 | AST 可重现性优先 |
| TD-007 | runtime 仅在文档含交互块时下载 | 静态文档零运行时成本 |
| TD-008 | CLI 不进 v0.1 | 浏览器渲染器先验证体验，CLI 是工程化包装，可延后 |
| TD-009 | 第一个 skill 目标平台是 Claude Code | 团队最熟、生态最近、反馈回路最短 |
| TD-010 | 短链分享服务（rmd.sh）不进 v0.1 | v0.1 用本地 HTML / S3 即可分享，验证再投入 |
| TD-011 | 三种输出模式（A 内联 / B 内联+CDN / C 多文件）必须从 v0.1 起全部支持 | sandbox 类宿主（Claude 桌面版 artifact、邮件、博客嵌入）只接受单 HTML 文件 |
| TD-012 | CDN 分发首选 cdnjs.cloudflare.com，备选 jsdelivr / unpkg | Anthropic artifact 沙盒的 CDN 白名单要求；其他客户端通常也认这几个 |
| TD-013 | AI skill 默认输出 Mode B（内联 + CDN）而非裸 `.rmd` 或纯 HTML | 兼顾 Claude 桌面版可直接渲染 + token 极省 + 一键分享 |

## 7. 范围圈定

### 7.1 v0.1（首发，目标 6 个月内）

**必须**：
- 解析层完整（CommonMark + 8 核心块）
- 渲染器（核心 + runtime + mini chart + mini flow）< 30KB gz
- 三种输出模式（A 内联 / B CDN / C 多文件）全部跑通
- 3 套官方主题
- Claude Code skill
- 文档 1-9 全部完成
- 一个真实可访问的在线 demo（GitHub Pages 即可）
- **`examples/claude-desktop-demo.rmd` + 实测脚本**：在 Claude 桌面版 chat 里复制粘贴 Mode B artifact，确认能直接渲染。这是 ARCHITECTURE TD-011/TD-013 的现实兑现证据，没有它视为 v0.1 不达标。

**充分但非必须**：
- 简易在线 playground（输入 .rmd 即时渲染）
- npm 包发布到公开 registry

### 7.2 v0.2（迭代期，6-12 个月）

- CLI（`rmd open / build / preview`）
- VSCode 插件（语法高亮 + 预览）
- 第三方块插件 API 公开
- 4 个新块（diagram / stats / timeline / compare）
- Codex 和 Cherry Studio 的 skill
- 主题包发布规范

### 7.3 v1.0（成熟期，12-18 个月）

- 短链分享服务 `rmd.sh`
- 主题市场（提交 / 浏览 / 评分）
- 跨语言 SDK（Python 解析器作为优先）

### 7.4 v2.0+（长期）

- Obsidian-like 桌面客户端
- 实时协作（如果有强需求）
- Notion / Confluence / Slack 等平台的渲染插件

### 7.5 永远不做

- **WYSIWYG 富文本编辑器在核心包里**：违反 VISION 边界，留给生态
- **认证 / 权限 / 审计在核心包里**：那是平台的事，不是格式的事
- **服务端渲染作为核心交付**：让用户基于 renderer-core 自己造，不绑死他们的后端栈
- **打破 CommonMark 兼容**：受 P1 保护，永久不可
- **闭源核心**：开源协议（MIT / Apache-2.0 二选一，由 ROADMAP 确定）

## 8. 性能与质量目标

| 维度 | 目标 | 说明 |
|---|---|---|
| 首次渲染时延 | < 100ms（50KB 文档，桌面 Chrome） | 包括 fetch 之外的全部时间 |
| 核心包体积 | < 30KB gz | renderer-core + runtime + 内置图表，不含完整 CommonMark parser |
| 主题切换时延 | < 16ms（一帧） | 纯 CSS 替换 |
| 解析吞吐 | > 5MB/s（V8） | 大文档不卡顿 |
| AI 生成 .rmd 的零示例正确率 | ≥ 95% | 由 PRINCIPLES P4 强制 |
| 单元测试覆盖率 | ≥ 85%（核心包） | CI 强制 |
| CommonMark 合规 | 100%（官方测试用例）| CI 强制 |

## 9. 这份架构怎么演化

- **AST 字段**：新增字段需要 ADR；删除/重命名字段视为 breaking change，需要主版本升级
- **插件 API**：semver 严格遵守；v0.x 阶段允许小版本破坏，v1.0 起锁定
- **核心包大小预算**：每次 PR 自动报告核心 runtime 体积和浏览器 parser bundle 体积；核心 runtime 超出 30KB 或浏览器 bundle 异常增长必须有 ADR 解释
- **主题接口**：CSS 变量名约定为 `--rmd-*` 前缀，新增需要走主题包评审

任何架构上的重大变化（新增模块、调整层次、引入新依赖）必须先写 ADR，标题格式 `adr/NNNN-title.md`，详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。
