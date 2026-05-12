import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// 文件路径
const packageJsonPath = resolve(rootDir, "package.json");
const indexPath = resolve(rootDir, "packages/cli/src/index.js");

function main() {
  try {
    // 1. 读取并更新 package.json
    console.log("正在读取 package.json...");
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const oldVersion = pkg.version;
    const versionParts = oldVersion.split(".");
    
    // 递增最后一位
    versionParts[versionParts.length - 1] = parseInt(versionParts[versionParts.length - 1], 10) + 1;
    const newVersion = versionParts.join(".");
    
    pkg.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`package.json 版本号已从 ${oldVersion} 更新为 ${newVersion}`);

    // 2. 更新 packages/cli/src/index.js
    console.log("正在同步 index.js 中的版本号...");
    let indexContent = readFileSync(indexPath, "utf8");
    
    // 替换 USAGE 中的版本号 (例如: v0.1.2)
    // 匹配 "CLI vX.Y.Z" 或 "rmd vX.Y.Z"
    const newIndexContent = indexContent.replace(/v\d+\.\d+\.\d+/g, `v${newVersion}`);
    
    if (indexContent === newIndexContent) {
      console.warn("警告: 未在 index.js 中找到可替换的版本号字符串，请检查格式是否匹配 'vX.Y.Z'");
    } else {
      writeFileSync(indexPath, newIndexContent);
      console.log(`index.js 中的版本号已同步为 v${newVersion}`);
    }

    // 3. 执行构建操作
    console.log("正在执行构建 (build:dist, build:skills)...");
    execSync("npm run build:dist", { stdio: "inherit", cwd: rootDir });
    execSync("npm run build:skills", { stdio: "inherit", cwd: rootDir });
    console.log("构建完成！");

    // 4. 执行 npm publish
    const isDryRun = process.argv.includes("--dry-run");
    if (isDryRun) {
      console.log("[Dry Run] 跳过 npm publish");
    } else {
      console.log("正在执行 npm publish...");
      execSync("npm publish", { stdio: "inherit", cwd: rootDir });
    }
    
    console.log(isDryRun ? "模拟发布完成！" : "发布成功！");
  } catch (error) {
    console.error("发布失败:", error.message);
    process.exit(1);
  }
}

main();
