## panel-03 — CandidateDetailsPanel  _(panel-content)_
The main candidate detail panel body. 8 variants covering the candidate tabs: Profile, Interview, Comment, and History sub-tabs (MH/CA/CH/LA/JA). Each variant shows a different view of the candidate's data using CandidateInfoBlock, Timeline entries, and note/comment sections.
**Props:** type=Profile|Interview|Comment|HistoryMH|HistoryCA|HistoryCH|HistoryLA|HistoryJA (def Profile); candidateId:string (def null)
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#candidate-details-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-03-candidate-details-panel.json`
