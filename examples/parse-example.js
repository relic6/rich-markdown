import { readFileSync } from "node:fs";
import { parse } from "../packages/parser-core/src/index.js";

const source = readFileSync(new URL("./rate-limit-decision.rmd", import.meta.url), "utf8");
const ast = parse(source);

console.log(JSON.stringify(ast, null, 2));
