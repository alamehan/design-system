# Source assets

Drop exported asset files here. On **Ship to Devs**, everything in this folder is copied into the
dev package at `design-system/assets/…` (only `.gitkeep` files are skipped).

**Golden rule:** the file name (without extension) MUST equal the variant name in the matching
`asset-*` spec / `catalog.md`. The build **audits this** — an unknown name fails the build.

| Folder | Catalog spec | Contents | Example file |
|--------|--------------|----------|--------------|
| `avatars/` | asset-01 Avatar | avatar illustrations (41 variants defined) | `ava-placeholder-user.svg`, `ava-man-1.svg` |
| `option-menus/` | asset-02 OptionMenu | 24 HR-action illustration icons | `compose-email.svg`, `claim.svg`, `payroll.svg` |
| `characters/` | asset-03 CharacterExpression | 40 mascot expressions | `think-1.svg`, `success-2.svg` |
| `icons-custom/` | asset-08 Icon (Custom) | Elabram custom SVG icons (default + `-active`) | `dashboard.svg`, `dashboard-active.svg`, `flag-id.svg` |

**Not shipped as files (by design):**
- `asset-06` / `asset-07` **Tabler icons** render from `@iconify-json/tabler` as `i-tabler-<name>` classes — no files needed. Prepend your repo's Tailwind prefix if it has one (e.g. `tw-i-tabler-<name>`).
- `asset-04` / `asset-05` **illustrations** and `asset-09` **logos** are not currently exported. If needed later, add an `illustrations/` or `logos/` folder here (names must match the spec variants) and re-ship.

**Coverage today:** avatars 1/41 (placeholder only) · option-menus 24/24 ✅ · characters 40/40 ✅ · icons-custom 35/94 (the subset in use). Partial coverage is fine — only *wrong names* fail the build.

Keep names kebab-case and stable — renaming a file is a breaking change for anything that references it.

The build also writes a **Files:** coverage line into `catalog/catalog.md` for every asset set (shipped vs catalog-only), so the AI never references a file that does not exist.
