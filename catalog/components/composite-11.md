## composite-11 — NotificationCard  _(advanced)_
Individual notification row in the NotificationList. Three states: Default (white), Hover1 (header highlighted), Hover2 (detail highlighted). Each row has a summary header and an expandable detail section.
**Props:** state=Default|Hover1|Hover2 (def Default); isRead:boolean (def false); isExpanded:boolean (def false)
**Tokens:** system.border-soft, stroke.thin, spacing.standard.sm, spacing.standard.lg, spacing.standard.md, neutral.pure-white, system.surface-medium  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#notification-card`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/composite-11-notification-card.json`
