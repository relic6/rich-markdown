# DATA-MODEL：Rich Markdown AST 数据资产规范

> **读者**：核心开发者、解析器/渲染器实现者、想消费或转换 AST 的工具作者
> **阅读时长**：20–30 分钟（也作为日常翻字典）
> **最近更新**：2026-05-10
> **本规范版本**：v0.2-draft

## 0. 这份文档的角色

CONTRACT 给出了"用户能写什么 / 接入方能调用什么"。DATA-MODEL 给出的是中间那层数据结构：**`.rmd` 文本被解析后变成的 AST 究竟长什么样**。

它面向四类读者：

- **核心解析器实现者**：本文是产出物的形式定义。
- **核心渲染器实现者**：本文是输入的形式定义。
- **第三方插件作者**：注册新块时返回的 AST 节点必须遵守本文规则。
- **AI / 工具消费者**（比如要把 AST 喂给 LLM 做转换）：本文告诉你 JSON 长什么样、能假设什么不变量。

本文档与 CONTRACT 配合使用：CONTRACT 描述每个块的"语法和行为"，本文描述对应的"数据结构"。**两者冲突时以 CONTRACT 为准**——AST 是 CONTRACT 的实现细节。

## 1. 设计原则（AST 自己的"PRINCIPLES"）

AST 的设计在 PRINCIPLES 之下，再加 6 条针对数据结构的约束：

**D1 — 100% JSON-able**：AST 必须能被 `JSON.stringify` 无损往返。**禁止**函数、Symbol、`undefined` 字段（用 `null` 或省略代替）、循环引用、类实例、Date 对象（用 ISO 字符串代替）。

**D2 — 字段名稳定**：v0.x 阶段允许加字段、不允许删/改字段语义；v1.0 起完全锁定。改名等同破坏，必须主版本号升级。

**D3 — 节点类型是判别字段**：每个节点必须有 `type: string` 字段作为判别联合（discriminated union）的入口。`type` 值全局唯一、`kebab-case`、ASCII。

**D4 — 未知字段必须保留**：消费者遇到不认识的字段，必须原样保留并透传。这保证向前兼容——新解析器加的字段不会被旧渲染器丢失。

**D5 — 没有"隐式上下文"**：每个节点要么自包含，要么通过显式引用（如 slider 的 `name` 被 export 模板用 `{{name}}` 引用）建立关系。**禁止依赖父节点状态**——子树可以被任意截取出来单独渲染或分析。

**D6 — 文本是叶子，不是属性**：所有可见文本都通过 `text` 节点承载，不直接放在父节点的字符串属性里。这让"加粗、链接、行内代码"等内联语义可以统一表达，也让 AI 处理 AST 时不会跳过被埋在属性里的文本。

## 2. 顶层结构

### 2.1 `RmdAst`（根）

```ts
interface RmdAst {
  type: 'root';
  /** .rmd 规范版本，跟随解析器；用于消费方判断兼容性 */
  version: string;        // 例 "0.1.0"
  /** 解析后的 frontmatter，未声明则为 {} */
  frontmatter: Frontmatter;
  /** 文档级警告（非块级），如 "frontmatter parse failed" */
  warnings: string[];
  /** 文档主体的块级节点序列 */
  children: BlockNode[];
}
```

**不变量**：

- `version` 必须是合法 semver；解析器自动填入，作者不可在源文件中覆盖。
- `frontmatter` 必须是平凡 JSON 对象（同 D1 约束）。
- `warnings` 即使为空数组也必须出现（避免消费者写 `?.length` 防御）。

### 2.2 `Frontmatter`

```ts
interface Frontmatter {
  // 核心字段（CONTRACT §1.3 已定义）
  title?: string;
  theme?: string;            // 默认 "default"
  format?: 'rmd';
  version?: string;          // 文档作者声明的兼容版本范围
  share?: 'private' | 'team' | 'public';
  description?: string;
  cover?: string;
  lang?: string;             // BCP 47

  // 自定义字段：必须以 "x-" 开头
  [key: `x-${string}`]: unknown;
}
```

**严格性**：核心字段类型不符直接报错（如 `theme: 123` → warning + 视为不存在）；非 `x-` 前缀的未知字段视为未定义行为，解析器可以忽略也可以告警。

## 3. 节点基础接口

所有节点共享如下基础字段（除 `type` 外都可选）：

```ts
interface NodeBase {
  /** 判别字段，必填 */
  type: string;

  /** 在源文件中的位置（行/列/字节偏移） */
  position?: Position;

  /** 节点级警告，如属性校验失败、unclosed、unknown attrs */
  warnings?: string[];

  /** 解析失败或降级时保留的原始源码片段，用于 fallback 显示 */
  raw?: string;

  /** 解析器/插件未识别的原始属性，必须保留 */
  unknownAttrs?: Record<string, string>;
}

interface Position {
  start: { line: number; column: number; offset: number };
  end:   { line: number; column: number; offset: number };
}
```

**Position 约定**：

- `line` 1-based，`column` 1-based（与编辑器习惯一致）；`offset` 0-based 字节偏移。
- 所有解析器**应当**填充 `position`，便于 IDE 报错定位、source map、可视化工具高亮。
- 例外：插件返回的 AST 可能没有 position（无源码可参照），消费者必须容忍 `position === undefined`。

## 4. CommonMark 节点

CommonMark 节点遵循 [mdast](https://github.com/syntax-tree/mdast) 简化版本。下表只列字段，详细语义见 mdast 规范。

### 4.1 块级节点

| `type` | 字段 | 说明 |
|---|---|---|
| `heading` | `level: 1..6`<br>`children: InlineNode[]` | 标题 |
| `paragraph` | `children: InlineNode[]` | 段落 |
| `code-block` | `lang: string \| null`<br>`value: string` | 围栏代码块（fenced code）|
| `blockquote` | `children: BlockNode[]` | 引用 |
| `list` | `ordered: boolean`<br>`start: number \| null`<br>`tight: boolean`<br>`children: ListItem[]` | 有/无序列表 |
| `list-item` | `checked: boolean \| null`<br>`children: BlockNode[]` | 列表项；`checked` 仅 task list |
| `table` | `align: ('left'\|'center'\|'right'\|null)[]`<br>`children: TableRow[]` | 表格（GFM 兼容）|
| `table-row` | `children: TableCell[]` | 表格行 |
| `table-cell` | `align: ...`<br>`children: InlineNode[]` | 单元格 |
| `thematic-break` | — | `---` 水平分割线 |
| `html-block` | `value: string` | 原生 HTML 块；渲染器可选择转义或直渲 |

### 4.2 行内节点

| `type` | 字段 | 说明 |
|---|---|---|
| `text` | `value: string` | 纯文本 |
| `emph` | `children: InlineNode[]` | 斜体 |
| `strong` | `children: InlineNode[]` | 加粗 |
| `inline-code` | `value: string` | 行内代码 |
| `link` | `url: string`<br>`title: string \| null`<br>`children: InlineNode[]` | 链接 |
| `image` | `url: string`<br>`title: string \| null`<br>`alt: string` | 图片 |
| `soft-break` | — | 普通换行 |
| `hard-break` | — | 强制换行（`  \n` 或 `\\\n`）|
| `inline-html` | `value: string` | 原生行内 HTML |

**不变量**：CommonMark 节点的 `type` 名称与上表完全一致，不允许实现方自行命名。

## 5. 扩展块节点（v0.1）

CONTRACT §2 用 JSON 示例展示了形态；本节给出严格的 TypeScript 类型并补全语义约束。

### 5.1 `chart`

```ts
interface ChartNode extends NodeBase {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'area' | 'donut' | 'heatmap';
  title: string | null;
  x: string | null;
  y: string | null;
  y2: string | null;
  legend: 'top' | 'bottom' | 'left' | 'right' | 'none';
  tooltip: boolean;
  emphasis: 'primary' | 'secondary' | 'none';
  data: { label: string; values: number[] }[];
  /** 原始内容字符串，供降级渲染（如表格）使用 */
  raw: string;
}
```

**不变量**：
- `data` 至少 1 个数据点。
- 同一节点所有 `values` 数组**长度必须一致**（多系列）；不一致则该节点 `warnings` 含 `"chart-series-mismatch"` 并以最短长度截断。
- `chartType === 'pie'` 时 `values` 长度必须为 1。

### 5.2 `grid`

```ts
interface GridNode extends NodeBase {
  type: 'grid';
  columns: number | number[]; // 支持单数值或响应式断点数组
  gap: 'sm' | 'md' | 'lg';
  layout: 'default' | 'masonry'; // 瀑布流支持
  cells: BlockNode[][]; // 每个 cell 是块级节点数组（一段 children）
}
```

**不变量**：
- `cells.length` ≤ 12；超过则截断 + warning。
- `cells[i]` 不能再含 `GridNode`（v0.1 禁止 grid 嵌套）。

### 5.3 `callout`

```ts
interface CalloutNode extends NodeBase {
  type: 'callout';
  kind: 'info' | 'tip' | 'warning' | 'danger' | 'success';
  title: string | null;
  children: BlockNode[];
}
```

### 5.4 `slider`

```ts
interface SliderNode extends NodeBase {
  type: 'slider';
  /** 文档内全局唯一变量名；若是范围滑块则为多变量逗号分隔（如 "min_val,max_val"） */
  name: string;
  min: number;
  max: number;        // 必须 > min
  step: number;       // 必须 > 0
  default: number | number[];    // 必须 ∈ [min, max]
  unit: string;       // 默认 ""
  label: string;      // 默认与 name 同
  scale: 'linear' | 'log' | 'pow';
  marks: number[] | null;
}
```

**不变量**：
- `name` 全文档唯一；重复时第二个起 `warnings` 含 `"slider-duplicate-name"` 并被忽略（不进入运行时变量表）。
- `name` 必须匹配 `^[a-zA-Z_][a-zA-Z0-9_]*$`；不匹配整节点降级为 `code-block`。

### 5.5 `export`

```ts
interface ExportNode extends NodeBase {
  type: 'export';
  label: string;
  format: 'text' | 'markdown' | 'json';
  /** 原始模板字符串，含 {{var}} 占位 */
  template: string;
  /** 解析模板得到的引用变量列表，便于消费方做依赖分析 */
  references: string[];
}
```

**不变量**：
- `references` 由解析器从 `template` 中扫描 `{{name}}` 抽取，去重；不要求这些变量真的存在（运行时再检查）。

### 5.6 `flow`

```ts
interface FlowNode extends NodeBase {
  type: 'flow';
  direction: 'lr' | 'tb';
  nodes: { id: string }[];
  edges: { from: string; to: string }[];
}
```

**不变量**：
- `nodes[*].id` 唯一，由解析器从 `edges` 中收集去重；不允许独立声明节点（v0.1 简化）。
- `edges[*].from` 与 `to` 必须出现在 `nodes` 中（解析器同步保证）。
- 自环（`from === to`）允许；多重边允许（消费方可去重）。

### 5.7 `diff`

```ts
interface DiffNode extends NodeBase {
  type: 'diff';
  lang: string | null;
  title: string | null;
  lines: DiffLine[];
}

interface DiffLine {
  kind: 'add' | 'remove' | 'context';
  text: string;          // 不含前缀符
  note: string | null;   // @注: 之后的内联注释
}
```

### 5.8 `tabs`

```ts
interface TabsNode extends NodeBase {
  type: 'tabs';
  default: string;            // 默认激活的标签 label
  panels: TabPanel[];
}

interface TabPanel {
  label: string;              // 唯一
  children: BlockNode[];      // panel 内不允许再嵌套 TabsNode
}
```

**不变量**：
- `panels.length` ≥ 1；
- `default` 必须在 `panels[*].label` 中存在，否则解析器自动改为第一个 panel 的 label，并加 `warnings: ["tabs-default-missing"]`。

### 5.9 `timeline`

```ts
interface TimelineNode extends NodeBase {
  type: 'timeline';
  direction: 'vertical' | 'horizontal';
  items: TimelineItem[];
}

interface TimelineItem {
  time: string;
  title: string | null;
  status: 'default' | 'success' | 'warning' | 'danger' | 'pending';
  children: BlockNode[];
}
```

### 5.10 `kanban`

```ts
interface KanbanNode extends NodeBase {
  type: 'kanban';
  columns: KanbanColumn[];
}

interface KanbanColumn {
  title: string;
  children: BlockNode[];
}
```

### 5.11 `details`

```ts
interface DetailsNode extends NodeBase {
  type: 'details';
  title: string;
  open: boolean;
  children: BlockNode[];
}
```

### 5.12 `carousel`

```ts
interface CarouselNode extends NodeBase {
  type: 'carousel';
  autoplay: boolean;
  interval: number;
  items: BlockNode[][];
}
```

### 5.13 `embed`

```ts
interface EmbedNode extends NodeBase {
  type: 'embed';
  embedType: string;
  embedId: string;
  aspectRatio: string | null;
}
```

### 5.14 `math`

```ts
interface MathNode extends NodeBase {
  type: 'math';
  value: string;
}
```

## 6. 联合类型与树形

为方便 TypeScript 类型推导，DATA-MODEL 提供以下联合类型（`@rmd/ast` 包导出）：

```ts
type BlockNode =
  // CommonMark 块级
  | HeadingNode | ParagraphNode | CodeBlockNode | BlockquoteNode
  | ListNode | TableNode | ThematicBreakNode | HtmlBlockNode
  // 扩展块
  | ChartNode | GridNode | CalloutNode | SliderNode
  | ExportNode | FlowNode | DiffNode | TabsNode
  // 高级扩展块 v0.2
  | TimelineNode | KanbanNode | DetailsNode | CarouselNode
  | EmbedNode | MathNode;

type InlineNode =
  | TextNode | EmphNode | StrongNode | InlineCodeNode
  | LinkNode | ImageNode | SoftBreakNode | HardBreakNode | InlineHtmlNode;

type AnyNode = RmdAst | BlockNode | InlineNode;
```

**树形约束**：

- 内联节点不能直接出现在 `BlockNode[]` 位置（必须包在 `paragraph` 或 `heading` 里）。
- 块级节点不能出现在 `InlineNode[]` 位置（除非该节点本身允许块级 children，如 `list-item` 的 `children: BlockNode[]`）。

## 7. 序列化与不变量

### 7.1 `JSON.stringify` 往返

下面这段代码必须永远成立：

```ts
const ast1 = parse(source);
const json = JSON.stringify(ast1);
const ast2 = JSON.parse(json);
expect(ast2).toEqual(ast1);  // 深度相等
```

任何破坏此不变量的字段都视为非法（如塞 Symbol、Date、Map）。

### 7.2 解析幂等

```ts
parse(source) === parse(source)   // 深度相等，多次调用结果相同
```

解析器**禁止**依赖时间、随机数、外部状态。这保证 AST 可缓存、可分布式重算、可作为 cache key。

### 7.3 `position.offset` 字节正确性

如果填了 `position`，`source.slice(start.offset, end.offset)` 必须等于该节点对应的源码片段（含围栏标记）。这条用于 IDE 高亮和 source map。

### 7.4 `unknownAttrs` 透传

任何插件 / 渲染器消费 AST 时，**必须保留** `unknownAttrs` 字段透传到下游。这保证多渲染器环境下，A 渲染器不认识的属性传给 B 渲染器仍可用。

## 8. 版本演化与迁移

### 8.1 版本字段

`RmdAst.version` 表示解析器使用的 .rmd 规范版本（不是包版本）。

- v0.1.0 / v0.1.1 / v0.1.2 ... 字段集相同，可能修 bug 或加 `warnings` 类型
- v0.2.0 可能加新节点类型（如 `diagram`）、加可选字段
- v1.0.0 锁定全部字段

### 8.2 兼容性矩阵

| 解析器版本 | 写出 AST 版本 | 渲染器期望版本 | 结果 |
|---|---|---|---|
| v0.1.x | 0.1.x | 0.1.x | ✅ 完全兼容 |
| v0.2.x | 0.2.x | 0.1.x | ⚠️ 旧渲染器：未知节点降级为 `code-block`（D4 + P8） |
| v0.1.x | 0.1.x | 0.2.x | ✅ 新渲染器读旧 AST 必须无损 |
| v1.x.x | 1.x.x | 0.x.x | ❌ 主版本不兼容；消费者拒绝渲染并提示升级 |

### 8.3 迁移函数

`@rmd/ast` 提供官方迁移函数：

```ts
import { migrate } from '@rmd/ast';

// 把 0.1 AST 升级为 0.2
const ast02 = migrate(ast01, { from: '0.1.0', to: '0.2.0' });
```

迁移函数遵循以下规则：

- 增量、可逆（在能力范围内）
- 永远不丢失数据：v0.1 不认识的字段在 v0.2 视为 `unknownAttrs` 保留
- 跨主版本（如 0.x → 1.x）的迁移单独发布迁移指南，不放在 `migrate()` 自动路径里

### 8.4 字段加 / 改 / 删的规则

| 操作 | 允许的版本变更 | 备注 |
|---|---|---|
| 加可选字段 | 次版本 | 默认值必须明确 |
| 加必填字段 | 主版本 | 罕见，需要 ADR |
| 字段改名 | 主版本 | 必须提供迁移函数 |
| 字段类型变化 | 主版本 | 必须提供迁移函数 |
| 删除字段 | 主版本 | 必须提供迁移函数 + 至少 12 个月并行支持 |
| 字段语义变化（类型不变）| 主版本 | 视为破坏 |

## 9. 校验：JSON Schema 与 TypeScript

`@rmd/ast` 包同时提供两套校验工具：

- **TypeScript 类型**：`@rmd/ast` 直接导出，便于编译时检查
- **JSON Schema**（Draft 2020-12）：`@rmd/ast/schema.json`，供 Python / Rust / Go 等语言或 CI 使用

```ts
import { validate, RmdAst } from '@rmd/ast';

const result = validate(ast);
if (!result.ok) {
  console.error(result.errors);  // [{ path: "/children/3/min", message: "..." }]
}
```

校验级别：

- **strict**（默认）：未知字段也报错
- **lenient**：未知字段 + `x-` 前缀字段忽略；用于消费第三方插件产出的 AST

## 10. 完整示例

下面是 QUICKSTART §2.1 那份"支付服务限流方案对比"的 `.rmd`，解析后的 AST（节选关键部分；省略 `position` 字段以减少噪声）：

```json
{
  "type": "root",
  "version": "0.1.0",
  "frontmatter": {
    "title": "支付服务限流方案对比",
    "theme": "tech-dark",
    "share": "team"
  },
  "warnings": [],
  "children": [
    {
      "type": "heading",
      "level": 1,
      "children": [{ "type": "text", "value": "支付服务限流方案对比" }]
    },
    {
      "type": "paragraph",
      "children": [
        { "type": "text", "value": "我们要给支付服务选一个限流策略。三种主流方案，按\"突发友好度\"和\"实现复杂度\"两条标准评估。" }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "children": [{ "type": "text", "value": "三个候选" }]
    },
    {
      "type": "grid",
      "columns": 3,
      "gap": "md",
      "cells": [
        [
          { "type": "heading", "level": 3, "children": [{ "type": "text", "value": "令牌桶" }] },
          { "type": "paragraph", "children": [{ "type": "text", "value": "固定速率往桶里加令牌，请求消耗令牌。" }] }
        ],
        [ /* 漏桶 */ ],
        [ /* 滑动窗口 */ ]
      ]
    },
    {
      "type": "chart",
      "chartType": "bar",
      "title": "1000 RPS 压测下的 P99 延迟（ms，越低越好）",
      "x": null, "y": null, "emphasis": "none",
      "data": [
        { "label": "令牌桶",     "values": [23] },
        { "label": "漏桶",       "values": [19] },
        { "label": "滑动窗口",   "values": [41] }
      ],
      "raw": "令牌桶 23\n漏桶 19\n滑动窗口 41"
    },
    {
      "type": "callout",
      "kind": "tip",
      "title": null,
      "children": [
        {
          "type": "paragraph",
          "children": [
            { "type": "strong", "children": [{ "type": "text", "value": "推荐令牌桶" }] },
            { "type": "text", "value": "：在突发场景下延迟和公平性平衡最好..." }
          ]
        }
      ]
    },
    { "type": "slider", "name": "capacity",     "min": 10, "max": 1000, "step": 10, "default": 200, "unit": "", "label": "capacity" },
    { "type": "slider", "name": "refill_rate",  "min": 1,  "max": 200,  "step": 1,  "default": 50,  "unit": "", "label": "refill_rate" },
    { "type": "slider", "name": "burst_window", "min": 1,  "max": 60,   "step": 1,  "default": 10,  "unit": "", "label": "burst_window" },
    {
      "type": "export",
      "label": "复制为限流配置",
      "format": "text",
      "template": "rate_limiter:\n  type: token_bucket\n  capacity: {{capacity}}\n  refill_rate: {{refill_rate}}\n  burst_window_seconds: {{burst_window}}",
      "references": ["capacity", "refill_rate", "burst_window"]
    },
    {
      "type": "flow",
      "direction": "lr",
      "nodes": [
        { "id": "设计" }, { "id": "code review" },
        { "id": "灰度" }, { "id": "全量" },
        { "id": "异常" }, { "id": "回滚" }
      ],
      "edges": [
        { "from": "设计",        "to": "code review" },
        { "from": "code review", "to": "灰度" },
        { "from": "灰度",        "to": "全量" },
        { "from": "灰度",        "to": "异常" },
        { "from": "异常",        "to": "回滚" }
      ]
    },
    {
      "type": "diff",
      "lang": null,
      "title": null,
      "lines": [
        { "kind": "remove", "text": "@rate_limit(window=60, max=100)", "note": null },
        { "kind": "add",    "text": "@token_bucket(capacity=200, refill=50)  # 加了突发保护", "note": null }
      ]
    }
  ]
}
```

观察这份 AST 的几个关键事实：

- **每个节点都是自包含的**——`grid` 的 cell 内容是完整的子树，可以被剪切出来单独渲染（D5）。
- **slider 的状态不在 AST 里**——AST 只描述"声明"，运行时变量值由 runtime 维护。`export.references` 让消费者一眼看出依赖关系，但不耦合状态。
- **flow 的 nodes 由 edges 自动收集**——不存在"游离节点"，所有节点必然参与至少一条边。
- **`raw` 仅在需要降级的节点保留**（`chart` 有，`grid` 没有）——避免无谓的体积膨胀。

整份 AST 序列化后约 3KB JSON。对比同等表现力的 HTML 文档约 8KB（gzip 后），AST 反而**更小**——因为它没有视觉细节。

## 11. 这份文档的修订规则

- AST 字段加 / 改 / 删严格遵循 §8.4 的规则
- 加可选字段：PR + 1 位核心维护者签字（次版本号）
- 改语义或字段类型：PR + 2 位核心维护者签字 + ADR + 14 天 RFC（视为主版本破坏）
- JSON Schema 与 TypeScript 类型由同一个真相源生成（建议从 TS 生成 schema，避免漂移）
- 任何修订必须同步在 `spec/conformance/` 增加测试用例
