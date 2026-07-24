# Changelog

All notable changes to this design system. Semver: token/spec rename or removal = MAJOR (with a one-cycle deprecation alias), additions = MINOR, fixes = PATCH.

## 3.1.0 — 2026-07-24

**Composed samples + interaction standards.**

### Added
- `reference/gallery.html` **Part 2 — Composed samples (detail tier)**: assembled screens built only from Part 1 base components — full list page (table always in a white card, rows-per-page max 50, explicit row actions), slide-in detail panel, form section, empty state + confirmation modal. New token-pure `reference/css/composed.css`.
- `CLAUDE.md` **§5 Interaction & composition standards**: breadcrumb is opt-in (never by default) · tables always inside a white card · default 10 rows/page + pagination + rows-per-page capped at 50 · explicit-affordance law (row/card click never opens panels or navigates) · destructive actions behind confirmation · two-tier reference grounding rule.

### Changed
- `reference/components/data-table.html` — now shown inside a white card with title/toolbar and a rows-per-page footer control.
- `reference/components/breadcrumb.html` — marked opt-in only.

## 3.0.0 — 2026-07-15

**Major architecture release: "Truth / Reference / Binding" — separate repo, zero-install.**

### Added
- `reference/` — plain HTML+CSS reference implementations for all 27 former kit components + `gallery.html` (open directly in a browser, build-stamped).
- `catalog/INDEX.md` + `catalog/TOKENS.md` + `catalog/components/<code>.md` — progressive disclosure grounding (replaces mandatory full read of the 63KB catalog; >80% AI-context saving).
- `src/scripts/doctor.js` — read-only consumer diagnosis (adoption level, wiring, bindings validity, config drift). Replaces the installer entirely.
- `src/scripts/lint-reference.js` — token-purity lint for `reference/` (no hardcoded hex).
- `src/scripts/split-catalog.js` — generates the split catalog from the monolith.
- `SETUP.md` — zero-install adoption ladder (Level 0/1/2).
- CI workflow (build validation + reference lint on every push).
- Consumer bindings protocol (Self-Healing Map Law) — see `CLAUDE.md` §4; the bindings file itself lives in each consumer repo (e.g. `portal-nuxt/.ds/bindings.md`).

### Removed
- `src/adapters/vue/` (27 Vue components) — execution layer is now owned by consumer repos; visual truth moved to `reference/`.
- `install.js` (790-line installer), `release.js`, `Ship to Devs.bat`, `ship-ui.ps1`, `example-page.vue`, `test-installer.py` — obsolete under zero-install distribution (`git push` + submodule pull).

### Changed
- `CLAUDE.md` restructured: universal laws only (§0–§4), consumer-agnostic; repo profiles live in each consumer repo's thin CLAUDE.md.
- `validate-pages.py` — fixed hardcoded absolute ROOT path (now resolves relative to the script location).

### Unchanged (the truth layer)
- `src/foundations.json` (181 tokens), all 76 specs in `src/components/`, `src/assets/`, `dist/tailwind.preset.js`, `dist/variables.css`, `build.js` validation.

## 1.x — see HISTORY.md

Internal track record v1.0 → v1.6.15 (the "K series"), retained verbatim in `HISTORY.md`.
