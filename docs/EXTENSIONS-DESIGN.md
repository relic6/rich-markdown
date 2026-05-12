# 扩展块增强设计规范 (Extensions Enhancement Design)

> **文档状态**：Draft
> **目标**：极大地增强 Rich Markdown (`.rmd`) 扩展块的表现形式，丰富现有的 `chart`、`grid`、`slider` 等组件的功能，并引入更多高信息密度的扩展块，以满足复杂的 AI 协作与富文档输出需求。

## 1. 核心目标

在遵守 `PRINCIPLES.md` (极简源码、优雅降级、token 经济) 的前提下，扩展 `.rmd` 的表现力。具体而言：
1. **横向扩展**：引入新的业务场景块（如时间轴、看板、折叠面板、多媒体、富嵌入等）。
2. **纵向深化**：为现有的基础块（图表、布局、交互控件）增加更多高级配置和变体，提升其实用价值。
3. **保持纯粹**：所有新增特性必须在不支持的渲染器或无 JS 环境下有明确、可读的降级方案（Fallback）。

---

## 2. 现有扩展块的深度增强

### 2.1 `:::chart` 图表能力的增强

原先仅支持 `bar`, `line`, `pie`。
**新增图表类型**：

- `scatter` (散点图)：用于展示两个变量的关系。
- `radar` (雷达图)：用于多维能力/属性的对比。
- `area` (面积图)：基于折线图，强调量随时间的变化。
- `donut` (环形图)：饼图的变体，中心可放置总计等文本。
- `heatmap` (热力图)：用于展示矩阵数据的密度或强度。

**新增属性支持**：
- `legend="top|bottom|left|right|none"`：控制图例的显示位置。
- `tooltip="true|false"`：控制悬浮提示的开关。
- `y2="..."`：支持双 Y 轴（例如柱状图和折线图混合时），通过在数据点附加轴标记实现。

**示例**：
```rmd
:::chart radar title="大语言模型能力对比" legend="bottom"
模型       逻辑推理 文本生成 代码编写 数学计算 视觉理解
GPT-4o     95       90       92       88       90
Claude-3.5 90       95       96       85       88
:::
```

### 2.2 `:::grid` 布局能力的增强
原先仅支持固定列数。
**新增能力**：
- **响应式列数**：`columns` 支持传入响应式断点数组，如 `columns="1,2,4"` (分别对应 Mobile, Tablet, Desktop)。
- **单元格跨度 (Span)**：在 cell 内部首行使用特定的 metadata (如 `<!-- span: 2 -->`)，允许单个 cell 跨越多列或多行。
- **瀑布流 (Masonry)**：新增 `layout="masonry"` 属性，对于高度不一致的卡片展示更加友好。

**示例**：
```rmd
:::grid 1,2,3 gap="md" layout="masonry"
[卡片 1]
---
[卡片 2 - 高度更高]
---
[卡片 3]
:::
```

### 2.3 `:::slider` 交互能力的增强
原先仅支持单一的线性数值调节。
**新增能力**：
- **非线性缩放 (Scale)**：`scale="log"` (对数) 或 `scale="pow"` (指数)，适用于跨度极大的参数（如学习率 `0.0001` 到 `1`）。
- **离散标记 (Marks)**：`marks="10,50,100,500"`，滑块会吸附到特定离散值，并在轨道上显示刻度。
- **范围选择 (Range Slider)**：当 `name` 定义为两个变量时（如 `name="min_val,max_val"`），渲染为双向滑块，选择一个区间。

**示例**：
```rmd
:::slider name="learning_rate" min=0.0001 max=0.1 scale="log" default=0.001 label="学习率"
:::
```

---

## 3. 全新扩展块引入

为覆盖更多高频的 AI 输出与复杂文档场景，新增以下核心扩展块：

### 3.1 `:::timeline` / `:::steps` (时间轴 / 步骤条)
**用途**：用于展示项目规划、操作步骤、历史发展沿革。
**语法**：
```rmd
:::timeline [direction="vertical|horizontal"]
@ 2026-01-01 [title="项目启动"]
这里是正文描述...
@ 2026-06-01 [title="Alpha 发布"] [status="success"]
发布了最初版本。
@ 2026-12-01 [title="1.0 正式版"] [status="pending"]
预计目标。
:::
```
**Fallback**：降级为有序列表或普通列表，节点标题加粗。

### 3.2 `:::kanban` / `:::board` (看板)
**用途**：用于任务管理、状态机流转展示。
**语法**：
```rmd
:::kanban
@ [Todo]
- 需求分析文档
- UI/UX 设计草图
@ [In Progress]
- 核心渲染器开发
@ [Done]
- 语法规范制定
:::
```
**Fallback**：降级为带有三级标题 (`### Todo`) 的多个列表，或降级为普通的 `grid` 布局。

### 3.3 `:::details` / `:::accordion` (折叠面板)
**用途**：隐藏次要信息（如大段的日志、长代码、详细证明），保持页面整洁，用户点击展开。
**语法**：
```rmd
:::details title="点击查看完整的报错日志" [open="true"]
```log
Error: Uncaught exception at line 42...
```
:::
```
**Fallback**：无 JS 环境默认展示，前置一个 `### title`。

### 3.4 `:::carousel` (轮播图/卡组)
**用途**：在有限的空间内并排展示多张图片、图表或信息卡片。
**语法**：
```rmd
:::carousel [autoplay="true"] [interval="3000"]
![图 1](url1)
---
![图 2](url2)
---
:::chart bar
...
:::
```
**Fallback**：垂直堆叠展示，或者降级为水平滚动的原生列表。

### 3.5 `:::embed` (外部富媒体嵌入)
**用途**：安全地嵌入第三方服务（Figma, CodePen, YouTube, Bilibili等）。
**语法**：
```rmd
:::embed type="youtube" id="dQw4w9WgXcQ" [aspect-ratio="16/9"]
:::
```
**Fallback**：降级为普通的 Markdown 链接 `[点击在 YouTube 观看](...)`。

### 3.6 `:::math` (数学公式)
**用途**：支持块级 LaTeX 公式渲染，专为学术、科研、算法解释设计。
**语法**：
```rmd
:::math
E = mc^2
:::
```
*(注：对于行内公式，建议在 Markdown 解析器层支持 `$E = mc^2$` 语法，本扩展块专用于块级公式排版。)*
**Fallback**：降级为普通的代码块，标记 `lang="latex"`。

---

## 4. 数据模型与契约 (AST / Contract) 更新评估

1. **AST 兼容性**：新增的扩展块需要加入到 `BlockNode` 的联合类型中（例如 `TimelineNode`, `DetailsNode` 等）。
2. **位置与坐标**：由于 `:::grid` 和 `:::carousel` 等复合块允许内部嵌套 `---` 分隔符，解析器需要准确记录每个分隔子树的 AST position 偏移。
3. **版本演进**：这些改动作为次版本号 (e.g., `v0.2.0`) 的更新引入，保证向前兼容。旧版本渲染器遇到新块（如 `timeline`）会自动降级为 `code-block` 配合原文展示。

## 5. 结论与下一步

此次扩展极大地扩充了 `.rmd` 的表现层，特别是对"时间维度 (timeline)"、"状态维度 (kanban)"和"空间维度 (details, carousel)"的补充，使得 AI 在输出长篇架构设计、项目计划、数据分析报告时拥有了充足且高密度的展现形式。

**下一步行动项**：
- [ ] 将上述新增块的详细 AST 结构补充到 `DATA-MODEL.md` 中。
- [ ] 在 `CONTRACT.md` 中更新具体语法与边界条件定义。
- [ ] 在官方解析器/渲染器库（`packages/renderer-core`）中实现对应 AST 节点的解析逻辑。
- [ ] 提供新增特性的测试用例（覆盖解析与 fallback 表现）。
