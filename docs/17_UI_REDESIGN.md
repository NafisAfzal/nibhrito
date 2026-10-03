# Nibhrito UI redesign

Dedicated local redesign of 1.0.0-rc.1, 2026-10-03. No deployment.

This is the accepted ab5dc7d baseline, preserved by subsequent refinements. See
docs/18_PRODUCT_INTENT_UX.md and docs/19_FINAL_MOBILE_POLISH.md for the positive
product story and latest mobile/visual verification; the results below are historical.

## Baseline audit and redesign plan

All 12 public routes checked at 360, 390, 768, 1280 and 1440 px; owner screens at
360, 768, 1280 and 1440. Setup/recovery, full link/QR, empty/populated inbox,
settings, sender and success inspected with disposable fixtures. 64 baseline layout
checks found no horizontal overflow, but visual hierarchy and interaction clarity
were poor. Other failure paths were reviewed in source and existing security E2E.

| Before                                                                     | After                                                                          | Why                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| src/app/App.tsx:40 — oversized abstract headline, no product narrative     | Clear receive/share/read narrative, three steps and honest privacy explanation | First-time comprehension              |
| src/styles.css:91 — raw sage colors and competing overrides                | Semantic indigo/neutral light/dark system                                      | Consistent states and contrast        |
| src/features/profile/Dashboard.tsx:134 — long page with QR above inbox     | Distinct Inbox, My link, Profile and Security destinations                     | Action hierarchy and mobile usability |
| src/features/profile/Setup.tsx:109 — technical onboarding without progress | Two-step profile/recovery flow                                                 | Explain consequence before mechanics  |
| src/features/send/Send.tsx:183 — technical byte copy and weak reassurance  | Focused composer, concise trust copy and explicit size error                   | Clear private submission              |
| src/features/inbox/Inbox.tsx:225 — empty state without an action           | Useful sharing route and calm message reading                                  | Empty does not mean broken            |
| src/features/profile/Settings.tsx:181 — security mixed with profile edits  | Recovery/device/archive and deletion hierarchy                                 | Reduce cognitive load                 |
| src/features/legal/Legal.tsx:30 — document and controls equally weighted   | Readable document layout and consistent policy navigation                      | Keep content central                  |

Direction: quiet personal space, deep indigo actions, lavender supporting surfaces,
teal privacy cues, warm off-white and slate typography. No decorative gradients,
fake trust badges, statistics or testimonials. Responsive editorial landing and
focused application pages. System fonts support English and Bangla without requests.

## Verification and handoff

All public and owner destinations now share a semantic design system. The landing,
setup/recovery, My link, sender/success, inbox/message, profile, security/device,
restore/archive, legal/contact, unsupported-browser and error pages are redesigned.

Semantic light/dark CSS tokens define surfaces, foreground, border, brand, focus,
success, warning and danger. Consistent type, spacing, radii, shadows, containers,
forms and button variants replace competing overrides. Local SVG Icon, PageIntro,
LoadingState and Notice primitives support the existing semantic native controls;
Share is a distinct destination. Profile accent choices remain, limited to identity
decoration. There is no new package, font, remote asset or analytics request.

Navigation uses native links with public `view`/`space` parameters. Multi-profile
selection survives navigation; ownership remains independently authenticated by the
API. The mobile menu exposes expanded state and closes on Escape with focus return.
Current destinations are announced. Full links remain available in a labelled field;
Copy copies the complete verified fragment, and unavailable clipboard access opens,
focuses and selects the complete field for manual copying. QR stays locally generated.

Setup explains two steps and requires the original recovery-save acknowledgement.
Recovery/device explanations state consequences without implying operator recovery.
Sender text explains browser encryption and anonymity limits; byte limits remain
honest for Bangla/emoji. Rate-limit feedback keeps the draft and retries the identical
envelope. Empty inbox links directly to sharing. No unsupported unread state or
sender metadata is invented. Deletion stays destructive with native confirmation.
Legal policy text is unchanged.

195 post-redesign layout checks cover five widths, both color schemes, public and
owner states, complete URLs, QR, recovery, archive, long English/Bangla and sender
error/success. No horizontal overflow found. A final 40-check state pass at four widths in light/dark
also covers unavailable crypto, profile accent/save, inbox loading/network failure
and authentication errors, with no overflow. Failures use the shared Notice.
Private text and codes are masked in ignored visual artifacts; disposable profiles
were removed. Explicit form labels,
associated errors/hints, semantic landmarks, heading order, focus, touch targets,
status announcements and reduced-motion behavior were checked. Two contrast tests
check light/dark token pairs against WCAG text and input/focus thresholds.

Original security assertions remain. Added three-engine coverage exercises mobile
menu keyboard behavior, multi-profile routing, responsive forms, complete copy,
deletion cancellation, oversized drafts and same-envelope rate-limit retry. A forced
failure probe closes an existing Playwright assertion-DOM artifact gap; traces,
video and screenshots remain disabled. The final npm run check passes: 113 tests in
18 Vitest files, 42 browser cases (14 per engine), strict TS/lint/format/privacy,
production build, Worker dry run and audit with zero vulnerabilities. No skips,
retries or weakened assertions. Secondary WebKit windows wait for their initial
load before navigation. FINAL_VERIFICATION.md and PROJECT_STATUS.md record the gate.

Crypto modules, key storage, shared envelopes/schemas, API client and Worker,
authorization, migrations, expiry/deletion semantics, security headers/CSP and legal
policy bodies are unchanged. This is an implementation self-review, not an independent
security or WCAG certification. Real Safari/iOS, assistive technology, OS font
availability and second-device recovery remain manual release checks.
