import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const requested = normalize(pathname === "/" ? "index.html" : pathname.replace(/^[/\\]+/, ""));
    let file = join(root, requested);
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
    response.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, follow"
    });
    response.end(await readFile(join(root, "404.html")));
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("Preview: http://127.0.0.1:4173/");
});
