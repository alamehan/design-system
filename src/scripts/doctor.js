#!/usr/bin/env node
/*
 * doctor.js — READ-ONLY consumer diagnosis. Never writes a single file.
 * Run from anywhere inside a consumer repo that contains this design system
 * as a submodule/folder:  node design-system/src/scripts/doctor.js
 */
const fs = require("fs");
const path = require("path");

const DS_ROOT = path.resolve(__dirname, "..", "..");
const results = [];
const add = (level, name, msg) => results.push({ level, name, msg });
const read = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return null; } };

// ---- locate consumer root (walk up from DS root looking for nuxt/package config)
function findConsumerRoot() {
  let dir = path.dirname(DS_ROOT);
  for (let i = 0; i < 4; i++) {
    if (["nuxt.config.js", "nuxt.config.ts", "package.json"].some((f) => fs.existsSync(path.join(dir, f)))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ---- 1. Design system integrity
(function checkDsIntegrity() {
  const required = ["CLAUDE.md", "catalog/INDEX.md", "catalog/TOKENS.md", "dist/tailwind.preset.js", "dist/variables.css", "reference/gallery.html"];
  const missing = required.filter((f) => !fs.existsSync(path.join(DS_ROOT, f)));
  if (missing.length) add("FAIL", "ds-integrity", `design-system folder incomplete (empty submodule?). Missing: ${missing.join(", ")}. Fix: git submodule update --init`);
  else add("PASS", "ds-integrity", "design-system folder complete (catalog, dist, reference present)");
})();

const consumerRoot = findConsumerRoot();
if (!consumerRoot) {
  add("WARN", "consumer", "No consumer project found above this folder — running standalone (author mode). Consumer checks skipped.");
} else {
  add("PASS", "consumer", `Consumer project: ${consumerRoot}`);
  const twText = read(path.join(consumerRoot, "tailwind.config.js"));
  const nuxtText = read(path.join(consumerRoot, "nuxt.config.js")) || read(path.join(consumerRoot, "nuxt.config.ts"));

  // ---- 2. Adoption level detection
  const presetWired = !!(twText && /design-system[\/\\]dist[\/\\]tailwind\.preset/.test(twText));
  const cssWired = !!(nuxtText && /design-system[\/\\]dist[\/\\]variables\.css/.test(nuxtText));
  if (presetWired && cssWired) add("PASS", "adoption", "Level 1 — live tokens (preset + variables.css wired)");
  else if (!presetWired && !cssWired) add("PASS", "adoption", "Level 0 — reference-only (zero wiring; valid and safe)");
  else add("WARN", "adoption", `Half-wired Level 1: preset ${presetWired ? "OK" : "MISSING"}, variables.css ${cssWired ? "OK" : "MISSING"}. Wire both or neither (see SETUP.md).`);

  // ---- 3. Config drift (only meaningful pre-Level-2, best-effort textual checks)
  if (twText) {
    const camel = new Set((twText.match(/^\s{4,}([a-zA-Z][a-zA-Z0-9]*)\s*:\s*["']#/gm) || []).map((s) => s.trim().split(":")[0]));
    if (presetWired) {
      // collision: consumer borderRadius/height at TOP LEVEL would shadow the preset
      for (const key of ["borderRadius", "screens", "fontSize", "spacing", "height"]) {
        const topLevel = new RegExp(`^\\s{2}${key}\\s*:`, "m").test(twText);
        if (topLevel) add("WARN", "config-drift", `Top-level \`${key}\` in tailwind.config.js overrides the preset's \`${key}\` entirely. Confirm this is intended (Config Contract).`);
      }
    }
    if (camel.size) add("INFO", "legacy-colors", `${camel.size} frozen camelCase hex colors detected in tailwind.config.js (expected at Level 0; alias them at Level 2 for dark-mode support).`);
  } else add("WARN", "config", "tailwind.config.js not found in consumer root");

  // ---- 4. Bindings map check (Self-Healing Map Law support)
  const bindingsPath = path.join(consumerRoot, ".ds", "bindings.md");
  const bindings = read(bindingsPath);
  if (!bindings) add("WARN", "bindings", ".ds/bindings.md not found — AI will fall back to repo inspection (slower). See CLAUDE.md §4.");
  else {
    // verify every referenced component file still exists
    const refs = [...new Set((bindings.match(/`(components\/[^`]+\.vue)`/g) || []).map((s) => s.slice(1, -1)))];
    const dead = refs.filter((r) => !fs.existsSync(path.join(consumerRoot, r)));
    if (dead.length) add("FAIL", "bindings-paths", `Stale component paths in .ds/bindings.md (update the map!): ${dead.join(", ")}`);
    else add("PASS", "bindings-paths", `${refs.length} component paths in bindings map all exist`);
    // verify referenced legacy color names still exist in tailwind config
    if (twText) {
      const colorRefs = [...new Set((bindings.match(/tw-(?:bg|text|border)-[a-zA-Z][a-zA-Z0-9]*(?![a-zA-Z0-9-])/g) || []).map((s) => s.replace(/^tw-(?:bg|text|border)-/, "")))];
      const deadColors = colorRefs.filter((c) => !new RegExp(`["'\\s]${c}\\s*:`).test(twText) && !presetWired);
      if (deadColors.length) add("FAIL", "bindings-tokens", `Color names in bindings map missing from tailwind.config.js: ${deadColors.join(", ")}`);
      else if (colorRefs.length) add("PASS", "bindings-tokens", `${colorRefs.length} color utilities in bindings map resolve`);
    }
    const stamp = (bindings.match(/ds-version:\s*([\w.\-]+)/) || [])[1];
    if (stamp) add("INFO", "bindings-version", `bindings map written against design system v${stamp}`);
  }

  // ---- 5. Submodule state
  const gitmodules = read(path.join(consumerRoot, ".gitmodules"));
  if (gitmodules && /design-system/.test(gitmodules)) add("PASS", "submodule", "design-system registered in .gitmodules (pinned by commit — you control upgrades)");
  else add("INFO", "submodule", "Not a git submodule (side-by-side/multi-root mode?). Updates are manual git pull.");
}

// ---- report
const icons = { PASS: "\u2705", WARN: "\u26a0\ufe0f ", FAIL: "\u274c", INFO: "\u2139\ufe0f " };
let fails = 0;
console.log("\nE-Systems DS doctor — read-only diagnosis\n" + "─".repeat(50));
for (const r of results) {
  if (r.level === "FAIL") fails++;
  console.log(`${icons[r.level]} [${r.name}] ${r.msg}`);
}
console.log("─".repeat(50));
console.log(fails ? `${fails} problem(s) found. Nothing was modified.` : "All good. Nothing was modified.");
process.exit(fails ? 1 : 0);
