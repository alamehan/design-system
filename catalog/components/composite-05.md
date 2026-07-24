## composite-05 — FileUpload  _(advanced)_
File upload area for 5 document types: CV, Photo, Document, Sheet, Archive. Each type has Default (empty dropzone) and Uploaded (showing preview + file info) states. Dropzone uses brand.brand dashed border; uploaded preview uses surface-strong background.
**Props:** fileType=CV|Photo|Document|Sheet|Archive (def CV); state=Default|Uploaded (def Default); fileName:string (def null); fileSize:string (def null); isRequired:boolean (def false); maxSizeMB:number (def 5); acceptedFormats:array (def .pdf,.doc,.docx)
**Tokens:** neutral.pure-white, brand.brand, stroke.thin, corner-radius.md, spacing.standard.3xl, spacing.standard.xxl, system.surface-strong, spacing.standard.lg, shadow.Base, system.border-soft, spacing.standard.sm  — class per token: see Token vocabulary
**Spec:** `src/components/composite-05-file-upload.json`
