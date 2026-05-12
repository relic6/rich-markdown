# 发布 Rich Markdown 到 Obsidian 社区插件市场

本指南详细说明了如何将 `rich-markdown` 插件提交并发布到 Obsidian 官方社区插件市场的流程。

## 1. 发布前准备

### 版本检查
确保 `packages/obsidian-plugin/package.json` 和 `packages/obsidian-plugin/manifest.json` 中的 `version` 字段一致且符合语义化版本规范 (SemVer)。

### 执行生产环境构建
在项目根目录下运行以下命令生成最终产物：
```bash
npm run obsidian:build
```
构建产物将保存在 `packages/obsidian-plugin/dist/` 目录中，包括：
- `main.js`
- `manifest.json`
- `styles.css`

## 2. GitHub Release (发布版本)

Obsidian 社区市场通过读取 GitHub 的 Release 资产来安装和更新插件。

1. 将代码提交并推送到 GitHub 远程仓库。
2. 在 GitHub 仓库页面点击 **Create a new release**。
3. 标签名 (Tag) 必须与 `manifest.json` 中的版本一致（例如 `v0.1.0`）。
4. **至关重要**：手动将 `dist/` 目录下的三个文件（`main.js`, `manifest.json`, `styles.css`）上传为该 Release 的附件。
   - **注意**：请直接上传这三个文件，**不要**压缩成 .zip 格式，也不要只包含源码。

## 3. 提交审核

Obsidian 官方维护了一个名为 `obsidian-releases` 的仓库用于管理社区插件。

1. Fork 官方仓库 [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)。
2. 在您的 Fork 仓库中编辑 `community-plugins.json` 文件。
3. 在列表末尾添加 `rich-markdown` 的条目（请确保按字母顺序排列或放在末尾）：
   ```json
   {
     "id": "rich-markdown",
     "name": "Rich Markdown",
     "author": "Rich Markdown Project",
     "description": "Render and edit Rich Markdown (.rmd) inside Obsidian with split preview, themes, and HTML export.",
     "repo": "rich-markdown/rich-markdown"
   }
   ```
4. 提交 Pull Request (PR) 到官方仓库。

## 4. 审核要点

官方团队在合并 PR 前会进行审核，重点检查：
- **插件 ID 唯一性**：必须是 `rich-markdown`。
- **功能描述**：准确且不含虚假宣传。
- **安全性**：不包含恶意代码，不私自收集用户信息。
- **移动端兼容性**：如果 `manifest.json` 中 `isDesktopOnly` 为 `false`（目前设置为 `false`），请确保在移动端测试通过。

## 5. 后续更新

以后发布新版本时，只需：
1. 更新代码和版本号。
2. 创建新的 GitHub Release 并上传新的 `dist` 三件套。
3. 官方会自动检测到新版本并推送给用户，无需再次提交 PR。
