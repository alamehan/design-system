#!/usr/bin/env node
/* e2e.js — drives the panel through its whole lifecycle against a throwaway
 * consumer repo and asserts at every step. Committed so it can be re-run.
 *
 *   node tests/e2e.js
 *
 * Covers: install -> receipt -> drift -> diff -> restore -> change request
 *         -> update -> impact -> rollback -> revert
 *         -> a v2.4.0-style repo -> "adopt this install"
 *         -> both locales render every key
 */
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const DS = path.resolve(__dirname, "..");
const PORT = 5199 + (process.pid % 300);
const BASE = "http://127.0.0.1:" + PORT;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok   " + m); } else { fail++; console.log("  FAIL " + m); } };
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(p, data) {
  const opt = data === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  const r = await fetch(BASE + p, opt);
  return r.json();
}

(async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ds-e2e-"));
  const origin = path.join(tmp, "origin");
  const app = path.join(tmp, "app");

  console.log("\ne2e — Design System panel");
  console.log("  workspace: " + tmp + "\n");

  /* ---------- a bare origin holding the design system ---------- */
  fs.cpSync(DS, origin, { recursive: true, filter: (s) => !s.includes(path.sep + ".git" + path.sep) && !s.endsWith(path.sep + ".git") });
  sh("git init -q -b main .", origin);
  sh("git config user.email ds@test && git config user.name ds", origin);
  sh("git add -A && git commit -qm 'design system'", origin);
  try { sh("git config --global protocol.file.allow always", tmp); } catch {}

  /* ---------- a fake consumer repo with real-looking content ---------- */
  fs.mkdirSync(path.join(app, "components", "globals", "ui"), { recursive: true });
  fs.mkdirSync(path.join(app, "pages"), { recursive: true });
  fs.writeFileSync(path.join(app, "package.json"), '{"name":"portal-nuxt-fake","version":"1.0.0"}\n');
  fs.writeFileSync(path.join(app, "nuxt.config.js"), "module.exports = {\n  css: [\n    \"~/assets/css/tailwind.css\",\n  ],\n};\n");
  /* the colour names .ds/bindings.md TOKEN-MAP points at must exist too */
  fs.writeFileSync(path.join(app, "tailwind.config.js"),
    'module.exports = {\n' +
    '  prefix: "tw-",\n' +
    '  theme: { extend: { colors: {\n' +
    '    brand: "#3B82F6",\n' +
    '    textHead: "#1F2328",\n' +
    '    textBody: "#374151",\n' +
    '    textMuted: "#6B7280",\n' +
    '    borderSoft: "#E5E7EB",\n' +
    '  } } },\n' +
    '};\n');
  /* every component path .ds/bindings.md maps to must exist, or doctor correctly fails */
  const MAPPED = [
    "button/index.vue", "chipStatus.vue", "dropdown.vue", "emptyState.vue", "errorText.vue",
    "input/checkboxKendo.vue", "input/datePicker.vue", "input/dropdownKendo.vue", "input/numericKendo.vue",
    "input/radioKendo.vue", "input/switchKendo.vue", "input/text.vue", "input/textArea.vue",
    "input/tinyEditor.vue", "modal/confirmation.vue", "slidePanel.vue", "tooltip.vue", "warningInfo.vue",
  ];
  for (const rel of MAPPED) {
    const full = path.join(app, "components", "globals", "ui", rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, "<template><div/></template>\n");
  }
  fs.writeFileSync(path.join(app, "pages", "index.vue"), "<template><div class=\"tw-bg-brand\">hi</div></template>\n");
  fs.writeFileSync(path.join(app, "CLAUDE.md"), "# portal-nuxt\n\nMy own notes. Do not delete me.\n");
  fs.writeFileSync(path.join(app, ".gitignore"), "node_modules/\n.nuxt/\nMY-OWN-IGNORE-LINE\n");
  fs.mkdirSync(path.join(app, ".ds"), { recursive: true });
  fs.writeFileSync(path.join(app, ".ds", "team-notes.md"), "my own notes in .ds\n");
  sh("git init -q -b main .", app);
  sh("git config user.email dev@test && git config user.name dev", app);
  sh("git add -A && git commit -qm init", app);
  fs.copyFileSync(path.join(DS, "tools", "ds-setup.cjs"), path.join(app, "ds-setup.cjs"));

  /* ---------- boot the panel ---------- */
  const proc = spawn("node", ["ds-setup.cjs", "--no-open", "--port", String(PORT)], { cwd: app, stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { await fetch(BASE + "/api/state"); break; } catch { await sleep(200); } }

  try {
    /* =============================================== 1. install */
    console.log("1. install (Level 0)");
    let st = await api("/api/state");
    ok(st.level === "not-installed", "starts not-installed");
    ok(st.isGit === true, "detects a git repo");

    const cfg = { repoUrl: origin, level: "0", commit: true, accessCode: "" };
    const plan = await api("/api/plan", cfg);
    ok(Array.isArray(plan.steps) && plan.steps.length > 0, "plan has steps");
    ok(!!plan.notTouched, "plan lists what will NOT be touched");

    const res = await api("/api/apply", cfg);
    const docStep = res.log.filter((l) => l.doctor)[0];
    ok(res.ok === true, "install reports success" + (res.ok ? "" : " \u2014 " + JSON.stringify(res.log.filter((l) => !l.ok).map((l) => l.output))));
    ok(docStep && docStep.ok, "doctor passes as part of the install");
    const committed = res.log.filter((l) => /commit/i.test(JSON.stringify(l.title)))[0];
    ok(committed && /committed \d+ path/.test(committed.output || ""), "F10: commit reports what was actually staged");
    ok(sh("git log --oneline", app).split("\n").length >= 2, "F10: a commit really exists");

    /* =============================================== 2. safety */
    console.log("2. safety guarantees");
    ok(fs.readFileSync(path.join(app, "CLAUDE.md"), "utf8").includes("My own notes. Do not delete me."), "dev's own CLAUDE.md content survives");
    ok(fs.readFileSync(path.join(app, ".gitignore"), "utf8").includes("MY-OWN-IGNORE-LINE"), "dev's own .gitignore lines survive");
    ok(fs.readFileSync(path.join(app, "CLAUDE.md"), "utf8").includes("design-system:begin"), "marker block added");
    ok(fs.existsSync(path.join(app, ".ds", "team-notes.md")), "dev's own .ds file untouched");
    ok(fs.existsSync(path.join(app, ".ds", "manifest.json")), "receipt written");

    st = await api("/api/state");
    ok(st.level === "0", "level 0 detected");
    ok(st.manifest && st.manifest.managed.length === 4, "receipt lists 4 managed regions at L0 (" +
      (st.manifest ? st.manifest.managed.map((m) => m.path).join(", ") : "") + ")");

    /* ---- git housekeeping: .ds/ is selectively ignored, never wholesale ---- */
    const gi = fs.readFileSync(path.join(app, ".gitignore"), "utf8");
    ok(gi.includes("design-system:begin") && gi.includes("design-system:end"), ".gitignore block is marked");
    ok(gi.includes(".ds/.trash/") && gi.includes(".ds/rollback-point.json") && gi.includes("ds-setup.cjs"),
      "machine-local state and the panel itself are ignored");
    ok(!/^\s*\.ds\/\s*$/m.test(gi), ".ds/ is NOT ignored wholesale — the receipt must stay committed");
    const ga = fs.readFileSync(path.join(app, ".gitattributes"), "utf8");
    ok(/\.ds\/history\.jsonl\s+merge=union/.test(ga), "history.jsonl gets a union merge so parallel installs never conflict");
    ok(sh("git check-ignore -q .ds/manifest.json || echo visible", app).trim() === "visible", "manifest.json is git-visible");
    ok(sh("git check-ignore -q .ds/bindings.md || echo visible", app).trim() === "visible", "bindings.md is git-visible");
    ok(sh("git check-ignore -q ds-setup.cjs || echo visible", app).trim() === "", "the panel file itself is git-ignored");
    ok(st.drift.length === 0, "no drift right after install");
    ok(st.unmanaged === false, "not flagged as unmanaged");
    ok((st.history || []).some((h) => h.event === "install"), "history records the install");

    /* ============================================ 3. drift + diff */
    console.log("3. drift detection");
    const cm = path.join(app, "CLAUDE.md");
    fs.writeFileSync(cm, fs.readFileSync(cm, "utf8").replace("Options API only", "Options API ONLY (edited by a dev)"));
    st = await api("/api/state");
    ok(st.drift.length === 1 && st.drift[0].path === "CLAUDE.md", "contract drift detected");
    ok(st.drift[0].klass === "contract", "classified as contract");

    const bind = path.join(app, ".ds", "bindings.md");
    /* a realistic self-healing edit: the component really exists, so doctor stays green */
    fs.writeFileSync(path.join(app, "components", "thing.vue"), "<template><div/></template>\n");
    fs.appendFileSync(bind, "\n| atom-99 Thing | `<GlobalsUiThing>` | `components/thing.vue` | ok |\n");
    st = await api("/api/state");
    ok(st.drift.length === 2, "living drift also detected");
    ok(st.drift.filter((d) => d.path === ".ds/bindings.md")[0].klass === "living", "bindings classified as living, not a violation");

    const d = await api("/api/diff", { file: "CLAUDE.md" });
    ok(d.diff && d.diff.includes("edited by a dev"), "diff shows the dev's edit");

    /* a hash-comment block is tracked exactly like a markdown one */
    const gip = path.join(app, ".gitignore");
    fs.writeFileSync(gip, fs.readFileSync(gip, "utf8").replace(".ds/.trash/", ".ds/.trash/    # tweaked"));
    let st2 = await api("/api/state");
    ok(st2.drift.some((x) => x.path === ".gitignore" && x.klass === "contract"), "gitblock drift detected");
    const gr = await api("/api/restore", { file: ".gitignore" });
    ok(gr.ok === true, "gitblock restore succeeds");
    st2 = await api("/api/state");
    ok(!st2.drift.some((x) => x.path === ".gitignore"), "gitblock drift cleared");
    ok(fs.readFileSync(gip, "utf8").includes("MY-OWN-IGNORE-LINE"), "restore kept the dev's own ignore lines");

    /* =============================================== 4. restore */
    console.log("4. restore");
    const rr = await api("/api/restore", { file: "CLAUDE.md" });
    ok(rr.ok === true, "restore succeeds");
    ok(!!rr.backup && fs.existsSync(path.join(app, rr.backup)), "dev's version preserved in .ds/.trash/");
    /* now that .trash exists, the trailing-slash ignore pattern can be verified */
    ok(sh("git check-ignore -q .ds/.trash || echo visible", app).trim() === "", ".ds/.trash is git-ignored once created");
    ok(fs.readFileSync(cm, "utf8").includes("My own notes. Do not delete me."), "restore keeps the dev's own content");
    st = await api("/api/state");
    ok(st.drift.filter((x) => x.path === "CLAUDE.md").length === 0, "contract drift cleared");

    /* ========================================= 5. change request */
    console.log("5. change request");
    const cr = await api("/api/change-request", { file: ".ds/bindings.md", reason: "Kendo needs an extra class", lang: "en" });
    ok(!!cr.savedTo && fs.existsSync(path.join(app, cr.savedTo)), "request file written");
    ok(cr.body.includes("atom-99 Thing"), "request embeds the diff");
    ok(!!cr.mailto && cr.mailto.startsWith("mailto:"), "mailto built from ds-meta.json");

    /* ================================== 6. update + impact + rollback */
    console.log("6. update / impact / rollback");
    const meta = JSON.parse(fs.readFileSync(path.join(origin, "version.json"), "utf8"));
    const nm = meta.version.split(".").map(Number); nm[1] += 1; nm[2] = 0; meta.version = nm.join("."); /* always one minor above the shipped version so the bump reads as minor */
    fs.writeFileSync(path.join(origin, "version.json"), JSON.stringify(meta, null, 2) + "\n");
    const vcss = path.join(origin, "dist", "variables.css");
    fs.writeFileSync(vcss, fs.readFileSync(vcss, "utf8").replace("--color-brand-brand:", "--color-brand-renamed:"));
    sh("git add -A && git commit -qm 'feat: rename a token'", origin);

    const up = await api("/api/check-update", {});
    ok(up.behind === 1, "one new commit seen upstream");

    const imp = await api("/api/impact", {});
    ok(imp.tokensRemoved.includes("--color-brand-brand"), "impact detects the removed token");
    ok(imp.toVersion === meta.version && imp.bump === "minor", "impact reads the incoming version and bump (" + imp.fromVersion + " -> " + imp.toVersion + " = " + imp.bump + ")");

    const beforeSha = (await api("/api/state")).subCommit;
    const ur = await api("/api/update", { commit: false });
    ok(ur.ok === true, "update applies" + (ur.ok ? "" : " \u2014 " + JSON.stringify(ur.log.filter((l) => !l.ok))));
    ok(ur.after !== beforeSha, "submodule pin moved");
    ok(fs.existsSync(path.join(app, ".ds", "rollback-point.json")), "rollback point recorded");

    const rb = await api("/api/rollback", {});
    ok(rb.ok === true, "rollback runs" + (rb.ok ? "" : " \u2014 " + JSON.stringify(rb.log.filter((l) => !l.ok))));
    ok((await api("/api/state")).subCommit === beforeSha, "pin returned to the previous commit");

    /* =============================================== 7. revert */
    console.log("7. uninstall");
    const rvPlan = await api("/api/revert-plan", { commit: false });
    ok(!!rvPlan.remains, "F: uninstall states what remains afterwards");
    const rv = await api("/api/revert", { commit: false });
    ok(rv.ok === true, "revert succeeds");
    ok(fs.readFileSync(cm, "utf8").includes("My own notes. Do not delete me."), "dev's CLAUDE.md content survives uninstall");
    ok(!fs.readFileSync(cm, "utf8").includes("design-system:begin"), "marker block removed");
    ok(fs.existsSync(path.join(app, ".ds", "team-notes.md")), "F11: dev's own .ds file survives uninstall");
    ok(!fs.existsSync(path.join(app, ".ds", "bindings.md")), "bindings removed");
    ok(fs.existsSync(path.join(app, ".ds", "history.jsonl")), "history preserved");
    const gi2 = fs.readFileSync(path.join(app, ".gitignore"), "utf8");
    ok(gi2.includes("MY-OWN-IGNORE-LINE"), "dev's own .gitignore lines survive uninstall");
    ok(!gi2.includes("design-system:begin"), "the .gitignore block is stripped on uninstall");
    ok(!fs.existsSync(path.join(app, ".gitattributes")), ".gitattributes removed (it held only our block)");
    ok(fs.readFileSync(path.join(app, "tailwind.config.js"), "utf8").includes('prefix: "tw-"'), "dev's tailwind config intact");

    proc.kill();
    await sleep(300);

    /* ================================= 8. migration from v2.4.0 */
    console.log("8. adopt an install made by an older panel");
    const app2 = path.join(tmp, "legacyapp");
    fs.mkdirSync(app2, { recursive: true });
    fs.writeFileSync(path.join(app2, "package.json"), '{"name":"old"}\n');
    fs.writeFileSync(path.join(app2, "tailwind.config.js"), 'module.exports = {\n  presets: [require("./design-system/dist/tailwind.preset.js")],\n  prefix: "tw-",\n};\n');
    fs.writeFileSync(path.join(app2, "nuxt.config.js"), 'module.exports = {\n  css: [\n    "~/design-system/dist/variables.css",\n  ],\n};\n');
    sh("git init -q -b main .", app2);
    sh("git config user.email dev@test && git config user.name dev", app2);
    sh("git add -A && git commit -qm init", app2);
    sh('git -c protocol.file.allow=always submodule add -q "' + origin + '" design-system', app2);
    fs.writeFileSync(path.join(app2, "CLAUDE.md"), "# old\n\n<!-- design-system:begin (managed by the Design System panel - do not edit inside) -->\n\nold block\n\n<!-- design-system:end -->\n");
    fs.mkdirSync(path.join(app2, ".ds"), { recursive: true });
    fs.writeFileSync(path.join(app2, ".ds", "bindings.md"), "old bindings\n");
    sh("git add -A && git commit -qm 'old install'", app2);
    fs.copyFileSync(path.join(DS, "tools", "ds-setup.cjs"), path.join(app2, "ds-setup.cjs"));

    const p2 = spawn("node", ["ds-setup.cjs", "--no-open", "--port", String(PORT + 1)], { cwd: app2, stdio: "ignore" });
    const B2 = "http://127.0.0.1:" + (PORT + 1);
    for (let i = 0; i < 60; i++) { try { await fetch(B2 + "/api/state"); break; } catch { await sleep(200); } }
    const api2 = async (p, dd) => (await fetch(B2 + p, dd === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dd) })).json();

    let s2 = await api2("/api/state");
    ok(s2.level === "1", "old install detected as Level 1");
    ok(s2.unmanaged === true, "G9: flagged as installed-without-receipt");
    const ad = await api2("/api/adopt", {});
    ok(ad.ok === true, "adopt succeeds");
    s2 = await api2("/api/state");
    ok(!!s2.manifest, "receipt created");
    ok(s2.unmanaged === false, "no longer unmanaged");
    ok(s2.drift.length === 0, "G9: existing state recorded as BASELINE, not drift");
    ok(fs.readFileSync(path.join(app2, "tailwind.config.js"), "utf8").includes("design-system:managed"), "marker added to the pre-existing config line");
    ok(fs.existsSync(path.join(app2, ".gitignore")) && fs.readFileSync(path.join(app2, ".gitignore"), "utf8").includes("ds-setup.cjs"),
      "adopt also lays down the git housekeeping");
    ok(fs.readFileSync(path.join(app2, "tailwind.config.js"), "utf8").includes('prefix: "tw-"'), "rest of the config untouched");
    p2.kill();

    /* ================================================ 9. i18n */
    console.log("9. localisation");
    const dict = JSON.parse(fs.readFileSync(path.join(DS, "tools", "dashboard", "i18n.json"), "utf8"));
    const idKeys = Object.keys(dict.id).sort(), enKeys = Object.keys(dict.en).sort();
    ok(idKeys.length === enKeys.length && idKeys.join() === enKeys.join(), "ID and EN cover exactly the same keys (" + idKeys.length + ")");
    ok(idKeys.every((k) => dict.id[k] && dict.en[k]), "no empty strings in either locale");

    const bundle = fs.readFileSync(path.join(DS, "tools", "ds-setup.cjs"), "utf8");
    const appJs = fs.readFileSync(path.join(DS, "tools", "dashboard", "app.js"), "utf8");
    const html = fs.readFileSync(path.join(DS, "tools", "dashboard", "index.html"), "utf8");
    const used = [...new Set([
      ...(appJs.match(/\bt\("([\w.]+)"/g) || []).map((s) => s.slice(3, -1)),
      ...(html.match(/data-i18n="([\w.]+)"/g) || []).map((s) => s.slice(11, -1)),
    ])].filter((k) => !k.endsWith(".")); /* t("theme." + THEME) builds its key at runtime */
    const missing = used.filter((k) => !dict.id[k]);
    ok(missing.length === 0, "every referenced i18n key exists" + (missing.length ? " — missing: " + missing.join(", ") : ""));

    /* the dynamic key families must be complete too */
    ok(["auto", "light", "dark"].every((x) => dict.id["theme." + x] && dict.en["theme." + x]), "every theme name is translated");
    const tourKeys = [...new Set((appJs.match(/k: "(tour\.[\w]+)"/g) || []).map((s) => s.slice(4, -1)))];
    const tourMissing = tourKeys.filter((k) => !dict.id[k + ".t"] || !dict.id[k + ".d"] || !dict.en[k + ".t"] || !dict.en[k + ".d"]);
    ok(tourKeys.length > 0 && tourMissing.length === 0, tourKeys.length + " tour steps have a title and body in both locales" + (tourMissing.length ? " — missing: " + tourMissing.join(", ") : ""));

    /* ---- the v3.2.0 primary-button bug, made mechanically impossible ----
       Every .btn variant that overrides its resting background must also
       override its hover background, or it will show the base hover colour
       underneath its own foreground colour. */
    console.log("9b. button contrast invariant");
    const css = fs.readFileSync(path.join(DS, "tools", "dashboard", "app.css"), "utf8");
    ok(/button\.btn:hover:not\(:disabled\)\s*\{\s*background:\s*var\(--btn-bg-hover\)/.test(css),
      "base hover reads the variant's own --btn-bg-hover");
    const variants = [...css.matchAll(/button\.btn\.(\w+)\s*\{([^}]*)\}/g)];
    ok(variants.length >= 3, variants.length + " button variants found");
    const bad = variants
      .filter(([, , body]) => /--btn-bg\s*:/.test(body) && !/--btn-bg-hover\s*:/.test(body))
      .map(([, name]) => name);
    ok(bad.length === 0, "every variant that sets --btn-bg also sets --btn-bg-hover" + (bad.length ? " — offenders: " + bad.join(", ") : ""));
    const primary = (variants.find(([, n]) => n === "primary") || [])[2] || "";
    ok(/--btn-fg\s*:\s*#f{3,6}/i.test(primary) && /--btn-bg-hover\s*:\s*var\(--accent-hover\)/.test(primary),
      "primary keeps white text on an accent hover background");

    /* =========================================== 10. the bundle */
    console.log("10. bundle integrity");
    ok(!/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com/.test(bundle), "no external network references");
    ok(bundle.includes("@font-face") && bundle.includes("Fustat"), "Fustat embedded");
    ok(/id=\\?"i-circle-check\\?"/.test(bundle), "Lucide sprite embedded");
    const uiOnly = bundle.slice(bundle.indexOf("const UI_HTML"));
    ok(!/[\u{1F300}-\u{1FAFF}]/u.test(uiOnly), "zero emoji in the shipped UI");
    ok(bundle.length < 300 * 1024, "bundle under 300 KB (" + (bundle.length / 1024).toFixed(0) + " KB)");
  } catch (e) {
    fail++;
    console.log("  FAIL threw: " + (e && e.stack || e));
  } finally {
    try { proc.kill(); } catch {}
  }

  console.log("\n" + "\u2500".repeat(52));
  console.log(fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} checks passed`);
  console.log("\u2500".repeat(52) + "\n");
  process.exit(fail ? 1 : 0);
})();
