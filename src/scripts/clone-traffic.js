#!/usr/bin/env node
/* clone-traffic.js — how many times has the design system actually been cloned?
 *
 * THE PROBLEM
 * -----------
 * The adoption census (adoption-report.js) is authoritative but needs somebody to list the
 * consuming repos, or hand over an org token with repo-listing rights. Until that happens the
 * team numbers are structurally zero and the dashboard has nothing true to say.
 *
 * But `git submodule add <url>` IS a clone, and GitHub counts clones. So the install action is
 * already instrumented at the source, by GitHub, with no telemetry of ours and nothing added to
 * anybody's repo:
 *
 *     GET /repos/{owner}/{repo}/traffic/clones
 *
 * THE CATCH, AND THE TRICK
 * ------------------------
 * That endpoint only returns the last 14 days. Read once, it is a fortnight's worth of numbers
 * and nothing more — which is presumably why nobody bothered.
 *
 * It is a SLIDING window, though, and GitHub's figure for a past day never changes once that day
 * has closed. So sampling it repeatedly and merging by date accumulates a permanent daily
 * history: run it more often than every 14 days and no day is ever missed. `ship.js` already
 * runs on every release, and a fortnightly cron covers the gaps between releases. A lossy
 * endpoint becomes a durable record because of how it is read, not because of what it returns.
 *
 * WHAT THIS NUMBER IS AND IS NOT
 * ------------------------------
 * It IS: every clone of the repository, including CI checkouts, re-clones and the maintainer's
 * own. It is NOT a count of distinct projects that adopted the design system — the census is
 * the only thing that can say that, and the panel labels the two differently on purpose. A
 * number presented as more precise than it is does more damage than no number at all; that
 * lesson cost this repository four releases of a dashboard reading 0.
 *
 *   DS_SCM_TOKEN=ghp_… node src/scripts/clone-traffic.js
 *   DS_SCM_TOKEN=ghp_… node src/scripts/clone-traffic.js --repo owner/name
 *
 * The token needs push access to the design system repo (GitHub restricts traffic data to
 * people who could already see it in the Insights tab). Absent or unauthorised, the script
 * SKIPS LOUDLY and leaves the existing record untouched — it never overwrites real history with
 * an error.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DS = path.resolve(__dirname, "..", "..");
const STORE = path.join(DS, ".release", "clone-traffic.json");
const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

/* owner/name from --repo, the config, or the git remote — in that order */
function resolveRepo() {
  const explicit = argOf("repo", (readJson(path.join(DS, ".release", "adoption.config.json"), {}) || {}).repo);
  if (explicit) return explicit;
  let url = null;
  try { url = execSync("git remote get-url origin", { cwd: DS, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { /* no remote */ }
  if (!url) return null;
  const m = url.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);
  return m ? m[1] + "/" + m[2] : null;
}

/* ------------------------------------------------------------------ merge
 * Exported and pure, so the merge can be tested without a network. GitHub's count for a day
 * that has already closed is final, so a later sample of the same date replaces an earlier one
 * — that is a correction, not a double count. Today's date is still moving, so it is stored
 * like any other and simply overwritten by tomorrow's run.
 */
function mergeDays(existing, incoming) {
  const byDate = new Map();
  for (const d of existing || []) byDate.set(d.date, d);
  for (const d of incoming || []) byDate.set(d.date, d);
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function summarise(days) {
  const total = days.reduce((n, d) => n + (d.count || 0), 0);
  const uniques = days.reduce((n, d) => n + (d.uniques || 0), 0);
  return {
    days: days.length,
    since: days.length ? days[0].date : null,
    until: days.length ? days[days.length - 1].date : null,
    clones: total,
    uniqueCloners: uniques,
    /* honest caveat, carried WITH the number so it cannot be quoted without it */
    note: "Every clone of the repo, CI checkouts included. Not a count of distinct adopting projects — that is what the census in ADOPTION.md measures.",
  };
}

/* The shape GitHub documents for /traffic/clones. Pulled out of main() so the parse path — the
   one piece that cannot be exercised against the live API from an offline sandbox — is still
   exercised against the documented contract rather than merely hoped about. */
function parseTraffic(body) {
  return ((body && body.clones) || []).map((c) => ({
    date: String(c.timestamp || "").slice(0, 10),
    count: Number(c.count) || 0,
    uniques: Number(c.uniques) || 0,
  })).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
}

module.exports = { mergeDays, summarise, parseTraffic };

/* ------------------------------------------------------------------ fetch */
async function main() {
  const token = process.env.DS_SCM_TOKEN || process.env.GITHUB_TOKEN;
  const repo = resolveRepo();
  const store = readJson(STORE, { schema: "ds-clone-traffic-v1", repo, samples: [], days: [] });

  if (!token) {
    console.log("\u26a0\ufe0f  clone-traffic SKIPPED \u2014 no DS_SCM_TOKEN / GITHUB_TOKEN.");
    console.log("   The existing record is untouched" + (store.days.length ? " (" + store.days.length + " day(s) already collected)." : "."));
    console.log("   The token needs push access to the design system repo; GitHub limits traffic data to people who can already see the Insights tab.");
    return;
  }
  if (!repo) {
    console.log("\u26a0\ufe0f  clone-traffic SKIPPED \u2014 could not work out owner/name. Pass --repo owner/name.");
    return;
  }

  const url = "https://api.github.com/repos/" + repo + "/traffic/clones";
  let res;
  try {
    res = await fetch(url, {
      headers: {
        authorization: "Bearer " + token,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "es-design-system-adoption",
      },
    });
  } catch (e) {
    console.log("\u26a0\ufe0f  clone-traffic SKIPPED \u2014 network error: " + e.message);
    console.log("   The existing record is untouched.");
    return;
  }

  if (!res.ok) {
    const hint = res.status === 403 ? " (the token needs PUSH access \u2014 traffic data is admin-only)"
      : res.status === 404 ? " (repo not found, or the token cannot see it)" : "";
    console.log("\u26a0\ufe0f  clone-traffic SKIPPED \u2014 GitHub replied " + res.status + hint);
    console.log("   The existing record is untouched. A failed read must never overwrite real history.");
    return;
  }

  const body = await res.json();
  const incoming = parseTraffic(body);

  const before = store.days.length;
  store.repo = repo;
  store.days = mergeDays(store.days, incoming);
  store.samples = [...(store.samples || []), new Date().toISOString()].slice(-50);
  store.summary = summarise(store.days);

  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2) + "\n", "utf8");

  const s = store.summary;
  console.log("clone traffic for " + repo);
  console.log("  window returned by GitHub : " + incoming.length + " day(s)");
  console.log("  days on record after merge : " + store.days.length + " (was " + before + ")");
  console.log("  clones                     : " + s.clones + " \u00b7 unique cloners: " + s.uniqueCloners);
  console.log("  covering                   : " + s.since + " \u2192 " + s.until);
  console.log("\u2192 .release/clone-traffic.json");
  if (store.samples.length === 1) {
    console.log("\n  Run this at least every 14 days \u2014 that is the whole window GitHub keeps.");
    console.log("  ship.js runs it on every release; add a fortnightly cron for the gaps.");
  }
}

/* --self-test exercises the merge without a network, so the one piece of logic that cannot be
   verified against live GitHub in a sandbox is still verified against something. */
function selfTest() {
  const w1 = [{ date: "2026-07-01", count: 3, uniques: 2 }, { date: "2026-07-02", count: 5, uniques: 4 }];
  const w2 = [{ date: "2026-07-02", count: 6, uniques: 5 }, { date: "2026-07-11", count: 2, uniques: 2 }];
  const merged = mergeDays(mergeDays([], w1), w2);
  const s = summarise(merged);
  /* A verbatim sample of GitHub's documented /traffic/clones payload. */
  const fixture = {
    count: 173, uniques: 128,
    clones: [
      { timestamp: "2026-07-01T00:00:00Z", count: 3, uniques: 2 },
      { timestamp: "2026-07-02T00:00:00Z", count: 5, uniques: 4 },
      { timestamp: "bad-timestamp", count: 9, uniques: 9 },
    ],
  };
  const parsed = parseTraffic(fixture);

  const checks = [
    ["a documented payload parses to day rows", parsed.length === 2],
    ["the ISO timestamp becomes a plain date", parsed[0].date === "2026-07-01"],
    ["counts and uniques survive as numbers", parsed[1].count === 5 && parsed[1].uniques === 4],
    ["a malformed timestamp is dropped, not counted as day zero", !parsed.some((d) => d.date === "bad-")],
    ["an empty or error body yields nothing rather than throwing",
      parseTraffic({}).length === 0 && parseTraffic(null).length === 0],
    ["overlapping samples correct a day, never double-count it", merged.find((d) => d.date === "2026-07-02").count === 6],
    ["new days are added", merged.length === 3],
    ["days stay in date order", merged.map((d) => d.date).join() === "2026-07-01,2026-07-02,2026-07-11"],
    ["totals sum the merged record, not the samples", s.clones === 11 && s.uniqueCloners === 9],
    ["the caveat travels with the number", /Not a count of distinct adopting projects/.test(s.note)],
  ];
  let bad = 0;
  for (const [name, pass] of checks) { console.log((pass ? "  ok   " : "  FAIL ") + name); if (!pass) bad++; }
  console.log(bad ? `\n\u274c ${bad} failed` : "\n\u2705 clone-traffic merge verified (" + checks.length + " checks)");
  process.exit(bad ? 1 : 0);
}

if (require.main === module) { if (args.includes("--self-test")) selfTest(); else main(); }
