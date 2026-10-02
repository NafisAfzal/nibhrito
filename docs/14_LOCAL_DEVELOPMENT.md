# Local foundation development

Use Node 24.14.1 or a later Node 24 patch (see `.node-version`) and npm >= 9.
Run commands in the repository root. Dependencies are pinned in package.json and
package-lock.json; use `npm ci` for repeat installs. No Cloudflare account, login,
secret, remote database, or domain is required for Phase 0.

```powershell
npm ci
npm run db:migrate:local
npm run dev
```

Open `http://127.0.0.1:8787`. `GET /api/v1/health` checks that all four application
tables exist through the real D1 binding. An unmigrated database returns generic 503. This is a readiness probe, not a full migration-integrity check. No user data
or internal diagnostics are returned. The only implemented API is health.

`npm run dev` builds the SPA and serves it with Wrangler; rerun after client changes.
Wrangler reloads Worker changes. For faster UI-only iteration, keep `npm run
dev:worker` running after a build and start `npm run dev:web` in another terminal.
Vite proxies `/api` to Wrangler at the same browser origin. Its development runtime
uses HMR scripts/styles; validate production CSP exclusively against built assets
served by Wrangler. Do not use real recovery codes or private messages in dev tools.

## Configuration and state

- `wrangler.jsonc` binds DB locally without a remote `database_id`. Persisted local
  database state lives under ignored `.wrangler/state`. Migration commands always
  include `--local`. `npm run db:list:local` lists applied/pending migrations.
- Phase 0 requires no environment variables. `.env.example` explains that `VITE_*`
  is public. Same-origin API paths need no external host setting.
- Copy `.dev.vars.example` to ignored `.dev.vars` only when a later phase requires
  local Worker secrets. Browser keys, owner tokens, and recovery secrets are user
  material and must never become server configuration.
- Wrangler metrics, dependency instrumentation, and persisted Worker observability/invocation logs are disabled.
  No application console/request logging exists. Local tool diagnostics and browser
  developer tools are not private storage. Providers still process network metadata.
- Static asset responses use `public/_headers`; API responses use Worker middleware.
  A unit test prevents policy drift. The CSP has no inline/eval/remote-script exception.
- Browser, Worker, and tooling TypeScript configs have separate environment types.
  `skipLibCheck` applies only to tooling where Node/DOM/Workers test-proxy declarations
  overlap; application and Worker source are checked strictly in separate projects.
- Wrangler 4.116.0 and matching Miniflare 4.20260730.0 use a stable test/runtime API.
  Compatibility behavior is frozen at 2026-07-30. The latest Wrangler at scaffold
  time depends on Miniflare 5 alpha; review that migration separately before release.
  Exact overrides patch Miniflare's Sharp and Undici dependencies to 0.35.4 and
  7.29.1. These are development tools, absent from the browser/Worker bundles.
  Keep the full audit and runtime tests passing when updating them.

## Verification

Install the E2E browser once (or after a Playwright upgrade):

```powershell
npx playwright install chromium
npm run check
```

Individual commands: `lint`, `format:check`, `typecheck`, `build`, `test:unit`,
`test:integration`, `test:e2e`, `worker:check`, and `npm audit --audit-level=low`.
`npm test` runs both Vitest layers. Integration tests use a disposable in-memory
local D1 runtime, apply the committed SQL, and check constraints/cascades/readiness.
The E2E runner applies local migrations and starts its own Wrangler at 8788; no
existing server is reused. E2E tests use only foundation fixtures and never store
traces, screenshots, or videos, since later flows will contain secrets.

No crypto, auth, abuse limits, or encrypted-message tests are claimed yet. Implement
and validate those in phase order. Other browser engines are part of later feature
acceptance and the production release gate.

## Production boundary

`npm run deploy` intentionally exits with instructions; no production config exists.
`worker:check` builds and bundles with `wrangler deploy --dry-run`; it performs no
remote deployment or provisioning. Its output is ignored build data.

At Phase 8 the operator must supply a Cloudflare account and login, create the real
D1 production database, and provide its returned UUID in a reviewed production
configuration based on the local config. Keep production config independent of local
state, configure required secrets with Wrangler secret management, enable the chosen
HTTPS hostname, apply remote migrations explicitly, add cleanup Cron, and run the
documented staging/production gates. Do not use an invented ID or fall back to local
DB for deployment. No automatic login, remote migration, deployment, or secret upload
is part of the Phase 0 commands.
