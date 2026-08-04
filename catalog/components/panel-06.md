## panel-06 — ConsentRequestPanel  _(panel-content)_
Panel body content for sending consent requests. 4 variants: ManualConsent (checkbox acknowledgment + textarea), SendEmail (email form + attachment), RequestConsent1 and RequestConsent2 (different consent request flows). Contains form inputs, file upload, and consent controls.
**Props:** type=ManualConsent|SendEmail|RequestConsent1|RequestConsent2 (def ManualConsent); candidateName:string (def null)
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference:** none yet — no rendered implementation exists for this spec. Compose from atoms (CLAUDE.md §2) and do NOT invent one.
**Spec:** `src/components/panel-06-consent-request-panel.json`
