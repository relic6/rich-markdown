const SCHEME_OR_PROTOCOL_RELATIVE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function resolveObsidianResourceUrl(vault, sourcePath, rawUrl) {
  const vaultPath = toVaultResourcePath(sourcePath, rawUrl);
  if (!vaultPath || typeof vault?.getAbstractFileByPath !== "function" || typeof vault?.getResourcePath !== "function") {
    return null;
  }

  const file = vault.getAbstractFileByPath(vaultPath);
  if (!file) {
    return null;
  }

  return `${vault.getResourcePath(file)}${splitUrlReference(rawUrl).suffix}`;
}

export function toVaultResourcePath(sourcePath, rawUrl) {
  const { path } = splitUrlReference(rawUrl);
  const trimmedPath = path.trim();
  if (!sourcePath || !isResolvableResourceUrl(trimmedPath)) {
    return null;
  }

  const decodedPath = decodePathReference(trimmedPath);
  const vaultRelativePath = decodedPath.startsWith("/")
    ? decodedPath.slice(1)
    : `${dirname(sourcePath)}/${decodedPath}`;

  return normalizeVaultPath(vaultRelativePath);
}

export function isResolvableResourceUrl(url) {
  const value = String(url ?? "").trim();
  return value !== ""
    && !value.startsWith("#")
    && !SCHEME_OR_PROTOCOL_RELATIVE.test(value);
}

export function splitUrlReference(rawUrl) {
  const value = String(rawUrl ?? "");
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  const splitIndex = indexes.length ? Math.min(...indexes) : -1;

  if (splitIndex === -1) {
    return { path: value, suffix: "" };
  }

  return {
    path: value.slice(0, splitIndex),
    suffix: value.slice(splitIndex)
  };
}

function decodePathReference(path) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function dirname(path) {
  const normalized = String(path).replaceAll("\\", "/");
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

function normalizeVaultPath(path) {
  const parts = [];

  for (const part of String(path).replaceAll("\\", "/").split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }

  return parts.join("/");
}
