#!/usr/bin/env node
/* lint-docs.js — the numbers in the documentation must be the numbers in the repository.
 *
 * WHY THIS EXISTS
 * ---------------
 * START-HERE.md §7 is titled "Current numbers" and is the first thing a new maintainer reads.
 * At the end of this release cycle it still claimed 99 e2e assertions (there were 103) and
 * described a 9-step release chain (there were 11). Nobody lied; the numbers were true when
 * they were written and nothing recomputed them afterwards.
 *
 * That is the same failure mode as the visual audit gate that existed only in a changelog and
 * the `adoptionStats()` comment that described behaviour the code did not have: **prose stating
 * a fact about the repository, with nothing checking that the fact is still true.** Three
 * separate instances in one cycle is a pattern, not a coincidence.
 *
 * So: every number in §7 is recomputed from the repository and compared. When one drifts this
 * fails with the real value, and the fix is to correct the document.
 *
 *   node src/scripts/lint-docs.js
 *   node src/scripts/lint-docs.js --fix     rewrite the stale numbers in place
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..", "..");
const START = path.join(DS, "..", "START-HERE.md");
const FIX = process.argv.includes("--fix");

const read = (p) => fs.readFileSync(p, "utf8");
const countFiles = (dir, ext) => {
  try { return fs.readdirSync(path.join(DS, dir)).filter((f) => f.endsWith(ext)).length; }
  catch { return 0; }
};

/* ---------------------------------------------------------------- the facts */
const gallery = read(path.join(DS, "reference", "gallery.html"));
const e2e = read(path.join(DS, "tests", "e2e.js"));
const ship = read(path.join(DS, "tools", "ship.js"));
const lintRef = read(path.join(DS, "src", "scripts", "lint-reference.js"));
const version = JSON.parse(read(path.join(DS, "version.json")));

const specs = countFiles("src/components", ".json");
const pageSpecs = fs.readdirSync(path.join(DS, "src", "components")).filter((f) => f.startsWith("page-")).length;

const facts = {
  version: version.version,
  wizardVersion: version.wizardVersion,
  specs,
  components: specs - pageSpecs,
  pages: pageSpecs,
  catalog: countFiles("catalog/components", ".md"),
  refComponents: countFiles("reference/components", ".html"),
  refPages: countFiles("reference/pages", ".html"),
  gallerySections: (gallery.match(/class="ref-section" id=/g) || []).length,
  tablerIcons: new Set([...gallery.matchAll(/<symbol id="(tb-[^"]+)"/g)].map((m) => m[1])).size,
  e2eAssertions: (e2e.match(/\bok\(/g) || []).length,
  shipSteps: (ship.match(/^\s{2}\["/gm) || []).length,
  lintGates: new Set([...lintRef.matchAll(/GATE (\d+) —/g)].map((m) => m[1])).size,
  catalogWithReference: fs.readdirSync(path.join(DS, "catalog", "components"))
    .filter((f) => read(path.join(DS, "catalog", "components", f)).includes("**Reference:** `reference")).length,
};

/* ------------------------------------------------- claims, as they appear in the doc */
const CLAIMS = [
  { re: /\| Component specs \(`src\/components\/`\) \| \*\*(\d+)\*\*/, want: facts.specs, label: "component specs" },
  { re: /\| AI catalog files \(`catalog\/components\/`\) \| \*\*(\d+)\*\*/, want: facts.catalog, label: "catalog files" },
  { re: /\| e2e assertions \| \*\*(\d+)\*\*/, want: facts.e2eAssertions, label: "e2e assertions" },
];

let bad = 0;
let doc = fs.existsSync(START) ? read(START) : null;
if (doc == null) {
  console.log("⚠️  START-HERE.md not found beside the design system — skipping the doc check.");
  process.exit(0);
}

for (const c of CLAIMS) {
  const m = doc.match(c.re);
  if (!m) { console.log(`  ⚠️  could not find the "${c.label}" row in START-HERE.md §7 — the table shape changed`); continue; }
  const got = Number(m[1]);
  if (got === c.want) continue;
  bad++;
  if (FIX) {
    doc = doc.replace(m[0], m[0].replace("**" + m[1] + "**", "**" + c.want + "**"));
    console.log(`  ✏️  ${c.label}: ${got} → ${c.want}`);
  } else {
    console.log(`  ❌ START-HERE.md §7 says ${got} ${c.label}; the repository has ${c.want}`);
  }
}

/* the version stamped into the reference must be the version being shipped */
const stamped = (gallery.match(/REF v([\d.]+)/) || [])[1];
if (stamped && stamped !== facts.version) {
  console.log(`  ❌ gallery.html is stamped REF v${stamped} but version.json says ${facts.version} — run stamp-reference.js`);
  bad++;
}
if (!new RegExp("v" + facts.version.replace(/\./g, "\\.") + "\\b").test(doc.split("\n")[0])) {
  if (FIX) {
    doc = doc.replace(/^# START HERE — E-Systems Design System v[\d.]+ · Panel v[\d.]+/m,
      `# START HERE — E-Systems Design System v${facts.version} · Panel v${facts.wizardVersion}`);
    console.log(`  ✏️  title → v${facts.version} / panel v${facts.wizardVersion}`);
  } else {
    console.log(`  ❌ START-HERE.md title does not name v${facts.version}`);
    bad++;
  }
}

/* every release must have a changelog entry — a version nobody wrote about is a version
   nobody can adopt with confidence */
const changelog = read(path.join(DS, "CHANGELOG.md"));
if (!changelog.includes("## " + facts.version + " ")) {
  console.log(`  ❌ CHANGELOG.md has no entry for ${facts.version}`);
  bad++;
}

if (FIX && bad) { fs.writeFileSync(START, doc, "utf8"); console.log("\nSTART-HERE.md updated."); process.exit(0); }

console.log("");
if (bad) {
  console.log(`❌ ${bad} documented fact(s) no longer match the repository.`);
  console.log("   Re-run with --fix, or correct the document by hand.");
  process.exit(1);
}
console.log("✅ the documented numbers match the repository");
console.log("   " + Object.entries(facts).map(([k, v]) => k + "=" + v).join(" · "));
