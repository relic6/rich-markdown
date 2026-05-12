# Rich Markdown 文档体系

本目录是 `.rmd`（Rich Markdown）项目的官方文档集合。所有文档按"奠基 → 设计 → 开发 → 运营"四个阶段组织，便于不同时期、不同角色的读者按需查阅。

## 文档路线图

| 阶段 | 文档 | 篇幅 | 何时写 | 为谁写 |
|---|---|---|---|---|
| **奠基** | [1. VISION 愿景书](./VISION.md) | 1-2 页 | 写代码前 | 所有人 |
|        | [2. PRINCIPLES 设计原则](./PRINCIPLES.md) | 2-3 页 | 写代码前 | 核心团队 |
|        | [3. QUICKSTART 接入示例](./QUICKSTART.md) | 2-3 页 | 写代码前 | 自己（试金石）|
| **设计** | [4. ARCHITECTURE 架构概览](./ARCHITECTURE.md) | 4-6 页 | 设计阶段 | 核心开发者 |
|        | [5. CONTRACT 接入契约规范](./CONTRACT.md) | 5-8 页 | 设计阶段 | 接入方 |
|        | [6. DATA-MODEL 数据资产规范](./DATA-MODEL.md) | 3-5 页 | 设计阶段 | 核心开发者 |
|        | [7. FLOWS 关键流程设计](./FLOWS.md) | 4-6 页 | 设计阶段 | 核心开发者 |
| **开发** | [8. GETTING-STARTED 入门教程](./GETTING-STARTED.md) | 5-10 页 | 伴随开发 | 新使用者 |
|        | [9. API-REFERENCE](./API-REFERENCE.md) | 10-20 页 | 自动生成 | 日常开发者 |
|        | [10. BEST-PRACTICES](./BEST-PRACTICES.md) | 持续增长 | 伴随开发 | 进阶使用者 |
| **运营** | [11. CONTRIBUTING](./CONTRIBUTING.md) | 1-2 页 | 开源前 | 贡献者 |
|        | [12. ROADMAP](./ROADMAP.md) | 1-2 页 | 开源前 | 用户 |
|        | [13. ADRs 决策记录](./adr/) | 每条 1 页 | 持续 | 未来开发者 |
|        | [14. PROGRESS 工程进度](./PROGRESS.md) | 1-2 页 | 持续维护 | 当前与新进开发者 |

## 阅读建议

- **第一次了解项目**：读 `VISION.md` → `QUICKSTART.md`
- **想理解设计取舍**：读 `PRINCIPLES.md` → `ARCHITECTURE.md` → `adr/`
- **想接入或开发渲染器**：读 `CONTRACT.md` → `DATA-MODEL.md` → `API-REFERENCE.md`
- **想贡献代码 / 接手开发**：读 `PROGRESS.md` → `CONTRIBUTING.md` → `ROADMAP.md`
- **想快速了解当前完成度**：直接打开 `PROGRESS.md`

## 文档约定

- 所有文档使用标准 Markdown 编写，不使用 `.rmd` 扩展（避免循环依赖：项目本身要先于其格式存在）。
- 每篇文档顶部给出"读者画像 / 阅读时长 / 最近更新"三项元信息。
- ADR（架构决策记录）按时间顺序编号，命名为 `NNNN-title.md`，存放在 `adr/` 子目录。
