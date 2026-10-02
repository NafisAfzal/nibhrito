# Nibhrito Project Status

Updated 2026-10-03. This file and the phase ExecPlan are the persistent handoff;
no chat history is required to continue.

## Current phase

Phases 0–4 complete. Continuing immediately with Phase 5, expiry and quotas.
The following Phase 0 handoff is historical; subsequent completed-phase entries
record current work and checks. No production deployment has occurred.

## Completed work

- Read the required planning documents, inspected all repository files/toolchain,
  and preserved the original planning pack in Git (baseline `451488c`).
- Recorded the architecture audit in `docs/13_ARCHITECTURE_REVIEW.md` and the
  self-contained ExecPlan in `.agent/plans/phase-0.md`.
- React/Vite/Tailwind static SPA with centralized copy, Bangla brand text, light/dark
  styles, no remote scripts/fonts, and an accurate development status.
- Native TypeScript Worker with GET/HEAD `/api/v1/health`, repository-backed real
  D1 readiness, no-store JSON errors, method/query rejection, and no diagnostics/logs.
- API/SPA routing with strict CSP and security headers on HTML, CSS, JS, and API.
- Committed SQL migration for profiles, opaque messages, encrypted recovery blobs,
  and short-lived rate buckets; indexes, strict tables, limits, duplicate protection,
  profile identity foreign key, and deletion cascades. No write API is exposed.
- Exact dependency pins, portable integrity lockfile, Node 24 policy, separate
  strict browser/Worker/tooling TS configs, ESLint, formatting, Vitest, Playwright,
  loopback development commands, and local D1 migration workflow.
- Secret-free environment examples, ignored local state/secrets/artifacts,
  disabled telemetry/observability/instrumentation, Worker dry-run bundling, and
  deployment guard. Local setup is in `docs/14_LOCAL_DEVELOPMENT.md`.

## Important decisions

- No changes to v1 crypto algorithms or envelope semantics. Phase 0 contains no
  crypto implementation, mock encryption, or placeholder authentication.
- Split `docs/` files are authoritative. `NIBHRITO_MASTER_PLAN.md` remains the
  original planning snapshot; audit decisions are linked from architecture/README.
- Immutable MVP slugs, preserved message `profile_slug` for AAD, epoch milliseconds,
  and generic 409 collisions; identical retry acceptance requires exact matching.
  No replay protection is promised after row deletion/expiry.
- Limits/validation/expiry/ownership must exist from each route's first write,
  despite expanded acceptance suites in later roadmap phases.
- Static `_headers` and Worker middleware keep static requests out of Worker-first
  routing. `/api` and `/api/*` always receive API behavior, including navigation.
- Hono is optional and deferred. Runtime dependencies are React and React DOM only;
  the Worker bundle contains no third-party runtime package.
- TypeScript 6.0.3 is supported by typescript-eslint; TS 7 is currently outside its
  declared range. Tooling-only skipLibCheck handles overlapping runtime declarations;
  browser/Worker projects check source/declarations independently without that escape.
- Stable Wrangler 4.116.0 / Miniflare 4.20260730.0 are pinned with compatibility date
  2026-07-30. Latest Wrangler brings a changed Miniflare 5 alpha API. Exact tool-only
  overrides to Sharp 0.35.4 and Undici 7.29.1 remove known transitive vulnerabilities;
  the clean install, local runtime/browser tests, and full audit pass with them.
- No invented remote D1 ID: the binding is genuinely local-only. Production account,
  DB UUID, secrets, HTTPS hostname, and Cron configuration remain Phase 8 work.

## Verification history (2026-10-03)

| Check                            | Result                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm ci`                         | Pass; repeat install, 227 installed packages, 0 audit vulnerabilities                      |
| `npm run lint`                   | Pass; no warnings                                                                          |
| `npm run format:check`           | Pass                                                                                       |
| `npm run typecheck`              | Pass; browser, Worker, and tooling/test projects                                           |
| `npm run build`                  | Pass; bundled local JS/CSS and SPA HTML                                                    |
| `npm test`                       | Pass; 6 unit tests and 4 real local D1 integration tests                                   |
| `npm run db:migrate:local`       | Pass; 0001_initial.sql applied to local D1                                                 |
| `npm run db:list:local`          | Pass; no pending migration on repeat                                                       |
| `npm run test:e2e`               | Pass; 4 Chromium tests against Wrangler, including CSP inline blocking                     |
| `npm run worker:check`           | Pass; local-only dry-run, 3.28 KiB Worker; no login/deployment                             |
| `npm audit --audit-level=low`    | Pass; 0 known vulnerabilities, including development tree                                  |
| Diff/source/bundle/ignore review | Pass; no real credentials, sensitive logging, storage, broad CORS, or remote scripts found |

Initial failures were fixed: install network timeout/partial native binding,
strict optional response headers typing, incompatible latest Miniflare harness,
transitive dependency advisories, and duplicate E2E port argument. Automatic review
blocked manual generated-file deletion; npm reinstall/isolated lock generation
completed safely instead. No test requirement or security invariant was waived.

## Phase 0 limitations (historical)

- Messaging, browser crypto, key persistence, profile/recovery APIs, authorization,
  expiry handlers, quotas, and rate limiting are not implemented. Their feature
  tests have not run and no acceptance claim is made for them.
- Health checks table presence, not every column/migration integrity. Full migration
  validity is tested through committed SQL/local D1. Existing DB corruption still
  needs operational handling in later phases.
- Browser acceptance currently uses Chromium only; add Firefox/WebKit checks for
  actual Web Crypto and IndexedDB flows, then enforce the production browser matrix.
- Local Vite HMR is an iteration aid; production CSP is verified on built assets
  through Wrangler. Do not handle real secrets in development tooling.
- Tool/runtime pins and overrides require review before production. Full provider
  capacity, backup policy, deployment logging, and staging behavior remain unverified.
- No Cloudflare account/login, remote resource, credentials, domain, challenge config,
  migrations, deployment, or Git remote was created or supplied.

## Phase 0 next-phase handoff (historical)

Phase 1: crypto core. First create its ExecPlan and document exact v1 canonical JSON,
optional fields, strict base64url, UUID/slug formats, recovery checksum, and full
serialized UTF-8 size accounting as required by the audit. Explain any protocol
semantic change before making it. Then implement small React/backend-independent
Web Crypto modules and deterministic vectors plus tamper/wrong-key/malformed-input
tests. Require all phase checks before profile creation/recovery (Phase 2).

## Security deviations

None to implemented privacy/E2EE constraints. Conservative contract refinements and
toolchain decisions are documented above and in the architecture audit. Nibhrito v1
has not been independently audited or deployed.

## Phase 1 completed — 2026-10-03

Documented exact v1 canonical serialization/encoding/checksum limits. Added isolated
Web Crypto key, message and recovery modules; strict shared envelope validation;
non-extractable working keys and private/public consistency checks during recovery.
`npm run check` passed: formatting, lint, all TS projects, builds, 41 Vitest tests
(31 crypto cases), 4 Chromium E2E tests, Worker dry-run and 0-vulnerability audit.
Diff review found no secret logging, remote calls, browser secret storage, or crypto
algorithm changes. Next: Phase 2 authenticated profiles, IndexedDB and recovery UI.

## Phase 2 completed — 2026-10-03

Implemented atomic profile/recovery storage, strict byte-limited schemas, same-origin
write checks, independent bearer-token hashing/owner authorization, public metadata
and encrypted recovery endpoints. Browser setup requires saved-code confirmation,
persists a non-extractable CryptoKey/token in IndexedDB, and restores on a new context.
Responsive semantic screens and error states are in place. `npm run check` passed:
55 Vitest tests, 5 Chromium tests, all lint/format/TS/build/dry-run checks and audit.
Network/storage assertions found no plaintext private JWK or recovery secret.
Only explicit owner requests send the bearer token. Reviewed diff; no security waiver.
Next: Phase 3 verified fragment handling, opaque encrypted submission and local QR.

## Phase 3 completed — 2026-10-03

Verified full fragment links, local QR, Unicode byte-limited sender, browser-only
encryption, opaque storage, server expiry and atomic 500-message quota. Exact retries
are acknowledged; conflicting UUIDs reject safely. Fragment changes reload and clear
the composer before re-verification. Full check passed: 72 Vitest / 6 Chromium tests,
lint/format/TS/build/Worker dry-run and zero-vulnerability audit. Network and real D1
tests confirm ciphertext-only submission/storage. Diff reviewed: no sensitive logs,
fallback keys or remote QR/scripts. Next: Phase 4 owner-scoped inbox and lifecycle.

## Phase 4 completed — 2026-10-03

Owner-scoped ciphertext inbox, bounded cursor pagination, client-only decryption,
in-memory search/mood filters, safe text rendering, corruption errors and message
deletion. Added profile settings/pause/delete with immutable identity/key/auth, SQL
cascades, local profile selection, screen lock and device forgetting. Full check:
83 Vitest and 6 Chromium tests; successful second-context recovery decrypts a stored
note; injected corruption displays no partial text; HTML stays inert; decrypted text
is absent from persistent browser storage. Fixed empty Worker DELETE streams with a
bounded body check; nonempty bodies still reject. Diff/privacy review passed.
Next: Phase 5 indexed bounded cleanup and concurrent quota tests.
