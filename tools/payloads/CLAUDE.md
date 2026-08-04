# portal-nuxt — AI Instructions (thin profile)

**Bootstrap chain (read in this order):**
1. This file (repo profile + golden rules).
2. `design-system/CLAUDE.md` — universal design-system laws (§0–§5).
3. `design-system/catalog/INDEX.md` → only the `catalog/components/<code>.md` you need.
4. `.ds/bindings.md` — spec → THIS repo's components/classes. Trust it, and heal it (§4 Self-Healing Map Law).

## Repo profile

- Nuxt **2.15.8** / Vue **2.6.14**, **Options API only** (no Composition API, no `<script setup>`).
- Tailwind 3.4.16 with prefix **`tw-`** for ALL Tailwind utilities. Design-system global classes (`.ts-*`, `.title-*`, `.body-*`, `.label-*`, CSS vars `var(--…)`) are NEVER prefixed.
- Components auto-import: use tag names like `<GlobalsUiButton>` (from `components/globals/ui/button/index.vue`); never manual-import path strings.
- Heavy legacy stack coexists: Kendo UI Vue, Bootstrap 4/Metronic CSS, jQuery. Do NOT remove or rewrite them; scope your work.
- Scoped CSS: to style child-component internals use `::v-deep` (Vue 2 syntax).
- Icons are **Tabler** via `@egoist/tailwindcss-icons`: always full literal classes (`i-tabler-user`), never string-built. Tabler is the only icon set for product UI — never substitute another.
- Typeface is **Fustat** (body) and **DM Mono** (code), per `design-system/src/foundations.json`.

## Golden rules

1. **Reuse first:** existing `GlobalsUi*` primitives via `.ds/bindings.md`; the design system defines HOW they should look, this repo defines WITH WHAT they are built.
2. **No hardcoded hex / magic px.** Use the token utilities listed in the bindings TOKEN-MAP (Level 0) or preset classes (Level 1).
3. **Never rebuild the app shell** (sidebar/navbar/layout) unless explicitly asked.
4. **One scroll region per layout.** Never nest competing scroll containers.
5. `design-system/` is a READ-ONLY pinned submodule. Never edit files inside it from this repo.
6. When the bindings map is wrong/stale/missing an entry you resolved by inspecting the repo, update `.ds/bindings.md` in the same change set.
7. Health check anytime: `node design-system/src/scripts/doctor.js` (read-only).

## UI defaults (always apply to NEW UI)

- No breadcrumb by default — add one only when the requirement explicitly asks for it.
- Tables ALWAYS live inside a white card (card head with title/toolbar + table + footer) — never bare on the page.
- Default 10 rows per page (5–10 ok); more = pagination; provide a rows-per-page control (presets 10/25/50 + custom numeric input, hard max 50).
- Clicking a row/card/list item never navigates or opens a panel — every open/navigate/destructive action needs its own explicit control (view icon, kebab menu, button). Destructive actions always confirm via modal first.
- The reference gallery has two tiers: ground on Part 1 (base components) by default; consult Part 2 (composed samples) ONLY when the task needs an assembled screen (list page, detail panel, form section, empty/confirm states).

## Git housekeeping

The panel also maintains marked blocks in `.gitignore` and `.gitattributes`. `.ds/` is **not** ignored wholesale: `manifest.json`, `bindings.md`, `history.jsonl` and `requests/` are committed on purpose — the first is the install receipt, the second is shared team knowledge you and every agent depend on. Only machine-local recovery state is ignored.

## About this section

Everything between the `design-system:begin` / `design-system:end` markers above is written and maintained by the Design System panel. Edit outside the markers freely — your content is never touched. To remove it, run the panel and choose Uninstall; only the marked block is stripped.
