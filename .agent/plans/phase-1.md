# Phase 1: crypto core ExecPlan

## Purpose and user-visible outcome

Provide tested browser-only v1 encryption and recovery primitives for subsequent flows.

## Existing behavior and relevant files

Phase 0 is committed. Follow docs/03, 04, 09 and 13; no crypto code exists yet.

## Security invariants that must remain true

Native Web Crypto only. Plaintext/private keys/recovery secrets remain client-side.
Fresh ephemeral key, random 32-byte salt and 12-byte IV per encryption; exact AAD.
Validate before import/decrypt; no partial plaintext, fallback, or secret logging.

## Exact implementation steps

Document serialization clarification; implement shared strict encoding/envelopes;
isolate key generation, message/recovery encryption, verified fragments and keyring
interfaces; add deterministic vectors and negative tests; run all phase checks and commit.

## Data/schema changes

None. Respect existing 4096-byte serialized-message and 8192-byte recovery bounds.

## API changes

None. All cryptographic operations are local library functions.

## Test plan

Known encoding/key/AAD vectors, round trips, Unicode, byte boundaries, fresh entropy,
tampered ciphertext/tag/IV/salt/AAD, wrong keys, malformed points/versions/envelopes,
wrong recovery code and corrupted bundles. Run lint/typecheck/unit/integration/build/E2E.

## Rollback/migration notes

Revert this phase; no production ciphertext exists. No v1 primitive/envelope change.

## Acceptance criteria

All Phase 1 protocol tests pass; no UI/backend dependencies in crypto; failures closed.

## Progress log

2026-10-03: Reviewed current source and documentation; implementing serialization clarification.
2026-10-03: Implemented and reviewed; full `npm run check` passed (41 Vitest,
4 Chromium tests, 0 dependency advisories). Phase complete; proceeding to Phase 2.

## Decisions and surprises

Recovery codes use fixed-length parsing, since base64url itself contains hyphens.
Validate private/public consistency using a fresh native ECDH comparison before restore.
