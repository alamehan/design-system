## layout-10 — TableColumn  _(basic)_
Header cell pattern for DataTable columns. 11 types covering: title-only, sortable title, checkbox select-all, inline search, inline select, date picker, and the ReplaceMe slot. All share surface-strong background with border.
**Props:** type=OnlyTitle|TitleAndSort|WithSubtitle|OnlyCheckbox|TitleWithIcon1|TitleWithIcon2|FullSearch|FullSearchWithIcon|FullSelect|FullDatePicker|ReplaceMe (def OnlyTitle); label:string (def Column); width:number (def 160); isSorted:boolean (def false); sortDir=asc|desc|none (def none)
**Tokens:** system.surface-strong, system.border-soft, stroke.thin, spacing.standard.sm, text-styles.bold.body-md, system.text-head, brand.brand-surface-soft, brand.brand, corner-radius.md  — class per token: see Token vocabulary
**Spec:** `src/components/layout-10-table-column.json`
