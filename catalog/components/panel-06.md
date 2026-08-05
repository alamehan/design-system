## panel-06 — ConsentRequestPanel  _(panel-content)_
Panel body content for sending consent requests. 4 variants: ManualConsent (checkbox acknowledgment + textarea), SendEmail (email form + attachment), RequestConsent1 and RequestConsent2 (different consent request flows). Contains form inputs, file upload, and consent controls.
**Props:** type=ManualConsent|SendEmail|RequestConsent1|RequestConsent2 (def ManualConsent); candidateName:string (def null)
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#consent-request-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-06-consent-request-panel.json`
