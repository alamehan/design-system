# Catalog INDEX — E-Systems Design System

**How to use (progressive disclosure):** scan this index to find the component you need, then read ONLY `catalog/components/<code>.md` for its full spec (tokens, variants, states, exact classes). Read `catalog/TOKENS.md` once per session for the token vocabulary. Never guess a token or class that is not in these files.

## asset (9)

- **asset-01** Avatar _(foundation)_ — User profile picture asset. 41 variants: 20 male personas (ava-man-1 to ava-man-20), 20 female personas (ava-woman-1 to ava-woman-20), an… → `components/asset-01.md`
- **asset-02** OptionMenu _(foundation)_ — Action illustration icons for the DropdownMenu(OptionMenus) and ContentBlock(OptionMenus) layouts. 24 variants covering HR workflow actio… → `components/asset-02.md`
- **asset-03** CharacterExpression _(foundation)_ — Mascot character illustrations expressing emotions. 40 variants across 14 emotion categories. Used in empty states, loading screens, conf… → `components/asset-03.md`
- **asset-04** AnimatedIllustration _(foundation)_ — GIF animation illustrations for loading states, redirects, and process feedback. 14 variants for specific app states. Each is a 96×96px a… → `components/asset-04.md`
- **asset-05** ComplexIllustration _(foundation)_ — Larger full-scene illustration assets. 2 variants: document-preview (used in document viewer contexts) and privacy-policy (used on privac… → `components/asset-05.md`
- **asset-06** Icon (Tabler) _(foundation)_ — Primary icon library. 272 Tabler icons at 24×24px. Stroke-based vectors — color is set by the parent element's fill/color, not the icon i… → `components/asset-06.md`
- **asset-07** Icon (Tabler Extended) _(foundation)_ — Extended Tabler icon set. 100 additional icons not in the primary set. Same 24×24px format and stroke-based rendering as Icon(Tabler). Bo… → `components/asset-07.md`
- **asset-08** Icon (Custom) _(foundation)_ — Custom-designed icons specific to Elabram. 94 variants across 7 groups: navigation icons (default + active states), system status icons, … → `components/asset-08.md`
- **asset-09** Logo _(foundation)_ — Client/company logo placeholder set. 10 variants (logo-1 to logo-10) representing different client organizations. 64×64px vector logo pla… → `components/asset-09.md`

## atom (16)

- **atom-01** Button _(atomic)_ — Primary interactive element for triggering actions. Supports five visual styles and three states. → `components/atom-01.md`
- **atom-02** IconButton _(atomic)_ — Square button that contains only an icon. Same styles as Button but no label. → `components/atom-02.md`
- **atom-03** SplitButton _(atomic)_ — Two-part button: primary action (left) + dropdown trigger (right). 2px gap between parts. → `components/atom-03.md`
- **atom-04** CustomButton _(atomic)_ — Neutral low-emphasis button for navigation and breadcrumb. No brand color — uses system surface. Turns muted gray on hover. → `components/atom-04.md`
- **atom-05** Chip _(atomic)_ — Compact label for tags, filters, selections. Three styles (Neutral/Colored/Gradient), three sizes (MD/SM/CC). Full-radius pill. → `components/atom-05.md`
- **atom-06** StatusChip _(atomic)_ — Read-only status indicator. Semantic color presets per status. Not interactive. → `components/atom-06.md`
- **atom-07** Toast _(atomic)_ — Transient notification overlay. Semantic status types × three visual styles. Auto-dismisses. → `components/atom-07.md`
- **atom-08** Input _(atomic)_ — General-purpose single-line text input. Covers Basic, Search, Password, Number, DatePicker, Dropdown. Single and Multi value modes. → `components/atom-08.md`
- **atom-09** Textarea _(atomic)_ — Multi-line text input. Same state tokens as Input. Built on FormInputField. → `components/atom-09.md`
- **atom-10** RichTextEditor _(atomic)_ — WYSIWYG editor with formatting toolbar. For email composition, cover letters, and formatted long-form content. → `components/atom-10.md`
- **atom-11** FormInputField _(atomic)_ — Reusable field shell used inside Input, Textarea, RichTextEditor. Handles background, border, radius, padding for Single and Multi layouts. → `components/atom-11.md`
- **atom-12** FormControl _(atomic)_ — Selection controls: Checkbox, Radio, Switch. Each has Enabled/Disabled states and Selected/Unselected/Indeterminate values. → `components/atom-12.md`
- **atom-13** RangeSlider _(atomic)_ — Dual-handle range input for selecting a min–max numeric range. → `components/atom-13.md`
- **atom-14** Breadcrumb _(atomic)_ — Horizontal navigation trail from root to current page. Built by composing CustomButton items separated by chevron separators. → `components/atom-14.md`
- **atom-15** DropdownMenu _(atomic)_ — Floating menu panel triggered by button or right-click. Five layout types. → `components/atom-15.md`
- **atom-16** Tabs _(atomic)_ — Horizontal tab navigation. Two styles: Basic (pill in container) and Underline (borderless with bottom indicator). Text-only, icon-only, … → `components/atom-16.md`

## layout (11)

- **layout-01** AppBar _(basic)_ — Top navigation bar. Fixed at the top of every page. Contains the logo, navigation menu items, user avatar, and notification icon. Two var… → `components/layout-01.md`
- **layout-02** Sidebar _(basic)_ — Vertical navigation rail on the left side. Default state shows icon-only menu items. Hover state expands to show icon + label. Uses dark … → `components/layout-02.md`
- **layout-03** Pagination _(basic)_ — Page navigation bar for paginated data. Default shows row count, page buttons, and items-per-page selector. Compact shows only count and … → `components/layout-03.md`
- **layout-04** ScrollBar _(basic)_ — Custom scrollbar overlay for scrollable containers. Vertical and horizontal variants. Track uses system border color; thumb uses white wi… → `components/layout-04.md`
- **layout-05** Panel _(basic)_ — Slide-in side panel that displays detailed content alongside the main view. Two layout types: SingleCard (one full-width content card) an… → `components/layout-05.md`
- **layout-06** PanelSection _(basic)_ — Individual section zones of a Panel or DataTable: header, sub-header, footer, document viewer header, video player bar, text editor bar. … → `components/layout-06.md`
- **layout-07** Modal _(basic)_ — Full-screen overlay dialog for critical actions and confirmations. Two types: System (body has surface-strong background with white card … → `components/layout-07.md`
- **layout-08** ModalContent _(basic)_ — Content slot patterns for the Modal body. Five types cover: Default (text + illustration), Form (inputs + controls + table), ListCard (se… → `components/layout-08.md`
- **layout-09** DataTable _(basic)_ — Full data table composed of TableColumn headers, TableRow rows, ScrollBar for horizontal scroll, and Pagination footer. ReplaceMe variant… → `components/layout-09.md`
- **layout-10** TableColumn _(basic)_ — Header cell pattern for DataTable columns. 11 types covering: title-only, sortable title, checkbox select-all, inline search, inline sele… → `components/layout-10.md`
- **layout-11** TableRow _(basic)_ — Data row cell pattern for DataTable. 17 types covering: text, links, multi-text, chips, status chips, action buttons, checkboxes, photos,… → `components/layout-11.md`

## composite (16)

- **composite-01** InfoBlock _(advanced)_ — Flexible data display unit. 10 types covering: section titles, icon+body text, icon+body+action, multi-value rich content, label+small bo… → `components/composite-01.md`
- **composite-02** ContentBlock _(advanced)_ — Surface-soft row block pattern for filter panels and lists. 8 types: menu with arrow, accordion (open/closed), option menus with avatar, … → `components/composite-02.md`
- **composite-03** QuickSuggest _(advanced)_ — Horizontal row of pre-defined suggestion chips shown below a filter field input. Lets users quickly select common filter values without t… → `components/composite-03.md`
- **composite-04** FilterField _(advanced)_ — Individual filter row inside FilterPanel. 5 types: General (text/dropdown input + checkbox list + suggestions), Date (date picker variant… → `components/composite-04.md`
- **composite-05** FileUpload _(advanced)_ — File upload area for 5 document types: CV, Photo, Document, Sheet, Archive. Each type has Default (empty dropzone) and Uploaded (showing … → `components/composite-05.md`
- **composite-06** CandidateInfoBlock _(advanced)_ — Data display block for candidate profile fields inside a Panel. 5 types: SingleValue (label + one value + action icon), MultiValue (label… → `components/composite-06.md`
- **composite-07** FilterPanel _(advanced)_ — Complete vertical filter drawer composing multiple FilterField rows. Has a sticky header (search/title), a scrollable body of FilterField… → `components/composite-07.md`
- **composite-08** CandidateCard _(advanced)_ — Candidate summary card for list views. Shows avatar, name, headline, key info rows (location, salary, experience), status chips, and acti… → `components/composite-08.md`
- **composite-09** ResumeCard _(advanced)_ — Resume template selection card. Shows a visual preview thumbnail, template name, and owner. Hover state reveals action buttons (preview, … → `components/composite-09.md`
- **composite-10** ConsentToast _(advanced)_ — Domain-specific toast for data consent notifications. Three copywriting variants with different messaging. Copywriting 1 & 2 use Warning … → `components/composite-10.md`
- **composite-11** NotificationCard _(advanced)_ — Individual notification row in the NotificationList. Three states: Default (white), Hover1 (header highlighted), Hover2 (detail highlight… → `components/composite-11.md`
- **composite-12** NotificationList _(advanced)_ — Complete notification feed panel. Sticky header with title and mark-all-read action. Scrollable list of NotificationCard rows. → `components/composite-12.md`
- **composite-13** DocumentGallery _(advanced)_ — Multi-page document preview gallery. Shows all pages of a resume/document as a vertical stack of white page cards. Four template styles: … → `components/composite-13.md`
- **composite-14** EmbedViewer _(advanced)_ — Dark-theme embedded viewer for VideoPlayer and DocumentViewer. Uses the component.embed-* token set (dark gray UI). Includes a top contro… → `components/composite-14.md`
- **composite-15** WhatsAppChat _(advanced)_ — WhatsApp-style chat interface for consent communication. Three variants: Default (generic chat), ConsentRecruiterPOV (recruiter sending c… → `components/composite-15.md`
- **composite-16** InteractiveFlow _(advanced)_ — Multi-step interactive overlay flows for complex operations. 26 variants covering: AI Generate Text (6 steps), Consent Share Link (4 step… → `components/composite-16.md`

## panel (12)

- **panel-01** FilterBlockPanel _(panel-content)_ — Panel body content for the filter block panel. Contains a search input at the top, followed by filter category sections. Slots directly i… → `components/panel-01.md`
- **panel-02** ActionPanel _(panel-content)_ — Panel body content for quick-action forms. Two states: Filled (form has data) and Unfilled (empty initial state). Contains stacked form i… → `components/panel-02.md`
- **panel-03** CandidateDetailsPanel _(panel-content)_ — The main candidate detail panel body. 8 variants covering the candidate tabs: Profile, Interview, Comment, and History sub-tabs (MH/CA/CH… → `components/panel-03.md`
- **panel-04** ResumeTemplatePanel _(panel-content)_ — Panel body content for browsing and selecting resume templates. Three variants: PublicTemplate (community templates), MyTemplate (user's … → `components/panel-04.md`
- **panel-05** ResumeBuilderPanel _(panel-content)_ — Panel body content for the resume builder editor. 25 variants covering all resume section editors: Home (default view), Personal Informat… → `components/panel-05.md`
- **panel-06** ConsentRequestPanel _(panel-content)_ — Panel body content for sending consent requests. 4 variants: ManualConsent (checkbox acknowledgment + textarea), SendEmail (email form + … → `components/panel-06.md`
- **panel-07** SmartContentPanel _(panel-content)_ — AI-powered content generation panel body. 4-step flow: SelectClient → ChooseOptions → ComposeEmail → GenerateResume. Each step shows rele… → `components/panel-07.md`
- **panel-08** ConsentInfoPanel _(panel-content)_ — Panel body content showing consent status and history. 21 variants combining: consent method (ShareLink/ManualUpload/SendEmail) × status … → `components/panel-08.md`
- **panel-09** ReferencePanel _(panel-content)_ — Panel body content for viewing candidate reference letters. Two states: Read (letter has been opened) and Unread (not yet viewed). Shows … → `components/panel-09.md`
- **panel-10** FileInfoPanel _(panel-content)_ — Panel body content for file management actions. 3 variants: FileHistory (shows version history), EditTag (tag editor for a file), LinkTo … → `components/panel-10.md`
- **panel-11** WorkflowPanel _(panel-content)_ — Panel body content for candidate workflow/pipeline management. Shows the candidate's current status in the recruitment workflow, stage hi… → `components/panel-11.md`
- **panel-12** NotificationPanel _(panel-content)_ — Panel body content for the notification/activity feed. Shows activity grouped by category: General, Jobs, Contract, Invoice, Payroll. Eac… → `components/panel-12.md`

## page (12)

- **page-01** Sample Pages 1 — Candidate Pipeline — Candidate recruitment pipeline view. Shows a horizontal arrow-shaped pipeline stepper above a data table. The stepper visualizes candidat… → `components/page-01.md`
- **page-02** Sample Pages 2 — Candidate List — Full-width candidate data table view for a requisition. Shows a filtered list of candidates with their onboarding/pre-boarding status. Ha… → `components/page-02.md`
- **page-03** Sample Pages 3 — Wizard Form: Offer Setup — Multi-step wizard form for creating an offer. Step 1: Offer Setup. Contains customer selector, position/department inputs, site location,… → `components/page-03.md`
- **page-04** Sample Pages 4 — Wizard Form: Salary & Income — Multi-step wizard form for creating an offer. Step 2: Salary & Income. Contains currency selector, basic salary input, wage type selector… → `components/page-04.md`
- **page-05** Sample Pages 5 — Candidate Card Grid — Candidate browsing view as a card grid. Left: full FilterPanel drawer with filter fields and quick suggestions. Top: list toolbar with vi… → `components/page-05.md`
- **page-06** Sample Pages 6 — Candidate Directory Table — Flat candidate directory as a wide data table with per-column filters. Same page header and list toolbar as the card grid view. Table: le… → `components/page-06.md`
- **page-07** Sample Pages 7 — Resume Builder (Editor) — Resume Builder opened as a full-screen modal (Browser type: plain white chrome). Header: 'Resume Builder' title + close X. Mode toolbar: … → `components/page-07.md`
- **page-08** Sample Pages 8 — Resume Builder (Design) — Resume Builder full-screen modal, Design mode. Same modal chrome and toolbar as the Editor view, but with the 'Design' tab active (and 'E… → `components/page-08.md`
- **page-09** Sample Pages 9 — Bulk Send for Approval — Bulk task flow opened as a full-screen modal (Browser type). Header: 'Bulk Send for Approval' + close X. Body: three panes — left candida… → `components/page-09.md`
- **page-10** Sample Pages 10 — Bulk Send for Approval (Collapsed Panes) — Bulk Send for Approval with both side panes collapsed into narrow icon rails. Left rail: expand icon button, 'Total: 6' caption, then one… → `components/page-10.md`
- **page-11** Sample Pages 11 — Employment Detail Side Panel (Summary) — Employee/candidate employment detail opened as a wide right-anchored side panel (Panel, MultiCard) over a scrimmed base page. Panel heade… → `components/page-11.md`
- **page-12** Sample Pages 12 — Employment Detail Side Panel (Snapshots) — Same employment detail side panel as page-11, showing an in-review contract (V1 · Main) with the Snapshots tab active. Stage stepper: onl… → `components/page-12.md`

