# Local development

Use Node 24.14.1 or a later Node 24 patch and npm >=9. Run from the repository root.
Versions/integrity are locked; use npm ci. No Cloudflare login or credentials needed.

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run check
npm run dev
```

Open `http://127.0.0.1:8787`. Dev generates an ignored **local server** HMAC root,
applies both migrations, builds the SPA and runs the actual Worker/D1. Recipient
keys/recovery codes are browser material, never Worker variables. Save recovery
codes privately: no operator reset exists. Use harmless local feedback.

## Iteration

Wrangler reloads Worker changes. Rerun build/dev for frontend edits. Faster UI-only
iteration: after a build, keep `npm run dev:worker` at 8787 and run `npm run dev:web`
in another terminal (Vite at `http://127.0.0.1:5173`). Vite proxies /api at the same
browser origin. HMR scripts/styles are development tools; test production CSP using
built assets served by Wrangler. Do not enter real sensitive content in dev tools.

## Configuration and persistence

- Local config `wrangler.jsonc` has no remote database ID and disables metrics,
  instrumentation, previews and persisted observability/invocation logs.
- Local D1 state is ignored under .wrangler/state; all dev migrations use --local.
  `npm run db:list:local` lists applied/pending migrations.
- `npm run local:init` exclusively generates .dev.vars with a securely random rate
  root if missing; no hardcoded fallback. Keep this file ignored. Delete/replace only
  for an intentional local rate reset, not to bypass production controls.
- Same-origin API needs no browser environment variables or configurable API host.
  VITE variables are public; never place secrets in them. Production values use
  separate ignored config and secret files, described in docs/16.
- Working recipient key is a nonextractable IndexedDB CryptoKey, with a separate
  owner bearer token. Browser profile storage is user access, not a password lock.
  Private search, notes and drafts remain in memory; forget-device removes local
  access after confirmation. Clearing browser data needs the saved recovery code.
- Application logging is absent. Wrangler/developer tools can show request metadata:
  never record bodies, bearer headers, secrets or private screenshots.
- Public operator config is empty locally; legal/contact pages show an evaluation
  notice. No fake email, entity or jurisdiction is supplied.
- Security headers are enforced by public/_headers on assets and middleware on API.
  Policy drift and injected inline scripts are tested. No inline/eval/remote exception.
- Separate strict browser/Worker/tooling TS projects avoid mixed environment globals.
  Only tooling uses skipLibCheck for Node/DOM/Workers test-proxy declarations.
- Pinned Wrangler 4.116.0/Miniflare 4.20260730.0 and compatibility date 2026-07-30
  use the stable runtime interface. Tool-only overrides patch Sharp/Undici; review
  runtime tests and audit before changing dependencies. No third-party crypto library.

## Verification

`npm run check` runs lint, format/privacy checks, build/typecheck, all Vitest layers,
E2E, Worker dry run and low-threshold dependency audit. Individual commands:
`test:unit`, `test:integration`, `test:e2e`, `db:portability`, `worker:check`.
No remote deployment/provisioning occurs. Vitest uses two workers; Playwright uses
one to bound local runtime/browser memory, with no retries or skipped security cases.

Integration tests apply all committed migrations to disposable real D1 runtimes.
The portability test uses native protocol ciphertext, exports and imports a fresh
D1 fixture through pinned Wrangler, restores/decrypts, and checks migration records,
counter triggers and cascades. It never reads/modifies your development database.

E2E starts a separate loopback Worker at 8788 with isolated .wrangler/e2e-* config,
D1 and test-only rate root; it never reuses your server or your dev profiles. Tests
run in Chromium, Firefox and WebKit, with actual browser crypto and IndexedDB.
Traces, videos, screenshots and secret-bearing DOM failure snapshots are disabled.
Normal shutdown cleans owned test state. An interrupted Windows process tree may
leave ignored fixture directories; remove only after confirming their servers have
stopped. Private browser artifacts should never be enabled casually.

Health checks all five application tables but expose only readiness. It is not a
full migration-integrity check. Missing schema/secrets return generic failure. Cron
is tested by invoking the Worker scheduled handler in integration tests; it does
not automatically run hourly locally.

## Deployment boundary

`npm run deploy` validates the separately generated production config and protected
server root before any build/upload. It fails when these are absent, malformed,
local, telemetry-enabled or placeholders. Use docs/16 for actual Cloudflare login,
real D1 UUID, legal operator details, secret creation, migrations, code/secret upload,
live smoke tests and rollback. `worker:check` is a local bundle dry run and cannot
establish live HTTPS, account settings, Cron delivery or provider CPU billing.
