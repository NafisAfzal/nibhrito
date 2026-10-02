# Phase 0 ExecPlan: repository and local platform

## Purpose and user-visible outcome

Turn the planning-only repository into a reproducible local React SPA and Cloudflare
Worker with a real D1 schema and `/api/v1/health`. This phase accepts no messages or
keys and offers no simulated profile, authentication, or encryption flows.

## Existing behavior and relevant files

There was no Git repository, package manifest, implementation, or tool configuration.
Read AGENTS.md and all user-requested documentation in order, then docs/01_MASTER_PLAN.md
and docs/11_SOURCES.md. Node 24.14.1, npm 9.6.4, and Git 2.45.2 are available on Windows.
Preserved the original planning pack in a baseline Git commit. Follow docs/06 phase order.
Architecture audit and conservative resolutions are in docs/13_ARCHITECTURE_REVIEW.md.

## Security invariants that must remain true

Plaintext, private keys, recovery secrets, and decrypted content never enter server
code or storage. No remote scripts, telemetry, request logging, broad CORS, fake auth,
or crypto substitutes. Strict CSP applies to API and static assets. No production
credentials or invented remote database identifiers. Dependency versions and lockfile
are committed. Browser, Worker, and tooling TypeScript environments stay separate.

## Exact implementation steps

1. Record audit decisions and refine API/architecture documentation before coding.
2. Add exact dependency pins, lockfile, ignores, LF conventions, Node policy, strict
   TypeScript projects, ESLint, Prettier, Vite React/Tailwind, Vitest, and Playwright.
3. Add a small localized foundation page without functional messaging controls.
4. Add a native Worker handler with health and JSON API errors, no body logging,
   security headers, and generic failure responses. Use a readiness repository for D1.
5. Configure static asset SPA fallback, Worker-first API paths, and static `_headers`.
6. Commit initial SQLite migration with tables, indexes, FK cascades, and constraints.
7. Add local-only Wrangler configuration, environment examples, and deployment guard.
8. Validate production build and dry-run bundling, local migrations, unit tests,
   local D1 integration tests, and real-browser Worker/SPA/security-header tests.
9. Review diff, dependency audit, and sensitive code/config exposure; update status
   and this plan with exact evidence, then commit the completed phase.

## Data/schema changes

Migration 0001 creates profiles, messages, recovery_blobs, and rate_limit_buckets
from docs/05. Store timestamps as epoch milliseconds. Profiles have immutable slugs;
messages retain their profile slug for exact AAD reconstruction. Foreign keys cascade
on profile deletion. No plaintext/private-key/recovery-secret columns exist.

## API changes

Only GET/HEAD `/api/v1/health`, returning `{ok:true,data:{status:"ok"}}` after a
repository readiness check. Invalid health query/body, unsupported methods, unknown
API paths, and database failures receive bounded generic JSON errors and no caching.
No health database identifiers, counts, or exceptions are exposed.

## Test plan

Unit tests check header application and generic handler failure behavior. Integration
tests run migrations against real local D1 via Miniflare, test schema constraints,
indexes/cascades, readiness, and API behavior. Playwright launches built assets through
Wrangler on loopback, tests SPA deep links, health/method/404 behavior, static/API
headers, same-origin bundled resources, and CSP rejection of inline scripts. Run lint,
format check, strict typecheck, build, test:unit, test:integration, test:e2e, dependency
audit, and Worker dry-run before completing the phase. No security feature acceptance
is claimed before that feature is implemented and tested in its own phase.

## Rollback/migration notes

No production resources exist. Revert the scaffold commit to roll back implementation.
Local data is ignored; use an isolated in-memory integration DB. Never rewrite an
applied migration. Before deployment create a real D1 database, supply its binding
in a separate production config, apply remote migrations explicitly, and validate
headers. Do not run login or provisioning in Phase 0.

## Acceptance criteria

All Phase 0 roadmap criteria pass: build succeeds; Worker serves SPA/API locally;
test commands exercise assertions; migration produces real local D1 schema; CSP and
security headers are visible in actual local HTTP and browser responses. Status
lists evidence, limitations, decisions, and Phase 1 as next.

## Progress log

- 2026-10-03: Read required documents and inspected repository/toolchain. Created
  baseline commit. Audit found clarifications but no need to replace v1 primitives.
- 2026-10-03: Implemented the React/Vite/Tailwind SPA, native Worker routes and
  headers, readiness repository, local D1 config/migration, strict tooling,
  environment examples, and deployment boundary. No crypto/write/auth endpoints.
- 2026-10-03: Clean npm ci succeeded. Lint, all strict TS projects, production
  build, 6 unit tests, 4 local D1 integration tests, and 4 Chromium E2E tests passed.
  Local migration applied and a second listing showed none pending. Full npm audit
  reports 0 vulnerabilities. Worker dry-run produced 3.28 KiB without runtime npm
  dependencies. Reviewed source/bundled Worker, ignored paths, and diff for secrets.
- Final configuration/format/diff review and phase commit pending.

## Decisions and surprises

- Native Worker routing is sufficient for this slice; Hono is optional.
- Static asset headers must be set separately from Worker-generated API headers.
- Keep all deployment/provisioning outside this local phase; no credentials needed.
- TypeScript 7 is outside typescript-eslint's supported range; pin supported TS 6.
- Latest Wrangler 4.147 pulls Miniflare 5 alpha with a changed harness API. Pin the
  last stable matching pair Wrangler 4.116 / Miniflare 4.20260730.0 and freeze
  compatibility_date at 2026-07-30; review updates explicitly before deployment.
- The first install timed out and left a native binding that Windows could not
  load. Use npm ci to recreate generated dependencies and verify repeat installs.
- Stable Miniflare pins vulnerable sharp 0.35.2 and undici 7.28.0. Override these
  tool-only dependencies to patched 0.35.4 and 7.29.1; require runtime checks and
  a clean full dependency audit before accepting this stable pair.
- Automatic review rejected manual deletion of generated dependencies/lockfile.
  Use npm's reinstall workflow and isolated lockfile generation instead.
- Playwright initially passed a second port to the fixed-port dev script. Launch
  Wrangler directly in the test runner with one port; browser tests then passed.
- Output dry-run Worker bundles to .wrangler, outside the static asset directory.
  Disable dependency upload instrumentation independently of CLI usage metrics.
