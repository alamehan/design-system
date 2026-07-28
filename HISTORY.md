# E-Systems Design System — Development History

> **Author-side record — not shipped to developers.** The public release is **v1.0**: complete, verified, and live-tested from day one. This file preserves the full engineering record that made that possible — every internal milestone, audit, and forensic fix, plus the lessons that are now permanent rules in `src/CLAUDE.md` §6. Keep it: it is the collective memory that prevents old mistakes from ever being repeated.

**Author:** Raihan Allaam (@alamehan) — UI/UX Designer, ITS Elabram.

---

## Reading guide

Internally the system matured through a long sequence of milestones (recorded below with their internal version numbers, ending at internal v1.6.15). Before the public release everything was collapsed into **v1.0** and all docs were rewritten fresh; the internal numbers exist only inside this file.

## Milestones (internal versions)

- **v1.0 (baseline):** foundations tokens + 68 specs → generated `dist/` + `catalog/`; one-click ship; universal `CLAUDE.md`.
- **v1.1:** tooling tidied into `src/scripts/`; real asset files delivered (option-menus 24 · characters 40 · icons-custom 35) with build-time asset audits; `variables.css` gained `--space/--radius/--shadow/--stroke`; Modes + §5 repo profile added; first Vue kit (15 CSS-var components).
- **v1.2 (audit round):** a full read-sweep of 201 files found 6 issues, all fixed — catalog now prints the EXACT class per token; **Files:** coverage lines on every asset entry; illegal token names (`white-40%`) renamed + name validation in the build; full font fallback stacks; Iconify/Tabler setup documented; a11y focus rings; version/date automated.
- **v1.3:** one-click developer setup (`install.js` + `Setup.bat`/`Setup.command`) — plan-first, never overwrites, `.ds-backup/` + `--undo`, idempotent, `--doctor`/`--dry-run`; zip writes unix perms. v1.3.1 added the recruitment-dashboard sample page; v1.3.2 was a full polish pass from a screenshot audit.
- **v1.4:** spec-true kit — new `scripts/conformance.js` auto-verifies every kit component 1:1 against its spec JSON; +`EPanel` & `EInfoBlock`; spec pagination bar & table typography; `CLAUDE.md` §4 rewritten spec-first.
- **v1.5:** the sample grew into a **13-page showcase**: benchmark dashboard + 12 real product pages built from 12 new `page-*` specs analyzed from the author's Figma screenshots; kit 17 → 27 components; conformance 309 expectations / 25 specs; catalog 68 → 76 specs.
- **v1.6 (staged benchmark rebuild, fase A–I):** the 12 product pages brought 1:1 with the Figma screenshots — measured `geometry` stored in every page spec (e.g. employment panel 1045px, tree 370px); same-screen states merged into single pages with real interactions; kit-idiomatic `#empty` states; motion + `prefers-reduced-motion`; lessons codified into `CLAUDE.md` §6; tests grew to 77/77 with visual-proxy markers and a `geometry` requirement per page spec.

## Final hardening — "seri K" (internal v1.6.1 → v1.6.15)

A worst-first, kit-component-first rebuild of the sample pages, **each page live-tested by the author in the real portal (Nuxt 2)** and only accepted when the on-screen build stamp matched the shipped version. Highlights, in order:

- **K1.1–K2.1 (v1.6.1–v1.6.3):** fullscreen-modal scroll contracts (chrome pinned, only panes scroll); the host-gutter saga — inline zeroing kept losing to the portal's re-renders, fixed for good with a tagged-wrapper + `!important` stylesheet; a spacing-var tier that `variables.css` never emitted was collapsing the Bulk Send panes.
- **K3 (v1.6.4):** the wizard's purple band tint became the **official `semantic.sem-purple` token family** — token gaps get closed officially, never silently.
- **K3.1–K4.2 (v1.6.5–v1.6.7):** explicit fixed-vs-scroll contracts for the wizard and Employment panel. Forensic discoveries: hosts can scroll on an INNER wrapper (locking html/body does nothing); the host's fixed top chrome must be MEASURED from the live DOM (`elementsFromPoint`), never assumed; `::v-deep` in an unscoped block is silently dropped. EPanel gained a `#header` slot for the real top bar.
- **K4.3–K5 (v1.6.8–v1.6.9):** density matched to the retina benchmark shots (2× of 1366×768) — panel chips ~20px = the atom-05 SM-1 recipe as a scoped density zone; directory rows at the measured 48px pitch; compact filter boxes and split-buttons.
- **K6–K6.1 (v1.6.10–v1.6.11):** Candidate Pipeline audited against the Index 1 retina shot (tonal icon buttons, 36px pills, re-tuned chevron stage bar, 28px pager, 30px filter boxes); a flex-wrap hotfix from the author's first live test.
- **K6.2 (v1.6.12):** the author's live shots contained elements that did not exist in the source — a stale build was installed. Full programmatic sync audit (all 196 `var()` refs resolve, zero hardcoded hex) + the **anti-stale-build version stamp** beside the FAB navigator. New law: no visual verdict unless the on-screen stamp matches the shipped version.
- **K6.3 (v1.6.13):** author revision batch — benchmark pager pattern, interlocked chevron stages, Back button, aligned action bar, single-line truncating table cells with tooltips, pinned pre-table chrome via the fit engine (only the table body scrolls).
- **K6.4 (v1.6.14):** SYSTEMIC root cause — the page style block is **scoped**, and 16 zone rules ending on kit-INTERNAL elements were silently dropped by Vue, so several earlier fixes never reached the browser. All such selectors rerouted through `::v-deep`; sunken filter-select text fixed (explicit 30px height + line-height, reproduced in a Chromium harness).
- **K7 (v1.6.15):** final pass on Candidate List + Candidates — rows compacted toward the measured 62px pitch; pagers matched to the benchmark pgbox pattern; tag chips corrected to SOLID `semantic-warning` (**pixel-probed #F59E0B** on Index 3 — the earlier elabram-orange claim was wrong) and the LinkedIn chip to solid brand blue; filter toggle corrected to Filled; full fixed-vs-scroll contracts (title/toolbar pinned; grid view pins the filter panel with internal scroll and only the card area scrolls; table view scrolls only the table wrapper) + a full docs sweep.

## Lessons that became law (codified in `src/CLAUDE.md` §6)

1. **Scoped-CSS law:** a page rule whose final selector element is a kit INTERNAL is silently dropped by Vue's scoped CSS — route it through `::v-deep`. Check every new rule by its last selector element.
2. **Programmatic checks never prove pixels:** only a live render whose on-screen version stamp matches the shipped build counts as visual verification.
3. **Fixed-vs-scroll contract:** height-bound the shell below the measured host chrome, pin the page chrome, give exactly ONE region the scroll; side panels pin and scroll internally.
4. **Token gaps get closed officially, never silently** — a new gap is a hard stop.
5. **Measured geometry lives in the page specs** — never eyeball px; benchmark shots are 2× retina of 1366×768.
6. **Check a kit component's props/slots BEFORE building custom markup around it.**
7. **Merge same-screen states into one page** with real switching logic.
8. **Never trust an old claim over a pixel probe** — earlier notes said the tag chips were elabram-orange; the probe said `#F59E0B` (`semantic-warning`). The probe wins.

## State at public release (v1.0)

- 181 design tokens · 76 specs (64 components + 12 pages) · 27-component Vue kit · one-click safety-first installer · 13-page benchmark sample with a build stamp beside its FAB navigator.
- Verification chain green: `conformance.js` (309 expectations / 25 specs) → `build.js` → `release.js` → `tests/test-installer.py` (all green) → `tests/validate-pages.py` (415 refs, geometry on every page spec).


---

## Pre-release archive - digest of the three retired Notion pages

> The project spanned many AI sessions. Context survived repeated sandbox resets through three Notion working pages - "AI Memory - DS FOR DEVELOPER", "Tracker - Sample Benchmark v1.6", and "HANDOFF - Recap + Instruksi Audit Ulang". On 6 Jul 2026 their impactful content was folded into this file and the MASTER page, and the three pages were deleted. This section preserves what mattered.

**The road to v1.0 (chronological):**

- **Baseline audit (2 Jul).** A previous "already perfect" claim failed a full read-sweep: 6 findings - misleading token-to-class derivation rule in the catalog; catalog promising asset files that were never shipped; illegal CSS variable names (percent signs); Fustat font without fallback stack; undocumented Iconify/Tabler dependency; version mismatches. All fixed; the build became deterministic and self-validating.
- **Installer era.** One-click Setup was born (plan-first, backup + undo, doctor, browser UI, report.txt audit trail). npm ERESOLVE was root-caused to the HOST repo pinned peer deps (not the design system) with auto-retry --legacy-peer-deps. The sample page template learned to render itself to the target repo Tailwind prefix. The test suite grew 39 to 68 checks, always run end-to-end from the shipped zip.
- **The conformance discovery.** The Vue kit had NOT been built from the spec JSONs - sizes and typography were invented. The kit was rebuilt token-exact and conformance.js was created so spec drift can never hide again. This is why the 309/25 gate exists.
- **The benchmark push.** The author supplied 12 real product screenshots; they became 8 new page specs, the kit grew 17 to 27 components, and the sample became a 13-state showcase. **Visual failure #1:** all pages assembled at once, zero visual loop.
- **The measured rebuild.** Side-by-side visual audit, pixel-measured geometry (retina 2x, logical 1366x768), staged per-page rebuild, global polish. **Visual failure #2:** author verdict "kek ga ngambil dari component, kek bikin sendiri" - only Dashboard passed.
- **The forensic audit that changed everything.** Kit-share was counted per page: Dashboard 79% (the only correct page: pure kit composition, zero hardcode) vs List 88 / Pipeline 75 / Candidates 72 / Employment 50 / Wizard 43 / Bulk 40 / Builder 26. 118 custom CSS rules, 67 non-token px values, custom esx-* classes duplicating kit components that already existed. Two corrections mattered: #dbeafe was an official token all along (brand-surface-soft), and the only true token gap (purple) was later closed OFFICIALLY as the sem-purple family. This audit produced the kit-component-first law.
- **The final rewrite.** Worst-first, one page per turn, author live-testing every page against the real screenshots with an on-screen version stamp - the entry-by-entry engineering log is above.

**Meta-lessons that shaped the workflow (now law in CLAUDE.md and the MASTER page):**

1. Programmatic verification is never visual proof - two full visual failures plus one latent layout bug taught this. The only visual verdict is the author's live render with a matching on-screen version stamp.
2. A single master page with the zips attached is the only reliable restore source - it survived 4+ sandbox resets/rollbacks mid-work. Patch + verify chain + zip rebuild must run in ONE command.
3. Never trust size/color claims from old notes or changelogs - re-probe the benchmark pixels every time.
4. Scoped CSS silently drops rules that end on kit-internal elements - the systemic reason repeated "fixes" never appeared on screen until ::v-deep became law.

---

## v3.2.0 – v3.3.0 — the silent-failure audit

An independent re-audit reproduced every claim in this repository rather than trusting
it. Four failures had been shipping for months, and all four shared one property:
**nothing ever errored.**

**#1 — An install could report success having committed nothing.**
`git add a b c` aborts *entirely* if any one path is missing, so nothing was staged.
The resulting `nothing to commit` was whitelisted as success. Developers saw a green
tick on a repo that had not changed. Now the panel stages only existing paths, verifies
the index, and prints the actual file list.

**#2 — Uninstall deleted the whole `.ds/` folder.**
Including files the developer had put there. Removal is now driven by
`.ds/manifest.json`, file by file; `.ds/` itself goes only when empty.

**#3 — The AI catalog was missing 24 of 76 specs.**
One regex could not match a hyphen (`panel-content`) or the pages' empty category, so
every `panel-*` and `page-*` spec vanished from `catalog/components/` — and leaked
into `catalog/TOKENS.md`, the file every agent reads once per session **as its token
vocabulary**. For months, every agent working in this repo held a corrupted vocabulary
and there was no symptom.

**#4 — The reference tier named a font it never loaded.**
`reference/css/_base.css` declared `font-family: "Fustat"` with no `@font-face`
anywhere. Chrome fell back to the system font in silence. Every visual verdict given
against the reference tier was therefore given in the wrong typeface — a direct
violation of **law #2 below**, which this repository wrote. The stamp matched; the font
lied. Icons had the same shape of problem: 16 hand-drawn SVGs on a 24×24 grid, close
enough to Tabler to pass a glance, verifiable against nothing.

### Law #5 — a lesson that is not a gate is not a lesson

The first four laws were written down and then re-broken in new forms, because prose in
a markdown file cannot stop a commit. Every lesson here is now mechanical:

| Lesson | Enforced by |
|---|---|
| No breaking change without MAJOR + a deprecation alias | `contract-check.js` (fails CI) |
| Version stamps must match the shipped version | `stamp-reference.js --check` |
| A named font must actually be loaded | `lint-reference.js` gate 2 |
| Icons come from the real Tabler sprite, never hand-drawn | `lint-reference.js` gate 3 |
| The reference must stay token-pure | `lint-reference.js` gate 1 |
| The panel must survive its own full lifecycle | `tests/e2e.js`, 84 assertions |
| Uninstall must be exact and non-destructive | `.ds/manifest.json` + `.ds/.trash/` |
| A button variant must never lose its own hover contrast | `tests/e2e.js` CSS invariant |

The last row is a small bug with a useful shape: a generic `:hover` rule set the
background of *every* button, while the primary variant overrode only `filter`. White
text on a light-grey hover — invisible. It shipped because CSS does not error, and
because the author who wrote it could not see it. The fix was structural rather than a
patched line: each variant now owns both its resting and its hover background as its
own custom properties, and a test asserts that invariant so the class of bug cannot
return.

**A programmatic check is still not a visual verdict** (law #1 stands). But a visual
verdict given against a lying artifact is worth nothing, so the gates come first.
