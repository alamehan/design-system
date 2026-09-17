---
name: e-systems-copywriting-standard
description: Product copywriting standard for E-Systems UI, prototypes, and AI-assisted implementation. Attach this file together with a Design System prompt when the work includes user-facing labels, actions, guidance, states, errors, confirmations, status, permissions, AI output, or localization.
version: 1.0-draft
scope: E-Systems product UI
---

# E-Systems Copywriting Standard

## 0. Purpose

This file is a **language contract for AI-assisted product work in E-Systems**.

Use it when building, redesigning, extending, migrating, prototyping, or auditing E-Systems UI so the product speaks in a way that is:

- **to the point**;
- **easy to understand**;
- **user-friendly and guiding**;
- **concise**;
- **specific about consequence and next action**;
- **consistent across modules and workflows**;
- **appropriate for operational, high-stakes enterprise work**.

When this file is attached, **apply it to the UI copy**. Do not merely summarize it.

This file is intentionally not a replacement for the Design System or UX Standard.

- **Product requirements and business rules** decide domain truth: policy, permissions, workflow, compliance, legal meaning, data meaning, and what the product is allowed to do.
- **UX Standard** decides behavioral truth: flow, hierarchy, interaction, state completeness, consequence, recovery, accessibility, and component suitability.
- **This Copywriting Standard** decides language truth: terminology, voice, tone, labels, actions, guidance, status, validation, errors, confirmations, and user-facing system messages.
- **Design System** decides visual truth: tokens, typography, component appearance, implementation primitives, and approved composition language.

The guiding principle:

> **The user should never have to interpret the system. The copy interprets the system for them.**

---

# 1. E-Systems context

E-Systems is an operational HRIS and business platform used across workflows such as:

- CRM and customer operations;
- recruitment jobs and candidate management;
- employee records;
- contracts, approvals, signatures, corrections, and exits;
- pre-boarding and offer workflows;
- statutory benefits;
- payroll and invoice approval;
- asset management and procurement;
- legal document workflows;
- data import and export;
- reports, administration, settings, notifications, and external integrations;
- AI-assisted tasks such as profile summaries, candidate recommendations, CV parsing, document generation, classification, and review support.

These are not casual consumer flows. Many actions can affect:

- another person;
- access or permissions;
- employment records;
- legal documents;
- payroll or billing;
- privacy and consent;
- approval chains;
- external emails or links;
- data imported into production;
- background jobs that may take time.

Therefore E-Systems copy must optimize for **clarity, trust, and task completion**, not personality or marketing flair.

---

# 2. The E-Systems voice

## 2.1 Voice attributes

E-Systems should sound:

### Clear
Use familiar words, explicit objects, and direct actions.

### Concise
Use the fewest words that preserve the meaning and consequence.

### Calm
Do not dramatize errors, risk, or urgency.

### Guiding
When the user can recover or continue, make the next step obvious.

### Operational
Write for people completing real work. Prefer concrete workflow language over abstract product language.

### Human
Use natural sentences rather than backend, API, database, or machine terminology.

### Respectful
Never blame, shame, scold, or talk down to the user.

### Honest
Do not claim that something is complete, sent, verified, approved, generated, or saved unless the product knows that it is true.

## 2.2 E-Systems should not sound

Avoid:

- playful or cute;
- promotional or sales-heavy;
- bureaucratic;
- robotic;
- overly formal;
- vague;
- dramatic;
- apologetic by default;
- overly conversational;
- anthropomorphic about AI or the system;
- technically impressive at the expense of clarity.

Bad:

> Congratulations! Your awesome candidate data has been successfully processed by our intelligent system.

Better:

> Candidate data imported. Review 3 rows that need attention.

---

# 3. Tone changes with the situation

The voice stays consistent. The **tone changes with risk and context**.

## 3.1 Routine work

Tone: direct and neutral.

> Save changes  
> Add candidate  
> Filter candidates  
> Download template

## 3.2 Guidance

Tone: concise and helpful.

> Select a customer to see available contracts.

> Add at least one approver before sending this contract.

## 3.3 Errors

Tone: calm and recovery-oriented.

> This file could not be uploaded. Use an XLSX file under 10 MB, then try again.

Do not use alarmist language unless there is a real safety, legal, or financial emergency.

## 3.4 High-stakes actions

Tone: factual and explicit.

> Send contract to candidate?  
> They will receive an email with a signing link. You can request a correction later, but the original link may already have been opened.

## 3.5 Success

Tone: restrained and specific.

> Contract sent to KAM for approval.

Not:

> Success! Your action was completed successfully!

## 3.6 Permission blocks

Tone: respectful and role-aware.

> You can view this contract, but only the assigned KAM can approve it.

Not:

> Access denied.

## 3.7 AI-assisted work

Tone: transparent and controlled.

> Profile summary generated. Review it before saving.

Not:

> AI has perfectly analyzed the candidate.

---

# 4. Source-of-truth precedence

When copy instructions disagree, use this order:

1. Law, compliance, security, and approved legal language.
2. Explicit product/business rules and current workflow truth.
3. UX Standard for behavior, state, consequence, and recovery.
4. This Copywriting Standard for wording.
5. Design System constraints for available component space and composition.
6. Existing product copy, when it does not conflict with the above.

Existing UI text is **evidence of current terminology**, not automatic proof that the wording is good.

Do not rewrite approved legal clauses, statutory language, contract clauses, policy text, or externally mandated wording unless the task explicitly authorizes it.

---

# 5. Core writing rules

## 5.1 Write for the task, not the system

Prefer the user’s work language.

Bad:

> `contract_status_rejected_must_edit_first`

Better:

> Edit this rejected contract before sending it for approval again.

Bad:

> Error 500

Better:

> We could not save your changes. Your entries are still here. Try again.

Bad:

> Invalid action

Better:

> This job cannot be closed while an approval is still pending.

## 5.2 Name the object

Avoid generic nouns such as:

- data;
- item;
- record;
- entry;
- information;
- process;
- action;

when the actual object is known.

Bad:

> Data saved.

Better:

> Candidate profile updated.

Bad:

> Delete item

Better:

> Delete template

## 5.3 Name the action

Buttons should describe what will happen.

Prefer:

- Save changes
- Send for approval
- Approve contract
- Reject request
- Generate contract
- Send to candidate
- Upload CV
- Download report
- Retry failed rows
- Deactivate user

Avoid when a more specific action is available:

- OK
- Yes
- Submit
- Process
- Continue
- Confirm
- Execute
- Proceed

`Continue` is acceptable only when the next step is already obvious and there is no more meaningful action label.

## 5.4 Say what is now true

Success copy should describe the new state.

Bad:

> Successfully saved.

Better:

> Customer details updated.

Bad:

> Success.

Better:

> 12 candidates added to the job.

## 5.5 Give the next action when it matters

If the user is blocked or needs to continue somewhere else, guide them.

> This link has expired. Request a new link to continue.

> No candidates match these filters. Clear one or more filters to see more results.

Do not add a next-step sentence when the user already knows what to do.

## 5.6 Do not repeat visible context

If a modal title says `Reject contract`, the body does not need to begin:

> Are you sure you want to reject this contract?

Use the body for consequence or required context:

> Add a reason so the creator knows what to change before resubmitting.

## 5.7 Do not explain the UI to itself

Avoid:

> Click the button below to continue.

Prefer:

> Review the changes before sending them for approval.

## 5.8 Use active voice

Prefer:

> KAM needs to approve this contract.

Over:

> This contract is required to be approved by KAM.

Use passive voice only when the actor is unknown or irrelevant.

---

# 6. Concision rules

Concise does not mean cryptic.

Use these as **targets, not rigid truncation rules**:

- navigation label: usually 1–3 words;
- button: usually 1–4 words;
- field label: usually 1–5 words;
- page title: usually 2–7 words;
- helper text: usually 1 short sentence;
- validation message: usually 1 sentence;
- toast: usually 1 sentence, 2 only when recovery is necessary;
- confirmation body: usually 1–3 short sentences;
- empty state: short title + one useful explanation/action.

Remove words that do not change meaning.

Usually remove:

- please;
- kindly;
- successfully;
- currently;
- basically;
- simply;
- just;
- in order to;
- you need to;
- the system will;
- note that;
- be informed that;
- as per;
- aforementioned.

Bad:

> Please kindly select the customer that you would like to use in order to continue.

Better:

> Select a customer to continue.

---

# 7. Grammar, casing, punctuation, and mechanics

## 7.1 Sentence case by default

Use sentence case for:

- page titles;
- section titles;
- labels;
- tabs;
- buttons;
- menu items;
- status labels;
- table headers;
- modal titles.

Preferred:

> Candidate profile  
> Send for approval  
> Contract history

Avoid unnecessary Title Case:

> Candidate Profile  
> Send For Approval  
> Contract History

Keep proper nouns and official acronyms in their established form.

## 7.2 Acronyms and product terms

Preserve established terms such as:

- E-Systems
- Elabram
- CRM
- HRIS
- KAM
- HOD
- BPJS
- OTP
- CV
- AI
- ID
- MY
- e-Materai

Do not expand a familiar internal acronym every time if the target users already use it.

When an acronym is uncommon for the target audience, introduce it once or use the full term.

## 7.3 Punctuation

- Button labels: no period.
- Navigation/menu labels: no period.
- Field labels: no period.
- Short status labels: no period.
- Full-sentence helper/error/confirmation copy: use normal sentence punctuation.
- Avoid exclamation marks in operational UI.
- Avoid ellipses except when representing genuinely ongoing text entry or intentional truncation. Do not use `Loading...` if a proper loading state exists.

## 7.4 Capitalization in status

Use sentence case:

> Waiting for approval  
> Pending response  
> Needs correction

Avoid:

> WAITING FOR APPROVAL

unless the value is a required official code in a technical/admin context.

## 7.5 Contractions

Natural contractions are acceptable in user-facing guidance:

> You can't approve this contract.

Prefer them when they make copy more human and concise.

Avoid contractions in legal text, formal policy content, or where translation consistency requires the full form.

---

# 8. Terminology discipline

## 8.1 One concept, one term

Use the same word for the same concept across the product.

Do not alternate without a real domain distinction:

- customer / client / company;
- candidate / applicant / talent;
- employee / member / staff;
- job / vacancy / requisition;
- approve / accept;
- reject / decline;
- delete / remove / deactivate;
- close / complete / finish.

If the business domain intentionally distinguishes the terms, preserve the distinction.

## 8.2 E-Systems domain terms

Use these distinctions unless the source material explicitly defines otherwise.

### Candidate
A person in recruitment/talent workflows.

Do not call a candidate an employee before an employee record or employment state exists.

### Employee
A placed person represented in HR/employee operations.

Do not use `member` in user-facing copy merely because the database/API uses `_member`.

### Customer
The business/customer account in CRM and related operational workflows.

Use `client user` only when referring specifically to a person using the client portal, if that distinction matters.

### Job
A recruitment job/order/requisition.

Use `application` for the relationship between a candidate and a job.

### Contract
The employment/placement contract.

Do not call an offer letter a contract.

### Offer
The pre-boarding offer sent before the contract flow.

### Request
Use only when the product object is genuinely a request, such as a statutory request, procurement request, legal request, or pre-boarding request. Prefer the specific object when context allows.

## 8.3 Workflow action verbs

Use these meanings consistently:

### Approve
Accept the current state and allow the workflow to advance.

### Reject
Do not accept the current submission. Use when the flow actually becomes rejected or must be corrected/resubmitted.

### Return for changes
Use when the object is explicitly sent back for editing without the stronger meaning of rejection.

### Withdraw
The creator/requester pulls back something they previously sent or submitted.

### Cancel
Stop a process before normal completion.

### Close
End an operational workflow that may later be reopened.

### Reopen
Resume a previously closed workflow.

### Deactivate
Disable while preserving the record/history and allowing possible reactivation.

### Delete
Remove according to product policy. Use only when that is truly what happens.

### Remove
Detach something from a relationship/list without implying the underlying record is deleted.

### Archive
Move out of active work while preserving history, only if the product actually supports an archive state.

Never use these verbs interchangeably merely for variety.

---

# 9. Navigation and information architecture copy

Navigation should be stable, short, and noun-based.

Good E-Systems-style navigation:

- Dashboard
- CRM
- Jobs
- Candidates
- Employee
- Administration
- Finance
- AMS
- Reports
- Interview form
- Document builder
- Email blast
- Data import
- Data export
- Master data

Rules:

- Prefer the established product/domain noun.
- Do not write navigation as marketing taglines.
- Do not add explanatory phrases to sidebar labels when the destination name is sufficient.
- Use page descriptions, helper copy, or empty states for explanation instead.
- Avoid switching between singular and plural without a reason.
- Use `Reports` when it is a collection; use a specific report name when it is one destination.

---

# 10. Page titles, section titles, and descriptions

## 10.1 Page title

Name the object or task.

Good:

> Candidate search  
> Contract approval  
> Customer details  
> Data import  
> Statutory requests

Avoid:

> Manage your candidates here  
> Contract management screen  
> Welcome to customer details

## 10.2 Page description

Use only when it adds orientation or scope.

Good:

> Review contracts waiting for your approval.

> Import employee data from the E-Systems template.

Do not repeat the title:

Bad:

> Candidate search lets you search candidates.

## 10.3 Section titles

Name the information or task in the section:

> Personal information  
> Work experience  
> Approval history  
> Invoice details

Avoid vague labels:

> Details  
> Information  
> Other

unless the surrounding context makes them genuinely sufficient.

---

# 11. Buttons and actions

## 11.1 Use verb + object when useful

Preferred:

> Add candidate  
> Save changes  
> Send offer  
> Generate contract  
> Approve request  
> Reject request  
> Download template  
> Export report

The object may be omitted when obvious and space is tight:

> Save  
> Edit  
> Retry  
> Close

## 11.2 Primary action

The primary button should describe the main commitment.

If the action has consequence, use the exact consequence:

Bad:

> Submit

Better:

> Send for approval

Bad:

> Confirm

Better:

> Confirm join

## 11.3 Secondary actions

Use predictable labels:

- Cancel
- Back
- Close
- Skip
- Save draft
- Review later

Do not rename `Cancel` as `Never mind` or other conversational variants in operational UI.

## 11.4 Destructive actions

Name the exact destructive action:

- Delete template
- Deactivate user
- Cancel request
- Withdraw approval
- Remove candidate
- Exit contract

Do not use `Confirm` as the destructive CTA.

---

# 12. Forms

## 12.1 Labels

Field labels should name the value, not instruct the user.

Good:

> Candidate email  
> Contract start date  
> Customer  
> Approval reason

Avoid:

> Enter candidate email  
> Please select customer

Use instructions in helper text only when needed.

## 12.2 Helper text

Helper text should explain one of four things:

1. why the information is needed;
2. the required format;
3. the consequence;
4. the source/provenance.

Good:

> Use the email the candidate uses for recruitment communication.

> PDF or DOCX, up to 10 MB.

> Changing this date will recalculate the contract period.

> Prefilled from the candidate profile. You can edit it here.

Do not repeat the label.

## 12.3 Placeholders

Placeholders provide an example or expected format. They do not replace labels.

Good:

Label: `Search candidates`  
Placeholder: `Name, email, skill, or location`

Label: `Contract number`  
Placeholder: `e.g. CTR-2026-0012`

Avoid placeholder-only fields.

## 12.4 Optional and required

Use one consistent convention.

Prefer:

- mark optional fields as `(optional)` when most fields are required; or
- mark required fields consistently when only a few are required.

Do not mix conventions on one form.

## 12.5 Read-only fields

Do not use disabled-looking language for values that are intentionally not editable.

If useful, explain why:

> Managed from employee data.

> Generated after approval.

---

# 13. Validation

Validation should help the user fix the exact problem.

## 13.1 Pattern

Use:

**problem + correction**

Examples:

> Enter a valid email address.

> End date must be after the start date.

> Select at least one approver.

> File must be XLSX and under 10 MB.

> Enter an amount greater than 0.

Avoid:

> Invalid value.

> Required field.

> Wrong format.

## 13.2 Preserve user input

Never imply that the user must start over if the UI can preserve their work.

Good:

> We could not save your changes. Your entries are still here. Try again.

## 13.3 Duplicate records

Name the duplicate and provide the useful next step.

> A candidate with this email already exists. View the existing profile instead.

> This contract number is already in use. Enter a different contract number.

Do not expose database keys or technical uniqueness errors.

---

# 14. Errors and recovery

## 14.1 Error formula

When recovery matters, write:

**what happened → what it affects → what to do next**

Not every error needs all three clauses, but the user should never be left guessing.

Example:

> The export could not be generated. Your filters are unchanged. Try again.

Example:

> This signing link has expired. Request a new link to continue.

## 14.2 Do not expose raw errors

Never use as primary user-facing copy:

- HTTP status codes;
- stack traces;
- database messages;
- API error keys;
- enum names;
- internal IDs;
- route names;
- Go/Lumen/Laravel errors;
- `undefined`, `null`, `NaN`.

If useful for support, technical details may exist behind:

> View technical details

or be included in logs, not in the primary message.

## 14.3 Do not blame the user

Avoid:

> You entered the wrong password.

Prefer:

> Email or password is incorrect.

Avoid:

> You uploaded an invalid file.

Prefer:

> This file format is not supported. Upload an XLSX file.

## 14.4 Retry language

Use `Try again` for the same action.

Use `Retry failed rows` when only part of a batch failed.

Use `Upload again` only when a new upload is required.

Use `Request new link` when the system must generate a replacement.

## 14.5 Unknown system failure

When the cause is genuinely unknown:

> Something went wrong while saving your changes. Your entries are still here. Try again.

Avoid over-specific explanations that the system cannot verify.

---

# 15. Confirmations and high-stakes copy

The UX Standard decides **whether confirmation is necessary**. This file decides how that confirmation should read.

## 15.1 Confirmation structure

### Title
Ask or name the exact commitment.

> Send contract to candidate?

### Body
State the meaningful consequence, reach, or irreversibility.

> The candidate will receive an email with a signing link.

### Primary CTA
Repeat the action.

> Send contract

### Secondary CTA
Usually:

> Cancel

Do not use:

Title: `Confirmation`  
Body: `Are you sure?`  
CTA: `Yes`

## 15.2 Destructive action

> Delete template?

> This removes the template from future use. Existing documents are not affected. This action cannot be undone.

Primary:

> Delete template

## 15.3 Reject with reason

> Reject contract?

> Add a reason so the creator knows what to change before resubmitting.

Primary:

> Reject contract

## 15.4 External reach

If the action sends something outside the current user’s private workspace, say so when material.

> Send offer to 12 candidates?

> Each candidate will receive an email with their offer and response link.

Primary:

> Send 12 offers

## 15.5 Bulk consequence

Include quantity when known.

> Deactivate 8 users?

> They will no longer be able to sign in until reactivated.

Primary:

> Deactivate 8 users

---

# 16. Success and completion

## 16.1 Success should be specific

Preferred:

> Candidate added to the job.

> Contract sent to KAM for approval.

> User deactivated.

> 24 rows imported. 3 need review.

> Export request created. We’ll notify you when the file is ready.

Avoid:

> Success!

> Completed successfully.

> Operation successful.

## 16.2 Success is not always completion

Do not say `Done` when only a request has been queued.

Bad:

> Export completed.

when the product only created the job.

Better:

> Export request created. We’ll notify you when the file is ready.

Do not say:

> Contract sent.

if the product only scheduled it and has not confirmed delivery.

Use:

> Contract scheduled to send on 18 Sep 2026 at 09:00 WIB.

---

# 17. Status language

## 17.1 Status describes state, not action

Status:

> Waiting for approval

Action:

> Send for approval

Status:

> Pending signature

Action:

> Send to candidate

Do not write action verbs as status labels unless the status genuinely represents an action in progress.

## 17.2 Prefer user meaning over backend codes

Bad:

> Status: 2

> ACTIVE_Y

> WAITING_STAGE_1

Better:

> Approved

> Active

> Waiting for KAM approval

## 17.3 Status should answer: “what is true now?”

Examples:

- Draft
- Waiting for approval
- Waiting for KAM approval
- Waiting for HOD signature
- Ready to send
- Pending candidate signature
- Needs correction
- Rejected
- Approved
- Active
- Completed
- Inactive
- Expired
- Failed
- Partially completed

Use the role name only when it helps the user understand ownership.

## 17.4 Do not blur similar states

Keep these distinct when the product does:

- draft vs submitted;
- pending vs processing;
- approved vs completed;
- sent vs delivered;
- delivered vs signed;
- failed vs cancelled;
- inactive vs deleted;
- rejected vs returned for changes;
- unknown vs not applicable.

---

# 18. Empty, no-results, and unavailable states

## 18.1 First-run empty

Explain what belongs here and the first useful action.

> No saved searches yet

> Save a candidate search to reuse the same filters later.

Action:

> Save current search

## 18.2 No search/filter results

Acknowledge that content may exist but the current criteria found none.

> No candidates match these filters

> Clear one or more filters, or try a broader keyword.

Action:

> Clear filters

Do not show the same empty state used for a brand-new account.

## 18.3 Permission-limited empty

Do not imply there is no data if the user simply cannot see it.

> No contracts available for your access

> Ask your administrator if you need access to another customer or branch.

Only show the escalation path if that is actually supported.

## 18.4 Temporarily unavailable

> Candidate recommendations are temporarily unavailable. You can continue without them and try again later.

Do not say a feature is `coming soon` unless it is genuinely planned and approved.

---

# 19. Loading, processing, and background work

## 19.1 Short loading

Use an object-specific label only when text is needed:

> Loading candidates…

> Loading contract details…

Avoid:

> Please wait…

## 19.2 Long-running work

Tell the user what is happening and whether they can leave.

> Preparing your export. You can leave this page—we’ll notify you when it’s ready.

> Parsing 18 CVs. 7 completed, 1 needs review.

## 19.3 Queued work

Do not imply active processing when only queued.

> Export queued.

> Your export is waiting to be processed.

## 19.4 Partial result

Be explicit.

> 42 CVs parsed. 5 failed.

Action:

> Review failed CVs

## 19.5 Retry

> CV parsing stopped before all files were processed. Retry the 5 failed files.

Do not force the user to rerun completed work when the system can retry only failures.

---

# 20. Tables, filters, search, selection, and bulk actions

## 20.1 Table headers

Use short nouns:

- Candidate
- Job
- Customer
- Status
- Recruiter
- Created date
- Last updated
- Actions

Avoid sentence-like headers.

## 20.2 Search

Placeholder should tell the user what can be searched.

> Search by name, email, or NIP

> Search customers

Do not use generic:

> Search here…

## 20.3 Filters

Use user-facing concepts, not database fields.

Good:

> Contract status  
> Branch  
> Customer  
> Created by

Avoid:

> cont_active  
> cus_id  
> user_id

## 20.4 Selection

Make scope explicit.

> 12 candidates selected

> Select all 50 candidates on this page

> Select all 975 matching candidates

Never let `Select all` silently change scope between current page and all results.

## 20.5 Bulk result

Report the outcome honestly:

> 18 users deactivated. 2 could not be changed.

Actions:

> Review 2 failures  
> Close

---

# 21. Permissions, roles, and access

## 21.1 Explain ownership when useful

Bad:

> You do not have access.

Better:

> You can view this contract, but only the assigned KAM can approve it.

Bad:

> Forbidden.

Better:

> Only Legal can move this request to drafting.

## 21.2 Do not reveal sensitive permission detail

Explain only what the user needs to proceed.

Do not expose role IDs, menu flags, division IDs, internal permission codes, or security configuration.

## 21.3 Disabled action

If a disabled action is visible and the enabling condition can safely be disclosed:

> Approval is available after all required documents are uploaded.

If the user can never perform the action, prefer hiding it or showing read-only status according to the UX Standard rather than using unexplained disabled buttons.

---

# 22. Notifications, email, and external communication

Copy that triggers communication must state the recipient or reach when that affects the user’s decision.

## 22.1 Sending

> Send reminder to candidate

> Send approval request to KAM

> Email invoice to customer

## 22.2 Scheduling

> Schedule email

Helper:

> The email will be sent on 18 Sep 2026 at 09:00 WIB.

## 22.3 Resend

Use `Resend` only when sending a replacement/repeat is expected.

> Resend invitation

If the previous link becomes invalid, say so when relevant:

> Sending a new invitation will replace the previous link.

## 22.4 Notification outcomes

Do not claim delivery when the system only queued/sent the request.

Distinguish where possible:

- Scheduled
- Queued
- Sent
- Delivered
- Opened
- Failed
- Expired

---

# 23. AI-assisted experiences

E-Systems uses AI in operational work. AI copy must preserve **human authority and uncertainty**.

## 23.1 Name the AI task, not the technology hype

Good:

> Generate profile summary  
> Recommend candidates  
> Parse CVs  
> Check document risks

Avoid:

> Unleash AI  
> Smart magic  
> Let AI decide

## 23.2 Generated content is a suggestion unless product truth says otherwise

After generation:

> Profile summary generated. Review it before saving.

> 6 candidate recommendations found. Review the matches before adding them to the job.

## 23.3 Do not imply certainty the system does not have

Avoid:

> Best candidate  
> Perfect match  
> Guaranteed fit  
> Verified by AI

Prefer:

> Recommended candidate  
> Strong match based on selected criteria  
> AI-generated summary

Only use `verified` when there is an actual verification process.

## 23.4 Explain source when it affects trust

> Generated from the candidate profile and uploaded CV.

> Recommendation based on skills, location, and job requirements.

Do not expose prompt engineering, model internals, or token details to normal users.

## 23.5 AI failure

> Couldn’t generate a profile summary. Your candidate data is unchanged. Try again.

## 23.6 AI + consequential action

AI should not sound like it has already committed the action if a user still needs to decide.

Bad:

> Candidate approved.

if AI only recommended the candidate.

Better:

> Candidate recommended for review.

---

# 24. Consent, privacy, legal, payroll, and financial copy

These areas need extra precision.

## 24.1 Consent

Use explicit action and purpose.

> Send consent request

> Candidate accepted data consent.

Do not use manipulative language.

Avoid:

> Agree to continue and enjoy the best experience.

## 24.2 Legal documents

Use exact workflow state and actor.

> Waiting for Legal review

> Waiting for Approver 1

> Signed by candidate

Do not rewrite approved legal clauses for friendliness.

## 24.3 Payroll and invoice

Name the period, amount, currency, customer, or batch when relevant.

> Approve August 2026 payroll for PT Example?

> This approval allows the batch to move to the next approver.

Never use vague `Approve data`.

## 24.4 Money

Always include the currency when more than one currency can appear or when context could be ambiguous.

Preferred:

> IDR 12,500,000  
> MYR 4,250.00

Follow the product’s locale-aware numeric formatter. Do not manually invent a new format in copy.

## 24.5 Irreversible or externally binding copy

State the consequence in plain language, even if a legal term also exists.

> Exit this contract?

> Payroll and statutory processes may use this end date. Check the date before continuing.

The exact business consequence must come from product truth. Do not invent legal impact.

---

# 25. Dates, times, numbers, and units

## 25.1 Dates

Avoid ambiguous numeric dates such as:

> 03/04/26

Prefer a locale-aware unambiguous display such as:

> 3 Apr 2026

or the product’s approved localized format.

Use four-digit years when the date has operational, legal, payroll, or historical importance.

## 25.2 Time

Use the user/product locale consistently.

When users operate across time zones and the zone matters, include it:

> 18 Sep 2026, 09:00 WIB

Do not mix 12-hour and 24-hour format in one product surface.

## 25.3 Ranges

Prefer:

> 1–15 Sep 2026

over:

> 01/09/2026 - 15/09/2026

when the product locale supports the written-month format.

## 25.4 Counts

Use the actual object:

> 1 candidate  
> 12 candidates

Do not use:

> 12 data

## 25.5 Zero, unknown, missing, and not applicable

These are different meanings.

Use:

- `0` when the value is truly zero;
- `Not provided` when expected data is missing;
- `Unknown` when the product does not know;
- `Not applicable` when the concept does not apply.

Do not flatten all of them to `-`.

---

# 26. Localization

## 26.1 Preserve meaning before literal wording

Translation should preserve:

- action;
- consequence;
- ownership;
- status;
- domain term;
- level of certainty.

Do not translate word-for-word if the result becomes unnatural or ambiguous.

## 26.2 Follow the language of the surface

When the task does not explicitly request a language:

- preserve the established language of the current product surface;
- do not mix English and Indonesian in one flow without an explicit product reason.

## 26.3 English baseline

For English UI:

- use plain international English;
- avoid idioms, slang, jokes, and culture-specific metaphors;
- use short sentence structures that localize cleanly.

## 26.4 Bahasa Indonesia

When producing Bahasa Indonesia:

Prefer natural operational Indonesian, not literal English syntax.

Good:

> Kirim untuk persetujuan

> Kontrak sudah dikirim ke KAM untuk disetujui.

> Tautan ini sudah kedaluwarsa. Minta tautan baru untuk melanjutkan.

Avoid stiff wording when a simpler phrase exists:

> Mohon untuk dapat melakukan penginputan…

Prefer:

> Masukkan…

Use established work terms such as `KAM`, `HOD`, `CV`, `BPJS`, and `e-Materai` when those are the terms users actually know.

## 26.5 Never build sentences from fragile fragments

Do not construct messages like:

`"Successfully " + action + " " + count + " data"`

because word order, pluralization, and translation will break.

Write complete message variants.

---

# 27. Tooltips, hints, banners, and instructional copy

## 27.1 Tooltip

Use only for short clarification that does not need to be permanently visible.

Good:

> Opens candidate profile in a side panel.

Avoid putting required instructions only in a tooltip.

## 27.2 Hint/helper

Use near the point of action.

> You can add up to 50 candidates at once.

## 27.3 Banner

Use for page-level information that changes how the user should work.

> Maintenance starts at 22:00 WIB. Save any unfinished work before then.

## 27.4 Onboarding

Explain the immediate value and first action. Do not write a product brochure.

Bad:

> Welcome to our powerful next-generation candidate management experience.

Better:

> Find candidates, review profiles, and add the right people to a job.

---

# 28. Toasts, inline messages, and modal copy

## 28.1 Toast

Best for transient confirmation that does not require a decision.

> Candidate profile updated.

> Invitation resent.

Do not put critical recovery instructions only in a disappearing toast.

## 28.2 Inline message

Best when the message belongs to the current field, section, or workflow.

> Upload at least one supporting document before sending this request.

## 28.3 Modal

Use the title for the decision and the body for consequence/context.

Title:

> Cancel procurement request?

Body:

> This stops the current request. Already created assets are not affected.

CTA:

> Cancel request

Secondary:

> Keep request

Use `Keep request` when `Cancel` would be ambiguous because the primary action itself is `Cancel request`.

---

# 29. Common wording replacements

Prefer these transformations.

| Avoid | Prefer |
|---|---|
| Please select a customer | Select a customer |
| Kindly fill in the form | Complete the required fields |
| Submit | Send for approval / Save / Create / Send |
| Confirm | Confirm join / Approve / Send / Delete |
| Yes / No | Action-specific labels |
| Data | Candidate / contract / invoice / request / file |
| Successfully saved | Candidate profile updated |
| Invalid input | Enter a valid email address |
| Error occurred | Couldn’t save your changes |
| Access denied | Only the assigned KAM can approve this contract |
| Please wait | Preparing your export |
| No data | No candidates yet / No results found |
| Process | Generate / Import / Approve / Calculate |
| Are you sure? | State the exact consequence |
| Something went wrong | Use a specific cause when known |
| AI result | AI-generated summary / recommendation |
| Best match | Recommended candidate |
| Delete data | Delete candidate / Delete template |
| Deactive | Deactivate |
| Re-active | Reactivate |
| Cancelled by system | Cancelled automatically + reason, if known |

---

# 30. E-Systems example patterns

These examples are reference patterns. Adapt the object, actor, and consequence to actual product truth.

## 30.1 Candidate

Field error:

> Enter the candidate’s email.

Duplicate:

> A candidate with this email already exists.

Action:

> Add to job

Success:

> Candidate added to the job.

Empty:

> No candidates match these filters.

Recovery:

> Clear filters

## 30.2 Job

Confirmation:

> Close this job?

> Candidates already in the pipeline will remain in their current records. Confirm the close reason before continuing.

CTA:

> Close job

Use the real consequence from the job workflow; do not invent one.

## 30.3 Contract

Blocked:

> This contract is not ready to send. Complete the required approval first.

Approval:

> Approve contract

Success:

> Contract approved. It is now waiting for HOD signature.

Candidate send:

> Send contract to candidate?

> The candidate will receive an email with a signing link.

CTA:

> Send contract

Expired signing link:

> This signing link has expired. Request a new link to continue.

## 30.4 Pre-boarding

Offer:

> Send offer

Success:

> Offer sent to candidate.

Profile correction:

> Request profile correction

Helper:

> Tell the candidate what needs to be updated before resubmitting.

## 30.5 Payroll

Confirmation:

> Approve August 2026 payroll?

> This moves the batch to the next approval stage.

CTA:

> Approve payroll

Rejected:

> Payroll batch rejected. Add a reason so the requester knows what to change.

## 30.6 Invoice

Action:

> Approve invoice

Success:

> Invoice approved.

Email:

> Send invoice to customer

## 30.7 Asset

Action:

> Check out asset

Confirmation:

> Check out this asset to Dinda Pratama?

> Dinda will receive a confirmation request.

CTA:

> Check out asset

Return:

> Check in asset

Do not use `Submit asset`.

## 30.8 Data import

Instruction:

> Upload the completed E-Systems template.

Validation summary:

> 124 rows ready to import. 6 rows need attention.

Actions:

> Review 6 rows  
> Import 124 rows

Success:

> 124 employee records imported.

## 30.9 Data export

Action:

> Generate export

Queued:

> Export queued. We’ll notify you when the file is ready.

Ready:

> Export ready to download.

Expired:

> This download link has expired. Generate a new export.

## 30.10 AI profile summary

Action:

> Generate profile summary

Pending:

> Generating profile summary…

Success:

> Profile summary generated. Review it before saving.

Failure:

> Couldn’t generate a profile summary. Candidate data is unchanged. Try again.

---

# 31. Writing algorithm for AI

When asked to write, rewrite, or generate E-Systems UI copy, use this sequence internally.

## Step 1 — identify the object

What exactly is being viewed or changed?

Candidate? Job? Application? Contract? Offer? Employee? Payroll batch? Invoice? Asset? Request? File?

Do not use `data` if the object is known.

## Step 2 — identify the user goal

What is the person trying to accomplish?

Search? Review? Create? Approve? Reject? Send? Import? Export? Correct? Retry?

## Step 3 — identify the current state

What is true before the action?

Draft? Waiting? Approved? Failed? Expired? No results? Permission blocked?

## Step 4 — identify consequence and reach

Will this:

- change a workflow state?
- affect another person?
- send email?
- expose data?
- approve money?
- create a legal record?
- remove access?
- start background work?
- be difficult to reverse?

Only include consequence that is supported by product truth.

## Step 5 — choose the correct copy type

Is this:

- title;
- label;
- button;
- helper;
- validation;
- error;
- warning;
- confirmation;
- status;
- empty state;
- success;
- loading/background message;
- permission message;
- notification?

Do not use one copy pattern for all types.

## Step 6 — write the shortest complete version

Start with the essential meaning.

Then remove:

- politeness filler;
- duplicate context;
- technical terms;
- vague nouns;
- redundant success language;
- unnecessary explanation.

## Step 7 — make recovery obvious

If the user is blocked and a next action exists, say it.

## Step 8 — check terminology

Use one product term consistently.

## Step 9 — check truth

Do not claim:

- sent if only queued;
- completed if only approved;
- verified if only generated;
- deleted if only deactivated;
- active if still pending;
- failed if still processing.

## Step 10 — check localization readiness

Avoid fragments, idioms, ambiguous dates, and grammatical constructions that will break translation.

---

# 32. Rewrite protocol for existing UI

When auditing or improving existing E-Systems copy:

1. Preserve business meaning and workflow truth.
2. Preserve established domain terminology unless it is clearly technical/internal.
3. Identify vague, generic, technical, inconsistent, or misleading copy.
4. Rewrite to the specific object/action/state.
5. Add consequence only where it changes the decision.
6. Add recovery only where the user needs it.
7. Remove redundant explanation.
8. Keep copy within the existing component unless the UX Standard shows that the component itself is the problem.
9. Do not change business logic merely to make the copy easier.
10. Flag any wording that cannot be corrected safely because the underlying product truth is unclear.

If a raw backend error is mapped to user-facing copy, keep the technical error available for logs/support, not as the primary UI message.

---

# 33. Conflict and uncertainty rules

## 33.1 Missing business truth

If wording depends on unknown policy, do not invent it.

Example:

If the source says a user can `Cancel`, but does not say whether cancellation can be undone, do not write:

> You can reactivate this later.

Instead use neutral copy supported by truth:

> Cancel request?

and flag the unresolved consequence if needed.

## 33.2 Conflicting source terms

If one screen says `Client` and another says `Customer`, do not randomly pick one.

Use product/domain evidence to determine whether they are the same concept or distinct actors. If unresolved, report the terminology conflict.

## 33.3 Legacy technical terms

Translate backend language to user language where meaning is known.

Examples:

- `mem_id` → Employee or Candidate ID, depending domain;
- `cus_active` → Customer status;
- `status_approve` → Approval status;
- `rod_status` → Application status.

Do not expose schema vocabulary just because it appears in code.

---

# 34. Copy Done Gate

Before handing over any UI or prototype with user-facing copy, check every applicable line.

## Clarity

- [ ] Every action says what it does.
- [ ] Every important object is named.
- [ ] Generic words such as `data`, `process`, `action`, `submit`, `confirm`, `OK`, and `Yes` have been replaced where a specific term is available.
- [ ] The user does not need backend knowledge to understand the message.
- [ ] The copy answers the user’s immediate question without unnecessary explanation.

## Concision

- [ ] Repeated context has been removed.
- [ ] Helper text adds new information rather than restating labels.
- [ ] Politeness filler and bureaucratic phrasing have been removed.
- [ ] Buttons are short but not vague.
- [ ] Long paragraphs have been split or reduced where the user only needs a decision or next step.

## Terminology

- [ ] One concept uses one term across the flow.
- [ ] Candidate, employee, customer, client user, job, application, offer, contract, approval, rejection, cancellation, deactivation, and deletion are not mixed carelessly.
- [ ] Acronyms and proper names use their established form.
- [ ] Internal codes, field names, API names, and database terms are absent from normal user-facing copy.

## States and truth

- [ ] Status labels describe what is true now.
- [ ] Action labels describe what will happen.
- [ ] `Queued`, `processing`, `sent`, `delivered`, `approved`, `signed`, and `completed` are not treated as synonyms.
- [ ] Success messages state the actual resulting state.
- [ ] AI-generated content is not presented as verified fact unless it truly is.
- [ ] Unknown, missing, zero, and not applicable are represented distinctly.

## Errors and recovery

- [ ] Errors explain the specific problem when known.
- [ ] Recoverable errors tell the user what to do next.
- [ ] User input is not blamed or described as `invalid` without useful detail.
- [ ] Raw backend errors are not shown as primary copy.
- [ ] Partial failures are not flattened into generic failure or success.

## Consequence

- [ ] High-stakes confirmation names the object and meaningful consequence.
- [ ] Actions affecting other people state the audience/reach when it matters.
- [ ] Destructive CTA uses the actual destructive verb.
- [ ] No confirmation relies only on `Are you sure?`, `Yes`, or `Confirm`.
- [ ] Legal/financial/privacy consequences are stated only when supported by product truth.

## Localization and formatting

- [ ] Dates and times are unambiguous.
- [ ] Currency is explicit when context can vary.
- [ ] Copy does not rely on English-only sentence fragments.
- [ ] The flow does not mix languages unintentionally.
- [ ] Long labels and translated strings can fit the intended component or have an approved responsive behavior.

## Product quality

- [ ] No lorem ipsum or placeholder copy remains.
- [ ] Empty and no-results states are different.
- [ ] Permission messages explain ownership or the next safe step when appropriate.
- [ ] Long-running actions explain queue/progress/return behavior honestly.
- [ ] The copy guides the user without turning the screen into documentation.

A handoff is not copy-ready while a blocker remains in this gate.

---

# 35. Common failure patterns to catch early

Treat these as strong signals that E-Systems copy needs revision:

- `Success!`
- `Error!`
- `Invalid action`
- `Invalid data`
- `No data`
- `Submit`
- `Process`
- `Confirm`
- `OK`
- `Yes / No` for a consequential decision;
- `Are you sure?` with no consequence;
- `Please kindly…`;
- `Data saved successfully`;
- raw API/backend messages;
- database/status codes in the UI;
- mixed `Customer`, `Client`, and `Company` for one object;
- mixed `Candidate` and `Employee`;
- mixed `Reject`, `Cancel`, `Delete`, and `Deactivate`;
- a success toast that says nothing about what changed;
- a disabled button with no explanation when the condition is knowable;
- a generic empty state after filtered search;
- a background process described as complete before it finishes;
- AI content described as correct/verified without a real verification step;
- a permission error that reveals internal role IDs;
- a destructive action that hides its reach;
- a date like `04/05/26` with no locale context;
- a currency amount with no currency in a multi-country context;
- technical wording copied directly from logs;
- copy so verbose that the user must read documentation to complete a routine action;
- copy so short that the user must guess the consequence.

---

# 36. What this file deliberately does not replace

This standard does not replace:

- E-Systems Design System;
- E-Systems UX Standard;
- approved legal clauses and policy language;
- statutory or compliance source text;
- localization review by native speakers where legal/regulated meaning matters;
- product decisions about permissions, workflow, consequence, or retention;
- technical logs and developer-facing error diagnostics;
- research with real users when terminology comprehension is uncertain.

This file governs **product-facing language**, not backend naming conventions.

---

# 37. Operating summary for AI

If you remember only this section while writing:

1. **Name the real object.**
2. **Name the real action.**
3. **Use the user’s language, not the system’s language.**
4. **Use minimum words without removing consequence.**
5. **Status says what is true; button says what will happen.**
6. **Success says what changed.**
7. **Error says what happened and how to recover.**
8. **Confirmation names the object, reach, and consequence.**
9. **Never use `Are you sure?`, `Yes`, `OK`, or `Submit` when the real action can be named.**
10. **Do not blame the user.**
11. **Do not expose backend codes or technical errors.**
12. **Do not claim completion, delivery, verification, or certainty the product does not know.**
13. **AI assists; the user remains in control.**
14. **Use one term for one concept.**
15. **Write for localization: short, complete, literal enough to translate cleanly.**
16. **Run the Copy Done Gate before handoff.**

> **E-Systems copy = minimum words + maximum clarity + explicit consequence + obvious next action.**
