# Changelog

All notable changes to this design system. Semver: token/spec rename or removal = MAJOR (with a one-cycle deprecation alias), additions = MINOR, fixes = PATCH. Enforced mechanically by `contract-check.js`.

## 3.2.0 — 2026-07-28

**Safety, provenance and a rebuilt panel.**

### Fixed — three bugs that could damage or mislead a consumer repo
- **An install could report success having committed nothing.** `git add` aborts on any missing pathspec, so nothing was staged; the resulting `nothing to commit` was whitelisted as success. The panel now stages only existing paths, verifies the index, and reports the actual file list.
- **Uninstall deleted the whole `.ds/` folder**, taking the developer's own files with it. Removal is now receipt-driven and file-level; `.ds/` goes only when empty.
- **Legacy cleanup removed every line matching `design system`** from a consumer's `CLAUDE.md`, including their own prose. Now section-aware, with a backup first.

### Fixed — design system integrity
- `split-catalog.js` silently dropped **24 of 76 specs**: its heading regex could not match `panel-content` (hyphen) or the pages' empty category, so all 12 `panel-*` and 12 `page-*` specs were missing from `catalog/components/` and `INDEX.md` — and were being concatenated into `catalog/TOKENS.md`, which every AI agent reads once per session as its token vocabulary. The catalog is now complete: 76 files, `INDEX.md` gains `panel (12)` and `page (12)`, `TOKENS.md` is pure vocabulary again.
- `validate-pages.py` still hardcoded an absolute path and crashed; 3.0.0 claimed this was fixed. Now resolved relative to the script and wired into CI.
- Version stamps disagreed across five places. `version.json` is now the single source; `stamp-reference.js` rewrites all 28 reference stamps and CI fails on any mismatch — making HISTORY law #2 mechanical instead of aspirational.
- CI could fail on an unrelated push because `build.js` re-stamped `catalog/index.json` with the current date. `generatedAt` now moves only when content changes.
- `reference/components/info-block.html` was actually **composite-06 CandidateInfoBlock**; renamed to `candidate-info-block.html`.
- `doctor.js` no longer latches onto a monorepo workspace root.

### Added — release safety
- **`contract-check.js`** — the regression gate. Compares the build against `.release/contract.json` and fails on any removed CSS var, text style, colour key, spec code, component id or enum value unless the bump is MAJOR **and** a deprecation alias exists. Also derives the required semver bump and fails if `version.json` disagrees.
- **`tools/ship.js`** — one command for the whole release chain, in the only correct order, stopping at the first failure.
- **`tests/e2e.js`** — drives the panel through install, drift, restore, change request, update, impact, rollback, uninstall, and the migration path for repos installed by an older panel. 61 assertions, run in CI.
- **`src/scripts/adoption-report.js`** — who has adopted, at what level, on what version, and who is behind. Reads committed receipts; no telemetry, no server. Providers: `list` (works on any git host), `github`, `gitlab`.
- `ds-meta.json` — maintainer contact, read live by the panel.

### Added — panel v3.0.0 (`tools/ds-setup.cjs`)
- **Install receipt** `.ds/manifest.json` with a SHA-256 per managed region, plus append-only `.ds/history.jsonl` (no merge conflicts when two developers install in parallel).
- **Markers on every touched file** — `CLAUDE.md` and `.ds/bindings.md` use `design-system:begin/end`; config lines carry a trailing `/* design-system:managed */` that survives Prettier. Removal matches the marker, not the text.
- **Nothing is deleted** — every destructive action copies to `.ds/.trash/` first and prints the path.
- **Drift detection in two classes.** Contract files (`CLAUDE.md`, config lines) warn and offer Restore. `.ds/bindings.md` is a *living* file — the Self-Healing Map Law asks agents to edit it — so it gets a neutral notice and offers **Send to designer**, which packages the diff into `.ds/requests/` and opens a prefilled email.
- **Pre-flight update impact.** Before pulling: tokens and specs added/removed, semver jump, and a scan of the consumer repo showing which files use anything about to disappear.
- **One-click rollback** to the previous submodule pin, with a rollback point recorded before every update.
- **Panel self-update** — the panel now ships inside the design system at `tools/ds-setup.cjs`, so it can detect that it is outdated and replace itself.
- **"Create receipt"** migration for repos installed by panel v2.x: reads the current state, adds missing markers, records it as the baseline rather than as drift.
- **Repo URL is fully portable** — `git submodule set-url` migration for when the design system moves host, plus a team-level `.dsrc.json` default. Precedence: UI input → `DS_REPO_URL` → `.dsrc.json` → fallback. After cloning, the panel verifies the URL really holds this design system.
- **Byte-level plan preview** — click any step to see the exact content that will be written.
- **Uninstall states what remains** afterwards, before you confirm.
- **Optional telemetry**, off by default, payload shown verbatim before the first send.

### Changed — panel UI
- Rebuilt around a left sidebar (Home · Setup · Health · Versions · Prompts · Docs). Attention cards render **only when something is wrong**, so a healthy repo shows a single line.
- **Bilingual ID / EN**, defaulting to Indonesian. Server-produced strings travel as `{id, en}` pairs. Previously the UI mixed both languages inside one card.
- **Fustat and DM Mono** embedded as base64 — the design system's own typeface tokens, so the panel finally obeys them. No CDN, works offline, never phones home.
- **Every emoji replaced with Lucide icons** (inline sprite, ISC). The panel discloses that its own chrome uses Lucide while the **product** stack is Tabler, and shows the live product stack read from `foundations.json` and the catalog.
- Tables follow the design system's own §5 rules: inside a card, 10 rows per page, 10/25/50 selector capped at 50, row click never navigates.
- `alert()` replaced with inline toasts; focus rings, `aria-label` on icon-only buttons, `Esc` to close, `role="status"` on progress; respects `prefers-color-scheme`.
- The auto-launching tour is gone.
- Panel sources now live in `tools/dashboard/` as real HTML/CSS/JS and are bundled by `tools/build-wizard.js`. The **delivered artifact is still exactly one zero-dependency file**; only authoring changed.

### Docs
- `SAFETY.id.md` / `SAFETY.en.md` — every file touched, every marker, the trash guarantee, and an honest list of what stays outside our control.
- `TUTORIAL.id.md` / `TUTORIAL.en.md` — split by role: maintainer and developer.

### Known gaps, open on purpose
- `reference/` covers 25 of 52 component codes. The missing 27 are design authoring against Figma sources; producing them from spec JSON alone would create unverified visual truth.
- Asset coverage: avatars 1/41, icons-custom 35/94, illustrations and logos not exported. `build.js` already writes an honest **Files:** coverage line into the catalog so no agent references a file that does not exist.

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
