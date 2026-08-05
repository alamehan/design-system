# E-Systems Design System — AI Instructions (Universal)

These are the universal laws for any AI working with this design system, in any consumer repo.
This file never references a specific consumer project. Repo-specific profile + execution rules live in the consumer repo's own CLAUDE.md, which points here.

## §0 Bootstrap (read order — progressive disclosure)

1. Read this file once per session.
2. Read `catalog/TOKENS.md` once per session (token vocabulary — the ONLY tokens that exist).
3. Scan `catalog/INDEX.md` to find the component(s) you need.
4. Read ONLY the relevant `catalog/components/<code>.md` spec file(s) for the task at hand. **Every entry carries a `**Reference:**` line** — open that file and copy its structure and class names. It is the rendered, token-pure, spec-true implementation. If the line says `none yet`, no rendered implementation exists: compose from atoms (§2) and do not invent one. If it says **DERIVED — NOT design-reviewed · REFERENCE ONLY**, read §1b before using it.
5. If the consumer repo has a bindings file (e.g. `.ds/bindings.md`), read it to translate specs into that repo's components and utility classes.

Do NOT read the full catalog or all spec files up front. Load per need.

## §1 Grounding law

- The catalog is the source of truth. If a component, variant, token, or class is not in the catalog, it does not exist. Never invent tokens, class names, or variants.
- Specs win. When a consumer component and a spec disagree for NEW UI, follow the spec and record the discrepancy (see §4 bindings protocol).
- Token gap = hard stop. If a needed color/spacing/radius/type token does not exist, STOP and ask the design system author. Do not approximate with a hardcoded value.

## §1b Derived renderings — reference only

Some components have a rendering that was **built from the spec JSON and never reviewed against Figma**. They are marked in three places that all say the same thing: `Reference (DERIVED — NOT design-reviewed · REFERENCE ONLY)` in the catalog entry, `data-derived="true"` plus an amber banner on the gallery section, and **Part 3 of `reference/gallery.html`, which sits last and is collapsed by default**.

They are gate-clean — token-pure, on the type ramp, no duplicate ids, no overflow at either viewport — which makes them safe to *read*. It does not make them approved. Structure, tokens and typography come from the spec; **layout choices the spec does not state are guesses made by a script, not decisions made by the designer.**

So, when the reference you need is derived:

1. **Ground on the spec JSON first**, not on the rendering. The spec is reviewed; the rendering is not.
2. **Use the rendering only where it agrees with the spec** — the anatomy slots, the token names, the text styles. That part is derived *from* the spec and is safe to copy.
3. **Where the spec is silent, climb the ladder (§2) instead of copying.** A reviewed component that solves the same problem beats an unreviewed guess every time.
4. **Where the rendering and the spec disagree, the spec wins**, and the difference is reported to the design system author — the same way §4 handles bindings drift.
5. **Never describe UI built on a derived rendering as design-approved**, in a PR description, a commit message, or a reply. Say which parts came from a derived reference so a human can check them.

A rendering leaves this tier when a designer approves it: `data-derived="true"` is deleted, the banner and the caveat disappear at the next build, and it becomes an ordinary reference. Until then, treating it as visual truth is the exact failure this repository has recorded twice — see `HISTORY.md`.

## §2 Escalation ladder (reuse before build)

When you need UI, resolve in this order:
1. **Reuse** an existing component in the consumer repo (via bindings map, or by inspecting the repo).
2. **Follow the spec** in `catalog/components/<code>.md` and implement with the consumer's own primitives.
3. **Compose** from atoms + `reference/` implementations (plain HTML+CSS, token-pure) as the visual truth.
4. **New component with no spec** = STOP and ask. Never silently invent a new pattern.

A missing bindings entry never blocks work: inspect the repo directly, then write what you learned back into the bindings file (§4).

## §3 Token & style discipline

- No hardcoded hex colors, no magic px for anything a token covers. Use token classes / CSS vars (`var(--…)`) exactly as listed in the catalog.
- Text styles: use `.ts-<weight>-<role>-<size>` classes exactly as listed. They are global and never prefixed.
- **The type ramp is 11 / 12 / 14 / 16 / 18 / 22 px and nothing else exists.** `label-sm` 11 · `body-sm` 12 · `body-md` 14 (the default body size) · `body-lg` 16 · `title-md` 18 · `title-lg` 22. A size between two steps (13, 15, 20, 24) is not a judgement call, it is a bug — `visual-audit.py` fails on any rendered font-size off the ramp.
- **A component's size is spec data.** Each spec's `text-style` token decides its `ts-*` class; do not pick a smaller one because a specimen looks tight. `lint-typography.js` compares the two.
- **Box model: `border-box`, and form controls inherit typography.** The design system assumes what Tailwind preflight provides — `*, *::before, *::after { box-sizing: border-box }` and `button, input, select, textarea { font: inherit; color: inherit }`. A repo without a preflight-equivalent reset MUST add one, or every `width: 100%` element with padding will overflow its container by its own padding + border, and every unstyled `<button>` will render in 13.33px Arial.
- **Icons are Tabler.** Write icon classes as full literals (e.g. `i-tabler-user`), never string-concatenated, or the CSS scanner will miss them. Respect any utility prefix rule from the consumer repo profile. Tabler (asset-06/07) plus the Elabram custom set (asset-08) are the only icon sources for product UI — never substitute another library.
- **Typeface is Fustat** (body) and **DM Mono** (code), per `src/foundations.json`. Do not introduce another font. In `reference/`, a named font MUST have a matching `@font-face` in `reference/css/_fonts.css` — `lint-reference.js` fails otherwise, because a named-but-unloaded font invalidates every visual verdict (see `HISTORY.md` law #2).
- Never rebuild the app shell (sidebar/navbar/layout) unless explicitly asked.
- Fixed-vs-scroll contract: exactly ONE region scrolls in any layout. Never nest competing scroll containers.
- Visual verification is only valid against a live render whose build stamp matches the current build. A pixel probe beats any prior claim.

## §4 Bindings protocol (Self-Healing Map Law)

Consumer repos may carry a bindings file (COMPONENT-MAP + TOKEN-MAP) that translates specs to their local components/classes.
- **Self-healing:** if during any task you find a bindings entry that is stale, wrong, or missing — and you resolved the truth by inspecting the repo — you MUST update the bindings file in the same change set. The map is maintained as a side effect of normal work.
- The map is an accelerator, not a gatekeeper: when it is silent, climb the ladder (§2), then write the result back.
- driftNotes record where a consumer component deviates from spec, with the spec reference. Record drift; do not silently "fix" other people's components.

## §5 Interaction & composition standards (defaults for NEW UI)

**Three-tier reference** — `reference/gallery.html` has three parts:
- **Part 1 — Base components** is the default grounding tier. Use it for everyday tasks.
- **Part 2 — Composed samples** shows assembled screens. Consult it ONLY when the requirement needs an assembled screen or more detail than a single component — do not load it by default.
  - `#composed-01` list page: table always in a white card · `#composed-02` slide-in detail panel · `#composed-03` form section in a card · `#composed-04` empty state + confirmation modal · `#composed-05` data table exercising EVERY TableColumn and TableRow type in one screen.
  - `#composed-05` is the reference to copy for any non-trivial table: it is the only place all ten header types and all ten cell types appear together, in the geometry they actually ship with.
- **Part 3 — Derived, pending design review** is last and **collapsed by default**. Everything in it is `REFERENCE ONLY` — read §1b before you use one. Its section ids are still permanent anchors, so a catalog link into it always resolves.

**Defaults** (apply unless the requirement explicitly says otherwise):
- **Breadcrumb is opt-in.** Never render a breadcrumb by default — add one only when explicitly requested.
- **Tables always live inside a white card** (card head with title/toolbar + table + footer) — never bare on the page canvas.
- **Table paging:** default 10 rows per page (5–10 acceptable). More rows = pagination. Provide a rows-per-page control with presets (10/25/50) plus a free numeric input, hard-capped at 50.
- **Table footer order is count (left) · pagination (CENTRE) · rows-per-page (right).** Paging is the frequent action and owns the optical centre; rows-per-page is set once and belongs on the trailing edge. See `.es-pg--tablefoot`.
- **A destructive button declares its own foreground.** Use the `Danger` variant; never paint a red background onto a variant-less button, or the label stays at the inherited body colour — black on red.
- **Never hide an interactive control with `opacity` alone.** It stays clickable and tab-focusable while invisible. If a hover-reveal is wanted, the modifier must also set `pointer-events`, and keep a `:focus-within` escape.
- **Explicit-affordance law:** clicking a table row, card, or list item must never navigate or open a slide-in panel/modal by itself. Every open/navigate/destructive action needs its own explicit control (view icon, kebab menu item, button). This applies everywhere — tables, cards, lists.
- **Destructive actions** always go through a confirmation modal first.
- Slide-in detail panels open from the right, with fixed header/footer and exactly ONE scrolling body (see §3 scroll contract).

## Repo layout (this repository)

- `src/foundations.json` + `src/components/*.json` — EDITABLE source of truth (tokens + specs).
- `src/assets/` — shipped assets. `src/scripts/` — engine (build, split-catalog, lint-reference, doctor).
- `version.json` — the single source of the version number. `ds-meta.json` — maintainer contact, read live by the panel.
- `tools/` — the adoption panel: `dashboard/` sources → bundled by `build-wizard.js` into the single-file `ds-setup.cjs`. `ship.js` runs the whole release chain.
- `docs/ARCHITECTURE.md` — the full system map (layers, release chain, consumer file map, live numbers). Read this before changing anything structural.
- `dist/` — GENERATED (tailwind preset + CSS variables). Never hand-edit.
- `catalog/` — GENERATED AI grounding (INDEX + TOKENS + per-component specs). Never hand-edit.
- `reference/` — plain HTML+CSS reference implementations + `gallery.html` (open in a browser). Token-pure: CSS vars only, no hardcoded hex. Three tiers in gallery.html: Part 1 base components (default grounding) + Part 2 composed samples (assembled screens — consult per need, see §5) + Part 3 derived, collapsed by default and REFERENCE ONLY (see §1b).
- This folder is READ-ONLY inside consumer repos (git submodule, pinned commit). Authoring happens only in the design system repo itself.

## Versioning contract (author side)

- Semver. Renaming/removing a token or spec = MAJOR, with a deprecation alias kept for one minor cycle and a CHANGELOG entry.
- **`node tools/ship.js` must pass before any release.** It runs build · split-catalog · stamp-reference · lint-reference · validate-pages · build-wizard · contract-check, in that order, and stops at the first failure.
- `contract-check.js` fails the build if a token, text style, spec code or enum value is removed without a MAJOR bump AND a deprecation alias in `.release/deprecations.json`. The rule is mechanical, not a judgement call.
- Consumers pin a commit and upgrade explicitly (`git submodule update --remote`).
