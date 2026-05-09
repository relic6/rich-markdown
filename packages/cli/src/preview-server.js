import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { buildHtml } from "../../renderer/src/index.js";

export async function createPreviewServer(file, options = {}) {
  const filePath = resolve(file);
  const mode = options.mode ?? "self-contained";
  const theme = options.theme;
  const version = options.version;

  const server = createServer(async (request, response) => {
    try {
      if (request.url !== "/" && request.url !== "/index.html") {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      const source = await readFile(filePath, "utf8");
      const html = buildHtml(source, { mode, theme, version });
      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(html);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
  });

  return {
    server,
    async listen(port = 0, host = "127.0.0.1") {
      await new Promise((resolveListen, rejectListen) => {
        server.once("error", rejectListen);
        server.listen(port, host, () => {
          server.off("error", rejectListen);
          resolveListen();
        });
      });

      const address = server.address();
      return `http://${address.address}:${address.port}/`;
    },
    async close() {
      if (!server.listening) {
        return;
      }

      await new Promise((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose();
        });
      });
    }
  };
}
