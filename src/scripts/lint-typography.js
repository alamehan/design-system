#!/usr/bin/env node
/* lint-typography.js — typography conformance for the reference tier.
 *
 * WHY THIS EXISTS
 * ---------------
 * `lint-reference.js` proved the reference is token-pure and draws real icons, and it still
 * passed while three whole sections rendered at the wrong size: the DataTable / TableColumn /
 * TableRow showcases used `ts-*-body-sm` (12px) where their specs say `body-md` (14px), and the
 * StatusChip — a SINGLE-size component per spec — appeared at `label-sm` (11px) inside tables.
 * Nothing caught it because purity is not conformance. Sizes come from the spec JSONs, so the
 * spec JSONs are what we check against.
 *
 * HISTORY.md law #5: every lesson becomes a gate.
 *
 *   node src/scripts/lint-typography.js
 */
const fs = require("fs");
const path = require("path");

const DS = path.resolve(__dirname, "..", "..");
const REF = path.join(DS, "reference");
const SPECS = path.join(DS, "src", "components");

/* root CSS class -> the spec whose `text-style` governs it.
   `token` picks which text-style entry inside that spec applies to the root element. */
/* Documented scoped density zones: a sub-component that carries its own padding tokens is
   allowed its own step on the type ramp. `.es-toast__action` has padding xxs/lg where a plain
   Button has sm/lg — it is a smaller control on purpose, not drift. Add to this list ONLY with
   a spec-level justification, never to silence a finding. */
const DENSITY_ZONES = ["es-toast__action"];

const BINDINGS = [
  { cls: "es-btn", spec: "atom-01", token: "base.font-style" },
  { cls: "es-status", spec: "atom-06", token: "base.font-style" },
  { cls: "es-tabs__tab", spec: "atom-16", token: "base.item-font-style" },
  { cls: "es-bc__item", spec: "atom-14", token: null, expect: "bold.body-md" },
  { cls: "es-bc__current", spec: "atom-14", token: null, expect: "bold.body-md" },
  { cls: "es-col", spec: "layout-10", token: "base.text-style" },
  { cls: "es-cell", spec: "layout-11", token: "base.text-style" },
  { cls: "es-pg", spec: "layout-03", token: "base.text-style" },
];

function dig(obj, dotted) {
  return dotted.split(".").reduce((a, k) => (a == null ? a : a[k]), obj);
}

function specStyle(code, token, fallback) {
  if (!token) return fallback;
  const file = fs.readdirSync(SPECS).find((f) => f.startsWith(code + "-") && f.endsWith(".json"));
  if (!file) return fallback;
  const d = JSON.parse(fs.readFileSync(path.join(SPECS, file), "utf8"));
  const v = dig(d.tokens || {}, token);
  return typeof v === "string" ? v.replace(/^text-styles\./, "") : fallback;
}

/* text-styles.bold.body-md  ->  ts-bold-body-md */
const tsClass = (style) => "ts-" + style.replace(/\./g, "-");

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(path.join(dir, e.name))
      : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
}

let violations = 0;
let checked = 0;

const expected = BINDINGS.map((b) => ({ ...b, want: tsClass(specStyle(b.spec, b.token, b.expect)) }));

for (const f of htmlFiles(REF)) {
  const rel = path.relative(DS, f);
  const html = fs.readFileSync(f, "utf8");
  for (const attr of html.match(/class="[^"]*"/g) || []) {
    const classes = attr.slice(7, -1).split(/\s+/);
    for (const b of expected) {
      if (!classes.includes(b.cls)) continue;
      if (classes.some((c) => DENSITY_ZONES.includes(c))) continue;
      const ts = classes.filter((c) => c.startsWith("ts-"));
      checked++;
      if (ts.length === 0) {
        // a root element may inherit from an ancestor that carries the class; only flag a
        // WRONG ts-*, never a missing one, to avoid punishing legitimate inheritance.
        continue;
      }
      if (!ts.includes(b.want)) {
        violations++;
        console.log(`  \u274c ${rel}: .${b.cls} carries ${ts.join(" ")} \u2014 ${b.spec} says ${b.want}`);
      }
    }
  }
}

console.log("");
if (violations) {
  console.log(`\u274c ${violations} typography drift(s) across ${checked} spec-bound element(s).`);
  console.log("   The size of a component is spec data, not a per-specimen styling choice.");
  console.log("   Fix the ts-* class in the reference HTML, or change the spec on purpose.");
  process.exit(1);
}
console.log(`\u2705 typography matches the specs (${checked} spec-bound element(s) checked).`);
