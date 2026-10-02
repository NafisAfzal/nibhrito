# Phase 5 ExecPlan: expiry and quotas

## Purpose and user-visible outcome

Expired notes remain unavailable and are removed in bounded background batches.
Concurrent send attempts cannot exceed 500 active messages per profile.

## Existing behavior and relevant files

Phases 0–4 pass; docs/05,06,07,09 inspected. Authoritative expiry, indexes, query
exclusion and atomic INSERT quota already exist. No cleanup handler yet.

## Security invariants that must remain true

Cleanup never reads ciphertext into memory/logs; no API exposes expired rows.
Expired rows may remain in provider backups. No unbounded invocation loops.

## Exact implementation steps

Repository cleanup with indexed subqueries LIMIT 100; scheduled handler does one
batch for messages and buckets. Opportunistic send cleanup at most 10 rows before
insert, no extra privilege. Add Cron hourly and tests for backlog/retry/quota races.

## Data/schema changes

Existing indexes/tables only. No migration.

## API changes

None. Server expiry and quota behavior remain authoritative.

## Test plan

Real D1 501 concurrent attempts, expired quota release, cleanup >100 backlog,
unexpired isolation, rate bucket deletion and repeated scheduled invocations.
Full check gate including browser journey.

## Rollback/migration notes

Disable Cron/revert handler if necessary; query expiry still protects reads.

## Acceptance criteria

Batch sizes bounded; deletion idempotent; concurrent quota cannot overshoot.

## Progress log

2026-10-03: Starting after Phase 4 acceptance.

## Decisions and surprises

One batch per scheduled invocation avoids unlimited CPU work. Production CPU and
backlog monitoring remain deployment smoke requirements, not locally proven limits.
