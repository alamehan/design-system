#!/usr/bin/env node
/* lint-reference.js — token-purity lint for reference/css (conformance-lite).
 * Fails if any reference CSS hardcodes a hex color or rgb() literal.
 * _base.css (gallery scaffolding) is exempt from px checks but not from hex,
 * except an explicit whitelisted white fallback. */
const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..", "..", "reference", "css");
const WHITELIST = [/var\(--[^)]+,\s*#fff\)/i]; // documented fallback in _base.css only
let violations = 0;
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".css"))) {
  const text = fs.readFileSync(path.join(DIR, f), "utf8");
  text.split("\n").forEach((line, i) => {
    const stripped = line.replace(/\/\*.*?\*\//g, "");
    const hex = stripped.match(/#[0-9a-fA-F]{3,8}\b/);
    const rgb = stripped.match(/rgba?\(\s*\d/);
    if ((hex || rgb) && !(f === "_base.css" && WHITELIST.some((w) => w.test(stripped)))) {
      violations++;
      console.log(`\u274c ${f}:${i + 1}  ${stripped.trim().slice(0, 100)}`);
    }
  });
}

/* ------------------------------------------------------------------------
 * GATE 2 — a named font must actually be LOADED.
 *
 * Until v3.3.0 _base.css said `font-family: "Fustat"` while nothing in
 * reference/ ever declared an @font-face for it. Chrome silently fell back to
 * the system font, so every visual verdict made against the reference tier was
 * made in the wrong typeface — a direct violation of HISTORY.md law #2, and
 * completely invisible without this check.
 * ---------------------------------------------------------------------- */
const allCss = fs.readdirSync(DIR).filter((f) => f.endsWith(".css"))
  .map((f) => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
const declared = new Set((allCss.match(/@font-face[\s\S]*?\}/g) || [])
  .flatMap((b) => (b.match(/font-family:\s*["']([^"']+)["']/g) || []).map((m) => m.replace(/.*["']([^"']+)["'].*/, "$1"))));
const GENERIC = /^(inherit|initial|unset|revert|sans-serif|serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif|ui-monospace|ui-rounded|-apple-system|BlinkMacSystemFont|Segoe UI|Roboto|Helvetica|Helvetica Neue|Arial|Menlo|Consolas|SFMono-Regular|Liberation Mono|Courier New|emoji|math|fangsong)$/i;

const named = new Set();
for (const decl of allCss.match(/font-family:\s*[^;}]+/g) || []) {
  for (const raw of decl.replace(/font-family:\s*/, "").split(",")) {
    const fam = raw.trim().replace(/^["']|["']$/g, "");
    if (!fam || fam.startsWith("var(") || GENERIC.test(fam)) continue;
    named.add(fam);
  }
}
const unloaded = [...named].filter((f) => !declared.has(f));
if (unloaded.length) {
  console.log(`\n\u274c reference/css names ${unloaded.length} font(s) that are never loaded: ${unloaded.join(", ")}`);
  console.log("   A named-but-unloaded font falls back to the system font, which invalidates every");
  console.log("   visual verdict made against the reference tier (HISTORY.md law #2).");
  console.log("   Fix: add an @font-face for it in reference/css/_fonts.css.");
  violations++;
} else {
  console.log(`\u2705 every named font is loaded (${[...declared].join(", ") || "none named"})`);
}

/* ------------------------------------------------------------------------
 * GATE 3 — icons come from the Tabler sprite, never hand-drawn.
 *
 * The specs say Tabler. Hand-drawn <svg> paths look close enough to pass a
 * glance while being unverifiable against the real icon set, so they are
 * rejected outright. The sprite is inlined per file on purpose: an external
 * <use href="file.svg#id"> is blocked by Chrome over file://, and designers
 * open these files by double-clicking them.
 * ---------------------------------------------------------------------- */
const REF = path.resolve(__dirname, "..", "..", "reference");
function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : (e.name.endsWith(".html") ? [path.join(dir, e.name)] : []));
}
let handDrawn = 0, externalUse = 0, spriteUsers = 0;
for (const f of htmlFiles(REF)) {
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(REF, f);
  const body = html.replace(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" style="display:none"[\s\S]*?<\/svg>/g, "");
  for (const m of body.match(/<svg[^>]*>[\s\S]*?<\/svg>/g) || []) {
    if (!/<use\s/.test(m)) { console.log(`  \u274c ${rel}: hand-drawn <svg> — use the Tabler sprite instead`); handDrawn++; }
  }
  for (const m of body.match(/<use[^>]*href="[^"]*"/g) || []) {
    if (!/href="#tb-/.test(m)) { console.log(`  \u274c ${rel}: ${m} — sprite must be inlined and referenced as #tb-*`); externalUse++; }
  }
  if (/href="#tb-/.test(body)) {
    spriteUsers++;
    if (!/<symbol id="tb-/.test(html)) { console.log(`  \u274c ${rel}: references #tb-* but the sprite is not inlined (breaks over file://)`); externalUse++; }
  }
}
if (handDrawn || externalUse) {
  console.log(`\n\u274c ${handDrawn} hand-drawn SVG(s) and ${externalUse} bad sprite reference(s) in reference/.`);
  violations++;
} else {
  console.log(`\u2705 all icons come from the inlined Tabler sprite (${spriteUsers} file(s))`);
}

if (violations) {
  console.log(`\n${violations} reference-tier violation(s). The reference must be token-pure, load every font it names, and draw every icon from the Tabler sprite.`);
  process.exit(1);
}
console.log("\u2705 reference/css is token-pure (no hardcoded hex/rgb).");
