## panel-04 — ResumeTemplatePanel  _(panel-content)_
Panel body content for browsing and selecting resume templates. Three variants: PublicTemplate (community templates), MyTemplate (user's own), PrebuiltTemplate (system defaults). Contains a ResumeCard grid and action buttons.
**Props:** type=PublicTemplate|MyTemplate|PrebuiltTemplate (def PrebuiltTemplate); templates:array (def )
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#resume-template-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-04-resume-template-panel.json`
