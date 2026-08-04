#!/usr/bin/env node
/* lint-reference.js — token-purity lint for reference/css (conformance-lite).
 * Fails if any reference CSS hardcodes a hex color or rgb() literal.
 * _base.css (gallery scaffolding) is exempt from px checks but not from hex,
 * except an explicit whitelisted white fallback. */
const fs = require("fs");
const path = require("path");

const DS_ROOT = path.resolve(__dirname, "..", "..");
const DIR = path.join(DS_ROOT, "reference", "css");
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


/* ------------------------------------------------------------------------
 * GATE 4 — every class the reference HTML uses must exist in the reference CSS.
 *
 * This is the gate that would have caught v3.4.2's worst bug. `es-tabs--pill`,
 * `es-row`, `es-table__head`, `es-col__label`, `es-col__sort`, `es-status__dot`,
 * `es-btn--Fill` and `cp-card` were all written into gallery.html while the CSS defined
 * `--basic`, `.es-cell`, `--Filled` and nothing at all for the rest. A class that resolves
 * to nothing does not throw, does not warn, and does not show up in a token-purity check —
 * it just silently drops the background, the flex container or the button colour, and the
 * whole DataTable tier collapsed into a vertical stack because of it.
 *
 * A typo in a class name is the single cheapest way to break the visual truth. Gate it.
 * ---------------------------------------------------------------------- */
const cssBlob = fs.readdirSync(DIR).filter((f) => f.endsWith(".css"))
  .map((f) => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n")
  + fs.readFileSync(path.join(DS_ROOT, "dist", "variables.css"), "utf8");
const cssClasses = new Set((cssBlob.match(/\.[A-Za-z0-9_-]+/g) || []).map((c) => c.slice(1)));
const GATED_PREFIX = /^(es-|cp-|ref-|ts-)/;
const undef = new Map();
for (const f of htmlFiles(REF)) {
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(REF, f);
  // classes declared in a page's own inline <style> count as defined for that page
  const local = new Set(((html.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n")
    .match(/\.[A-Za-z0-9_-]+/g) || []).map((c) => c.slice(1)));
  for (const attr of html.match(/class="[^"]*"/g) || []) {
    for (const c of attr.slice(7, -1).split(/\s+/)) {
      if (!c || !GATED_PREFIX.test(c)) continue;
      if (cssClasses.has(c) || local.has(c)) continue;
      if (!undef.has(c)) undef.set(c, new Set());
      undef.get(c).add(rel);
    }
  }
}
if (undef.size) {
  console.log(`\n\u274c ${undef.size} class(es) used in reference/ resolve to no CSS rule:`);
  for (const [c, files] of [...undef].sort()) console.log(`   .${c}  <- ${[...files].sort().join(", ")}`);
  console.log("   A class that matches nothing fails silently. Define it, or fix the name.");
  violations += undef.size;
} else {
  console.log("\u2705 every es-/cp-/ref-/ts- class used in reference/ resolves to a CSS rule");
}

/* ------------------------------------------------------------------------
 * GATE 5 — every local asset a reference file points at must exist on disk.
 *
 * gallery.html and pages/table-row.html referenced `assets/avatars/avatar-1.svg` and
 * `avatar-2.svg`. Only `ava-placeholder-user.svg` was ever shipped, so both specimens
 * rendered as broken-image boxes. Over file:// there is no console anyone reads.
 * ---------------------------------------------------------------------- */
let brokenAssets = 0;
for (const f of htmlFiles(REF)) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.match(/src="[^"]+"/g) || []) {
    const url = m.slice(5, -1);
    if (/^(https?:|data:|#)/.test(url)) continue;
    const target = path.resolve(path.dirname(f), url);
    if (!fs.existsSync(target)) {
      console.log(`  \u274c ${path.relative(REF, f)}: src="${url}" does not exist`);
      brokenAssets++;
    }
  }
}
if (brokenAssets) { violations += brokenAssets; console.log(`\u274c ${brokenAssets} broken asset reference(s).`); }
else console.log("\u2705 every local asset referenced by reference/ exists on disk");

/* ------------------------------------------------------------------------
 * GATE 6 — every var(--…) used anywhere in the reference must resolve.
 *
 * `_base.css` asked for `--color-system-text-muted` (the real token is `--color-system-text-mute`)
 * so every section caption fell back to body colour, and eleven files in reference/pages/ set
 * `font-family: var(--font-family-base, sans-serif)` against a variable that has never existed —
 * they rendered in the system font, which is exactly the failure GATE 2 was written to stop.
 * GATE 2 only reads CSS files; this one reads the HTML too.
 * ---------------------------------------------------------------------- */
const tokenNames = new Set((fs.readFileSync(path.join(DS_ROOT, "dist", "variables.css"), "utf8")
  .match(/--[A-Za-z0-9-]+\s*:/g) || []).map((m) => m.replace(/\s*:$/, "")));
const localVars = new Set((cssBlob.match(/^\s*(--[A-Za-z0-9-]+)\s*:/gm) || [])
  .map((m) => m.trim().replace(/\s*:$/, "")));
const deadVars = new Map();
const scan = (text, label) => {
  for (const m of text.match(/var\((--[A-Za-z0-9-]+)/g) || []) {
    const name = m.slice(4);
    if (tokenNames.has(name) || localVars.has(name)) continue;
    if (!deadVars.has(name)) deadVars.set(name, new Set());
    deadVars.get(name).add(label);
  }
};
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".css")))
  scan(fs.readFileSync(path.join(DIR, f), "utf8"), "css/" + f);
for (const f of htmlFiles(REF)) scan(fs.readFileSync(f, "utf8"), path.relative(REF, f));
if (deadVars.size) {
  console.log(`\n\u274c ${deadVars.size} var() reference(s) resolve to nothing:`);
  for (const [v, files] of [...deadVars].sort()) console.log(`   ${v}  <- ${[...files].sort().join(", ")}`);
  console.log("   A dead var() silently falls back \u2014 to the system font, or to inherited colour.");
  violations += deadVars.size;
} else {
  console.log("\u2705 every var() used in reference/ resolves to a real token");
}


/* ------------------------------------------------------------------------
 * GATE 7 — every literal font-size in reference CSS must sit on the type ramp.
 *
 * The ramp is read from src/foundations.json, not hardcoded. Sizes of 12.5, 13, 15, 20 and
 * 24px had accumulated in the composed scaffolding and the avatar scale used an `em` fraction
 * that resolved to 10px — five values that do not exist anywhere in the foundations. Each one
 * looked fine alone and made the tier read as inconsistent together.
 *
 * visual-audit.py catches this at render time; this catches it without a browser, so it still
 * fires in an environment where playwright is not installed.
 * ---------------------------------------------------------------------- */
const foundations = JSON.parse(fs.readFileSync(path.join(DS_ROOT, "src", "foundations.json"), "utf8"));
const ramp = new Set();
for (const weight of Object.values(foundations["text-styles"] || {}))
  for (const style of Object.values(weight || {})) {
    const v = (style || {}).$value || {};
    if (v.fontSize && typeof v.fontSize.value === "number") ramp.add(v.fontSize.value);
  }
let offRamp = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".css") && x !== "_fonts.css")) {
  const src = fs.readFileSync(path.join(DIR, f), "utf8");
  src.split("\n").forEach((line, i) => {
    const m = line.match(/font-size:\s*([\d.]+)px/);
    if (m && !ramp.has(Math.round(parseFloat(m[1])))) {
      console.log(`  \u274c css/${f}:${i + 1}  font-size: ${m[1]}px is off the ramp [${[...ramp].sort((a, b) => a - b)}]`);
      offRamp++;
    }
  });
}
if (offRamp) { violations += offRamp; console.log(`\u274c ${offRamp} off-ramp font-size(s).`); }
else console.log(`\u2705 every literal font-size in reference/css sits on the type ramp [${[...ramp].sort((a, b) => a - b)}]`);

if (violations) {
  console.log(`\n${violations} reference-tier violation(s). The reference must be token-pure, load every font it names, and draw every icon from the Tabler sprite.`);
  process.exit(1);
}
console.log("\u2705 reference/css is token-pure (no hardcoded hex/rgb).");
