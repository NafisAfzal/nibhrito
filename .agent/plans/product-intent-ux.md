# Product-intent UX upgrade

## 1. Purpose and user-visible outcome

Help a first-time visitor recognize Nibhrito as a welcoming space for honest, constructive feedback through examples, connected visual flows and clear actions. Carry the same explanation into setup, sharing, sending, inbox and recovery. Keep the established brand and every working security behavior.

## 2. Existing behavior and relevant files

Baseline is clean commit `ab5dc7d`, local release candidate 1.0.0-rc.1. Read AGENTS, current status, implementation/security review, UX/redesign documentation, architecture/protocol/API/testing documentation and frontend/test sources. Started the actual Worker at http://127.0.0.1:8787. The existing masked browser audit passed 195 responsive/state checks (360, 390, 768, 1280, 1440px; light/dark), with no overflow and its disposable profile deleted.

The homepage's abstract sealed note explains privacy more than purpose. Its steps and privacy facts depend on captions. There is no About route. Setup, sharing and recovery explain their consequences mostly in paragraphs. Shared icons, semantic tokens and accessible controls already exist in src/components, src/styles.css and src/app/copy.ts; preserve and extend them. Behavioral code in features, crypto, storage, lib, shared and worker already works.

## 3. Security invariants

No crypto, API, database, expiry, authorization, recovery, rate-limit, CSP or storage changes. No new dependencies, remote assets, fonts, trackers or telemetry. Preserve full verified-link copying and key validation; no plaintext persistence or upload. Never expose recovery material except the existing deliberate setup/form flows. Illustrations contain explicitly labelled fictional examples, never live messages. Existing private browser failure artifacts remain suppressed and visual QA masks all sensitive fields.

## 4. Exact implementation steps

1. Record the audit and resolve the old confession-oriented product definition using the user's explicit clarification.
2. Extend the local icon vocabulary and add reusable semantic step/privacy/recovery flows with captions, not icon-only meaning.
3. Replace the abstract hero with a labelled question-to-feedback example. Add use cases, connected how-it-works, openness, privacy and respectful-use sections.
4. Add a discoverable public /about explanation, without storage, encryption or account prerequisites.
5. Add concise visual guides to onboarding, sharing, sender/success, empty inbox, security, restore and local backup. Preserve handlers and critical warnings.
6. Add supplementary explanations to security/acceptable-use supporting pages without changing legal policy meaning.
7. Warm the existing neutral surfaces, use teal for trust, and implement horizontal/vertical responsive flows. Preserve native dark preference and reduced motion.
8. Add meaningful UI/browser assertions, run visual QA and the entire gate, inspect the security/privacy diff, update handoff documents and commit.

## 5. Data/schema changes

None. No migrations.

## 6. API changes

None. /about is a static frontend route served by the existing SPA.

## 7. Test plan

Formatting, lint, strict TypeScript, unit/integration/crypto/contrast tests, privacy checks, production build, Worker dry run, vulnerability audit and Chromium/Firefox/WebKit E2E. Preserve all current security assertions; add visual-story/public-route and responsive accessibility checks. Inspect all important light/dark routes and native sensitive flows with secrets masked. Verify no horizontal overflow, readable Bangla/English, diagram order, navigation, full link copying and feedback states.

## 8. Rollback/migration notes

Revert this presentation/documentation commit. No data migration, protocol change or external service operation is involved.

## 9. Acceptance criteria

Within a quick scan, examples and arrows explain ask/share/respond/read; privacy is explained as browser encryption, encrypted storage and recipient-key reading. Positive purpose and respectful use are visible. All critical journeys still work, all verification passes, docs/status are accurate, working tree is committed and clean. No deployment.

## 10. Progress log

- 2026-10-03: Audited current commit, documentation, source, tests and running application. Fresh baseline visual audit passed 195 checks.
- 2026-10-03: Implemented the focused upgrade across all priority flows, added /about and reusable local visual explanations. Backend/crypto/storage/contracts are unchanged. Resolved the original confession wording using the user's explicit product direction.
- 2026-10-03: Visual QA passed 224 main checks and 40 final state checks; no overflow. Fixed wrapping refresh action and a redundant guidelines self-link. All disposable visual fixtures deleted; secrets/content masked.
- 2026-10-03: Full npm run check passed: 113 tests/18 Vitest files; 48 browser cases across all three engines, no skips/retries; type/lint/format/privacy, build, Worker dry run and zero audit vulnerabilities. Original security assertions retained; two new cross-engine journeys and existing owner assertions cover the explanations. Security/privacy diff reviewed without new Critical/High findings. Updated status, implementation and final handoff; this plan accompanies the completed upgrade commit.

## 11. Decisions and surprises

- The current design is already responsive and consistent. This phase improves communication rather than restarting the brand.
- The original master-plan definition still includes “confession”. The user explicitly defines the product as feedback and honest expression. Update only that product definition; retain legal, technical and historical protocol material.
- Use inline SVG/CSS and static example content; no bitmap generation or icon dependency is needed.
- Keep the existing Terms age requirement: the positive product direction changes purpose/visual tone, not legal eligibility or a guarantee of safety.
- Keep browser-native dark preference; welcoming light-mode design does not justify removing a user's preferred accessible theme.
- Empty inbox search/filter controls only disappear with no messages/cursor/active filters, so filtering can always be cleared.
