# Changelog

All notable changes to this design system. Semver: token/spec rename or removal = MAJOR (with a one-cycle deprecation alias), additions = MINOR, fixes = PATCH. Enforced mechanically by `contract-check.js`.

Architecture overview: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Safety guarantees: [`SAFETY.en.md`](./SAFETY.en.md).

## 3.5.2 — 2026-08-05 — the gallery, read section by section

Fifteen gates were green and four sections of `gallery.html` were visibly wrong. All four were found by a person scrolling the page, which is the whole of `HISTORY.md` law #1 in one sentence.

### Fixed — three specimens had been spliced INSIDE the previous specimen
The v3.4.9 specimen additions inserted `<p class="ref-label">…</p><specimen>` before the `</div>` that closes the **preceding** specimen rather than the one that ends the group. So `#panel` rendered its subheader stage inside the first stage's `overflow:hidden` box with an absolutely-positioned panel on top of it; `#candidate-card` rendered the `es-ccard--hoveractions` card inside the resting card; `#filter-field` rendered two FilterFields inside the first one.

**Div balance stayed correct**, every class resolved, no id duplicated, nothing overflowed, the type was on the ramp. GATE 11 counts pairs; it cannot see that a pair is in the wrong place. **`lint-reference.js` GATE 13** now rejects any `.ref-*` scaffolding node nested inside an `.es-*` component root.

### Fixed — a stylesheet that existed, was correct, and was linked by nothing
`css/info-block.css` was the one file of 49 the gallery never linked, so composite-01 rendered as unstyled inline spans — label and value butted together with no gap, no icon column, no chip row. Four `reference/components/*.html` files had the same fault: `data-table.html` used the whole `es-cell*` family without `table-row.css`, `filter-panel.html` used `es-ffield*` without `filter-field.css`, `table-column.html` and `table-row.html` used `es-table__table` without `data-table.css`. Those are the files the catalog tells an AI agent to open and copy.

GATE 4 asked whether a class resolves in `reference/css` — any file in it. A browser asks whether it resolves in a stylesheet **this document links**. **GATE 12** now asks the browser's question per document, and separately fails any stylesheet no document loads at all.

### Fixed — a labelled row action rendered as a two-storey stack
`.es-cell__actionbtn` had a background, a border, a radius and padding, and no `display`. `.es-ico { display: block }` therefore put the eye icon on its own line with "View" underneath it, and the label inherited `.es-cell`'s `text-head` so it sat black inside a brand border. Now `inline-flex`, gap per atom-01, and its own brand foreground — the same law `CLAUDE.md` §5 already states for the Danger button.

### Fixed — gallery scaffolding baked into a component specimen
`<span class="ref-label">Suggestions</span>` sat inside `.es-qsuggest`. composite-03's anatomy is root / chip-list / chip; it has no label. An agent copying that specimen would have shipped a label the spec does not define. Also removed: six `</div>` after `</main>` closing nothing, left by the v3.4.5 regroup splice (**GATE 14** now balances whole documents, not only showcases).

### Changed — the derived tier is Part 3: last, collapsed, and reference-only
Placement outranks a caption. Twenty-eight unreviewed renderings sat inline between two reviewed groups, each with its own amber banner, and the group still read as approved.

- They now sit **after** Composed samples, inside a native `<details>` that is **closed by default**. `<details>` because the reference tier must work from a `file://` double-click with JavaScript off; the script only adds hash navigation into a closed disclosure and remembers the state.
- Section ids are unchanged — the anchor contract holds, and a catalog link into Part 3 opens the disclosure and lands on its section.
- The catalog line became **`Reference (DERIVED — NOT design-reviewed · REFERENCE ONLY)`** and now carries the rule, not just the warning: ground on the spec first · copy only where the rendering agrees with the spec · where the spec is silent prefer a reviewed component from the §2 ladder · where they disagree **the spec wins** and the difference goes to the author · never call the result design-approved.
- The same rule is stated in **`CLAUDE.md` §1b**, at the top of the generated `catalog/INDEX.md`, in the consumer profile written into every adopting repo, and in the gallery itself. `lint-docs.js` checks all four carry the same label so the copies cannot drift apart.

### Fixed — `visual-audit.py` would have stopped seeing 28 sections
A closed `<details>` has no layout, so every probe would have skipped Part 3 and still printed a clean pass. It opens every disclosure before it measures and says so in its output. **A gate that skips must never read as a gate that passed.**

### Fixed — `lint-docs.js` derived fourteen numbers and compared three
Which is why START-HERE §7 still advertised a 35-section gallery (63), an 11-step release chain (13), 9 reference gates (15), a 301 KB bundle (318), and 269 i18n keys (273) — with the gate reporting green the whole time. It now compares every figure it derives, and a row whose shape it can no longer find is a failure rather than a warning. §8's known-gaps list, which still described the 28 as unrendered, was rewritten: they are rendered and *unreviewed*, which is a different and more useful thing to know.

### Also
- **GATE 15** — `reference/` may state a version only through the single-sourced `REF v… · generated …` stamp. Eleven pages carried the version in their `<title>` too, where nothing rewrote it: they read v3.4.2 beside a stamp reading v3.5.1.
- The gallery's legacy `molecule-04` / `molecule-05` / `organism-01` labels now read `layout-10` / `layout-11` / `layout-09`, matching the codes the catalog gives an agent. Section ids are untouched.
- Every new gate was negative-tested — the bug reintroduced, the gate watched to go red — before it was trusted.

The developer contract was true but undocumented, and had one silent failure mode.

### Documented — what a developer actually needs
One command, and **nothing else — no token, no environment variable, no `npm install`, no build step**. Verified rather than asserted: the panel is a single file with **zero npm dependencies**, requiring only Node built-ins (`fs`, `path`, `http`, `https`, `crypto`, `child_process`) and shelling out to nothing but `git`. Node 16.7+ and git are both checked in ES5 before any modern API is touched, and a missing one exits with *"Nothing was changed in your repo."* plus the install command for that OS.

`SETUP.md` now states this explicitly, with a table of the two prerequisites and what happens when they are absent.

### Fixed — the private-repo case failed silently
`curl -fsSL` against a private repository writes no file and returns non-zero, so `&&` correctly stops `node` from running — nothing is created and nothing breaks, but with `-s` there is also no message. A developer sees a command that appears to do nothing. `SETUP.md` now names that symptom and gives the one-line `gh api … > ds-setup.cjs && node ds-setup.cjs` equivalent, which uses credentials the developer already has from `gh auth login` and stays a single command.

### Clarified — `DS_SCM_TOKEN` is not part of the developer path
It exists only so the design system's own repository can read its clone statistics, it runs in GitHub Actions on a schedule (v3.5.0), and no consuming repo, developer or CI job ever needs it. Said plainly in `SETUP.md`, because a token mentioned anywhere in a setup document will eventually be typed by somebody who did not need it.

## 3.5.0 — 2026-08-04 — every spec now has a rendering

Twenty-eight component specs had never been drawn: 12 composites, 12 panels, 4 layouts. They existed as JSON and nothing else, so an AI agent asked for an AppBar had a token list and no shape to copy.

They are built. Each one derives from its own spec's `tokens.base` and `anatomy`, uses only tokens that resolve in `dist/variables.css`, and passes all eleven reference gates plus the headless visual audit at both viewports.

### They are marked, loudly, because they are not reviewed
Structure, tokens and typography follow the spec. Layout decisions the spec does not state — which side a slot sits on, how tall a thumbnail is — were made here. So:

- Every gallery section carries `data-derived="true"` and a visible amber banner.
- They sit in their own group, **Derived — pending design review**, not mixed into the reviewed tiers.
- Every catalog entry reads **`Reference (DERIVED — pending design review)`** with the caveat inline, so an agent copying one knows exactly what it has.
- Approving one is a one-line change: drop `data-derived="true"` and the marking disappears from the gallery, the ToC and the catalog at the next build.

**An unreviewed rendering presented as reviewed is the failure this repository has recorded twice.** The marking is not a disclaimer, it is the mechanism that keeps the distinction visible.

New: `composite-01…03, 05, 09…16`, `layout-01, 02, 04, 08`, `panel-01…12`, with 17 new stylesheets.

### Added — clone sampling runs itself
`.github/workflows/adoption.yml` samples clone traffic weekly and commits the merged record. The built-in `github.token` works where `administration: read` is permitted; otherwise a `DS_SCM_TOKEN` secret is picked up with no code change. **Maintainer-side only** — the contract for every developer consuming the design system is unchanged and remains one command with no token, ever.

## 3.4.11 — 2026-08-04 — the last two reachable gaps

The release audit ended with three items declared out of reach. Two of them were partly *inside* reach; only the third was genuinely not.

### Fixed — two specs were reported as unimplemented while their implementations sat in the folder
`refLine()` matched a spec's `id` against a filename. `atom-12 FormControl` renders as `checkbox.html`, `radio.html` and `switch.html`; `atom-11 FormInputField` renders as `input.html` and `textarea.html`. Both were therefore telling every AI agent `Reference: none yet` while five complete, token-pure renderings sat in the same directory. **A grounding gap created by a naming convention, not by missing work.** An explicit alias map closes it.

### Fixed — asset specs were being given advice that makes no sense for an asset
The eight `asset-*` specs are inventories of shipped SVGs — illustration sets, icon sets, the logo. They cannot have an HTML "reference component", and the fallback line told an agent to *"compose from atoms"*, which is meaningless for a logo. They now point at their asset directory, say plainly that they are an inventory, defer to the existing **Files:** coverage line, and instruct the reader never to invent a filename.

Net effect: the reference gap drops from 38 specs to **28**, and the 28 are now a named, actionable list — 12 composites, 12 panels, 4 layouts — rather than a number.

### Improved — the one path that cannot be tested against the live API is now tested against its contract
`clone-traffic.js` could not exercise its GitHub call offline. The response-parsing step is now a pure `parseTraffic()` function checked against a verbatim sample of GitHub's documented `/traffic/clones` payload: ISO timestamps reduce to dates, counts survive as numbers, a malformed timestamp is dropped rather than counted as day zero, and an empty or error body yields nothing rather than throwing. Ten checks, run by `ship.js` on every release. The network round-trip itself still needs a real token — that is stated, not papered over.

## 3.4.10 — 2026-08-04 — the panel's own visual verdict

START-HERE §8 had carried this line since v3.2.0: *"The panel UI has never been visually verified by its builder."* It was rendered and looked at. It was hiding two faults.

### Fixed — a malformed SVG arc, silently failing to draw
`i-book-open` in `tools/dashboard/icons.svg` contained `a2 2 0 2 2H8` — an elliptical arc whose large-arc/sweep flag pair had been lost, leaving `2` where a `0` or `1` belongs. Every other arc in that path uses an explicit `00`/`01` pair. The browser rejects the whole `d` attribute, logs to console and draws nothing; nobody had opened the panel with the console visible. Repaired to `a2 2 0 002 2H8`, and every other arc in the file checked for the same fault.

### Fixed — the pill navigation permanently covered the bottom of every page
`.pillbar` is `position: fixed; bottom: 18px` and 45px tall, and `.col` had no bottom padding. The last ~63px of every view sat under it with no way to scroll clear — at the bottom of the Health view, the final rows of a table. Gutter added.

### Also
- START-HERE §8's reference-coverage figure said 25 of 52; it is 27 of 64, and `lint-docs.js` now derives it.

Neither of these is structural, and no gate would have found either: the icon renders as an absence, and the covered strip only exists at one scroll position. **This is what HISTORY.md law #1 means in practice — a programmatic check is never a visual verdict.** The gates got the reference tier to a floor no human eye is needed for; the panel needed the eye.

## 3.4.9 — 2026-08-04 — closing the audit findings

v3.4.8 named two gaps and left them named. This closes them, and closing the first one uncovered two more bugs that had been invisible for the life of the file.

### Closed — 29 component rules had no specimen
The gallery calls itself the visual truth for all components. A CSS rule that no specimen renders is a claim with no evidence: nobody has seen it, no gate has measured it, and an agent told to use it is copying from a description rather than a rendering. Every one now has a live specimen:

- **Avatar** with a real image (`es-avatar__img`) at all four sizes · **Button** full-width (`--block`) · **SplitButton** with a leading icon · **Radio** showing the real visually-hidden `<input>` that carries the form value
- **DropdownMenu** — `es-menu__triggerwrap` and all four placements (`bottom-start` · `bottom-end` · `top-start` · `top-end`)
- **FilterField** — `#options` checkbox list and `#suggestions` chips
- **CandidateCard** — `es-ccard--hoveractions`, the hover-reveal density that had been described in prose since v3.4.3 and never shown
- **Panel** sub-header · **PanelSection**'s five remaining variants · **Modal** sm / lg / fullscreen and the white browser body
- **DataTable** `es-table__state` (empty · loading · error) · **TableColumn** inline `<select>` · **TableRow** currency, labelled action button, brand dot

`es-table__foot` was a dead alias from markup deleted two releases ago — removed. The twelve Vue `<Transition>` hooks cannot have a static specimen and now carry `/* runtime-only: … */` in the CSS, next to the rule they excuse rather than in a list nobody editing the CSS would see.

**`lint-reference.js` GATE 10** enforces it: every `es-`/`cp-` rule must be demonstrated or explicitly excused.

### Found by demonstrating — `.es-menu__triggerwrap` was not a positioning context
It was `display: inline-flex` and nothing else, while `.es-menu__panel` is `position: absolute`. The wrapper exists *to be* the panel's positioning context and was not one, so every placement modifier resolved against whatever ancestor happened to be positioned — in practice the page. No specimen had ever used the class, so nothing rendered it and nothing caught it. Writing the specimen found the bug in the first render.

### Found by demonstrating — eleven showcases had unbalanced markup
`panel`, `panel-section`, `modal`, `filter-field`, `candidate-card`, `candidate-info-block` and `composed-01`…`05` each shipped with one or two unclosed `<div>`s. The browser auto-closes at `</section>`, so the page looked right and every gate passed, the headless render included.

It is a trap rather than a cosmetic flaw: anything appended to such a section lands *inside* the unclosed element and inherits its width. That is precisely what happened to the first PanelSection specimen written this release — 108px wide inside a 964px parent — and only the overflow probe noticed. **`lint-reference.js` GATE 11** now requires every showcase to close every `<div>` it opens.

### Also
- `clone-traffic.js`'s merge is exercised by a self-test (`--self-test`) so the date-merge path is verified without a network.
- The 25-of-52 reference-coverage figure in START-HERE was stale; recomputed and now derived by `lint-docs.js`.

## 3.4.8 — 2026-08-04 — release audit

A full sweep before release. Four gaps, all of the same species: **prose asserting a fact about the repository, with nothing checking the fact was still true.** That pattern has now produced a phantom visual-audit gate (v3.4.2), a comment describing behaviour the code did not have (v3.4.5), and these.

### Fixed — the safety documentation described a mechanism that no longer exists
`SAFETY.en.md` / `SAFETY.id.md` still documented `.ds/.trash/` as the recovery location, listed it as git-ignored, said it survived uninstall, and told the reader to `ls -la .ds/.trash/` to find their files. Recovery moved to `.git/ds-recovery/` in v3.4.5. **This is the document a nervous developer reads before running an uninstall**, and it was pointing at an empty path. Both languages rewritten, including the two guarantees added since: the pre-install `original/` snapshot the revert verifies against, and the permanent ledger.

### Fixed — a file two subsystems required had never been created
`CLAUDE.md` §7 and `contract-check.js` both name `.release/deprecations.json` as the place a deprecation alias must be declared before a breaking removal is allowed. The file did not exist. Created, empty and schema'd — an empty ledger is an honest starting state; a missing one is a rule nobody can follow.

### Added — `lint-docs.js`, so the numbers cannot drift again
START-HERE.md §7 is titled "Current numbers" and claimed 99 e2e assertions against 103, and a 9-step release chain against 12. Nobody lied; the numbers were true when written and nothing recomputed them. Every figure in §7 is now derived from the repository and compared on every release, along with the reference stamp matching `version.json` and the changelog having an entry for the version being shipped. `--fix` rewrites the stale ones. The table also gained the rows it was missing (release steps, gate count, catalog-to-reference coverage).

### Added — the narrow viewport had never been rendered
`visual-audit.py` only ever loaded 1280×900, so the gallery's sub-900px branch — a whole media query — was shipped unlooked-at. It now runs a second pass at 820px. Clean: the index stacks above the content, nothing overflows, no page-level horizontal scroll.

### Added — skip link
35 index entries sit ahead of the content in the tab order. A keyboard user had to traverse all of them, on every visit, to reach the page. `.ref-skip` appears on focus and jumps to `<main>`.

### Removed
Three CSS rules whose only consumers were deleted earlier in this cycle: `.cp-empty__icon` (replaced by the real shipped illustration) and `.es-cell__replace` / `.es-col__replace` (the ReplaceMe specimens).

### Known gap, stated rather than hidden
51 component CSS classes are defined but never demonstrated in `reference/`. Most are legitimate variants and animation hooks a consumer may need; a few are probably dead. They were counted, not guessed at, and not deleted blindly at release time — deleting a rule because no specimen happens to use it is how a working variant disappears. `es-ccard--hoveractions` is the notable one: it is described in the gallery caption and carried as a `hoverActions` prop in the composite-08 spec, but has no live specimen. Worth adding next cycle.

## 3.4.7 — 2026-08-04

**The gallery shipped a second copy of five sections, and the adoption counter was reading one log out of three.**

### Fixed — 36 KB of duplicated markup outside the shell
- The v3.4.5 regroup script reassembled the page on `src.rindex("</section>")`. The composed samples were authored as `<div class="ref-section">`, so everything after the last real `</section>` — **composed-01 through composed-05, 36 KB** — was re-appended verbatim *outside* `<main>` and rendered a second time at page level, full width, below the shell. Every gate passed: the anchors all existed (twice), every class resolved, nothing overflowed. Removed.
- **`lint-reference.js` GATE 9** now fails on any duplicate `id` in a reference file, and on any `ref-section` sitting outside `<main>`. Duplicate ids are not cosmetic: `#composed-01` and `getElementById` both resolve to the **first** match, so an agent following a catalog `Reference:` link could silently have been reading a stale copy.

### Fixed — the gallery shell
- **A 24px document margin sat above and to the left of a full-height sticky rail.** The standalone per-component pages are documents and want that margin; the gallery is an application shell and does not. `body.ref-app { margin: 0 }`.
- **The filter box and the collapse control scrolled out of reach.** The rail was one scrolling box, so the two controls you reach for while deep in the page left the screen exactly when they became useful. The rail is now a column with a pinned head; only the list scrolls.

### Fixed — the adoption counter, properly this time
- `.ds/history.jsonl` is committed team knowledge, so an uninstall archives it out of the working tree. The next install then creates a **fresh, empty** `.ds/history.jsonl` — and `loadHistory()` read the working-tree log **or** one archive, never the union. So install → uninstall → install reported "1 install, 0 uninstalls" no matter how many cycles had really happened. The events were never lost; the reader had stopped looking at all of them.
- There is now a permanent, machine-local, append-only **ledger at `.git/ds-recovery/ledger.jsonl`**. Nothing removes it — not an uninstall, not an archive, not a submodule deinit. Every event is written to both files and the counters read the union of the working-tree log, the ledger and every archive, de-duplicated by exact line. Existing history found in any archive is folded into the ledger once, on first read after upgrading.
- Locked in by three new e2e assertions, plus a standalone cycle test: three full install/update/uninstall rounds report 3/3/3, and still do after `.ds/` is deleted outright.

### Added — clone traffic, so the team number can be true without a repo census
`git submodule add` **is** a clone, and GitHub counts clones. `GET /repos/{owner}/{repo}/traffic/clones` therefore measures the install action at the source, with no telemetry of ours and nothing added to any consuming repo — the thing the census needs somebody to configure first.

That endpoint only returns 14 days, which is presumably why it goes unused. But it is a *sliding* window and GitHub's figure for a closed day never changes, so **sampling it repeatedly and merging by date accumulates a permanent daily history**. `ship.js` now samples on every release; a fortnightly cron covers the gaps. A lossy endpoint becomes a durable record because of how it is read.

- `src/scripts/clone-traffic.js` — merges into `.release/clone-traffic.json`. Overlapping samples correct a day rather than double-counting it (unit-tested). No token, no network, or a 403 → it **skips loudly and never overwrites the existing record**; a failed read must not destroy real history.
- The panel's Team tab shows clones under their own labels the moment any data exists, with the caveat carried in the note: this counts **every clone including CI**, and is **not** the number of adopting projects. The census in `ADOPTION.md` remains the only thing that can answer that. A number presented as more precise than it is does more damage than no number — that mistake cost this repository four releases of a dashboard reading 0.
- Requires a token with **push** access to the design system repo; GitHub restricts traffic data to people who could already read it in the Insights tab.

## 3.4.6 — 2026-08-04

**Two files still survived the uninstall, and the gallery index covered the thing it was indexing.**

### Fixed — the uninstall's remaining two files
- **The install itself was the lossy half.** Appending a managed block ran `prev.replace(/\n*$/, "\n\n")`, which normalised whatever trailing newlines the developer's file had into exactly two. A `.gitignore` ending in no newline, or in three, could never be restored byte-for-byte afterwards no matter how careful the strip was — the original bytes were gone before the revert ever ran. The append no longer rewrites the existing tail.
- **The revert now proves its work instead of assuming it.** Before the panel first writes to any file it keeps a pristine copy in `.git/ds-recovery/original/`. After stripping its markers the revert compares the result against that copy and, if a single byte differs, restores the original verbatim — and says so in the step log. Files that did not exist before the install are removed rather than left behind empty.
- **`ds-setup.cjs` was never actually deleted.** v3.4.5 deferred the removal to a `process.on("exit")` hook, which does not fire when a developer closes the browser tab and walks away — so the panel file sat there untracked exactly as it had before the fix. It is now removed immediately after being copied to recovery (Node keeps no handle on a CJS entry file once loaded), with the exit hook kept only as a fallback for platforms that refuse.

### Fixed — the gallery index
- **`position: fixed` was the wrong tool.** composed-05 is 1316px of table, so the page scrolls horizontally — and a fixed element does not move when it does. Scroll right and the index sat on top of the content it exists to index. The page header had the mirror fault: stamp, title and intro lived *outside* the scrolling column, so they rendered underneath the index at x=0. The page is now a single grid; the index is a real column that participates in layout and cannot overlap anything, and `min-width: 0` on the content column keeps a wide table scrolling inside its own `.es-table__scroll` instead of stretching the document.
- **Index entries are one line, always.** A three-line wrap for `composed-05` made the index taller than the thing it indexes. Entries truncate with an ellipsis and carry the full name as a tooltip.
- **The index collapses** to a 48px rail via a toggle or `Ctrl/Cmd + \`, and the content column takes the width back. The state persists — a preference you have to re-set on every page load is not a preference. Pressing `/` re-opens it and focuses the filter.
- Literal `\uXXXX` escape sequences had leaked into the markup during the v3.4.5 build and rendered as text.

### Changed
- `visual-audit.py`'s overflow rule is now "the parent's `overflow-x` is `visible`". A container declaring `hidden`, `clip`, `auto` or `scroll` has taken responsibility for what sticks out — that is how `text-overflow: ellipsis` works at all. Only `visible` overflow spills onto the page, and only that is a fault. Re-verified: removing the `box-sizing` reset still trips it.
- **`build-wizard.js` strips whole-line comments from the embedded server source.** The e2e budget assertion says to look for waste before arguing for a new number, and shipping the maintainer's comments inside a single-file artifact is waste — `tools/wizard-server.js` keeps every one of them. Whole lines only, never a line that also holds code, never inside a template literal, and the original is used unchanged if the result does not parse. 323 KB → 313 KB, back under the 320 KB tripwire without moving it.

## 3.4.5 — 2026-08-04

**Uninstall removed the `.gitignore` block that was hiding its own recovery files, then left the files on disk.**

### Fixed — uninstall now returns the working tree to its pre-install state
- **The panel installed a `.gitignore` block covering `.ds/.trash/`, `.ds/rollback-point.json` and `ds-setup.cjs`, and the uninstall stripped that block while leaving every one of those files in place.** A repo that was clean before an install came back from the uninstall with a dozen untracked recovery artifacts in Source Control. It removed the raincoat and left you in the rain. **All recovery state now lives in `.git/ds-recovery/`** — outside the working tree, invisible to `git status`, never committed, and destroyed by nothing short of deleting the clone. The "nothing is ever destroyed" guarantee is kept; the mess is not.
- **`stripHashBlock` and `stripBlock` reformatted the entire file, not just the block being removed.** `.replace(/\n{3,}/g,"\n\n")` ran over the whole document, so any repo whose `.gitignore` or `CLAUDE.md` happened to contain three consecutive newlines came back from an uninstall silently reformatted. A revert that edits bytes it did not install is not a revert. Both strips are now byte-exact: the block, plus the one blank line the install put in front of it, and nothing else.
- **`.gitmodules` was left staged as an addition.** Git only rewrites it when `git rm <path>` succeeds; if the folder had already gone, the stale `[submodule]` section survived and the file sat in Source Control as `A .gitmodules`. The panel now removes its own section explicitly and deletes the file when nothing else claims it.
- **One failing step aborted the whole uninstall.** A `git submodule deinit` against a submodule git no longer knows about returned non-zero and `execSteps` stopped there — leaving the repo *half* uninstalled, a worse state than either end of the operation. Submodule cleanup steps are now `soft`: they report and carry on.
- **`removeManagedLine` deleted the entire line containing the marker.** The panel always writes its line alone, but if anyone had since merged their own code onto it, that code was deleted too. It now drops the line only when the managed text is all that is on it, and otherwise excises just the managed segment.
- New final step: **verify the working tree came back clean.** It runs `git status --porcelain` and prints exactly what still differs and why, rather than a green tick over an unverified claim.
- Legacy installs are migrated: anything a pre-3.4.5 panel left at `.ds/.trash/` or `.ds/rollback-point.json` is **moved** into `.git/ds-recovery/` during the uninstall.
- The panel now removes `ds-setup.cjs` from the repo when it stops, after copying it into `.git/ds-recovery/`.

### Fixed — dashboard counters that reset to zero on every design system update
- **`.release/adoption.config.json` ships with `repos: []`, so `adoption-report.js` wrote a file full of structural zeros — and `ship.js` regenerates it on every release.** The panel could not tell those zeros apart from a real measurement of zero, and the adoption card defaulted to the Team tab, so every update looked like the numbers had just been wiped. The developer's own counts were correct and cumulative the whole time, one tab away in `This repo`.
- `adoption-report.js` now publishes `{ configured: false }` and **no counters at all** when nothing is registered. A structural zero is not a measurement.
- `adoptionStats()` returns `org: null` unless the report means something. The function's own comment already promised this ("rather than showing a zero that looks like real data"); it just checked whether `totals` existed instead of whether it said anything.
- The adoption card no longer hardcodes `team` as the default scope — it opens on a tab that can answer its own question, and explains *why* the team tab is empty instead of showing an unexplained disabled control.

### Changed — the Component Reference Gallery is navigable
- Thirty-five sections in one flat scroll was complete and unusable: finding TableColumn meant Ctrl+F on a 200KB page. The gallery now has a **sticky, grouped, filterable index** — Assets → Atoms (actions · data display · form controls · navigation) → Molecules → Composites → Layout → Organisms → Composed samples — with scroll-spy highlighting, a `/` shortcut, per-section anchor links and a back-to-top control. ~30 lines of dependency-free JS; with JavaScript off it degrades to a plain anchor list, because the reference must work from a `file://` double-click.
- **Not one section id changed.** Those anchors are the AI grounding contract: `CLAUDE.md` §5 names them and every `catalog/components/<code>.md` links back by anchor. The DOM was reordered freely; the contract was not touched.

### Added
- **`lint-reference.js` GATE 8 — the gallery anchor contract.** Every `gallery.html#<id>` referenced from `CLAUDE.md` or the catalog must resolve, and every internal gallery link must point at a real section. An agent told to open `#table-row` and finding nothing has no visual truth to copy, and will invent one.

### Note
`visual-audit.py` failed on its first run against the new navigation: the per-section anchor link was `opacity: 0` and still hit-testable — the exact ghost-control fault the gate was written for, reintroduced by the person who wrote the gate. It was caught before anyone saw it. That is what the gate is for.

## 3.4.4 — 2026-08-04

**Nothing in `reference/` ever set `box-sizing`. The whole tier rendered in a box model the product does not use.**

### Fixed — the box model
- **`*, *::before, *::after { box-sizing: border-box }` was never declared anywhere in the reference tier**, so every file rendered in the browser default `content-box` while the first adopter (portal-nuxt) runs Tailwind preflight, which is `border-box`. Two consequences: every `width: 100%` element with padding overflowed its container by exactly padding-x×2 + border×2 — **26px for an `.es-field__box`**, which is the visible skew across all inline table filters — and every measurement taken off the reference was taken in the wrong box model, so the reference was not the visual truth it claims to be.
- **`button, input, select, textarea { font: inherit; color: inherit }` was also missing.** A `<button>` with no explicit font renders in 13.33px Arial regardless of the page; one sort-button label in `components/data-table.html` was doing exactly that. Preflight resets this in the product; the reference now matches.
- `.es-field` and `.es-field__box` gained `min-width: 0`. A flex item defaults to `min-width: auto`, so an `<input>`'s intrinsic ~20ch width became a hard floor and the field burst out of every narrow container — 162px past the FilterField card.
- `CLAUDE.md` §3 now states the box-model contract, so a consumer repo without a preflight-equivalent reset is told to add one.

### Fixed — the type ramp
- Five sizes that exist nowhere in `foundations.json` had accumulated: `.cp-title` 20px, `.cp-sub` / `.ref-sub` 13px, `.cp-metric__value` 24px, `.cp-metric__label` 12.5px, `.es-card__title` 15px. All moved onto the 11/12/14/16/18/22 ramp.
- `.es-avatar--xs` used `font-size: 0.625em`, which resolved to **10px** — a size the design system does not have. All five avatar sizes now carry explicit ramp values, matching their already-fixed px boxes.

### Fixed — reported visually
- **Sorted column headers turned brand-blue and read as links.** `layout-10` sets `text-color: system.text-head` with no sorted override; sorting accents the indicator, never the label.
- **The KPI cards were four left-aligned items at four sizes stacked vertically.** Rebuilt as two rows: icon and trend chip anchor the top, number and label read as one block underneath.
- **Table footer order corrected to count (left) · pagination (CENTRE) · rows-per-page (right)** via `.es-pg--tablefoot`. Paging is the frequent action and owns the optical centre.
- Every `ReplaceMe` placeholder specimen removed from the TableColumn and TableRow showcases.
- Gallery scaffolding normalised: 12 headings and 12 captions were using `ts-*` component classes instead of `.ref-h` / `.ref-sub`.

### Added
- **`composed-05` — data table with every column and cell type in one screen.** Ten header types (checkbox select-all, sortable, sorted, inline filter, inline dropdown, icon, subtitle, numeric-right, sticky) against ten cell types (checkbox, photo/avatar + two-line, text, chips, status, currency-numeric, date, dot indicator, link, action icons). molecule-04 and molecule-05 are now proven in composition, not only as isolated specimens.
- **`src/scripts/visual-audit.py` — the headless-Chromium gate.** The v3.4.2 notes claimed "mandatory visual audit gate: headless-Chromium computed-style checks on the reference gallery before packaging". **No such script was ever in this repository.** A gate that exists only in a changelog is worse than no gate, because everyone downstream believes the check happened. It is written now, runs in `ship.js`, and checks what static linting structurally cannot: horizontal overflow, invisible-but-hit-testable controls, images that failed to decode, the typeface actually in effect, and rendered font-size against the ramp. Playwright is author-side only — absent, the script **skips loudly** and never reports a pass it did not earn.
- **`lint-reference.js` GATE 7** — literal `font-size` in reference CSS must sit on the ramp read from `foundations.json`. Catches the same fault without a browser.
- **Every `catalog/components/<code>.md` now carries a `**Reference:**` line** pointing at its rendered implementation (`reference/components/<id>.html`, the gallery anchor, and the standalone page). Previously an agent grounding on a catalog spec was given its tokens and its JSON path and was never told a pixel-accurate implementation existed — while the gallery calls itself the visual truth for all components. 26 specs link to a real render; 38 say `none yet` explicitly, which is itself an instruction (compose from atoms, do not invent).
- `CLAUDE.md` gained the type ramp, the box-model contract, the destructive-button rule, the opacity rule, the footer order, and the composed-sample inventory including which one to copy for a non-trivial table.

### Changed — spec
- **`layout-10` TableColumn `padding` split into `padding-y: spacing.standard.sm` + `padding-x: spacing.standard.md`.** A single `sm` left header labels 2px off the cell gutter beneath them. Closed officially in the spec rather than patched in CSS (HISTORY.md law #4).

### Note on the ghost detector
The first version of the invisible-but-clickable check did not fire on the very bug it was written for. Opacity does not inherit, it composites: a `<button>` inside a container at `opacity: 0` still reports its own computed opacity as `1`. The check now uses `checkVisibility({opacityProperty: true})` plus an `elementFromPoint` hit-test, and was verified by reintroducing the original fault.

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
