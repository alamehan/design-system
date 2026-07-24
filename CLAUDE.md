# E-Systems Design System — AI Instructions (Universal)

These are the universal laws for any AI working with this design system, in any consumer repo.
This file never references a specific consumer project. Repo-specific profile + execution rules live in the consumer repo's own CLAUDE.md, which points here.

## §0 Bootstrap (read order — progressive disclosure)

1. Read this file once per session.
2. Read `catalog/TOKENS.md` once per session (token vocabulary — the ONLY tokens that exist).
3. Scan `catalog/INDEX.md` to find the component(s) you need.
4. Read ONLY the relevant `catalog/components/<code>.md` spec file(s) for the task at hand.
5. If the consumer repo has a bindings file (e.g. `.ds/bindings.md`), read it to translate specs into that repo's components and utility classes.

Do NOT read the full catalog or all spec files up front. Load per need.

## §1 Grounding law

- The catalog is the source of truth. If a component, variant, token, or class is not in the catalog, it does not exist. Never invent tokens, class names, or variants.
- Specs win. When a consumer component and a spec disagree for NEW UI, follow the spec and record the discrepancy (see §4 bindings protocol).
- Token gap = hard stop. If a needed color/spacing/radius/type token does not exist, STOP and ask the design system author. Do not approximate with a hardcoded value.

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
- Icons (Tabler): write icon classes as full literals (e.g. `i-tabler-user`), never string-concatenated, or the CSS scanner will miss them. Respect any utility prefix rule from the consumer repo profile.
- Never rebuild the app shell (sidebar/navbar/layout) unless explicitly asked.
- Fixed-vs-scroll contract: exactly ONE region scrolls in any layout. Never nest competing scroll containers.
- Visual verification is only valid against a live render whose build stamp matches the current build. A pixel probe beats any prior claim.

## §4 Bindings protocol (Self-Healing Map Law)

Consumer repos may carry a bindings file (COMPONENT-MAP + TOKEN-MAP) that translates specs to their local components/classes.
- **Self-healing:** if during any task you find a bindings entry that is stale, wrong, or missing — and you resolved the truth by inspecting the repo — you MUST update the bindings file in the same change set. The map is maintained as a side effect of normal work.
- The map is an accelerator, not a gatekeeper: when it is silent, climb the ladder (§2), then write the result back.
- driftNotes record where a consumer component deviates from spec, with the spec reference. Record drift; do not silently "fix" other people's components.

## §5 Interaction & composition standards (defaults for NEW UI)

**Two-tier reference** — `reference/gallery.html` has two parts:
- **Part 1 — Base components** is the default grounding tier. Use it for everyday tasks.
- **Part 2 — Composed samples** shows assembled screens (list page with table-in-card, slide-in detail panel, form section, empty/confirm states). Consult it ONLY when the requirement needs an assembled screen or more detail than a single component — do not load it by default.

**Defaults** (apply unless the requirement explicitly says otherwise):
- **Breadcrumb is opt-in.** Never render a breadcrumb by default — add one only when explicitly requested.
- **Tables always live inside a white card** (card head with title/toolbar + table + footer) — never bare on the page canvas.
- **Table paging:** default 10 rows per page (5–10 acceptable). More rows = pagination. Provide a rows-per-page control with presets (10/25/50) plus a free numeric input, hard-capped at 50.
- **Explicit-affordance law:** clicking a table row, card, or list item must never navigate or open a slide-in panel/modal by itself. Every open/navigate/destructive action needs its own explicit control (view icon, kebab menu item, button). This applies everywhere — tables, cards, lists.
- **Destructive actions** always go through a confirmation modal first.
- Slide-in detail panels open from the right, with fixed header/footer and exactly ONE scrolling body (see §3 scroll contract).

## Repo layout (this repository)

- `src/foundations.json` + `src/components/*.json` — EDITABLE source of truth (tokens + specs).
- `src/assets/` — shipped assets. `src/scripts/` — engine (build, split-catalog, lint-reference, doctor).
- `dist/` — GENERATED (tailwind preset + CSS variables). Never hand-edit.
- `catalog/` — GENERATED AI grounding (INDEX + TOKENS + per-component specs). Never hand-edit.
- `reference/` — plain HTML+CSS reference implementations + `gallery.html` (open in a browser). Token-pure: CSS vars only, no hardcoded hex. Two tiers in gallery.html: Part 1 base components (default grounding) + Part 2 composed samples (assembled screens — consult per need, see §5).
- This folder is READ-ONLY inside consumer repos (git submodule, pinned commit). Authoring happens only in the design system repo itself.

## Versioning contract (author side)

- Semver. Renaming/removing a token or spec = MAJOR, with a deprecation alias kept for one minor cycle and a CHANGELOG entry.
- `node src/scripts/build.js` must pass before any release (validates every token ref and asset name).
- Consumers pin a commit and upgrade explicitly (`git submodule update --remote`).
