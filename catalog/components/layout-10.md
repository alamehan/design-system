## layout-10 — TableColumn  _(basic)_
Header cell pattern for DataTable columns. 11 types covering: title-only, sortable title, checkbox select-all, inline search, inline select, date picker, and the ReplaceMe slot. All share surface-strong background with border.
**Props:** type=OnlyTitle|TitleAndSort|WithSubtitle|OnlyCheckbox|TitleWithIcon1|TitleWithIcon2|FullSearch|FullSearchWithIcon|FullSelect|FullDatePicker|ReplaceMe (def OnlyTitle); label:string (def Column); width:number (def 160); isSorted:boolean (def false); sortDir=asc|desc|none (def none)
**Tokens:** spacing.standard.sm, spacing.standard.md, system.surface-strong, system.border-soft, stroke.thin, text-styles.bold.body-md, system.text-head, brand.brand-surface-soft, brand.brand, corner-radius.md  — class per token: see Token vocabulary
**Reference:** `reference/components/table-column.html` · `reference/gallery.html#table-column` · `reference/pages/table-column.html`  — copy the structure and class names from here; it is token-pure and spec-true.
**Spec:** `src/components/layout-10-table-column.json`
