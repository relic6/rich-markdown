import { buildHtml, createRenderer, hydrate, parse, render, renderFragmentToString, renderToString } from "./index.js";

const RMD = {
  buildHtml,
  createRenderer,
  hydrate,
  parse,
  render,
  renderFragmentToString,
  renderToString
};

globalThis.RMD = RMD;

export default RMD;
