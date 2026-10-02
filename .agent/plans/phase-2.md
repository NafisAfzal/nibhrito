# Phase 2 ExecPlan: profile creation and recovery

## Purpose and user-visible outcome

Create a recipient profile, save a recovery code, persist non-extractable keys,
and restore ownership/decryption on a fresh browser. No password/email account.

## Existing behavior and relevant files

Phase 1 crypto is committed. Follow docs/02, 03, 05, 09, 12 and 13. Initial D1
schema exists; Worker only handles health; client shows foundation landing.

## Security invariants that must remain true

No private JWK/recovery secret uploads. Token verifier never accepted as bearer.
Validate and byte-limit requests; transactions; scoped ownership; no sensitive logs.
IndexedDB contains working CryptoKey/token/public identity only, never plaintext messages.

## Exact implementation steps

Add shared profile schemas; bounded JSON/CSRF/auth helpers; repository and profile
creation/public/owner/recovery routes. Add IndexedDB lifecycle, same-origin API client,
responsive setup/confirmation/dashboard/restore screens. Test before proceeding.

## Data/schema changes

Use existing tables. Atomic profile + recovery insertion, unique verifier and slug.

## API changes

POST profiles, GET public profiles/recovery, GET authenticated /owner. Profile
PATCH/DELETE will use scoped authorization in the management slice.

## Test plan

API malformed/oversize/unknown/CSRF/unauthorized tests against local D1;
browser setup/save/restore, inspect requests for no private JWK/code, test IndexedDB
non-extractability and restore with wrong code. Full existing phase gates.

## Rollback/migration notes

No schema migration. Revert phase. Recovery code is the only recovery capability.

## Acceptance criteria

Saved recovery restores keys/token; no backend plaintext key/secret; real auth/DB tests.

## Progress log

2026-10-03: Phase 1 passed and committed; implementing.
2026-10-03: Complete. Full check passes (55 Vitest / 5 Chromium / zero advisories).
Reviewed upload/storage boundaries and owner auth; proceeding immediately to Phase 3.

## Decisions and surprises

Confirm saved recovery before profile POST; interrupted server/local persistence is
recoverable with the saved code. Full-page navigation clears temporary sensitive state.
