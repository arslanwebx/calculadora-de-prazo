import { execFileSync } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicDirectory = resolve(root, "public");
const productionOrigin = "https://calculadoradeprazo.pro";

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".html") ? [absolute] : [];
  }));
  return nested.flat();
}

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function repositoryPath(file) {
  return relative(root, file).split(sep).join("/");
}

async function lastModified(file) {
  try {
    const path = repositoryPath(file);
    const dirty = execFileSync("git", ["status", "--porcelain", "--", path], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (dirty) return new Date().toISOString().slice(0, 10);
    const committed = execFileSync("git", ["log", "-1", "--format=%cs", "--", path], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(committed)) return committed;
  } catch {}
  return (await stat(file)).mtime.toISOString().slice(0, 10);
}

const pages = [];
for (const file of await findHtmlFiles(publicDirectory)) {
  const html = await readFile(file, "utf8");
  const robots = extract(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (/(?:^|,\s*)noindex(?:\s*,|$)/i.test(robots)) continue;

  const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonical.startsWith(`${productionOrigin}/`)) {
    throw new Error(`Missing production canonical in ${repositoryPath(file)}`);
  }

  const main = extract(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const images = [...main.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => new URL(match[1], productionOrigin).href)
    .filter((url) => url.startsWith(`${productionOrigin}/`));

  pages.push({
    canonical,
    lastmod: await lastModified(file),
    images: [...new Set(images)]
  });
}

pages.sort((a, b) => a.canonical.localeCompare(b.canonical, "pt-BR"));
const hasImages = pages.some((page) => page.images.length);
const namespace = hasImages ? '\n  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : "";
const entries = pages.map((page) => {
  const images = page.images.map((image) => `\n    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join("");
  return `  <url>\n    <loc>${escapeXml(page.canonical)}</loc>\n    <lastmod>${page.lastmod}</lastmod>${images}\n  </url>`;
}).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${namespace}>\n${entries}\n</urlset>\n`;
await writeFile(resolve(publicDirectory, "sitemap.xml"), sitemap, "utf8");
console.log(`Sitemap generated with ${pages.length} canonical URL${pages.length === 1 ? "" : "s"}.`);
