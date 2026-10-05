# Nibhrito security review

Implementation review, 2026-10-03. Scope: browser crypto and storage, trust in share
links, recovery/archive parsing, Worker/API authorization, D1 migrations, expiry,
abuse limits, headers, dependencies, logs and deployment configuration. Guidance:
AGENTS.md, docs/03,04,09 and prompts/SECURITY_REVIEW.txt. This is an implementation
self-review, not an independent audit or proof of anonymity.

## Critical

No unresolved Critical findings identified. No server decryption or plaintext
fallback exists. Worker imports no browser crypto. Recovery secrets never enter API
schemas. Independent native crypto vectors complement round-trip tests.

## High

**H1 — Fixed: stale trust after fragment-only navigation.** An already mounted sender
could retain verification of the previous public key when a different fragment was
opened. Someone changing a link could make the visible URL and encryption decision
disagree. `src/features/send/Send.tsx` now reloads on hash changes and revalidates
version, profile, encoding, native curve point and fingerprint before mounting the
composer. No backend public key is accepted. Regression: shareLink unit tests and
`tests/e2e/lifecycle.spec.ts` substitute a different valid P-256 key after opening a
verified link; sending becomes unavailable. Incomplete/malformed links also fail.

No unresolved High findings identified. Authorization tests independently exercise
unauthenticated/wrong tokens, cross-profile inbox/delete/settings/recovery and forged
cursors. Owner hash lookup determines ownership; caller identifiers cannot grant it.

## Medium

Fixed findings:

- M1: Cross-site requests previously consumed admission counters before Origin
  checks. Check Origin/Fetch Metadata first; rate integration verifies unchanged
  counts after cross-site requests. Bearer authentication uses no cookies; same-origin
  JSON writes and no CORS grants also prevent browser CSRF.
- M2: Daily/active-profile quotas did not bound physical storage or stale rate rows.
  Migration 0002 maintains atomic aggregate counters; guards limit physical messages
  to 20000, profiles to 10000 and buckets to 2000. Capacity/cleanup/rate tests exercise
  races, exact retries and cascades. D1 trigger changes require explicit RETURNING,
  not meta.changes, for success decisions. No raw address enters D1.
- M3: Unbounded browser-test failure snapshots and React diagnostic output could
  retain secret UI state. Disable Playwright DOM snapshots, traces, screenshots and
  video; suppress React error callbacks and show generic boundaries. Narrow source
  scanning rejects runtime logging. Tests use disposable fixture secrets only.
- M4: Leaving a view during async decryption could repopulate cleared plaintext.
  Inbox aborts pending fetches and checks active state; archive reading checks active
  state; pagehide clears data and persisted pageshow reloads. Private search/drafts
  stay in memory. Crypto byte buffers are cleared in finally blocks, including
  malformed recovery JSON; immutable JS strings cannot be reliably erased.
- M5: Skip-link hash navigation overwrote the encryption fragment. Focus the main
  region without changing the URL; sender E2E verifies the full fragment survives.
- M6: Inbox/settings shared the same sibling React key, causing duplicate DOM and
  stale settings during updates. Give each child a distinct key including profile ID;
  lifecycle E2E verifies pause/resume, a single inbox, expiry and permanent deletion.
- M7: Production HTTP could carry bearer authorization. Reject non-HTTPS production
  APIs before auth/rate processing; integration verifies no side effects. Hosting
  redirects/HTTPS and delivered security headers remain external smoke-test gates.
- M8: Redesign review found M3's Playwright flag covers teardown snapshots but not
  failed locator assertions' DOM context. An automatic test fixture now removes only
  errorContext before artifact writing, retaining assertions, messages and stacks.
  A deliberate failing assertion with a disposable secret marker verifies both
  output and artifact contents contain no marker or DOM snapshot. The check runs
  before every E2E suite. Traces, screenshots and videos remain disabled. This
  resolves the gap in the earlier artifact claim; no application secrets or
  production data were involved. Regression: npm run test:artifacts.

Accepted architectural limitations, disclosed in UI and documentation:

- Web delivery trusts the operator's current frontend, browser, extensions and OS.
  CSP cannot stop a malicious authorized future same-origin build. Nonextractable
  CryptoKeys can still be used by compromised origin code. Independently reviewed
  native clients/prekeys are optional future work.
- v1 has no forward secrecy against later recipient-key compromise, sender identity
  proof, durable replay tombstones, password reset or individual-device revocation.
  Exact retries are idempotent only while the row exists. Deletion cannot erase prior
  copies, exported archives or temporary provider backups.
- Network HMAC buckets are pseudonymous, not anonymous. Root compromise can correlate
  addresses; the provider processes IP/timing metadata. IPv6 /64 and global quotas
  can deny legitimate shared-network users. Distributed abuse may exhaust capacity.
- Server-created timestamps/expiry are operational metadata outside message AAD.
  Public slugs/settings and existence are intentionally discoverable; no secrecy of
  public profile metadata is claimed. HTTPS protects ordinary transit integrity.

## Low

Private message/search spellcheck and autocomplete are disabled to reduce unintended
browser cloud assistance. QR is generated locally; no remote fonts/scripts/telemetry.
Bounded file imports reject extra fields, duplicates, invalid dates/profile bindings
and wrong codes. Archive copies remain readable after server expiry, explicitly.
English copy is centralized; Bangla/Unicode content and brand render correctly.
Headless Windows WebKit does not expose normal Tab navigation consistently: the
test explicitly focuses the skip link before Enter, while Chromium/Firefox use Tab.
Real Safari/iOS, assistive technology and OS keyboard preferences need manual review.

Dedicated UI redesign review: native public destination/profile-slug navigation
cannot grant ownership; server authentication remains independent. Copy/QR retain
the complete verified fragment, including fallback selection. Skip link and hash
revalidation are unchanged. Drafts, decrypted messages and recovery codes remain
ephemeral; no private search/state is added to URLs. Message text remains inert.
The sender's explicit textarea label fixes a changing accessible name; oversized
and rate-limit recovery tests check editable drafts and identical envelope retries.
No new Critical/High finding was identified. Crypto/storage/shared schemas/API/
Worker/migrations/security headers and legal policy bodies have no redesign changes.
No dependency, remote asset, logging or telemetry was added. WCAG token and browser
checks supplement visual review; this does not claim independent accessibility audit.

Product-intent UX upgrade review: public illustrations use labelled fictional copy,
not live inbox data. New /about has no API, storage or crypto prerequisite and no
third-party requests; this does not relax checks on operational routes. Step diagrams
and sender guidance do not add plaintext persistence, secret exposure, copies or
server moderation. Existing native recovery acknowledgement and key/link validation
remain. Empty-state filtering remains clearable; only presentation visibility changes.
Legal policy bodies, crypto/storage/API/shared/Worker/migration/header/configuration
and dependency files are unchanged. No new Critical/High or actionable Medium finding
was identified. Full 113-test and 48-case three-engine gate passes, including original
network/storage secrecy, authorization, XSS/CSP, decryption/recovery and artifact
assertions. New diagrams are captioned semantic lists with decorative symbols hidden
from assistive technology. Masked visual QA passes 264 checks; no independent security
or accessibility certification is claimed. See docs/18 and FINAL_VERIFICATION.md.

L1 fixed during deployment review: RFC-valid mailbox characters could be interpreted
as mailto headers. Encode the mailbox as a URI component in Legal.tsx; browser
regression verifies a mailbox containing query delimiters cannot introduce headers.

Final mobile/visual polish review: preserves ab5dc7d and 8526c06. Only frontend
presentation, static copy, tests and documentation change. Cryptographic/key-storage/
API-client/shared/Worker/migration/CSP/header/configuration/dependency files have no
diff. Visible expiry reuses server metadata; copy retains the complete verified URL;
no sender/unread metadata, key material, secret rendering or persistence is added.
The social-pressure comparison is explicitly illustrative and qualified; anonymity
limits, recovery loss warnings, saved-code acknowledgement and legal eligibility
remain. No new Critical/High or actionable Medium finding identified. Full gate
passes 113 Vitest and 51 browser cases, including original authorization, XSS/CSP,
crypto/recovery, request/storage secrecy and private artifact assertions. A new
320px touch/short-height journey exercises drafts after network failure and real
encryption/decryption/deletion. Expanded semantic contrast and ten-width layout
checks pass. 577 masked visual checks find no overflow; disposable fixtures deleted.
Physical phone keyboards/Safari/assistive technology remain manual verification;
headless touch/viewport checks do not establish real-device or WCAG certification.

## Remaining local release QA — 2026-10-04

Diff review against 8c891fa: crypto, key storage, API client, shared schemas, Worker,
migrations, authorization, expiry/deletion/rate limiting, security headers/CSP,
production configuration and legal policy bodies have no changes. Shipped code only
updates two theme-color HTML values to match existing surface tokens. Application
JS/CSS asset hashes remain unchanged. All original test assertions are retained.

One pinned dev-only axe-core package adds no runtime dependency or external request.
Tests summarize violations/inconclusive checks in-browser, returning only rule IDs,
impact and counts; no node HTML, selectors, failure summaries or private text enter
reports. They use the existing private-artifact fixture and isolated D1/profiles.
The separate installed-Edge config retains zero retries, disabled artifacts and all
mandatory engines. Full check passes 113 Vitest/57 browser cases; Edge passes another 19. The initial Edge startup timeout occurred before tests, is recorded in docs/20,
and was followed by a healthy diagnostic and passing sequential run.

No new Critical/High or actionable Medium finding identified. All 272 automated
accessibility scans report no rule violations; inconclusive rules and real assistive
technology remain manual checks, not security/accessibility certification. Physical
phone/iOS and operator production gates are unchanged; no deployment or tag occurred.

## Evidence and remaining release gates

Security tests cover modified ciphertext/tag/IV/salt/ephemeral key/AAD, wrong key,
invalid points/versions/schema, native interoperability, 4 KiB Unicode boundaries,
wrong/corrupt recovery and nonextractability. API tests use real local D1 and cover
byte limits, malformed requests, duplicates, expiry/deletion, scopes, origins and
rate windows. Browser journeys inspect requests and IndexedDB and read an encrypted
export in a separate context, with inert HTML and CSP injection checks.

Production account/DB/secret/operator details, actual hosting configuration, live
CPU/quota behavior, headers, Cron, a second device recovery and log review require
the operator. Do not tag v1.0.0 until those gates pass. Final local check results and
deployment guard review will be recorded in PROJECT_STATUS.md and the Phase 8 plan.

Phase 8 review: configuration guard enforces exact public vars, actual UUID shape,
separate canonical server root, local-root nonreuse, logging/telemetry disabled,
same-origin routing and disabled challenges/previews. Unknown configuration fields,
unsafe overrides and example values fail before build/upload. Generators exclusively
create files without printing secrets. Code/secret deploy together with pinned CLI;
no automatic login/provisioning/migration. Unit tests exercise unsafe configuration,
argument prototypes, overwrite refusal and deployment refusal. Real UUID ownership,
legal identity and cloud account settings cannot be verified locally.

Native D1 export/import test preserves actual encrypted recovery/message data,
restores/decrypts using existing modules, checks migrations and all six counter
triggers, and verifies cascades. It never exports the developer database. E2E now
isolates D1 and the server rate root per run; interrupted test directories contain
test-only ciphertext/configuration and remain ignored. Narrow privacy scanner and
manual diff/import review find no plaintext/private-key backend persistence path.

## GitHub publication review — 2026-10-05

Repository/history audit, redacted-output regression, read-only CI and private
reporting are added without changing cryptography, key storage, API contracts,
Worker behavior, migrations, CSP or logging defaults. Private test artifacts remain
disabled and are never uploaded. Examples and the single public screenshot contain
no user data or operational secrets. No dependency version changes.

Linux CI exposes a small-phone setup layout defect. Four CSS declarations scoped
to <=360px onboarding change title/intro size and two gaps only. They preserve all
controls, recovery warnings and content. Numeric failure diagnostics run on the
empty setup form before any profile/key generation, returning no DOM/text/values.
Original visibility, touch, confidentiality and lifecycle assertions remain intact.
Built application JavaScript bytes are identical to e93fc70; stylesheet-dependent
asset names change. Full local/CI acceptance is recorded in docs/21. This limited
diff review adds no independent security or accessibility certification. The final
local gate passes 113 Vitest/57 portable/19 Edge cases with 272 local accessibility
scans; Linux CI 37230785921 passes too. No existing security assertion is removed.

## Design engineering review — 2026-10-05

Scoped diff review from `219d17e634cc0d5adc84d7fad1a0e24f40767366`: semantic
colors, CSS composition/motion, public heading scaffolding and one factual
intro change; no crypto, key storage, recovery logic, shared schema, API,
Worker, D1/migration, authorization, expiry/deletion, rate-limit, CSP/header,
production configuration or legal policy-body changes. No runtime dependency,
remote script/font, analytics, telemetry or new persistence. E2EE/protocol,
API/database behavior and privacy/security guarantees remain unchanged.

The browser regression samples painted action contrast through both theme
directions. Color crossfades were removed after actual transient low contrast;
movement remains optional and near-opaque text entrances preserve readability.
All existing security/privacy assertions and private-artifact safeguards remain.
Synthetic geometry/request inspection found no message/recovery-code leakage,
browser errors or third-party origin. Private captures are masked and ignored;
published previews contain only fictional public homepage content.

Repository/history audit, native removed-secret regression, redacted Gitleaks
current/history scans, Semgrep and OSV checks pass. The visual allowlist adds
only the reviewed public screenshot and script-free diagram pairs; unknown
visual/generated files still fail review. No new Critical/High or actionable
Medium finding was identified in this scoped self-review. This is not an
independent security/accessibility certification. Full evidence and recorded
local verification failures are in [design engineering](docs/22_DESIGN_ENGINEERING.md).
