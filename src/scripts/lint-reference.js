#!/usr/bin/env node
/* lint-reference.js — token-purity lint for reference/css (conformance-lite).
 * Fails if any reference CSS hardcodes a hex color or rgb() literal.
 * _base.css (gallery scaffolding) is exempt from px checks but not from hex,
 * except an explicit whitelisted white fallback. */
const fs = require("fs");
const path = require("path");

const DIR = path.resolve(__dirname, "..", "..", "reference", "css");
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
if (violations) {
  console.log(`\n${violations} hardcoded color(s) in reference/ — reference must be token-pure (var(--…) only).`);
  process.exit(1);
}
console.log("\u2705 reference/css is token-pure (no hardcoded hex/rgb).");
