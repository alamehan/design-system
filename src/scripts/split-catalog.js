#!/usr/bin/env node
/* split-catalog.js — regenerate catalog/INDEX.md, catalog/TOKENS.md and
 * catalog/components/<code>.md from the monolithic catalog/catalog.md
 * produced by build.js. Run after build.js. */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "catalog", "catalog.md");
const OUT = path.join(ROOT, "catalog");
if (!fs.existsSync(SRC)) { console.error("catalog/catalog.md not found — run build.js first"); process.exit(1); }
fs.mkdirSync(path.join(OUT, "components"), { recursive: true });
const text = fs.readFileSync(SRC, "utf8");

const parts = text.split(/\n(?=## )/);
const intro = parts.shift();
const tokenSec = [];
const comps = [];
for (const p of parts) {
  const m = p.match(/^## ([a-z]+-\d+) \u2014 ([^\n_]+?)\s*(?:_\(([a-z-]*)\)_)?\s*\n/);
  if (m) comps.push({ code: m[1], name: m[2].trim(), tier: m[3] || "", body: p });
  else tokenSec.push(p);
}

fs.writeFileSync(path.join(OUT, "TOKENS.md"), intro.trim() + "\n\n" + tokenSec.join("\n").trim() + "\n");
for (const c of comps) fs.writeFileSync(path.join(OUT, "components", `${c.code}.md`), c.body.trim() + "\n");

const summarize = (body) => {
  const lines = body.split("\n").slice(1).map((l) => l.trim()).filter((l) => l && !l.startsWith("```"));
  let s = (lines[0] || "").replace(/^[-*]\s*/, "");
  return s.length > 140 ? s.slice(0, 137) + "\u2026" : s;
};
const groups = {};
for (const c of comps) (groups[c.code.split("-")[0]] = groups[c.code.split("-")[0]] || []).push(c);
const order = ["asset", "atom", "layout", "composite", "panel", "page"];
let idx = "# Catalog INDEX \u2014 E-Systems Design System\n\n";
idx += "**How to use (progressive disclosure):** scan this index to find the component you need, then read ONLY `catalog/components/<code>.md` for its full spec (tokens, variants, states, exact classes). Read `catalog/TOKENS.md` once per session for the token vocabulary. Never guess a token or class that is not in these files.\n\n";
for (const g of order.concat(Object.keys(groups).filter((g) => !order.includes(g)))) {
  if (!groups[g]) continue;
  idx += `## ${g} (${groups[g].length})\n\n`;
  for (const c of groups[g].sort((a, b) => a.code.localeCompare(b.code)))
    idx += `- **${c.code}** ${c.name}${c.tier ? ` _(${c.tier})_` : ""} \u2014 ${summarize(c.body)} \u2192 \`components/${c.code}.md\`\n`;
  idx += "\n";
}
fs.writeFileSync(path.join(OUT, "INDEX.md"), idx);
console.log(`split-catalog: ${comps.length} component specs + TOKENS.md + INDEX.md regenerated.`);
