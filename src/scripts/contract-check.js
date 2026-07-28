#!/usr/bin/env node
/* contract-check.js — the pre-release regression gate.
 *
 * build.js proves the design system is internally consistent. It cannot tell
 * you that a token a consumer depends on was renamed out from under them.
 * This does.
 *
 * It compares the current build against `.release/contract.json` (the snapshot
 * committed at the last release) and refuses breaking changes unless the
 * version bump is MAJOR and a deprecation alias exists.
 *
 *   node src/scripts/contract-check.js            verify (CI)
 *   node src/scripts/contract-check.js --accept   write the current state as the new baseline
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..", "..");
const CONTRACT = path.join(DS, ".release", "contract.json");
const ACCEPT = process.argv.includes("--accept");

const meta = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8"));

/* ---------------- collect the current public surface ---------------- */
function currentSurface() {
  const css = fs.readFileSync(path.join(DS, "dist", "variables.css"), "utf8");
  const root = css.split(":root {")[1].split("}")[0];

  const cssVars = [...new Set((root.match(/--[\w-]+(?=\s*:)/g) || []))].sort();
  const tsClasses = [...new Set((css.match(/^\.ts-[\w-]+/gm) || []))].sort();

  const compDir = path.join(DS, "src", "components");
  const specCodes = [];
  const componentIds = [];
  const enumProps = {};

  for (const f of fs.readdirSync(compDir).filter((x) => x.endsWith(".json")).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(compDir, f), "utf8"));
    if (d.code) specCodes.push(d.code);
    if (d.id) componentIds.push(d.id);
    for (const [k, v] of Object.entries(d.props || {})) {
      if (v && v.type === "enum" && Array.isArray(v.values)) {
        enumProps[`${d.code}.${k}`] = [...v.values].sort();
      }
    }
  }

  const preset = require(path.join(DS, "dist", "tailwind.preset.js"));
  const colorKeys = Object.keys(preset.theme.extend.colors || {}).sort();

  return {
    version: meta.version,
    cssVars,
    tsClasses,
    colorKeys,
    specCodes: specCodes.sort(),
    componentIds: componentIds.sort(),
    enumProps,
  };
}

/* ---------------- semver helpers ---------------- */
const parse = (v) => v.split(".").map(Number);
function bumpKind(from, to) {
  const [aM, am, ap] = parse(from);
  const [bM, bm, bp] = parse(to);
  if (bM > aM) return "major";
  if (bM === aM && bm > am) return "minor";
  if (bM === aM && bm === am && bp > ap) return "patch";
  if (from === to) return "same";
  return "downgrade";
}

/* ---------------- deprecation aliases ---------------- */
/* A removal is allowed on MAJOR only if the old name still resolves — i.e. an
   alias is declared in .release/deprecations.json:
     { "--color-old-name": { "since": "3.0.0", "use": "--color-new-name" } }   */
function loadDeprecations() {
  const p = path.join(DS, ".release", "deprecations.json");
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
}

/* ---------------- run ---------------- */
const cur = currentSurface();

if (ACCEPT) {
  fs.mkdirSync(path.dirname(CONTRACT), { recursive: true });
  fs.writeFileSync(CONTRACT, JSON.stringify(cur, null, 2) + "\n", "utf8");
  console.log(`contract-check: baseline written for v${cur.version}`);
  console.log(`  ${cur.cssVars.length} css vars \u00b7 ${cur.tsClasses.length} text styles \u00b7 ${cur.specCodes.length} specs \u00b7 ${cur.colorKeys.length} color keys`);
  process.exit(0);
}

if (!fs.existsSync(CONTRACT)) {
  console.log("\u2139\ufe0f  No baseline yet (.release/contract.json missing).");
  console.log("   This is expected on the first release after contract-check was introduced.");
  console.log("   Establish it with:  node src/scripts/contract-check.js --accept");
  process.exit(0);
}

const base = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
const dep = loadDeprecations();
const kind = bumpKind(base.version, cur.version);

const breaking = [];
const additive = [];

function diffList(label, a, b, allowAlias) {
  const removed = a.filter((x) => !b.includes(x));
  const added = b.filter((x) => !a.includes(x));
  for (const r of removed) {
    if (allowAlias && dep[r]) continue; // covered by a deprecation alias
    breaking.push(`${label} removed: ${r}`);
  }
  for (const x of added) additive.push(`${label} added: ${x}`);
}

diffList("css var", base.cssVars, cur.cssVars, true);
diffList("text style", base.tsClasses, cur.tsClasses, true);
diffList("color key", base.colorKeys, cur.colorKeys, true);
diffList("spec code", base.specCodes, cur.specCodes, false);
diffList("component id", base.componentIds, cur.componentIds, false);

for (const key of Object.keys(base.enumProps)) {
  const before = base.enumProps[key];
  const after = cur.enumProps[key];
  if (!after) { breaking.push(`enum prop removed: ${key}`); continue; }
  const gone = before.filter((v) => !after.includes(v));
  if (gone.length) breaking.push(`enum value removed: ${key} \u2192 ${gone.join(", ")}`);
  const grew = after.filter((v) => !before.includes(v));
  if (grew.length) additive.push(`enum value added: ${key} \u2192 ${grew.join(", ")}`);
}
for (const key of Object.keys(cur.enumProps)) {
  if (!base.enumProps[key]) additive.push(`enum prop added: ${key}`);
}

/* required bump */
const required = breaking.length ? "major" : additive.length ? "minor" : "patch";
const rank = { patch: 0, minor: 1, major: 2 };

console.log(`\ncontract-check \u2014 v${base.version} \u2192 v${cur.version} (${kind})`);
console.log("\u2500".repeat(58));

if (breaking.length) {
  console.log(`${breaking.length} BREAKING change(s):`);
  breaking.forEach((b) => console.log("  \u274c " + b));
}
if (additive.length) {
  console.log(`${additive.length} additive change(s):`);
  additive.slice(0, 12).forEach((a) => console.log("  + " + a));
  if (additive.length > 12) console.log(`  \u2026 and ${additive.length - 12} more`);
}
if (!breaking.length && !additive.length) console.log("No public-surface changes.");

console.log("\u2500".repeat(58));

let fail = false;

if (kind === "downgrade") {
  console.error(`\u274c version.json (${cur.version}) is lower than the baseline (${base.version}).`);
  fail = true;
} else if (kind === "same" && (breaking.length || additive.length)) {
  console.error(`\u274c The public surface changed but version.json is still ${cur.version}. Required bump: ${required.toUpperCase()}.`);
  fail = true;
} else if (rank[kind] < rank[required]) {
  console.error(`\u274c Version bump is ${kind.toUpperCase()} but the changes require ${required.toUpperCase()}.`);
  if (breaking.length) {
    console.error("   Breaking removals need a MAJOR bump AND a deprecation alias in .release/deprecations.json,");
    console.error("   kept for one minor cycle (CLAUDE.md \u00a7 Versioning contract).");
  }
  fail = true;
} else {
  console.log(`\u2705 ${kind.toUpperCase()} bump is appropriate (required: ${required.toUpperCase()}).`);
}

if (fail) process.exit(1);
