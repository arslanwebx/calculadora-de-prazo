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

for (const file of ["robots.txt", "sitemap.xml", ".htaccess", "_headers", "assets/logo.svg", "assets/og-image.png", "assets/app.js", "assets/contact.js", "contato/index.html"]) {
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
const contact = await readFile(new URL("../dist/contato/index.html", import.meta.url), "utf8");
const contactScript = await readFile(new URL("../dist/assets/contact.js", import.meta.url), "utf8");
const headers = await readFile(new URL("../dist/_headers", import.meta.url), "utf8");
if (!robots.includes("https://calculadoradeprazo.pro/sitemap.xml")) throw new Error("Wrong sitemap in robots.txt");
if (!sitemap.includes("<loc>https://calculadoradeprazo.pro/</loc>")) throw new Error("Wrong homepage URL in sitemap");
if (!sitemap.includes("<loc>https://calculadoradeprazo.pro/contato/</loc>")) throw new Error("Contact page missing from sitemap");
if (!contact.includes('<link rel="canonical" href="https://calculadoradeprazo.pro/contato/">')) throw new Error("Wrong contact canonical");
if (!contact.includes("contato@calculadoradeprazo.pro")) throw new Error("Contact email missing from contact page");
if (!html.includes("contato@calculadoradeprazo.pro")) throw new Error("Contact email missing from homepage");
if (!contactScript.includes("https://formsubmit.co/ajax/contato@calculadoradeprazo.pro")) throw new Error("Wrong FormSubmit endpoint");
if (!contactScript.includes('_subject: "Novo contato — Calculadora de Prazo"')) throw new Error("Wrong contact subject");
if (!headers.includes("connect-src 'self' https://formsubmit.co") || !headers.includes("form-action 'self' https://formsubmit.co")) {
  throw new Error("FormSubmit is missing from CSP");
}
for (const [, json] of contact.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);

console.log("SEO and production-file checks passed.");
