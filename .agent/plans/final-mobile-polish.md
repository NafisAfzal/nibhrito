# Final product-design and mobile polish

## 1. Purpose and outcome

Refine the accepted consumer redesign (ab5dc7d) and product-intent upgrade (8526c06), without replacing either. A visitor should recognize thoughtful feedback, reduced social pressure, private delivery and the next action from the composition before reading paragraphs. Improve phone ergonomics across 320, 360, 375, 390, 412, 430px; tablet/desktop at 768, 1024, 1280, 1440px.

## 2. Existing behavior and relevant files

Repository starts clean at 8526c06. Read AGENTS, status, implementation, UX/redesign/intent documentation, security/protocol/API/testing references, components, tokens, feature markup and browser tests. Inspect ab5dc7d rather than resetting it. Actual local Worker runs at 127.0.0.1:8787; masked baseline inspection includes all public and owner flows, short phones, tablet and desktop. Existing ProductStory/Icon/PageIntro primitives, native navigation and two-step setup are retained.

## 3. Security invariants

No cryptographic, storage, backend, authorization, API/schema, database, rate-limit, expiry/deletion, CSP or security-header changes. No plaintext/secret logging or persistence, no remote assets/dependencies. Copy and QR retain the entire verified URL. Recovery remains deliberate and explicit, with the saved-code acknowledgement and loss warnings intact. Diagrams use labelled fictional examples, never actual messages. Preserve privacy-safe test artifacts and every security assertion. No deployment.

## 4. Implementation steps

1. Record the audit in docs/19_FINAL_MOBILE_POLISH.md using Before/After/Why.
2. Refine the existing hero with person/conversation symbols and encrypted-delivery cues; add a clearly qualified identified-conversation/private-response comparison on Landing and About.
3. Reduce repeated public prose, make practical use cases skimmable and retain connected diagrams and culture cues.
4. Add semantic information/sky tokens, calm slate dark surfaces, success confirmation and distinct trust/info/recovery/danger treatments. Extend contrast coverage.
5. Compact the onboarding overview without hiding critical recovery warnings; reduce sender guidance to a clear line so the composer dominates.
6. Add recognizable expiry/delete/copy/information symbols and visible message expiry from existing metadata. Preserve all actions/handlers.
7. Improve short-phone gutters, card padding, mobile actions, diagram spacing and keyboard-height layout behavior. Keep captions legible and semantic order unchanged.
8. Add browser regressions for 320px touch/focus/short-height/long-script/long-link cases. Expand public/owner responsive checks to all ten widths.
9. Inspect native critical journeys and error/loading/network/rate/auth states with masked private fields. Run full npm run check and security diff review, update handoff docs, create one commit and confirm clean state.

## 5. Data/schema changes

None. Visible expiry uses the existing server expires_at; no new metadata or unread status.

## 6. API changes

None. Existing /about and public routes remain.

## 7. Tests

Full formatting/lint/strict TS, 113 current Vitest cases including crypto/D1/security and expanded contrast, production build, Worker dry run, privacy scan and dependency audit. Chromium/Firefox/WebKit E2E preserves the entire native lifecycle and assertions. Expand the responsive matrix to all requested widths, touch targets, real full verified link and Bangla/English/mixed text; emulate touch and a reduced-height viewport with focused fields. This emulates keyboard space, not physical OS keyboard behavior. Real phone/Safari/assistive technology remains a manual release gate.

## 8. Rollback

Revert the presentation/test/documentation commit. No migration or external action.

## 9. Acceptance

Positive purpose and social-pressure value are visible; sender composer and setup action remain primary. All ten widths and both themes fit. Diagrams and notices have text equivalents, no color-only meaning. All existing journeys/security invariants pass. Accurate docs, one commit, clean tree, no deployment.

## 10. Progress

- 2026-10-03: Reviewed clean current commits, documentation, tokens and sources. Started actual Worker and expanded masked baseline audit before implementation.
- 2026-10-03: Baseline audit completed 268 checks with zero overflow and disposable fixture deletion. Implemented the conversation comparison, semantic sky/slate palette, compact setup, copy/expiry/delete symbols and sender delivery guide.
- 2026-10-03: Expanded all responsive regressions to ten widths. New native 320px touch/short-height journey passes Chromium, Firefox and WebKit, including long-script drafts, network retry, complete copy and cancelled/confirmed deletion. Contrast checks pass. Full gate and final masked visual review in progress.
- 2026-10-03: Full npm run check exits 0: 113 Vitest cases in 18 files, 51 browser cases (17 per engine), no retries/skips; lint/format/strict TS/build/dry run/privacy/audit pass, zero vulnerabilities. Both migrations applied, none pending.
- 2026-10-03: Final masked QA: 477 main + 100 state checks, all ten widths/light/dark, no overflow; clipboard fallback and focused 320×360 composer included. Reviewed screenshots after connector fix, all disposable fixtures deleted. Security diff review confirms unchanged sensitive paths, legal bodies and dependencies. Implementation, acceptance and handoff complete. This plan accompanies the single final polish commit; no deployment or further local feature work remains.

## 11. Decisions

- Preserve the current brand, native controls, verified link and existing visual guides; refine specific gaps rather than adding another template.
- Do not claim judgment or retaliation is eliminated. Depict hesitation as a possible experience and privacy as room for candid feedback, with anonymity limits visible.
- Preserve legal age requirements and policy meanings. Positive/non-adult-themed does not mean eligibility changes.
- No animation or dependency is necessary for comprehension. Use existing local SVG language and semantic CSS.
- Compact overview connectors need higher specificity than the later compact mobile flow rules; fixed the observed 320px arrows below captions. Full-length phone diagrams remain vertical; short setup/recovery overviews retain legible horizontal symbols/captions.
