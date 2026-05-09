export function validate(ast) {
  const errors = [];
  validateRoot(ast, errors);
  return { ok: errors.length === 0, errors };
}

function validateRoot(ast, errors) {
  if (!isObject(ast)) {
    add(errors, "", "AST must be an object");
    return;
  }

  if (ast.type !== "root") {
    add(errors, "/type", "root type must be \"root\"");
  }

  if (!isSemver(ast.version)) {
    add(errors, "/version", "version must be a semver string");
  }

  if (!isObject(ast.frontmatter)) {
    add(errors, "/frontmatter", "frontmatter must be an object");
  }

  if (!Array.isArray(ast.warnings)) {
    add(errors, "/warnings", "warnings must be an array");
  }

  if (!Array.isArray(ast.children)) {
    add(errors, "/children", "children must be an array");
    return;
  }

  const sliderNames = new Set();
  ast.children.forEach((node, index) => validateBlockNode(node, `/children/${index}`, errors, { sliderNames }));
}

function validateBlockNode(node, path, errors, context) {
  if (!isObject(node)) {
    add(errors, path, "node must be an object");
    return;
  }

  if (typeof node.type !== "string") {
    add(errors, `${path}/type`, "node type must be a string");
    return;
  }

  if (node.warnings !== undefined && !Array.isArray(node.warnings)) {
    add(errors, `${path}/warnings`, "warnings must be an array when present");
  }

  if (node.unknownAttrs !== undefined && !isStringRecord(node.unknownAttrs)) {
    add(errors, `${path}/unknownAttrs`, "unknownAttrs must be a string record when present");
  }

  switch (node.type) {
    case "heading":
      validateHeading(node, path, errors);
      break;
    case "paragraph":
      validateInlineChildren(node, path, errors);
      break;
    case "code-block":
      validateCodeBlock(node, path, errors);
      break;
    case "blockquote":
      validateBlockChildren(node, path, errors, context);
      break;
    case "list":
      validateList(node, path, errors, context);
      break;
    case "list-item":
      validateListItem(node, path, errors, context);
      break;
    case "thematic-break":
      break;
    case "html-block":
      requireString(node.value, `${path}/value`, errors);
      break;
    case "chart":
      validateChart(node, path, errors);
      break;
    case "grid":
      validateGrid(node, path, errors, context);
      break;
    case "callout":
      validateCallout(node, path, errors, context);
      break;
    case "slider":
      validateSlider(node, path, errors, context);
      break;
    case "export":
      validateExport(node, path, errors);
      break;
    case "flow":
      validateFlow(node, path, errors);
      break;
    case "diff":
      validateDiff(node, path, errors);
      break;
    case "tabs":
      validateTabs(node, path, errors, context);
      break;
    case "timeline":
      validateTimeline(node, path, errors, context);
      break;
    case "kanban":
      validateKanban(node, path, errors, context);
      break;
    case "details":
      validateDetails(node, path, errors, context);
      break;
    case "carousel":
      validateCarousel(node, path, errors, context);
      break;
    case "embed":
      validateEmbed(node, path, errors);
      break;
    case "math":
      validateMath(node, path, errors);
      break;
    default:
      add(errors, `${path}/type`, `unsupported block node type: ${node.type}`);
  }
}

function validateHeading(node, path, errors) {
  if (!Number.isInteger(node.level) || node.level < 1 || node.level > 6) {
    add(errors, `${path}/level`, "heading level must be an integer from 1 to 6");
  }
  validateInlineChildren(node, path, errors);
}

function validateInlineChildren(node, path, errors) {
  if (!Array.isArray(node.children)) {
    add(errors, `${path}/children`, "children must be an array");
    return;
  }

  node.children.forEach((child, index) => validateInlineNode(child, `${path}/children/${index}`, errors));
}

function validateInlineNode(node, path, errors) {
  if (!isObject(node)) {
    add(errors, path, "inline node must be an object");
    return;
  }

  switch (node.type) {
    case "text":
      requireString(node.value, `${path}/value`, errors);
      break;
    case "strong":
    case "emph":
      validateInlineChildren(node, path, errors);
      break;
    case "inline-code":
      requireString(node.value, `${path}/value`, errors);
      break;
    case "link":
      requireString(node.url, `${path}/url`, errors);
      validateInlineChildren(node, path, errors);
      break;
    case "image":
      requireString(node.url, `${path}/url`, errors);
      requireString(node.alt, `${path}/alt`, errors);
      break;
    case "soft-break":
    case "hard-break":
      break;
    case "inline-html":
      requireString(node.value, `${path}/value`, errors);
      break;
    default:
      add(errors, `${path}/type`, `unsupported inline node type: ${node.type}`);
  }
}

function validateCodeBlock(node, path, errors) {
  if (node.lang !== null && typeof node.lang !== "string") {
    add(errors, `${path}/lang`, "code-block lang must be string or null");
  }
  requireString(node.value, `${path}/value`, errors);
}

function validateList(node, path, errors, context) {
  if (typeof node.ordered !== "boolean") {
    add(errors, `${path}/ordered`, "list ordered must be a boolean");
  }
  if (node.start !== null && (!Number.isInteger(node.start) || node.start < 1)) {
    add(errors, `${path}/start`, "list start must be a positive integer or null");
  }
  if (typeof node.tight !== "boolean") {
    add(errors, `${path}/tight`, "list tight must be a boolean");
  }
  if (!Array.isArray(node.children)) {
    add(errors, `${path}/children`, "list children must be an array");
    return;
  }
  node.children.forEach((child, index) => validateListItem(child, `${path}/children/${index}`, errors, context));
}

function validateListItem(node, path, errors, context) {
  if (node.type !== "list-item") {
    add(errors, `${path}/type`, "list children must be list-item nodes");
  }
  if (node.checked !== null && typeof node.checked !== "boolean") {
    add(errors, `${path}/checked`, "list item checked must be boolean or null");
  }
  validateBlockChildren(node, path, errors, context);
}

function validateChart(node, path, errors) {
  if (!["bar", "line", "pie", "scatter", "radar", "area", "donut", "heatmap"].includes(node.chartType)) {
    add(errors, `${path}/chartType`, "chartType must be a valid type");
  }
  if (node.title !== null && typeof node.title !== "string") {
    add(errors, `${path}/title`, "title must be string or null");
  }
  if (!["primary", "secondary", "none"].includes(node.emphasis)) {
    add(errors, `${path}/emphasis`, "emphasis must be primary, secondary, or none");
  }
  if (!Array.isArray(node.data) || node.data.length === 0) {
    add(errors, `${path}/data`, "chart data must contain at least one point");
    return;
  }

  const seriesLength = Array.isArray(node.data[0]?.values) ? node.data[0].values.length : null;
  node.data.forEach((point, index) => {
    requireString(point?.label, `${path}/data/${index}/label`, errors);
    if (!Array.isArray(point?.values) || point.values.length === 0 || point.values.some((value) => typeof value !== "number" || Number.isNaN(value))) {
      add(errors, `${path}/data/${index}/values`, "chart values must be a non-empty number array");
      return;
    }

    if (point.values.length !== seriesLength) {
      add(errors, `${path}/data/${index}/values`, "all chart series must have the same length");
    }
  });

  if (node.chartType === "pie" && seriesLength !== 1) {
    add(errors, `${path}/data`, "pie charts must have exactly one series");
  }
}

function validateGrid(node, path, errors, context) {
  if (Array.isArray(node.columns)) {
    if (node.columns.some(c => !Number.isInteger(c) || c < 1 || c > 12)) {
      add(errors, `${path}/columns`, "grid columns array must contain integers from 1 to 12");
    }
  } else if (!Number.isInteger(node.columns) || node.columns < 1 || node.columns > 12) {
    add(errors, `${path}/columns`, "grid columns must be an integer from 1 to 12");
  }
  if (!["sm", "md", "lg"].includes(node.gap)) {
    add(errors, `${path}/gap`, "grid gap must be sm, md, or lg");
  }
  if (!Array.isArray(node.cells) || node.cells.length > 12) {
    add(errors, `${path}/cells`, "grid cells must be an array with at most 12 entries");
    return;
  }

  node.cells.forEach((cell, cellIndex) => {
    if (!Array.isArray(cell)) {
      add(errors, `${path}/cells/${cellIndex}`, "grid cell must be an array");
      return;
    }

    cell.forEach((child, childIndex) => {
      if (child?.type === "grid") {
        add(errors, `${path}/cells/${cellIndex}/${childIndex}`, "grid cannot contain nested grid nodes in v0.1");
      }
      validateBlockNode(child, `${path}/cells/${cellIndex}/${childIndex}`, errors, context);
    });
  });
}

function validateCallout(node, path, errors, context) {
  if (!["info", "tip", "warning", "danger", "success"].includes(node.kind)) {
    add(errors, `${path}/kind`, "callout kind is invalid");
  }
  if (node.title !== null && typeof node.title !== "string") {
    add(errors, `${path}/title`, "title must be string or null");
  }
  validateBlockChildren(node, path, errors, context);
}

function validateSlider(node, path, errors, context) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(node.name ?? "")) {
    add(errors, `${path}/name`, "slider name must be a valid identifier");
  } else if (!node.duplicate && context.sliderNames.has(node.name)) {
    add(errors, `${path}/name`, "slider name must be unique");
  } else if (!node.duplicate) {
    context.sliderNames.add(node.name);
  }

  requireNumber(node.min, `${path}/min`, errors);
  requireNumber(node.max, `${path}/max`, errors);
  requireNumber(node.step, `${path}/step`, errors);
  requireNumber(node.default, `${path}/default`, errors);

  if (typeof node.min === "number" && typeof node.max === "number" && node.max <= node.min) {
    add(errors, `${path}/max`, "slider max must be greater than min");
  }
  if (typeof node.step === "number" && node.step <= 0) {
    add(errors, `${path}/step`, "slider step must be greater than 0");
  }
  if (Array.isArray(node.default)) {
    if (node.default.some(v => typeof v !== "number" || typeof node.min !== "number" || typeof node.max !== "number" || v < node.min || v > node.max)) {
      add(errors, `${path}/default`, "slider default values must be within min and max");
    }
  } else if (typeof node.default === "number" && typeof node.min === "number" && typeof node.max === "number" && (node.default < node.min || node.default > node.max)) {
    add(errors, `${path}/default`, "slider default must be within min and max");
  }

  requireString(node.unit, `${path}/unit`, errors);
  requireString(node.label, `${path}/label`, errors);
}

function validateExport(node, path, errors) {
  requireString(node.label, `${path}/label`, errors);
  if (!["text", "markdown", "json"].includes(node.format)) {
    add(errors, `${path}/format`, "export format must be text, markdown, or json");
  }
  requireString(node.template, `${path}/template`, errors);
  if (!Array.isArray(node.references) || node.references.some((name) => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name))) {
    add(errors, `${path}/references`, "references must be identifier strings");
  }
}

function validateFlow(node, path, errors) {
  if (!["lr", "tb"].includes(node.direction)) {
    add(errors, `${path}/direction`, "flow direction must be lr or tb");
  }
  if (!Array.isArray(node.nodes)) {
    add(errors, `${path}/nodes`, "flow nodes must be an array");
    return;
  }
  if (!Array.isArray(node.edges) || node.edges.length === 0) {
    add(errors, `${path}/edges`, "flow edges must be a non-empty array");
    return;
  }

  const nodeIds = new Set();
  node.nodes.forEach((nodeRef, index) => {
    requireString(nodeRef?.id, `${path}/nodes/${index}/id`, errors);
    if (typeof nodeRef?.id === "string") {
      nodeIds.add(nodeRef.id);
    }
  });

  node.edges.forEach((edge, index) => {
    requireString(edge?.from, `${path}/edges/${index}/from`, errors);
    requireString(edge?.to, `${path}/edges/${index}/to`, errors);
    if (typeof edge?.from === "string" && !nodeIds.has(edge.from)) {
      add(errors, `${path}/edges/${index}/from`, "edge from must reference a declared node");
    }
    if (typeof edge?.to === "string" && !nodeIds.has(edge.to)) {
      add(errors, `${path}/edges/${index}/to`, "edge to must reference a declared node");
    }
  });
}

function validateDiff(node, path, errors) {
  if (node.lang !== null && typeof node.lang !== "string") {
    add(errors, `${path}/lang`, "diff lang must be string or null");
  }
  if (node.title !== null && typeof node.title !== "string") {
    add(errors, `${path}/title`, "diff title must be string or null");
  }
  if (!Array.isArray(node.lines)) {
    add(errors, `${path}/lines`, "diff lines must be an array");
    return;
  }

  node.lines.forEach((line, index) => {
    if (!["add", "remove", "context"].includes(line?.kind)) {
      add(errors, `${path}/lines/${index}/kind`, "diff line kind is invalid");
    }
    requireString(line?.text, `${path}/lines/${index}/text`, errors);
    if (line?.note !== null && typeof line?.note !== "string") {
      add(errors, `${path}/lines/${index}/note`, "diff line note must be string or null");
    }
  });
}

function validateTabs(node, path, errors, context) {
  if (!Array.isArray(node.panels) || node.panels.length === 0) {
    add(errors, `${path}/panels`, "tabs panels must contain at least one panel");
    return;
  }

  const labels = new Set();
  node.panels.forEach((panel, index) => {
    requireString(panel?.label, `${path}/panels/${index}/label`, errors);
    if (typeof panel?.label === "string") {
      if (labels.has(panel.label)) {
        add(errors, `${path}/panels/${index}/label`, "tabs panel labels must be unique");
      }
      labels.add(panel.label);
    }
    if (!Array.isArray(panel?.children)) {
      add(errors, `${path}/panels/${index}/children`, "tabs panel children must be an array");
      return;
    }
    panel.children.forEach((child, childIndex) => {
      if (child?.type === "tabs") {
        add(errors, `${path}/panels/${index}/children/${childIndex}`, "tabs cannot contain nested tabs in v0.1");
      }
      validateBlockNode(child, `${path}/panels/${index}/children/${childIndex}`, errors, context);
    });
  });

  if (!labels.has(node.default)) {
    add(errors, `${path}/default`, "tabs default must match a panel label");
  }
}

function validateBlockChildren(node, path, errors, context) {
  if (!Array.isArray(node.children)) {
    add(errors, `${path}/children`, "children must be an array");
    return;
  }
  node.children.forEach((child, index) => validateBlockNode(child, `${path}/children/${index}`, errors, context));
}

function validateTimeline(node, path, errors, context) {
  if (!["horizontal", "vertical"].includes(node.direction)) {
    add(errors, `${path}/direction`, "timeline direction must be horizontal or vertical");
  }
  if (!Array.isArray(node.items)) {
    add(errors, `${path}/items`, "timeline items must be an array");
    return;
  }
  node.items.forEach((item, index) => {
    requireString(item?.time, `${path}/items/${index}/time`, errors);
    if (item.title !== null && typeof item.title !== "string") {
      add(errors, `${path}/items/${index}/title`, "title must be string or null");
    }
    if (!["default", "success", "warning", "danger", "pending"].includes(item.status)) {
      add(errors, `${path}/items/${index}/status`, "status must be a valid enum");
    }
    if (!Array.isArray(item.children)) {
      add(errors, `${path}/items/${index}/children`, "children must be an array");
    } else {
      item.children.forEach((child, childIndex) => validateBlockNode(child, `${path}/items/${index}/children/${childIndex}`, errors, context));
    }
  });
}

function validateKanban(node, path, errors, context) {
  if (!Array.isArray(node.columns)) {
    add(errors, `${path}/columns`, "kanban columns must be an array");
    return;
  }
  node.columns.forEach((col, index) => {
    requireString(col?.title, `${path}/columns/${index}/title`, errors);
    if (!Array.isArray(col.children)) {
      add(errors, `${path}/columns/${index}/children`, "children must be an array");
    } else {
      col.children.forEach((child, childIndex) => validateBlockNode(child, `${path}/columns/${index}/children/${childIndex}`, errors, context));
    }
  });
}

function validateDetails(node, path, errors, context) {
  requireString(node.title, `${path}/title`, errors);
  if (typeof node.open !== "boolean") {
    add(errors, `${path}/open`, "open must be a boolean");
  }
  validateBlockChildren(node, path, errors, context);
}

function validateCarousel(node, path, errors, context) {
  if (typeof node.autoplay !== "boolean") {
    add(errors, `${path}/autoplay`, "autoplay must be a boolean");
  }
  requireNumber(node.interval, `${path}/interval`, errors);
  if (!Array.isArray(node.items)) {
    add(errors, `${path}/items`, "items must be an array");
    return;
  }
  node.items.forEach((item, index) => {
    if (!Array.isArray(item)) {
      add(errors, `${path}/items/${index}`, "carousel item must be an array");
    } else {
      item.forEach((child, childIndex) => validateBlockNode(child, `${path}/items/${index}/${childIndex}`, errors, context));
    }
  });
}

function validateEmbed(node, path, errors) {
  requireString(node.embedType, `${path}/embedType`, errors);
  requireString(node.embedId, `${path}/embedId`, errors);
  if (node.aspectRatio !== null && typeof node.aspectRatio !== "string") {
    add(errors, `${path}/aspectRatio`, "aspectRatio must be string or null");
  }
}

function validateMath(node, path, errors) {
  requireString(node.value, `${path}/value`, errors);
}

function add(errors, path, message) {
  errors.push({ path, message });
}

function requireString(value, path, errors) {
  if (typeof value !== "string") {
    add(errors, path, "must be a string");
  }
}

function requireNumber(value, path, errors) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    add(errors, path, "must be a number");
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringRecord(value) {
  return isObject(value) && Object.values(value).every((item) => typeof item === "string");
}

function isSemver(value) {
  return typeof value === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}
