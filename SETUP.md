# SETUP — Zero-Install Adoption Ladder

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
  presets: [require("./design-system/dist/tailwind.preset.js")],
  // …everything else unchanged
}
```
2. `nuxt.config.js` → `css: [ …, "~/design-system/dist/variables.css" ]`

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
