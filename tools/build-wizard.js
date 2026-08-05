#!/usr/bin/env node
/* build-wizard.js — bundle tools/dashboard/* into the single-file tools/ds-setup.cjs
 *
 * The DELIVERED product stays exactly one zero-dependency file (non-negotiable #2).
 * Only authoring changes: the UI is written as real HTML/CSS/JS with editor support,
 * and this script inlines everything — including the fonts as base64, so the panel
 * never touches the network.
 *
 *   node tools/build-wizard.js            build
 *   node tools/build-wizard.js --check    fail if the committed output is stale (CI)
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..");
const D = path.join(DS, "tools", "dashboard");
const SERVER = path.join(DS, "tools", "wizard-server.js");
const OUT = path.join(DS, "tools", "ds-setup.cjs");
const CHECK = process.argv.includes("--check");

const meta = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8"));
const read = (f) => fs.readFileSync(path.join(D, f), "utf8");

/* ---- fonts -> base64 @font-face ---- */
function fontFace(family, file, extra) {
  const b64 = fs.readFileSync(path.join(D, "fonts", file)).toString("base64");
  return `@font-face{font-family:"${family}";font-style:normal;font-display:swap;${extra}` +
         `src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
}
const fonts = [
  "/* Fustat — SIL Open Font License 1.1 — the design system's own primary typeface */",
  fontFace("Fustat", "fustat-latin-wght-normal.woff2", "font-weight:200 800;"),
  "/* DM Mono — SIL Open Font License 1.1 */",
  fontFace("DM Mono", "dm-mono-latin-400-normal.woff2", "font-weight:400;"),
].join("\n");

/* ---- assemble the UI document ---- */
/* The bundle is a build artifact, so its CSS is squeezed. The authored source
   in tools/dashboard/app.css keeps every comment - that is what maintainers read.
   Only comments and dead whitespace go; no selector or value rewriting, and the
   base64 font payload is substituted AFTER minification so it is never touched. */
function minifyCss(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")          // comments
    .replace(/[ \t]+/g, " ")                     // runs of spaces
    .replace(/ *([{}:;,>~]) */g, "$1")           // space around punctuation
    .replace(/;\}/g, "}")                        // trailing semicolons
    .replace(/\n\s*/g, "\n")                     // leading indentation
    .replace(/\n{2,}/g, "\n")                    // blank lines
    .trim();
}
/* The font placeholder is a CSS comment, and minifyCss removes comments - so it
   is swapped for a non-comment sentinel BEFORE minifying and substituted after.
   Getting this wrong silently produced a bundle with no @font-face at all, which
   is why buildGuard below now proves the payload landed. */
let css = minifyCss(read("app.css").replace("/* @FONTS@ */", "@@FONTS_SENTINEL@@"))
  .replace("@@FONTS_SENTINEL@@", fonts);
if (css.indexOf("@@FONTS_SENTINEL@@") >= 0) { console.error("build-wizard: font sentinel survived substitution"); process.exit(1); }
/* The dictionary is authored pretty-printed for reviewable diffs; the bundle gets
   it compact. JSON.parse also validates it, so a malformed dictionary fails the
   build rather than producing a panel that renders raw key names. */
const dictRaw = read("i18n.json");
let dict;
try { dict = JSON.parse(dictRaw); }
catch (e) { console.error("build-wizard: i18n.json is not valid JSON - " + e.message); process.exit(1); }
const dictKeys = Object.keys(dict.id || {});
const dictMissing = dictKeys.filter((k) => !(dict.en || {})[k]);
const dictExtra = Object.keys(dict.en || {}).filter((k) => !(dict.id || {})[k]);
if (dictMissing.length || dictExtra.length) {
  console.error("build-wizard: the ID and EN dictionaries disagree");
  if (dictMissing.length) console.error("  missing from en: " + dictMissing.join(", "));
  if (dictExtra.length) console.error("  missing from id: " + dictExtra.join(", "));
  process.exit(1);
}
let js = read("app.js").replace("/* @I18N@ */ {}", JSON.stringify(dict));
const icons = read("icons.svg").trim();

let html = read("index.html")
  .replace("/* @CSS@ */", () => css)
  .replace("<!-- @ICONS@ -->", () => icons)
  .replace("/* @JS@ */", () => js);

/* sanity: no placeholder survived, no network reference sneaked in */
for (const bad of ["@CSS@", "@JS@", "@ICONS@", "@FONTS@", "@I18N@"]) {
  if (html.includes(bad)) { console.error(`build-wizard: placeholder ${bad} was not replaced`); process.exit(1); }
}
for (const net of ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr", "unpkg.com", "cdnjs."]) {
  if (html.includes(net)) { console.error(`build-wizard: external reference "${net}" is not allowed — the panel must work offline`); process.exit(1); }
}

/* ---- bundle ---- */
/* The dashboard CSS has been minified since v2.x, but the server source went into the bundle
   verbatim — comments and all. Comments are for the maintainer reading tools/wizard-server.js,
   not for the single-file artifact a developer downloads; the source keeps every one of them.
   This strips WHOLE-LINE comments only: no expression rewriting, no touching a line that also
   holds code, and it refuses to run inside a template literal. If the result does not parse,
   the original is used unchanged — a smaller bundle is never worth a broken one. */
function stripWholeLineComments(src) {
  const lines = src.split("\n");
  const out = [];
  let inBlock = false, inTemplate = false;
  for (const line of lines) {
    const t = line.trim();
    if (inTemplate) { out.push(line); if ((line.match(/(?<!\\)`/g) || []).length % 2 === 1) inTemplate = false; continue; }
    if (inBlock) { if (t.endsWith("*/")) inBlock = false; continue; }
    if (t.startsWith("/*")) { if (!t.endsWith("*/")) inBlock = true; continue; }
    if (t.startsWith("//")) continue;
    if ((line.match(/(?<!\\)`/g) || []).length % 2 === 1) inTemplate = true;
    out.push(line);
  }
  const stripped = out.join("\n").replace(/\n{3,}/g, "\n\n");
  try { new Function(stripped.replace(/\/\* @WIZARD_VERSION@ \*\//, "0").replace(/\/\* @DS_VERSION@ \*\//, '"0"')); }
  catch (e) { console.log("  (comment strip skipped: " + e.message + ")"); return src; }
  return stripped;
}
const server = stripWholeLineComments(fs.readFileSync(SERVER, "utf8"));
const banner =
`#!/usr/bin/env node
/* =====================================================================
   E-Systems Design System — Panel  (single file, zero dependencies)
   =====================================================================
   GENERATED by tools/build-wizard.js from tools/dashboard/ + tools/wizard-server.js.
   Do not edit this file by hand — edit the sources and re-run the build.

   USE
     1. Copy this file into the ROOT of your frontend repo.
     2. node ds-setup.cjs
     3. Your browser opens the panel. Review the plan, then Process.

   PROMISES
     - Plan-first: every command and file change is shown BEFORE it runs.
     - Marked: everything written is wrapped in design-system markers.
     - Reversible: an install receipt (.ds/manifest.json) drives an exact revert.
     - Recoverable: nothing is deleted, only moved to .ds/.trash/.
     - Offline: fonts and icons are embedded. It never phones home.
     - Local: binds to 127.0.0.1 only.

   Embedded fonts: Fustat & DM Mono, SIL Open Font License 1.1.
   Embedded icons: Lucide, ISC License.

   Panel v${meta.wizardVersion}  \u00b7  built for design system v${meta.version}
   ===================================================================== */
`;

const body = server
  .replace("/* @WIZARD_VERSION@ */", JSON.stringify(meta.wizardVersion))
  .replace("/* @DS_VERSION@ */", JSON.stringify(meta.version))
  .replace('"@@PAYLOAD_CLAUDE@@"', JSON.stringify(fs.readFileSync(path.join(DS, "tools", "payloads", "CLAUDE.md"), "utf8")))
  .replace('"@@PAYLOAD_BINDINGS@@"', JSON.stringify(fs.readFileSync(path.join(DS, "tools", "payloads", "bindings.md"), "utf8")))
  .replace('"/* @UI_HTML@ */"', JSON.stringify(html));

for (const bad of ["@@PAYLOAD_CLAUDE@@", "@@PAYLOAD_BINDINGS@@", "@WIZARD_VERSION@", "@UI_HTML@"]) {
  if (body.includes(bad)) { console.error(`build-wizard: placeholder ${bad} was not replaced`); process.exit(1); }
}

const outText = banner + body;

/* Prove the embedded payloads survived every transform. A missing placeholder is
   caught above; this catches a placeholder that was REMOVED rather than left
   behind - the failure mode that shipped a fontless bundle once. */
(function buildGuard() {
  /* Inspect the assembled UI document, not the JSON-escaped copy embedded in the
     CommonJS wrapper - inside that, quotes are backslash-escaped. */
  const out = html;
  const faces = (out.match(/@font-face/g) || []).length;
  const problems = [];
  if (faces < 2) problems.push("expected 2 @font-face rules, found " + faces);
  if (!/url\(data:font\/woff2;base64,[A-Za-z0-9+/=]{500,}\)/.test(out)) problems.push("no embedded woff2 payload found");
  for (const fam of ["Fustat", "DM Mono"]) {
    if (!new RegExp('@font-face[^}]*font-family:\\s*"' + fam + '"').test(out)) problems.push("no @font-face for " + fam);
  }
  if (!/<symbol id="i-/.test(out)) problems.push("icon sprite missing");
  if (out.indexOf('"nav.home"') < 0) problems.push("i18n dictionary missing");
  if (outText.indexOf("@font-face") < 0) problems.push("bundle wrapper lost the stylesheet");
  if (problems.length) {
    console.error("\nbuild-wizard: the bundle is incomplete:");
    problems.forEach((p) => console.error("  - " + p));
    process.exit(1);
  }
})();


if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== outText) {
    console.error("\u274c tools/ds-setup.cjs is stale. Run: node tools/build-wizard.js");
    process.exit(1);
  }
  console.log("\u2705 tools/ds-setup.cjs is up to date");
  process.exit(0);
}

fs.writeFileSync(OUT, outText, "utf8");
fs.chmodSync(OUT, 0o755);

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`build-wizard: tools/ds-setup.cjs \u2192 ${kb(outText.length)}`);
console.log(`  ui ${kb(html.length)} \u00b7 css ${kb(css.length)} \u00b7 js ${kb(js.length)} \u00b7 icons ${kb(icons.length)} \u00b7 fonts ${kb(fonts.length)}`);
