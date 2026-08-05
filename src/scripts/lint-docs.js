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
const variables = read(path.join(DS, "dist", "variables.css"));
const preset = read(path.join(DS, "dist", "tailwind.preset.js"));
const catDir = path.join(DS, "catalog", "components");
const catFiles = fs.readdirSync(catDir).map((f) => read(path.join(catDir, f)));

const facts = {
  version: version.version,
  wizardVersion: version.wizardVersion,
  specs,
  components: specs - pageSpecs,
  pages: pageSpecs,
  catalog: countFiles("catalog/components", ".md"),
  rootVars: new Set(variables.split(":root {")[1].split("}")[0].match(/--[\w-]+(?=\s*:)/g) || []).size,
  darkVars: new Set((variables.match(/\.dark\s*\{[\s\S]*?\}/) || [""])[0].match(/--[\w-]+(?=\s*:)/g) || []).size,
  textStyles: new Set(variables.match(/^\.ts-[\w-]+/gm) || []).size,
  tailwindColours: (() => {
    try {
      const p = require(path.join(DS, "dist", "tailwind.preset.js"));
      return Object.keys((p.theme && (p.theme.colors || (p.theme.extend || {}).colors)) || {}).length;
    } catch { return (preset.match(/^\s{6}"/gm) || []).length; }
  })(),
  refComponents: countFiles("reference/components", ".html"),
  refPages: countFiles("reference/pages", ".html"),
  gallerySections: (gallery.match(/class="ref-section" id=/g) || []).length,
  tablerIcons: new Set([...gallery.matchAll(/<symbol id="(tb-[^"]+)"/g)].map((m) => m[1])).size,
  panelKB: Math.round(fs.statSync(path.join(DS, "tools", "ds-setup.cjs")).size / 1024),
  i18nKeys: Object.keys(JSON.parse(read(path.join(DS, "tools", "dashboard", "i18n.json"))).id).length,
  e2eAssertions: (e2e.match(/\bok\(/g) || []).length,
  shipSteps: (ship.match(/^\s{2}\["/gm) || []).length,
  lintGates: new Set([...lintRef.matchAll(/GATE (\d+) —/g)].map((m) => m[1])).size,
  catalogReviewed: catFiles.filter((t) => t.includes("**Reference:** `reference")).length,
  catalogDerived: catFiles.filter((t) => t.includes("**Reference (DERIVED")).length,
};

/* ------------------------------------------------- claims, as they appear in the doc */
const CLAIMS = [
  { re: /\| Design tokens \(`dist\/variables\.css` `:root`\) \| \*\*(\d+)\*\*/, want: facts.rootVars, label: "root CSS variables" },
  { re: /\+ \*\*(\d+)\*\* dark overrides/, want: facts.darkVars, label: "dark overrides" },
  { re: /\+ \*\*(\d+)\*\* `\.ts-\*`/, want: facts.textStyles, label: "text style classes" },
  { re: /\| Tailwind colour keys \(`dist\/tailwind\.preset\.js`\) \| \*\*(\d+)\*\*/, want: facts.tailwindColours, label: "Tailwind colour keys" },
  { re: /\| Component specs \(`src\/components\/`\) \| \*\*(\d+)\*\*/, want: facts.specs, label: "component specs" },
  { re: /\*\*(\d+)\*\* components \+ \*\*\d+\*\* pages/, want: facts.components, label: "components" },
  { re: /\*\*\d+\*\* components \+ \*\*(\d+)\*\* pages/, want: facts.pages, label: "page specs" },
  { re: /\| AI catalog files \(`catalog\/components\/`\) \| \*\*(\d+)\*\*/, want: facts.catalog, label: "catalog files" },
  { re: /\| Reference components \| \*\*(\d+)\*\* files/, want: facts.refComponents, label: "reference components" },
  { re: /files \+ \*\*(\d+)\*\* standalone pages/, want: facts.refPages, label: "standalone reference pages" },
  { re: /standalone pages \+ a \*\*(\d+)\*\*-section gallery/, want: facts.gallerySections, label: "gallery sections" },
  { re: /\| Tabler icons inlined in the gallery sprite \| \*\*(\d+)\*\*/, want: facts.tablerIcons, label: "Tabler icons" },
  { re: /\| Panel bundle \| \*\*(\d+)\*\* KB/, want: facts.panelKB, label: "panel bundle KB" },
  { re: /\| Panel i18n keys \| \*\*(\d+)\*\*/, want: facts.i18nKeys, label: "i18n keys" },
  { re: /\| e2e assertions \| \*\*(\d+)\*\*/, want: facts.e2eAssertions, label: "e2e assertions" },
  { re: /\| Release chain steps \(`tools\/ship\.js`\) \| \*\*(\d+)\*\*/, want: facts.shipSteps, label: "release chain steps" },
  { re: /\| Reference integrity gates \(`lint-reference\.js`\) \| \*\*(\d+)\*\*/, want: facts.lintGates, label: "reference gates" },
  { re: /\| Catalog specs with a design-reviewed reference \| \*\*(\d+)\*\*/, want: facts.catalogReviewed, label: "design-reviewed references" },
  { re: /\| Catalog specs with a DERIVED reference[^|]*\| \*\*(\d+)\*\*/, want: facts.catalogDerived, label: "derived references" },
];

let bad = 0;
let doc = fs.existsSync(START) ? read(START) : null;
if (doc == null) {
  console.log("⚠️  START-HERE.md not found beside the design system — skipping the doc check.");
  process.exit(0);
}

for (const c of CLAIMS) {
  const m = doc.match(c.re);
  if (!m) {
    /* A row that stopped matching is not a smaller problem than a wrong number — it is the
       same problem one step earlier: the check quietly stops covering that fact. */
    console.log(`  ❌ the "${c.label}" row is no longer in START-HERE.md §7 in the shape this check reads` +
      ` — restore the row or update the pattern in lint-docs.js (repo value: ${c.want})`);
    bad++;
    continue;
  }
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

/* ---------------------------------------------------------------- the derived contract
 * The rule for using an unreviewed rendering is written in three places that must agree:
 * `build.js` stamps it onto every derived catalog entry, `split-catalog.js` repeats it at the
 * top of the index, and `CLAUDE.md` §1b is the long form both point at. Three copies of a
 * sentence is exactly how "pending design review" survived in the gallery while the catalog had
 * already moved on — so the label itself is now derived from one place and compared. */
const DERIVED_LABEL = "DERIVED — NOT design-reviewed · REFERENCE ONLY";
const carriers = [
  ["src/scripts/build.js", "the catalog reference line"],
  ["src/scripts/split-catalog.js", "the catalog INDEX header"],
  ["CLAUDE.md", "§1b"],
  ["tools/payloads/CLAUDE.md", "the consumer profile"],
];
for (const [rel, what] of carriers) {
  const text = read(path.join(DS, rel)).replace(/\\u2014/g, "—").replace(/\\u00b7/g, "·");
  if (text.includes(DERIVED_LABEL)) continue;
  console.log(`  ❌ ${rel} (${what}) no longer carries the derived label "${DERIVED_LABEL}"`);
  bad++;
}
if (!/§1b/.test(read(path.join(DS, "CLAUDE.md")))) {
  console.log("  ❌ CLAUDE.md has no §1b — the derived-reference rule every catalog entry points at");
  bad++;
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

/* ARCHITECTURE.md opens with "Regenerated for vX.Y.Z … Every number here was counted, not
   remembered." It then went four releases without being regenerated, describing a 7-step
   release chain and 99 assertions. Its counts now live in START-HERE §7 instead, and the one
   claim it still makes about itself — which version it was written against — is checked. */
const arch = read(path.join(DS, "docs", "ARCHITECTURE.md"));
if (!new RegExp("Regenerated for \\*\\*v" + facts.version.replace(/\./g, "\\.") + "\\*\\*").test(arch)) {
  const said = (arch.match(/Regenerated for \*\*v([\d.]+)\*\*/) || [, "nothing"])[1];
  console.log(`  ❌ docs/ARCHITECTURE.md says it was regenerated for v${said}; this release is v${facts.version}` +
    ` — reread it and update the line, or the map describes a repository that no longer exists`);
  bad++;
}
if (/^\| (?:CSS variables|Component specs|End-to-end assertions)/m.test(arch)) {
  console.log("  ❌ docs/ARCHITECTURE.md has grown its own counts table again — numbers live once, in START-HERE §7");
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
