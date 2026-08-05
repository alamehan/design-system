#!/usr/bin/env node
/* adoption-report.js — who has adopted the design system, and who is stale.
 *
 * No telemetry and no server: every adopting repo commits `.ds/manifest.json`
 * and `.ds/history.jsonl`, so the ground truth already lives in git. This just
 * collects it.
 *
 *   node src/scripts/adoption-report.js                      uses .release/adoption.config.json
 *   node src/scripts/adoption-report.js --provider list      shallow-clone a list of repo URLs
 *   node src/scripts/adoption-report.js --provider github --org acme
 *   node src/scripts/adoption-report.js --provider gitlab --group acme
 *
 * Writes ADOPTION.md + .release/adoption.json.
 *
 * The `list` provider works on ANY git host — self-hosted included — which is
 * why it is the default fallback.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const DS = path.resolve(__dirname, "..", "..");
const CFG_PATH = path.join(DS, ".release", "adoption.config.json");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };

let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(CFG_PATH, "utf8")); } catch {}
const provider = argOf("provider", cfg.provider || "list");
const meVersion = JSON.parse(fs.readFileSync(path.join(DS, "version.json"), "utf8")).version;

const sh = (cmd, cwd) => { try { return execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" }).trim(); } catch { return null; } };

/* ------------------------------------------------------ providers */
async function viaList(urls) {
  const out = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ds-adopt-"));
  for (const url of urls) {
    const name = url.replace(/\.git$/, "").split(/[/:]/).slice(-2).join("/");
    process.stdout.write("  " + name + " … ");
    const dir = path.join(tmp, name.replace(/[^\w.-]+/g, "_"));
    if (sh('git clone --depth 1 --filter=blob:none -q "' + url + '" "' + dir + '"') === null) { console.log("unreachable"); continue; }
    const man = readJson(path.join(dir, ".ds", "manifest.json"));
    if (!man) { console.log("not adopted"); continue; }
    out.push(collect(name, url, man, readLines(path.join(dir, ".ds", "history.jsonl"))));
    console.log("v" + (man.dsVersion || "?") + " L" + man.level);
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  return out;
}

async function viaApi(kind) {
  const token = process.env.DS_SCM_TOKEN || process.env.GITHUB_TOKEN || process.env.GITLAB_TOKEN;
  if (!token) { console.error("Set DS_SCM_TOKEN (or GITHUB_TOKEN / GITLAB_TOKEN) for the " + kind + " provider."); process.exit(1); }
  const org = argOf("org", cfg.org) || argOf("group", cfg.group);
  if (!org) { console.error("Pass --org (github) or --group (gitlab)."); process.exit(1); }

  if (kind === "github") {
    const host = cfg.apiBase || "https://api.github.com";
    const r = await fetch(host + "/search/code?q=" + encodeURIComponent('filename:manifest.json path:.ds org:' + org) + "&per_page=100",
      { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" } });
    const j = await r.json();
    const repos = [...new Set((j.items || []).map((i) => i.repository.clone_url))];
    return viaList(repos);
  }
  const host = cfg.apiBase || "https://gitlab.com/api/v4";
  const r = await fetch(host + "/groups/" + encodeURIComponent(org) + "/search?scope=blobs&search=" + encodeURIComponent("ds-manifest-v1"),
    { headers: { "PRIVATE-TOKEN": token } });
  const j = await r.json();
  const ids = [...new Set((Array.isArray(j) ? j : []).map((x) => x.project_id))];
  const urls = [];
  for (const id of ids) {
    const p = await (await fetch(host + "/projects/" + id, { headers: { "PRIVATE-TOKEN": token } })).json();
    if (p && p.http_url_to_repo) urls.push(p.http_url_to_repo);
  }
  return viaList(urls);
}

/* --------------------------------------------------------- helpers */
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }
function readLines(p) {
  try { return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
  catch { return []; }
}
function collect(name, url, man, hist) {
  const actors = [...new Set(hist.map((h) => h.actor).filter((a) => a && a !== "anon"))];
  const ev = {};
  hist.forEach((h) => { ev[h.event] = (ev[h.event] || 0) + 1; });
  return {
    repo: name, url,
    level: man.level, dsVersion: man.dsVersion || null, dsCommit: man.dsCommit || null,
    panelVersion: man.wizardVersion || null,
    installedAt: man.installedAt || null, updatedAt: man.updatedAt || null,
    managed: (man.managed || []).length,
    devs: actors.length, events: ev,
    stale: man.dsVersion ? man.dsVersion !== meVersion : null,
  };
}

/* ------------------------------------------------------------- run */
(async function main() {
  console.log("\nadoption-report \u2014 provider: " + provider + "\n");
  let rows = [];
  let configured = true;
  if (provider === "list") {
    const urls = cfg.repos || [];
    if (!urls.length) {
      /* Not an error. The panel needs a valid report file to read, and an empty
         one that says "no repos registered yet" is far more useful to a developer
         than a missing file that makes the dashboard tell them to run a script. */
      console.log("No repos listed in .release/adoption.config.json yet \u2014 writing an empty report.");
      console.log("Add git URLs to `repos` and run this again to get real numbers.\n");
      configured = false;
    } else rows = await viaList(urls);
  } else rows = await viaApi(provider);

  rows.sort((a, b) => (a.repo || "").localeCompare(b.repo || ""));

  const byLevel = {}, byVersion = {};
  let devs = 0, installs = 0, updates = 0, reverts = 0, requests = 0;
  const allDevs = new Set();
  rows.forEach((r) => {
    byLevel[r.level] = (byLevel[r.level] || 0) + 1;
    byVersion[r.dsVersion || "?"] = (byVersion[r.dsVersion || "?"] || 0) + 1;
    devs += r.devs;
    installs += r.events.install || 0;
    updates += r.events.update || 0;
    reverts += r.events.revert || 0;
    requests += r.events["change-request"] || 0;
  });

  const stale = rows.filter((r) => r.stale);
  const dist = (o) => Object.keys(o).sort().map((k) => k + ": " + o[k]).join(" \u00b7 ");

  const md = [
    "# Adoption report",
    "",
    "_Generated " + new Date().toISOString().slice(0, 10) + " against design system v" + meVersion +
      ". Read from committed `.ds/manifest.json` files \u2014 no telemetry._",
    "",
    configured ? "" : "> No repositories are listed in `.release/adoption.config.json` yet, so the counts below are all zero.\n> Add git URLs to `repos` and run this again.",
    "",
    "| | |",
    "|---|---|",
    "| Repos adopted | **" + rows.length + "** |",
    "| Distinct developers | **" + devs + "** |",
    "| Installs / updates / uninstalls | " + installs + " / " + updates + " / " + reverts + " |",
    "| Change requests raised | " + requests + " |",
    "| Adoption level | " + (dist(byLevel) || "\u2014") + " |",
    "| Design system version | " + (dist(byVersion) || "\u2014") + " |",
    "| **Behind current** | **" + stale.length + "**" + (stale.length ? " \u2014 " + stale.map((s) => s.repo).join(", ") : "") + " |",
    "",
    "## Repositories",
    "",
    "| Repo | Level | DS version | Panel | Devs | Updated | Status |",
    "|---|---|---|---|---|---|---|",
    ...rows.map((r) => "| `" + r.repo + "` | " + r.level + " | " + (r.dsVersion || "?") + " | " + (r.panelVersion || "?") +
      " | " + r.devs + " | " + (r.updatedAt || "").slice(0, 10) + " | " + (r.stale ? "behind" : "current") + " |"),
    "",
    stale.length ? "## Needs a nudge\n\n" + stale.map((s) => "- `" + s.repo + "` is on v" + s.dsVersion + " (current: v" + meVersion + ")").join("\n") + "\n" : "",
    "---",
    "",
    "Distinct developers are counted from a salted-free SHA-256 of `git config user.email`,",
    "truncated to 12 hex characters. No address is stored anywhere in this repository.",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(DS, "ADOPTION.md"), md, "utf8");
  fs.mkdirSync(path.join(DS, ".release"), { recursive: true });
  /* The panel reads these totals straight from the committed file, so the
     dashboard can show org-wide adoption without any telemetry. */
  /* When nothing is configured there is nothing to measure, so publish the FACT of that and no
     counters at all. Emitting `repos: 0, installs: 0, ...` produced a file the panel could not
     tell apart from a real measurement of zero, and ship.js rewrites this file on every
     release — so every design system update looked to the adopter like their numbers had just
     been reset to nothing. A structural zero is not a measurement. */
  /* Clone traffic is a SEPARATE, weaker signal than the census, and it travels under its own
     name so the two can never be read as the same thing. It exists because it needs no
     cooperation from any consuming repo: `git submodule add` is a clone, and GitHub counts
     clones. See src/scripts/clone-traffic.js. */
  const clone = readJson(path.join(DS, ".release", "clone-traffic.json")) || null;
  const clones = clone && clone.summary && clone.days && clone.days.length ? clone.summary : null;

  const totals = configured ? {
    configured: true,
    repos: rows.length,
    devs: devs,
    installs: installs,
    updates: updates,
    uninstalls: reverts,
    requests: requests,
    behind: stale.length,
    current: rows.length - stale.length,
    byLevel: byLevel,
    byVersion: byVersion,
  } : { configured: false };
  if (clones) totals.clones = clones;
  fs.writeFileSync(path.join(DS, ".release", "adoption.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), dsVersion: meVersion, totals, rows }, null, 2) + "\n", "utf8");

  console.log("\n" + rows.length + " repo(s) \u00b7 " + devs + " dev(s) \u00b7 " + stale.length + " behind");
  console.log("\u2192 ADOPTION.md");
})();
