## layout-07 — Modal  _(basic)_
Full-screen overlay dialog for critical actions and confirmations. Two types: System (body has surface-strong background with white card inside) and Browser (body is plain white — used for document/file content).
**Props:** type=DefaultSystem|ExampleSystem|DefaultBrowser|ExampleBrowser (def DefaultSystem); title:string (def Modal Title); isOpen:boolean (def false); size=sm|md|lg|fullscreen (def md); hasBackdrop:boolean (def true)
**Tokens:** corner-radius.none, shadow.2XL, neutral.pure-white, system.border-soft, stroke.thin, spacing.standard.xl, spacing.standard.xxl, spacing.standard.sm, text-styles.bold.title-md, system.text-head, system.surface-strong, spacing.standard.lg, corner-radius.md  — class per token: see Token vocabulary
**Reference:** `reference/components/modal.html` · `reference/gallery.html#modal`  — copy the structure and class names from here; it is token-pure and spec-true.
**Spec:** `src/components/layout-07-modal.json`
