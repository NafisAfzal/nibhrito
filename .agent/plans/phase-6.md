# Phase 6 ExecPlan: privacy-preserving abuse resistance

## Purpose and user-visible outcome

Limit bot bursts and database growth without retaining source addresses or tracking.
Normal windows recover; owners can already pause incoming messages.

## Existing behavior and relevant files

Phases 0–5 pass. Re-read docs/04,05,06,07,08,09 and Cloudflare header reference.
Size validation/500-active quota exist; rate table is unused and indexed for cleanup.

## Security invariants that must remain true

Only trusted edge address transiently processed; no raw IP/logs. Fail closed without
production secret/address. No external challenge scripts or fingerprinting.

## Exact implementation steps

Normalize IPv4 /32 and IPv6 /64, derive daily HMAC key from root secret, store only
opaque per-scope buckets. Atomic limited UPSERT counters, global-first policy then
network then profile. Reject cross-site requests before counting; rate API work
before expensive validation and validated writes afterwards. Add
creation/global storage caps and locked-down challenge feature flag. Secure local
secret initializer writes ignored .dev.vars exclusively; no sample/fallback secrets.

## Data/schema changes

Use existing rate table, capped at 2000 rows, one-hour retention after window;
global day buckets 25h max.
Profile hard ceiling 10000, daily creation cap 100. No migration.

## API changes

Generic 429 with coarse Retry-After; no scope/bucket disclosure. Production rejects
unexpected Worker subrequests and unavailable edge metadata. Local loopback uses one
shared bucket, explicitly local-only. Existing auth and origin protections unchanged.

## Test plan

HMAC independent vector, IPv4/6 canonicalization, day rotation, malicious forwarded
headers, atomic counter races/reset/cleanup, real API bursts and no raw address in D1.
Full gate and local browser flows with fresh securely generated local secret.

## Rollback/migration notes

Rotate secret rather than disable limiting; rotation resets network counters.
No schema changes. Global/profile counters survive secret rotation.

## Acceptance criteria

429 bursts, window reset, no IP persistence, secret failure closed, finite storage.

## Progress log

2026-10-03: Starting after Phase 5 commit.

Completed: full check, 93 Vitest / 6 Chromium, no-vulnerability audit. Bucket ceiling
prevents backlog growth. Cross-site rejection precedes counters. Forwarded/auxiliary
IPv6 headers ignored; production uses only CF-Connecting-IP. Explicit loopback-only
allowances preserve usable local tests without loosening production limits.

## Decisions and surprises

Daily keys are HMAC(root, day-domain); daily separation is not forward secrecy if
root is compromised. IPv6 /64 grouping discourages address rotation; shared networks
may throttle legitimate users. Direct edge deployment only, no untrusted Worker proxy.
