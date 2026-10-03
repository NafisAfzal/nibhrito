# Nibhrito Project Status

Updated 2026-10-03. This file, IMPLEMENTATION.md, SECURITY_REVIEW.md and the phase
ExecPlans provide the handoff; no chat history is needed.

## Current state

All locally executable MVP work is complete: Phases 0–7 and Phase 8 deployment
preparation. The dedicated complete UI/UX redesign is also implemented and verified.
Phases 1–8 local work and the redesign are recorded in reviewable commits; the
redesign commit includes its ExecPlan, audit and final verification handoff.
Package is 1.0.0-rc.1. No Cloudflare provisioning, production secret/configuration,
deployment or v1.0.0 tag has occurred. External production acceptance remains pending.

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
- No analytics/remote scripts/fonts; CSP/security headers on assets/API, no runtime
  logging, disabled Worker metrics/instrumentation/observability. Locked minimal
  dependencies, strict separate TS projects, tests and privacy/tracked-secret scan.
- Guarded production config and separate secret generators, atomic code/secret upload
  through pinned Wrangler, exact provisioning/migration/live smoke/backup/rollback
  instructions in docs/16. No local-config fallback or invented production UUID.
- Disposable D1 integration/portability tests and isolated three-engine E2E. A native
  export/import is restored/decrypted and its migrations/triggers/cascades checked.

## Verification

Final redesign verification from repository root: full npm run check exits 0.
Both migrations remain applied with no pending migration. The prior release-candidate
clean npm ci installed 228 packages; the dependency lockfile remains unchanged.

- 113 Vitest tests in 18 files: native crypto/unit, D1/API/authorization/security,
  configuration/generator/deployment guards and real encrypted export/import/decrypt.
- 42 browser cases (14 journeys/checks × Chromium, Firefox, WebKit), no skips/retries,
  isolated database/root; plaintext/network/persistence, XSS, CSP, recovery, archive,
  settings, deletion/expiry, malformed/substituted link, unsupported crypto, clipboard
  absence and encoded contact-link tests pass.
- New browser coverage: multi-profile selection/navigation, five-width public and
  owner layouts, mobile-menu Escape/focus, complete clipboard contents, cancellation
  of destructive deletion, oversized drafts and identical rate-limit envelope retry.
  Light/dark WCAG token contrast tests pass. An intentional failed-assertion probe
  confirms private DOM is absent from output and failure artifacts.
- Strict TypeScript, lint, format, privacy/tracked-secret checks, production build,
  Worker dry run and npm audit --audit-level=low pass. Audit finds zero vulnerabilities.
- Diff/secret/import review passes. Bundled Worker has no browser decryption or
  recipient private-key payload; schemas/data tests find no plaintext-message/raw
  private-key/recovery-secret persistence. Operator SQL export preserves ciphertext
  and is decryptable after restore; all six counter triggers/cascades work.

235 post-redesign visual layout/state checks across five widths and light/dark found
no horizontal overflow. Long English/Bangla, complete links, QR, recovery/archive,
loading, empty, error and success inspected with masked private fields; fixtures
deleted. Audit and design details: docs/17_UI_REDESIGN.md. Production config and secret
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
  skip-link test uses focus+Enter; Chromium/Firefox use actual Tab. Real Safari/iOS,
  Edge and assistive technologies need manual review.
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

## Commit history and continuation

| Phase | Commit  | Outcome                                                               |
| ----- | ------- | --------------------------------------------------------------------- |
| 0     | db74924 | Existing accepted foundation; earlier audit 0e1b44f, baseline 451488c |
| 1     | 7e39a09 | Browser crypto/recovery protocol and tests                            |
| 2     | d6b7450 | Profile creation/authentication/browser restore                       |
| 3     | 538a138 | Verified encrypted sender and local QR                                |
| 4     | 0873ea8 | Owner-scoped inbox/settings/deletion                                  |
| 5     | 4cdbd11 | Bounded expiry cleanup and atomic quotas                              |
| 6     | 93e64c9 | Bounded privacy-preserving abuse controls                             |
| 7     | 3f1515e | Legal UX, encrypted backups and adversarial hardening                 |
| 8     | 1df1698 | Guarded deployment/operations and clean local acceptance              |

Each phase has a self-contained plan in .agent/plans. Original planning snapshot
NIBHRITO_MASTER_PLAN.md is preserved; split docs plus documented audit decisions
describe the implementation. Phase 9 is conditional post-launch; encrypted exports
were implemented early by explicit user instruction. Reporting disclosure, key
rotation, per-device authorization, challenges, native clients and prekeys are not
MVP requirements and need reviewed plans and evidence of need.

Ignored local state/dependencies/build/test artifacts and .dev.vars are intentional.
Production configuration and production secret file have not been created.
The dedicated UI phase is documented in .agent/plans/ui-redesign.md and docs/17;
FINAL_VERIFICATION.md records its passing gate. The next action remains manual
device/assistive-technology review and operator-controlled production acceptance,
not further MVP implementation. No deployment was performed during the redesign.
