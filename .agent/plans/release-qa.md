# Remaining local release QA

## 1. Purpose and outcome

Finish remaining checks that can run on this Windows workspace after 8c891fa,
without redoing the accepted design or deploying. Exercise installed Edge and
add local automated accessibility coverage; resolve discovered defects. Separate
completed evidence from physical-device, screen-reader and operator-controlled gates.

## 2. Existing behavior and files

Repository starts clean at 8c891fa; all MVP features and three UX passes are complete.
Read AGENTS, docs/00,01,03,04,05,06,09,12,16, status, implementation and verification.
Existing Playwright has Chromium/Firefox/WebKit, native D1 isolation, private-artifact
protection and 51 cases. Actual Edge is installed. Review Layout, PageIntro, ProductStory,
forms and dashboard states. Use tests/e2e and a separate Edge config derived from
the existing config, not a replacement or skipped existing engine.

## 3. Security invariants

No cryptographic protocol, key/recovery handling, API, database, authorization,
expiry/deletion, rate-limit or security-header changes. No runtime dependency,
remote asset or analytics. Accessibility inspection is test-only, using pinned
local axe-core; no scan runs in a real user's app. Summarize results inside the
test browser, returning rule IDs/counts only, never DOM or secret text. Existing
assertion artifact scrubber remains. Never use developer profiles as test fixtures.

## 4. Implementation steps

1. Audit remaining notes and distinguish local work from external/manual gates.
2. Pin one dev-only accessibility engine and create a privacy-safe test helper.
3. Scan public routes, setup/recovery/share/sender/inbox/settings/restore/archive
   states in light/dark and phone/desktop; include open controls and error states.
4. Fix actual accessibility defects conservatively, preserving the design and flows.
5. Run installed Edge with all existing/new journeys through an optional explicit
   test:edge command; keep three-engine check portable and mandatory.
6. Run full check, Edge and final privacy/diff review. Document precise manual
   phone/assistive-technology and production acceptance steps; don't claim those ran.
7. Update status/verification/implementation, commit local completion, check clean tree.

## 5. Data/schema changes

None.

## 6. API changes

None.

## 7. Tests

Existing crypto/unit/D1/security suite, full three-engine E2E including accessibility,
actual installed Edge, strict TS/lint/format, production build, Worker dry run,
privacy/secret scan and dependency audit. New helper has no HTML/text diagnostics.
Test instrumentation does not weaken or alter production CSP; existing injection
test remains. Automated findings are not complete WCAG or screen-reader certification.

## 8. Rollback

Revert this QA/presentation/documentation commit; no migration or deployment.

## 9. Acceptance

All locally executable checks pass and defects fixed. Edge evidence recorded.
No secret-bearing artifacts or runtime audit dependency. Exact unresolved physical
device/account gates are recorded truthfully. No optional Phase 9 expansion or deployment.

## 10. Progress

- 2026-10-04: Audited clean current state and completed-roadmap evidence. Located
  installed Edge; physical mobile/AT and production accounts are not accessible.
- 2026-10-04: Pinned dev-only axe-core 4.13.0 with no runtime dependency. Initial
  Chromium public/private scans pass. Found stale light/dark theme-color metadata
  in index.html from the earlier palette; aligned it to current tokens and added
  a browser regression. Restarted the verification gate to cover the final assets.
- 2026-10-04: Full npm run check exits 0: 113 Vitest tests and 57 mandatory
  Chromium/Firefox/WebKit cases; build, dry run, privacy and audit pass with zero
  vulnerabilities. Local migration listing has no pending entries.
- 2026-10-04: First Edge invocation timed out during server startup, before any
  browser test ran. An isolated server diagnostic returned healthy 200; stopped it
  and reran Edge without concurrent Wrangler work. No assertions, retries or
  startup timeout were changed.
- 2026-10-04: Sequential installed-Edge gate exits 0 with 19 cases, version
  154.0.4258.53. All four browsers cover 272 accessibility states, no violations.
  Updated status, implementation, security review and final verification; docs/20
  records precise unresolved physical-device/AT and operator production checks.
  Reviewed unchanged security-sensitive paths and unchanged application JS/CSS hashes;
  one dev-only dependency, no runtime asset or secret exposure. Final formatting,
  privacy/diff checks and a clean commit complete this local pass.

## 11. Decisions

- Preserve the user's prior no-deployment instruction. “Complete remaining work”
  authorizes local release QA, not a cloud deployment or optional crypto/product expansion.
- Add axe-core only as a pinned dev dependency, using existing Playwright rather
  than adding an adapter/runtime package. Inspection stays local and outputs no DOM.
- Edge is an explicit additional command because other development machines may
  not have it installed; the required three-engine gate remains intact.
