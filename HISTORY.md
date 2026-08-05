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
| Embedded payloads must really be in the bundle | `buildGuard()` in `build-wizard.js` + `tests/e2e.js` |
| The ID and EN dictionaries must not disagree | `build-wizard.js`, at build time |
| The bundle must not silently bloat | `tests/e2e.js` budget tripwire |
| No descendant `.ic` rule may repaint a button's icon | `tests/e2e.js` selector check |
| `.btn` must style any element, not only `<button>` | `tests/e2e.js` selector check |
| Uninstall must leave the UI indistinguishable from never-installed | `tests/e2e.js` post-revert assertions |

The last row is a small bug with a useful shape: a generic `:hover` rule set the
background of *every* button, while the primary variant overrode only `filter`. White
text on a light-grey hover — invisible. It shipped because CSS does not error, and
because the author who wrote it could not see it. The fix was structural rather than a
patched line: each variant now owns both its resting and its hover background as its
own custom properties, and a test asserts that invariant so the class of bug cannot
return.

**A programmatic check is still not a visual verdict** (law #1 stands). But a visual
verdict given against a lying artifact is worth nothing, so the gates come first.

### A postscript, from the same cycle

Two more silent failures turned up while polishing the panel, and both are worth
recording because they rhyme with everything above.

**The tour pointed at nothing.** Its second step spotlighted the Home hero, but the panel
opens on Setup whenever the design system is not installed. No step declared which page it
belonged to, so the tour measured a hidden element, got a zero-sized rectangle, and drew
its card in the corner beside an invisible hole. It never threw. It looked, to code, like a
tour that worked. It took a human opening the panel and saying "this one is nonsense".

**Adding CSS minification deleted the fonts.** The minifier strips comments; the font
payload's placeholder *was* a comment. So `/* @FONTS@ */` vanished, the substitution
matched nothing, and the bundle shipped with zero `@font-face` rules. The existing guard
looked for placeholders that were **left behind** — it had nothing to say about one that had
been **removed**. Same font, same layer, same class of failure as #4 above, one release
later, through a completely different door.

The lesson is not "check for fonts". It is that a guard which asserts *the absence of a
marker* is weaker than one which asserts *the presence of the payload*. `buildGuard()` now
does the latter, and `tests/e2e.js` repeats the check independently, because a build script
that verifies its own output is one bug away from verifying nothing.

### One more, on the difference between passing and working

A third review pass found six more faults, and not one of them could have been caught
by the test suite as it stood. They were all found by a person opening the panel and
looking at it.

The most instructive was a single line of CSS. `.nextup .ic { color: var(--accent) }`
is a descendant selector, so it reached inside a primary button sitting in that
container and painted its icon accent-on-accent — invisible. The button worked. The
tests passed. The icon simply was not there.

The second most instructive was structural. To fold the install form away after a
successful install, the code *moved* the form node into a container it rendered — and
that container was later cleared with `innerHTML = ""`. So an uninstall destroyed the
form outright, `renderSetup()` threw on the next null reference, and because
`render()` calls `renderPrompts()` straight afterwards, the Prompts tab kept stale
contents too. Two unrelated-looking bug reports, one piece of DOM surgery.

Both are now gates: a check that rejects any descendant `.ic` rule setting a colour
(which found a further offender the moment it ran), and post-uninstall assertions that
the served state is indistinguishable from never-installed.

But the honest lesson is narrower than "add more gates". It is that **the gates cover
the failures we have already had**. The suite grew from 61 to 99 assertions across
this release, and every single addition was written *after* a human said "this looks
wrong". A test suite is a memory, not an imagination — so the visual pass is not a
formality to be automated away, it is the only step that can find something nobody has
thought of yet.


---

## v3.4.3 — the class-name audit

The author opened `gallery.html` and reported six things that looked wrong: pill tabs with no
background, a CandidateCard whose action button only appeared on hover, three table sections that
were "berantakan", icons sitting too high next to their labels, an oversized illustration, and a
red button with black text. Six reports; one cause underneath most of them.

**Every one of those sections referenced a CSS class that did not exist.**

    HTML said                 CSS actually defined
    es-tabs--pill        ->   .es-tabs--basic
    es-btn--Fill         ->   .es-btn--Filled
    es-row               ->   (nothing)
    es-table__head       ->   (nothing)
    es-col__label/__sort ->   (nothing)
    es-status__dot       ->   (nothing)
    cp-card              ->   (nothing)

A class that matches no rule does not throw, does not warn, and does not appear in a
token-purity check. It just silently drops a background, a flex container, or a foreground
colour. The DataTable showcase was a div-flex table whose flex container never existed, so every
`flex: 1.2` on a child resolved against a plain block parent and the entire tier stacked
vertically. The red Delete button carried `style="background:var(--color-semantic-error)"` on a
variant-less button and inherited body colour for its label.

Three lessons, all now gates.

**1. Purity is not conformance.** `lint-reference.js` proved the reference had no hardcoded hex,
loaded every font it named, and drew every icon from the real Tabler sprite — and passed while
three sections rendered at 12px against specs that say 14px. Sizes live in the spec JSONs, so
`lint-typography.js` now reads them and checks the HTML against them.

**2. A gate that only reads one file type has a blind spot the shape of the other one.** GATE 2
(v3.3.0) exists so a named font is always loaded. It reads `reference/css/*.css`. Eleven files in
`reference/pages/` set `font-family: var(--font-family-base, sans-serif)` in an inline `<style>`
block against a variable that has never existed in this repository — and rendered in the system
font, which is precisely the failure GATE 2 was written to prevent, arriving through the door
GATE 2 does not watch. GATE 6 now reads the HTML too.

**3. Invisible is not hidden.** `.es-ccard__actions` used `opacity: 0` for a hover-reveal. The
button stayed in the tab order and stayed clickable the whole time; it simply could not be seen.
The author read that as "the button doesn't show up", which is the correct reading. Hiding an
interactive control is a `pointer-events` and focus-management problem, not an opacity problem —
and in a reference gallery, whose entire job is to show what a component looks like, the resting
state must be the visible one. The spec was updated alongside the CSS rather than left
contradicting it.

A fourth observation, worth keeping: the author found all six of these by looking, after a
release whose own notes recorded "mandatory visual audit gate: headless-Chromium computed-style
checks on the reference gallery before packaging". A computed-style check confirms what a rule
resolved to. It cannot tell you that the rule you meant to write was never matched in the first
place, because the element still has *a* computed style — the default one. Law #2 holds, and it
is narrower than it looks: the on-screen stamp proves you are looking at the right build, and
then a person still has to look.


---

## v3.4.4 — the gate that only existed in a changelog

The v3.4.2 release notes contain this line:

> Mandatory visual audit gate: headless-Chromium computed-style checks on the reference gallery
> before packaging.

There was no such script. Not in `src/scripts/`, not in `tools/`, not in `ship.js`, not as a
dependency. The sentence was written, believed, and then relied upon — and the release that
carried it shipped a reference tier in which every `width:100%` field overflowed its container
by 26px, because nothing in `reference/` had ever set `box-sizing: border-box`.

That is a worse failure than an absent gate. An absent gate leaves people careful. A gate that
exists only in prose makes them relaxed about the exact thing it claimed to cover.

The script is written now, and the box model is the reason it had to be. `content-box` is the
browser default; `border-box` is what Tailwind preflight gives the product. The reference had
been rendering in one and documenting the other, which means every measurement anybody had ever
taken off `gallery.html` was taken in the wrong model. No stylesheet linter can see this: each
rule resolves exactly as written. Only a layout engine knows the box came out 26px too wide.

Two smaller lessons, both worth more than they look.

**A detector that cannot fail its own test case is not a detector.** The first version of the
invisible-but-clickable check tested `getComputedStyle(el).opacity` on each control. Opacity does
not inherit — it composites — so a button inside a container at `opacity: 0` reports its own
opacity as `1`. The check ran clean against the exact CandidateCard bug it had been written for.
It was only caught because the bug was deliberately reintroduced to watch the gate go red, and it
did not. Every gate in this repository is now negative-tested that way before it is trusted; a
gate that has never been seen to fail is a green light of unknown wattage.

**The catalog never told anyone the reference existed.** `catalog/components/atom-16.md` gave an
AI agent the tokens and the path to the spec JSON and stopped. It never mentioned
`reference/components/tabs.html` — a pixel-accurate, token-pure, spec-true implementation sitting
in the same repository, under a heading that describes itself as "the visual truth for all
components". The grounding chain was one link short of the thing it was grounding on, for
sixty-four components, for four minor versions. Every catalog entry now carries a `Reference:`
line, and the thirty-eight specs with no render say so explicitly, because "none yet" is an
instruction too.


---

## v3.4.5 — the uninstall that took off the raincoat

The panel's install writes a `.gitignore` block so that `.ds/.trash/`, `.ds/rollback-point.json`
and `ds-setup.cjs` never show up in `git status`. The uninstall then strips that block — and
left every one of those files sitting in the working tree.

So a repo that was clean before the install came back from the uninstall with a dozen untracked
recovery artifacts in Source Control. Both halves were individually reasonable. Stripping a
block you installed is right. Keeping recovery copies is right. Together they were a bug, and
the only way to see it was to run the sequence and look at the result.

The fix is not a smarter strip order. It is that **recovery state should never have been in the
working tree at all.** `.git/` is invisible to `git status`, never committed, and survives
everything short of deleting the clone. Nothing is destroyed and nothing is in the way. When a
guarantee needs a raincoat to hold, put it somewhere it is not raining.

Three smaller faults surfaced while testing the same path, each a variant of *doing more than
you were asked*:

- `stripHashBlock` collapsed runs of blank lines **across the whole file** while removing one
  block, so an uninstall silently reformatted `.gitignore` and `CLAUDE.md` in any repo that
  happened to have three newlines in a row. A revert that edits bytes it did not install is not
  a revert.
- `removeManagedLine` deleted the entire line holding the marker. The panel always writes that
  line alone — but "always" is a statement about the past, and a human merging their own code
  onto it would have lost it.
- A failing `git submodule deinit` aborted `execSteps` outright, leaving the repo *half*
  uninstalled. A cleanup sequence that can stop in the middle has a worse failure mode than
  either of its endpoints; cleanup steps now report and carry on.

### The zero that was not a measurement

A separate report: the dashboard counters "always go back to 0 every time the design system
updates". They did, and the cause was not the counters.

`.release/adoption.config.json` ships with `repos: []`. `adoption-report.js` dutifully wrote
`repos: 0, installs: 0, devs: 0 …` and `ship.js` regenerates that file on every release. The
panel had no way to distinguish a measurement of zero from an absence of measurement, and the
adoption card defaulted to the Team tab — so every single update looked like a reset. The
developer's own counts were correct and cumulative the entire time, sitting one tab away.

What makes this worth writing down is that `adoptionStats()` already carried this comment:

> If the report has never been generated, org is null and the panel says so rather than showing
> a zero that looks like real data.

The intent was correct, documented, and two years of good judgement went into the sentence. The
code under it checked whether `totals` existed rather than whether it meant anything. **A
comment describing the behaviour you wanted is not the behaviour.** The gap between them
survived four releases because zeros never throw.

### One more, on being caught by your own gate

`visual-audit.py` — written in v3.4.4, after a release that claimed a visual gate which did not
exist — failed on its first run against the new gallery navigation. The per-section anchor link
was `opacity: 0` and still hit-testable: precisely the ghost-control fault the gate exists to
catch, reintroduced by the same hand that wrote the gate, four hours later.

That is the strongest argument for gates there is. Not that they catch other people's mistakes.
That they catch the ones you make while confident you have understood the failure.


---

## v3.4.6 — fixing the revert when the install was the bug

v3.4.5 made the uninstall byte-exact and it was still not byte-exact, because the analysis had
stopped one function too early. `stripHashBlock` was made surgical; the *append* that put the
block there was not. It ran `prev.replace(/\n*$/, "\n\n")` — normalising the developer's
trailing newlines before writing. A file ending in no newline, or three, had already lost those
bytes by the time anyone asked for them back. No amount of care in the removal can restore what
the insertion destroyed.

The general shape: **when a round trip does not come back clean, suspect the outbound leg.** The
revert was the visible half and it absorbed two releases of attention while the install quietly
did the damage.

The fix is not only a better append. It is that the revert now **proves** its result: a pristine
copy of every file goes into `.git/ds-recovery/original/` before the panel's first write, and
the revert diffs against it and restores verbatim on any drift. Careful surgery plus a proof
beats careful surgery alone, and the proof is what was actually asked for — the repo back the
way it was.

The second leftover was simpler and more embarrassing. `ds-setup.cjs` was scheduled for deletion
in a `process.on("exit")` hook. That hook does not fire when someone closes the browser tab and
walks away, which is what everybody does. The step log said "removed from the repo when the
panel stops" and was technically true and practically useless: **a cleanup conditioned on an
event that usually does not happen is not a cleanup.**

### And a layout lesson about the word "fixed"

The new gallery index used `position: fixed`. Correct on every page that does not scroll
sideways. composed-05 is 1316px of table, so the page does scroll sideways — and a fixed element
stays put while the content slides underneath it. The index covered the thing it exists to index,
and only at the one scroll position nobody tests at.

Its mirror image was in the same file: the page header sat *outside* the scrolling column, so it
rendered under the index at x=0. Two opposite mistakes, one cause — the layout was assembled out
of offsets rather than declared as a structure. A grid cannot overlap itself.

### On the budget that was about to be raised

The comment-strip in `build-wizard.js` exists because the bundle crossed its 320 KB tripwire and
the e2e assertion beside that number says, in as many words: look for waste first and only then
argue for a new number. There was waste — the maintainer's comments were being shipped inside a
single-file artifact where nobody reads them, while the source keeps every one. 323 KB became
313 KB. The number did not move.

A budget you raise whenever you reach it is a log of your own growth, not a limit.


---

## v3.4.7 — everything passed, and the page was wrong anyway

The v3.4.5 regroup script split the gallery on `src.rindex("</section>")` and pasted the tail
back on the end. Most showcases were `<section class="ref-section">`; the composed samples were
`<div class="ref-section">`. So the tail after the last real `</section>` — five whole sections,
36 KB — was appended a second time, outside `<main>`, and rendered at page level under the shell.

Nine gates ran over that page and all nine went green. Every anchor referenced by the catalog
existed. Every class resolved. Nothing overflowed, the type was on the ramp, Fustat everywhere,
no ghost controls. **The gates were all asking whether the right things were present. None was
asking whether anything was there twice.**

Duplicate ids are not a tidiness problem. `#composed-01` and `getElementById` both return the
first match, so the grounding chain the whole catalog is built on could have been resolving to a
stale copy without anything anywhere reporting a fault.

### The counter, third attempt

Two releases were spent on this and both fixed a real bug that was not the bug.

v3.4.5 stopped `adoption-report.js` writing structural zeros. v3.4.6 made the log follow its
archive. Both correct. Neither addressed the actual mechanism: `.ds/history.jsonl` is committed
team data, so an uninstall archives it — and the next INSTALL creates a fresh empty one. The
reader took the working-tree log *or* one archive. Never the union. So the count reset on
reinstall, which is precisely when somebody testing an uninstall would look at it.

The events were never lost. Every one of them was on disk the whole time, in an archive
directory the reader had stopped consulting the moment a newer, emptier file appeared.

**A count that can be reset by the thing it counts is not a count.** There is now a ledger that
nothing in the product is allowed to delete, and the reader takes the union of every source it
can find.

### On being asked to be cleverer

The report was "however many times I install and uninstall, it goes back to 0 — can't you pull
from the GitHub API or something to get how many installs (submodule clones) there are?"

The instinct was right and the specific idea was better than what was there. `git submodule add`
is a clone; GitHub already counts clones; `/traffic/clones` needs no cooperation from any
consuming repo, which is exactly the dependency that had left the team numbers at zero for four
releases.

Its stated flaw is a 14-day window, which is why it is generally dismissed. But it slides, and a
closed day's figure never changes — so reading it repeatedly and merging by date turns a
fortnight of data into a permanent record. The endpoint did not need to be better. It needed to
be read more than once.

What it must never be is relabelled. It counts clones, CI included, not adopting projects, and
it says so in the number's own caption. The four releases of a zeroed dashboard came from
showing a figure that could not be told apart from a measurement; replacing it with a bigger
figure that cannot be told apart from a census would be the same mistake with better numbers.
