# Nibhrito implementation

Local release candidate `1.0.0-rc.1`, 2026-10-03. Phases 1–7 are implemented; Phase 8
local deployment tooling and verification are implemented. Actual Cloudflare
provisioning/deployment and live release acceptance remain operator actions.

## Product

- Landing, profile setup with saved-recovery confirmation, full share links and
  local QR, verified anonymous sender, byte-aware composition and encrypted mood.
- Authenticated recipient inbox, local decryption/search/filter, pagination,
  corruption handling, deletion, expiry, public settings and pause/resume.
- Nonextractable browser keys, restore on another browser/device, explicit device
  forgetting and permanent profile deletion. Authentication uses a separate owner
  token; there is no email/password account or operator reset.
- Encrypted JSON backup download and local-only archive reading. No private key or
  plaintext export; the separate recovery code unlocks the existing encrypted bundle.
- Redesigned responsive light/dark UI, semantic forms, focus/skip link, loading/empty/error
  states, unsupported-browser notice, Bangla brand and Unicode message support.
- Positive feedback-first product story, local illustrative question/response, practical
  use cases and discoverable public Why Nibhrito page. Connected visual guides explain
  link sharing, encrypted delivery, the empty inbox, recovery and local archive reading.
- Privacy, terms, acceptable use, encryption explanation and real configurable
  operator contact; empty local configuration is explicitly labelled evaluation.

## Architecture and encryption

One React/Vite/TypeScript static SPA, native same-origin Worker API, D1 behind small
repository interfaces and committed strict SQL migrations. Runtime dependencies are
React/React DOM and a local QR encoder; crypto uses only native Web Crypto. No
analytics, external scripts/fonts, server decryption, CORS grants or plaintext fallback.

Recipient generates P-256 key pair in the browser. Only a SHA-256 public-key
fingerprint, owner-token verifier, public profile metadata and encrypted recovery
bundle go to the backend. Working private key is reimported nonextractable into
IndexedDB, alongside the separate bearer owner token. Recovery uses a random 256-bit
code and AES-GCM with a distinct HKDF domain; it includes the private JWK and owner
token only inside authenticated ciphertext. No human password KDF/reset is used.

Sender requires the complete trusted `/u/<slug>#v=1&pk=...` URL, validates the native
P-256 point and profile/fingerprint binding, and never substitutes a backend key.
Fresh ephemeral ECDH, HKDF-SHA-256 and AES-256-GCM encrypt each message. Random
32-byte salt, 96-bit IV, 128-bit tag and canonical AAD bind slug, message UUID and key
ID. Plaintext JSON is at most 4 KiB including Unicode/metadata. Decryption authenticates
everything before rendering inert text. Details/vectors are in docs/03 and tests.

Backend authorization hashes the bearer token, looks up its profile and scopes all
inbox/mutation queries by that server-derived ID. Strict schemas, streamed byte caps,
parameterized queries, server expiry, exact-envelope retry matching and atomic
admission/storage quotas fail closed. Hourly bounded cleanup removes expired rows.
Rotating HMAC network identifiers prevent raw-IP persistence; provider visibility
and pseudonymization limits are documented. Static/API policies enforce CSP and
other headers. Neither backend nor UI emits application diagnostic logs.

## Local setup and checks

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run check
npm run dev
```

Open `http://127.0.0.1:8787`. Node 24 required. No external credentials needed.
Dev automatically creates an ignored server rate secret and applies both local
migrations. Rerun build/dev after frontend changes; Vite HMR is for development only.
The full check covers unit/native crypto, D1 integration, authorization, rate limits,
database export/import/decryption, three-engine browser journeys, CSP, privacy scans,
type/lint/format, build, dry run and audit. E2E uses separate disposable database state,
never your development profiles; secret-bearing browser artifacts are disabled.
The intentional-failure `npm run test:artifacts` probe checks assertion output and
artifacts for private DOM before each browser suite. Contrast, ten-width responsive,
mobile keyboard navigation, multi-profile destination and full-link copying checks
supplement the original security journeys.

The consumer UI uses local SVGs and system English/Bangla fonts, semantic design
tokens and clear Inbox/My link/Profile/Security destinations. Onboarding explains
profile creation and recovery in two steps. Full verified links are copied intact;
technical details are progressively disclosed. Public `view`/`space` URL parameters
carry no secrets and do not confer authorization. See
[docs/17_UI_REDESIGN.md](docs/17_UI_REDESIGN.md) for the audit, design and visual QA.

The focused product-intent upgrade keeps this foundation and makes constructive
feedback, opinions and thoughtful expression visible through labelled examples,
captioned SVG step diagrams and warm neutral/teal surfaces. `/about` works without
crypto/storage/API prerequisites; secured operational routes retain browser checks.
Existing policies and cryptographic/API/database semantics are unchanged. See
[docs/18_PRODUCT_INTENT_UX.md](docs/18_PRODUCT_INTENT_UX.md) for scope and verification.
The final mobile/visual pass adds qualified feedback scenarios, conversation/person
symbols, shorter invitations, compact onboarding, visible expiry and intentional
copy/delete/status symbols. Semantic sky guidance and calm slate dark surfaces
extend the established brand. The 320px touch journey checks full-link copying/QR,
long Bangla/English/mixed drafts, shortened keyboard-space viewport, network retry,
browser encryption/decryption and cancellation/confirmation of deletion. No protocol,
API, database, key handling, dependency, security-header or policy changes. See
[docs/19_FINAL_MOBILE_POLISH.md](docs/19_FINAL_MOBILE_POLISH.md) for details.
The latest full gate passes 113 Vitest tests and 51 browser cases, 17 per engine.

## Production and operations

Follow [docs/16_DEPLOYMENT_OPERATIONS.md](docs/16_DEPLOYMENT_OPERATIONS.md) for exact
commands and rollback/backup/incident procedures. Required: your Cloudflare login,
real returned production D1 UUID, actual legal operator/contact/jurisdiction and a
fresh protected server-only rate root. A paid domain is optional. Production config
and secret generators refuse overwrite; deploy validates privacy defaults and uploads
code/secret together. No credential, production UUID or deployment was fabricated.

Manually verify live HTTPS/headers, no injected platform scripts, current Chrome/Edge
and an additional engine/device, second-device recovery, ciphertext-only storage,
Cron, CPU/storage budgets and no sensitive logs. Legally review the policy baseline.
Do not tag v1.0.0 until actual Phase 8 production acceptance passes.

## Limits and optional improvements

The threat model trusts the current frontend, browser, device and hosting TLS path.
Malicious future frontend or compromised device can steal plaintext/use keys. v1
has no full forward secrecy, sender identity proof, durable replay tombstones,
individual-device revocation or lost-code recovery. Existing copies cannot be erased.
Provider network metadata and temporary backups persist outside application control.
Metadata timestamps/public profiles are not hidden. JS strings cannot be reliably
erased from memory. Shared networks and distributed abuse can deny service despite
quotas; local benchmarks do not establish Cloudflare CPU billing or availability.

UI is English with Bangla branding and verified Bangla content; complete translation,
independent crypto/accessibility review, native clients, prekeys, key rotation,
device-specific authorization and explicit voluntary abuse disclosure remain optional.
Challenge escalation stays disabled: remote CAPTCHA scripts would violate the
current encryption-route policy. Phase 9 options require evidence of need and reviewed
plans. Encrypted backups were implemented early at the user's explicit request.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for exact verification and commit evidence,
[SECURITY_REVIEW.md](SECURITY_REVIEW.md) for resolved findings and release gates.
