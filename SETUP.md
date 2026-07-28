# SETUP — Zero-Install Adoption Ladder

> Fastest path: `curl -fsSL <DS-REPO>/raw/main/tools/ds-setup.cjs -o ds-setup.cjs && node ds-setup.cjs`
> The panel does everything below for you, plan-first and reversible. The manual steps are kept here because the panel only ever runs these exact commands.

This design system installs NOTHING into your repo. Total footprint: one read-only git submodule folder + (optionally) 2 lines. Each level is independent, reversible in one move, and verified by `doctor`.

## Level 0 — Reference-only (default, zero risk)

```bash
git submodule add <git-url-of-this-repo> design-system
git commit -m "chore: add design-system submodule (read-only reference)"
```

What you get immediately, with zero build/runtime changes:
- Full AI grounding: `design-system/CLAUDE.md`, `catalog/`, `reference/gallery.html`.
- Vibe-coded UI stays on-spec using YOUR existing components and utility classes (via `.ds/bindings.md` in your repo).

Nothing in your build changes. It cannot break anything.

## Level 1 — Live tokens (opt-in, +2 lines)

1. `tailwind.config.js`:
```js
module.exports = {
  presets: [require("./design-system/dist/tailwind.preset.js")], /* design-system:managed */
  // …everything else unchanged
}
```
2. `nuxt.config.js` → `css: [ …, "~/design-system/dist/variables.css", /* design-system:managed */ ]`

The trailing marker is how the panel finds the line again to remove it — it survives Prettier and reformatting.

Unlocks: kebab token classes (e.g. `tw-bg-brand-brand`), dark mode variables, and live token updates on every submodule bump. Revert = delete the 2 lines.

## Level 2 — Alias legacy colors (opt-in, frontend's call)

Point your existing camelCase color values at the preset values so legacy classes become live-linked. See CHANGELOG guidance before doing this.

## Verify (any level)

```bash
node design-system/src/scripts/doctor.js
```
Read-only diagnosis: adoption level, wiring, bindings map validity, config drift. It never writes a file.

## Updating

```bash
git submodule update --remote design-system
git commit -m "chore: bump design-system"
```
You control when to take updates. Check `design-system/CHANGELOG.md`; doctor warns on MAJOR jumps.

## Troubleshooting

- **`design-system/` folder empty after clone** → `git submodule update --init`.
- **No access to the submodule URL** → the design system repo must live on the same git host/org as your project; ask the author to grant read access.
- **Team dislikes submodules** → fallback: clone this repo side-by-side and open a multi-root workspace; everything works the same except updates are manual `git pull`.
- **Dark mode at Level 0** → not available (legacy colors are frozen hex). This is expected; it is the main reason to move to Level 1.

## Already installed by an older panel?

Repos adopted with panel v2.x have no install receipt, so drift detection, exact revert and rollback cannot work. Open the panel and choose **Create receipt** — it reads your current state, adds markers to unmarked config lines, and records that state as the **baseline**. Nothing is rewritten and nothing is reported as drift.

## What lands in git

The panel writes two small marked blocks so your repo treats the design system's own
state correctly:

- **`.gitignore`** — ignores `.ds/.trash/`, `.ds/rollback-point.json` and `ds-setup.cjs`
- **`.gitattributes`** — `.ds/history.jsonl merge=union`, so two developers installing
  in parallel never hit a conflict in that append-only log

Everything else under `.ds/` is **committed on purpose**: `manifest.json` is the receipt
that makes uninstall exact and is what the adoption report reads, and `bindings.md` is
team knowledge every AI agent depends on. Full rationale in
[SAFETY.en.md §2b](./SAFETY.en.md) / [SAFETY.id.md §2b](./SAFETY.id.md).
