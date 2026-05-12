# GETTING-STARTED：Rich Markdown 入门教程

> **读者**：第一次接触 `.rmd` 的使用者——AI 工具的用户、内容创作者、想用富文档代替纯 Markdown 的工程师。
> **阅读时长**：30–45 分钟（动手跟做约 1 小时）
> **最近更新**：2026-05-10

## 0. 这份文档承诺给你什么

读完跟做完后，你会拥有：

- 在本机能跑通的完整 Rich Markdown 工具链
- 一份你自己写的 `.rmd` 文件，渲染成漂亮的、可交互的 HTML
- 知道在四种官方主题（`default` / `tech-dark` / `paper` / `notion-like`）之间一键切换
- 一个可以拖动滑块、复制配置回 AI 对话框的交互原型
- 把 `.rmd` 接入 Claude Code / Codex 等 AI 工具的实操步骤
- 排错思路和往下深入的路标

**前置假设**：你装过 Node.js（≥ 18），用过命令行，懂基础 Markdown 语法（`# 标题`、`- 列表`、`**加粗**` 这些）。完全没接触过 Markdown 也没关系，跟做不会卡。

如果你想先了解"为什么要做这个"，请读 [`VISION.md`](./VISION.md)；想先看 30 秒最小例子，请翻 [`QUICKSTART.md`](./QUICKSTART.md)。本文是详细动手教程，从零搭建到接入 AI 工具的完整闭环。

---

## 1. 5 分钟跑通：从 git clone 到第一份 HTML

### 1.1 环境检查

```bash
node --version    # 期望 ≥ 18
npm --version     # 期望 ≥ 9
```

如果版本太旧，去 [nodejs.org](https://nodejs.org) 下载最新 LTS。

### 1.2 拿到代码 + 装依赖

```bash
git clone <仓库地址> rich-markdown
cd rich-markdown
npm install
```

依赖很轻：核心只有 `markdown-it`（解析器）+ `esbuild`（构建打包，dev 用）。装完应该不到 30 秒。

### 1.3 验证装好了：跑一个内置示例

仓库里 `examples/` 目录有现成的 `.rmd` 文件，先确认 CLI 能正常工作：

```bash
npm run rmd -- validate examples/codex-skill-demo.rmd
```

期望输出：

```
ok
```

看到 `ok` 就说明解析器、校验器都正常。如果报错，跳到 §9 排错。

### 1.4 构建你的第一份 HTML

```bash
npm run rmd -- build examples/codex-skill-demo.rmd --mode self-contained --out /tmp/first.html
```

期望输出（一个绝对路径）：

```
/tmp/first.html
```

这个文件是**完全自包含的**——CSS、JS、AST 全部内联在一个 HTML 里，可以直接双击打开、邮件附件发送、上传 S3 分享、在 Claude 桌面版里渲染，**零外部依赖**。

### 1.5 在浏览器里看看

```bash
# macOS
open /tmp/first.html

# Linux
xdg-open /tmp/first.html

# Windows (PowerShell)
start /tmp/first.html
```

或者直接拖进浏览器。你会看到一份排版规整的报告，包含柱状图、流程图、可拖动的滑块、可点击的复制按钮。

**恭喜，你已经跑通了完整的 Rich Markdown 链路。**

---

## 2. 看懂一份 `.rmd`

打开 `examples/codex-skill-demo.rmd`，从上到下解读：

### 2.1 frontmatter — 文档元信息

```yaml
---
title: Codex Rich Markdown Demo
theme: default
share: private
---
```

`---` 包围的 YAML 块是 frontmatter，定义文档的元信息：

- `title` — 浏览器 tab 显示的标题
- `theme` — 用哪套主题渲染（`default` / `tech-dark` / `paper` / `notion-like`）
- `share` — 仅在配合短链分享服务时有意义

frontmatter 是可选的，但**强烈建议每份文档都至少写一个 `title`**。

### 2.2 普通 Markdown 部分

```markdown
# Codex Rich Markdown Demo

This document tests whether Codex can generate a compact `.rmd` source file...
```

`# 标题`、段落、`**加粗**`、`> 引用`、列表、链接、行内代码——**所有标准 CommonMark 语法都直接生效**。`.rmd` 100% 兼容 Markdown，你已经会的不用重新学。

### 2.3 围栏块 — `.rmd` 的核心扩展

```rmd
:::flow direction=lr
Prompt -> RMD source -> Validate -> Build HTML -> View
:::
```

围栏块是 `.rmd` 区别于普通 Markdown 的地方。一对 `:::` 把内容包起来，第一行声明块的类型和属性，块内是数据 / 内容 / 模板。

上面这个例子是流程图：每行一条 `节点 -> 节点 -> 节点` 的链路，渲染器会自动画成有向图。

### 2.4 完整块清单（v0.2 共 14 个）

| 块 | 一句话 | 典型场景 |
|---|---|---|
| `chart` | 数据图表（柱/折/饼等 8 类型） | 性能对比、数据简报 |
| `grid` | 多列布局，cell 用 `---` 分隔 | 方案对比、产品矩阵 |
| `callout` | 带图标的强调框 | 提示、警告、推荐 |
| `slider` | 数值滑块 | 参数调节 |
| `export` | 复制按钮（支持 `{{var}}` 模板） | 把调好的参数复制回 AI 对话 |
| `flow` | 流程图（含分支） | 工作流、调用链 |
| `diff` | 代码差异 | PR 解释、配置变更 |
| `tabs` | 多标签视图 | 多视角对照 |
| `timeline` | 时间线（垂直/水平） | 路线图、变更历史 |
| `kanban` | 看板列 | 任务列表、状态分组 |
| `details` | 折叠面板 | 长文档、附录 |
| `carousel` | 轮播 | 截图集、特性展示 |
| `embed` | 视频/地图嵌入 | 多媒体内容 |
| `math` | LaTeX 公式 | 学术文档 |

完整属性表见 [`CONTRACT.md`](./CONTRACT.md) §2 或 [`skills/shared/references/blocks.md`](../skills/shared/references/blocks.md)。

---

## 3. 写你自己的 `.rmd`

跟着写一份"团队周报"，把上面学到的串起来。

### 3.1 新建文件

```bash
mkdir -p my-docs
touch my-docs/weekly.rmd
```

### 3.2 写内容

把以下内容粘贴到 `my-docs/weekly.rmd`：

```rmd
---
title: 团队周报 · 第 18 周
theme: default
description: 本周关键产出与下周计划
---

# 团队周报 · 第 18 周

## 关键指标

:::chart bar title="本周关键指标对比" emphasis=primary
DAU 12500
新增订单 320
客诉数 8
:::

## 本周完成

:::grid 2
### 已交付
- 用户反馈系统 v2 上线
- 移动端登录 bug 修复
- 性能监控面板
---
### 进行中
- 支付重构（70%）
- 国际化框架（40%）
- 数据迁移脚本（评审中）
:::

## 风险与决策

:::callout warning title="支付重构延期风险"
原计划 5 月底完成，目前因第三方接口变更，预计推迟 2 周。需要在下周一同步给业务方。
:::

## 下周路线

:::flow direction=lr
评审 -> 接口对接 -> 内测 -> 灰度
内测 -> 异常 -> 回滚
:::

## 备注（点击展开）

:::details title="详细测试覆盖率数据" open=false
- 单元测试：83% → 87%
- 集成测试：61% → 65%
- E2E：新增 12 个用例
:::
```

### 3.3 验证 + 构建 + 查看

```bash
npm run rmd -- validate my-docs/weekly.rmd
npm run rmd -- build my-docs/weekly.rmd --mode self-contained --out my-docs/weekly.html
open my-docs/weekly.html   # macOS；Linux 用 xdg-open
```

应该看到一份完整的周报，含柱状图、双栏对比、警告框、流程图、折叠的详细数据。

### 3.4 两个常见手感

- **行尾不用空格双回车**：`.rmd` 沿用 CommonMark 规则，段落之间空一行就够了
- **块结束符不能错**：开头是 `:::block-name 属性`，结尾必须是单独一行的 `:::`，前后多/少空格都不行

---

## 4. 三种构建模式：什么时候选哪个

CLI 的 `--mode` 参数决定输出形态。你已经用过 `self-contained`，下面是完整对照：

### 4.1 `self-contained`（默认，最常用）

```bash
npm run rmd -- build my-docs/weekly.rmd --mode self-contained --out my-docs/weekly.html
```

单个 HTML 文件，CSS / JS / 源 `.rmd` 全内联。零外部依赖。

**适用**：
- 邮件附件
- 离线归档
- S3 / 静态托管一键分享
- **Claude 桌面版 artifact**（沙盒只能加载单文件 HTML，必须用这个）
- 任何沙盒环境

**代价**：文件偏大（30–80 KB），因为渲染器和主题 CSS 都内联进来了。

### 4.2 `cdn`（最小 artifact）

```bash
npm run rmd -- build my-docs/weekly.rmd --mode cdn --version 0.1.0 --out my-docs/weekly.html
```

HTML 极小（5–10 KB），只包含源 `.rmd` 和指向 CDN 的 `<script>` 标签。渲染器在浏览器里从 CDN 拉。

**适用**：
- 博客文章嵌入
- Notion / Confluence 嵌入
- 对 token 经济极其敏感的场景

**注意**：`--version` 必须是完整 semver（`0.1.0` 这种），不允许 `latest`。这是为了避免沙盒因 CDN 漂移突然失效。

### 4.3 `split`（多文件，给开发用）

```bash
npm run rmd -- build my-docs/weekly.rmd --mode split --out my-docs/dist/index.html
```

输出 `index.html` + `rmd.min.js` + `themes/default.css` 三个文件到同一目录。

**适用**：
- 本地开发 / 热重载
- 自己托管渲染器（比如挂在公司 CDN）
- 想检查产物（HTML、JS、CSS 分开看更清晰）

**不适用**：邮件、Claude artifact、任何沙盒——相对路径会 404。

### 4.4 速记表

| 你想发到哪里 | 选什么 mode |
|---|---|
| Claude 桌面版 chat | `self-contained` |
| 邮件附件 | `self-contained` |
| 自己博客（有 CDN） | `cdn` |
| 公司 wiki 嵌入 | `cdn` |
| 自己服务器托管 | `split` |
| 不确定 | `self-contained`（最稳） |

---

## 5. 切换主题：四套官方主题速览

四套主题完全不动源码，只改 frontmatter 一行 `theme: ...`，或者构建时 `--theme` 覆盖：

| 主题 ID | 视觉定位 | 适用 |
|---|---|---|
| `default` | 暖奶纸背景 + 鼠尾草色，参考态 | 通用、产品文档 |
| `tech-dark` | 深夜底色 + 霓虹薄荷绿主色 | 工程评审、架构方案、终端友好场景 |
| `paper` | 学术暖白稿纸 + 衬线字体 + 克制配色 | 学术报告、长篇研究、白皮书 |
| `notion-like` | 纯白 + 系统字体 + 胶囊控件 | 协作笔记、产品文档、内部 wiki |

### 5.1 通过 frontmatter 指定（推荐）

```yaml
---
title: 团队周报
theme: notion-like      # ← 改这里
---
```

然后正常 build 即可。

### 5.2 在命令行临时覆盖

```bash
# 同一份源文件，用 tech-dark 主题构建一份
npm run rmd -- build my-docs/weekly.rmd --mode self-contained --theme tech-dark --out my-docs/weekly-dark.html

# 再用 paper 主题构建一份
npm run rmd -- build my-docs/weekly.rmd --mode self-contained --theme paper --out my-docs/weekly-paper.html
```

打开两份 HTML 对比，源文件没动一字，视觉风格完全不同——这是 `.rmd` 的核心红利之一。

### 5.3 主题对比 gallery

仓库里有现成的对比页：

```bash
open examples/themes-gallery/index.html
```

里面是同一份 `decision-report.rmd` 在 4 套主题下的并排展示。

---

## 6. 让交互真的动起来：slider + export

`.rmd` 区别于普通 Markdown 的最有价值能力是**让读者在文档内调参，把结果复制回 AI 对话**。

### 6.1 写一份可调参的限流配置

新建 `my-docs/limiter.rmd`：

```rmd
---
title: 限流参数调优
theme: tech-dark
---

# 限流参数调优

调一下下面三个值，看看 YAML 配置实时变化，然后点按钮复制结果。

## 参数

:::slider name=capacity label="桶容量" min=10 max=2000 step=10 default=200 unit=req
:::

:::slider name=refill_rate label="补充速率" min=1 max=500 step=1 default=50 unit=req/s
:::

:::slider name=burst_window label="突发窗口" min=1 max=120 step=1 default=10 unit=s
:::

## 生成的配置

:::export label="复制为 YAML 配置" format=text
rate_limiter:
  type: token_bucket
  capacity: {{capacity | int}}
  refill_rate: {{refill_rate | int}}
  burst_window_seconds: {{burst_window | int}}
:::

## 提示

:::callout tip
拖动滑块时，下方的 YAML 会实时刷新。点"复制"按钮把当前值的 YAML 写入剪贴板。
:::
```

### 6.2 验证 + 构建 + 玩

```bash
npm run rmd -- validate my-docs/limiter.rmd
npm run rmd -- build my-docs/limiter.rmd --mode self-contained --out my-docs/limiter.html
open my-docs/limiter.html
```

在浏览器里：

1. 拖动三个滑块
2. 看下面 YAML 实时更新
3. 点"复制为 YAML 配置"按钮
4. 切回你的代码编辑器粘贴—— YAML 已经填好了你刚调的值

### 6.3 关键规则速查

- `slider` 的 `name` 必须匹配 `^[a-zA-Z_][a-zA-Z0-9_]*$`，且文档内全局唯一
- `export` 的 `{{name}}` 模板里写 slider 的 `name`，不是 `label`
- `{{name | int}}` 把值转成整数；`{{name | float}}` 浮点；不带格式化就是原始值
- `slider` 块体必须为空（属性写在第一行）；`export` 块体是模板正文

---

## 7. 接入 AI 工具：让 Claude / Codex 自动产出 `.rmd`

到这一步你已经会手写 `.rmd` 了。但 `.rmd` 真正的价值是让 **AI 直接产出**——你只用提需求，AI 写源文件，你看渲染结果。

仓库里 `skills/` 用「**单一共享源 + 每个平台一个 JSON 适配器**」组织，目前覆盖 Claude / Codex / Gemini 三个目标：

```
skills/
├── shared/                 # 单一真相源（SKILL.md 模板 + references/ + examples/）
├── platforms/              # 每个 AI 一个 JSON：description、display_name、install_root
│   ├── claude.json
│   ├── codex.json
│   └── gemini.json
└── dist/                   # 由 `npm run build:skills` 装配出来的可投递产物
    ├── claude/
    ├── codex/
    └── gemini/
```

要安装到具体的 AI 客户端，**用 CLI 的 `rmd init` 命令**，它会从 `skills/dist/<platform>/` 把装配好的 skill 投到 AI 的 skill 路径下：

### 7.1 在 Claude Code 里启用

```bash
rmd init --ai claude
# 等价于把 skills/dist/claude/ 拷到 .claude/skills/rich-markdown/
```

然后在 Claude Code 里问它："帮我写一份产品方案对比，用 Rich Markdown 格式"——Claude 会自动调用 skill：

1. 加载 `references/blocks.md` 学到 14 块的语法
2. 写一份 `.rmd` 到 `examples/<short-name>.rmd`
3. 跑 `npm run rmd -- validate ...` 验证
4. 跑 `npm run rmd -- build ... --mode self-contained` 构建
5. 把生成的 HTML 路径返回给你

整个过程你不用打一行命令。

### 7.2 在 Codex 里启用

```bash
rmd init --ai codex
# 等价于把 skills/dist/codex/ 拷到 .codex/skills/rich-markdown/
```

### 7.3 在 Gemini 里启用

```bash
rmd init --ai gemini
# 等价于把 skills/dist/gemini/ 拷到 .gemini/skills/rich-markdown/
```

> 想批量安装到所有 AI: `rmd init --ai all`。
>
> 想新增其它 AI 工具的支持：在 `skills/platforms/` 下添一个 `<id>.json`（description / display_name / install_root 三个字段），跑一次 `npm run build:skills`，再在 `packages/cli/src/index.js` 的 `PLATFORM_TARGETS` 里注册一行即可。详见 [`skills/README.md`](../skills/README.md)。

### 7.4 验证 skill 真的工作

最简单的检查：让 AI 写一份"三套云服务对比"——好的 AI + 好的 skill 应该输出包含 `:::grid 3` + `:::chart` + `:::callout` + `:::diff` 的 `.rmd`，并自动跑 validate + build。

如果 AI 一直输出纯 Markdown 或纯 HTML，说明 skill 没被加载，检查路径和 frontmatter 是否对。

---

## 8. 在 AI 客户端里直接看到渲染结果

如果你在用 Claude 桌面版的 chat，可以让 AI 直接把渲染结果**作为 artifact 显示在对话里**——不用切到浏览器。

关键是：**让 AI 输出一段把 `.rmd` 内联进 HTML 的 artifact**，例如：

```html
<!doctype html>
<html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/0.1.0/rmd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer/0.1.0/themes/tech-dark.css">
</head><body>
<div id="rmd-root"></div>
<script type="application/rmd">
# 我的报告
:::chart bar
A 10
B 20
:::
</script>
<script>
RMD.render({
  source: document.querySelector('script[type="application/rmd"]').textContent,
  target: document.getElementById('rmd-root'),
  theme: 'tech-dark'
});
</script>
</body></html>
```

这就是 [`ARCHITECTURE.md`](./ARCHITECTURE.md) §3.3 里的 **Mode B**——`skills/shared/SKILL.md` 装配出的默认输出形态正是这个。token 几乎全部花在 `.rmd` 源文本上（极省），渲染器从 CDN 加载（不计入 token），Claude 桌面版能直接当 HTML artifact 渲染。

---

## 9. 常见问题与排错

### Q1：`npm run rmd -- validate` 报 `unknown-block: xxx`

意思是你写的 `:::xxx` 不在已支持的 14 个块里。检查拼写（`:::callot` → `:::callout`），或确认你需要的块是否还在 v0.2 之外（参见 [`CONTRACT.md`](./CONTRACT.md) §2 完整清单）。降级行为是把整个块当代码块显示，所以文档不会崩，但视觉效果丢失。

### Q2：构建出来的 HTML 里块没渲染，只显示原文

最常见原因：块结束的 `:::` 那一行有多余空格 / Tab，或者属性行用了单引号（必须双引号）。

```rmd
# ❌ 错误：结尾有空格
:::chart bar
A 1
:::   
^^^

# ❌ 错误：单引号属性
:::chart bar title='Hello'

# ✅ 正确
:::chart bar title="Hello"
A 1
:::
```

### Q3：滑块拖动了，但 `:::export` 模板里 `{{name}}` 不更新

检查三件事：
1. `slider` 的 `name` 和 `export` 模板里 `{{name}}` 完全一致（区分大小写）
2. `name` 没有用空格 / 中文 / 短横（必须匹配 `^[a-zA-Z_][a-zA-Z0-9_]*$`）
3. 用 `self-contained` 或 `cdn` 模式，不是 `split`（split 模式在沙盒里 JS 加载会失败）

### Q4：在 Claude 桌面版里 artifact 不渲染

98% 概率是用了 `--mode split`，相对路径加载不到。换成 `--mode self-contained` 或 `--mode cdn`。

### Q5：`npm install` 失败

如果提示 esbuild 平台二进制不匹配（`installed esbuild for another platform`），删掉 `node_modules` 重装：

```bash
rm -rf node_modules package-lock.json
npm install
```

esbuild 只在 `npm run build:dist` 时才需要（用来打包浏览器版渲染器），不影响 `validate` / `build` / `open`。如果只是想用 CLI，esbuild 报错可以暂时忽略。

### Q6：`npm test` 有失败用例

当前 41 项测试中有 3 项预先存在的失败：
- `cli split build`：esbuild 平台二进制问题
- `dist browser bundle`：同上
- `official conformance fixtures`：测试断言写死了 fixture 数量，新加的 `advanced-blocks` fixture 没更新断言

**这 3 项失败不影响实际使用**。只要 `validate` 和 `build` 跑得通，就能用。

### Q7：怎么把生成的 HTML 分享给同事

最简单的：发邮件附件（`self-contained` 模式 < 100KB，邮件能过）。或者上传到任何静态托管（GitHub Pages / S3 / Vercel 都行，因为是单文件）。

---

## 10. 下一步去哪里

按你的角色 / 兴趣选路径：

### 你想……

**深入了解格式细节**
- [`CONTRACT.md`](./CONTRACT.md) — 14 个块的完整属性表、frontmatter 字段、AI skill 接入契约
- [`DATA-MODEL.md`](./DATA-MODEL.md) — AST 字段精确定义、JSON Schema、版本演化策略

**理解架构**
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — 三层架构、模块划分、技术选型决策、范围圈定
- [`PRINCIPLES.md`](./PRINCIPLES.md) — 8 条硬性设计原则与冲突仲裁规则

**为项目贡献代码**
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)（即将发布）— 开发流程、PR 规范、ADR 模板
- 项目结构：`packages/` 是 monorepo，每个子包职责见 ARCHITECTURE §2

**更多手感练习**
- 拷贝并修改 `examples/v0.2-showcase.rmd`——它一份覆盖了几乎所有 14 个块
- 拷贝并修改 `skills/shared/examples/decision-report.rmd`——它是真实工作流的复刻

**给其他工具加 skill**
- 参考 `skills/shared/SKILL.md` 的 frontmatter 写法（模板,占位符在 `skills/platforms/<id>.json` 里赋值）
- 参考 `skills/shared/references/blocks.md` 的简洁块速查
- 在 `skills/platforms/` 加一个 `<id>.json`，跑 `npm run build:skills` 就有 `skills/dist/<id>/` —— 切记 `description` 字段要覆盖触发词，详见 [`skills/README.md`](../skills/README.md)

---

## 11. 速查卡（贴在显示器旁边）

```bash
# 三件套
npm run rmd -- validate <file.rmd>
npm run rmd -- build    <file.rmd> --mode self-contained --out <file.html>
npm run rmd -- open     <file.rmd> --port 0 --no-open true

# 切主题
--theme default | tech-dark | paper | notion-like

# 切构建模式
--mode self-contained | cdn | split
                              ↑      ↑      ↑
                        默认/沙盒  小artifact  开发
```

```rmd
# 8 个最常用的块速记
:::chart bar          数据图
:::grid 2             双栏对比（cell 用 --- 分隔）
:::callout tip        提示框
:::slider name=x      数值滑块（块体必须为空）
:::export label="..."  复制按钮（用 {{name}} 引用 slider）
:::flow direction=lr   流程图（节点 -> 节点）
:::diff               +/- 代码差异
:::tabs               @label 分割面板
```

---

**遇到任何卡点**：先看本文 §9 排错；解决不了 → 翻 CONTRACT；还不行 → 提 issue。我们设计这个工具的目标就是让你能从这份教程一路顺到产出可分享的 artifact，不应该有意外。
