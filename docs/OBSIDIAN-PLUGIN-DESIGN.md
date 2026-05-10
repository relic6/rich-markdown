# OBSIDIAN-PLUGIN-DESIGN：Rich Markdown × Obsidian 插件设计与实现方案

> **读者**：本插件的实现者（你）；后续维护者。
> **阅读时长**：45–60 分钟（动手开发约 4–6 周）
> **最近更新**：2026-05-10
> **目标交付物**：一个可放进 `<vault>/.obsidian/plugins/rich-markdown/` 直接加载的 Obsidian 社区插件。

## 0. 这份文档的角色

本文是 **`obsidian-rich-markdown` 插件**的完整设计与实现指南。它把 Rich Markdown 项目已有的解析器、渲染器、主题、运行时打包成 Obsidian 插件，让你能在 Obsidian 笔记环境里直接编辑 `.rmd`、获得 Typora 式的所见即所得体验、或左右分屏的源码 + 预览体验，并且和现有 `.md` 笔记无缝共存。

读完后你应该能：

- 看清整个插件的架构、模块边界、数据流
- 知道每条关键技术决策的取舍理由
- 拿着第 §8 章的分阶段开发计划，按周推进编码
- 在第 §9 章找到可直接复制的代码骨架，避免在样板上耗时间
- 在 §11 提前看到已知风险，绕过别人踩过的坑

文档假设你熟悉：TypeScript、CodeMirror 6 基本概念、Obsidian Plugin API（不熟也没关系，§3 会速通）、Rich Markdown 的核心架构（参见 [`ARCHITECTURE.md`](./ARCHITECTURE.md)、[`CONTRACT.md`](./CONTRACT.md)）。

## 1. 用户场景与目标

### 1.1 主要场景

**场景 A — 在 Obsidian 里写 `.rmd`，编辑时所见即所得**

打开一个 `.rmd` 文件，编辑器是 Typora 式的：你写 `:::chart bar\nQ1 100\n:::`，几行之后图表就直接渲染在原位，光标依然在源码里。这是日常使用最多的模式。

**场景 B — 左右分屏，源码 ↔ 渲染**

需要精确控制 `.rmd` 写法、调试一个块为什么没渲染、或写复杂的图表数据时，希望左边是干净的纯文本源、右边是实时渲染的 HTML，互相滚动联动。

**场景 C — 已有 `.md` 笔记里偶尔嵌入 `:::` 块**

不强制把所有笔记迁移成 `.rmd`。在普通 `.md` 文件里写一个 `:::chart bar`，Reading 视图就能渲染（保持 100% Markdown 兼容性，PRINCIPLES P1）。

**场景 D — 主题切换**

四套官方主题（`default` / `tech-dark` / `paper` / `notion-like`）一键切换；同时支持"跟随 Obsidian 主题"自动模式（暗色界面用 tech-dark，亮色用 default 等）。

**场景 E — 复制为可分享 HTML**

右键菜单/命令面板提供"导出为 self-contained HTML"，产出一份能在 Claude 桌面版 / 邮件 / S3 直接打开的单文件，不依赖 Obsidian。

### 1.2 不做的事（划清边界）

- **不做新的编辑器内核**——直接复用 Obsidian 内置的 CodeMirror 6
- **不做 .rmd 与 .md 的强制相互迁移**——两者并存，用户自己选
- **不做 Obsidian 主题市场对接**——只提供 4 套自带 + 跟随系统
- **不在插件里实现块语法解析**——所有 `:::` 解析复用 `@rmd/parser-core` + `@rmd/blocks-core`
- **不做云同步、协作、权限**——这些是 Obsidian 自己的事，或别的插件的事

### 1.3 验收标准（v0.1）

- [ ] 把插件目录拷进 `<vault>/.obsidian/plugins/rich-markdown/` 后能在"社区插件"里启用，无报错
- [ ] 新建 `note.rmd` 文件，默认以"Live 模式"打开，输入 `:::chart bar\nA 1\nB 2\n:::` 后图表实时显示
- [ ] 命令面板里有"切换到 Split 模式 / Preview 模式 / Live 模式"
- [ ] 设置里能切换 4 套主题，立即生效
- [ ] 在 `.md` 文件里写 `:::callout tip` Reading 视图能渲染
- [ ] 命令"导出为 HTML"能产出一个能在浏览器里独立打开的 HTML 文件
- [ ] 不破坏 Obsidian 自身的样式、不污染全局 CSS（Shadow DOM 验证）

## 2. Obsidian 插件机制速通（如果你已经熟悉，跳过）

### 2.1 文件结构

一个最小 Obsidian 插件需要三个文件：

```
<vault>/.obsidian/plugins/rich-markdown/
├── manifest.json     # 元信息
├── main.js           # 编译后的 IIFE，单文件
└── styles.css        # 可选，全局样式
```

`manifest.json` 形如：

```json
{
  "id": "rich-markdown",
  "name": "Rich Markdown",
  "version": "0.1.0",
  "minAppVersion": "1.4.0",
  "description": "Render and edit Rich Markdown (.rmd) inside Obsidian.",
  "author": "Rich Markdown Project",
  "isDesktopOnly": false
}
```

### 2.2 关键 API 速查

| API | 用途 |
|---|---|
| `class Plugin` | 插件主类，生命周期 `onload()` / `onunload()` |
| `addCommand({ id, name, callback })` | 注册命令面板命令 |
| `addSettingTab(new MySettings(this))` | 注册设置面板 |
| `registerView(VIEW_TYPE, leaf => new MyView(leaf))` | 自定义文件视图 |
| `registerExtensions(["rmd"], "markdown")` | 把 `.rmd` 当 Markdown 处理（或用自定义视图） |
| `registerMarkdownPostProcessor(fn)` | Reading 模式下后处理 Markdown DOM |
| `registerEditorExtension(extensions[])` | 注入 CodeMirror 6 扩展（Live Preview 用） |
| `class ItemView` / `class TextFileView` | 自定义视图基类 |
| `MarkdownRenderer.renderMarkdown()` | 复用 Obsidian 内置 Markdown 渲染（嵌套 .md 用） |
| `app.workspace.getActiveViewOfType(VIEW_TYPE)` | 取当前活动视图 |
| `app.vault.read(file)` / `app.vault.modify(file, content)` | 读写文件 |

### 2.3 三种"视图"概念（容易混淆）

Obsidian 同一个 `.md` 文件支持三种"视图模式"：

- **Source mode**：纯文本编辑，看到 Markdown 原文
- **Live Preview mode**：CodeMirror 6 的"半渲染"——大部分块语法转成富视觉，但光标所在区域显示原文；这是 Typora-like 体验
- **Reading mode**：完全只读的 HTML，没有编辑器

我们的插件会同时影响 Live Preview（通过 `EditorExtension`）和 Reading（通过 `MarkdownPostProcessor`），让 `:::` 块在两种模式下都正确渲染。

对 `.rmd` 文件我们走另一条路：**注册一个完全自定义的 `ItemView`**，不沿用 `.md` 的三种模式，而是提供我们自己的三种模式（Live / Split / Preview）。理由见 §4。

## 3. 用户场景到技术方案的映射

| 场景 | 实现路径 |
|---|---|
| A — `.rmd` Typora 体验 | 自定义 `RmdView`（继承 `TextFileView`），CM6 + 内嵌渲染容器 |
| B — `.rmd` 左右分屏 | 同一个 `RmdView` 的另一种 `displayMode` |
| C — `.md` 内嵌 `:::` | `registerMarkdownPostProcessor()` + `registerEditorExtension()` |
| D — 主题切换 | 设置项 + 重新注入 CSS（Shadow DOM 内） |
| E — 导出 HTML | 命令调用 `@rmd/renderer`'s `buildHtml(source, { mode: 'self-contained' })` |

## 4. 核心架构

### 4.1 总览图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Obsidian Plugin Process                          │
│                                                                          │
│  ┌──────────────┐                ┌─────────────────────────┐            │
│  │  Plugin      │  注册           │  RmdView (TextFileView) │            │
│  │  main.ts     │ ─────────→     │  - 处理 .rmd 文件       │            │
│  │              │                │  - 三种 displayMode      │            │
│  └──────┬───────┘                │    Live / Split / Preview│            │
│         │                         └────────────┬────────────┘            │
│         │ 注册                                  │                         │
│         ▼                                      │ 内嵌                    │
│  ┌──────────────┐                              ▼                         │
│  │ MD Post      │              ┌─────────────────────────────┐           │
│  │ Processor    │              │   <rmd-render> Shadow DOM   │           │
│  │ (.md 内 :::) │              │   ┌─────────────────────┐   │           │
│  └──────┬───────┘              │   │ theme.css (注入)    │   │           │
│         │                       │   │ rendered HTML       │   │           │
│         │ 注册                  │   │ runtime hydrate     │   │           │
│         ▼                       │   └─────────────────────┘   │           │
│  ┌──────────────┐                └─────────────────────────────┘           │
│  │ CM6          │                                                          │
│  │ Extension    │              ┌─────────────────────────────┐           │
│  │ (.md Live    │ ───wraps───→ │  Same Shadow DOM widget     │           │
│  │  Preview)    │              │  decoration                 │           │
│  └──────────────┘              └─────────────────────────────┘           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    @rmd/* packages (vendored / linked)            │    │
│  │   parser-core   blocks-core   ast   renderer-core   runtime       │    │
│  │   themes-default                                                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 三种视图模式的状态机

`RmdView` 内部维护 `displayMode: 'live' | 'split' | 'preview'`：

```
                    ┌────────────────────────┐
                    │  RmdView 打开 .rmd 文件 │
                    └─────────────┬──────────┘
                                  │
                       默认从 settings 读
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
        ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Live      │  │   Split      │  │   Preview    │
        │ 单栏 Typora │  │ 左源右渲染    │  │ 仅渲染只读   │
        └──────┬──────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               └─────────────────┴─────────────────┘
                                 │
                       命令 / 工具栏切换
```

切换时不丢编辑状态：源码字符串保持在 `this.data` 中，只是渲染呈现不同。

### 4.3 数据流（编辑 → 渲染）

```
用户在 CM6 编辑器里敲键盘
      │
      ▼
EditorView.update event  
      │
      ▼
this.requestRender()           ← debounce 150ms
      │
      ▼
this.data = editor.getValue()  ← 源码同步到内部状态
      │
      ▼
parse(this.data)               ← @rmd/parser-core
      │
      ▼
AST                            ← 见 DATA-MODEL.md
      │
      ▼
renderFragmentToString(ast)    ← @rmd/renderer-core
      │
      ▼
Shadow DOM root.innerHTML = … ← 注入到 <rmd-render> 的 Shadow root
      │
      ▼
hydrate(shadowRoot)            ← @rmd/runtime（slider/tab/export 事件绑定）
      │
      ▼
用户看到刷新结果
```

**关键性能约束**：上面这条链路在桌面 Chrome 上对一份典型 50KB `.rmd` 文档应该 < 30ms 完成（parser ~5ms + render ~10ms + DOM 替换 ~10ms）。所以 150ms 防抖既感觉"实时"又不会卡顿。

### 4.4 模块职责矩阵

| 模块 | 职责 | 不做什么 |
|---|---|---|
| `main.ts` | 注册插件、视图、命令、扩展、设置 | 不持有渲染状态 |
| `view-rmd.ts` | `.rmd` 文件视图，三种 displayMode | 不直接调 parser，通过 view-renderer |
| `view-renderer.ts` | 封装 parse + render + hydrate | 不感知 Obsidian API |
| `live-preview.ts` | CM6 扩展，识别 `:::` 块、生成 widget decoration | 不处理 .rmd 文件 |
| `post-processor.ts` | Reading 模式下的 .md 后处理 | 不处理编辑状态 |
| `theme-bridge.ts` | 主题选择、CSS 注入、跟随系统主题 | 不持有 DOM |
| `runtime-bridge.ts` | 把 @rmd/runtime 的 hydrate 适配到 Shadow DOM | 不感知主题 |
| `settings.ts` | 设置面板 + 类型 | 不持有渲染状态 |

## 5. 关键技术决策（含取舍理由）

### TD-P-001: 用 TypeScript + esbuild 构建插件

Obsidian 社区插件标准做法。esbuild 一次构建产出单文件 IIFE `main.js`。开箱即用、无 Webpack 配置地狱。

### TD-P-002: 复用 `@rmd/*` 包，不重新实现解析/渲染

`@rmd/parser-core`、`@rmd/blocks-core`、`@rmd/renderer-core`、`@rmd/runtime`、`@rmd/themes-default` 在主项目里已经写好且测过，插件直接 vendor 进来或通过 pnpm workspace 链接。**插件本身只负责"把它们接到 Obsidian"**，不重写任何块解析逻辑。这保证插件和 CLI 行为一致，未来升级 v0.2/v0.3 时只需要替换包版本。

### TD-P-003: `.rmd` 用自定义 `ItemView`，不复用 .md 三模式

理由：
- Obsidian 的 .md 三模式（Source/Live/Reading）是为 Markdown 优化的，强行套到 `.rmd` 上意味着我们要在 Live Preview 里塞自己的 widget、在 Reading 里塞 post-processor，且无法支持"左右分屏"这个核心场景。
- 自定义 `ItemView` 让我们完全控制 layout，可以自己决定单栏/分屏/只读三种模式。
- 代价：失去 Obsidian 的某些原生能力（比如双向链接的可视化），需要单独适配——但这是合理交换。

### TD-P-004: `.md` 走"轻接入"路径（post-processor + CM6 扩展）

`.md` 文件继续用 Obsidian 原生编辑器；我们只在 Reading 模式下用 `MarkdownPostProcessor` 把 `:::block` 后期渲染、在 Live Preview 模式下用 `EditorExtension` 注入 widget decoration。这样用户可以在已有 .md 笔记里**渐进式**采用 Rich Markdown，无需迁移。

### TD-P-005: 渲染目标用 Shadow DOM 隔离样式

主题 CSS 包含 `body[data-rmd-theme]` 等带 body 选择器的规则，直接注入会污染 Obsidian。**每个渲染区域创建一个 `<rmd-render>` 自定义元素 + Shadow Root**，主题 CSS 注入到 shadow 内，HTML 内容也渲染在 shadow 内。Obsidian 的全局 CSS 自动不穿透；我们的 CSS 也不外泄。

### TD-P-006: 实时渲染用 150ms debounce + 全量重渲

第一版不做增量渲染，原因：
- AST 重渲很快（< 30ms）
- 实现增量需要做"块级 diff + 局部替换"，复杂度高
- 150ms debounce 已经感觉实时

v0.2 如果发现大文档（> 200KB）卡顿，再考虑增量优化。

### TD-P-007: 主题选择 = 4 套官方 + "跟随 Obsidian"

四套官方主题就是 `@rmd/themes-default` 里已有的；"跟随 Obsidian" 模式根据 `body.theme-light` / `body.theme-dark` 自动选择 default / tech-dark。这是给最常见的用户偏好做的兜底。

### TD-P-008: 文件保存 = 直接写源 `.rmd`

不存渲染缓存、不存中间产物。文件就是源文件本身，跟 Obsidian 处理 .md 的方式完全一致。这保证 Obsidian 的版本历史、Sync、Git 集成都自动生效。

### TD-P-009: 不在插件里跑 esbuild / 不下载远程资源

所有需要的 JS / CSS 都在插件构建时打入 `main.js`。运行时不发起任何网络请求（KaTeX 等可选 lazy load 除外，且必须在设置里可关）。

### TD-P-010: Mobile 兼容不强求

`isDesktopOnly: false` 但首发主要保证桌面正常，移动端 best-effort。CM6 的 EditorExtension 在移动版 Obsidian 表现略不稳，分屏在窄屏上自动退化为单屏。

## 6. 关键实现方案（细化）

### 6.1 `.rmd` 文件接入：自定义 ItemView

注册一次性绑定 `.rmd` 扩展名到我们的视图：

```ts
// main.ts (片段)
this.registerExtensions(["rmd"], RMD_VIEW_TYPE);
this.registerView(RMD_VIEW_TYPE, leaf => new RmdView(leaf, this));
```

`RmdView` 继承 `TextFileView`，由 Obsidian 自动调用 `getViewData()` / `setViewData()` 与 vault 同步：

```ts
export class RmdView extends TextFileView {
  private editor: EditorView;            // CodeMirror 6
  private renderHost: HTMLElement;       // <rmd-render> 元素
  private shadowRoot: ShadowRoot;
  private displayMode: 'live'|'split'|'preview' = 'live';
  private renderTimer: number | null = null;

  getViewType()    { return RMD_VIEW_TYPE; }
  getDisplayText() { return this.file?.basename ?? 'Rich Markdown'; }
  getIcon()        { return 'rmd-icon'; }

  // Obsidian 调这两个做读写：
  getViewData(): string { return this.editor?.state.doc.toString() ?? ''; }
  setViewData(data: string, clear: boolean) {
    if (clear) this.clear();
    this.mountIfNeeded();
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: data }});
    this.render();
  }
  clear() { /* 清空 editor + render host */ }
}
```

完整骨架见 §9.3。

### 6.2 `.md` 内 `:::` 块的渲染

**Reading 模式**：

```ts
this.registerMarkdownPostProcessor((el, ctx) => {
  // el 是已经渲染好的 .md DOM 片段
  // 找出所有以 ::: 开头的代码块（Obsidian 会把围栏块当代码块处理）
  el.querySelectorAll('pre > code').forEach(code => {
    const text = code.textContent ?? '';
    if (text.startsWith(':::')) {
      const ast = parse(text);
      const html = renderFragmentToString(ast);
      const host = createRmdHost(html, currentTheme);
      code.parentElement!.replaceWith(host);
    }
  });
});
```

注意：Obsidian 不原生识别 `:::block ... :::` 围栏，所以 `:::` 块在 .md 里**会被当作普通代码块**显示。我们的 post-processor 在 DOM 上识别后替换。

**Live Preview 模式（更复杂，§6.4）**：通过 CM6 EditorExtension 在文档里扫描 `:::block ... :::` 区域，用 `Decoration.replace` 把它替换成 widget。

### 6.3 渲染目标 Shadow DOM 注入（解决样式污染）

```ts
// view-renderer.ts
export function createRmdHost(html: string, themeCss: string): HTMLElement {
  const host = document.createElement('rmd-render');
  host.classList.add('rmd-render-host');
  const shadow = host.attachShadow({ mode: 'open' });

  // 注入主题 CSS
  const style = document.createElement('style');
  style.textContent = themeCss;
  shadow.appendChild(style);

  // 注入渲染好的 HTML
  const main = document.createElement('main');
  main.className = 'rmd-document';
  main.setAttribute('data-rmd-theme', /* current theme id */ '');
  main.innerHTML = html;
  shadow.appendChild(main);

  // hydrate 交互（slider / tab / export）
  hydrate(shadow);

  return host;
}
```

**关键**：所有 `.rmd-document *` 选择器都在 Shadow DOM 里，不会泄漏到 Obsidian 主体；Obsidian 的全局 CSS 也不会穿透到 Shadow DOM 内污染我们的渲染。

### 6.4 Live 模式：CM6 widget 替换 `:::` 块

这是最技术的部分。在 Obsidian 的 Live Preview（基于 CM6）里，我们要识别 `:::block-name [attrs] ... :::` 区域并替换成富渲染。

策略：

1. 写一个 CM6 `StateField`，在文档变化时扫描所有 `:::...:::` 区域
2. 对每个区域生成一个 `WidgetType` 实例，里面放刚才说的 Shadow DOM 渲染
3. 用 `Decoration.replace({ widget })` 把源码区段替换为 widget；当光标进入该区段时，临时露出原文（CM6 标准模式）

```ts
// live-preview.ts (片段，详见 §9.5)
import { StateField, RangeSetBuilder } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { parse, renderFragmentToString } from '@rmd/renderer-core';

class RmdBlockWidget extends WidgetType {
  constructor(readonly source: string, readonly themeCss: string) { super(); }

  toDOM() {
    const ast = parse(this.source);
    const html = renderFragmentToString(ast);
    return createRmdHost(html, this.themeCss);
  }

  eq(other: RmdBlockWidget) {
    return other.source === this.source;  // Source-equal widgets are reused (no re-render)
  }
}

export function rmdLiveExtension(getThemeCss: () => string) {
  return StateField.define<DecorationSet>({
    create(state) { return buildDecorations(state, getThemeCss()); },
    update(value, tr) {
      if (!tr.docChanged && !tr.selection) return value;
      return buildDecorations(tr.state, getThemeCss());
    },
    provide: f => EditorView.decorations.from(f)
  });
}

function buildDecorations(state, themeCss): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  // 找所有 ::: ... ::: 区域
  scanFencedBlocks(state.doc, ({from, to, source, cursorInside}) => {
    if (cursorInside) return;  // 光标在内部时显示原文
    builder.add(from, to, Decoration.replace({
      widget: new RmdBlockWidget(source, themeCss),
      block: true
    }));
  });
  return builder.finish();
}
```

### 6.5 Split 模式：横排两栏

`RmdView.onOpen()` 里根据 `displayMode === 'split'` 构建左右两个容器：

```ts
const container = this.contentEl;
container.empty();
container.addClass('rmd-view', 'rmd-mode-split');

const left = container.createDiv({ cls: 'rmd-pane rmd-pane-source' });
const right = container.createDiv({ cls: 'rmd-pane rmd-pane-preview' });

this.editor = createEditor(left, /* extensions */);
this.renderHost = createRmdHost('', this.themeCss);
right.appendChild(this.renderHost);
```

CSS（在 `styles.css` 中）：

```css
.rmd-mode-split { display: flex; flex-direction: row; height: 100%; }
.rmd-pane-source  { flex: 1; min-width: 280px; overflow: auto; }
.rmd-pane-preview { flex: 1; min-width: 280px; overflow: auto; border-left: 1px solid var(--background-modifier-border); }
```

**滚动同步**（可选 v0.2）：监听编辑器 scroll 事件，按比例同步 preview 滚动。简单实现先做"按行号粗对齐"。

### 6.6 主题系统

```ts
// theme-bridge.ts
import { themes } from '@rmd/themes-default';

export type ThemeChoice = 'default' | 'tech-dark' | 'paper' | 'notion-like' | 'auto';

export function resolveTheme(choice: ThemeChoice): string {
  if (choice !== 'auto') return choice;
  // 跟随 Obsidian
  return document.body.classList.contains('theme-dark') ? 'tech-dark' : 'default';
}

export function getThemeCss(choice: ThemeChoice): string {
  const id = resolveTheme(choice);
  return themes[id] ?? themes.default;
}
```

设置变化时通过事件总线广播，所有活动 `RmdView` 重新调用 `createRmdHost()`：

```ts
this.app.workspace.iterateAllLeaves(leaf => {
  if (leaf.view instanceof RmdView) leaf.view.refreshTheme();
});
```

### 6.7 性能：debounce + 帧调度

```ts
private requestRender() {
  if (this.renderTimer != null) cancelAnimationFrame(this.renderTimer);
  this.renderTimer = window.requestAnimationFrame(() => {
    this.renderTimer = null;
    setTimeout(() => this.doRender(), 150);  // 150ms debounce
  });
}
```

加 `requestAnimationFrame` 包一层是为了让 React-style 的 batched updates 完成后再触发渲染。

### 6.8 导出 self-contained HTML

直接调用 `@rmd/renderer` 的 `buildHtml(source, { mode: 'self-contained', theme })`：

```ts
this.addCommand({
  id: 'rmd-export-html',
  name: 'Export current .rmd as self-contained HTML',
  checkCallback: (checking) => {
    const view = this.app.workspace.getActiveViewOfType(RmdView);
    if (!view || !view.file) return false;
    if (checking) return true;

    const html = buildHtml(view.getViewData(), { mode: 'self-contained', theme: view.themeChoice });
    const outPath = view.file.path.replace(/\.rmd$/, '.html');
    this.app.vault.create(outPath, html).catch(/* handle exists */);
    return true;
  }
});
```

输出到 vault 同目录，文件名同基名 `.html`。

## 7. 工程结构

放在主仓库的 monorepo 里作为新 package：

```
rich-markdown/
├── packages/
│   ├── ast/
│   ├── parser-core/
│   ├── blocks-core/
│   ├── renderer-core/
│   ├── runtime/
│   ├── themes-default/
│   └── obsidian-plugin/                    ← 新增
│       ├── manifest.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── esbuild.config.mjs
│       ├── styles.css
│       ├── README.md
│       ├── src/
│       │   ├── main.ts                     # Plugin 入口
│       │   ├── settings.ts                 # 设置面板
│       │   ├── view-rmd.ts                 # .rmd 自定义视图
│       │   ├── view-renderer.ts            # Shadow DOM 渲染封装
│       │   ├── post-processor.ts           # .md Reading 模式的 ::: 渲染
│       │   ├── live-preview.ts             # CM6 widget 扩展
│       │   ├── theme-bridge.ts             # 主题选择 + 注入
│       │   ├── runtime-bridge.ts           # @rmd/runtime hydrate 适配
│       │   ├── icons.ts                    # 自定义 SVG 图标
│       │   └── types.ts                    # 共享类型
│       └── tests/
│           ├── parser-bridge.test.ts
│           ├── shadow-host.test.ts
│           └── ...
```

`packages/obsidian-plugin/package.json`：

```json
{
  "name": "@rmd/obsidian-plugin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "test": "node --test"
  },
  "dependencies": {
    "@rmd/parser-core": "workspace:*",
    "@rmd/blocks-core": "workspace:*",
    "@rmd/ast": "workspace:*",
    "@rmd/renderer-core": "workspace:*",
    "@rmd/runtime": "workspace:*",
    "@rmd/themes-default": "workspace:*",
    "@rmd/renderer": "workspace:*"
  },
  "devDependencies": {
    "obsidian": "^1.4.0",
    "@codemirror/view": "^6.0.0",
    "@codemirror/state": "^6.0.0",
    "@codemirror/language": "^6.0.0",
    "esbuild": "^0.28.0",
    "typescript": "^5.4.0"
  }
}
```

`esbuild.config.mjs`：

```js
import esbuild from 'esbuild';
import { copyFileSync } from 'node:fs';

const isProd = process.argv.includes('production');

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron',
    '@codemirror/state', '@codemirror/view', '@codemirror/language',
    '@codemirror/commands', '@codemirror/search'],
  format: 'cjs',
  target: 'es2020',
  outfile: 'main.js',
  sourcemap: !isProd,
  minify: isProd,
  treeShaking: true,
  logLevel: 'info'
});

if (isProd) {
  await ctx.rebuild();
  copyFileSync('manifest.json', 'manifest.json'); // (already there)
  await ctx.dispose();
} else {
  await ctx.watch();
}
```

**为什么 external CodeMirror 包**：Obsidian 自己内嵌 CM6，把这些包打到插件里会和 Obsidian 内置的实例冲突（事件不通、装饰器不生效）。

## 8. 分阶段开发计划

总工期估算：**4–6 周**（一个全职开发者）。每阶段都是可独立验收的里程碑。

### Phase 0 — 工程脚手架（半天）

任务：
- [ ] 在 monorepo 里建 `packages/obsidian-plugin/` 目录
- [ ] 写好 `manifest.json` / `package.json` / `tsconfig.json` / `esbuild.config.mjs`
- [ ] 在主 `pnpm-workspace.yaml` 里加路径
- [ ] 跑 `pnpm install`，确认依赖装好
- [ ] 写一个最小 `main.ts`：`onload` 里 `console.log('rmd loaded')`
- [ ] 跑 `npm run dev`，把产出的 `main.js` + `manifest.json` 拷到测试 vault 的 `.obsidian/plugins/rich-markdown/`
- [ ] 在 Obsidian 设置里启用，控制台看到日志 ⇒ 通过

**验收**：插件能加载，无报错。

### Phase 1 — Reading 模式 .md 内 `:::` 块渲染（3 天）

任务：
- [ ] 实现 `view-renderer.ts` 的 `createRmdHost(html, themeCss)`，含 Shadow DOM
- [ ] 实现 `post-processor.ts`：扫描 `pre > code` 找 `:::` 开头的代码块
- [ ] 把 `:::block` 文本喂给 `parse()` + `renderFragmentToString()`，替换 DOM
- [ ] 注入 default 主题 CSS（暂不做主题切换）
- [ ] 调用 `hydrate()` 让 slider / tab / export 工作
- [ ] 写一个测试 .md 文件，含 chart / grid / callout / slider，在 Reading 模式下都能渲染

**验收**：在 Reading 模式下，普通 .md 文件里的 `:::chart bar` 能渲染成图表，`:::slider` 能拖动，样式不污染 Obsidian。

**风险**：Obsidian 的代码块 fenced 语法和 `:::` 不一致，可能要改 post-processor 的扫描逻辑。可能需要在 .md 里写成：

````markdown
```rmd
:::chart bar
A 1
B 2
:::
```
````

或者用第三方 `obsidian-markdown-it-container` 插件提供的 `:::` 支持。**先用 ` ```rmd ` 围栏方案**，简单可靠。

### Phase 2 — `.rmd` 自定义视图（1 周）

任务：
- [ ] 实现 `view-rmd.ts` 的 `RmdView`，继承 `TextFileView`
- [ ] 注册 `.rmd` 扩展：`registerExtensions(['rmd'], RMD_VIEW_TYPE)`
- [ ] `RmdView.onOpen()` 创建一个空的 CM6 EditorView（暂不带高亮）
- [ ] 实现 `getViewData()` / `setViewData()` 与文件系统同步
- [ ] **先只实现 Split 模式**：左 CM6、右 Shadow DOM 渲染 host
- [ ] CM6 编辑事件触发 debounce 重渲右侧
- [ ] 工具栏添加"切换 Live / Split / Preview"按钮（先放 Split / Preview 两个）
- [ ] 实现 Preview-only 模式（隐藏左侧）

**验收**：新建 `note.rmd`，用 Split 模式编辑，左侧改动 150ms 后右侧实时刷新；可以切到 Preview 模式只看渲染。

### Phase 3 — Live 模式（1.5 周）

任务：
- [ ] 实现 `live-preview.ts`：CM6 StateField + WidgetType
- [ ] `scanFencedBlocks(doc, callback)` 扫描所有 `:::xxx ... :::` 区域
- [ ] `RmdBlockWidget.toDOM()` 调 `createRmdHost`
- [ ] `RmdBlockWidget.eq()` 用 source 字符串相等做缓存（避免不必要的重渲）
- [ ] 处理光标进入 widget 区时露出原文（CM6 标准模式 `cursorInside` 检测）
- [ ] 在 `RmdView` 里把 Live 模式的 CM6 配置加上这个 extension
- [ ] 对 .md 文件也注册同一个 extension（Live Preview 模式下用）

**验收**：用 Live 模式打开 .rmd 文件，块在原位渲染，光标进入块时显示源文，光标离开时再变回渲染。手感和 Typora 一致。

**主要难点**：
- CM6 widget 在编辑器折叠/收起时可能高度计算异常 → `WidgetType.estimatedHeight` 给个合理初值
- 光标进入检测要看 `state.selection.main`，判断是否落在 widget 区段
- 大文档扫描性能：可以缓存上次扫描结果，只在 `tr.docChanged` 时重扫

### Phase 4 — 设置 + 主题 + 命令（4 天）

任务：
- [ ] 实现 `settings.ts`：默认主题、默认视图模式、debounce ms、是否在 .md 启用
- [ ] 设置面板用 `Setting` API 组装
- [ ] 实现 `theme-bridge.ts` 的 `resolveTheme(choice)` 含 `auto` 模式
- [ ] 设置变化时广播事件，所有活动视图刷新主题
- [ ] 命令面板加：
  - `Switch to Live mode`
  - `Switch to Split mode`
  - `Switch to Preview mode`
  - `Export current .rmd as self-contained HTML`
  - `Toggle theme: default | tech-dark | paper | notion-like`
- [ ] 在 `.md` 文件的右键菜单加"Insert :::chart"、"Insert :::callout"等模板片段插入
- [ ] 自定义图标：写个 24x24 SVG 给 `.rmd` 文件用

**验收**：所有设置切换生效；命令面板能找到所有命令；右键菜单有插入模板。

### Phase 5 — 测试 + 打磨 + 发布（4 天）

任务：
- [ ] 单元测试：`view-renderer.test.ts`（Shadow host 创建、CSS 注入正确性）
- [ ] 集成测试：用 Obsidian 的 e2e 工具或手动 checklist
  - [ ] 14 个块在 Reading / Live / Split 三种模式下都能渲染
  - [ ] 4 套主题切换都生效
  - [ ] 导出的 HTML 能在浏览器独立打开
  - [ ] 大文档（10000 行）不卡顿
  - [ ] 暗色 / 亮色 Obsidian 主题下样式都对
- [ ] 性能 profiling：用 Chrome DevTools 看 update 链路是否在 30ms 内
- [ ] 写好 `README.md`：截图、安装步骤、常见问题
- [ ] 准备社区插件提交（Obsidian Community Plugins repo）

**验收**：插件目录可独立分发，README 截图齐全，提 PR 到 obsidian-releases。

## 9. 关键代码骨架

下面给出每个核心文件的可拷贝骨架。注释里标 `// TODO` 的是占位需要你填。

### 9.1 `manifest.json`

```json
{
  "id": "rich-markdown",
  "name": "Rich Markdown",
  "version": "0.1.0",
  "minAppVersion": "1.4.0",
  "description": "Render and edit Rich Markdown (.rmd) inside Obsidian — Typora-like Live mode, Split mode, theme switching, and export.",
  "author": "Rich Markdown Project",
  "authorUrl": "https://github.com/your-org/rich-markdown",
  "isDesktopOnly": false
}
```

### 9.2 `src/main.ts`

```ts
import { Plugin, MarkdownPostProcessorContext, WorkspaceLeaf } from 'obsidian';
import { RmdView, RMD_VIEW_TYPE } from './view-rmd';
import { createPostProcessor } from './post-processor';
import { rmdLiveExtension } from './live-preview';
import { RmdSettingTab, DEFAULT_SETTINGS, RmdSettings } from './settings';
import { getThemeCss } from './theme-bridge';

export default class RichMarkdownPlugin extends Plugin {
  settings: RmdSettings;

  async onload() {
    await this.loadSettings();

    // Register .rmd file extension to use our view
    this.registerView(RMD_VIEW_TYPE, leaf => new RmdView(leaf, this));
    this.registerExtensions(['rmd'], RMD_VIEW_TYPE);

    // Register .md ::: post-processor (Reading mode)
    this.registerMarkdownPostProcessor(
      createPostProcessor(() => getThemeCss(this.settings.theme))
    );

    // Register CM6 extension for Live Preview of ```rmd ... ``` in .md
    this.registerEditorExtension(
      rmdLiveExtension(() => getThemeCss(this.settings.theme))
    );

    // Settings tab
    this.addSettingTab(new RmdSettingTab(this.app, this));

    // Commands
    this.addCommand({
      id: 'rmd-switch-mode-live',
      name: 'Switch to Live mode',
      checkCallback: (checking) => this.switchActiveMode('live', checking)
    });
    this.addCommand({
      id: 'rmd-switch-mode-split',
      name: 'Switch to Split mode',
      checkCallback: (checking) => this.switchActiveMode('split', checking)
    });
    this.addCommand({
      id: 'rmd-switch-mode-preview',
      name: 'Switch to Preview mode',
      checkCallback: (checking) => this.switchActiveMode('preview', checking)
    });
    this.addCommand({
      id: 'rmd-export-html',
      name: 'Export current .rmd as self-contained HTML',
      checkCallback: (checking) => this.exportHtml(checking)
    });
  }

  async onunload() {
    // Obsidian unregisters everything we registered automatically
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.app.workspace.iterateAllLeaves(leaf => {
      if (leaf.view instanceof RmdView) leaf.view.refreshFromSettings(this.settings);
    });
  }

  private switchActiveMode(mode: 'live'|'split'|'preview', checking: boolean) {
    const view = this.app.workspace.getActiveViewOfType(RmdView);
    if (!view) return false;
    if (checking) return true;
    view.setDisplayMode(mode);
    return true;
  }

  private exportHtml(checking: boolean) {
    // see §6.8 — implementation omitted here for brevity
    return false;
  }
}
```

### 9.3 `src/view-rmd.ts`

```ts
import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import RichMarkdownPlugin from './main';
import { createRmdHost } from './view-renderer';
import { rmdLiveExtension } from './live-preview';
import { getThemeCss } from './theme-bridge';

export const RMD_VIEW_TYPE = 'rich-markdown-view';

export class RmdView extends TextFileView {
  private editor: EditorView | null = null;
  private renderHost: HTMLElement | null = null;
  private displayMode: 'live'|'split'|'preview';
  private renderTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, private plugin: RichMarkdownPlugin) {
    super(leaf);
    this.displayMode = plugin.settings.defaultMode;
  }

  getViewType()    { return RMD_VIEW_TYPE; }
  getDisplayText() { return this.file?.basename ?? 'Rich Markdown'; }
  getIcon()        { return 'rmd-icon'; }

  getViewData(): string {
    return this.editor?.state.doc.toString() ?? this.data ?? '';
  }

  setViewData(data: string, clear: boolean): void {
    this.data = data;
    if (clear) this.clear();
    this.mountUi();
    this.editor!.dispatch({
      changes: { from: 0, to: this.editor!.state.doc.length, insert: data }
    });
    this.requestRender();
  }

  clear(): void {
    this.contentEl.empty();
    this.editor = null;
    this.renderHost = null;
  }

  setDisplayMode(mode: 'live'|'split'|'preview') {
    if (this.displayMode === mode) return;
    this.displayMode = mode;
    const data = this.getViewData();
    this.clear();
    this.mountUi();
    this.editor?.dispatch({
      changes: { from: 0, to: this.editor.state.doc.length, insert: data }
    });
    this.requestRender();
  }

  refreshFromSettings(settings) {
    // Re-inject theme CSS into shadow root, etc.
    this.requestRender();
  }

  private mountUi() {
    if (this.editor) return; // already mounted
    const root = this.contentEl;
    root.empty();
    root.addClass('rmd-view', `rmd-mode-${this.displayMode}`);

    if (this.displayMode === 'preview') {
      // Hide editor, full-width preview
      this.renderHost = createRmdHost('', getThemeCss(this.plugin.settings.theme));
      root.appendChild(this.renderHost);
      this.editor = createHeadlessEditor(); // off-screen, just keeps state
      return;
    }

    if (this.displayMode === 'split') {
      const left = root.createDiv({ cls: 'rmd-pane rmd-pane-source' });
      const right = root.createDiv({ cls: 'rmd-pane rmd-pane-preview' });
      this.editor = createSourceEditor(left, () => this.requestRender());
      this.renderHost = createRmdHost('', getThemeCss(this.plugin.settings.theme));
      right.appendChild(this.renderHost);
      return;
    }

    // Live mode: editor with widget decorations inline
    this.editor = createSourceEditor(
      root,
      () => this.requestRender(),
      [rmdLiveExtension(() => getThemeCss(this.plugin.settings.theme))]
    );
  }

  private requestRender() {
    if (this.renderTimer != null) window.clearTimeout(this.renderTimer);
    this.renderTimer = window.setTimeout(() => this.doRender(), this.plugin.settings.debounceMs);
  }

  private doRender() {
    this.renderTimer = null;
    if (!this.renderHost || this.displayMode === 'live') return;
    const source = this.getViewData();
    updateRmdHost(this.renderHost, source, getThemeCss(this.plugin.settings.theme));
  }
}

function createSourceEditor(parent: HTMLElement, onChange: () => void, extras = []) {
  const state = EditorState.create({
    doc: '',
    extensions: [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.updateListener.of(u => { if (u.docChanged) onChange(); }),
      ...extras
    ]
  });
  return new EditorView({ state, parent });
}

function createHeadlessEditor() {
  return new EditorView({
    state: EditorState.create({ doc: '' })
  });
}
```

### 9.4 `src/view-renderer.ts`

```ts
import { parse } from '@rmd/parser-core';
import { renderFragmentToString } from '@rmd/renderer-core';
import { hydrate } from '@rmd/runtime';

const HOST_TAG = 'rmd-render';

if (typeof customElements !== 'undefined' && !customElements.get(HOST_TAG)) {
  class RmdRenderEl extends HTMLElement {}
  customElements.define(HOST_TAG, RmdRenderEl);
}

export function createRmdHost(source: string, themeCss: string): HTMLElement {
  const host = document.createElement(HOST_TAG);
  host.classList.add('rmd-render-host');
  host.attachShadow({ mode: 'open' });
  updateRmdHost(host, source, themeCss);
  return host;
}

export function updateRmdHost(host: HTMLElement, source: string, themeCss: string) {
  const shadow = host.shadowRoot;
  if (!shadow) return;

  const ast = parse(source);
  const html = renderFragmentToString(ast);

  shadow.innerHTML = `
    <style>${themeCss}</style>
    <main class="rmd-document" data-rmd-theme="${ast.frontmatter.theme ?? 'default'}">
      ${html}
    </main>
  `;

  hydrate(shadow);
}
```

### 9.5 `src/live-preview.ts`

```ts
import { StateField, RangeSetBuilder, EditorState } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { createRmdHost, updateRmdHost } from './view-renderer';

class RmdBlockWidget extends WidgetType {
  constructor(readonly source: string, readonly themeCss: string) { super(); }

  toDOM() {
    return createRmdHost(this.source, this.themeCss);
  }

  eq(other: RmdBlockWidget) {
    return other.source === this.source && other.themeCss === this.themeCss;
  }

  estimatedHeight = 200;
}

export function rmdLiveExtension(getThemeCss: () => string) {
  return StateField.define<DecorationSet>({
    create(state) { return buildDecorations(state, getThemeCss()); },
    update(value, tr) {
      if (!tr.docChanged && !tr.selection) return value;
      return buildDecorations(tr.state, getThemeCss());
    },
    provide: f => EditorView.decorations.from(f)
  });
}

function buildDecorations(state: EditorState, themeCss: string): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = state.doc;
  const cursor = state.selection.main.head;

  // Scan for ::: blocks (very simple — production should use proper tokenizer)
  let lineStart = 0;
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    if (line.text.startsWith(':::') && /^:::[a-z]/.test(line.text)) {
      // Find matching ::: closer
      let endLine = -1;
      for (let j = i + 1; j <= doc.lines; j++) {
        if (doc.line(j).text.trim() === ':::') { endLine = j; break; }
      }
      if (endLine === -1) continue;

      const from = line.from;
      const to = doc.line(endLine).to;
      const cursorInside = cursor >= from && cursor <= to;
      if (cursorInside) {
        i = endLine; continue;  // Show source while editing
      }

      const source = doc.sliceString(from, to);
      builder.add(from, to, Decoration.replace({
        widget: new RmdBlockWidget(source, themeCss),
        block: true
      }));
      i = endLine;
    }
  }

  return builder.finish();
}
```

### 9.6 `src/post-processor.ts`

```ts
import { MarkdownPostProcessorContext } from 'obsidian';
import { createRmdHost } from './view-renderer';

export function createPostProcessor(getThemeCss: () => string) {
  return (el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
    // Find <pre><code class="language-rmd">...</code></pre> blocks
    el.querySelectorAll('pre > code.language-rmd').forEach(code => {
      const source = code.textContent ?? '';
      const host = createRmdHost(source, getThemeCss());
      code.parentElement?.replaceWith(host);
    });
  };
}
```

### 9.7 `src/settings.ts`

```ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import RichMarkdownPlugin from './main';
import type { ThemeChoice } from './theme-bridge';

export interface RmdSettings {
  theme: ThemeChoice;
  defaultMode: 'live' | 'split' | 'preview';
  debounceMs: number;
  enableInMarkdown: boolean;
}

export const DEFAULT_SETTINGS: RmdSettings = {
  theme: 'auto',
  defaultMode: 'live',
  debounceMs: 150,
  enableInMarkdown: true
};

export class RmdSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: RichMarkdownPlugin) { super(app, plugin); }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Rich Markdown' });

    new Setting(containerEl)
      .setName('Theme')
      .setDesc('Visual theme for rendered .rmd content.')
      .addDropdown(d => d
        .addOption('auto', 'Auto (follow Obsidian)')
        .addOption('default', 'Default')
        .addOption('tech-dark', 'Tech Dark')
        .addOption('paper', 'Paper')
        .addOption('notion-like', 'Notion-like')
        .setValue(this.plugin.settings.theme)
        .onChange(async v => {
          this.plugin.settings.theme = v as ThemeChoice;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Default view mode')
      .setDesc('How .rmd files open by default.')
      .addDropdown(d => d
        .addOption('live', 'Live (Typora-like)')
        .addOption('split', 'Split (source ↔ preview)')
        .addOption('preview', 'Preview only')
        .setValue(this.plugin.settings.defaultMode)
        .onChange(async v => {
          this.plugin.settings.defaultMode = v as any;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Re-render debounce (ms)')
      .setDesc('Wait this long after typing before re-rendering preview. Lower = snappier, higher = less CPU.')
      .addSlider(s => s
        .setLimits(50, 500, 50)
        .setValue(this.plugin.settings.debounceMs)
        .setDynamicTooltip()
        .onChange(async v => {
          this.plugin.settings.debounceMs = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable in regular .md files')
      .setDesc('When on, ```rmd code blocks in normal .md notes are rendered as Rich Markdown.')
      .addToggle(t => t
        .setValue(this.plugin.settings.enableInMarkdown)
        .onChange(async v => {
          this.plugin.settings.enableInMarkdown = v;
          await this.plugin.saveSettings();
        }));
  }
}
```

### 9.8 `styles.css`（外层 Obsidian UI 样式，渲染区是 Shadow DOM）

```css
.rmd-view {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.rmd-mode-live   { /* single editor with inline widgets */ }
.rmd-mode-split  { flex-direction: row; }
.rmd-mode-preview { /* preview-only */ }

.rmd-pane {
  flex: 1;
  min-width: 280px;
  overflow: auto;
}

.rmd-pane-source .cm-editor {
  height: 100%;
}

.rmd-pane-preview {
  border-left: 1px solid var(--background-modifier-border);
  padding: 0;
}

rmd-render {
  display: block;
  min-height: 60px;
}

/* In Live mode the widget decoration inserts a block element; ensure spacing */
.cm-line + rmd-render,
rmd-render + .cm-line {
  margin: 8px 0;
}
```

## 10. 测试与发布

### 10.1 自动化测试

```bash
# 在 packages/obsidian-plugin/ 内
npm run test
```

测试项：
- `view-renderer.test.ts`：Shadow host 创建、CSS 注入、hydrate 调用
- `post-processor.test.ts`：找到 `language-rmd` 代码块、正确替换
- `live-preview.test.ts`：scanFencedBlocks 边界（未闭合块、嵌套、光标在内部）
- `theme-bridge.test.ts`：auto 模式根据 body class 决定主题

### 10.2 手动验收清单（v0.1）

```
[环境]
[ ] 拷贝 main.js + manifest.json 到 vault/.obsidian/plugins/rich-markdown/
[ ] Obsidian 设置 → 社区插件 → 启用 Rich Markdown
[ ] Obsidian 控制台无报错

[.rmd 文件 — Live 模式]
[ ] 新建 note.rmd，自动以 Live 模式打开
[ ] 输入 :::chart bar\nA 1\nB 2\n::: 后块在原位渲染
[ ] 光标进入块内部 → 显示原文
[ ] 光标移出 → 重新变回渲染
[ ] 关闭再打开文件状态保持

[.rmd 文件 — Split 模式]
[ ] 命令面板 "Switch to Split mode"
[ ] 左侧编辑器、右侧预览区域
[ ] 输入文字 150ms 后右侧刷新
[ ] 改窗口大小左右等比缩放

[.rmd 文件 — Preview 模式]
[ ] "Switch to Preview mode" 隐藏编辑器
[ ] 不能直接编辑（防误操作）

[.md 文件 — :::rmd 代码块]
[ ] Reading 模式下 ```rmd 代码块渲染
[ ] Live Preview 模式下也渲染（CM6 widget）
[ ] Source 模式下显示原文

[主题切换]
[ ] 设置切换 default / tech-dark / paper / notion-like，所有视图刷新
[ ] auto 模式下切换 Obsidian 暗/亮主题，渲染主题随之变化

[导出]
[ ] 命令 "Export current .rmd as self-contained HTML" 在同目录产出 .html
[ ] 该 .html 在浏览器独立打开正常
[ ] 该 .html 拖入 Claude 桌面版 chat 渲染正常

[非破坏性]
[ ] 启用插件后 Obsidian 自身的 .md 文件渲染未受影响
[ ] Shadow DOM 内的 CSS 不污染 Obsidian UI（用 DevTools 看）
[ ] 卸载插件后无残留
```

### 10.3 发布到 Obsidian Community Plugins

1. 在 GitHub 仓库 release 上传 `main.js`、`manifest.json`、`styles.css`
2. fork [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
3. 在 `community-plugins.json` 加一条
4. 提 PR，按官方 review checklist 改

也可以先以 BRAT 插件方式让用户从 GitHub 直接安装测试，避免长 review 周期。

## 11. 风险与未决问题

### R1 — CM6 widget 在大文档下的性能

`scanFencedBlocks` 每次 `update` 全文扫一遍，对 50000 字以上文档可能卡。**应对**：
- v0.1 接受这个限制，文档规模 < 20000 字时无感
- v0.2 用 CM6 的 `tree-sitter` 增量解析做局部更新

### R2 — `:::` 在 .md 里的歧义

Obsidian 不识别 `:::` 围栏，所以纯写 `:::xxx` 会被当成普通段落。我们要求用户在 .md 里用 ` ```rmd ` 包起来。**这个约定要在 README 里说清楚**。也可以做一个"自动 `:::` 转 ```rmd"的命令辅助。

### R3 — Mobile 端 CM6 widget 表现不稳

iOS / Android 上的 Obsidian 用 CM6 但事件模型略不同。**应对**：
- v0.1 的 manifest 设 `isDesktopOnly: false`，但在 README 注明 "mobile experimental"
- 如果发现严重问题，发 v0.1.1 把移动端 Live 模式自动降级为 Split 模式

### R4 — Shadow DOM 内 KaTeX 加载

`@rmd/runtime` 里 KaTeX 是从 cdn.jsdelivr.net 懒加载的。Obsidian 默认不阻止网络但用户可能离线。**应对**：
- 设置里加"离线模式"开关，关闭时不加载 KaTeX，降级为代码块显示
- 长期方案：vendor KaTeX 进插件 bundle（但 KaTeX 体积 ~270KB，会让 main.js 翻倍）

### R5 — Obsidian 1.5+ 对 Plugin API 的 breaking change

Obsidian 持续演进 API。**应对**：
- 订阅 obsidian-releases 的 changelog
- CI 里加 minimum / latest 两个版本的 manifest 测试
- 用稳定的 API（避免用 `app.foundry.private.something` 这类内部 API）

### R6 — 与已有"markdown-it-container"类插件冲突

有些用户装了把 `:::` 当容器解析的插件。我们的 post-processor 可能撞车。**应对**：
- 优先使用 ```rmd 围栏路径，避开 `:::`
- 检测冲突插件并在设置里给警告

### R7 — 主仓库 monorepo 与插件单独发布的双轨

我们要往 obsidian-releases 仓库发布插件单独构建产物，但代码住在主 monorepo。**应对**：
- 写 GitHub Action：每次 push 主仓库 tag 自动构建 packages/obsidian-plugin 并把产物推到独立的 `obsidian-plugin-release` 仓库
- 该独立仓库的 release 才被 obsidian-releases 索引

## 12. 速查附录

### 12.1 文件命名

| 文件 | 用途 |
|---|---|
| `manifest.json` | 插件元信息 |
| `main.js` | 编译产物 |
| `styles.css` | 外层 Obsidian UI 样式 |
| `versions.json` | minAppVersion 兼容矩阵（多版本 Obsidian 时用） |

### 12.2 命令 ID 规范

`rmd-{category}-{action}`：

- `rmd-switch-mode-live`
- `rmd-switch-mode-split`
- `rmd-switch-mode-preview`
- `rmd-export-html`
- `rmd-insert-block-chart`
- `rmd-insert-block-callout`

### 12.3 参考资料

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [CodeMirror 6 系统介绍](https://codemirror.net/docs/guide/)
- [Sample plugin (Obsidian 官方)](https://github.com/obsidianmd/obsidian-sample-plugin)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Rich Markdown 整体架构
- [`CONTRACT.md`](./CONTRACT.md) — `.rmd` 块语法字典（写 skill 和 post-processor 时翻这本）
- [`DATA-MODEL.md`](./DATA-MODEL.md) — AST 字段定义（开发渲染相关代码时翻）

---

**最后**：这份文档不是一次性写完就锁住的，每完成一个 Phase 都回来更新对应章节，把猜测改成事实、把"待定"改成决议。Phase 5 验收完后这份文档应该能作为后续维护者的"权威参考"。
