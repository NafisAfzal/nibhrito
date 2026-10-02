# Phase 8 ExecPlan: deployment and final local acceptance

## Purpose and user-visible outcome

Deliver a complete locally verified application with exact, guarded Cloudflare
deployment steps, without fabricating external credentials or releasing prematurely.

## Existing behavior and relevant files

Phases 0–7 committed and accepted. Re-read docs/06,07,09,10,13,14,15 and
SECURITY_REVIEW.md. Local config cannot deploy; scripts/deploy.mjs is a guard only.
Production requires actual D1 ID, operator/contact/jurisdiction and server HMAC root.

## Security invariants that must remain true

Never add browser secrets to server configuration. Keep telemetry/logging disabled,
same-origin static/API deployment, native browser crypto and no plaintext fallback.
Production must never silently use local settings, invented IDs or challenge scripts.
No external resource creation/login/deploy or production secret generation by agent.

## Exact implementation steps

Provide reviewed production template and exclusive config generator using actual
operator values and returned DB UUID. Add strict privacy/config validation before
any deploy action; build and invoke pinned Wrangler explicitly with production config.
Make local dry run stay local. Verify export/import of disposable encrypted D1 data
including counter triggers. Isolate E2E state so repeated tests cannot throttle local
development profiles. Document provisioning, secrets, migrations, Cron, HTTPS,
live acceptance, incident response, backup/rollback and operational limits. Update
implementation summary, README, local guide and status. Clean-install final checks.

## Data/schema changes

No new schema. Verify both committed migrations and dump restoration. Reconcile
aggregate counts in maintenance after any external restore/import; no private keys
or plaintext messages in SQL exports. Protect SQL backups even though encrypted.

## API changes

None. Production secret metadata validation and real edge smoke test remain external.

## Test plan

Unit tests reject unsafe config drift, secret-in-vars, fictional IDs, invalid operator
email/name, unknown options and unsafe routes/proxies. Validate template against
installed Wrangler schema. Native local D1 export/import into isolated storage with
count/trigger comparison. All unit/integration/crypto/browser/security checks,
build/dry run/audit/secret scan from root after npm ci. Review final diffs/bundles.

## Rollback/migration notes

Schema is additive. Worker rollback does not restore D1 or undo migrations. Restore
only with writes paused, a tested separate database and explicit operator action;
avoid resurrecting deleted content or resetting rate budgets. Keep audited assets
and protocol unchanged. A production release tag requires live acceptance.

## Acceptance criteria

All local functionality and checks complete, documented and committed. Config
generator/guard tested without supplying invented credentials. Exact remaining
operator actions identified. Do not claim live Phase 8 acceptance or tag v1.0.0.

## Progress log

2026-10-03: Starting after Phase 7 commit 3f1515e. External credentials not supplied.

Completed locally: clean npm ci, both migrations/no pending migration, full npm run
check passes (111 Vitest in 17 files / 30 E2E across three engines, no retries/skips),
strict typecheck/lint/format/privacy scan, build, Worker dry run and zero-vulnerability
audit. Native SQL export restores and decrypts actual protocol ciphertext and checks
migrations, six triggers and cascades. Diff/import/bundle review passes: no backend
decryption or private-key payload, no raw secrets tracked. Status and implementation
handoff updated. Production config/secret are absent; no fabricated UUID/account.
Stop at actual Cloudflare provisioning/deployment/live acceptance, not a local gap.

## Decisions and surprises

Do not use temporary unauthenticated Cloudflare deployments. Production legal
identity and contact are public configuration; HMAC secret is server-only. Original
Phase 9 remains conditional post-launch except user-authorized encrypted backups,
already implemented. Production free-tier CPU/quota behavior needs real staging.

Pinned Wrangler supports code+secret upload together, but local d1 export has no
persist-to option. Portability uses separate config-relative disposable states.
E2E state/root is isolated from developer D1 to avoid quota interference. Tool TS
uses Node 24 native stripping; generated .jsonc files use strict JSON for the guard.
Native clipboard absence now offers manual full-link copying; contact mailboxes
are URI-encoded to avoid mailto query/header interpretation. Both are browser-tested.
Package is 1.0.0-rc.1; no v1.0.0 tag until actual production gates pass.
