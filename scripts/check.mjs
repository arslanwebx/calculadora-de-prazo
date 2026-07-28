import { readFile, access } from "node:fs/promises";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const required = [
  "<title>Calculadora de Prazo Processual Grátis | Prazo Fácil</title>",
  '<link rel="canonical" href="https://calculadoradeprazo.pro/">',
  '<meta property="og:url" content="https://calculadoradeprazo.pro/">',
  "<h1>Calculadora de Prazo Processual</h1>",
  '"@type": "SoftwareApplication"',
  '"@type": "FAQPage"'
];

for (const text of required) {
  if (!html.includes(text)) throw new Error(`Missing required output: ${text}`);
}

for (const file of ["robots.txt", "sitemap.xml", ".htaccess", "assets/logo.svg", "assets/og-image.png", "assets/app.js"]) {
  await access(new URL(`../dist/${file}`, import.meta.url));
}

if (/prazofacil\.com\.br|localhost/i.test(html)) {
  throw new Error("Outdated or development origin found in production HTML");
}

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (!jsonLdBlocks.length) throw new Error("No JSON-LD found");
for (const [, json] of jsonLdBlocks) JSON.parse(json);

const robots = await readFile(new URL("../dist/robots.txt", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
if (!robots.includes("https://calculadoradeprazo.pro/sitemap.xml")) throw new Error("Wrong sitemap in robots.txt");
if (!sitemap.includes("<loc>https://calculadoradeprazo.pro/</loc>")) throw new Error("Wrong homepage URL in sitemap");

console.log("SEO and production-file checks passed.");
