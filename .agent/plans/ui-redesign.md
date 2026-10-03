# UI/UX redesign ExecPlan

## 1. Purpose and user-visible outcome

Replace the release candidate's prototype presentation with a calm consumer product.
Make first-time setup, private sending, reading, sharing and recovery understandable
without cryptographic knowledge. Complete locally; do not deploy.

## 2. Existing behavior and relevant files

Read AGENTS, status, implementation, security review, product UX, normative protocol,
data/API, testing, roadmap and plan instructions. Reviewed all frontend features and
five existing browser test files. Baseline runs on the real local Worker at 8787.
64 layout checks cover 12 routes at 360/390/768/1280/1440 and owner states. Recovery
screenshots are masked; private-message screenshots are masked. Audit fixture deleted.
Public baseline images remain ignored in .wrangler. Findings are in docs/17.

## 3. Security invariants that must remain true

Crypto, shared schemas, storage, Worker, migrations and API interfaces remain intact.
No remote assets, dependencies, analytics, diagnostics, secret exports or CSP changes.
Preserve verified fragments, same-origin encryption, saved-code gate, nonextractable
IndexedDB keys, ephemeral plaintext, auth-derived ownership and native confirmations.
Never put private search/draft/code in URLs. Public dashboard destination only uses
a view and public profile-slug query parameter. Leaving a destination unloads
private content as before. Those parameters cannot grant ownership or authorization.

## 4. Exact implementation steps

1. Record baseline audit and design decisions before implementation.
2. Define semantic light/dark tokens, type/spacing/layout scales and local SVG icons.
3. Rebuild public shell, landing narrative, common page/status/form primitives.
4. Guide setup with two steps, associated hints, explicit recovery warning.
5. Give dashboard Inbox/My link/Profile/Security destinations with real links.
6. Share complete link/QR; progressive disclosure and clipboard fallback selection.
7. Refine sender, success/errors, byte boundary feedback; retain envelope retries.
8. Refine reading, expiry, filtering, empty states and destructive actions.
9. Separate public profile settings from recovery/device/backup/deletion actions.
10. Restyle restore/archive, legal documents, unsupported browser and errors.
11. Expand browser regression coverage, responsive/contrast/keyboard checks.
12. Visual QA, full verification, security diff review, docs/status and commit.

## 5. Data/schema changes

None. Theme identifiers sage/rose/ocean retain their meaning; accents are limited
to profile identity decoration instead of overriding destructive/primary controls.

## 6. API changes

None. No extra tracking, read receipts, unread states or invented metadata.

## 7. Test plan

Retain every existing privacy/crypto/auth test assertion while updating UI navigation
locators. Add public and owner responsive checks, complete clipboard content, form
hint associations, destination navigation and destructive cancellation coverage.
Run formatting/lint/strict TS, 113 unit/integration tests, production build, all three
browser engines, privacy scan, Worker dry run and dependency audit. Inspect generated
screens at five widths, light/dark/reduced motion, long English/Bangla and full URLs.
No secret-bearing test snapshots or network bodies saved.

## 8. Rollback/migration notes

No migration needed. Revert the dedicated UI commit to restore the previous UI.
Existing profiles, keys, links and encrypted archives continue to work unchanged.

## 9. Acceptance criteria

Every user-facing destination uses the same design system, is keyboard usable and
has a clear primary action. No overflow at target widths. No legal/security meaning
weakened. Complete create/save/share/send/decrypt/delete/expire/restore/archive flows
and original adversarial tests pass. Clean committed tree and accurate documentation.

## 10. Progress log

- 2026-10-03: baseline audit, required reading, guidelines and route/layout review done.
- Implemented all destinations, shared primitives, semantic light/dark tokens,
  human microcopy, native navigation and two-step onboarding.
- Visual pass: 195 layout checks at five widths/light and dark, no overflow.
  Sensitive screenshot regions masked. Long Bangla/English, error, success,
  recovery, QR, full links and archive reading checked; fixtures deleted.
- Final state pass: 40 additional checks at four widths/light and dark inspect
  unavailable crypto, profile accent/save feedback, inbox loading/network error
  and failed authentication. No overflow; disposable profile deleted. Authentication
  failures now use the same Notice primitive in inbox and archive reading.
- Added contrast checks and four browser cases per engine; retained all original
  cryptographic/privacy/authorization assertions.
- Final npm run check exits 0: 113 tests/18 files, 42 browser cases (14 each engine),
  strict TS/lint/format/privacy, production build, Worker dry run and audit (0
  vulnerabilities). Failure-artifact probe passes; no skips/retries or weaker
  assertions. Migration list has no pending entries. Security/privacy diff reviewed.
- Documentation/status updated. All implementation and acceptance steps complete;
  this plan accompanies the dedicated redesign commit. No production deployment.

## 11. Decisions and surprises

Baseline CSS has multiple competing layers and raw color overrides. Replace it rather
than add another override layer. Desktop page-heading lacks layout, causing stacked
actions; QR float drives empty space. Full private dashboard is an excessively long
single page. Separate destinations via existing pathname plus public view query.
Use native system fonts and bundled SVGs; no new dependency is necessary.

Native destination links intentionally unload decrypted content. A public `space`
parameter preserves multi-profile selection across reload, back and destination
navigation. Only locally held owner credentials, checked by the API, confer access.
Native confirmations remain for deletion and forgetting; no new modal framework.

Visual QA found that an implicit label around a controlled textarea incorporated
its current value into its accessible name. An explicit label/id association fixes
editing after oversized and rate-limited drafts; regressions retain the same
encrypted envelope on retries.

The existing rate-capacity fixture made 2000 individual D1 batch statements and
occasionally exceeded its timeout. One parameterized recursive INSERT seeds the
same rows and fires every trigger; assertions and timeouts remain unchanged.

Adversarial review found Playwright's existing NO_COPY_PROMPT flag does not suppress
failed assertion DOM snapshots. An automatic fixture strips only errorContext before
artifact writing; an intentional-failure probe verifies no private DOM in output or
artifacts. No application protocol or API change is involved. The fixture dependency
uses the public browserName to satisfy Playwright's destructured dependency contract.

Windows WebKit intermittently canceled the first navigation in newly opened
secondary windows. Waiting for their initial about:blank load before navigation
made the focused lifecycle, recovery and sender set pass. All original assertions,
timeouts and zero-retry policy remain intact; final full-suite acceptance is required.
