# TUTORIAL — from zero to working

> Bahasa Indonesia: [TUTORIAL.id.md](./TUTORIAL.id.md)

Two roles, two paths. Pick yours.

---

## What is in this package

```
design-system/          the design system repo — push this to your git host
  docs/                 ARCHITECTURE.md + system-map.mermaid
  src/                  EDITABLE truth: 185 tokens + 76 specs + assets
  dist/ catalog/        GENERATED: Tailwind preset, CSS vars, AI grounding
  reference/            plain HTML+CSS reference components + gallery.html
  tools/
    dashboard/          panel sources (HTML/CSS/JS/icons/fonts/i18n)
    ds-setup.cjs        BUILD OUTPUT — the single file developers run
    build-wizard.js     bundles the sources into that one file
    ship.js             one command for the whole release chain
```

Developers only ever receive **one file**: `tools/ds-setup.cjs`.

---

## Part A — Design system maintainer

### A1. Publish the repo (once, ~5 minutes)

```bash
cd design-system
git init && git add -A && git commit -m "feat: design system v3.2.0"
git remote add origin <YOUR-GIT-HOST>/design-system.git
git push -u origin main
```

It must live on the **same host and organisation** as the consuming projects, so the frontend team has read access.

Then set your contact details in `ds-meta.json` — the panel reads the maintainer email live from there, so the "request the Level 1 code" and "send to designer" buttons work:

```json
{ "maintainer": { "name": "…", "email": "…" } }
```

### A2. Tell the team one command

```bash
curl -fsSL <YOUR-GIT-HOST>/design-system/raw/main/tools/ds-setup.cjs -o ds-setup.cjs
node ds-setup.cjs
```

That is the whole handover. After the first install the panel updates itself from the submodule.

### A3. Daily authoring

```
edit Figma → update src/foundations.json or src/components/*.json → node tools/ship.js
```

`ship.js` runs the entire chain in the only correct order and refuses to proceed if anything is off:

| Step | Catches |
|---|---|
| `build.js` | broken token references, illegal token names, wrongly-named assets |
| `split-catalog.js` | stale AI grounding catalog |
| `stamp-reference.js` | reference files claiming the wrong version |
| `lint-reference.js` | hardcoded hex in reference CSS |
| `validate-pages.py` | page specs missing geometry or with unresolved refs |
| `build-wizard.js` | panel bundle out of sync with its sources |
| `contract-check.js` | **a removed or renamed token without a MAJOR bump and a deprecation alias** |

Then commit, tag, and freeze the new baseline:

```bash
git add -A && git commit -m "release: v3.3.0"
git tag v3.3.0 && git push --follow-tags
node src/scripts/contract-check.js --accept && git commit -am "chore: contract baseline v3.3.0"
```

### A4. Who has adopted it

```bash
node src/scripts/adoption-report.js
```

Reads the committed `.ds/manifest.json` in each consuming repo and writes `ADOPTION.md`: repos adopted, level split, version split, distinct developers, and **which installs are behind**. No telemetry, no server. Configure the repo list (or a GitHub/GitLab org) in `.release/adoption.config.json`, and run it weekly from CI.

This is also your update-notification mechanism: nobody opens a panel to check for updates, so the report tells you who to nudge.

---

## Part B — Frontend developer

### B1. Install (~2 minutes)

```bash
curl -fsSL <DS-REPO>/raw/main/tools/ds-setup.cjs -o ds-setup.cjs
node ds-setup.cjs
```

The panel opens on `127.0.0.1`. Choose **Level 0**, press Process, review the plan, confirm.

| Level | What it does | Footprint |
|---|---|---|
| **0 — Reference only** | full AI grounding; your build is untouched | 1 read-only submodule + marked blocks in `CLAUDE.md`, `.gitignore`, `.gitattributes` + `.ds/bindings.md` |
| **1 — Live tokens** | token classes + dark mode | Level 0 **+ 2 marked lines** in your configs. Needs an access code from the maintainer — the panel has a one-click button to request it |

Everything is plan-first, marked, and reversible. See [SAFETY.en.md](./SAFETY.en.md).

### B2. Daily work

Nothing to remember. Your AI agent reads `CLAUDE.md` → `design-system/CLAUDE.md` → `catalog/INDEX.md` → `.ds/bindings.md` automatically, and builds UI on spec using **your** components.

The panel's **AI Prompts** section has seven ready-made prompts that already carry your repo's rules and adoption level.

First time you open the panel it runs a short guided tour. You can replay it any time from the **⋯** menu in the bottom navigation, which also holds the light/dark/system theme switch.

### B3. If you edit something the panel installed

That is fine, and the panel handles it properly:

- **`.ds/bindings.md`** — you are *meant* to edit this. The Self-Healing Map Law asks every agent to correct the map when it is wrong. The panel offers **Send to designer**, which packages your diff into a change request so the fix lands in the shipped template for everyone.
- **`CLAUDE.md` block or a config line** — the panel flags it and offers **Restore**, which backs your version up to `.ds/.trash/` first.

### B4. Updates

Open the panel → **Versions** → *Check for updates*. Before anything is pulled you get an impact report:

> This update removes `--color-brand-brand`, used in **14 files** in this repo.

If an update does cause trouble, **Roll back** returns the submodule to the previous pin in one click. The update is also a normal commit, so `git revert` works too.

### B5. Health and uninstall

```bash
node design-system/src/scripts/doctor.js     # read-only, safe anytime
```

Uninstall lives in the panel under **Health**. It reads the install receipt and removes exactly what was added — your code, your components and your git history are untouched, and the plan tells you what remains afterwards before you confirm.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `design-system/` is empty after cloning | `git submodule update --init` |
| No access to the submodule URL | the design system repo must sit on the same host/org — ask the maintainer for read access |
| The repo moved to a new host | panel → **Health** → *Change repo URL* (`git submodule set-url` + sync, plan-first) |
| Team dislikes submodules | clone side by side and open a multi-root workspace; everything works, updates become a manual `git pull` |
| No dark mode at Level 0 | expected — legacy colours are frozen hex. This is the main reason to move to Level 1 |
| The panel looks out of date | it will say so, and update itself from the submodule |
