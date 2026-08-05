# SAFETY — what the panel touches, and what it can never touch

> Written for whoever has to sign off on this. It is deliberately specific, and it
> states the limits as plainly as the guarantees.
> Bahasa Indonesia: [SAFETY.id.md](./SAFETY.id.md)

---

## 1. The short answer

The panel writes to **six** places in your repository, and **every single one is wrapped in an opening and closing marker** so it can be found and removed exactly.

Nothing is ever overwritten silently. Nothing is ever deleted — only moved to `.ds/.trash/`. Every action shows you the full plan, including the exact file contents, before it runs.

What we will **not** claim: that nothing can ever go wrong. §6 lists what stays outside our control.

---

## 2. Every file the panel touches

| File | What is written | Marker | How it is removed |
|---|---|---|---|
| `CLAUDE.md` | a block appended at the **end** | `<!-- design-system:begin -->` … `<!-- design-system:end -->` | only the marked block is stripped; your text stays |
| `.ds/bindings.md` | the file, created **only if absent** | whole file, tracked by hash in the receipt | that one file is removed — never the `.ds/` folder |
| `tailwind.config.js` | **1 line** (Level 1 only) | trailing `/* design-system:managed */` | the marked line is deleted |
| `nuxt.config.js` | **1 line** (Level 1 only) | trailing `/* design-system:managed */` | the marked line is deleted |
| `.gitignore` | a block appended at the **end** | `# design-system:begin` … `# design-system:end` | only the marked block is stripped |
| `.gitattributes` | a block appended at the **end** | `# design-system:begin` … `# design-system:end` | only the marked block is stripped; the file goes only if it becomes empty |
| `.gitmodules` + `design-system/` | a standard git submodule | git-native | `git submodule deinit` + `git rm` |

At **Level 0** only the first two exist. Your build is not touched at all.

The marker on config lines rides *on the line itself*, so it survives Prettier, ESLint `--fix`, and reformatting. Removal matches the marker, not the text — which means it still works after your formatter has rewritten the quotes or the indentation.


---

## 2b. Git housekeeping — and why `.ds/` is **not** ignored wholesale

The panel writes two small marked blocks so the repository treats its own state
correctly. Both are reversible exactly like every other managed region.

**`.gitignore`** now ignores only one thing:

```
ds-setup.cjs
```

Recovery state used to live in the working tree at `.ds/.trash/` and
`.ds/rollback-point.json`, hidden by this same block — which meant an uninstall stripped the
block and left the files it had been hiding. Since v3.4.5 recovery state lives in
**`.git/ds-recovery/`**, outside the working tree entirely: invisible to `git status`, never
committed, and destroyed by nothing short of deleting the clone. It needs no ignore rule. The
two legacy paths stay in the block only so an older install can be migrated cleanly.

**`.gitattributes`** adds one line:

```
.ds/history.jsonl merge=union
```

`history.jsonl` is append-only. Without a union merge, two developers installing on
different branches produce a git conflict at the end of the file — a conflict with no
correct manual resolution other than "keep both". `merge=union` makes git keep both
automatically. This gap existed silently until v3.3.0.

### What is committed, and why

| Path | Git | Reason |
|---|---|---|
| `.ds/manifest.json` | **commit** | the receipt. It is what makes uninstall exact, and it is what the adoption report reads. Ignoring it would break both. |
| `.ds/bindings.md` | **commit** | team knowledge; every AI agent reads it |
| `.ds/history.jsonl` | **commit** | the adoption report counts distinct developers from it |
| `.ds/requests/` | **commit** | a reviewable record of what your team asked the designer for |
| `.git/ds-recovery/trash/` | **outside the tree** | a copy of every file the panel ever changed |
| `.git/ds-recovery/original/` | **outside the tree** | a pristine copy of each file taken *before* the panel's first write; the uninstall restores from it byte-for-byte if its own strip leaves any drift |
| `.git/ds-recovery/ledger.jsonl` | **outside the tree** | append-only event ledger. Nothing in the product deletes it, which is why the adoption counters stay cumulative across install/uninstall cycles |
| `.git/ds-recovery/rollback-point.json` | **outside the tree** | describes *your* last update, not the team's state |
| `ds-setup.cjs` | **ignore** | a 278 KB build artifact of the design system repo. Fetch it with one `curl`; it then self-updates from the submodule. |

If you disagree with any of these, edit the block — the panel will report it as drift
and offer to send your version back so the default can change for everyone.

---

## 3. The install receipt

On install the panel writes `.ds/manifest.json` — a record of exactly what it did:

```json
{
  "schema": "ds-manifest-v1",
  "adoptionId": "…",
  "wizardVersion": "3.0.0",
  "level": "0",
  "dsVersion": "3.2.0",
  "dsCommit": "a1b2c3d",
  "managed": [
    { "path": "CLAUDE.md",        "mode": "block",    "klass": "contract", "sha256": "…" },
    { "path": ".ds/bindings.md",  "mode": "file",     "klass": "living",   "sha256": "…" },
    { "path": ".gitignore",       "mode": "gitblock", "klass": "contract", "sha256": "…" },
    { "path": ".gitattributes",   "mode": "gitblock", "klass": "contract", "sha256": "…" }
  ]
}
```

This single file is what makes the rest possible:

- **Uninstall is exact.** It reads the receipt and undoes those entries. It never guesses, never pattern-matches, never removes a folder wholesale.
- **Manual edits are detectable.** Each managed region carries a SHA-256; the panel recomputes it on every load.
- **Adoption is countable.** The receipt is committed with your repo, so a scan of the organisation gives real numbers without any telemetry.

Volatile events go to `.ds/history.jsonl` — append-only, one JSON object per line — so two developers installing in parallel do not produce a merge conflict.

---

## 4. Nothing is deleted

Every destructive action copies the file to `.git/ds-recovery/trash/<name>.<timestamp>` **first**, and the log prints where it went.

This applies to uninstall, restore-to-default, legacy cleanup, and panel self-update. If something goes wrong, the previous content is still on disk.

Two stronger guarantees on top of that:

- **A pristine copy is taken before the panel's first write to any file**, into
  `.git/ds-recovery/original/`. The uninstall strips its own markers, then compares the result
  against that copy and restores it verbatim if a single byte differs — and says which in the
  step log. It does not assume the removal was the exact inverse of the insertion; it checks.
- **The event ledger is never deleted.** `.git/ds-recovery/ledger.jsonl` outlives uninstalls,
  archives and submodule removal, so the adoption counters are cumulative across every cycle.

Your own files are never swept up. An uninstall archives only artifacts the panel itself
created; anything you put in `.ds/` yourself stays where it is, and a **committed**
`.ds/history.jsonl` is left in place because it is team data, not the panel's to move.

---

## 5. Manual edits: detected, and treated correctly

The panel distinguishes two kinds of change, because treating them the same would be wrong.

| Class | Files | Why it changed | How the panel responds |
|---|---|---|---|
| **Contract** | `CLAUDE.md` block, config lines | should not change | warning + **Restore** offered |
| **Living** | `.ds/bindings.md` | **expected to change** | neutral notice + **Send to designer** offered |

`.ds/bindings.md` is *supposed* to be edited. The Self-Healing Map Law (`CLAUDE.md` §4) instructs every AI agent to correct it whenever it finds the map wrong. Flagging that as damage would make the panel cry wolf on healthy repositories, and people would learn to ignore it.

So instead: a repo whose bindings map has evolved is a repo that learned something the shipped template does not know yet. **Send to designer** packages your version — with a full diff, the repo, the branch and the design system version — into `.ds/requests/`, copies it to your clipboard and opens your mail client. Useful corrections then land in the next release for everyone.

**Restore** is always available too, and always backs your version up first.

---

## 6. What is still outside our control

Stated plainly, because a checklist that says "100% safe" is not worth reading.

| Risk | Mitigation | Residual |
|---|---|---|
| A developer edits files **inside** `design-system/` | it is a pinned, read-only submodule by contract; `doctor` reports it | git will refuse a clean update; the edit is lost on `checkout` |
| `git push --force` over the adoption commit | the adoption is one reviewable commit | normal git recovery (`reflog`) applies |
| Power loss mid-write | writes are small and per-file; `.ds/.trash/` holds the prior copy | a single file could be truncated; re-run the panel |
| The Level 1 access code | it is **a social gate, not security** — the code is in plain text inside the file. Its purpose is that someone asks the maintainer before touching build config | anyone who opens the file can read it |
| Telemetry | **off by default**; when enabled the exact payload is shown before the first send and can be permanently refused | none if left off |
| A wrong repo URL | after cloning, the panel asserts `catalog/INDEX.md`, `dist/variables.css` and `CLAUDE.md` exist, and fails the step if not | you can still point at a fork that passes those checks |

---

## 7. How to verify any of this yourself

```bash
node design-system/src/scripts/doctor.js        # read-only. Never writes a file.
node design-system/tests/e2e.js                 # drives the full lifecycle and asserts
cat .ds/manifest.json                           # the receipt
cat .ds/history.jsonl                           # every event, in order
ls -la .git/ds-recovery/trash/                  # every version ever replaced
ls -la .git/ds-recovery/original/               # each file exactly as it was pre-install
cat .git/ds-recovery/ledger.jsonl               # the permanent event ledger
git diff                                        # everything the panel did is plain git
```

The end-to-end test builds a throwaway repository, installs, edits a file by hand, restores it, updates, rolls back, uninstalls, and then repeats the migration path for a repo installed by an older panel — asserting at each step. It includes explicit checks that a developer's own `CLAUDE.md` prose and their own files in `.ds/` survive an uninstall.

---

## 8. Three bugs this release fixes

Found by audit, reproduced, and now covered by the test suite.

1. **An install could report success having committed nothing.** `git add` aborts entirely if any path in the list is missing, so nothing was staged; the resulting "nothing to commit" was treated as success. The panel now stages only paths that exist, verifies the index, and reports the actual file list.
2. **Uninstall deleted the whole `.ds/` folder**, taking any of the developer's own files with it. Removal is now driven by the receipt, file by file; `.ds/` itself goes only if it is empty.
3. **Legacy cleanup removed every line matching `design system`** from `CLAUDE.md`, including the developer's own sentences. It is now section-aware and backs the file up first.
