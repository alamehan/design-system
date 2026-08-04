# Changelog

All notable changes to this design system. Semver: token/spec rename or removal = MAJOR (with a one-cycle deprecation alias), additions = MINOR, fixes = PATCH. Enforced mechanically by `contract-check.js`.

Architecture overview: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Safety guarantees: [`SAFETY.en.md`](./SAFETY.en.md).

## 3.4.3 — 2026-08-04

**The reference tier was full of class names that matched no CSS rule. Nothing failed; things just quietly stopped being styled.**

### Fixed — the silent class-name drift
- **`es-tabs--pill` was never defined** (the rule is `.es-tabs--basic`), so every pill tab lost the `neutral.muted` container the atom-16 spec calls for and rendered as bare text. Both names now resolve.
- **`.es-row`, `.es-table__head`, `.es-table__filters`, `.es-table__foot`, `.es-col__label`, `.es-col__sort` were never defined.** The DataTable / TableColumn / TableRow showcases were built as div-flex tables against them, so the flex container never existed and every `flex: 1.2` hint on a child did nothing — the whole table tier collapsed into a vertical stack of cells. All three sections are rebuilt on the SAME markup contract as `composed-01`: a real `<table>`, `.es-col` on `<th>`, `.es-cell` on `<td>`.
- **`es-btn--Fill` was never defined** (the rule is `--Filled`), so the destructive button in the composed samples carried an inline red background with no foreground and painted its label in inherited black-on-red. Added a real **`.es-btn--Danger`** variant that declares resting *and* hover, foreground included.
- **`.es-status__dot` and `.cp-card` were never defined** — status dots rendered at zero size, and the composed-sample cards rendered as unstyled text blocks.
- **`--color-system-text-muted` and `--color-system-surface-white` are not tokens** (`--color-system-text-mute` / `--color-neutral-pure-white` are). Every section caption in the gallery fell back to body colour.
- **Eleven files in `reference/pages/` set `font-family: var(--font-family-base, sans-serif)` against a variable that has never existed** — they rendered in the system font, the exact failure GATE 2 was written to stop in 3.3.0. GATE 2 only reads CSS files; the dead variable was in an inline `<style>` block.
- **`assets/avatars/avatar-1.svg` and `avatar-2.svg` do not exist** — only `ava-placeholder-user.svg` was ever shipped. Two TableRow specimens were broken-image boxes in `gallery.html` and `pages/table-row.html`.

### Fixed — spec conformance
- **TableColumn was rendering at `bold.body-sm` and TableRow at `regular.body-sm`.** Both specs say `body-md`. **StatusChip — a single-size component per atom-06 — was appearing at `label-sm` inside tables.** All corrected to the spec.
- **`.es-cell` padding was `sm / md`; layout-11 says `xl / md`.** Restored, which brings the row back to the 48px pitch measured during the v1.6 benchmark rebuild.
- 278 inline `style="width:1em;height:1em;flex:none"` icon boxes replaced with a `.es-ico` class that also sets `display: block`. An inline `<svg>` rests on the text baseline and reads as floating above its label — this was the "icons sit too high" complaint across the whole table tier.
- Inline filter fields no longer blow out their column: an `<input>` carries an intrinsic ~20ch minimum that table auto-layout treats as a hard floor, which pushed the Actions column out of the shell.

### Fixed — CandidateCard actions were invisible but still clickable
- `.es-ccard__actions` had `opacity: 0` at rest, revealed on hover. A real `<button>` at `opacity: 0` stays clickable and tab-focusable while nobody can see it, and it made the reference tier unreadable — the View profile action looked missing. **Actions are visible by default**; the hover-reveal density is now opt-in via `.es-ccard--hoveractions` (with a `:focus-within` escape so keyboard users never lose a focused control). The composite-08 spec records the change rather than leaving the CSS and the spec disagreeing.

### Fixed — illustrations
- `composed-04` stood a Tabler glyph inside a grey circle where an illustration belongs. It now uses the real shipped assets: `option-menus/empty-data.svg` and `icons-custom/system-warning.svg`.
- `.cp-empty__img` was 150px against artwork authored at 64px — a >2× upscale that dominated its own card. Now 96px, with `--lg` at 128px for a full-width empty state.

### Added — four gates, because none of the above could fail loudly
- **`lint-reference.js` GATE 4** — every `es-`/`cp-`/`ref-`/`ts-` class used in `reference/` must resolve to a CSS rule.
- **`lint-reference.js` GATE 5** — every local `src="…"` in `reference/` must exist on disk.
- **`lint-reference.js` GATE 6** — every `var(--…)` used in `reference/`, **HTML included**, must resolve to a real token.
- **`src/scripts/lint-typography.js`** — the size of a component is spec data, not a per-specimen styling choice. Checks every spec-bound element in `reference/` against the `text-style` token in its spec JSON. Documented scoped density zones (`.es-toast__action`, which carries its own padding tokens) are exempt by name, never by silence.
- All four were negative-tested: each original bug was reintroduced one at a time and the matching gate fired. `ship.js` now runs 9 steps.

## 3.4.2 — 2026-08-04
### Fixed
- Reference CSS comment-marker artifact (`*/*/`) that invalidated the first rule of toast.css / rich-text-editor.css / range-slider.css (Toast stacked vertically, RTE borderless, mini action buttons).
- Icon-only Tabs optical centering; Checkbox indeterminate mark centering.
### Added
- Mandatory visual audit gate: headless-Chromium computed-style checks on the reference gallery before packaging.
- DataTable compact sample with filter header row (real Input/Dropdown), sorting, selection, row actions and pagination.

## 3.4.1 — 2026-08-04
### Fixed
- Gallery raw-design sweep: Toast action/dismiss are real Button/IconButton components; Input multi-values are real Chips; DropdownMenu search uses the real Input; stray placeholder text removed; EmptyState uses the real illustration set.

## 3.4.0 — 2026-08-04
### Added
- Component reference gallery upgrade: Chip text ramp aligned with StatusChip; Toast redesigned per Figma; Input 9 types × 3 states; RichTextEditor (atom-10); RangeSlider (atom-13); DropdownMenu icon + search variants; Tabs icon variants; TableColumn 11 variants; TableRow 17 variants; new sprite icons.

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

### Fixed — a second review pass, all found by looking at the running panel
- **The Prompts tab kept its contents after an uninstall, and the Setup page never reset.** One cause, two symptoms: the install form was being *moved* into a container that the receipt view later cleared with `innerHTML = ""`, which destroyed the form node outright. `renderSetup()` then threw on a null reference after any uninstall, and because `render()` calls `renderPrompts()` immediately afterwards, that never ran either. The form now lives inside permanent markup and is folded away with a CSS class — nothing is moved. The server also stops serving prompts entirely once nothing is installed, and `tests/e2e.js` asserts the whole post-uninstall state is indistinguishable from never-installed.
- **The tour's Next button spilled outside its card.** One dot per step is fine at 8 steps and impossible at 15: the dots plus three buttons are wider than a 322 px card. Replaced with a slim progress bar, which is a fixed width whatever the step count — the exact position was already stated as "Step n/m" directly above.
- **The primary button's icon was invisible.** `.nextup .ic { color: var(--accent) }` is a descendant selector, so it reached inside the button and painted the icon accent-on-accent. Every container icon rule now uses the child combinator, and a new e2e check rejects any descendant `.ic` rule that sets a colour — it found one more offender on its first run.
- **"Request a code" had no button styling and did nothing when clicked.** It was an `<a class="btn">`, but the stylesheet scoped every button rule to `button.btn`, so it fell through to plain link text. And a bare `mailto:` is a dead end when no mail client is registered — the click simply appears to do nothing. It is now a real button, `.btn` is no longer element-scoped, and clicking it copies the address *and* opens the draft, then says which happened.
- **The Level 0 / Level 1 explainer looked like a second set of radio options** — two bordered cards directly beneath two bordered choices. It is now a comparison table, which cannot be mistaken for something clickable, with six concise rows instead of eight prose bullets.
- **Prompt field listeners were attached on every redraw**, so after an uninstall and reinstall each copy button fired twice. They are bound once at load and delegated.

### Changed — adoption statistics
- **Team numbers are visible without anyone running anything.** `ship.js` now regenerates the adoption report as part of every release, and `adoption-report.js` writes a valid report even with no repos configured (flagged `configured: false`) instead of exiting with instructions. Telling a developer to run a maintainer's script to see a dashboard number was the wrong shape of solution.
- **Three scopes behind one switch: Team, This repo, Me.** "Me" matches on the same non-identifying actor hash the report already used, so a developer can see their own activity without any address being stored. The counts are cumulative and survive design system updates: `.ds/history.jsonl` is append-only and committed, and uninstalling deliberately keeps it — a fact now asserted by the test suite rather than merely intended.

### Fixed — found by looking at the panel instead of only testing it
- **The tour spotlighted a hidden element.** Step 2 targeted the Home hero, but the panel opens on Setup whenever the design system is not installed, and no step declared which page it belonged to. The hidden element measured zero, so the card parked in the top-left corner pointing at nothing. Every step now declares its page, and a `visibleNode()` guard refuses an element that is hidden or zero-sized — falling back to that destination's pill-navigation button, and skipping the step entirely if even that is gone.
- **A detail view could not be backed out of.** Opening a plan step's preview with the eye button replaced the plan, leaving only Close and Copy — so the only way out discarded the plan you were halfway through reading. Modals are now a proper stack: nested views get an automatic **Back** button, Escape pops one level instead of closing everything, and the diff → Restore and diff → Send-to-designer paths keep the diff underneath them.
- **The page header sat 4 px above the next card**, so the title looked glued to the content below it. Vertical rhythm is now a consistent 24/20 px.
- **The bundle shipped with no fonts at all, briefly, during this cycle.** Adding CSS minification made the minifier delete `/* @FONTS@ */` as a comment, so the substitution found nothing — and the "unreplaced placeholder" guard could not fire, because the placeholder had been *removed* rather than left behind. The substitution now goes through a non-comment sentinel, and a new `buildGuard()` proves both `@font-face` rules and the base64 payload are in the output. `tests/e2e.js` asserts the same three things independently.

### Added
- **Adoption statistics on Home, for reporting.** Repos adopted, installs, updates, uninstalls, distinct developers, change requests, how many are on the latest version and how many are behind. Read from `design-system/.release/adoption.json`, which `adoption-report.js` now writes with a `totals` block. Counted from **committed receipts** — still no telemetry, and the panel makes no network call to produce them. This-repo-only counts are shown separately and labelled, and if the report has never been generated the card says so rather than displaying a zero that would read as "nobody adopted it".
- **A Level 0 vs Level 1 comparison** sits directly under the level choice and highlights whichever is selected, so the difference does not have to be inferred from two one-line descriptions. Choosing Level 1 also reveals a callout naming the two lines it will add and where.
- **The Setup page becomes a receipt once installed** — level, version, commit, install date, and how many files are managed — instead of re-offering the same form as though nothing had happened. The next sensible step is offered explicitly (upgrade to Level 1 from Level 0, otherwise Health and the prompt library), what was written is available as a fold, and the install form moves inside a **Reinstall or change level** fold rather than disappearing.
- **The tour is now 15 steps instead of 8**, covering all seven destinations, the language switch and the ⋯ menu, with a closing summary card. Steps that need an installed design system are dropped automatically when there is nothing to show, and the tour returns you to the page you started on.
- `build-wizard.js` validates `i18n.json` and **fails the build if the ID and EN dictionaries disagree**, so a missing translation cannot reach a bundle.

### Changed
- **The tour now opens with a centred welcome card that can play a motion explainer.** The video path is declared in `ds-meta.json` (`explainer.video`, relative to the design system root) and resolved against what is actually on disk, so the card degrades to a plain placeholder instead of a broken player when the file is not there yet. The panel serves video with byte-range replies so seeking works and Safari will play it at all.
- **Light is now the default theme.** Dark mode is opt-in from the ⋯ menu rather than following the OS preference automatically.
- **Every accordion starts closed**, on every page.
- **Documents in the Docs tab toggle.** Clicking the open document closes it, there is a sticky header with a close button that stays visible while scrolling, and Escape closes it too.
- **About page:** the maintainer handle *is* the portfolio link rather than printing a bare URL beside it, and the contact button now builds a real `mailto:` with a prefilled subject and a footer carrying the design system version, panel version and repo — plus a copy-address button for anyone without a mail client configured. The maintainer email in `ds-meta.json` is now a real address, so both this and the Level 1 code request work out of the box.
- Reference version stamps: `REF v3.3.0`. Truth layer is unchanged — 185 tokens, 86 dark overrides, 12 text styles, 76 specs, 487 colour keys — so `contract-check.js` reports no public-surface change.
- Panel bundle 234 KB → 301 KB, and the **budget in `tests/e2e.js` was raised from 300 KB to 320 KB, once and deliberately.** Every genuinely wasteful byte was removed first: 10 unused icons dropped from the sprite (58 → 48), the bundle's CSS minified (sources keep their comments — they are what maintainers read), and the dictionary embedded compact instead of pretty-printed. What remains is content. The number is a tripwire against someone vendoring a library, not a target to nudge each release.
- `.release/adoption.config.json` ships as a template with an empty repo list, so generating the first report is filling in URLs rather than guessing a file format. Still one file, still zero dependencies, still no network.
- `tests/e2e.js`: 61 → **99 assertions**, now covering git-block drift and restore, the ignore rules themselves, the button-contrast invariant, and both dynamic i18n key families.

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
