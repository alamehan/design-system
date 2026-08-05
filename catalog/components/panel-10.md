## panel-10 — FileInfoPanel  _(panel-content)_
Panel body content for file management actions. 3 variants: FileHistory (shows version history), EditTag (tag editor for a file), LinkTo (links a file to a job/candidate). Each shows relevant file info and action controls.
**Props:** type=FileHistoryWithData|EditTagWithData|LinkToWithData (def FileHistoryWithData); fileId:string (def null)
**Tokens:** spacing.standard.lg  — class per token: see Token vocabulary
**Reference (DERIVED — pending design review):** `reference/gallery.html#file-info-panel`  — built from this spec’s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. Safe to build on; expect the designer to adjust layout details.
**Spec:** `src/components/panel-10-file-info-panel.json`
