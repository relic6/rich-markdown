import { createRoot, codeBlock } from "../../ast/src/index.js";
import { parseCoreBlock } from "../../blocks-core/src/index.js";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt("commonmark", {
  html: true,
  linkify: false,
  typographer: false
});

export function parse(source) {
  const normalized = normalizeNewlines(source);
  const { frontmatter, body, warnings } = parseFrontmatter(normalized);

  return createRoot({
    frontmatter,
    warnings,
    children: parseBlocks(body, { sliderNames: new Set() })
  });
}

function parseBlocks(source, context) {
  const lines = normalizeNewlines(source).split("\n");
  const nodes = [];
  let markdownLines = [];
  let markdownFence = null;

  const flushMarkdown = () => {
    if (markdownLines.length === 0) {
      return;
    }

    nodes.push(...parseMarkdown(markdownLines.join("\n")));
    markdownLines = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = matchMarkdownFence(line);

    if (markdownFence) {
      markdownLines.push(line);
      if (fence && fence.marker === markdownFence.marker && fence.length >= markdownFence.length) {
        markdownFence = null;
      }
      continue;
    }

    if (fence) {
      markdownFence = fence;
      markdownLines.push(line);
      continue;
    }

    const blockStart = line.match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i);
    if (blockStart) {
      flushMarkdown();
      const block = collectBlock(lines, index, blockStart);
      index = block.endIndex;

      const node = parseCoreBlock(block, (childSource) => parseBlocks(childSource, context));
      registerSliderName(node, context);
      nodes.push(node);
      continue;
    }

    markdownLines.push(line);
  }

  flushMarkdown();
  return nodes;
}

function parseMarkdown(source) {
  const tokens = markdown.parse(source, {});
  return parseBlockTokens(tokens).nodes;
}

function parseBlockTokens(tokens, start = 0, stopType = null) {
  const nodes = [];
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index];
    if (stopType && token.type === stopType) {
      return { nodes, index: index + 1 };
    }

    switch (token.type) {
      case "heading_open": {
        const inline = tokens[index + 1];
        nodes.push({
          type: "heading",
          level: Number(token.tag.slice(1)),
          children: inline?.type === "inline" ? parseInlineTokens(inline.children ?? []) : []
        });
        index += 3;
        break;
      }
      case "paragraph_open": {
        const inline = tokens[index + 1];
        nodes.push({
          type: "paragraph",
          children: inline?.type === "inline" ? parseInlineTokens(inline.children ?? []) : []
        });
        index += 3;
        break;
      }
      case "fence":
        nodes.push(codeBlock(token.content.replace(/\n$/, ""), {
          lang: token.info ? token.info.trim().split(/\s+/)[0] : null,
          raw: `${token.markup}${token.info ? token.info : ""}\n${token.content}${token.markup}`
        }));
        index += 1;
        break;
      case "code_block":
        nodes.push(codeBlock(token.content.replace(/\n$/, ""), {
          lang: null,
          raw: token.content
        }));
        index += 1;
        break;
      case "blockquote_open": {
        const result = parseBlockTokens(tokens, index + 1, "blockquote_close");
        nodes.push({ type: "blockquote", children: result.nodes });
        index = result.index;
        break;
      }
      case "bullet_list_open":
      case "ordered_list_open": {
        const ordered = token.type === "ordered_list_open";
        const result = parseListItems(tokens, index + 1, ordered ? "ordered_list_close" : "bullet_list_close");
        nodes.push({
          type: "list",
          ordered,
          start: ordered ? Number(token.attrGet("start") ?? 1) : null,
          tight: false,
          children: result.items
        });
        index = result.index;
        break;
      }
      case "hr":
        nodes.push({ type: "thematic-break" });
        index += 1;
        break;
      case "html_block":
        nodes.push({ type: "html-block", value: token.content });
        index += 1;
        break;
      case "inline":
        nodes.push({ type: "paragraph", children: parseInlineTokens(token.children ?? []) });
        index += 1;
        break;
      default:
        index += 1;
        break;
    }
  }

  return { nodes, index };
}

function parseListItems(tokens, start, stopType) {
  const items = [];
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index];
    if (token.type === stopType) {
      return { items, index: index + 1 };
    }

    if (token.type === "list_item_open") {
      const result = parseBlockTokens(tokens, index + 1, "list_item_close");
      items.push({
        type: "list-item",
        checked: null,
        children: result.nodes
      });
      index = result.index;
      continue;
    }

    index += 1;
  }

  return { items, index };
}

function parseInlineTokens(tokens, start = 0, stopType = null) {
  const nodes = [];
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index];
    if (stopType && token.type === stopType) {
      return { nodes, index: index + 1 };
    }

    switch (token.type) {
      case "text":
        nodes.push({ type: "text", value: token.content });
        index += 1;
        break;
      case "code_inline":
        nodes.push({ type: "inline-code", value: token.content });
        index += 1;
        break;
      case "strong_open": {
        const result = parseInlineTokens(tokens, index + 1, "strong_close");
        nodes.push({ type: "strong", children: result.nodes });
        index = result.index;
        break;
      }
      case "em_open": {
        const result = parseInlineTokens(tokens, index + 1, "em_close");
        nodes.push({ type: "emph", children: result.nodes });
        index = result.index;
        break;
      }
      case "link_open": {
        const result = parseInlineTokens(tokens, index + 1, "link_close");
        nodes.push({
          type: "link",
          url: token.attrGet("href") ?? "",
          title: token.attrGet("title") ?? null,
          children: result.nodes
        });
        index = result.index;
        break;
      }
      case "image":
        nodes.push({
          type: "image",
          url: token.attrGet("src") ?? "",
          title: token.attrGet("title") ?? null,
          alt: token.content ?? ""
        });
        index += 1;
        break;
      case "softbreak":
        nodes.push({ type: "soft-break" });
        index += 1;
        break;
      case "hardbreak":
        nodes.push({ type: "hard-break" });
        index += 1;
        break;
      case "html_inline":
        nodes.push({ type: "inline-html", value: token.content });
        index += 1;
        break;
      default:
        index += 1;
        break;
    }
  }

  return stopType ? { nodes, index } : nodes;
}

function collectBlock(lines, startIndex, blockStart) {
  const name = blockStart[1];
  const attrText = blockStart[2] ?? "";
  const contentLines = [];
  let endIndex = lines.length - 1;
  let closed = false;
  let markdownFence = null;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const fence = matchMarkdownFence(lines[index]);

    if (markdownFence) {
      contentLines.push(lines[index]);
      if (fence && fence.marker === markdownFence.marker && fence.length >= markdownFence.length) {
        markdownFence = null;
      }
      continue;
    }

    if (fence) {
      markdownFence = fence;
      contentLines.push(lines[index]);
      continue;
    }

    if (/^:::\s*$/.test(lines[index])) {
      endIndex = index;
      closed = true;
      break;
    }

    contentLines.push(lines[index]);
  }

  const rawLines = lines.slice(startIndex, closed ? endIndex + 1 : endIndex + 1);
  const block = {
    name,
    attrText,
    content: contentLines.join("\n"),
    raw: rawLines.join("\n"),
    warnings: closed ? [] : ["unclosed"],
    startIndex,
    endIndex
  };

  if (!closed) {
    block.raw = lines.slice(startIndex).join("\n");
  }

  return block;
}

function matchMarkdownFence(line) {
  const match = line.match(/^\s*(`{3,}|~{3,})/);
  if (!match) {
    return null;
  }

  return {
    marker: match[1][0],
    length: match[1].length
  };
}

function registerSliderName(node, context) {
  if (node.type !== "slider") {
    return;
  }

  if (context.sliderNames.has(node.name)) {
    node.warnings = [...(node.warnings ?? []), "slider-duplicate-name"];
    node.duplicate = true;
    return;
  }

  context.sliderNames.add(node.name);
}

function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return { frontmatter: {}, body: source, warnings: [] };
  }

  const end = source.indexOf("\n---\n", 4);
  if (end === -1) {
    return {
      frontmatter: {},
      body: source,
      warnings: ["frontmatter-unclosed"]
    };
  }

  const raw = source.slice(4, end);
  const body = source.slice(end + "\n---\n".length);

  try {
    return {
      frontmatter: parseSimpleYaml(raw),
      body,
      warnings: []
    };
  } catch (error) {
    return {
      frontmatter: {},
      body,
      warnings: [`frontmatter-parse-failed: ${error.message}`]
    };
  }
}

function parseSimpleYaml(raw) {
  const result = {};

  for (const line of raw.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      throw new Error(`invalid line: ${line}`);
    }

    const key = match[1];
    const value = stripYamlQuotes(match[2].trim());
    result[key] = value;
  }

  return result;
}

function stripYamlQuotes(value) {
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeNewlines(value) {
  return String(value).replace(/\r\n?/g, "\n");
}
