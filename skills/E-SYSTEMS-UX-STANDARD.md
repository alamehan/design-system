---
name: e-systems-ux-standard
description: Behavioral UX standard for building, redesigning, extending, or auditing E-Systems product UI and prototypes. Attach this file together with a Design System prompt when the task has meaningful user flow, interaction, state, data, consequence, accessibility, or recovery behavior.
version: 1.0-draft
source: SatSet UX v3, consolidated for direct Design System / vibe-coding use
---

# E-Systems UX Standard

## 0. Purpose

This file is a **behavioral UX contract for AI-assisted product work**.

Use it when building or changing product UI so the result is not only visually on-brand, but also usable, complete, resilient, accessible, and honest about what the product can actually do.

It is intentionally **not** a second design system and **not** a copywriting style guide.

- **Design System** decides visual truth: tokens, type, spacing, component appearance, implementation primitives, and approved composition language.
- **This UX Standard** decides behavioral truth: flow, hierarchy, interaction, states, consequences, recovery, data reality, accessibility, and component suitability.
- **Copywriting Standard** decides language quality: terminology, voice, tone, grammar, localization, and detailed microcopy conventions.
- **Product requirements and business rules** decide domain truth: policy, permissions, legal constraints, data meaning, and what the product is allowed to do.

When this file is attached, apply it to the work. Do not merely summarize it.

---

# 1. How to use this file

## 1.1 Default behavior for the AI

When a task asks you to build, redesign, extend, migrate, or audit a product UI:

1. Read the task and source material first.
2. Separate **business truth** from **proposed UI**. A PRD saying “use a modal” is usually a proposed solution unless the UI form itself is explicitly locked.
3. Diagnose the user problem before choosing a component.
4. Choose the smallest interaction that solves the problem without hiding consequence or recovery.
5. Build the complete path, not only the ideal screenshot.
6. Use the Design System’s real tokens, components, bindings, and patterns.
7. Verify the result against the Done Gate in this file before handing it over.

Do not ask routine UX questions that can be resolved safely. Make the safest reversible assumption and keep moving. Ask only when the missing answer changes **business policy, legal/compliance meaning, permissions, money, irreversible consequence, or another person’s rights**.

When you make a high-risk assumption, state it briefly in the handoff instead of silently turning it into product truth.

## 1.2 Source-of-truth precedence

Use this order when instructions disagree:

1. Law, compliance, security, and explicit business rules.
2. Explicit task requirements that are truly locked.
3. This UX Standard for behavior and interaction quality.
4. Copywriting Standard for user-facing language, when attached.
5. Design System for visual implementation and available primitives.
6. Existing product conventions, when they do not conflict with the above.

A Design System component may exist and still be the wrong UX choice. Conversely, this standard may call for a behavior that the Design System does not yet have a ready-made component for. In that case, **compose from approved Design System primitives and report the gap; do not invent a new visual language silently**.

## 1.3 The core rule

**A component is the consequence of a UX decision, not the starting point.**

First understand what the person is trying to do, what can go wrong, and how costly the mistake is. Only then decide whether the right realization is a page, panel, modal, drawer, table, form, toast, stepper, etc.

---

# 2. The execution loop

Use this compact loop internally for every meaningful feature.

## 2.1 READ — know what is true

Extract and preserve:

- user goal;
- business rules;
- constraints;
- permissions and roles;
- required data;
- irreversible or externally visible consequences;
- external actors or systems;
- known edge cases;
- proposed UX that may be improved rather than copied.

Do not convert a missing policy into a confident UI rule.

Before designing, answer these questions:

- Can the action be undone?
- Even if it can be undone, has another person already seen it?
- Is this used rarely or repeatedly every day?
- Are users trained insiders or occasional/untrained users?
- Is data tidy and bounded, or messy and unbounded?
- Are device, input method, connection, and viewport controlled?
- Does the flow involve money, law, payroll, employment, privacy, safety, or another high-consequence domain?
- Does any important step happen outside this product?

## 2.2 DIAGNOSE — name the friction before the UI

Check the flow through these lenses:

### Attention
- Is the surface too crowded?
- Can the user find what matters?
- Is it obvious what is interactive, selected, current, or disabled?

### Effort
- Are there unnecessary steps or repeated questions?
- Does the user know what to do at the point of work?
- Are frequent/expert users slowed down by the same ceremony every time?

### Consequence and reach
- How expensive is a mistake?
- Can it really be reversed?
- Has the result already been seen, sent, published, notified, or shared?

### Reality
- Does the design survive long names, large values, missing fields, partial data, failure, slowness, stale data, offline behavior, and background work?
- Is an external step being falsely presented as if the product controls it?

### Access
- Can the task be completed with keyboard only?
- Does focus remain visible and predictable?
- Does the layout reflow at narrow widths and zoom?
- Does meaning survive without colour, hover, drag, or perfect vision?

### Language
- Does the UI use the user’s domain language rather than backend terminology?
- Are labels, actions, errors, dates, numbers, states, and outcomes unambiguous?

### Coherence
- Does the same job look and behave the same way elsewhere?
- Is the design using the Design System’s grammar, not only its colours and components?

### Proof and reality outside the screen
- Can the user tell what is actually done?
- Can the system distinguish “recorded now” from “became true earlier”?
- Can it represent disagreement between sources without inventing a winner?
- Can it issue a correction when something already sent becomes wrong?

## 2.3 DECIDE — friction must match risk

For each meaningful UX decision, know:

- what friction/problem it answers;
- what alternative was available;
- what cost this choice introduces;
- why the trade-off is proportionate to the consequence.

The default risk rule:

- **Reversible + private** → keep it fast; prefer direct action + undo.
- **Reversible but already seen by others** → state reach/audience before acting.
- **Costly or difficult to reverse** → make scope and impact explicit; preview where useful.
- **Irreversible / legal / financial / rights-affecting** → slow down deliberately; confirm the exact scope; use stronger confirmation when justified.

Do not spend confirmation friction on harmless actions and then leave dangerous ones one-click away.

## 2.4 SHAPE — build the complete flow

A feature is not complete because the default screen looks good.

Shape the actual sequence:

**entry → understanding → action → pending → result → recovery / next step**

Include the states and branches that materially affect whether a person can finish correctly.

---

# 3. Core UX rules

## 3.1 Attention and hierarchy

- Give each surface **one primary action**. Equal emphasis is reserved for a genuine fork with no preferred path.
- Spend visual emphasis on hierarchy, not decoration. Brand colour is not free attention.
- Before adding to a crowded surface, remove, combine, derive, or disclose progressively.
- Group information by the user’s mental model and work sequence, not by database tables.
- Keep the object being worked on identifiable throughout multi-step work.
- Mark current navigation/location using more than colour alone.
- Flatten unnecessary information-architecture depth before adding breadcrumb complexity.
- Search is for finding something the user can name. Filters are for narrowing an unfamiliar set.
- Persist shareable list state such as filters, sort, tab, and page when the product architecture allows it.
- Read-only information is **not** the same as a disabled control.
- Never make a whole row/card/list item silently perform navigation or a destructive action when an explicit affordance can carry it. Important actions need visible controls.

## 3.2 Reduce effort without hiding consequence

- Use progressive disclosure: common work stays visible; rare detail is one deliberate action away.
- Pre-fill sensible defaults only when being wrong is cheap and the default is visible and editable.
- Never ask for information the product already has unless it must be re-confirmed for a real reason.
- Derive values the system can calculate; do not ask the user to do arithmetic or maintain duplicated values.
- One user decision should normally map to one input. Avoid two fields that can contradict each other while expressing the same decision.
- Validate a field after the user leaves it when the rule can be checked locally; do not punish every keystroke.
- State required format before the user gets it wrong.
- Accept realistic pasted formats and normalize safely; refuse what cannot be parsed rather than silently corrupting it.
- Long work must survive interruption. Use drafts, partial save, or another explicit recovery mechanism.
- Teach next to the thing being used. A tour must not compensate for an interface that could have explained itself.
- Frequent users deserve efficiency only when frequency justifies the maintenance cost: keyboard routes, saved views, repeat-last, bulk actions, or command palette as appropriate.
- An export used for real work is a product capability with a stable, intentional contract, not an escape hatch.

## 3.3 Consequence, destructive actions, and commitment

- Prefer **Undo** over confirmation when reversal is real and no external effect has occurred.
- A confirmation must name the **object, quantity, ownership/audience, and meaningful consequence**. Never use generic “Are you sure?” as the only explanation.
- Use typed or stronger confirmation only for genuinely severe irreversible actions.
- For large or consequential bulk work, offer a dry run/preview before commit when feasible.
- Report bulk outcomes per item when partial success is possible. Never flatten partial failure into one generic success/failure state.
- Destructive actions must look and sit differently from routine actions.
- Guard critical “last one” conditions on the server: last administrator, only approver, only recovery path, etc.
- Submits that create records, move money, or have expensive side effects must be idempotent at the system level, not only visually disabled after click.
- Every multi-step modal/drawer/wizard has a visible exit and keyboard Escape behavior. Both exits must resolve unsaved work consistently.
- Before actions that notify, publish, share, send, or expose something, state the reach when it materially affects the decision.

## 3.4 Real data, failure, latency, and recovery

Design the failure states before declaring the happy path finished.

- Use the **worst realistic values**, not tidy demo data: longest plausible names, large counts, missing optional fields, zero, unknown, stale, invalid, and partial records.
- Truncation needs a policy and a way to access the full value when the full value matters.
- `0`, `unknown`, `not provided`, and `not applicable` are different states. Never collapse them into `-`.
- Numbers intended for comparison should align consistently and show units/currency.
- Large datasets need pagination, virtualization, or another intentional scaling strategy before performance becomes failure.
- Reject misread or ambiguous files loudly; never silently import the wrong interpretation.
- First-run empty and filtered/no-result states are different and need different explanations/actions.
- Loading behavior should match what is known:
  - final shape known → skeleton;
  - shape unknown + short wait → spinner/indeterminate indicator;
  - amount/stages known → progress/stage indicator.
- Avoid flashing loaders for fast responses. Acknowledge an action quickly, but do not create unnecessary flicker.
- Do not hold the whole page hostage to one slow region; render independent regions as they become available.
- Long-running work should move to a background job when appropriate and expose stage, completion, failure, and return path.
- Stale data must say it is stale, including the relevant “as of” moment.
- Never lose typed work because validation, refresh, timeout, reconnect, or a recoverable server error occurred.
- Warn before session expiry with enough time to act, and preserve work where possible.
- Offline or temporarily unsendable work must be explicitly queued, blocked, or recoverable. Never let the product go silent.
- Optimistic UI is allowed only when failure is cheap, rollback is defined, and the user can understand what happened.

## 3.5 External steps and truth over time

When the product does not own a step, do not fake ownership.

- Before handing the user to another actor/system, state **who acts, what they need to do, likely time/cost where material, what evidence comes back, and where it returns**.
- Never invent “in progress” for a process the product cannot observe. Say what is actually known.
- When a fact happened before it was entered, preserve the difference between **effective/event time** and **recorded time** when that distinction matters.
- If two sources disagree and no authority has resolved them, show the disagreement with source/date rather than silently choosing or averaging.
- Anything sent/published outside the product that can later become wrong needs a designed **correction/supersede** path. Do not silently edit history after recipients already have the old version.

---

# 4. Forms and input contract

Every meaningful form should satisfy the following unless the domain explicitly requires otherwise.

- Visible persistent labels; placeholders never replace labels.
- Required/optional convention is consistent and does not mark everything redundantly.
- Helper text explains **reason, format, consequence, or source** rather than repeating the label.
- Read-only values remain readable and copyable; disabled means temporarily unavailable, not “not editable here.”
- A disabled/unavailable action states the condition that will enable it when that information can be disclosed.
- Prefilled values show their provenance when provenance affects trust or freshness.
- Validation preserves input and points to the exact field/problem.
- Submit-time validation moves focus to the first actionable error and retains the user’s work.
- Server errors are translated into a human recovery path; technical reference codes may supplement, not replace, the message.
- Changing an upstream value that invalidates downstream work is explicit about what will be reset or lost.
- Multi-step forms preserve progress and always provide an exit.
- If early answers change later questions, use conditional/progressive structure rather than forcing irrelevant fields.
- If order does not matter, do not fake a numbered wizard.

---

# 5. Lists, tables, selection, and bulk work

- Use a table when records share comparable attributes; use cards when record shape or visual identity varies materially.
- Tables live within the Design System’s approved surface/composition; do not create one-off table chrome.
- Pagination is preferred when position, total, return, or specific-item work matters. Infinite scroll is for passive consumption without a target.
- Search finds known items; filters narrow sets. Support both only where both jobs exist.
- Selection must survive pagination/virtualization when the user reasonably expects a multi-page bulk action.
- “Select this page” and “Select all results” are different actions and must be labelled as such.
- Bulk action UI states the selected count and the aggregate/scope that matters before acting.
- Sorting has a deterministic tie-break when equal values occur.
- Narrow screens need an intentional alternative to a desktop-width table: prioritize columns, stack records, use detail disclosure, or change representation. Do not solve it with a second horizontal+vertical scrolling trap.
- Empty collection, no results, permission blocked, failed load, and partial data are separate states.

---

# 6. Component decision rules

Use the Design System’s implementation, but choose the component by the job.

| Decision | Choose first when | Choose second when |
|---|---|---|
| **Modal vs Drawer** | The task must finish before work behind it continues | Supporting context is useful while the page remains usable |
| **Modal vs Full page** | Small contained task, little branching, no need for URL/deep link | Complex validation, branching, long work, or a destination worth linking to |
| **Modal vs Inline disclosure** | A decision is required before continuing | Extra detail is optional and blocks nothing |
| **Tabs vs Stepper** | Peer views, any order | Required sequence with an end |
| **Tabs vs Accordion** | Peer content, normally one visible at once | Unequal sections or several sections may need to stay open |
| **Toast vs Inline alert** | Transient outcome that requires no response | Message belongs to a region or requires action/recovery |
| **Inline alert vs Banner** | Concerns one section | Concerns the whole page/account/workspace |
| **Tooltip vs Popover** | Brief supplementary text, nothing interactive | Several lines or interactive content |
| **Select vs Radio group** | Many options or comparison is unimportant | Few options that should be compared before choosing |
| **Multi-select vs Checkbox group** | Many options, usually few chosen | Small set worth seeing together |
| **Select vs Combobox** | Short fixed list | Long/remote list or typing is faster/allowed |
| **Switch vs Checkbox** | Change takes effect immediately | Choice is submitted with a form |
| **Table vs Card grid** | Comparable attributes repeat across records | Records differ structurally or visual identity matters |
| **Pagination vs Infinite scroll** | Position, totals, return, and task completion matter | Passive browsing/consumption with no target |
| **Skeleton vs Spinner vs Progress** | Skeleton: final shape known; Spinner: unknown short wait | Progress/stages: duration or work stages are knowable |
| **Wizard vs Long form** | Early answers change what comes later or sequence is meaningful | Fields are independent and can be completed in any order |
| **Inline edit vs Edit mode** | One low-risk value | Multiple interdependent values or expensive validation |
| **Undo vs Confirm** | The effect is genuinely reversible and private | It cannot be recalled, leaves the system, or has serious consequence |

Do not choose a component only because it already exists. Also do not invent a new component when an approved primitive or composition can solve the job.

---

# 7. Accessibility floor

Default target: **WCAG 2.2 Level AA**, unless product/legal requirements are stricter.

These are floors, not proof that the experience is good.

## 7.1 Visual and layout

- Normal text contrast: **≥ 4.5:1**.
- Large text contrast: **≥ 3:1**.
- Meaningful component boundaries/graphics: **≥ 3:1** where WCAG non-text contrast applies.
- Colour is never the only carrier of meaning.
- Focus must always be visible and not obscured.
- Text must survive **200% resize** without loss of content/function.
- Content must reflow without requiring two-dimensional scrolling at the WCAG reflow target, except where the content inherently requires it.
- Respect text-spacing overrides required by WCAG.
- Do not lock orientation without a real need.

## 7.2 Input and keyboard

- Every function is keyboard reachable.
- Focus must not be trapped accidentally.
- Opening/closing dialogs, drawers, menus, and similar layers manages focus intentionally and returns it sensibly.
- Every input has a visible label/instruction.
- Errors are identified in text and a correction is suggested when known.
- Do not ask users to re-enter information already provided in the same process without a legitimate reason.
- Status changes are announced without forcing focus to jump.
- Drag interactions have a non-drag pointer alternative.
- Important actions cannot depend on hover alone.

## 7.3 Targets and motion

- Pointer target: **≥ 24 × 24 CSS px**, or satisfy the WCAG target-spacing exception.
- Use larger targets where the context/device requires it.
- Honour reduced-motion preference.
- Do not use flashing that violates WCAG flash thresholds.
- Moving content that persists must provide the controls required by WCAG.

For complex widget keyboard behavior (combobox, tree, grid, carousel, date picker, etc.), follow the current **WAI-ARIA Authoring Practices Guide** in addition to this file.

For formal compliance or legal claims, verify against the original standard and local law; do not cite this summary as the law itself.

---

# 8. Responsive and input-context rules

- Design for the **context of use**, not a device label alone.
- Never solve a narrow screen by shrinking the entire desktop UI until it technically fits.
- Keep body/control text readable; use the Design System’s approved responsive typography instead of arbitrary smaller values.
- A layout owns one intentional scroll region. Avoid nested competing scroll containers.
- The focused element must never be hidden behind sticky bars, overlays, keyboards, or fixed controls.
- Nothing important may exist only on hover.
- Any drag route has a click/tap alternative.
- Touch density and pointer density may differ, but behavior and meaning stay coherent.
- Test realistic desktop, tablet/narrow, and mobile states when the product is expected to support them.

---

# 9. Functional copy requirements inside UX

Detailed voice and tone belong to the Copywriting Standard. This section only defines **functional UX requirements** that the UI cannot be considered complete without.

- Action labels state what happens; avoid generic `OK`, `Yes`, `Submit` when a specific verb/object is possible.
- Destructive commitment states the scope and consequence.
- Errors say **what happened, where, and what the user can do next**.
- Never blame the user for an error.
- First-run empty states explain what belongs here and provide one useful starting action.
- No-results states name the active query/filter and provide a recovery route.
- Success messages say what is now true, not merely “Success”.
- Disabled/unavailable actions explain the enabling condition where possible.
- Use one term for one concept across screens.
- Dates, times, currencies, units, ranges, zero, unknown, and estimates must be unambiguous.
- Test strings with realistic long content and at least one target localization where localization exists.
- Never assemble sentences from fragile fragments when plural/order changes by language.

When a Copywriting Standard is attached, it governs wording while these functional requirements remain mandatory.

---

# 10. State completeness contract

Do not ship a component or flow with only its resting appearance.

For every screen/feature, consider the applicable states below. Implement all that can materially occur.

## 10.1 Screen / page states

- initial/default;
- loading/pending;
- populated/normal;
- first-run empty;
- no search/filter results;
- partial data;
- stale data;
- permission blocked/read-only;
- recoverable failure;
- terminal failure;
- offline/reconnecting where relevant;
- success/completion;
- interrupted/resume state where work is long.

## 10.2 Control states

- default;
- hover where pointer exists;
- keyboard focus;
- active/pressed;
- selected/checked/current;
- loading;
- disabled/unavailable with reason when relevant;
- read-only;
- validation/error;
- success where persistent success has meaning.

## 10.3 Async action states

Every meaningful async action should have:

**idle → acknowledgement/pending → outcome**

and, where possible:

**failure → retry/recovery**

For batch work, include partial outcomes instead of pretending the batch is atomic when it is not.

---

# 11. Prototype and vibe-coding rules

When the requested output is a prototype or proof build, behavior must be real enough to demonstrate the UX decision.

- Controls that look interactive must work.
- A link to an unimplemented page/state does not count as flow coverage.
- Build the actual entry, outcome, and consequential failure/recovery for the requested scope.
- Preserve realistic input through validation and recovery.
- Use realistic data, not lorem or suspiciously tidy fixtures.
- Reuse the existing reviewed product shell and Design System primitives unless the task explicitly requires changing them.
- Do not rebuild a good reviewed baseline from scratch merely because new scope was added. Extend it.
- Keep one screen / one truth. Entry-point context is a parameter, not a reason to duplicate divergent versions of the same destination.
- If a behavior cannot be honestly implemented or verified in the prototype, state the limitation. Never present a static imitation as functioning proof.
- Do not silently “fix” a Design System defect inside one feature. Report it as inherited DS debt and use the safest documented fallback.

---

# 12. Trust and non-deceptive behavior

These are floors, not optional patterns.

- Disclose material cost and binding conditions as early as the product knows them.
- Leaving/cancelling must not be intentionally harder than joining/starting where the user has a right to leave.
- Consent is explicit, separated by purpose, and not pre-selected by default where consent law requires genuine choice.
- Urgency, scarcity, social proof, and similar pressure signals must reflect real, checkable data.
- Do not perform consequential actions on the user’s behalf silently. State what was done and provide a route back where possible.
- Decline/cancel choices must not shame or manipulate the user.
- Do not claim a level of completion, automation, verification, or certainty the product cannot support.

---

# 13. UX Done Gate

Before handing over work, check every applicable line. Fix failures instead of merely listing them.

## Flow and intent

- [ ] The user goal and business rule are preserved.
- [ ] Proposed UI from the requirement was evaluated rather than copied blindly.
- [ ] The flow has a clear entry, primary path, outcome, exit, and recovery path.
- [ ] One primary action exists per surface unless the surface is a genuine equal fork.
- [ ] The amount of friction matches the consequence and reach of the action.

## State and data reality

- [ ] Loading, empty/no-results, error, disabled/read-only, and success states are implemented where they can occur.
- [ ] Long/missing/zero/unknown/large data does not break the layout or meaning.
- [ ] User input survives recoverable failures and interruption where expected.
- [ ] Async/bulk actions expose pending and partial outcomes honestly.
- [ ] Stale/external/unverified facts are labelled instead of presented as fresh certainty.

## Interaction

- [ ] Every visible control has a real behavior.
- [ ] Destructive actions are explicit, separated, and guarded proportionately.
- [ ] Modal/drawer/wizard flows always have a consistent way out.
- [ ] Search/filter/selection/pagination behavior survives the use case it claims to support.
- [ ] The interface does not depend on hover, drag, or colour alone.

## Accessibility and responsive behavior

- [ ] Keyboard alone can reach and operate every action.
- [ ] Focus is visible, managed, and never accidentally trapped or obscured.
- [ ] Labels, errors, and dynamic status are accessible in text/semantics.
- [ ] Applicable contrast and target-size floors are met.
- [ ] The layout survives narrow viewport / zoom / text resizing without competing scroll regions.
- [ ] Reduced motion is honoured where motion exists.

## Design System and coherence

- [ ] Real Design System components/tokens/bindings are reused before composing anything new.
- [ ] No arbitrary visual values or one-off pattern drift were introduced.
- [ ] The same job behaves consistently with the rest of the product.
- [ ] Any Design System gap or inherited defect is reported rather than silently patched and forgotten.

## Language and proof

- [ ] Actions, errors, outcomes, dates, numbers, units, and states are unambiguous.
- [ ] No placeholder/lorem copy is used as final product content.
- [ ] Anything not actually implemented or verified is labelled as such; it is never reported as a pass.

A handoff is not “done” while a blocker remains in this gate.

---

# 14. Common failure patterns to catch early

Treat these as strong signals that the UX is not ready:

- a page where the user cannot tell where they are;
- a dead disabled action with no reason;
- a placeholder used as the only label;
- validation shown only after the whole form is submitted;
- input lost after error/refresh;
- one generic empty state for both “nothing exists” and “filters found nothing”;
- raw server/HTTP errors shown to users;
- stale data presented as current;
- destructive and routine actions given equal treatment;
- generic confirmation that does not state impact;
- irreversible action available in one accidental click;
- selection lost across pages when bulk work implies otherwise;
- ambiguous “Select all”;
- desktop table squeezed into mobile unchanged;
- status conveyed only through colour;
- hover-only actions;
- invisible focus;
- a nested scroll trap;
- a loader that blocks unrelated content;
- session expiry that destroys work;
- buttons labelled `OK`, `Yes`, or `Submit` where the consequence can be named;
- two names for the same concept;
- literal visual values bypassing the Design System;
- the same job solved differently on adjacent screens without a reason;
- a sent/published record edited silently instead of superseded;
- an external process represented as if the product can observe it;
- a prototype control that visually exists but does nothing.

---

# 15. What this file deliberately does not replace

This standard is intentionally bounded.

It does not replace:

- the E-Systems Design System and its component/token contracts;
- the E-Systems Copywriting Standard;
- current WCAG source text or WAI-ARIA APG when implementing/auditing accessibility;
- platform guidance for native iOS/Android;
- local accessibility, employment, payroll, privacy, or consumer-protection law;
- domain policy decisions that only product/legal/business owners can make;
- usability research when evidence is needed from real users.

For legal/compliance claims, use the original authoritative source. This file is an execution standard, not a substitute for the law.

---

# 16. Operating summary for AI

If you remember only this section while building:

1. **Understand the job before choosing the component.**
2. **Preserve business truth; treat proposed UI as reviewable unless explicitly locked.**
3. **One primary action per surface.**
4. **Common work stays easy; dangerous work becomes deliberately explicit.**
5. **Do not ask twice, do not make people calculate, do not lose their work.**
6. **Design failure, empty, loading, permission, and recovery states — not just happy path.**
7. **Use realistic messy data.**
8. **Keyboard, focus, reflow, contrast, targets, and non-colour meaning are floors.**
9. **A component must fit the job; the Design System decides how it looks.**
10. **Actions that reach other people must state that reach.**
11. **External steps and stale/divergent records must tell the truth.**
12. **A prototype is proof only when the behavior actually works.**
13. **Use real DS primitives; do not create visual drift to solve a UX problem.**
14. **Never call something verified, complete, or successful when it is not.**
15. **Run the UX Done Gate before handoff.**

