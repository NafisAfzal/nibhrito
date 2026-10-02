# Phase 7 ExecPlan: hardening, legal UX and local portability

## Purpose and user-visible outcome

Complete a coherent accessible product with accurate legal/privacy/security pages,
explicit browser failure states, encrypted backup/export and adversarial review.

## Existing behavior and relevant files

Phases 0–6 pass. Re-read docs/03,04,08,09,10,12 and prompts/SECURITY_REVIEW.txt.
Core flows work; legal links are 404, old copy/docs are historical, one browser tested.

## Security invariants that must remain true

No protocol/algorithm change, no plaintext/key export or upload. No remote scripts,
no HTML rendering, strict headers. File import is capped/validated before decryption.
Recovery code stays local. Operator contact must be supplied, never fabricated.

## Exact implementation steps

Add public operator configuration and complete legal/security/contact pages. Centralize
copy for localization, refine responsive/dark/focus states, unsupported-browser/error
boundary and memory handling. Add versioned encrypted-file backup and local reading
using existing recovery/envelopes, no new crypto primitive. Expand real-browser tests
to Firefox/WebKit, accessibility/mobile behavior and storage/network/XSS checks.
Perform adversarial audit, fix Critical/High and reasonable Medium findings, document.

## Data/schema changes

Migration 0002 adds aggregate counts with insert/delete triggers for profiles,
messages and rate buckets. Atomic guards cap global physical messages at 20000,
profiles at 10000 and buckets at 2000 without hot full scans. No identifying data.
Backup wraps existing encrypted recovery/messages plus public slug/timestamps;
it is a local copy and is not deleted when server rows expire. Cap 4 MiB/500 messages.

## API changes

Public /site endpoint returns configured operator/contact/jurisdiction only. Production
rejects insecure API transport and missing public operator configuration at deployment.

## Test plan

File round trip, wrong code/corruption/schema/size/duplicate/profile binding; no private
key/secret/plaintext in backup. Browser setup/send/read/restore/delete across engines,
offline backup decryption, XSS, CSP, failed fragment substitution, keyboard/mobile.
Full gate, dependency audit and source/bundle secret/privacy scan.

## Rollback/migration notes

Apply additive migration 0002 before the new Worker. Do not roll back counters while
the new Worker references them. Prior Worker can use the additive schema; triggers
alter D1 meta.changes, so use explicit RETURNING statements to count affected rows.
New local backup version is independent from cryptographic v1. Do not
change existing envelopes. Retain old client build for emergency rollback.

## Acceptance criteria

Working legal links, accurate claims, accessible core flow, browser compatibility,
all locally fixable Critical/High findings resolved and regression tested.

## Progress log

2026-10-03: Starting after Phase 6 acceptance and commit.

Completed: full check passes (103 Vitest / 27 E2E across three engines), local 0002
migration, Worker dry run and zero-vulnerability audit. SECURITY_REVIEW.md records
resolved findings and disclosed architectural limits. Visual desktop/mobile light
and dark review passed using only public empty forms; no secret-bearing screenshots.
Privacy source/tracked-secret check and diff review passed. Proceed to Phase 8.

## Decisions and surprises

User explicitly requests encrypted export/import locally; implement portability here
without waiting for post-launch metrics. Other Phase 9 options remain post-launch.
Legal content is a technical baseline; operator identity/contact/jurisdiction and
jurisdiction-specific legal review are external launch requirements.

SQLite triggers contribute to D1 meta.changes. Explicit RETURNING counts actual
affected rows; tests cover counter/cascade consistency and concurrent final capacity.
Lifecycle testing found duplicate inbox/settings sibling keys; distinct names fix
DOM duplication and stale settings. Same-URL fragment navigation may not refetch a
profile; browser tests open a fresh document when checking updated public settings.
