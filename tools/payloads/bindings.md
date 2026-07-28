# .ds/bindings.md — Spec ↔ Execution map (portal-nuxt)

ds-version: 3.3.0 · map-updated: 2026-07-28 · adoption-level: 0 (reference-only)

**What this is:** the translation layer between design-system specs (`design-system/catalog/`) and THIS repo's real components and utility classes. AI must use this map when building UI here.

**Self-Healing Map Law (design-system CLAUDE.md §4):** if any entry below is stale, wrong, or missing and you resolved the truth by inspecting the repo — update this file in the same change set. `doctor.js` verifies all component paths and color names below.

**Status legend:** `ok` mapped · `drift` partial (usable, deviates from spec) · `gap` compose from `design-system/reference/`

---

## COMPONENT-MAP

| DS spec | Use in this repo | File | Status |
|---|---|---|---|
| atom-01 Button | `<GlobalsUiButton>` | `components/globals/ui/button/index.vue` | ok |
| atom-02 IconButton | `<GlobalsUiButton :onlyIcon="true">` | `components/globals/ui/button/index.vue` | drift |
| atom-03 SplitButton | — | — | gap compose: `reference/components/split-button.html` |
| atom-04 CustomButton | `<GlobalsUiButton btnType="cancelGray">` (nearest) | `components/globals/ui/button/index.vue` | drift |
| atom-05 Chip | — | — | gap compose: `reference/components/chip.html` |
| atom-06 StatusChip | `<GlobalsUiChipStatus>` | `components/globals/ui/chipStatus.vue` | ok |
| atom-07 Toast | SweetAlert2 wrapper (legacy) | app plugin | drift visual drift vs spec; new toasts: follow `reference/components/toast.html` styles |
| atom-08 Input (text) | `<GlobalsUiInputText>` | `components/globals/ui/input/text.vue` | ok |
| atom-08 Input (date) | `<GlobalsUiInputDatePicker>` (Kendo) | `components/globals/ui/input/datePicker.vue` | drift Kendo-rendered |
| atom-08 Input (select) | `<GlobalsUiInputDropdownKendo>` | `components/globals/ui/input/dropdownKendo.vue` | drift Kendo-rendered |
| atom-08 Input (numeric) | `<GlobalsUiInputNumericKendo>` | `components/globals/ui/input/numericKendo.vue` | drift Kendo-rendered |
| atom-09 Textarea | `<GlobalsUiInputTextArea>` | `components/globals/ui/input/textArea.vue` | ok |
| atom-10 RichTextEditor | `<GlobalsUiInputTinyEditor>` (TinyMCE) | `components/globals/ui/input/tinyEditor.vue` | drift |
| atom-12 Checkbox | `<GlobalsUiInputCheckboxKendo>` | `components/globals/ui/input/checkboxKendo.vue` | drift Kendo-rendered |
| atom-12 Radio | `<GlobalsUiInputRadioKendo>` | `components/globals/ui/input/radioKendo.vue` | drift Kendo-rendered |
| atom-12 Switch | `<GlobalsUiInputSwitchKendo>` | `components/globals/ui/input/switchKendo.vue` | drift Kendo-rendered |
| atom-16 Tabs | — | — | gap compose: `reference/components/tabs.html` |
| Avatar (asset-01 usage) | — | — | gap compose: `reference/components/avatar.html` |
| Breadcrumb | — | — | gap compose: `reference/components/breadcrumb.html` |
| Modal (confirmation) | `<GlobalsUiModalConfirmation>` | `components/globals/ui/modal/confirmation.vue` | ok |
| Slide panel | `<GlobalsUiSlidePanel>` | `components/globals/ui/slidePanel.vue` | ok |
| Dropdown menu | `<GlobalsUiDropdown>` | `components/globals/ui/dropdown.vue` | ok |
| Tooltip | `<GlobalsUiTooltip>` | `components/globals/ui/tooltip.vue` | ok |
| Empty state | `<GlobalsUiEmptyState>` | `components/globals/ui/emptyState.vue` | ok |
| Field error text | `<GlobalsUiErrorText>` | `components/globals/ui/errorText.vue` | ok |
| Info callout | `<GlobalsUiWarningInfo>` | `components/globals/ui/warningInfo.vue` | drift |
| Data table + pagination | Kendo Grid (legacy pattern) | per-domain components | drift heavy drift; for NEW simple tables follow `reference/components/data-table.html` |

### Variant translation — atom-01 Button → `<GlobalsUiButton btnType>`

| DS variant | btnType | Note |
|---|---|---|
| Filled | `filled` | default |
| Outlined | `outlined` | |
| Tonal | `tonal` | |
| Elevated | `elevated` | |
| Ghost | `ghost` | |
| — (no spec) | `error`, `errorOutlined`, `cancelGray`, `outlineBlack`, `errorSurfaceSoft`, `filledWarning`, `filledSuccess` | driftNote: frontend extensions beyond spec — allowed for existing flows; for NEW UI prefer the five spec variants |

Key props: `text`, `textSize`, `textWeight`, `btnWidth`, `btnHeight`, `btnPaddingY/X`, `iconLeft`, `iconRight`, `onlyIcon`, `isLoad`, `disabled`.

### Variant translation — atom-06 StatusChip → `<GlobalsUiChipStatus statusType>`

| DS type | statusType |
|---|---|
| Default | `MD-1-Default` |
| Success | `MD-1-Success` |
| Warning | `MD-1-Warning` |
| Error | `MD-1-Error` |
| Black | `MD-1-Black` |
| Brand | `MD-1-Brand` (small: `SM-1-Brand`; borderless: `brand-noborder`) |
| Sem-Indigo / Sem-Teal / Sem-Lime / Sem-Yellow | `MD-1-SemIndigo` / `MD-1-SemTeal` / `MD-1-SemLime` / `MD-1-SemYellow` |

driftNote: DS `Info` type has no statusType counterpart yet → gap; use `MD-1-Default` or extend `chipStatus.vue`.

---

## TOKEN-MAP (Level 0 — legacy frozen classes)

At Level 0 the DS preset is NOT wired; use the repo's existing camelCase color utilities. Values are identical hex to DS tokens (verified 2026-07-15). At Level 1+ prefer preset kebab classes (e.g. `tw-bg-brand-brand`).

| DS token | Utility here (prefix `tw-`) |
|---|---|
| brand.brand | `tw-bg-brand` / `tw-text-brand` / `tw-border-brand` |
| brand.brand-strong | `…-brandStrong` |
| brand.brand-surface-soft | `…-brandSurfaceSoft` |
| elabram.blue / orange | `…-elabramBlue` / `…-elabramOrange` |
| semantic.success / warning / error / info | `…-success` / `…-warning` / `…-error` / `…-info` (+ `Strong`, `SurfaceSoft`, `SurfaceStrong` suffixes) |
| semantic.sem-teal / sem-lime / sem-indigo / sem-yellow | `…-semTeal` / `…-semLime` / `…-semIndigo` / `…-semYellow` families |
| system.text-head / text-body / text-muted | `tw-text-textHead` / `tw-text-textBody` / `tw-text-textMuted` |
| system.surface-soft / -medium / -strong | `…-surfaceSoft` / `…-surfaceMedium` / `…-surfaceStrong` |
| system.border-soft / -medium / -strong | `tw-border-borderSoft` / `…-borderMedium` / `…-borderStrong` |
| pure.white / black / gray / muted | `…-pureWhite` / `…-pureBlack` / `…-pureGray` / `…-pureMuted` |
| gradient.text-gradient(-brand) | `tw-bg-text-gradient` / `tw-bg-text-gradient-brand` |

**Text styles:** DS `.ts-<weight>-<role>-<size>` → here use the UNPREFIXED global classes `.title-lg` `.title-md` `.body-xl` `.body-lg` `.body-md` `.body-sm` `.label-sm` (defined in `assets/css/tailwind.css`) + `tw-font-medium|semibold|bold` for weight. Example: `.ts-bold-body-md` → `class="body-md tw-font-bold"`.

**Radius:** identical scale — `tw-rounded-sm|DEFAULT|md|lg|xl|2xl|3xl|full` (2/4/6/8/12/16/24/9999px) matches DS radius tokens.

**Spacing:** repo uses a 4px numeric grid (`tw-p-2` = 8px). DS named steps map to the nearest grid value; if a DS spec demands an off-grid value (e.g. 10px), use arbitrary value `tw-p-[10px]` — allowed ONLY when the spec explicitly states that pixel value.

driftNote: no dark mode at Level 0 (colors are frozen hex; `darkMode` not configured). Expected — resolved by Level 1.

---

## GAPS (compose from reference, then record here)

`chip`, `split-button`, `tabs`, `avatar`, `breadcrumb`, `pagination` (non-Kendo), `candidate-card`, `filter-field`, `filter-panel`, `candidate-info-block`, `panel-section`, `custom-button`, `toast` (spec-conformant). For each: read `design-system/catalog/components/<code>.md` + copy structure/classes from `design-system/reference/components/<name>.html` (token-pure CSS in `reference/css/<name>.css`), adapt to Vue 2 + `tw-` prefix rules, then add the new component to the COMPONENT-MAP above.

---

## About this file

This file is yours to evolve. The Self-Healing Map Law (`design-system/CLAUDE.md` §4) asks you — and any AI agent working here — to correct it whenever reality disagrees with it. The Design System panel therefore treats changes here as expected, not as damage: it will offer to send your version to the design system maintainer so useful corrections land in the shipped template.
