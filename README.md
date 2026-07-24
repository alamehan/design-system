# E-Systems Design System (v3)

Framework-agnostic, AI-grounded design system: **design tokens + component specs → compiled outputs + AI grounding files**. It ships **no runtime components** — consumers keep their own component library; this repo is the single source of visual truth that humans and AI ground against.

Author: Raihan Allaam (@alamehan) — UI/UX Designer, ITS Elabram.

> 🚀 **Baru pertama kali? Baca `TUTORIAL.md`** — tutorial praktis dari nol sampai jalan (Bahasa Indonesia), mencakup push repo → adopsi → verifikasi → workflow harian → update → rollback.

## Architecture: Truth / Reference / Binding

| Layer | Where | What |
|---|---|---|
| **Truth** | this repo: `src/` → `dist/` + `catalog/` | 181 tokens + 76 specs, compiled & validated |
| **Reference** | this repo: `reference/` | plain HTML+CSS per component + browsable `gallery.html` |
| **Binding** | consumer repo: `.ds/bindings.md` | map spec → that repo's components & classes (self-healing) |

## Layout

- `src/foundations.json` — all design tokens (EDIT HERE)
- `src/components/*.json` — 76 component/page specs (EDIT HERE)
- `src/assets/` — avatars, option-menus, characters, custom icons
- `src/scripts/` — `build.js` (compile+validate) · `split-catalog.js` · `lint-reference.js` · `doctor.js`
- `dist/` — generated: `tailwind.preset.js`, `variables.css`
- `catalog/` — generated: `INDEX.md` (router) + `TOKENS.md` + `components/<code>.md`
- `reference/` — token-pure HTML+CSS; open `reference/gallery.html` in a browser
- `CLAUDE.md` — universal AI laws (consumer-agnostic)

## Workflows

**Author:** edit Figma → update `src/*.json` → `node src/scripts/build.js && node src/scripts/split-catalog.js` → commit + push. CI validates and tags releases.

**Consumer:** see `SETUP.md` (zero-install adoption ladder, Level 0/1/2). Verify anytime with `node design-system/src/scripts/doctor.js` (read-only).

## Versioning

Semver. Token rename/removal = MAJOR + deprecation alias for one minor cycle. See `CHANGELOG.md`. Consumers pin a submodule commit and upgrade explicitly.

---

📖 Penasaran cerita, filosofi, dan ambisi di balik design system ini? Baca [STORY.md](./STORY.md)
