## panel-08 — ConsentInfoPanel  _(panel-content)_
Panel body content showing consent status and history. 21 variants combining: consent method (ShareLink/ManualUpload/SendEmail) × status (Accepted/Pending/Declined) × tab (Details/Events/ProofOfConsent). Shows consent timeline, status details, and proof documentation.
**Props:** method=ShareLink|ManualUpload|SendEmail (def SendEmail); status=Accepted|Pending|Declined (def Pending); tab=Details|Events|ProofOfConsent (def Details)
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#consent-info-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-08-consent-info-panel.json`
