# Nibhrito Project Status

Updated 2026-10-03. This file and the phase ExecPlan are the persistent handoff;
no chat history is required to continue.

## Current phase

Phase 0 complete. Final configuration, diff, and secret-exposure reviews passed;
changes are recorded in logical Git commits. Phase 1 has not started. This is a local application
foundation, not a production-ready messaging product.

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

## Known limitations and remaining work

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

## Next phase

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
