import { readdir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const origin = "https://calculadoradeprazo.pro";
const failures = [];

async function findFiles(directory, namePattern) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return findFiles(absolute, namePattern);
    return entry.isFile() && namePattern.test(entry.name) ? [absolute] : [];
  }));
  return nested.flat();
}

function label(file) {
  return relative(output, file).split(sep).join("/");
}

function matches(html, pattern) {
  return [...html.matchAll(pattern)];
}

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function routeFor(file) {
  const path = label(file);
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return `/${path.slice(0, -10)}`;
  return `/${path}`;
}

function localTarget(href, currentRoute) {
  if (/^(?:mailto:|tel:|javascript:|#)/i.test(href)) return null;
  const url = new URL(href, `${origin}${currentRoute}`);
  if (url.origin !== origin) return null;
  return url.pathname;
}

function outputTarget(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/") return resolve(output, "index.html");
  if (decoded.endsWith("/")) return resolve(output, `.${decoded}index.html`);
  if (/\.[a-z0-9]+$/i.test(decoded)) return resolve(output, `.${decoded}`);
  return resolve(output, `.${decoded}`, "index.html");
}

const htmlFiles = await findFiles(output, /\.html$/);
const pages = [];
const canonicalOwners = new Map();
const incoming = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const path = label(file);
  const route = routeFor(file);
  const robots = extract(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const noindex = /\bnoindex\b/i.test(robots);
  const canonicalMatches = matches(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi);
  const h1s = matches(html, /<h1\b[^>]*>/gi);
  const title = extract(html, /<title>([^<]+)<\/title>/i);
  const description = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

  if (path === "404.html") {
    if (!noindex) failures.push("404.html must be noindex");
    if (canonicalMatches.length) failures.push("404.html must not declare a canonical URL");
    continue;
  }

  if (noindex) continue;
  if (!/\bindex\b/i.test(robots) || !/\bfollow\b/i.test(robots)) failures.push(`${path}: missing index, follow`);
  if (!html.includes("https://www.googletagmanager.com/gtag/js?id=G-HX4CBE6FVN") || !html.includes("gtag('config', 'G-HX4CBE6FVN');")) {
    failures.push(`${path}: Google Analytics tag is missing`);
  }
  if (canonicalMatches.length !== 1) failures.push(`${path}: expected exactly one canonical`);
  if (h1s.length !== 1) failures.push(`${path}: expected exactly one H1, found ${h1s.length}`);
  if (!title) failures.push(`${path}: title is missing`);
  if (description.length < 70 || description.length > 170) failures.push(`${path}: description length is ${description.length}`);
  if (!/<html\s+lang=["']pt-BR["']/i.test(html)) failures.push(`${path}: html lang must be pt-BR`);
  if (!/<meta\s+name=["']viewport["']/i.test(html)) failures.push(`${path}: viewport metadata is missing`);

  const canonical = canonicalMatches[0]?.[1] || "";
  const expectedCanonical = `${origin}${route}`;
  if (!canonical.startsWith(`${origin}/`)) failures.push(`${path}: canonical is outside the production HTTPS origin`);
  if (canonical !== expectedCanonical) failures.push(`${path}: canonical ${canonical} does not match route ${expectedCanonical}`);
  if (canonicalOwners.has(canonical)) failures.push(`${path}: duplicate canonical also used by ${canonicalOwners.get(canonical)}`);
  canonicalOwners.set(canonical, path);

  const ogUrl = extract(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  if (ogUrl !== canonical) failures.push(`${path}: og:url does not match canonical`);
  for (const property of ["og:title", "og:description", "og:image"]) {
    if (!new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["'][^"']+["']`, "i").test(html)) {
      failures.push(`${path}: ${property} is missing`);
    }
  }
  if (!/<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i.test(html)) {
    failures.push(`${path}: twitter large-image card metadata is missing`);
  }

  const jsonLdBlocks = matches(html, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (!jsonLdBlocks.length) failures.push(`${path}: JSON-LD is missing`);
  for (const [, json] of jsonLdBlocks) {
    try {
      JSON.parse(json);
    } catch {
      failures.push(`${path}: invalid JSON-LD`);
    }
  }

  const isArticle = /^\/(?:artigos|blog|guias)\//.test(route);
  if (isArticle) {
    const jsonLd = matches(html, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi).map((match) => match[1]).join("\n");
    for (const required of ['"BlogPosting"', '"datePublished"', '"dateModified"', '"author"', '"image"', '"BreadcrumbList"']) {
      if (!jsonLd.includes(required)) failures.push(`${path}: article schema is missing ${required}`);
    }
    if (!/class=["'][^"']*\bauthor-box\b/i.test(html) || !/href=["']\/autora\/mariana-ribeiro\/["']/i.test(html)) {
      failures.push(`${path}: article must include the Mariana Ribeiro author box`);
    }
  }

  const links = matches(html, /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi).map((match) => match[1]);
  for (const href of links) {
    const target = localTarget(href, route);
    if (!target) continue;
    const targetFile = outputTarget(target);
    try {
      await readFile(targetFile);
    } catch {
      failures.push(`${path}: broken internal link ${href}`);
    }
    const normalized = target === "/" ? `${origin}/` : `${origin}${target.endsWith("/") ? target : `${target}/`}`;
    if (normalized !== canonical) incoming.set(normalized, (incoming.get(normalized) || 0) + 1);
  }

  const resources = [
    ...matches(html, /<(?:script|img)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi).map((match) => match[1]),
    ...matches(html, /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi).map((match) => match[1])
  ];
  for (const resource of resources) {
    const target = localTarget(resource, route);
    if (!target) continue;
    try {
      await readFile(outputTarget(target));
    } catch {
      failures.push(`${path}: missing local resource ${resource}`);
    }
  }

  pages.push({ path, route, canonical, isArticle });
}

const sitemap = await readFile(resolve(output, "sitemap.xml"), "utf8");
const sitemapUrls = matches(sitemap, /<loc>([^<]+)<\/loc>/g).map((match) => match[1]);
if (sitemap.includes("<priority>") || sitemap.includes("<changefreq>")) {
  failures.push("sitemap.xml contains priority/changefreq values ignored by Google");
}
for (const page of pages) {
  if (sitemapUrls.filter((url) => url === page.canonical).length !== 1) {
    failures.push(`${page.path}: canonical must appear exactly once in sitemap.xml`);
  }
  if (page.canonical !== `${origin}/` && !incoming.get(page.canonical)) {
    failures.push(`${page.path}: no crawlable internal incoming link`);
  }
}
for (const url of sitemapUrls) {
  if (!pages.some((page) => page.canonical === url)) failures.push(`sitemap.xml contains a non-indexable or missing URL: ${url}`);
}
const lastmods = matches(sitemap, /<lastmod>([^<]+)<\/lastmod>/g).map((match) => match[1]);
if (lastmods.length !== sitemapUrls.length || lastmods.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
  failures.push("sitemap.xml must provide one valid lastmod date per URL");
}

const robots = await readFile(resolve(output, "robots.txt"), "utf8");
if (!/^User-agent:\s*\*$/mi.test(robots) ||
    !/^Allow:\s*\/$/mi.test(robots) ||
    !new RegExp(`^Sitemap:\\s*${origin.replaceAll(".", "\\.")}/sitemap\\.xml$`, "mi").test(robots)) {
  failures.push("robots.txt does not expose the production sitemap correctly");
}

if (failures.length) {
  throw new Error(`Technical SEO audit failed:\n- ${failures.join("\n- ")}`);
}
console.log(`Technical SEO audit passed for ${pages.length} indexable routes (${pages.filter((page) => page.isArticle).length} articles).`);
