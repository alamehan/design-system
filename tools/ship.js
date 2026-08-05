#!/usr/bin/env node
/* ship.js — ONE command for the whole author-side release chain.
 *
 *   node tools/ship.js
 *
 * Runs, in the only order that is correct, and stops at the first failure:
 *   1. build.js            compile + validate every token ref + audit assets
 *   2. split-catalog.js    regenerate the AI grounding catalog
 *   3. stamp-reference.js  single-source the version stamp into reference/
 *   4. lint-reference.js   reference integrity: token purity, fonts, icons, class/asset/var resolution
 *   4b. lint-typography.js  reference sizes match the spec JSONs
 *   4c. visual-audit.py     renders every reference file and checks overflow / ghosts / fonts / ramp
 *   5. validate-pages.py   page specs: refs resolve, geometry present
 *   6. build-wizard.js     bundle tools/dashboard/ -> tools/ds-setup.cjs
 *   7. contract-check.js   refuse breaking changes without a MAJOR + alias
 *
 * Nothing here is optional and nothing here is remembered by a human.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..");
const meta = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8"));

const steps = [
  ["Build tokens + specs", "node src/scripts/build.js"],
  ["Split AI catalog", "node src/scripts/split-catalog.js"],
  ["Stamp reference files", "node src/scripts/stamp-reference.js"],
  ["Lint reference (integrity)", "node src/scripts/lint-reference.js"],
  ["Lint typography (spec conformance)", "node src/scripts/lint-typography.js"],
  ["Visual audit (headless Chromium)", "python3 src/scripts/visual-audit.py"],
  ["Lint docs (numbers match the repo)", "node src/scripts/lint-docs.js"],
  ["Validate page specs", "python3 src/scripts/validate-pages.py"],
  ["Bundle dashboard", "node tools/build-wizard.js"],
  ["Contract check (regression gate)", "node src/scripts/contract-check.js"],
  /* Regenerating the adoption report here means the file the panel reads is never
     older than the release. A developer opening the panel should never be told to
     run a script to see team numbers - that is the maintainer's job, and this is
     the maintainer's release command. */
  ["Verify clone-traffic merge (offline self-test)", "node src/scripts/clone-traffic.js --self-test"],
  ["Sample clone traffic (skips without a token)", "node src/scripts/clone-traffic.js"],
  ["Refresh adoption report", "node src/scripts/adoption-report.js"],
];

const bar = "\u2500".repeat(58);
console.log(`\nship \u2014 E-Systems Design System v${meta.version} (wizard ${meta.wizardVersion})`);
console.log(bar);

let n = 0;
for (const [label, cmd] of steps) {
  n++;
  process.stdout.write(`${String(n).padStart(2)}. ${label.padEnd(36)}`);
  try {
    const out = execSync(cmd, { cwd: DS, encoding: "utf8", stdio: "pipe" });
    console.log("ok");
    const tail = out.trim().split("\n").filter(Boolean).slice(-2);
    tail.forEach((l) => console.log("      " + l.trim()));
  } catch (e) {
    console.log("FAILED");
    console.log(bar);
    const out = [e.stdout, e.stderr].filter(Boolean).map(String).join("\n").trim();
    console.error(out || e.message);
    console.log(bar);
    console.error(`\nStopped at step ${n}: ${label}. Nothing was released.`);
    process.exit(1);
  }
}

console.log(bar);

/* The delivery ZIP carries a second copy of ds-setup.cjs at portal-nuxt-package/ds-setup.cjs.
   It is a build output, and until v3.5.2 nothing refreshed it — so a release could ship a panel
   at one version beside a copy of that panel at another, with nothing anywhere reporting it.
   START-HERE law #47: a second copy of a fact is a second thing to keep true. The release makes
   it true rather than trusting anybody to remember. */
{
  const built = path.join(DS, "tools", "ds-setup.cjs");
  const copy = path.resolve(DS, "..", "portal-nuxt-package", "ds-setup.cjs");
  if (fs.existsSync(path.dirname(copy))) {
    const same = fs.existsSync(copy) && fs.readFileSync(copy).equals(fs.readFileSync(built));
    if (!same) {
      fs.copyFileSync(built, copy);
      console.log("\u21bb refreshed portal-nuxt-package/ds-setup.cjs from the new build");
    }
  }
}

/* the only thing left that a human must decide */
const dirty = (() => {
  try { return execSync("git status --porcelain", { cwd: DS, encoding: "utf8" }).trim(); } catch { return ""; }
})();

console.log(`\u2705 All ${steps.length} checks passed for v${meta.version}.\n`);
if (dirty) {
  const files = dirty.split("\n").length;
  console.log(`${files} file(s) changed. Review, then:`);
  console.log(`   git add -A && git commit -m "release: v${meta.version}"`);
  console.log(`   git tag v${meta.version} && git push --follow-tags`);
  console.log(`\nAfter the tag lands, freeze the new baseline:`);
  console.log(`   node src/scripts/contract-check.js --accept && git commit -am "chore: contract baseline v${meta.version}"`);
} else {
  console.log("Working tree clean \u2014 nothing to release.");
}
