"use strict";
const http = require("http");
const { execSync, exec } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const WIZARD_VERSION = /* @WIZARD_VERSION@ */;
const BUILT_FOR_DS = /* @DS_VERSION@ */;

/* ---------------------------------------------------------------- config */
const SUBMODULE_DIR = "design-system";
const DS_DIR_LOCAL = ".ds";
const MANIFEST = ".ds/manifest.json";
const HISTORY = ".ds/history.jsonl";
const ROLLBACK = ".ds/rollback-point.json";
const TRASH = ".ds/.trash";
const REQUESTS = ".ds/requests";
const FALLBACK_REPO_URL = "https://github.com/alamehan/design-system.git";
const LEVEL1_ACCESS_CODE = process.env.DS_L1_CODE || "DSV3-RAIHAN";

let LOCKED = { install: false, revert: false, update: false, rollback: false, legacy: false, panel: false };
let PROGRESS = { active: false, current: 0, total: 0, label: { id: "", en: "" } };

/* bilingual helper — every user-visible server string is a {id,en} pair */
const T = (id, en) => ({ id, en: en || id });

/* ------------------------------------------------------------- markers */
const MD_BEGIN = "<!-- design-system:begin (managed by the Design System panel - do not edit inside) -->";
const MD_END = "<!-- design-system:end -->";
const LINE_MARK = "/* design-system:managed */";
/* .gitignore and .gitattributes have no comment syntax other than #, so the
   same begin/end contract is expressed with hash comments. */
const HASH_BEGIN = "# design-system:begin (managed by the Design System panel - do not edit inside)";
const HASH_END = "# design-system:end";

/* --------------------------------------------------------------- shell */
function sh(cmd, opts) {
  const o = Object.assign({ cwd: ROOT, encoding: "utf8", stdio: "pipe", maxBuffer: 16 * 1024 * 1024 }, opts || {});
  try { return { ok: true, out: String(execSync(cmd, o) || "").trim() }; }
  catch (e) {
    const out = [e.stdout, e.stderr, e.message].filter(Boolean).map(String).join("\n").trim();
    return { ok: false, out };
  }
}

const SCRIPT_DIR = path.dirname(path.resolve(__filename));
let ROOT = SCRIPT_DIR;
(function () { const r = sh("git rev-parse --show-toplevel", { cwd: SCRIPT_DIR }); if (r.ok && r.out) ROOT = r.out.split("\n")[0].trim(); })();

const abs = (p) => path.join(ROOT, p);
function readIf(p) { try { return fs.readFileSync(abs(p), "utf8"); } catch { return null; } }
function writeFile(p, text) { fs.mkdirSync(path.dirname(abs(p)), { recursive: true }); fs.writeFileSync(abs(p), text, "utf8"); }
function existsNonEmptyDir(p) { try { return fs.statSync(abs(p)).isDirectory() && fs.readdirSync(abs(p)).length > 0; } catch { return false; } }
const sha = (s) => crypto.createHash("sha256").update(s == null ? "" : s, "utf8").digest("hex");

/* move to trash instead of deleting — nothing is ever destroyed */
function toTrash(rel) {
  const src = abs(rel);
  if (!fs.existsSync(src)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = abs(path.join(TRASH, rel.replace(/[\\/]/g, "__") + "." + stamp));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  return path.relative(ROOT, dest).split(path.sep).join("/");
}

/* --------------------------------------------------------------- payloads */
const PAYLOADS = {
  "CLAUDE.md": "@@PAYLOAD_CLAUDE@@",
  ".ds/bindings.md": "@@PAYLOAD_BINDINGS@@",
};

/* Git housekeeping the panel owns, each as a marked block appended to whatever
   the repo already has.
   .ds/ is deliberately NOT ignored wholesale: manifest.json, bindings.md,
   history.jsonl and requests/ are team knowledge and the basis of the adoption
   report, so they must be committed. Only machine-local recovery state is
   ignored. history.jsonl is append-only, so merge=union lets two developers
   install in parallel without a conflict. */
const GIT_BLOCKS = {
  ".gitignore": [
    "# Local recovery state and machine-local panel state.",
    "# Everything else under .ds/ is committed on purpose - see SAFETY.md.",
    ".ds/.trash/",
    ".ds/rollback-point.json",
    "",
    "# The panel is a build artifact of the design system; fetch it, do not commit it.",
    "ds-setup.cjs",
  ].join("\n"),
  ".gitattributes": [
    "# .ds/history.jsonl is append-only, so a union merge is always correct",
    "# and two developers installing in parallel never conflict.",
    ".ds/history.jsonl merge=union",
  ].join("\n"),
};

function hashBlock(rel) { return HASH_BEGIN + "\n" + GIT_BLOCKS[rel].trim() + "\n" + HASH_END + "\n"; }
function extractHashBlock(src) {
  if (src == null) return null;
  const i = src.indexOf(HASH_BEGIN), j = src.indexOf(HASH_END);
  if (i < 0 || j < 0) return null;
  return src.slice(i, j + HASH_END.length);
}
function stripHashBlock(src) {
  const i = src.indexOf(HASH_BEGIN), j = src.indexOf(HASH_END);
  if (i < 0 || j < 0) return src;
  return (src.slice(0, i) + src.slice(j + HASH_END.length)).replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
}

function markedBlock(rel) { return MD_BEGIN + "\n\n" + PAYLOADS[rel].trim() + "\n\n" + MD_END + "\n"; }
function extractBlock(src) {
  if (src == null) return null;
  const i = src.indexOf(MD_BEGIN), j = src.indexOf(MD_END);
  if (i < 0 || j < 0) return null;
  return src.slice(i, j + MD_END.length);
}
function stripBlock(src) {
  const i = src.indexOf(MD_BEGIN), j = src.indexOf(MD_END);
  if (i < 0 || j < 0) return src;
  return (src.slice(0, i) + src.slice(j + MD_END.length)).replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
}

/* --------------------------------------------------------- config lines */
const PRESET_LINE = '  presets: [require("./design-system/dist/tailwind.preset.js")], ' + LINE_MARK;
const CSS_LINE = '    "~/design-system/dist/variables.css", ' + LINE_MARK;

function nuxtConfigName() {
  if (readIf("nuxt.config.js") != null) return "nuxt.config.js";
  if (readIf("nuxt.config.ts") != null) return "nuxt.config.ts";
  return "nuxt.config.js";
}
function planTailwindEdit(src) {
  if (src == null) return { manual: T("tailwind.config.js tidak ditemukan — tambahkan preset manual (lihat SETUP.md).", "tailwind.config.js not found — add the preset manually (see SETUP.md).") };
  if (src.includes("design-system/dist/tailwind.preset")) return { already: true };
  if (/presets\s*:/.test(src)) return { manual: T('tailwind.config.js sudah punya array "presets:" — tambahkan require("./design-system/dist/tailwind.preset.js") secara manual.', 'tailwind.config.js already has a "presets:" array — add require("./design-system/dist/tailwind.preset.js") into it manually.') };
  const m = src.match(/module\.exports\s*=\s*\{/);
  if (!m) return { manual: T('Tidak menemukan "module.exports = {" di tailwind.config.js.', 'Could not find "module.exports = {" in tailwind.config.js.') };
  const i = m.index + m[0].length;
  return { changed: true, out: src.slice(0, i) + "\n" + PRESET_LINE + src.slice(i) };
}
function planNuxtEdit(src, name) {
  if (src == null) return { manual: T("nuxt.config tidak ditemukan — tambahkan variables.css ke array css secara manual.", "nuxt.config not found — add variables.css to the css array manually.") };
  if (src.includes("design-system/dist/variables.css")) return { already: true };
  const m = src.match(/css\s*:\s*\[/);
  if (!m) return { manual: T('Tidak menemukan "css: [" di ' + name + ".", 'Could not find "css: [" in ' + name + ".") };
  const i = m.index + m[0].length;
  return { changed: true, out: src.slice(0, i) + "\n" + CSS_LINE + src.slice(i) };
}
/* marker-first removal, with a content fallback for pre-marker installs */
function removeManagedLine(src, kind) {
  if (src == null) return null;
  const lines = src.split("\n");
  const needle = kind === "tw" ? "design-system/dist/tailwind.preset" : "design-system/dist/variables.css";
  const keep = lines.filter((l) => !(l.includes(LINE_MARK) && l.includes(needle)));
  if (keep.length !== lines.length) return keep.join("\n");
  return lines.filter((l) => !l.includes(needle)).join("\n");
}
function managedLineOf(src, kind) {
  if (src == null) return null;
  const needle = kind === "tw" ? "design-system/dist/tailwind.preset" : "design-system/dist/variables.css";
  return src.split("\n").filter((l) => l.includes(needle))[0] || null;
}

/* ---------------------------------------------------------- ds metadata */
function dsMeta() {
  try { return JSON.parse(fs.readFileSync(abs(path.join(SUBMODULE_DIR, "ds-meta.json")), "utf8")); } catch { return {}; }
}
function maintainerEmail() { return process.env.DS_DESIGNER_EMAIL || (dsMeta().maintainer || {}).email || null; }

function defaultRepoUrl() {
  if (process.env.DS_REPO_URL) return process.env.DS_REPO_URL;
  try { const rc = JSON.parse(readIf(".dsrc.json") || "{}"); if (rc.repoUrl) return rc.repoUrl; } catch {}
  return FALLBACK_REPO_URL;
}
function originUrl() {
  const r = sh('git -C "' + abs(SUBMODULE_DIR) + '" remote get-url origin');
  return r.ok ? r.out.trim() : null;
}

/* ------------------------------------------------------------- manifest */
function loadManifest() { try { return JSON.parse(readIf(MANIFEST)); } catch { return null; } }
function saveManifest(m) {
  m.managed.sort((a, b) => a.path.localeCompare(b.path));
  writeFile(MANIFEST, JSON.stringify(m, null, 2) + "\n");
}
function appendHistory(entry) {
  const line = JSON.stringify(Object.assign({ at: new Date().toISOString(), wizard: WIZARD_VERSION }, entry));
  fs.mkdirSync(abs(DS_DIR_LOCAL), { recursive: true });
  fs.appendFileSync(abs(HISTORY), line + "\n", "utf8");
  telemetry(entry);
}
function loadHistory() {
  const raw = readIf(HISTORY); if (!raw) return [];
  return raw.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
}
/* stable, non-identifying actor id so the adoption report can count distinct devs */
function actorId() {
  if (process.env.DS_NO_ACTOR) return "anon";
  const r = sh("git config user.email");
  if (!r.ok || !r.out) return "anon";
  return sha(r.out.trim().toLowerCase()).slice(0, 12);
}

/* current managed-region content for a given entry */
function currentRegion(entry) {
  const src = readIf(entry.path);
  if (src == null) return null;
  if (entry.mode === "file") return src;
  if (entry.mode === "block") return extractBlock(src);
  if (entry.mode === "gitblock") return extractHashBlock(src);
  if (entry.mode === "line") return managedLineOf(src, entry.kind);
  return null;
}
function pristineRegion(entry) {
  if (entry.mode === "file") return PAYLOADS[entry.path];
  if (entry.mode === "block") return markedBlock(entry.path);
  if (entry.mode === "gitblock") return hashBlock(entry.path);
  if (entry.mode === "line") return entry.kind === "tw" ? PRESET_LINE : CSS_LINE;
  return null;
}

function detectDrift() {
  const m = loadManifest(); if (!m) return [];
  const out = [];
  for (const e of m.managed) {
    const cur = currentRegion(e);
    if (cur == null) { out.push({ path: e.path, mode: e.mode, klass: e.klass, state: "missing" }); continue; }
    if (sha(cur) !== e.sha256) out.push({ path: e.path, mode: e.mode, klass: e.klass, state: "modified" });
  }
  return out;
}

/* build the managed[] list by inspecting the repo as it is right now */
function surveyManaged() {
  const managed = [];
  const claude = readIf("CLAUDE.md");
  const blk = extractBlock(claude);
  if (blk != null) managed.push({ path: "CLAUDE.md", mode: "block", klass: "contract", sha256: sha(blk), bytes: blk.length });
  const bind = readIf(".ds/bindings.md");
  if (bind != null) managed.push({ path: ".ds/bindings.md", mode: "file", klass: "living", sha256: sha(bind), bytes: bind.length });
  const tw = managedLineOf(readIf("tailwind.config.js"), "tw");
  if (tw) managed.push({ path: "tailwind.config.js", mode: "line", kind: "tw", klass: "contract", sha256: sha(tw), marker: LINE_MARK });
  const nx = nuxtConfigName();
  const css = managedLineOf(readIf(nx), "css");
  if (css) managed.push({ path: nx, mode: "line", kind: "css", klass: "contract", sha256: sha(css), marker: LINE_MARK });
  for (const g of Object.keys(GIT_BLOCKS)) {
    const blk = extractHashBlock(readIf(g));
    if (blk != null) managed.push({ path: g, mode: "gitblock", klass: "contract", sha256: sha(blk), bytes: blk.length });
  }
  return managed;
}

/* --------------------------------------------------------- unified diff */
function diffLines(a, b) {
  const A = String(a == null ? "" : a).split("\n"), B = String(b == null ? "" : b).split("\n");
  /* LCS table — inputs here are small (one file / one block) */
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push("  " + A[i]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { out.push("- " + A[i]); i++; }
    else { out.push("+ " + B[j]); j++; }
  }
  while (i < n) out.push("- " + A[i++]);
  while (j < m) out.push("+ " + B[j++]);
  /* trim long runs of context */
  const keep = new Array(out.length).fill(false);
  out.forEach((l, k) => { if (l[0] !== " ") for (let d = -3; d <= 3; d++) if (out[k + d] !== undefined) keep[k + d] = true; });
  const res = []; let skipping = false;
  out.forEach((l, k) => {
    if (keep[k]) { if (skipping) { res.push("@@ …"); skipping = false; } res.push(l); }
    else skipping = true;
  });
  if (skipping) res.push("@@ …");
  return res.join("\n");
}

/* ------------------------------------------------------------- legacy */
const LEGACY_PHRASE = "HAPUS DS LAMA";
function detectLegacy() {
  const items = [];
  const gm = readIf(".gitmodules") || "";
  const registered = gm.includes(SUBMODULE_DIR);
  const dsPath = abs(SUBMODULE_DIR);
  const vendored = !registered && fs.existsSync(dsPath) &&
    (fs.existsSync(path.join(dsPath, "adapters")) || fs.existsSync(path.join(dsPath, "scripts", "install.js")) ||
     (fs.existsSync(path.join(dsPath, "dist")) && fs.existsSync(path.join(dsPath, "catalog"))));
  if (vendored) items.push({ path: "design-system/", note: T("folder paket DS lama (bukan submodule v3)", "old DS package folder (not the v3 submodule)"), rmrf: SUBMODULE_DIR });
  if (readIf("plugins/design-system.js") != null) items.push({ path: "plugins/design-system.js", note: T("plugin dari installer lama", "plugin from the old installer"), rmrf: "plugins/design-system.js" });
  if (readIf("pages/design-system-example.vue") != null) items.push({ path: "pages/design-system-example.vue", note: T("halaman contoh installer lama", "example page from the old installer"), rmrf: "pages/design-system-example.vue" });
  if (fs.existsSync(abs(".ds-backup"))) items.push({ path: ".ds-backup/", note: T("folder backup installer lama", "backup folder from the old installer"), rmrf: ".ds-backup" });
  const claude = readIf("CLAUDE.md");
  if (claude != null && claude.includes("@design-system/CLAUDE.md") && !claude.includes(MD_BEGIN))
    items.push({ path: "CLAUDE.md", note: T("pointer AI rules versi lama", "old AI-rules pointer"), edit: "claude-legacy" });
  const tw = readIf("tailwind.config.js");
  if (vendored && tw && tw.includes("design-system/dist/tailwind.preset")) items.push({ path: "tailwind.config.js", note: T("baris preset DS lama", "old DS preset line"), edit: "tw-remove" });
  const nx = nuxtConfigName(), nsrc = readIf(nx);
  if (vendored && nsrc && nsrc.includes("design-system/dist/variables.css")) items.push({ path: nx, note: T("baris variables.css DS lama", "old DS variables.css line"), edit: "nuxt-remove" });
  if (nsrc && nsrc.includes("plugins/design-system")) items.push({ path: nx, note: T("baris plugin DS lama", "old DS plugin line"), edit: "nuxt-plugin-remove" });
  return { found: items.length > 0, items, confirmPhrase: LEGACY_PHRASE };
}
/* marker/section-aware, not a keyword sweep: only the contiguous v1 pointer block goes */
function stripLegacyClaude(src) {
  const lines = src.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (/@design-system\/CLAUDE\.md/.test(lines[i])) {
      /* drop this line plus an immediately adjacent heading/bullet that introduces it */
      if (out.length && /^\s*([#>*-]|\d+\.)/.test(out[out.length - 1]) && !out[out.length - 1].trim().startsWith("#!")) out.pop();
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;
      continue;
    }
    out.push(lines[i]); i++;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
}

/* ----------------------------------------------------------- telemetry */
function telemetry(entry) {
  const url = process.env.DS_TELEMETRY_URL || dsMeta().telemetryUrl;
  const m = loadManifest();
  if (!url || (m && m.telemetry === false)) return;
  try {
    const payload = JSON.stringify({
      event: entry.event, at: new Date().toISOString(),
      wizardVersion: WIZARD_VERSION, dsVersion: entry.dsVersion || null, dsCommit: entry.dsCommit || null,
      level: entry.level != null ? String(entry.level) : null,
      adoptionId: m ? m.adoptionId : null,
      repoHash: sha(originUrl() || ROOT).slice(0, 16),
    });
    const lib = url.startsWith("https:") ? require("https") : require("http");
    const req = lib.request(url, { method: "POST", timeout: 1500, headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } });
    req.on("error", () => {}); req.on("timeout", () => req.destroy());
    req.end(payload);
  } catch {}
}

/* --------------------------------------------------------------- state */
function detectState() {
  const isGit = sh("git rev-parse --is-inside-work-tree").ok;
  const gm = readIf(".gitmodules") || "";
  const subRegistered = gm.includes(SUBMODULE_DIR);
  const subPopulated = existsNonEmptyDir(SUBMODULE_DIR);
  const tw = readIf("tailwind.config.js");
  const nx = nuxtConfigName(), nuxt = readIf(nx);
  const level1tw = !!(tw && tw.includes("design-system/dist/tailwind.preset"));
  const level1css = !!(nuxt && nuxt.includes("design-system/dist/variables.css"));
  const files = {
    "CLAUDE.md": extractBlock(readIf("CLAUDE.md")) != null,
    ".ds/bindings.md": readIf(".ds/bindings.md") != null,
  };
  const dirty = (() => { const r = sh("git status --porcelain"); return r.ok ? r.out.length > 0 : false; })();
  const subCommit = subPopulated ? sh("git rev-parse --short HEAD", { cwd: abs(SUBMODULE_DIR) }).out : null;
  let level = "not-installed";
  if (subRegistered && subPopulated) level = level1tw && level1css ? "1" : "0";

  const manifest = loadManifest();
  const installed = level !== "not-installed";

  /* panel self-update */
  let panelLatest = null;
  if (subPopulated) {
    const shipped = readIf(path.join(SUBMODULE_DIR, "tools", "ds-setup.cjs"));
    if (shipped) { const m = shipped.match(/Panel v(\d+\.\d+\.\d+)/); if (m) panelLatest = m[1]; }
  }
  const cmpVer = (a, b) => {
    const A = a.split(".").map(Number), B = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) { if ((A[i] || 0) > (B[i] || 0)) return 1; if ((A[i] || 0) < (B[i] || 0)) return -1; }
    return 0;
  };

  return {
    wizardVersion: WIZARD_VERSION, builtForDs: BUILT_FOR_DS,
    root: ROOT, isGit,
    defaultRepoUrl: defaultRepoUrl(), originUrl: originUrl(),
    maintainerEmail: maintainerEmail(),
    maintainer: dsMeta().maintainer || null,
    subRegistered, subPopulated, subCommit, level,
    level1tw, level1css, halfWired: installed && (level1tw !== level1css),
    nuxtConfig: nx, hasTailwindConfig: tw != null,
    files, dirty,
    legacy: detectLegacy(),
    manifest, unmanaged: installed && !manifest,
    drift: detectDrift(),
    history: loadHistory().slice(0, 100),
    rollback: (() => { try { return JSON.parse(readIf(ROLLBACK)); } catch { return null; } })(),
    panelLatest, panelOutdated: !!(panelLatest && cmpVer(panelLatest, WIZARD_VERSION) > 0),
    prompts: buildPromptSet(level),
    locked: LOCKED,
  };
}

/* ---------------------------------------------------------------- plans */
function buildInstallPlan(cfg) {
  const st = detectState();
  const steps = [];
  const repoUrl = (cfg.repoUrl || defaultRepoUrl()).trim();
  if (!st.isGit) return { error: T("Folder ini bukan repository git. Taruh file ini di root repo frontend kamu.", "This folder is not a git repository. Put this file in the root of your frontend repo.") };
  if (String(cfg.level) === "1" && String(cfg.accessCode || "").trim() !== LEVEL1_ACCESS_CODE)
    return { error: T("Level 1 butuh kode akses dari pemelihara design system. Minta kodenya, atau mulai dari Level 0.", "Level 1 needs an access code from the design system maintainer. Ask for it, or start with Level 0.") };

  if (!st.subRegistered && !st.subPopulated)
    steps.push({ title: T("Tambahkan design system sebagai submodule read-only", "Add the design system as a read-only submodule"), cmd: 'git submodule add "' + repoUrl + '" ' + SUBMODULE_DIR });
  else if (st.subRegistered && !st.subPopulated)
    steps.push({ title: T("Isi submodule yang sudah terdaftar", "Populate the registered submodule"), cmd: "git submodule update --init " + SUBMODULE_DIR });
  else steps.push({ title: T("Submodule sudah ada", "Submodule already present"), skip: true });

  steps.push({ title: T("Pastikan URL repo berisi design system yang benar", "Verify the URL really holds this design system"), verify: true });

  const claude = readIf("CLAUDE.md");
  if (claude == null) steps.push({ title: T("Buat CLAUDE.md (instruksi AI)", "Create CLAUDE.md (AI instructions)"), write: "CLAUDE.md" });
  else if (extractBlock(claude) != null) steps.push({ title: T("CLAUDE.md sudah punya bagian design-system", "CLAUDE.md already has the design-system section"), skip: true });
  else steps.push({ title: T("Tambahkan bagian design-system di AKHIR CLAUDE.md kamu, di antara marker (isi kamu tidak disentuh)", "Append the design-system section to the END of your CLAUDE.md, between markers (your content untouched)"), append: "CLAUDE.md" });

  if (readIf(".ds/bindings.md") != null) steps.push({ title: T(".ds/bindings.md sudah ada — tidak ditimpa", ".ds/bindings.md already exists — not overwritten"), skip: true });
  else steps.push({ title: T("Buat .ds/bindings.md (peta komponen)", "Create .ds/bindings.md (component map)"), write: ".ds/bindings.md" });

  for (const g of Object.keys(GIT_BLOCKS)) {
    const cur = readIf(g);
    if (extractHashBlock(cur) != null) steps.push({ title: T(g + " sudah punya bagian design-system", g + " already has the design-system section"), skip: true });
    else if (cur == null) steps.push({ title: T("Buat " + g, "Create " + g), write: g });
    else steps.push({ title: T("Tambahkan bagian design-system di akhir " + g + " (isi kamu tidak disentuh)", "Append the design-system section to the end of " + g + " (your content untouched)"), append: g });
  }

  if (String(cfg.level) === "1") {
    const tp = planTailwindEdit(readIf("tailwind.config.js"));
    if (tp.already) steps.push({ title: T("tailwind.config.js sudah terpasang", "tailwind.config.js already wired"), skip: true });
    else if (tp.manual) steps.push({ title: tp.manual, manual: true });
    else steps.push({ title: T("Tambah 1 baris bertanda ke tailwind.config.js", "Add 1 marked line to tailwind.config.js"), edit: "tw", preview: PRESET_LINE.trim() });
    const nx = nuxtConfigName(), np = planNuxtEdit(readIf(nx), nx);
    if (np.already) steps.push({ title: T(nx + " sudah terpasang", nx + " already wired"), skip: true });
    else if (np.manual) steps.push({ title: np.manual, manual: true });
    else steps.push({ title: T("Tambah 1 baris bertanda ke " + nx, "Add 1 marked line to " + nx), edit: "nuxt", preview: CSS_LINE.trim() });
  }

  steps.push({ title: T("Tulis struk pemasangan (.ds/manifest.json)", "Write the install receipt (.ds/manifest.json)"), manifest: "install", level: String(cfg.level) });
  if (cfg.commit) steps.push({ title: T("Commit adopsi (hanya file di atas)", "Commit the adoption (only the files above)"), commit: true, commitMsg: "chore: adopt design-system (Level " + cfg.level + ")" });
  steps.push({ title: T("Verifikasi dengan doctor (read-only)", "Verify with doctor (read-only)"), doctor: true });

  return {
    steps,
    notTouched: [
      T("Komponen, halaman, style dan kode bisnis kamu", "Your components, pages, styles and business code"),
      T("Build & runtime kamu (Level 0) — Level 1 hanya menambah 2 baris bertanda di atas", "Your build & runtime (Level 0) — Level 1 adds only the 2 marked lines above"),
      T("Riwayat git kamu — semua masuk sebagai SATU commit yang bisa direview", "Your git history — everything lands as ONE reviewable commit"),
    ],
  };
}

function buildRevertPlan(cfg) {
  const st = detectState();
  const m = loadManifest();
  const steps = [];

  if (m && m.managed.length) {
    for (const e of m.managed) {
      if (e.mode === "line") steps.push({ title: T("Hapus baris bertanda dari " + e.path, "Remove the marked line from " + e.path), edit: e.kind === "tw" ? "tw-remove" : "nuxt-remove" });
      else if (e.mode === "block") steps.push({ title: T("Hapus bagian bertanda dari " + e.path + " (sisa file dipertahankan)", "Remove the marked section from " + e.path + " (the rest is kept)"), edit: "claude-strip" });
      else if (e.mode === "gitblock") steps.push({ title: T("Hapus bagian bertanda dari " + e.path + " (sisa file dipertahankan)", "Remove the marked section from " + e.path + " (the rest is kept)"), gitstrip: e.path });
      else steps.push({ title: T("Hapus " + e.path + " (disalin dulu ke .ds/.trash/)", "Remove " + e.path + " (copied to .ds/.trash/ first)"), rmfile: e.path });
    }
  } else {
    /* no receipt: fall back to conservative detection, still file-level */
    if (st.level1tw) steps.push({ title: T("Hapus baris preset dari tailwind.config.js", "Remove the preset line from tailwind.config.js"), edit: "tw-remove" });
    if (st.level1css) steps.push({ title: T("Hapus baris variables.css dari " + st.nuxtConfig, "Remove the variables.css line from " + st.nuxtConfig), edit: "nuxt-remove" });
    if (extractBlock(readIf("CLAUDE.md")) != null) steps.push({ title: T("Hapus bagian bertanda dari CLAUDE.md", "Remove the marked section from CLAUDE.md"), edit: "claude-strip" });
    if (readIf(".ds/bindings.md") != null) steps.push({ title: T("Hapus .ds/bindings.md", "Remove .ds/bindings.md"), rmfile: ".ds/bindings.md" });
    for (const g of Object.keys(GIT_BLOCKS)) {
      if (extractHashBlock(readIf(g)) != null) steps.push({ title: T("Hapus bagian bertanda dari " + g, "Remove the marked section from " + g), gitstrip: g });
    }
  }

  if (readIf("CLAUDE.md") != null) steps.push({ title: T("Hapus CLAUDE.md kalau jadi kosong", "Remove CLAUDE.md if it becomes empty"), pruneClaude: true });
  for (const g of Object.keys(GIT_BLOCKS)) {
    if (readIf(g) != null) steps.push({ title: T("Hapus " + g + " kalau jadi kosong", "Remove " + g + " if it becomes empty"), pruneEmpty: g });
  }

  if (st.subRegistered || st.subPopulated) {
    steps.push({ title: T("Deinit submodule", "Deinit the submodule"), cmd: "git submodule deinit -f " + SUBMODULE_DIR });
    steps.push({ title: T("Lepas submodule dari git", "Remove the submodule from git tracking"), cmd: "git rm -f " + SUBMODULE_DIR });
  }
  if (fs.existsSync(abs(path.join(".git", "modules", SUBMODULE_DIR)))) steps.push({ title: T("Bersihkan state submodule internal", "Clean internal submodule state"), rmrf: ".git/modules/" + SUBMODULE_DIR });
  if (fs.existsSync(abs(SUBMODULE_DIR))) steps.push({ title: T("Hapus sisa folder " + SUBMODULE_DIR + "/", "Remove the leftover " + SUBMODULE_DIR + "/ folder"), rmrf: SUBMODULE_DIR, gitUntrack: true });

  steps.push({ title: T("Hapus struk pemasangan (riwayat & trash dipertahankan)", "Remove the install receipt (history & trash are kept)"), rmfile: MANIFEST });
  steps.push({ title: T("Hapus .ds/ hanya kalau sudah kosong", "Remove .ds/ only if it is empty"), pruneDs: true });
  if (cfg && cfg.commit) steps.push({ title: T("Commit revert", "Commit the revert"), commit: true, commitMsg: "revert: remove design-system" });

  if (!steps.length) return { error: T("Tidak ada yang perlu dicopot.", "Nothing to revert.") };
  return {
    steps,
    notTouched: [T("Semua isi repo kamu yang lain", "Everything else in your repo")],
    remains: [
      T(".ds/history.jsonl — catatan adopsi (tidak dihapus)", ".ds/history.jsonl — the adoption log (kept)"),
      T(".ds/.trash/ — salinan setiap file yang pernah diubah", ".ds/.trash/ — a copy of every file ever changed"),
      T("Commit di riwayat git — dicopot, bukan ditulis ulang", "Commits in your git history — reverted, never rewritten"),
    ],
  };
}

/* ------------------------------------------------------------ execution */
function stageExisting(paths) {
  /* F10: git add aborts entirely on a missing pathspec — filter first, then verify */
  const present = paths.filter((p) => fs.existsSync(abs(p)) || sh('git ls-files --error-unmatch -- "' + p + '"').ok);
  if (!present.length) return { staged: [], ok: false };
  for (const p of present) sh('git add -- "' + p + '"');
  const r = sh("git diff --cached --name-only");
  return { staged: r.ok && r.out ? r.out.split("\n").filter(Boolean) : [], ok: true };
}

async function execSteps(steps, ctx) {
  const log = [];
  let i = 0;
  ctx = ctx || {};
  for (const s of steps) {
    i++;
    PROGRESS = { active: true, current: i, total: steps.length, label: s.title };
    await new Promise((r) => setImmediate(r));
    const push = (ok, output, extra) => log.push(Object.assign({ title: s.title, ok, output }, extra || {}));

    try {
      if (s.skip) { push(true, "(skipped)"); continue; }
      if (s.manual) { log.push({ title: s.title, ok: false, manual: true, output: "manual step" }); continue; }

      if (s.verify) {
        const need = ["catalog/INDEX.md", "dist/variables.css", "CLAUDE.md"];
        const miss = need.filter((f) => !fs.existsSync(abs(path.join(SUBMODULE_DIR, f))));
        if (miss.length) { push(false, "missing: " + miss.join(", ") + " — that URL does not look like an E-Systems design system repo"); return { log, ok: false }; }
        push(true, "ok"); continue;
      }
      if (s.write) {
        const body = GIT_BLOCKS[s.write] !== undefined ? hashBlock(s.write)
          : s.write === "CLAUDE.md" ? markedBlock("CLAUDE.md") : PAYLOADS[s.write];
        writeFile(s.write, body); push(true, "wrote " + s.write); continue;
      }
      if (s.append) {
        const isGit = GIT_BLOCKS[s.append] !== undefined;
        const prev = readIf(s.append) || "";
        if ((isGit ? extractHashBlock(prev) : extractBlock(prev)) != null) { push(true, "(section already present)"); continue; }
        writeFile(s.append, (prev ? prev.replace(/\n*$/, "\n\n") : "") + (isGit ? hashBlock(s.append) : markedBlock(s.append)));
        push(true, "appended to " + s.append); continue;
      }
      if (s.edit) {
        if (s.edit === "tw") { const p = planTailwindEdit(readIf("tailwind.config.js")); if (p.changed) writeFile("tailwind.config.js", p.out); }
        else if (s.edit === "nuxt") { const nx = nuxtConfigName(), p = planNuxtEdit(readIf(nx), nx); if (p.changed) writeFile(nx, p.out); }
        else if (s.edit === "tw-remove") { const src = readIf("tailwind.config.js"); if (src != null) { toTrash("tailwind.config.js"); writeFile("tailwind.config.js", removeManagedLine(src, "tw")); } }
        else if (s.edit === "nuxt-remove") { const nx = nuxtConfigName(), src = readIf(nx); if (src != null) { toTrash(nx); writeFile(nx, removeManagedLine(src, "css")); } }
        else if (s.edit === "claude-strip") { const src = readIf("CLAUDE.md"); if (src != null) { toTrash("CLAUDE.md"); writeFile("CLAUDE.md", stripBlock(src)); } }
        else if (s.edit === "claude-legacy") {
          const src = readIf("CLAUDE.md");
          if (src != null) {
            const bak = toTrash("CLAUDE.md");
            const out = stripLegacyClaude(src);
            if (out.trim() === "") { fs.rmSync(abs("CLAUDE.md"), { force: true }); sh('git rm -f --cached --ignore-unmatch "CLAUDE.md"'); }
            else writeFile("CLAUDE.md", out);
            push(true, "backup: " + bak); continue;
          }
        } else if (s.edit === "nuxt-plugin-remove") {
          const nx = nuxtConfigName(), src = readIf(nx);
          if (src != null) { toTrash(nx); writeFile(nx, src.split("\n").filter((l) => !l.includes("plugins/design-system")).join("\n")); }
        }
        push(true, "done"); continue;
      }
      if (s.rmfile) {
        const bak = toTrash(s.rmfile);
        fs.rmSync(abs(s.rmfile), { force: true });
        sh('git rm --cached --ignore-unmatch -- "' + s.rmfile + '"');
        push(true, bak ? "moved to " + bak : "not present"); continue;
      }
      if (s.gitstrip) {
        const src = readIf(s.gitstrip);
        if (src == null) { push(true, "not present"); continue; }
        const bak = toTrash(s.gitstrip);
        writeFile(s.gitstrip, stripHashBlock(src));
        push(true, bak ? "backup: " + bak : "stripped"); continue;
      }
      if (s.pruneEmpty) {
        const src = readIf(s.pruneEmpty);
        if (src != null && src.trim() === "") {
          toTrash(s.pruneEmpty); fs.rmSync(abs(s.pruneEmpty), { force: true });
          sh('git rm --cached --ignore-unmatch -- "' + s.pruneEmpty + '"');
          push(true, "removed (was empty)");
        } else push(true, "kept (has your content)");
        continue;
      }
      if (s.pruneClaude) {
        const src = readIf("CLAUDE.md");
        if (src != null && src.trim() === "") { toTrash("CLAUDE.md"); fs.rmSync(abs("CLAUDE.md"), { force: true }); sh('git rm --cached --ignore-unmatch -- "CLAUDE.md"'); push(true, "removed (was empty)"); }
        else push(true, "kept (has your content)");
        continue;
      }
      if (s.pruneDs) {
        try {
          const left = fs.readdirSync(abs(DS_DIR_LOCAL));
          if (!left.length) { fs.rmSync(abs(DS_DIR_LOCAL), { recursive: true, force: true }); push(true, "removed (empty)"); }
          else push(true, "kept — still holds: " + left.join(", "));
        } catch { push(true, "not present"); }
        continue;
      }
      if (s.rmrf) {
        fs.rmSync(abs(s.rmrf), { recursive: true, force: true });
        if (s.gitUntrack) sh('git rm -r --cached --ignore-unmatch -- "' + s.rmrf + '"');
        push(true, "removed " + s.rmrf); continue;
      }
      if (s.manifest) {
        const managed = surveyManaged();
        const prev = loadManifest();
        const dsCommit = sh("git rev-parse --short HEAD", { cwd: abs(SUBMODULE_DIR) }).out || null;
        let dsVersion = null;
        try { dsVersion = JSON.parse(readIf(path.join(SUBMODULE_DIR, "version.json"))).version; } catch {}
        const m = {
          schema: "ds-manifest-v1",
          adoptionId: (prev && prev.adoptionId) || crypto.randomUUID(),
          wizardVersion: WIZARD_VERSION,
          installedAt: (prev && prev.installedAt) || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          level: s.level != null ? String(s.level) : (prev ? prev.level : "0"),
          repoUrl: originUrl() || defaultRepoUrl(),
          dsVersion, dsCommit,
          telemetry: prev ? prev.telemetry : undefined,
          managed,
        };
        saveManifest(m);
        appendHistory({ event: s.manifest, level: m.level, dsVersion, dsCommit, actor: actorId() });
        push(true, managed.length + " managed entries recorded"); continue;
      }
      if (s.commit) {
        const nx = nuxtConfigName();
        const res = stageExisting([".gitmodules", SUBMODULE_DIR, "CLAUDE.md", DS_DIR_LOCAL, "tailwind.config.js", nx, ".gitignore", ".gitattributes"]);
        if (!res.staged.length) { push(true, "nothing to stage — no commit was made"); continue; }
        const c = sh('git commit -m "' + s.commitMsg + '"');
        if (!c.ok && /nothing to commit|nothing added/.test(c.out)) { push(true, "nothing to commit"); continue; }
        push(c.ok, c.ok ? "committed " + res.staged.length + " path(s): " + res.staged.slice(0, 6).join(", ") : c.out);
        if (!c.ok) return { log, ok: false };
        continue;
      }
      if (s.doctor) { const d = runDoctor(); push(d.ok, d.output, { doctor: true }); continue; }
      if (s.cmd) {
        const r = sh(s.cmd);
        push(r.ok, r.out || "done", { cmd: s.cmd });
        if (!r.ok) return { log, ok: false };
        continue;
      }
    } catch (e) { push(false, String(e && e.message || e)); return { log, ok: false }; }
  }
  return { log, ok: log.every((l) => l.ok || l.manual) };
}

function runDoctor() {
  const p = abs(path.join(SUBMODULE_DIR, "src", "scripts", "doctor.js"));
  if (!fs.existsSync(p)) return { ok: false, output: "doctor.js not found (submodule populated?)" };
  const r = sh('node "' + p + '"');
  return { ok: r.ok, output: r.out };
}

/* ------------------------------------------------------------- overview */
function dsInfo() {
  if (!existsNonEmptyDir(SUBMODULE_DIR)) return { installed: false };
  const base = abs(SUBMODULE_DIR);
  const rd = (rel) => { try { return fs.readFileSync(path.join(base, rel), "utf8"); } catch { return null; } };
  const cnt = (rel, ext) => { try { return fs.readdirSync(path.join(base, rel)).filter((f) => f.endsWith(ext)).length; } catch { return null; } };

  const changelog = rd("CHANGELOG.md") || "";
  let version = null;
  try { version = JSON.parse(rd("version.json")).version; } catch { const m = changelog.match(/#+\s*\[?v?(\d+\.\d+\.\d+)/); version = m ? m[1] : null; }

  const vars = rd("dist/variables.css") || "";
  const rootBlock = vars.split(":root {")[1] ? vars.split(":root {")[1].split("}")[0] : "";
  const tokenCount = (rootBlock.match(/--[\w-]+\s*:/g) || []).length || null;

  /* product stack, read live from the design system — never hard-coded */
  let typeface = null, icons = null, pages = null;
  try {
    const f = JSON.parse(rd("src/foundations.json"));
    const ff = f["font-family"] || {};
    typeface = [ff.primary && ff.primary.$value, ff.mono && ff.mono.$value].filter(Boolean).join(" \u00b7 ");
  } catch {}
  try {
    const idx = JSON.parse(rd("catalog/index.json"));
    pages = idx.totalPages;
    const counts = {};
    for (const code of ["asset-06", "asset-07", "asset-08"]) {
      const it = (idx.items || []).filter((x) => x.code === code)[0];
      if (!it) continue;
      const spec = JSON.parse(rd(it.file));
      for (const k in spec.props || {}) {
        const v = spec.props[k];
        if (v && Array.isArray(v.values) && v.values.length > 5) { counts[code] = v.values.length; break; }
      }
    }
    if (counts["asset-06"]) icons = "Tabler " + counts["asset-06"] + (counts["asset-07"] ? " + " + counts["asset-07"] + " ext" : "") + (counts["asset-08"] ? " \u00b7 Custom " + counts["asset-08"] : "");
  } catch {}

  const commitR = sh('git -C "' + base + '" log -1 --format="%h \u00b7 %ad" --date=format:"%d %b %Y"');
  return {
    installed: true, version, tokenCount, pages, typeface, icons,
    specs: cnt("src/components", ".json"),
    reference: cnt("reference/components", ".html"),
    catalog: cnt("catalog/components", ".md"),
    commit: commitR.ok ? commitR.out.trim() : null,
    changelogHead: changelog ? changelog.split("\n").slice(0, 30).join("\n").trim() : null,
    hasGallery: fs.existsSync(path.join(base, "reference", "gallery.html")),
    docs: ["README.md", "docs/ARCHITECTURE.md", "SAFETY.id.md", "SAFETY.en.md", "TUTORIAL.id.md", "TUTORIAL.en.md",
           "SETUP.md", "CHANGELOG.md", "STORY.md", "HISTORY.md", "CLAUDE.md"].filter((f) => fs.existsSync(path.join(base, f))),
  };
}

function checkUpdate() {
  if (!existsNonEmptyDir(SUBMODULE_DIR)) return { error: T("Design system belum terpasang.", "The design system is not installed yet.") };
  const base = abs(SUBMODULE_DIR);
  const f = sh('git -C "' + base + '" fetch -q origin HEAD');
  if (!f.ok) return { error: T("Tidak bisa menghubungi repo design system: ", "Could not reach the design system repo: ") + f.out.slice(0, 220) };
  const b = sh('git -C "' + base + '" rev-list --count HEAD..FETCH_HEAD');
  const behind = b.ok ? parseInt(b.out.trim(), 10) || 0 : 0;
  let newCommits = [];
  if (behind > 0) {
    const l = sh('git -C "' + base + '" log --oneline HEAD..FETCH_HEAD');
    if (l.ok) newCommits = l.out.trim().split("\n").filter(Boolean).slice(0, 8);
  }
  return { upToDate: behind === 0, behind, newCommits };
}

/* --------------------------------------------------- pre-flight impact */
function impactReport() {
  if (!existsNonEmptyDir(SUBMODULE_DIR)) return { error: T("Belum terpasang.", "Not installed.") };
  const base = abs(SUBMODULE_DIR);
  const show = (ref, file) => { const r = sh('git -C "' + base + '" show ' + ref + ":" + file); return r.ok ? r.out : null; };
  const varsOf = (txt) => {
    if (!txt) return [];
    const root = txt.split(":root {")[1] ? txt.split(":root {")[1].split("}")[0] : "";
    return [...new Set(root.match(/--[\w-]+(?=\s*:)/g) || [])];
  };
  const curVars = varsOf(show("HEAD", "dist/variables.css"));
  const newVars = varsOf(show("FETCH_HEAD", "dist/variables.css"));
  if (!newVars.length) return { error: T("Jalankan cek update dulu.", "Run the update check first.") };

  const tokensRemoved = curVars.filter((v) => !newVars.includes(v));
  const tokensAdded = newVars.filter((v) => !curVars.includes(v)).length;

  const codes = (txt) => { try { return (JSON.parse(txt).items || []).map((i) => i.code); } catch { return []; } };
  const curCodes = codes(show("HEAD", "catalog/index.json"));
  const newCodes = codes(show("FETCH_HEAD", "catalog/index.json"));
  const specsRemoved = curCodes.filter((c) => !newCodes.includes(c));
  const specsAdded = newCodes.filter((c) => !curCodes.includes(c)).length;

  const ver = (txt) => { try { return JSON.parse(txt).version; } catch { return null; } };
  const fromVersion = ver(show("HEAD", "version.json"));
  const toVersion = ver(show("FETCH_HEAD", "version.json"));
  let bump = "unknown";
  if (fromVersion && toVersion) {
    const A = fromVersion.split(".").map(Number), B = toVersion.split(".").map(Number);
    bump = B[0] > A[0] ? "major" : B[1] > A[1] ? "minor" : B[2] > A[2] ? "patch" : "same";
  }

  /* scan the consumer for usage of anything that disappears */
  const needles = tokensRemoved.map((v) => v).concat(tokensRemoved.map((v) => v.replace(/^--color-/, "").replace(/^--/, "")));
  const affected = [];
  if (tokensRemoved.length) {
    const dirs = ["pages", "components", "layouts", "assets", "plugins", "store", "src"].filter((d) => fs.existsSync(abs(d)));
    const exts = /\.(vue|js|ts|jsx|tsx|css|scss|sass|less|html)$/i;
    const walk = (d, depth) => {
      if (depth > 8) return;
      let ents = []; try { ents = fs.readdirSync(abs(d), { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        const rel = d + "/" + e.name;
        if (e.isDirectory()) { walk(rel, depth + 1); continue; }
        if (!exts.test(e.name)) continue;
        let txt = ""; try { txt = fs.readFileSync(abs(rel), "utf8"); } catch { continue; }
        let hits = 0;
        for (const n of needles) if (n.length > 6 && txt.includes(n)) hits++;
        if (hits) affected.push({ file: rel, hits });
      }
    };
    dirs.forEach((d) => walk(d, 0));
    affected.sort((a, b) => b.hits - a.hits);
  }
  return { fromVersion, toVersion, bump, tokensAdded, tokensRemoved, specsAdded, specsRemoved, affected: affected.slice(0, 200) };
}

/* ---------------------------------------------------- change requests */
function buildChangeRequest(file, reason, lang) {
  const m = loadManifest();
  const entry = m ? m.managed.filter((e) => e.path === file)[0] : null;
  if (!entry) return { error: T("File itu tidak ada di struk pemasangan.", "That file is not in the install receipt.") };
  const cur = currentRegion(entry), pristine = pristineRegion(entry);
  const branch = (sh("git rev-parse --abbrev-ref HEAD").out || "").trim();
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = file.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  const rel = REQUESTS + "/CR-" + stamp + "-" + slug + ".md";

  const body = [
    "# Design system change request",
    "",
    "| | |",
    "|---|---|",
    "| File | `" + file + "` |",
    "| Repo | " + (originUrl() || ROOT) + " |",
    "| Branch | " + branch + " |",
    "| Design system | v" + ((m && m.dsVersion) || "?") + " @ " + ((m && m.dsCommit) || "?") + " |",
    "| Panel | v" + WIZARD_VERSION + " |",
    "| Date | " + new Date().toISOString() + " |",
    "",
    "## Why this was changed",
    "",
    (reason || "_(not given)_").trim(),
    "",
    "## Diff — shipped template vs. this repo",
    "",
    "```diff",
    diffLines(pristine, cur),
    "```",
    "",
    "> Generated by the Design System panel. If this change is generally useful,",
    "> fold it into the shipped template so every repo gets it.",
    "",
  ].join("\n");

  writeFile(rel, body);

  const to = maintainerEmail() || "";
  const subject = "[Design System] Change request: " + file;
  const short = [
    "File: " + file,
    "Repo: " + (originUrl() || ROOT),
    "Branch: " + branch,
    "Design system: v" + ((m && m.dsVersion) || "?"),
    "",
    "Reason:",
    (reason || "(not given)").trim(),
    "",
    "The full diff is on the clipboard and saved in the repo at:",
    rel,
  ].join("\n");
  const mailto = to ? "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(short) : null;

  appendHistory({ event: "change-request", file, actor: actorId() });
  return { savedTo: rel, body, mailto, hasEmail: !!to };
}

/* ----------------------------------------------------------- prompts */
function buildPromptSet(level) {
  const PRE = "Before writing any code, read CLAUDE.md at the repo root and follow its full instruction chain (design-system/CLAUDE.md -> design-system/catalog/INDEX.md -> .ds/bindings.md).";
  const STACK = "Product stack: Fustat typeface, Tabler icons (full literal classes like i-tabler-user), and the .ts-* text-style classes. Never substitute another icon set.";
  const tokenRule = level === "1"
    ? "Colors, spacing and typography: use the design-system token classes from the Tailwind preset (e.g. tw-bg-brand-brand, tw-text-semantic-warning, .ts-* text styles). Never hardcode hex colors or px values."
    : "Colors, spacing and typography: this repo is at adoption Level 0, so use the frontend's existing utility classes exactly as mapped in the TOKEN-MAP section of .ds/bindings.md. Never hardcode hex colors or px values.";
  const RULES = [
    "Reuse this repo's existing components first (see COMPONENT-MAP). Only compose from design-system/reference/ when there is a documented gap.",
    tokenRule,
    STACK,
    "Never rebuild the app shell. Exactly one scrolling region per layout.",
    "No breadcrumb unless asked. Tables always inside a white card, 10 rows per page by default, rows-per-page capped at 50.",
    "Clicking a row, card or list item never navigates or opens a panel — every action needs its own explicit control. Destructive actions confirm via modal.",
    "If you resolve something the bindings map got wrong or is missing, update .ds/bindings.md in the same change set (Self-Healing Map Law).",
    "Finish with: node design-system/src/scripts/doctor.js",
  ].map((r, i) => (i + 1) + ". " + r).join("\n");

  const p = (id, cat, title, desc, body) => ({ id, cat, title, desc, body: PRE + "\n\n" + body + "\n\nRules:\n" + RULES });
  return [
    p("smoke", "Verify", "Full smoke test", "Prove the grounding chain works end to end.",
      "Run a full design-system smoke test on this repo:\n- Confirm you can read every file in the instruction chain, and list what each one told you.\n- Report the adoption level you detected and how.\n- Pick any three components from catalog/INDEX.md and state their exact tokens.\n- Build a small throwaway page at pages/ds-smoke.vue using only mapped components, then delete nothing and tell me what you made."),
    p("feature", "Build", "Build a new feature", "A whole feature, on spec, with this repo's components.",
      "Build [FEATURE] at route [ROUTE].\n\nRequirements:\n[DESCRIBE THE REQUIREMENT]"),
    p("addui", "Build", "Add UI to an existing page", "Extend a page without disturbing it.",
      "Add [WHAT] to the existing page at [ROUTE]. Match the surrounding patterns; change nothing that is not required."),
    p("migrate", "Build", "Migrate or rebuild an existing feature", "Bring legacy UI onto the design system.",
      "Migrate the existing feature at [ROUTE] onto the design system.\nWork incrementally: inventory what is there, map each piece to a spec, then replace piece by piece. Keep all current behaviour and data flow."),
    p("redesign", "Build", "Redesign a screen", "Restyle to spec without changing behaviour.",
      "Redesign [ROUTE] to match the design system. Behaviour, routes and data stay exactly as they are — only the presentation changes."),
    p("audit", "Review", "Styling audit", "Find hardcoded values and spec drift.",
      "Audit [SCOPE] against the design system. Report: hardcoded hex or px that a token covers, components rebuilt by hand where a mapped one exists, spec deviations, and scroll-contract violations. Produce a table, ranked worst first. Do not change any code yet."),
    p("review", "Review", "Review my changes", "Check a diff before it goes up.",
      "Review the current diff against the design system rules. Flag every violation with the file, line and the rule it breaks. Then propose the minimal fix for each."),
    p("stress", "Verify", "Gallery stress test", "Build a sample from the COMPLETE component gallery.",
      "Build a throwaway showcase page at pages/ds-stress.vue that exercises the FULL component gallery (design-system/reference/gallery.html):\n- Inputs: all 9 types (Basic, Search, SearchWithIcon, Dropdown, DatePicker, Password, PasswordShow, Number, Special) in Inactive, Active Single and Active Multi states \u2014 multi values render as real Chip components.\n- Toasts: all 5 semantic types with the custom icon set from design-system/src/assets/icons-custom (loading icon for Wait); action = Button (Tonal), dismiss = IconButton.\n- Chips vs StatusChips side by side (same bold text ramp), Tabs in all 6 variants, DropdownMenu plain / with item icons / with search, RichTextEditor and RangeSlider.\n- One compact DataTable inside a white card: at least 8 TableColumn types and 12 TableRow types, plus pagination.\nAnything that cannot map to an existing component must be reported as a bindings gap \u2014 never hand-rolled."),
  ];
}

/* ------------------------------------------------------------- server */
const args = process.argv.slice(2);
const NO_OPEN = args.includes("--no-open");
const pi = args.indexOf("--port");
const PORT = pi >= 0 ? parseInt(args[pi + 1], 10) : 5033;

if (args[0] === "extract") {
  for (const k of Object.keys(PAYLOADS)) { writeFile(k, k === "CLAUDE.md" ? markedBlock(k) : PAYLOADS[k]); console.log("wrote " + k); }
  process.exit(0);
}

function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" }); res.end(JSON.stringify(obj)); }
function body(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => { b += c; if (b.length > 2e6) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } });
  });
}

const UI_HTML = "/* @UI_HTML@ */";

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); return res.end(UI_HTML); }

  if (req.method === "GET" && url.startsWith("/ds/")) {
    const rel = decodeURIComponent(url.slice(4));
    const base = abs(SUBMODULE_DIR);
    const full = path.resolve(base, rel);
    if (!full.startsWith(base + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) return json(res, 404, { error: "not found" });
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif", ".json": "application/json; charset=utf-8", ".woff2": "font/woff2", ".md": "text/plain; charset=utf-8" };
    res.writeHead(200, { "Content-Type": types[path.extname(full).toLowerCase()] || "text/plain; charset=utf-8" });
    return res.end(fs.readFileSync(full));
  }

  /* ---- read-only, always available ---- */
  if (req.method === "GET" && url === "/api/state") return json(res, 200, detectState());
  if (req.method === "GET" && url === "/api/progress") return json(res, 200, PROGRESS);
  if (req.method === "GET" && url === "/api/overview") return json(res, 200, dsInfo());
  if (req.method === "POST" && url === "/api/check-update") return json(res, 200, checkUpdate());
  if (req.method === "POST" && url === "/api/impact") return json(res, 200, impactReport());
  if (req.method === "POST" && url === "/api/doctor") return json(res, 200, runDoctor());
  if (req.method === "POST" && url === "/api/payload") {
    const b = await body(req);
    const f = b.file;
    if (Object.prototype.hasOwnProperty.call(GIT_BLOCKS, f)) return json(res, 200, { content: hashBlock(f) });
    if (!Object.prototype.hasOwnProperty.call(PAYLOADS, f)) return json(res, 400, { error: "unknown file" });
    return json(res, 200, { content: f === "CLAUDE.md" ? markedBlock(f) : PAYLOADS[f] });
  }
  if (req.method === "POST" && url === "/api/diff") {
    const b = await body(req);
    const m = loadManifest();
    const e = m ? m.managed.filter((x) => x.path === b.file)[0] : null;
    if (!e) return json(res, 400, { error: T("Tidak ada di struk.", "Not in the receipt.") });
    return json(res, 200, { diff: diffLines(pristineRegion(e), currentRegion(e)), wizardVersion: WIZARD_VERSION });
  }

  /* ---- plans (read-only) ---- */
  if (req.method === "POST" && url === "/api/plan") return json(res, 200, buildInstallPlan(await body(req)));
  if (req.method === "POST" && url === "/api/revert-plan") return json(res, 200, buildRevertPlan(await body(req)));
  if (req.method === "POST" && url === "/api/legacy-plan") {
    const lg = detectLegacy();
    if (!lg.found) return json(res, 200, { error: T("Tidak ada sisa design system lama.", "No legacy design system leftovers found.") });
    const steps = lg.items.map((it) => it.rmrf
      ? { title: T("Hapus " + it.path, "Remove " + it.path), rmrf: it.rmrf, gitUntrack: true }
      : { title: T("Bersihkan " + it.path, "Clean " + it.path), edit: it.edit });
    return json(res, 200, { steps, confirmPhrase: LEGACY_PHRASE, notTouched: [T("Komponen & kode ASLI portal kamu", "Your portal's OWN components and code")], remains: [T("Salinan setiap file yang diubah, di .ds/.trash/", "A copy of every changed file, in .ds/.trash/")] });
  }
  if (req.method === "POST" && url === "/api/restore-plan") {
    const b = await body(req);
    const m = loadManifest();
    const e = m ? m.managed.filter((x) => x.path === b.file)[0] : null;
    if (!e) return json(res, 200, { error: T("Tidak ada di struk.", "Not in the receipt.") });
    return json(res, 200, {
      steps: [
        { title: T("Salin versi kamu ke .ds/.trash/", "Copy your version to .ds/.trash/") },
        { title: T("Kembalikan " + b.file + " ke template panel v" + WIZARD_VERSION, "Restore " + b.file + " to the panel v" + WIZARD_VERSION + " template") },
        { title: T("Perbarui struk", "Update the receipt") },
      ],
      notTouched: [T("Semua file lain", "Every other file")],
      remains: [T("Versi kamu tetap tersimpan di .ds/.trash/", "Your version stays in .ds/.trash/")],
    });
  }
  if (req.method === "POST" && url === "/api/adopt-plan") {
    if (!detectState().unmanaged) return json(res, 200, { error: T("Repo ini sudah punya struk.", "This repo already has a receipt.") });
    const managed = surveyManaged();
    return json(res, 200, {
      steps: [
        { title: T("Baca kondisi terpasang saat ini (" + managed.length + " file)", "Read the current installed state (" + managed.length + " files)") },
        { title: T("Tambahkan marker ke baris config yang belum bertanda", "Add markers to any unmarked config lines") },
        { title: T("Tambahkan housekeeping git (.gitignore, .gitattributes)", "Add the git housekeeping (.gitignore, .gitattributes)") },
        { title: T("Tulis struk dari kondisi saat ini sebagai BASELINE (bukan drift)", "Write the receipt from the current state as the BASELINE (not drift)"), manifest: "adopt" },
      ],
      notTouched: [T("Isi file kamu — tidak ada yang ditulis ulang", "Your file contents — nothing is rewritten")],
    });
  }
  if (req.method === "POST" && url === "/api/rollback-plan") {
    let rb = null; try { rb = JSON.parse(readIf(ROLLBACK)); } catch {}
    if (!rb || !rb.fromCommit) return json(res, 200, { error: T("Belum ada titik rollback.", "No rollback point recorded yet.") });
    return json(res, 200, {
      steps: [
        { title: T("Kembalikan design system ke " + rb.fromCommit, "Return the design system to " + rb.fromCommit), cmd: 'git -C "' + abs(SUBMODULE_DIR) + '" checkout ' + rb.fromCommit },
        { title: T("Perbarui struk", "Update the receipt"), manifest: "rollback" },
        { title: T("Verifikasi dengan doctor", "Verify with doctor"), doctor: true },
      ],
      notTouched: [T("Kode kamu — hanya pin submodule yang berubah", "Your code — only the submodule pin changes")],
    });
  }
  if (req.method === "POST" && url === "/api/update-plan") {
    return json(res, 200, {
      steps: [
        { title: T("Catat titik rollback", "Record a rollback point") },
        { title: T("Tarik versi terbaru", "Pull the latest version"), cmd: "git submodule update --remote " + SUBMODULE_DIR },
        { title: T("Perbarui struk", "Update the receipt"), manifest: "update" },
        { title: T("Verifikasi dengan doctor", "Verify with doctor"), doctor: true },
      ],
      notTouched: [T("Kode kamu — hanya pin submodule yang berubah", "Your code — only the submodule pin changes")],
      remains: [T("Versi lama bisa dikembalikan satu klik dari tab Versi", "The old version is one click away in the Versions tab")],
    });
  }
  if (req.method === "POST" && url === "/api/remote-plan") {
    const b = await body(req);
    if (!b.url) return json(res, 200, { error: T("URL kosong.", "Empty URL.") });
    return json(res, 200, {
      steps: [
        { title: T("Arahkan submodule ke URL baru", "Point the submodule at the new URL"), cmd: 'git submodule set-url ' + SUBMODULE_DIR + ' "' + b.url + '"' },
        { title: T("Sinkronkan konfigurasi git", "Sync the git config"), cmd: "git submodule sync " + SUBMODULE_DIR },
        { title: T("Pastikan URL baru berisi design system yang benar", "Verify the new URL really holds this design system"), verify: true },
      ],
      notTouched: [T("Isi folder design-system/ — hanya remote yang berubah", "The design-system/ contents — only the remote changes")],
    });
  }
  if (req.method === "POST" && url === "/api/panel-update-plan") {
    const src = path.join(SUBMODULE_DIR, "tools", "ds-setup.cjs");
    if (!fs.existsSync(abs(src))) return json(res, 200, { error: T("Panel terbaru tidak ditemukan di design system.", "No newer panel found inside the design system.") });
    return json(res, 200, {
      steps: [
        { title: T("Salin panel saat ini ke .ds/.trash/", "Copy the current panel to .ds/.trash/") },
        { title: T("Timpa dengan versi dari design system", "Overwrite with the version from the design system") },
        { title: T("Panel perlu di-restart setelahnya", "The panel must be restarted afterwards") },
      ],
      notTouched: [T("Semua file lain", "Every other file")],
    });
  }

  /* ---- mutating ---- */
  if (req.method === "POST" && url === "/api/apply") {
    if (LOCKED.install) return json(res, 400, { error: T("Install sudah dijalankan di sesi ini.", "Install already ran in this session.") });
    const cfg = await body(req);
    const plan = buildInstallPlan(cfg);
    if (plan.error) return json(res, 400, plan);
    const r = await execSteps(plan.steps);
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    if (r.ok) { LOCKED.install = true; LOCKED.revert = false; }
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/revert") {
    if (LOCKED.revert) return json(res, 400, { error: T("Uninstall sudah dijalankan di sesi ini.", "Uninstall already ran in this session.") });
    const cfg = await body(req);
    const plan = buildRevertPlan(cfg);
    if (plan.error) return json(res, 400, plan);
    appendHistory({ event: "revert", actor: actorId() });
    const r = await execSteps(plan.steps);
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    if (r.ok) { LOCKED.revert = true; LOCKED.install = false; }
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/legacy-clean") {
    if (LOCKED.legacy) return json(res, 400, { error: T("Sudah dijalankan di sesi ini.", "Already ran in this session.") });
    const b = await body(req);
    if (String(b.confirm || "").trim().toUpperCase() !== LEGACY_PHRASE) return json(res, 400, { error: T("Frasa konfirmasi salah.", "Wrong confirmation phrase.") });
    const lg = detectLegacy();
    if (!lg.found) return json(res, 400, { error: T("Tidak ada yang perlu dibersihkan.", "Nothing to clean.") });
    const steps = lg.items.map((it) => it.rmrf
      ? { title: T("Hapus " + it.path, "Remove " + it.path), rmrf: it.rmrf, gitUntrack: true }
      : { title: T("Bersihkan " + it.path, "Clean " + it.path), edit: it.edit });
    for (const it of lg.items) if (it.rmrf) toTrash(it.rmrf);
    const r = await execSteps(steps);
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    if (r.ok) LOCKED.legacy = true;
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/update") {
    if (LOCKED.update) return json(res, 400, { error: T("Update sudah dijalankan di sesi ini.", "Update already ran in this session.") });
    const cfg = await body(req);
    const before = detectState().subCommit;
    writeFile(ROLLBACK, JSON.stringify({ fromCommit: before, at: new Date().toISOString(), wizard: WIZARD_VERSION }, null, 2) + "\n");
    const steps = [{ title: T("Tarik versi terbaru", "Pull the latest version"), cmd: "git submodule update --remote " + SUBMODULE_DIR }];
    steps.push({ title: T("Perbarui struk", "Update the receipt"), manifest: "update" });
    if (cfg.commit) steps.push({ title: T("Commit kenaikan versi", "Commit the version bump"), commit: true, commitMsg: "chore: bump design-system" });
    steps.push({ title: T("Verifikasi dengan doctor", "Verify with doctor"), doctor: true });
    const r = await execSteps(steps);
    r.before = before; r.after = detectState().subCommit;
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    if (r.ok) LOCKED.update = true;
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/rollback") {
    if (LOCKED.rollback) return json(res, 400, { error: T("Rollback sudah dijalankan di sesi ini.", "Rollback already ran in this session.") });
    let rb = null; try { rb = JSON.parse(readIf(ROLLBACK)); } catch {}
    if (!rb || !rb.fromCommit) return json(res, 400, { error: T("Belum ada titik rollback.", "No rollback point recorded.") });
    const r = await execSteps([
      { title: T("Kembalikan ke " + rb.fromCommit, "Return to " + rb.fromCommit), cmd: 'git -C "' + abs(SUBMODULE_DIR) + '" checkout ' + rb.fromCommit },
      { title: T("Perbarui struk", "Update the receipt"), manifest: "rollback" },
      { title: T("Verifikasi dengan doctor", "Verify with doctor"), doctor: true },
    ]);
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    if (r.ok) LOCKED.rollback = true;
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/restore") {
    const b = await body(req);
    const m = loadManifest();
    const e = m ? m.managed.filter((x) => x.path === b.file)[0] : null;
    if (!e) return json(res, 400, { error: T("Tidak ada di struk.", "Not in the receipt.") });
    const bak = toTrash(e.path);
    if (e.mode === "file") writeFile(e.path, PAYLOADS[e.path]);
    else if (e.mode === "block") { const src = readIf(e.path) || ""; writeFile(e.path, extractBlock(src) != null ? src.replace(extractBlock(src), markedBlock(e.path).trim()) : src.replace(/\n*$/, "\n\n") + markedBlock(e.path)); }
    else if (e.mode === "gitblock") { const src = readIf(e.path) || ""; writeFile(e.path, extractHashBlock(src) != null ? src.replace(extractHashBlock(src), hashBlock(e.path).trim()) : src.replace(/\n*$/, "\n\n") + hashBlock(e.path)); }
    else if (e.mode === "line") {
      const src = readIf(e.path);
      const stripped = removeManagedLine(src, e.kind);
      const p = e.kind === "tw" ? planTailwindEdit(stripped) : planNuxtEdit(stripped, e.path);
      if (p.changed) writeFile(e.path, p.out);
    }
    const nm = loadManifest();
    nm.managed = surveyManaged(); nm.updatedAt = new Date().toISOString();
    saveManifest(nm);
    appendHistory({ event: "restore", file: e.path, actor: actorId() });
    return json(res, 200, { ok: true, backup: bak });
  }
  if (req.method === "POST" && url === "/api/adopt") {
    if (!detectState().unmanaged) return json(res, 400, { error: T("Sudah punya struk.", "Already has a receipt.") });
    /* add markers to any config lines that predate them — content unchanged */
    for (const kind of ["tw", "css"]) {
      const file = kind === "tw" ? "tailwind.config.js" : nuxtConfigName();
      const src = readIf(file); if (src == null) continue;
      const needle = kind === "tw" ? "design-system/dist/tailwind.preset" : "design-system/dist/variables.css";
      if (!src.includes(needle) || src.split("\n").some((l) => l.includes(needle) && l.includes(LINE_MARK))) continue;
      toTrash(file);
      writeFile(file, src.split("\n").map((l) => (l.includes(needle) && !l.includes(LINE_MARK)) ? l.replace(/\s*$/, " " + LINE_MARK) : l).join("\n"));
    }
    const pre = [];
    for (const g of Object.keys(GIT_BLOCKS)) {
      const cur = readIf(g);
      if (extractHashBlock(cur) != null) continue;
      pre.push(cur == null
        ? { title: T("Buat " + g, "Create " + g), write: g }
        : { title: T("Tambahkan bagian design-system di akhir " + g, "Append the design-system section to " + g), append: g });
    }
    const r = await execSteps(pre.concat([{ title: T("Tulis struk baseline", "Write the baseline receipt"), manifest: "adopt" }]));
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/remote-apply") {
    const b = await body(req);
    if (!b.url) return json(res, 400, { error: T("URL kosong.", "Empty URL.") });
    const r = await execSteps([
      { title: T("Arahkan ke URL baru", "Point at the new URL"), cmd: 'git submodule set-url ' + SUBMODULE_DIR + ' "' + b.url + '"' },
      { title: T("Sinkronkan", "Sync"), cmd: "git submodule sync " + SUBMODULE_DIR },
      { title: T("Verifikasi", "Verify"), verify: true },
      { title: T("Perbarui struk", "Update the receipt"), manifest: "remote-change" },
    ]);
    PROGRESS = { active: false, current: 0, total: 0, label: T("", "") };
    return json(res, 200, r);
  }
  if (req.method === "POST" && url === "/api/panel-update") {
    if (LOCKED.panel) return json(res, 400, { error: T("Sudah dijalankan.", "Already ran.") });
    const src = abs(path.join(SUBMODULE_DIR, "tools", "ds-setup.cjs"));
    if (!fs.existsSync(src)) return json(res, 400, { error: T("Tidak ditemukan.", "Not found.") });
    const self = path.resolve(__filename);
    const bak = toTrash(path.relative(ROOT, self).split(path.sep).join("/"));
    fs.copyFileSync(src, self);
    LOCKED.panel = true;
    appendHistory({ event: "panel-update", actor: actorId() });
    return json(res, 200, { ok: true, backup: bak, message: T("Panel diperbarui. Tutup lalu jalankan lagi: node ds-setup.cjs", "Panel updated. Close this and run it again: node ds-setup.cjs") });
  }
  if (req.method === "POST" && url === "/api/change-request") {
    const b = await body(req);
    return json(res, 200, buildChangeRequest(b.file, b.reason, b.lang));
  }
  if (req.method === "POST" && url === "/api/shutdown") { json(res, 200, { ok: true }); return setTimeout(() => process.exit(0), 120); }

  return json(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  const url = "http://127.0.0.1:" + PORT + "/";
  console.log("\n  E-Systems Design System — panel v" + WIZARD_VERSION);
  console.log("  " + url + "   (127.0.0.1 only, Ctrl+C to stop)\n");
  if (!NO_OPEN) {
    const cmd = process.platform === "win32" ? 'start "" "' + url + '"' : process.platform === "darwin" ? 'open "' + url + '"' : 'xdg-open "' + url + '"';
    exec(cmd, () => {});
  }
});
