## panel-02 — ActionPanel  _(panel-content)_
Panel body content for quick-action forms. Two states: Filled (form has data) and Unfilled (empty initial state). Contains stacked form inputs. Domain use: bulk actions, quick-edit, batch assignment on candidate records.
**Props:** type=Filled|Unfilled (def Unfilled); fields:array (def )
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#action-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-02-action-panel.json`
