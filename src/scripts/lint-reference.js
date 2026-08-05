#!/usr/bin/env node
/* lint-reference.js — reference-tier integrity. Fourteen gates, each written after something
 * shipped broken through a door nothing was watching. Every one has been negative-tested:
 * a gate that has never been seen to fail is a green light of unknown wattage.
 *
 * GATE 1 — token purity.
 * Fails if any reference CSS hardcodes a hex color or rgb() literal. `_base.css` (gallery
 * scaffolding) is exempt from the px checks but not from hex, except one whitelisted white
 * fallback. This gate was unnumbered until v3.5.2, which made `lint-docs.js` count thirteen
 * gates in a file that ran fourteen — a small instance of exactly what these gates exist for. */
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


/* ------------------------------------------------------------------------
 * GATE 8 — the gallery anchor contract.
 *
 * Every catalog/components/<code>.md carries `Reference: reference/gallery.html#<id>` and
 * CLAUDE.md §5 names composed anchors by hand. Those ids are the AI grounding chain: an agent
 * told to open `#table-row` and finding nothing has no visual truth to copy and will invent
 * one. The gallery may be reordered and regrouped freely — v3.4.5 did exactly that — but an
 * anchor may never be renamed or dropped without every reference to it moving in the same
 * change set. Gate the contract, not the layout.
 * ---------------------------------------------------------------------- */
const galleryPath = path.join(REF, "gallery.html");
if (fs.existsSync(galleryPath)) {
  const gsrc = fs.readFileSync(galleryPath, "utf8");
  const present = new Set([...gsrc.matchAll(/<(?:section|div)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = new Map();
  const scanFor = (file) => {
    if (!fs.existsSync(file)) return;
    for (const m of fs.readFileSync(file, "utf8").matchAll(/gallery\.html#([A-Za-z0-9_-]+)/g)) {
      if (!refs.has(m[1])) refs.set(m[1], new Set());
      refs.get(m[1]).add(path.relative(DS_ROOT, file));
    }
    for (const m of fs.readFileSync(file, "utf8").matchAll(/`#(composed[A-Za-z0-9_-]*)`/g)) {
      if (!refs.has(m[1])) refs.set(m[1], new Set());
      refs.get(m[1]).add(path.relative(DS_ROOT, file));
    }
  };
  scanFor(path.join(DS_ROOT, "CLAUDE.md"));
  const compDir = path.join(DS_ROOT, "catalog", "components");
  if (fs.existsSync(compDir)) for (const f of fs.readdirSync(compDir)) scanFor(path.join(compDir, f));
  let dead = 0;
  for (const [id, files] of [...refs].sort()) {
    if (present.has(id)) continue;
    console.log(`  \u274c gallery.html#${id} is referenced by ${[...files].sort().join(", ")} but no such section exists`);
    dead++;
  }
  /* internal links inside the gallery itself count too */
  for (const m of gsrc.matchAll(/href="#([A-Za-z0-9_-]+)"/g)) {
    if (m[1] === "top" || present.has(m[1]) || gsrc.includes(`id="${m[1]}"`)) continue;
    console.log(`  \u274c gallery.html links to #${m[1]} which does not exist in the page`);
    dead++;
  }
  if (dead) { violations += dead; console.log(`\u274c ${dead} broken gallery anchor(s).`); }
  else console.log(`\u2705 every referenced gallery anchor exists (${present.size} section ids, ${refs.size} referenced)`);
}


/* ------------------------------------------------------------------------
 * GATE 9 — no duplicate id, and no showcase stranded outside the shell.
 *
 * The v3.4.6 gallery shipped FIVE duplicated sections. The regroup script spliced the page back
 * together on `src.rindex("</section>")`, but the composed samples were authored as
 * `<div class="ref-section">`, so everything after the last real `</section>` — 36 KB of markup —
 * was re-appended verbatim OUTSIDE `<main>`. Every gate passed: the anchors all existed (twice),
 * every class resolved, nothing overflowed, the type was on the ramp. It rendered as a second
 * copy of composed-01…05 hanging off the bottom of the page at full width.
 *
 * Duplicate ids also break the thing the anchors exist for: `getElementById` and `#hash`
 * navigation both resolve to the FIRST match, so an agent following
 * `reference/gallery.html#composed-01` could silently be reading a stale copy.
 * ---------------------------------------------------------------------- */
let structural = 0;
for (const f of htmlFiles(REF)) {
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(REF, f);
  const seen = new Map();
  /* ids inside the inlined <symbol> sprite are namespaced tb-* and legitimately shared
     across files, but must still be unique WITHIN a file — which they are; check everything. */
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  for (const [id, n] of seen) {
    if (n < 2) continue;
    console.log(`  \u274c ${rel}: id="${id}" appears ${n} times \u2014 #${id} resolves to the first one only`);
    structural++;
  }
  if (!html.includes('class="ref-shell"')) continue;
  const main = html.indexOf("<main"), endMain = html.indexOf("</main>");
  for (const m of html.matchAll(/class="ref-section" id="([^"]+)"/g)) {
    if (m.index > main && m.index < endMain) continue;
    console.log(`  \u274c ${rel}: section #${m[1]} sits outside <main> \u2014 it renders at page level, not in the content column`);
    structural++;
  }
}
if (structural) { violations += structural; console.log(`\u274c ${structural} structural fault(s) in reference HTML.`); }
else console.log("\u2705 no duplicate ids, and every showcase sits inside the content column");


/* ------------------------------------------------------------------------
 * GATE 10 — every component rule must be demonstrated, or explicitly excused.
 *
 * GATE 4 catches a class used in HTML with no CSS behind it. This is its mirror: a CSS rule
 * that no specimen ever renders. The gallery calls itself "the visual truth for all
 * components", and a rule with no specimen is a claim with no evidence — nobody has seen it
 * render, no gate has measured it, and an agent told to use it is copying from a description
 * rather than from a rendering. Twenty-nine had quietly accumulated by v3.4.7.
 *
 * The only honest exemption is a class that CANNOT have a static specimen — a Vue
 * <Transition> hook exists for the duration of a frame and nothing else. Those carry
 * `runtime-only:` on the line above, with a reason. Exempting by name in this script would
 * put the list where nobody editing the CSS would ever see it; putting the marker in the CSS
 * means the justification sits next to the rule it excuses.
 * ---------------------------------------------------------------------- */
{
  const htmlBlob = htmlFiles(REF).map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const shown = new Set();
  for (const m of htmlBlob.matchAll(/class="([^"]*)"/g))
    for (const c of m[1].split(/\s+/)) if (c) shown.add(c);

  let orphan = 0, excused = 0;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".css") && x !== "_fonts.css")) {
    const lines = fs.readFileSync(path.join(DIR, f), "utf8").split("\n");
    lines.forEach((line, i) => {
      const m = line.match(/^\.((?:es|cp)-[A-Za-z0-9_-]+)/);
      if (!m || shown.has(m[1])) return;
      const prev = (lines[i - 1] || "") + (lines[i - 2] || "");
      if (/runtime-only:/.test(prev)) { excused++; return; }
      console.log(`  \u274c css/${f}:${i + 1}  .${m[1]} is defined but no specimen in reference/ ever renders it`);
      console.log(`       Add a specimen, delete the rule, or mark it /* runtime-only: <why> */`);
      orphan++;
    });
  }
  if (orphan) { violations += orphan; console.log(`\u274c ${orphan} undemonstrated component rule(s).`); }
  else console.log(`\u2705 every component rule has a specimen (${excused} runtime-only exemption(s), each with a stated reason)`);
}


/* ------------------------------------------------------------------------
 * GATE 11 — every <div> in a showcase must be closed inside that showcase.
 *
 * Five sections of the gallery had shipped with one unclosed <div> each — panel, panel-section,
 * modal, filter-field, candidate-card. The browser silently auto-closes at `</section>`, so the
 * page LOOKED right and every other gate passed, including the headless render.
 *
 * It is a trap, not a cosmetic issue: anything appended to such a section lands INSIDE the
 * unclosed element and inherits its width and layout. That is exactly what happened when the
 * v3.4.8 specimens were added — a PanelSection specimen came out 108px wide inside a 964px
 * parent, and only the overflow probe noticed.
 *
 * Markup that renders correctly by accident is markup nobody can safely edit.
 * ---------------------------------------------------------------------- */
{
  let unbalanced = 0;
  for (const f of htmlFiles(REF)) {
    const html = fs.readFileSync(f, "utf8");
    const rel = path.relative(REF, f);
    for (const m of html.matchAll(/<section class="ref-section" id="([^"]+)"/g)) {
      const end = html.indexOf("\n</section>", m.index);
      if (end < 0) continue;
      const sec = html.slice(m.index, end);
      const open = (sec.match(/<div\b/g) || []).length;
      const close = (sec.match(/<\/div>/g) || []).length;
      if (open === close) continue;
      console.log(`  \u274c ${rel}: section #${m[1]} has ${open} <div> and ${close} </div>` +
        ` \u2014 anything appended to it lands inside the unclosed one`);
      unbalanced++;
    }
  }
  if (unbalanced) { violations += unbalanced; console.log(`\u274c ${unbalanced} unbalanced showcase(s).`); }
  else console.log("\u2705 every showcase closes every <div> it opens");
}

/* ------------------------------------------------------------------------
 * GATE 12 — a stylesheet must be loaded by the page that needs it.
 *
 * GATE 4 asks whether a class resolves in `reference/css` — ANY file in it. That is the wrong
 * question, because a browser only applies the stylesheets the document actually links. The
 * gallery used every `es-iblock*` class in composite-01 and never linked `css/info-block.css`,
 * so the whole InfoBlock section rendered as unstyled inline spans: label and value butted
 * together on one line with no gap. Four `reference/components/*.html` files had the same fault
 * — data-table.html used the entire `es-cell*` family without table-row.css, filter-panel.html
 * used `es-ffield*` without filter-field.css.
 *
 * Every gate in the file passed. The rules existed, the classes were spelled correctly, nothing
 * overflowed. The page simply never loaded the file the rules were in. So the question becomes
 * per-document: does every gated class this file uses resolve in a stylesheet THIS FILE LINKS?
 * ---------------------------------------------------------------------- */
{
  const sheetClasses = new Map();
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".css")))
    sheetClasses.set(f, new Set((fs.readFileSync(path.join(DIR, f), "utf8").match(/\.[A-Za-z0-9_-]+/g) || []).map((c) => c.slice(1))));
  const varClasses = new Set((fs.readFileSync(path.join(DS_ROOT, "dist", "variables.css"), "utf8")
    .match(/^\.[A-Za-z0-9_-]+/gm) || []).map((c) => c.slice(1)));

  let unlinked = 0;
  const linkedSomewhere = new Set();
  for (const f of htmlFiles(REF)) {
    const html = fs.readFileSync(f, "utf8");
    const rel = path.relative(REF, f);
    const links = [...html.matchAll(/href="[^"]*?css\/([a-z0-9_-]+\.css)"/g)].map((m) => m[1]);
    links.forEach((l) => linkedSomewhere.add(l));
    const have = new Set(varClasses);
    for (const l of links) for (const c of sheetClasses.get(l) || []) have.add(c);
    for (const c of ((html.match(/<style>[\s\S]*?<\/style>/g) || []).join("\n").match(/\.[A-Za-z0-9_-]+/g) || []))
      have.add(c.slice(1));
    const missing = new Map();
    for (const attr of html.match(/class="[^"]*"/g) || [])
      for (const c of attr.slice(7, -1).split(/\s+/)) {
        if (!c || !GATED_PREFIX.test(c) || have.has(c)) continue;
        /* where does it actually live? naming the file is the whole fix */
        const owner = [...sheetClasses].find(([, set]) => set.has(c));
        missing.set(c, owner ? owner[0] : "(nowhere \u2014 see GATE 4)");
      }
    if (!missing.size) continue;
    const bySheet = new Map();
    for (const [c, sheet] of missing) {
      if (!bySheet.has(sheet)) bySheet.set(sheet, []);
      bySheet.get(sheet).push(c);
    }
    for (const [sheet, cls] of [...bySheet].sort()) {
      console.log(`  \u274c ${rel} uses ${cls.length} class(es) from css/${sheet} and never links it` +
        `  \u2014 e.g. .${cls.sort()[0]}`);
      unlinked++;
    }
  }
  /* the mirror: a stylesheet no document loads is a rule set nobody has ever seen render */
  for (const f of [...sheetClasses.keys()].sort()) {
    if (f.startsWith("_") || linkedSomewhere.has(f)) continue;
    console.log(`  \u274c css/${f} is linked by no reference HTML at all \u2014 nothing it defines has ever rendered`);
    unlinked++;
  }
  if (unlinked) {
    violations += unlinked;
    console.log(`\u274c ${unlinked} stylesheet link gap(s). Add the <link>, do not move the rule.`);
  } else {
    console.log("\u2705 every gated class resolves in a stylesheet its own page links");
  }
}


/* ------------------------------------------------------------------------
 * GATE 13 — gallery scaffolding may never sit inside a component root.
 *
 * The v3.4.9 specimen additions spliced `<p class="ref-label">…</p><specimen>` in before the
 * wrong `</div>`: the one closing the PREVIOUS specimen rather than the one ending the group.
 * So a second Panel rendered inside the first one's `overflow:hidden` stage and covered it, a
 * CandidateCard rendered inside another CandidateCard, and a FilterField inside a FilterField.
 *
 * Every existing gate passed. Div balance was correct (GATE 11 counts pairs, not places), every
 * class resolved, no id was duplicated, nothing overflowed, the type was on the ramp. Three
 * sections shipped visibly broken behind eleven green checks, and the author found them by
 * opening the page.
 *
 * `.ref-*` is gallery chrome and `.es-*` is a shipped component. Chrome inside a component is
 * always a splice in the wrong place — and it is also what an agent copies by mistake, which is
 * how `<span class="ref-label">Suggestions</span>` nearly shipped as part of QuickSuggest.
 * ---------------------------------------------------------------------- */
{
  const SCAFFOLD = /^ref-(label|stage|row|col|sub|h|derived|note|anchor|grouphead)$/;
  let nested = 0;
  for (const f of htmlFiles(REF)) {
    const html = fs.readFileSync(f, "utf8");
    const rel = path.relative(REF, f);
    const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "use", "path", "source", "col"]);
    const stack = [];
    for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|[^">])*)>/g)) {
      const [, close, tag, attrs] = m;
      const name = tag.toLowerCase();
      if (VOID.has(name) || /\/\s*$/.test(attrs)) continue;
      if (close) {
        for (let i = stack.length - 1; i >= 0; i--)
          if (stack[i].name === name) { stack.length = i; break; }
        continue;
      }
      const cls = (attrs.match(/\sclass="([^"]*)"/) || [, ""])[1].split(/\s+/).filter(Boolean);
      if (cls.some((c) => SCAFFOLD.test(c))) {
        const inside = stack.filter((e) => e.cls.some((c) => /^es-/.test(c)));
        if (inside.length) {
          const where = inside.map((e) => "." + e.cls.find((c) => /^es-/.test(c))).join(" < ");
          const what = cls.find((c) => SCAFFOLD.test(c));
          console.log(`  \u274c ${rel}: <${name} class="${what}"> sits inside ${where}` +
            `  \u2014 spliced into the previous specimen instead of beside it`);
          nested++;
        }
      }
      stack.push({ name, cls });
    }
  }
  if (nested) {
    violations += nested;
    console.log(`\u274c ${nested} misplaced scaffolding node(s).`);
  } else {
    console.log("\u2705 no gallery scaffolding is nested inside a component specimen");
  }
}


/* ------------------------------------------------------------------------
 * GATE 14 — the document as a whole must balance, not only its showcases.
 *
 * GATE 11 balances `<div>` inside each `<section class="ref-section">`. The gallery still
 * carried SIX `</div>` after `</main>`, left behind by the v3.4.5 regroup splice, closing
 * nothing. A browser drops an unmatched close tag in silence, so the page looked right and
 * nobody editing the file could tell what those tags belonged to.
 * ---------------------------------------------------------------------- */
{
  let unbalanced = 0;
  for (const f of htmlFiles(REF)) {
    const html = fs.readFileSync(f, "utf8");
    const open = (html.match(/<div\b/g) || []).length;
    const close = (html.match(/<\/div>/g) || []).length;
    if (open === close) continue;
    const rel = path.relative(REF, f);
    console.log(`  \u274c ${rel}: ${open} <div> against ${close} </div>` +
      ` \u2014 ${close > open ? (close - open) + " close tag(s) belong to nothing" : (open - close) + " element(s) never close"}`);
    unbalanced++;
  }
  if (unbalanced) {
    violations += unbalanced;
    console.log(`\u274c ${unbalanced} unbalanced document(s).`);
  } else {
    console.log("\u2705 every reference document balances every <div> it opens");
  }
}

/* ------------------------------------------------------------------------
 * GATE 15 — reference/ states its version in exactly one place.
 *
 * `stamp-reference.js` rewrites every `REF vX.Y.Z · generated …` line from version.json, which
 * is what makes HISTORY.md law #2 — no visual verdict unless the on-screen stamp matches the
 * shipped build — enforceable at all. Eleven files in reference/pages/ also carried the version
 * in their <title>, where nothing rewrote it: they read `E-Systems DS v3.4.2` while the stamp
 * beside them read v3.5.1. Two version claims, one maintained.
 *
 * A second copy of a fact is a second thing to keep true. There is now one.
 * ---------------------------------------------------------------------- */
{
  const meta = JSON.parse(fs.readFileSync(path.join(DS_ROOT, "version.json"), "utf8"));
  const stamp = new RegExp("REF v" + meta.version.replace(/\./g, "\\.") + " \u00b7 generated ");
  let stray = 0;
  for (const f of htmlFiles(REF)) {
    const rel = path.relative(REF, f);
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (stamp.test(line)) return;
      const m = line.match(/\bv\d+\.\d+\.\d+\b/);
      if (!m) return;
      console.log(`  \u274c ${rel}:${i + 1} states ${m[0]} outside the REF stamp \u2014 nothing rewrites it, so it will go stale`);
      stray++;
    });
  }
  if (stray) {
    violations += stray;
    console.log(`\u274c ${stray} unmaintained version claim(s) in reference/.`);
  } else {
    console.log("\u2705 reference/ claims a version only through the single-sourced REF stamp");
  }
}

if (violations) {
  console.log(`\n${violations} reference-tier violation(s). The reference must be token-pure, load every font it names, and draw every icon from the Tabler sprite.`);
  process.exit(1);
}
console.log("\u2705 reference/css is token-pure (no hardcoded hex/rgb).");
