# ADR 0001：使用 markdown-it 作为 CommonMark parser，并用 esbuild 生成浏览器 bundle

## 状态

Accepted

## 背景

RMD 的 P1 要求任何合法 CommonMark 文档都必须是合法 `.rmd` 文档。手写轻量 Markdown parser 可以让早期 bundle 很小，但很容易在列表、引用、转义、HTML、软换行等 CommonMark 边界上持续偏离规范。RMD 还需要在 Node CLI、浏览器 split/CDN 模式和 Codex skill 生成内容之间保持同一套解析语义。

## 决策

v0.1 采用 `markdown-it` 的 `commonmark` preset 解析标准 Markdown，并在进入 CommonMark parser 之前预扫描顶层 RMD `:::` 围栏块。浏览器端通过 `esbuild` 从 `packages/renderer/src/browser-global.js` 打包出 `rmd.min.js`，让 split/CDN 模式拥有与 Node 侧一致的 `RMD.parse()` 能力。

## 影响

- Node 与浏览器共享同一 parser 语义，降低 Codex/AI 生成内容在不同运行环境里表现不一致的风险。
- `rmd.min.js` 当前包含完整 parser，raw 体积约 170KB，不能再按旧的 `<25KB` 轻量 parser 预算衡量。
- 核心 runtime 体积预算仍然保留；完整 parser bundle 单独记录与优化。
- `packages/renderer/src/browser-standalone.js` 这种手写轻量 parser 入口被移除，避免与真实构建产物漂移。

## 备选方案

- 手写 CommonMark 子集：体积最小，但直接违反 P1 的长期方向，且边界测试维护成本高。
- `marked`：API 简单，体积相对可控，但扩展与 CommonMark 兼容信心弱于 `markdown-it`。
- `unified/remark`：生态与 AST 能力强，但依赖链和浏览器体积更大，v0.1 过重。

## 验证

- `test/parser.test.js` 覆盖 CommonMark inline 与 block 结构。
- `test/dist-bundle.test.js` 每次临时构建浏览器 bundle，并在 VM 中验证 `RMD.parse()` 可解析 blockquote/list。
- `spec/conformance` 继续覆盖 RMD 核心块与 fallback。

## 后续

- 引入官方 CommonMark spec 用例前，不宣称 600+ 用例 100% 通过。
- 增加 bundle size 报告，分别记录核心 runtime 与完整 parser bundle。
- 若浏览器体积成为真实集成阻塞，再评估 parser 懒加载、双 bundle 或替换 parser。
