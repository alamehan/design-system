## layout-01 — AppBar  _(basic)_
Top navigation bar. Fixed at the top of every page. Contains the logo, navigation menu items, user avatar, and notification icon. Two variants: DefaultUser (logged-in user's own session) and OtherUser (viewing as another user).
**Props:** type=DefaultUser|OtherUser (def DefaultUser)
**Tokens:** neutral.pure-white, system.border-soft, stroke.thin, spacing.standard.lg, spacing.standard.md  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#app-bar`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/layout-01-app-bar.json`
