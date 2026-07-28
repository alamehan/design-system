#!/usr/bin/env node
/* make-preview.js — extract the REAL shipped UI and make it openable offline.
 *
 *   node tools/make-preview.js [outfile]
 *
 * The panel normally needs a git repo and a running server. This takes the exact
 * HTML that ships inside tools/ds-setup.cjs and stubs window.fetch with a
 * realistic snapshot, so the author can inspect the actual UI in a browser —
 * fonts, hover states, the pill navigation, markdown rendering and the tour —
 * without installing anything.
 *
 * This is NOT a mockup. The HTML, CSS and JS are byte-for-byte what developers
 * receive; only the data is canned. That distinction matters: HISTORY.md law #1
 * says a programmatic check is never a visual verdict, so the visual verdict has
 * to be given against the real artifact.
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..");
const out = process.argv[2] || path.join(DS, "panel-preview.html");
const meta = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8"));
const bundle = fs.readFileSync(path.join(DS, "tools", "ds-setup.cjs"), "utf8");

/* pull the UI document straight out of the shipped bundle */
const m = bundle.match(/const UI_HTML = ("(?:[^"\\]|\\.)*");/);
if (!m) { console.error("make-preview: could not find UI_HTML in tools/ds-setup.cjs"); process.exit(1); }
const html = JSON.parse(m[1]);

const changelog = fs.readFileSync(path.join(DS, "CHANGELOG.md"), "utf8")
  .split("\n").slice(0, 34).join("\n");

const STATE = {
  wizardVersion: meta.wizardVersion,
  builtForDs: meta.version,
  root: "/Users/you/work/portal-nuxt",
  isGit: true,
  defaultRepoUrl: "https://git.example.co/design/design-system.git",
  originUrl: "https://git.example.co/design/design-system.git",
  maintainerEmail: "raihan@its-elabram.example",
  maintainer: { name: "Raihan Allaam", email: "raihan@its-elabram.example", role: "UI/UX Designer, ITS Elabram" },
  subRegistered: true, subPopulated: true, subCommit: "a1b2c3d", level: "0",
  level1tw: false, level1css: false, halfWired: false,
  nuxtConfig: "nuxt.config.js", hasTailwindConfig: true,
  files: { "CLAUDE.md": true, ".ds/bindings.md": true },
  dirty: false,
  legacy: { found: false, items: [], confirmPhrase: "HAPUS DS LAMA" },
  manifest: {
    schema: "ds-manifest-v1", adoptionId: "preview", wizardVersion: meta.wizardVersion,
    installedAt: "2026-07-20T09:12:00.000Z", updatedAt: "2026-07-28T04:00:00.000Z",
    level: "0", dsVersion: meta.version, dsCommit: "a1b2c3d",
    managed: [
      { path: ".ds/bindings.md", mode: "file", klass: "living", sha256: "9f2c…" },
      { path: ".gitattributes", mode: "gitblock", klass: "contract", sha256: "4b71…" },
      { path: ".gitignore", mode: "gitblock", klass: "contract", sha256: "c08e…" },
      { path: "CLAUDE.md", mode: "block", klass: "contract", sha256: "1d5a…" },
    ],
  },
  unmanaged: false,
  /* one living drift, so the attention card and its actions are visible */
  drift: [{ path: ".ds/bindings.md", mode: "file", klass: "living", state: "modified" }],
  history: [
    { at: "2026-07-28T04:00:00.000Z", event: "update", level: "0", dsCommit: "a1b2c3d" },
    { at: "2026-07-24T11:30:00.000Z", event: "change-request", file: ".ds/bindings.md" },
    { at: "2026-07-20T09:12:00.000Z", event: "install", level: "0", dsCommit: "77f0e21" },
  ],
  rollback: { fromCommit: "77f0e21", at: "2026-07-28T03:58:00.000Z", wizard: meta.wizardVersion },
  panelLatest: meta.wizardVersion, panelOutdated: false,
  prompts: [],
  locked: { install: false, revert: false, update: false, rollback: false, legacy: false, panel: false },
};

const OVERVIEW = {
  installed: true, version: meta.version,
  tokenCount: 185, pages: 12, specs: 76, reference: 27, catalog: 76,
  typeface: "Fustat \u00b7 DM Mono",
  icons: "Tabler 272 + 100 ext \u00b7 Custom 94",
  commit: "a1b2c3d \u00b7 28 Jul 2026",
  changelogHead: changelog,
  hasGallery: true,
  docs: ["README.md", "docs/ARCHITECTURE.md", "SAFETY.id.md", "SAFETY.en.md", "TUTORIAL.id.md",
         "TUTORIAL.en.md", "SETUP.md", "CHANGELOG.md", "STORY.md", "HISTORY.md", "CLAUDE.md"],
};

const banner = `
<div id="pv-banner" style="position:fixed;top:0;left:0;right:0;z-index:100;background:#1f2937;color:#f9fafb;
  font:600 12px/1.4 Fustat,system-ui,sans-serif;padding:9px 16px;display:flex;gap:10px;align-items:center;
  box-shadow:0 1px 6px rgba(0,0,0,.25)">
  <span style="background:#f59e0b;color:#111827;border-radius:100px;padding:1px 8px;font-size:10.5px;letter-spacing:.05em">PREVIEW</span>
  <span>Real panel v${meta.wizardVersion} UI \u2014 canned data, no server. Hover the blue buttons, switch ID/EN, open \u22ef \u2192 Play tour.</span>
  <button onclick="document.getElementById('pv-banner').remove()"
    style="margin-left:auto;background:none;border:1px solid #4b5563;color:#d1d5db;border-radius:5px;
    padding:2px 9px;font:inherit;cursor:pointer">dismiss</button>
</div>
<style>body{padding-top:38px}</style>
`;

const stub = `
<script>
/* ---- offline stub: same shapes the real server returns ---- */
(function () {
  var STATE = ${JSON.stringify(STATE)};
  var OVERVIEW = ${JSON.stringify(OVERVIEW)};
  var T = function (id, en) { return { id: id, en: en }; };
  var PLAN = {
    steps: [
      { title: T("Submodule sudah ada", "Submodule already present"), skip: true },
      { title: T("Pastikan URL repo berisi design system yang benar", "Verify the URL really holds this design system") },
      { title: T("Tambahkan bagian design-system di AKHIR CLAUDE.md kamu, di antara marker", "Append the design-system section to the END of your CLAUDE.md, between markers"), append: "CLAUDE.md" },
      { title: T("Buat .ds/bindings.md (peta komponen)", "Create .ds/bindings.md (component map)"), write: ".ds/bindings.md" },
      { title: T("Tambahkan bagian design-system di akhir .gitignore", "Append the design-system section to .gitignore"), append: ".gitignore" },
      { title: T("Buat .gitattributes", "Create .gitattributes"), write: ".gitattributes" },
      { title: T("Tulis struk pemasangan (.ds/manifest.json)", "Write the install receipt (.ds/manifest.json)") },
      { title: T("Verifikasi dengan doctor (read-only)", "Verify with doctor (read-only)") }
    ],
    notTouched: [
      T("Komponen, halaman, style dan kode bisnis kamu", "Your components, pages, styles and business code"),
      T("Build & runtime kamu (Level 0)", "Your build & runtime (Level 0)"),
      T("Riwayat git kamu", "Your git history")
    ]
  };
  var DIFF = "@@ \\u2026\\n  | atom-04 Button | \`<GlobalsUiButton>\` | ok |\\n- | atom-09 Chip | \`<GlobalsUiChipStatus>\` | drift |\\n+ | atom-09 Chip | \`<GlobalsUiChipStatus>\` | ok |\\n+ | atom-99 Thing | \`<GlobalsUiThing>\` | ok |\\n@@ \\u2026";
  var R = {
    "/api/state": STATE,
    "/api/overview": OVERVIEW,
    "/api/progress": { active: false, current: 0, total: 0, label: T("", "") },
    "/api/plan": PLAN,
    "/api/revert-plan": { steps: PLAN.steps.slice(2), notTouched: PLAN.notTouched, remains: [T(".ds/.trash/ tetap ada", ".ds/.trash/ is kept")] },
    "/api/restore-plan": { steps: [{ title: T("Salin versi kamu ke .ds/.trash/", "Copy your version to .ds/.trash/") }, { title: T("Kembalikan ke template", "Restore to the template") }] },
    "/api/rollback-plan": { steps: [{ title: T("Kembalikan design system ke 77f0e21", "Return the design system to 77f0e21") }] },
    "/api/update-plan": { steps: [{ title: T("Catat titik rollback", "Record a rollback point") }, { title: T("Tarik versi terbaru", "Pull the latest version") }] },
    "/api/remote-plan": { steps: [{ title: T("Arahkan submodule ke URL baru", "Point the submodule at the new URL") }] },
    "/api/panel-update-plan": { error: T("Panel sudah versi terbaru.", "The panel is already up to date.") },
    "/api/adopt-plan": { error: T("Repo ini sudah punya struk.", "This repo already has a receipt.") },
    "/api/diff": { diff: DIFF, wizardVersion: STATE.wizardVersion },
    "/api/impact": { fromVersion: "3.3.0", toVersion: "3.4.0", bump: "minor", tokensAdded: 6, tokensRemoved: ["--color-brand-legacy"], specsAdded: 2, specsRemoved: [], affected: [{ file: "pages/index.vue", hits: 3 }, { file: "components/globals/ui/button/index.vue", hits: 1 }] },
    "/api/check-update": { upToDate: true, behind: 0, newCommits: [] },
    "/api/doctor": { ok: true, output: "E-Systems DS doctor \\u2014 read-only diagnosis\\n" + "\\u2500".repeat(50) + "\\n\\u2705 [ds-integrity] design-system folder complete\\n\\u2705 [consumer] Consumer project detected\\n\\u2705 [adoption] Level 0 \\u2014 reference-only (zero wiring; valid and safe)\\n\\u2705 [bindings-paths] 18 component paths in bindings map all exist\\n\\u2705 [bindings-tokens] 5 color utilities in bindings map resolve\\n\\u2139\\ufe0f  [bindings-version] bindings map written against design system v" + STATE.builtForDs + "\\n\\u2705 [submodule] design-system registered in .gitmodules\\n" + "\\u2500".repeat(50) + "\\nNo problems found. Nothing was modified." },
    "/api/payload": { content: "# Example payload\\n\\nThe real panel shows the exact bytes it is about to write here." },
    "/api/change-request": { savedTo: ".ds/requests/CR-2026-07-28-bindings.md", body: "# Design system change request\\n\\n(preview)", mailto: null },
    "/api/shutdown": { ok: true }
  };

  var realFetch = window.fetch;
  window.fetch = function (url, opt) {
    var p = String(url).split("?")[0];
    if (p.indexOf("/ds/") === 0) {
      return Promise.resolve(new Response(
        "# " + decodeURIComponent(p.slice(4)) + "\\n\\nThis document is served from the installed design system.\\n\\n" +
        "In the preview there is no submodule on disk, so only this placeholder is returned.\\n\\n" +
        "| Column | Meaning |\\n|---|---|\\n| Preview | canned data |\\n| Real panel | the actual file |\\n",
        { status: 200, headers: { "Content-Type": "text/plain" } }));
    }
    if (Object.prototype.hasOwnProperty.call(R, p)) {
      return Promise.resolve(new Response(JSON.stringify(R[p]), { status: 200, headers: { "Content-Type": "application/json" } }));
    }
    if (p.indexOf("/api/") === 0) {
      return Promise.resolve(new Response(JSON.stringify({ ok: true, log: [{ title: T("Langkah contoh", "Example step"), ok: true, output: "done" }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }));
    }
    return realFetch.apply(this, arguments);
  };
  /* always play the tour in the preview */
  try { localStorage.removeItem("dsTourSeen"); } catch (e) {}
})();
</script>
`;

let doc = html.replace("<body>", "<body>" + banner);
doc = doc.replace(/<script>/, stub + "<script>");

fs.writeFileSync(out, doc, "utf8");
console.log(`make-preview: ${path.relative(process.cwd(), out)} \u2192 ${(doc.length / 1024).toFixed(0)} KB`);
console.log("  real shipped UI, canned data, opens straight in a browser (no server, no repo)");
