import fs from "fs";
import { parse } from "./packages/parser-core/src/index.js";

const cases = ["core-blocks", "fallbacks", "advanced-blocks"];

for (const name of cases) {
  const dir = `spec/conformance/cases/${name}`;
  const input = fs.readFileSync(`${dir}/input.rmd`, "utf8");
  const ast = parse(input);
  fs.writeFileSync(`${dir}/expected.json`, JSON.stringify(ast, null, 2));
  console.log(`Updated ${name}`);
}
