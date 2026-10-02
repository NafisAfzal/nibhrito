# Phase 4 ExecPlan: encrypted inbox and owner lifecycle

## Purpose and user-visible outcome

Owners read/decrypt, search/filter and delete private notes, manage settings and
remove their profile or this device. Multiple local profiles are selectable.

## Existing behavior and relevant files

Phases 0–3 pass. Re-read docs/02,03,04,05,06,09,12. Profile auth and message repository
exist; dashboard currently only shares a link.

## Security invariants that must remain true

Auth-derived profile ID scopes every query. Cursor is untrusted input, never ownership.
Plaintext stays in React memory and text nodes. Expired rows are never served.

## Exact implementation steps

Add typed envelope page/cursor validation, scoped indexed pagination/delete,
owner PATCH/DELETE with immutable slug/key/auth fields, complete dashboard/settings,
bounded local decryption and loaded-page search. Clear state on profile change/lock.

## Data/schema changes

No migration. Use existing indexes and cascade deletion.

## API changes

GET inbox with 1–50 limit, validated profile-bound cursor. DELETE messages by UUID.
PATCH/DELETE profiles by UUID require matching authenticated owner. Partial allowed
settings only. Destructive writes enforce same-origin checks.

## Test plan

Real D1 IDOR, unauthorized, cursor tamper/cross-profile, tie ordering, expiry, deletion,
partial schema checks. Browser send→decrypt→inert XSS→delete, corruption fail-closed,
and no decrypted persistent storage. Full check gate.

## Rollback/migration notes

No schema changes. Deleted data cannot be restored by app rollback.

## Acceptance criteria

All owner queries scoped; browser-only decryption; memory-only search; complete flow.

## Progress log

2026-10-03: Starting after Phase 3 commit and full acceptance.

Completed: full check, 83 Vitest / 6 Chromium tests. Real Worker empty DELETE
streams differed from synthetic Requests; bounded empty-stream validation fixes
the production behavior without accepting content. Browser corruption/recovery/
storage/HTML tests and ownership/cursor/expiry/cascade integration checks pass.

## Decisions and surprises

Cursors encode ordering metadata and profile binding, not authentication. Unsigned
cursor changes cannot expand access because SQL always uses authenticated ID.
