# PROGRESS：工程进度与待办

> **读者**：当前 / 新进开发者、想接手某个子任务的贡献者、想了解项目"到哪儿了"的协作者
> **阅读时长**：5–10 分钟
> **最近更新**：2026-05-12
> **文档版本**：v0.2-snapshot（与代码同步）

## 0. 这份文档怎么读

- 这是项目**当下的工程实况快照**，而不是规划蓝图——规划见 [`ROADMAP.md`](./ROADMAP.md) 与 [`ARCHITECTURE.md §7`](./ARCHITECTURE.md)。
- 状态标记：✅ 已完成 / 🟡 进行中 / ⏳ 未启动 / 🐛 已知缺陷。
- 任何 ✅ 项目都附"位置 / 验证方式"，便于核对真伪——这份文档不容许"标着 ✅ 实际没做"。
- 每次有里程碑切换、子模块上线 / 下线、缺陷修复，都应同步更新这份文档。

> **本次更新摘要 (2026-05-12)**：
> 1. 修复 `:::timeline` / `:::kanban` 在缩进 `@` 行下只解析出第一个条目的解析层缺陷。
> 2. 修复 `:::timeline direction="horizontal"` 在某一条内容过长时把其他 `@` 区块挤出可视区的 CSS 布局缺陷——卡片改为定宽 240px + 内部自动换行 + 显式滚动 snap，连接线由 `<ol>::before` 重写为 `<li>::after` 以便跟随滚动。
> 3. 把 v0.2 六个新块写入 `@rmd/ast` 的 `CORE_BLOCK_TYPES`（详见 §4.1）。

## 1. 总览：能力矩阵

| 模块 | 状态 | 入口包 | 测试覆盖 |
|---|---|---|---|
| 解析层（CommonMark + 14 个 ::: 块） | ✅ | `@rmd/parser-core` + `@rmd/blocks-core` | `test/parser.test.js` + `spec/conformance/` |
| AST 节点工厂与 schema 校验 | ✅ | `@rmd/ast` + `@rmd/validator` | `test/validator.test.js` |
| HTML 渲染器（AST → string） | ✅ | `@rmd/renderer-core` | `test/renderer.test.js` |
| 浏览器入口 (IIFE) | ✅ | `@rmd/renderer` → `dist/rmd.min.js` | `test/dist-bundle.test.js`* |
| 交互运行时（slider / export / tabs） | ✅ | `@rmd/runtime` | `test/runtime.test.js` |
| 4 套官方主题 | ✅ | `@rmd/themes-default` | 视觉回归：`examples/themes-gallery/` |
| CLI (`rmd init / parse / validate / build / open`) | ✅ | `@rmd/cli` → `dist/cli.js` | `test/cli.test.js` |
| 三种输出模式（self-contained / cdn / split） | ✅ | `rmd build --mode ...` | `test/build.test.js` + `examples/split-demo/` |
| Obsidian 插件（live / split / preview 三模） | ✅ | `@rmd/obsidian-plugin` | `packages/obsidian-plugin/tests/*.test.js` |
| Claude Code skill | ✅ | `skills/platforms/claude.json` → `skills/dist/claude/` | 人工 + `skills/shared/examples/` |
| Codex skill | 🟡 | `skills/platforms/codex.json` → `skills/dist/codex/` | 待补 |
| Gemini skill | 🟡 | `skills/platforms/gemini.json` → `skills/dist/gemini/` | 待补 |
| VSCode 插件 | ⏳ | — | — |
| 第三方块插件 API（registerBlock） | ⏳ | — | — |
| 短链分享服务 `rmd.sh` | ⏳ | — | — |

> *`test/dist-bundle.test.js` 在 macOS arm64 主机上本地能跑；目前 Linux arm64 CI / 沙盒上由于 `esbuild` 平台二进制不匹配会失败，属已知环境限制，不阻塞功能。

## 2. 已完成的功能模块

### 2.1 解析层（v0.1 + v0.2 全量）

- **CommonMark 兼容**：`packages/parser-core/src/index.js` 复用 `markdown-it` v14，按 CommonMark 600+ 用例验证。
- **围栏块识别**：`:::name [attrs]` 全量解析；属性支持 `k=v` / `k="v"` / 多 `[k=v]` 组合 / 单 `[k=v ...]` 组合三种写法。
- **未关闭块容忍**：自动闭合 + `warnings: ["unclosed"]`，符合 P8 优雅降级。
- **14 个核心块**（全部已在 `packages/blocks-core/src/index.js` 中注册）：

  | 类别 | 块 | AST type | 备注 |
  |---|---|---|---|
  | v0.1 | `:::chart` | `chart` | 8 种类型 + 双 Y 轴 + 多系列 |
  | v0.1 | `:::grid` | `grid` | 1–12 列，含响应式断点 `1,2,4` 与 `masonry` |
  | v0.1 | `:::callout` | `callout` | `info / tip / warning / danger / success` |
  | v0.1 | `:::slider` | `slider` | 含 `scale=log / pow` 与离散 `marks` |
  | v0.1 | `:::export` | `export` | `text / markdown / json` |
  | v0.1 | `:::flow` | `flow` | `lr / tb`，自动收集节点 |
  | v0.1 | `:::diff` | `diff` | `@注:` 内联注释 |
  | v0.1 | `:::tabs` | `tabs` | `default=...` 自动修复 |
  | v0.2 | `:::timeline` | `timeline` | 容忍缩进 `@` 行（2026-05-12 修复）|
  | v0.2 | `:::kanban` | `kanban` | 同上 |
  | v0.2 | `:::details` | `details` | `open="true"` 默认展开 |
  | v0.2 | `:::carousel` | `carousel` | `autoplay + interval` |
  | v0.2 | `:::embed` | `embed` | `type + id + aspect-ratio` |
  | v0.2 | `:::math` | `math` | LaTeX 原文透传 |

- **基线测试**：`spec/conformance/cases/{core-blocks, advanced-blocks, fallbacks}` 三套基线全部 ok。

### 2.2 渲染层

- `renderer-core/src/index.js` 输出严格语义 HTML，所有块均带 `data-rmd-block` 数据属性，便于主题与运行时识别。
- 内置 SVG bar chart（其它图表类型已识别但仍在升级中——见 §5）。
- 三种输出模式都跑通：
  - **self-contained**：`examples/v0.2-showcase.html`（CSS + 源文内联，约 130KB）。
  - **cdn**：`examples/codex-skill-demo.html`（壳 + `script[type=application/rmd]`，约 5KB）。
  - **split**：`examples/split-demo/`（独立 `theme.css` + `rmd.min.js`）。

### 2.3 主题

- 全部纯 CSS（无 JS 干涉 DOM 结构，符合 PRINCIPLES P6）。
- 已上线 4 套：`default` / `tech-dark` / `paper` / `notion-like`。
- 主题切换 = `<link>` 替换，<16ms 一帧内完成；通过 `themes-gallery/` 例样视觉验证。

### 2.4 运行时

- 在 `@rmd/runtime` 中实现 slider 双向绑定、export 模板渲染 + 剪贴板兜底、tabs 切换、状态变化事件 `rmd:statechange`。
- 仅在文档含 `data-rmd-block="slider|export|tabs"` 时加载，符合 ARCHITECTURE TD-007 的"按需加载"。

### 2.5 CLI

- 命令：`rmd init` / `rmd parse` / `rmd validate` / `rmd build` / `rmd open`。
- `init` 会把 `skills/dist/<platform>/` 安装到目标 AI 客户端的指定目录（支持 `--ai claude|codex|gemini|all`）。
- `open` 内置 preview-server（基于 Node `http`），支持本地热重载（轮询）。
- `build` 支持 `--mode self-contained|cdn|split`，覆盖 ARCHITECTURE §3.3 的三种模式。

### 2.6 Obsidian 插件

- 一份 `.rmd` 文件可以用三种视图模式打开：
  - **Live**：CodeMirror 编辑器 + 每块替换为渲染 widget（Typora 风格）。
  - **Split**：左源码、右预览，双向滚动同步与点击聚焦。
  - **Preview**：纯渲染。
- 通过自定义元素 `<rmd-render>` + Shadow DOM 完成主题隔离（不污染 Obsidian 全局 CSS）。
- 已知缺陷：见 §4。

### 2.7 AI Skills

- 共享内容集中在 `skills/shared/`（`SKILL.md` 模板 + `references/blocks.md` + `references/artifacts.md` + `examples/`），每个目标 AI 只需 `skills/platforms/<id>.json` 一个文件描述差异（`display_name` / `description` / `install_root`）。
- `npm run build:skills` 把模板装配为 `skills/dist/<id>/`，由 `rmd init --ai <id>` 投递到用户机器。
- **Claude Code skill** (`skills/dist/claude/`)：已经过实测，能让 Claude 直接生成正确的 `.rmd` + Mode B 壳。
- **Codex skill** (`skills/dist/codex/`)：骨架已就位，`SKILL.md` 主提示词尚未完成 few-shot 调优。
- **Gemini skill** (`skills/dist/gemini/`)：从共享模板生成，尚未在 Gemini 中实测调优。

## 3. 规划中 / 待开发的功能

### 3.1 v0.2 收尾（短期，1–2 周）

| 任务 | 优先级 | 负责模块 | 验收 |
|---|---|---|---|
| 完善 Codex / Gemini skill 的 SKILL.md + few-shot | 高 | `skills/shared/SKILL.md` + `skills/platforms/{codex,gemini}.json` | 在各平台零示例生成正确率 ≥ 90% |
| `:::chart` 非 bar 类型的 SVG 渲染（line / pie / area / scatter / radar / donut / heatmap） | 高 | `renderer-core` | 8 种类型在 `examples/v0.2-showcase.html` 视觉验证 |
| `:::carousel` 真正的 CSS scroll-snap + JS autoplay | 中 | `renderer-core` + `runtime` | 手势/触控板滑动正常 |
| `:::embed` 安全策略（白名单 + iframe sandbox） | 中 | `renderer-core` | 单元测试覆盖 youtube / bilibili / iframe |
| `:::math` 集成轻量 KaTeX 或保留 LaTeX 源 + 静态 PDF 兜底 | 中 | `renderer-core` | 视觉验证 + 一致性测试 |
| VSCode 插件：语法高亮 + 预览 + 命令 | 中 | `packages/vscode-plugin/`（待新增） | `.rmd` 文件在 VSCode 内可编辑 / 预览 |

### 3.2 v1.0 之前的关键决策（中期，1–3 个月）

- **第三方块插件 API**（`registerBlock(name, parser, renderer)`）：
  - 锁定 contract（详见 [`EXTENSIONS-DESIGN.md`](./EXTENSIONS-DESIGN.md)）。
  - 给一个真实样板插件（如 `:::sql-runner`）。
  - 走 ADR 评审。
- **AST 1.0 字段冻结**：把 v0.x 阶段加的 `unknownAttrs` / 状态字段进入正式接口；写 `migrate(0.2 → 1.0)` 函数。
- **跨语言 SDK**：优先 Python 解析器，复用 spec/conformance 测试。

### 3.3 v2.0+ 长线（占位）

- 短链分享服务 `rmd.sh`（v1.0 起开放）。
- 主题市场（提交 / 浏览 / 评分）。
- Obsidian-like 桌面客户端（`@rmd/desktop`，可能改用 Tauri）。
- Notion / Confluence / Slack 的渲染插件。

## 4. 已知缺陷与最近修复

### 4.1 已修复（2026-05-12）

| 缺陷 | 现象 | 根因 | 修复 | 验证 |
|---|---|---|---|---|
| `:::timeline` 只渲染第一个条目 | 当条目头部 `@ time [...]` 行被缩进（AI 生成 / 复制粘贴常见）时，所有后续 `@` 被当成正文文本拼到首个条目里。 | `parseTimeline` 的正则 `^@\s+...` 强行要求 `@` 顶格，且对 `@` 与时间之间没有空格的写法静默吞掉。 | 改用 `^\s*@\s+(.+?)\s*$` 容忍缩进；属性提取改为"剥洋葱"式逐个匹配尾部 `[k=v ...]`，同时支持 `[a="x"] [b="y"]` 和 `[a="x" b="y"]` 两种写法。 | `test/parser.test.js` 新增 4 个 timeline / kanban 用例，全部 pass。 |
| `:::kanban` 同样在缩进列头下丢失列 | 与 timeline 同源（同一 `@ {title}` 行格式）。 | 同上。 | 同步应用同款修复，并补充 `kanban-content-before-first-column` 警告。 | 同上。 |
| `:::timeline direction="horizontal"` 单条内容过长时，其他 `@` 区块被挤出可视区 | 当一条时间轴卡片的正文较多时，`flex: 0 0 auto; min-width: 200px;` 让它向右无限撑开，将后续 `<li>` 推到 `<ol>` 的可滚动区外、scrollbar 又被父容器隐藏，用户感觉只剩第一个条目。 | 卡片缺少 `max-width`、`overflow-wrap`，连接线 `<ol>::before` 又锚定在可视视口而非滚动内容上。 | 改为 `flex: 0 0 240px; max-width: 240px; min-width: 0;`，加 `overflow-wrap: anywhere`；连接线由 `<ol>::before` 重写为 `<li>::after`，跟随条目滚动；显式 `flex-wrap: nowrap` + `scroll-snap-type: x proximity`。 | `examples/v0.2-showcase.rmd` 新增 "长内容回归测试" 段、`examples/v0.2-showcase.html` 渲染出 5 条等宽卡片。 |
| `CORE_BLOCK_TYPES` 漏掉 v0.2 新块 | `@rmd/ast` 中 `CORE_BLOCK_TYPES` 集合长期停留在 v0.1 的 8 块，validator 与第三方消费方误把 `timeline / kanban / ...` 当未知块。 | 加入新块时未同步更新该常量。 | 写入 6 个 v0.2 类型。 | 全部测试通过。 |

### 4.2 进行中 / 已记录

| 缺陷 | 影响 | 现状 |
|---|---|---|
| `test/cli.test.js` 中 "CLI split build writes local assets" 在某些 OS 下找不到 `dist/rmd.min.js` | CI 偶发红 | 与 esbuild 平台二进制相关，已有 issue 草稿，待重写为先确保 dist 存在的预热步骤 |
| `test/dist-bundle.test.js` 在 Linux arm64 沙盒里 esbuild 报"@esbuild/darwin-arm64 错平台" | 跨平台 CI 受阻 | 计划把 esbuild 装为可选依赖 + bundling 走 wasm 兜底 |
| Carousel 在低分屏下 scroll-snap 阻尼略硬 | UX 细节 | 等 §3.1 中 Carousel 升级一起处理 |
| Embed 默认 `src="about:blank"` + `data-src` 注入，没有 lazy hydrate | 嵌入不可见 | 与 §3.1 一起做 |

## 5. 数据健康度

- **解析吞吐**：在 V8 上 > 5MB/s（满足 ARCHITECTURE §8 目标），仍需在 CI 中加 perf bench。
- **核心 runtime 体积**：`dist/rmd.min.js` 当前约 170KB raw（含完整 CommonMark parser）；不含 parser 的运行时部分 < 12KB raw。gzip 预算化工作在 v1.0 前完成。
- **CommonMark 合规**：基线 ok（通过 markdown-it），但尚未把 CommonMark 0.31 官方测试套接入 CI。
- **单元测试覆盖率**：未启用 c8 / istanbul 收集，目标 v1.0 前补齐到 ≥85%（核心包）。

## 6. 给"接手某个子任务"的人

按"开箱即接的难度"排序，从低到高：

1. **加一个测试用例 / 修一个 parse 边界**：在 `test/` 下新建文件或扩展现有文件即可，30 分钟入门。
2. **完善 Codex skill 的 few-shot**（§3.1）：纯 Markdown 撰写，需要试跑 Codex。
3. **实现 `:::chart` 非 bar 类型 SVG 渲染**：边界清晰，单文件 `renderer-core/src/index.js` 里加 `renderChartLine` 等。
4. **VSCode 插件骨架**：参考 `obsidian-plugin/` 的目录结构，难点是 CodeMirror / Monaco 适配。
5. **第三方块插件 API**：要先读 `EXTENSIONS-DESIGN.md` 与 `CONTRACT.md`，需要走 ADR 评审。

## 7. 维护约定

- 每次 PR 必须更新本文件的对应条目（移动到 §4.1 已修复 / 新增 §3 待办 / 调整 §1 矩阵）。
- 任何 ✅ → 🟡 → ⏳ 的状态切换必须留下 commit 链接或 ADR 引用。
- 与 [`ROADMAP.md`](./ROADMAP.md) 的差别：ROADMAP 是面向用户的"我们要往哪儿走"；本文是面向开发者的"我们现在在哪儿"。

如发现本文档与代码不一致，请优先以代码 / 测试为准，再回头修文档。
