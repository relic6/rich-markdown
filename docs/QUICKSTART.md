# QUICKSTART：Rich Markdown 接入示例

> **读者**：自己（试金石）+ 任何想第一次"看懂"`.rmd`的人
> **阅读时长**：8–12 分钟
> **最近更新**：2026-05-10

## 这份文档为什么存在

这是奠基阶段最重要也最残忍的一篇。VISION 和 PRINCIPLES 都可以靠词藻撑场，QUICKSTART 撑不住——它必须把 `.rmd` 用一个**具体、真实、可复现**的例子摆出来。

如果我们写不出一份让人读完想立刻 `touch demo.rmd` 的 QUICKSTART，那就说明前两篇的承诺还没真正落地，必须回头修。

## 1. 30 秒看懂 `.rmd`

`.rmd` 在视觉上和 Markdown 几乎一样，区别只在于多了几种**围栏块**——用 `:::` 开头和结尾，里面的内容由渲染器翻译成富视觉。

最简单的例子：

```rmd
# 季度业绩

下面是四个季度的营收对比：

:::chart bar
Q1 100
Q2 150
Q3 220
Q4 380
:::
```

第一行是普通 markdown 一级标题，第二行是普通段落，最后那个 `:::chart bar ... :::` 在浏览器里会被渲染成一张柱状图。如果用普通 markdown 渲染器打开，它会被当作 code block 显示——可读，不崩溃（这就是 PRINCIPLES P8）。

**就这样。`.rmd` 不引入任何陌生语法，只在 markdown 之上增加一种"语义化的富内容容器"。**

## 2. 一份真实文档：API 限流方案对比

下面是一份完整的 `.rmd` 源文件，模拟 AI agent 帮一位工程师做架构选型。**它通篇只用了 5 种扩展块**，但展示了 `.rmd` 与 Markdown 的核心差距。

### 2.1 源文件（`rate-limit-decision.rmd`）

```rmd
---
title: 支付服务限流方案对比
theme: tech-dark
share: team
---

# 支付服务限流方案对比

我们要给支付服务选一个限流策略。三种主流方案，按"突发友好度"和
"实现复杂度"两条标准评估。

## 三个候选

:::grid 3
### 令牌桶
固定速率往桶里加令牌，请求消耗令牌。
**优点**：突发友好
**缺点**：实现略复杂
---
### 漏桶
按固定速率漏出请求，超过缓冲队列直接拒绝。
**优点**：流量平滑
**缺点**：突发被砍
---
### 滑动窗口
按时间窗口统计请求数，超过阈值拒绝。
**优点**：实现简单
**缺点**：边界突刺
:::

## 性能对比

:::chart bar title="1000 RPS 压测下的 P99 延迟（ms，越低越好）"
令牌桶 23
漏桶 19
滑动窗口 41
:::

## 选型建议

:::callout tip
**推荐令牌桶**：在突发场景下延迟和公平性平衡最好，
代价是实现略复杂——但这部分可以靠成熟库覆盖。
:::

## 调一下试试

下面是令牌桶的关键参数。拖动滑块改值，按钮把当前参数复制为
可直接粘贴的 YAML 配置。

:::slider name="capacity" min=10 max=1000 step=10 default=200
:::slider name="refill_rate" min=1 max=200 step=1 default=50
:::slider name="burst_window" min=1 max=60 step=1 default=10

:::export label="复制为限流配置"
rate_limiter:
  type: token_bucket
  capacity: {{capacity}}
  refill_rate: {{refill_rate}}
  burst_window_seconds: {{burst_window}}
:::

## 实施流程

:::flow
设计 -> code review -> 灰度 -> 全量
灰度 -> 异常 -> 回滚
:::

## 与现状的差异

:::diff
- @rate_limit(window=60, max=100)
+ @token_bucket(capacity=200, refill=50)  # 加了突发保护
:::
```

整份文档约 **65 行、≈ 350 token**。

### 2.2 它在浏览器里会变成什么

按 `tech-dark` 主题渲染：

- 顶部一个深色 hero 标题
- "三个候选"被排成三栏并列卡片，每栏配色一致
- 性能对比是一张真实的 SVG 柱状图，鼠标悬停显示数值
- "推荐令牌桶"是一个带蓝色边框、左侧有 ✓ 图标的 callout
- 三个滑块在一个分组里，可以实时拖动
- 下面那个"复制为限流配置"按钮按下去，剪贴板里就是当前 capacity / refill_rate / burst_window 替换好的 YAML
- 实施流程是一个有分支的流程图（灰度 → 异常 → 回滚）
- 末尾的 diff 块用绿/红高亮显示，旁边带一个小注释 tooltip

整套效果如果用 HTML/CSS/JS 写，至少需要 **1500+ token、450+ 行代码**。

### 2.3 同一份 `.rmd`，换主题会怎样

源文件不动，只把 frontmatter 里 `theme: tech-dark` 改成别的：

| 主题 | 视觉感受 | 适用场景 |
|---|---|---|
| `tech-dark` | 深色背景、霓虹强调色、紧凑布局 | 工程评审、架构方案 |
| `paper` | 浅色衬纸、衬线字体、宽行距 | 学术报告、长篇研究 |
| `notion-like` | 干净白色、浅灰分割、emoji 友好 | 团队协作、产品文档 |
| `slide` | 一节一屏、放大字号、侧边导航 | 当成幻灯片用 |

**源文件不变，token 不增加，呈现完全不同。** 这是 `.rmd` 区别于 MDX、HTML 的核心红利。

## 3. 这份文档用了哪些块？

QUICKSTART 阶段我们只用 6 种核心块就讲完了一个完整故事：

| 块 | 作用 | 同等 HTML 估算 token | `.rmd` 估算 token | 优势 |
|---|---|---|---|---|
| `:::grid 3` | 三栏布局 | ~120 | ~30 | 4× |
| `:::chart bar` | 柱状图 | ~300 | ~25 | 12× |
| `:::callout tip` | 强调框 | ~80 | ~20 | 4× |
| `:::slider` | 数值调节 | ~150 | ~15 | 10× |
| `:::export` | 复制为提示词 / 配置 | ~250 | ~40 | 6× |
| `:::flow` | 流程图（含分支） | ~400 | ~30 | 13× |
| `:::diff` | 代码差异 | ~120 | ~30 | 4× |

每一项都满足 PRINCIPLES P5 的 ≥ 3× token 优势。整份文档相比等价 HTML 节省 ≈ 78%。

## 4. AI 视角：Claude Code 怎么生成这份文档

把以下两段话看作 AI agent 在内部经历的"指令-输出"循环。

**用户指令**（在 Claude Code 终端里）：

> 帮我写一份支付服务限流方案对比，三个候选，附性能数据，给一个可调参数的原型，最后告诉我和现状的差异。用 `.rmd` 格式。

**Claude Code 内部行为**（启用 `rich-markdown` skill 后）：

1. 加载 skill 提供的 `.rmd` 块速查表（约 500 行 markdown，一次加载）
2. 决定使用 `:::grid` 做对比、`:::chart` 做性能、`:::slider` + `:::export` 做原型、`:::flow` 做流程、`:::diff` 做差异
3. 生成上面那份 65 行源文件
4. 写出文件 `rate-limit-decision.rmd`，提示用户用 `rmd open` 命令在浏览器查看

**对比：不用 `.rmd` skill 时**，Claude Code 会输出一份 ≈ 500 行的 HTML 单文件，包含内联 CSS、SVG、JS，token 用量 ≈ 1800，diff 几乎不可读。

## 5. 人的视角：用户拿到这份文档之后做什么

1. 在浏览器打开 `rate-limit-decision.rmd` 的渲染页面
2. 看完三栏对比 + 柱状图，几秒内就有方向感
3. **关键时刻**：拖动 capacity 和 refill_rate 滑块，看下方 YAML 实时更新
4. 觉得参数对劲，按"复制为限流配置"按钮，剪贴板里就是替换好的 YAML
5. 切到代码里粘贴，commit
6. 把 `rate-limit-decision.rmd` 通过短链发给同事 review，同事打开就能看到完全一致的渲染

**整个过程没有人手写 markdown、没有人改 HTML、没有人在 GitHub diff 里挣扎**。这就是 PRINCIPLES P7（交互一等公民）和 VISION "保持人在循环中" 的具体兑现。

## 6. 试金石：QUICKSTART 是否成立的 5 个问题

我们用这 5 个问题检查自己——任何一个答 NO，都说明设计还没准备好：

| # | 问题 | 现状 |
|---|---|---|
| 1 | 一个没读过 spec 的工程师能在 1 分钟内看懂 §1 的最简例子吗？ | ✅（`# 标题` 和 `:::chart bar` 几乎自解释）|
| 2 | §2 的完整例子能让人理解"啊原来 .rmd 是这种东西"吗？ | ✅（场景真实、块种类齐全、目的明确）|
| 3 | §3 的 token 优势表能站得住任何 PRINCIPLES P5 审计吗？ | ✅（每项 ≥ 3×，最高 13×）|
| 4 | §4 的 AI 视角能直接翻译成一份 skill 提示吗？ | ✅（输入 / 决策 / 输出 / 对比都有了）|
| 5 | §5 的人的视角让人觉得"这是真的工作流"还是"演示视频"？ | ⚠️（"按按钮 → 粘贴到代码"环节可信，但"短链发同事"还需要后端服务支撑，先标注未来里程碑）|

第 5 题的部分黄灯让我们看到了 ROADMAP 的优先级：**短链分享服务必须在 alpha 之前到位**，否则"可分享"承诺打折。

## 7. 想自己试一试？

当前阶段渲染器还没发布。等到 v0.1 alpha：

```bash
# 安装（计划中）
npm install -g rmd-cli

# 把上面 §2.1 的源文件存成 demo.rmd
rmd open demo.rmd          # 在默认浏览器打开渲染页
rmd open demo.rmd --theme paper   # 用 paper 主题
rmd build demo.rmd --out demo.html  # 输出自包含 HTML 用于分享
```

在那之前，可以做的事：

- 读 [`PRINCIPLES.md`](./PRINCIPLES.md)，理解我们为什么允许 `:::chart` 但不允许 `:::chart color=#ff0000`
- 读 [`CONTRACT.md`](./CONTRACT.md)，看完整的块列表和属性规范
- 在你自己的 AI 工作流里**先用 .rmd 的语法写**，即使现在只能渲染成纯文本——这本身已经能省 token 并改善结构

## 附：本文档用到的所有 `.rmd` 块速查

| 块 | 一句话 | 是否 v0.1 核心 |
|---|---|---|
| `:::chart {type}` | 数据图表（bar/line/pie） | ✅ |
| `:::grid {n}` | n 列布局，`---` 分隔 | ✅ |
| `:::callout {kind}` | 强调框（tip/warning/info/danger） | ✅ |
| `:::slider name=... min=... max=... default=...` | 数值滑块 | ✅ |
| `:::export label="..."` | 复制按钮（支持 `{{var}}` 模板） | ✅ |
| `:::flow` | 流程图（`->` 表示流向，多行支持分支） | ✅ |
| `:::diff` | 代码差异（兼容 unified diff） | ✅ |
| `:::tabs` + `@label` | 多标签视图 | ✅ |
| `:::diagram` | 通用图（mermaid 兼容） | ⏳ v0.2 |
| `:::stats` | KPI 卡片组 | ⏳ v0.2 |
| `:::timeline` | 时间线 | ⏳ v0.2 |
| `:::compare` | 双栏自动 diff 对比 | ⏳ v0.2 |

完整规范见 [`CONTRACT.md`](./CONTRACT.md)。
