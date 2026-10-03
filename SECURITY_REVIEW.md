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

L1 fixed during deployment review: RFC-valid mailbox characters could be interpreted
as mailto headers. Encode the mailbox as a URI component in Legal.tsx; browser
regression verifies a mailbox containing query delimiters cannot introduce headers.

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
