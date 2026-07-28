# Changelog

All notable changes to this design system. Semver: token/spec rename or removal = MAJOR (with a one-cycle deprecation alias), additions = MINOR, fixes = PATCH. Enforced mechanically by `contract-check.js`.

Architecture overview: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Safety guarantees: [`SAFETY.en.md`](./SAFETY.en.md).

## 3.3.0 — 2026-07-28

**The reference tier now renders what it claims, and the panel got its navigation back.**

### Fixed — the reference tier was lying about its own typography
- **`reference/css/_base.css` named `"Fustat"` but nothing ever declared an `@font-face` for it.** Chrome silently fell back to the system font, which means every visual verdict ever given against the reference tier was given in the wrong typeface — a direct violation of `HISTORY.md` law #2, written in this repository. Both fonts are now embedded as base64 in the new `reference/css/_fonts.css`, so the reference renders correctly over `file://` (a designer double-clicking `gallery.html`), over `http://`, and inside the panel alike. A `url()` reference would not have worked: Chrome treats each `file://` document as an opaque origin and blocks the font fetch.
- **All 16 icon shapes in the reference were hand-drawn SVG paths, not Tabler.** They sat on a 24×24 grid and looked close enough to pass a glance while being verifiable against nothing. Replaced with **real Tabler 3.45.0 icons (MIT)** — 15 symbols, 97 occurrences — from a sprite that is **inlined per file**, because an external `<use href="sprite.svg#id">` is also blocked over `file://`.
- The checkbox tick was the text character `✓`, which ignores stroke weight and shifts between fonts. It is now the Tabler `check` icon.
- **`lint-reference.js` gained two gates** so neither class of failure can return: it fails if any named font has no `@font-face`, and if any reference HTML contains a hand-drawn `<svg>` or references a sprite that is not inlined. Both fired on the first run and caught a file the migration had missed.

### Fixed — panel
- **Primary buttons became unreadable on hover.** A generic `button.btn:hover` set `background: var(--bg-sunken)` for every button, while `.primary:hover` overrode only `filter` — leaving white text on light grey. Fixed structurally rather than with a patched line: every variant now owns both its resting and its hover background as its own custom properties (`--btn-bg` / `--btn-bg-hover`), and `tests/e2e.js` asserts that any variant setting one sets the other.

### Added — panel v3.1.0
- **Bottom pill navigation** replaces the left sidebar. Frosted, fixed, seven destinations, attention dots on the icons; content is now 880 px wide instead of 720 px in a 1232 px column, which removes the dead space either side. Below 820 px the labels collapse to icons except on the active item.
- The scattered version / language / close controls are consolidated into the pill: a compact ID·EN segmented control, and a **⋯** menu holding the panel version, **Play tour** and **Close panel**.
- **Guided tour, rebuilt and bilingual.** Seven spotlight steps that cross pages on their own, fully keyboard-dismissable, auto-playing once per browser and replayable from the ⋯ menu for ever after.
- **New About page** — the Truth / Reference / Binding model in three cards, build provenance (panel version, installed design system, typeface, both icon sets with their licences), and author credit for Raihan Allaam (@alamehan), UI/UX Designer at ITS Elabram. It also states plainly that the panel makes no automatic network request and that the links only open if you click them.
- **Markdown is rendered, not dumped.** "What's new", the release notes and every document in the Docs tab now have a **Preview / Markdown** switch that defaults to Preview. The renderer is ~90 lines, dependency-free, handles tables, code fences, blockquotes and lists, and escapes the source *before* generating any markup. Mermaid blocks are labelled and shown as source rather than pulling in a ~1 MB renderer.
- **Home has stat cards** — tokens, specs, reference files, catalog files — all read live from the installed design system, plus a product-stack card and the Lucide-vs-Tabler disclosure.
- **Theme switch**: light, dark, or follow-system, on top of the existing `prefers-color-scheme` support.

### Added — git housekeeping as a managed region
- The panel now writes marked blocks into **`.gitignore`** and **`.gitattributes`**, bringing Level 0 to four managed regions. Both are reversible exactly like the others, and both appear in the receipt with a `gitblock` mode.
- `.gitattributes` sets `.ds/history.jsonl merge=union`. Without it, two developers installing on different branches produce a git conflict in an append-only log — a conflict with no correct manual resolution other than "keep both". This gap existed silently until now.
- **`.ds/` is deliberately not ignored wholesale.** `manifest.json`, `bindings.md`, `history.jsonl` and `requests/` are committed on purpose: the receipt is what makes uninstall exact and is what the adoption report reads, and the bindings map is team knowledge. Only `.ds/.trash/`, `.ds/rollback-point.json` and `ds-setup.cjs` are ignored. Rationale in `SAFETY.*.md` §2b.

### Docs
- **`docs/ARCHITECTURE.md`** — new. Layers, what is generated vs authored, the release chain and the failure each gate prevents, the consumer-side file map, where an AI agent enters, live counted numbers, and the honest gap list. Plus **`docs/system-map.mermaid`** as a standalone diagram.
- `HISTORY.md` gains the v3.2–v3.3 audit and **law #5: a lesson that is not a gate is not a lesson**, with a table mapping every past failure to the script that now blocks it.
- `STORY.md` gains chapter 7, in the author's own voice.
- `SAFETY.id.md` / `SAFETY.en.md`: the file table goes from four rows to six, with a new §2b on git housekeeping.
- The design system's own `.gitignore` now documents what is *deliberately committed*, so nobody tidies away `dist/`, `catalog/` or `tools/ds-setup.cjs`.

### Changed
- Reference version stamps: `REF v3.3.0`. Truth layer is unchanged — 185 tokens, 86 dark overrides, 12 text styles, 76 specs, 487 colour keys — so `contract-check.js` reports no public-surface change.
- Panel bundle 234 KB → 278 KB (markdown renderer, tour, About, 58-icon sprite). Still one file, still zero dependencies, still no network.
- `tests/e2e.js`: 61 → **84 assertions**, now covering git-block drift and restore, the ignore rules themselves, the button-contrast invariant, and both dynamic i18n key families.

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
