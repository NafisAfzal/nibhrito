# Nibhrito Project Status

Updated 2026-10-05. This file, IMPLEMENTATION.md, SECURITY_REVIEW.md and the phase
ExecPlans provide the handoff; no chat history is needed.

## Current state

All locally executable MVP work is complete: Phases 0–7 and Phase 8 deployment
preparation. The complete UI/UX redesign, product-intent upgrade and final mobile/
visual polish are implemented and verified. Remaining local accessibility and
installed-Edge release checks are complete. Phases 1–8 and all three UX passes are recorded
in reviewable commits, each with its plan, audit and verification handoff.
Package is 1.0.0-rc.1. No Cloudflare provisioning, production secret/configuration,
deployment or v1.0.0 tag has occurred. External production acceptance remains pending.

GitHub publication preparation follows the verified e93fc70 baseline. Public-source
and full-history review found no real secrets or unwanted private/generated files.
The README, portable start guide and documentation index now provide the developer
entry point; security/contribution guidance, templates, read-only CI and weekly
dependency updates are prepared. The publication gate passes 113 Vitest tests,
57 portable browser cases and 19 installed-Edge cases, plus the new native audit
regression test. The complete history is published at
[NafisAfzal/nibhrito](https://github.com/NafisAfzal/nibhrito), public with main as the
default branch. Free security protections/private reports and weekly dependency
automation are verified. Initial CI failed because its global Wrangler log setting
suppressed structured D1 test output; a CI-only correction is being verified.
See [publication evidence](docs/21_GITHUB_PUBLICATION.md).
No license is selected. Application code, protocol, API, database and locked
dependency versions have no changes in this phase.

## Implemented

- Strict native browser P-256 ECDH / HKDF-SHA-256 / AES-256-GCM v1, canonical
  envelopes/AAD, native interoperability fixtures, malformed/tamper/wrong-key failures,
  Unicode/Bangla and complete 4 KiB boundaries. Protocol algorithms are unchanged.
- Recipient setup, independent random owner token/verifier, encrypted recovery bundle,
  saved-code confirmation, nonextractable IndexedDB key, second-browser restore.
  No email/password account, plaintext fallback or operator decryption/reset.
- Verified complete fragment link, version/profile/key/fingerprint checks and local
  QR. Browser encryption before anonymous submission; safe exact-envelope retries.
- Authenticated cursor inbox, local-only decryption/search/mood filter, inert text,
  corruption/error/empty/loading states, expiry and deletion. Public settings,
  retention choices, pause/resume, forget-device and permanent profile deletion.
- Local encrypted backups and archive reader using existing recovery/crypto; no
  uploads, raw key export or plaintext export. Strict version/bindings/4 MiB/500 rows.
- Worker API with strict schemas, streamed byte caps, same-origin checks, HTTPS-only
  production APIs, auth-derived SQL scopes, parameterized repositories, no broad CORS.
- D1 strict schema, indexes/FK/cascades and migrations 0001/0002. Atomic active/global
  capacity and admission limits, aggregate trigger counters and bounded Cron cleanup.
  Daily HMAC network buckets store no raw IP. Challenges remain explicitly disabled.
- Responsive light/dark UI, centralized English copy, Bangla branding/Unicode content,
  semantic labelled forms, focus/skip link, unsupported browser and generic errors.
  Privacy, terms, acceptable-use, security and configurable actual operator contact.
- Complete consumer redesign: indigo/neutral semantic tokens, system English/Bangla
  typography and local SVGs; coherent public shell and landing narrative, two-step
  onboarding, focused sender, readable inbox, My link/QR, profile, security/recovery,
  restore/archive and legal/error states. Native destination navigation preserves
  multi-profile selection using public view/space parameters without granting access.
  Complete verified copying/fallback, mobile menu, contrast and associated hints/errors
  have regression coverage. No new dependency, remote asset or telemetry.
- Product-intent upgrade: welcoming constructive-feedback hero with labelled
  question/response illustration, practical use cases, connected sharing/encryption
  diagrams, openness and considerate-use sections, and public /about “Why Nibhrito”.
  Visual setup/share/empty-inbox/recovery/archive guides explain what to do next;
  sender guidance, distinct notice symbols and warmer neutral/teal surfaces clarify
  intent. Captions and semantic lists preserve accessible reading order across widths.
  No new metadata, secret display, API/storage behavior or legal policy changes.
- Final visual/mobile polish preserves ab5dc7d and 8526c06: human conversation
  shapes and participant symbols, qualified identified/private feedback scenarios,
  four short invitations, compact setup/recovery overviews and shorter sender copy.
  Information sky and calm slate dark surfaces distinguish trust, help, completion,
  warning and danger. Full-copy feedback, visible server expiry and delete symbols
  improve scanning; ten-width and 320px touch/short-height coverage verify the flows.
- No analytics/remote scripts/fonts; CSP/security headers on assets/API, no runtime
  logging, disabled Worker metrics/instrumentation/observability. Locked minimal
  dependencies, strict separate TS projects, tests and privacy/tracked-secret scan.
- Guarded production config and separate secret generators, atomic code/secret upload
  through pinned Wrangler, exact provisioning/migration/live smoke/backup/rollback
  instructions in docs/16. No local-config fallback or invented production UUID.
- Disposable D1 integration/portability tests and isolated three-engine E2E. A native
  export/import is restored/decrypted and its migrations/triggers/cascades checked.
- Release QA: pinned dev-only axe-core inspects public and native private states
  without reporting DOM or secrets; an explicit installed-Edge gate preserves the
  mandatory three engines. Browser theme-color metadata now matches the accepted
  light/dark surface tokens, with a browser regression. No runtime dependency added.

## Verification

Final local release QA from repository root: full npm run check and npm run test:edge
exit 0. Both migrations remain applied with no pending migration. This pass adds one
locked dev dependency, axe-core 4.13.0; no transitive/runtime dependency was updated.

- 113 Vitest tests in 18 files: native crypto/unit, D1/API/authorization/security,
  configuration/generator/deployment guards and real encrypted export/import/decrypt.
- 57 browser cases (19 journeys/checks × Chromium, Firefox, WebKit), no skips/retries,
  isolated database/root; plaintext/network/persistence, XSS, CSP, recovery, archive,
  settings, deletion/expiry, malformed/substituted link, unsupported crypto, clipboard
  absence and encoded contact-link tests pass.
- 19 additional cases pass in installed Microsoft Edge 154.0.4258.53 with an isolated
  profile, no retries/skips and the same security assertions. The first Edge command
  timed out before tests during server startup; diagnostic health passed and a
  sequential rerun passed without changing assertions or timeouts.
- 272 local automated accessibility state scans across four browsers: 53 public/menu
  and 15 private lifecycle/error states per engine, phone/desktop and light/dark
  where applicable. No rule violations; inconclusive checks remain manual-review
  annotations containing only rule IDs/counts. This is not WCAG certification.
- Browser coverage: multi-profile selection/navigation, ten-width public and
  owner layouts, mobile-menu Escape/focus, complete clipboard contents, cancellation
  of destructive deletion, oversized drafts and identical rate-limit envelope retry.
  Light/dark WCAG token contrast tests pass. An intentional failed-assertion probe
  confirms private DOM is absent from output and failure artifacts.
- Intent coverage verifies positive examples, navigation to /about, public explanation
  without crypto/storage/API access or third-party requests, ten-width captioned
  diagram orientation/order, and setup/share/recovery/empty guides. All original
  browser security assertions remain. Actual Worker and native critical journeys pass.
- Final mobile coverage verifies the first setup field in a 320×568 viewport,
  horizontal compact overview order, 44px primary targets, maximum-length slug,
  complete copying/QR and long Bangla/English/mixed drafts in a focused 320×360
  composer. Network failure preserves the draft; native encryption/decryption,
  visible expiry and cancelled/confirmed message deletion work in all three engines.
- Strict TypeScript, lint, format, privacy/tracked-secret checks, production build,
  Worker dry run and npm audit --audit-level=low pass. Audit finds zero vulnerabilities.
- Diff/secret/import review passes. Bundled Worker has no browser decryption or
  recipient private-key payload; schemas/data tests find no plaintext-message/raw
  private-key/recovery-secret persistence. Operator SQL export preserves ciphertext
  and is decryptable after restore; all six counter triggers/cascades work.

The accepted 8c891fa polish has 577 masked visual checks (477 main + 100 state checks)
covering 320, 360, 375,
390, 412, 430, 768, 1024, 1280 and 1440px in light/dark, with zero horizontal overflow.
Long English/Bangla, complete links, QR/manual-copy fallback, recovery/archive,
loading, empty, network/rate/authentication error and success were inspected;
disposable profiles deleted. A focused 320×360 frame covers keyboard space.
The 268-check baseline and final review use ignored, masked private artifacts.
Audits: docs/17_UI_REDESIGN.md, docs/18_PRODUCT_INTENT_UX.md and docs/19_FINAL_MOBILE_POLISH.md.
Fixed compact-overview arrow placement found at 320px. Production config and secret
files do not exist locally; no external credentials, provisioning or deployment used.

## Security decisions and review

SECURITY_REVIEW.md records adversarial self-review, with no unresolved Critical/High
findings identified. Resolved: stale fragment trust, Origin admission ordering,
unbounded physical/rate storage, secret-bearing diagnostics, async plaintext lifetime,
skip-link fragment overwrite, duplicate sibling React keys and production HTTP APIs.
Regression tests exercise these cases. This is not an independent security audit.
Redesign review also resolved the remaining Playwright failed-assertion DOM artifact
gap (M8); the forced-failure probe runs before E2E. Cryptographic protocol, API contracts,
database behavior, key lifecycle, authorization, expiry/deletion, CSP/security headers
and legal policy bodies remain unchanged. Only presentation, microcopy/navigation and
test tooling changed. Tests retain every original security assertion.
The product-intent and final polish reviews found no new Critical/High or actionable
Medium finding. That polish's security-sensitive paths and dependency/configuration files
had no diff; its new browser test retains request-secrecy checks and private artifact
protection. The qualified comparison promises no elimination of risk/social pressure.
The original master-plan definition now follows the user's explicit feedback and
honest-expression purpose; historical snapshot and legal eligibility remain intact.

Release QA also has no crypto/storage/API/shared/Worker/migration/header/CSP diff.
Only two HTML theme-color values change in shipped code; browser JS/CSS asset hashes
remain unchanged. New test instrumentation is dev-only, performs no external requests
and returns only generic audit summaries; every original test assertion is retained.
No new Critical/High or actionable Medium security finding was identified. Exact
physical-device/assistive-technology and production gates are in docs/20.

Documentation decisions are in docs/13 and docs/15: immutable slugs and v1 AAD,
strict encoding/JSON sizes, server timestamps, backend token verification independent
from browser keys, atomic writes, separate local/production config, direct Cloudflare
edge source handling, and 500 MB free per-database capacity. 0002 is additive; triggers
affect meta.changes, so repositories use explicit RETURNING for success decisions.
No hot full scans for aggregate capacity. Physical caps include cleanup backlog.

Limits: 4 KiB complete plaintext JSON, 12 KiB message/16 KiB creation/4 KiB update,
500 active notes/profile, 20000 physical notes globally, 10000 profiles, 2000 rate rows.
Production rates/grouping and retry behavior are specified in docs/15. Provider
availability/CPU/storage must be measured at staging; caps are conservative headroom.

## Known limitations and external gates

- Trust in current frontend/browser/device/hosting TLS, malicious future frontend
  risk, no full forward secrecy/sender identity proof/per-device revocation, no
  post-deletion replay tombstones or lost-code reset. Prior copies/archives and
  temporary provider backups cannot be erased by server deletion.
- Hosting sees network metadata; HMAC buckets are pseudonymous and a compromised
  root can correlate them. Shared-network limits/distributed abuse may deny service.
  Public slugs/settings/existence and server timestamps are not hidden/authenticated
  sender identity. Native keys and JS strings cannot defeat origin/device compromise.
- Device/browser data loss requires the saved recovery code; setup network ambiguity
  can leave a created profile recoverable by that code even if local persistence fails.
  Local archive imports read copied content; they do not restore server rows.
- UI is English with Bangla branding and tested Bangla messages. Full localization
  and independent accessibility review remain optional. Headless Windows WebKit
  skip-link test uses focus+Enter; Chromium/Firefox use actual Tab. Touch and shortened
  viewport checks emulate keyboard space, not physical OS keyboards. Real Safari/iOS,
  phone keyboards and assistive technologies need manual review. Installed Edge
  now passes locally; actual production browsers/devices remain a live acceptance gate.
- Actual Cloudflare login, returned D1 UUID, production operator/contact/jurisdiction,
  protected server root, legal review and live HTTPS/headers/no injected scripts,
  quotas/CPU, Cron/log review and second-device recovery require the operator.
  No deployment or release acceptance is claimed locally.

## Run and next action

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run check
npm run dev
```

Open http://127.0.0.1:8787. Local dev auto-generates ignored server rate secret and
applies migrations. No account/credentials needed. Follow docs/16 for the exact
external deployment procedure; do not bypass the guard or tag v1.0.0 before live checks.
On a machine with Microsoft Edge installed, additionally run `npm run test:edge`.
See docs/20_RELEASE_ACCEPTANCE.md for exact remaining device/AT checks.

## Commit history and continuation

| Phase      | Commit  | Outcome                                                               |
| ---------- | ------- | --------------------------------------------------------------------- |
| 0          | db74924 | Existing accepted foundation; earlier audit 0e1b44f, baseline 451488c |
| 1          | 7e39a09 | Browser crypto/recovery protocol and tests                            |
| 2          | d6b7450 | Profile creation/authentication/browser restore                       |
| 3          | 538a138 | Verified encrypted sender and local QR                                |
| 4          | 0873ea8 | Owner-scoped inbox/settings/deletion                                  |
| 5          | 4cdbd11 | Bounded expiry cleanup and atomic quotas                              |
| 6          | 93e64c9 | Bounded privacy-preserving abuse controls                             |
| 7          | 3f1515e | Legal UX, encrypted backups and adversarial hardening                 |
| 8          | 1df1698 | Guarded deployment/operations and clean local acceptance              |
| UI         | ab5dc7d | Complete consumer UI/UX redesign                                      |
| Intent UX  | 8526c06 | Positive product story and visual explanations across key flows       |
| Polish UX  | 8c891fa | Visual meaning, semantic color and final phone/touch refinement       |
| Release QA | e93fc70 | Local accessibility/Edge acceptance and matched browser theme colors  |

Each phase has a self-contained plan in .agent/plans. Original planning snapshot
NIBHRITO_MASTER_PLAN.md is preserved; split docs plus documented audit decisions
describe the implementation. Phase 9 is conditional post-launch; encrypted exports
were implemented early by explicit user instruction. Reporting disclosure, key
rotation, per-device authorization, challenges, native clients and prekeys are not
MVP requirements and need reviewed plans and evidence of need.

Ignored local state/dependencies/build/test artifacts and .dev.vars are intentional.
Production configuration and production secret file have not been created.
The UI phase is documented in .agent/plans/ui-redesign.md and docs/17. The completed
intent upgrade is in .agent/plans/product-intent-ux.md and docs/18. Final polish is in
.agent/plans/final-mobile-polish.md and docs/19_FINAL_MOBILE_POLISH.md;
remaining local QA is in .agent/plans/release-qa.md and docs/20_RELEASE_ACCEPTANCE.md.
FINAL_VERIFICATION.md records the latest passing gates. The next action remains manual
device/assistive-technology review and operator-controlled production acceptance,
not further MVP implementation. No deployment was performed during any UX phase.
