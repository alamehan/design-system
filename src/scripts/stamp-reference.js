#!/usr/bin/env node
/* stamp-reference.js — single-source the version stamp across reference/.
 *
 * HISTORY.md law #2: "no visual verdict unless the on-screen stamp matches the
 * shipped version". That law is only enforceable if the stamps cannot drift, so
 * this script rewrites every `REF vX.Y.Z · generated YYYY-MM-DD` line from
 * version.json.
 *
 *   node src/scripts/stamp-reference.js          rewrite stamps
 *   node src/scripts/stamp-reference.js --check   fail if any stamp is stale (CI)
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..", "..");
const REF = path.join(DS, "reference");
const meta = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8"));
const CHECK = process.argv.includes("--check");

const want = `REF v${meta.version} \u00b7 generated ${meta.releasedAt}`;
const STAMP_RE = /REF v\d+\.\d+\.\d+ \u00b7 generated \d{4}-\d{2}-\d{2}/g;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = walk(REF);
let changed = 0;
const stale = [];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (!STAMP_RE.test(src)) {
    STAMP_RE.lastIndex = 0;
    continue;
  }
  STAMP_RE.lastIndex = 0;
  const out = src.replace(STAMP_RE, want);
  if (out !== src) {
    stale.push(path.relative(DS, f));
    if (!CHECK) fs.writeFileSync(f, out, "utf8");
    changed++;
  }
}

if (CHECK) {
  if (stale.length) {
    console.error(`\u274c ${stale.length} reference file(s) carry a stale version stamp:`);
    stale.forEach((s) => console.error("   " + s));
    console.error(`\nExpected: ${want}\nFix: node src/scripts/stamp-reference.js`);
    process.exit(1);
  }
  console.log(`\u2705 all ${files.length} reference files stamped ${want}`);
} else {
  console.log(`stamp-reference: ${changed} of ${files.length} file(s) restamped \u2192 ${want}`);
}
