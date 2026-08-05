# E-Systems Design System (v3)

Framework-agnostic, AI-grounded design system: **design tokens + component specs → compiled outputs + AI grounding files**. It ships **no runtime components** — consumers keep their own component library; this repo is the single source of visual truth that humans and AI ground against.

Author: Raihan Allaam (@alamehan) — UI/UX Designer, ITS Elabram.

> **New here?** Read the tutorial: [English](./TUTORIAL.en.md) · [Bahasa Indonesia](./TUTORIAL.id.md)
> **Want the whole picture?** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — layers, release chain, data flow, live numbers, plus a standalone [`system-map.mermaid`](./docs/system-map.mermaid).
> **Signing this off?** Read [SAFETY.en.md](./SAFETY.en.md) · [SAFETY.id.md](./SAFETY.id.md) — exactly what the panel writes, and what it can never touch.

## Architecture: Truth / Reference / Binding

| Layer | Where | What |
|---|---|---|
| **Truth** | this repo: `src/` → `dist/` + `catalog/` | 185 tokens + 86 dark overrides + 12 text styles + 76 specs, compiled & validated |
| **Reference** | this repo: `reference/` | plain HTML+CSS per component + browsable `gallery.html`, rendering in **Fustat** with real **Tabler** icons. Three tiers: base components · composed samples · **Part 3 derived, collapsed and reference-only** (see `CLAUDE.md` §1b) |
| **Binding** | consumer repo: `.ds/bindings.md` | map spec → that repo's components & classes (self-healing) |

## Layout

- `version.json` — the single source of the version number
- `ds-meta.json` — maintainer contact, read live by the panel
- `src/foundations.json` — all design tokens (EDIT HERE)
- `src/components/*.json` — 76 component/page specs (EDIT HERE)
- `src/assets/` — avatars, option-menus, characters, custom icons
- `src/scripts/` — `build.js` (compile+validate) · `split-catalog.js` · `stamp-reference.js` · `lint-reference.js` · `contract-check.js` · `adoption-report.js` · `doctor.js`
- `tools/` — `dashboard/` (panel sources) · `build-wizard.js` · `ds-setup.cjs` (the ONE file developers run) · `ship.js`
- `tests/e2e.js` — drives the panel through its whole lifecycle and asserts (103 checks)
- `docs/` — `ARCHITECTURE.md` + `system-map.mermaid`
- `dist/` — generated: `tailwind.preset.js`, `variables.css`
- `catalog/` — generated: `INDEX.md` (router) + `TOKENS.md` + `components/<code>.md`
- `reference/` — token-pure HTML+CSS; open `reference/gallery.html` in a browser. Part 3 holds the renderings no designer has approved yet: collapsed by default, reference-only
- `CLAUDE.md` — universal AI laws (consumer-agnostic)

## Workflows

**Author:** edit Figma → update `src/*.json` → **`node tools/ship.js`** (build · split · stamp · lint-reference · lint-typography · visual-audit · lint-docs · validate-pages · bundle · contract-check · adoption, in the only correct order) → commit + tag. CI re-runs every gate.

**Consumer:** one command — `curl -fsSL <DS-REPO>/raw/main/tools/ds-setup.cjs -o ds-setup.cjs && node ds-setup.cjs`. No token, no npm install, no build step, ever; the panel has zero dependencies and needs only Node 16.7+ and git, both checked before it starts. Private repo? `SETUP.md` has the one-line `gh` equivalent. See `SETUP.md` for the adoption ladder. Verify anytime with `node design-system/src/scripts/doctor.js` (read-only).

## Versioning

Semver, enforced mechanically. `contract-check.js` compares every build against `.release/contract.json` and **fails CI** if a token, text style, spec code or enum value is removed without a MAJOR bump plus a deprecation alias. Consumers pin a submodule commit and upgrade explicitly.

---

📖 Penasaran cerita, filosofi, dan ambisi di balik design system ini? Baca [STORY.md](./STORY.md)
