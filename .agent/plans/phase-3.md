# Phase 3 ExecPlan: verified share link and sender

## Purpose and user-visible outcome

Recipients share a complete cryptographic URL/QR; senders encrypt locally and get
an acknowledgement only after durable opaque envelope storage.

## Existing behavior and relevant files

Phase 2 profile/recovery/auth works. Read docs/02,03,05,09,12,13. Crypto core tested.

## Security invariants that must remain true

Never fetch replacement key. Strict fragment/slug/version/key validation, fail closed.
No plaintext network/storage. Ciphertext fields remain exact; request cap 12 KiB.

## Exact implementation steps

Implement fragment parser; native point validation; same-origin sender UI with byte
counter and encrypted mood; parameterized message repository with atomic quota/
enable/key checks; exact duplicate acknowledgement; local QR via pinned dependency.

## Data/schema changes

Use existing opaque messages table. Server-only created/expiry timestamps.

## API changes

POST /profiles/:slug/messages accepts v1 envelope only. Identical retry accepted;
conflicting ID returns generic 409. Disabled/full profiles reject with generic errors.

## Test plan

Parser invalid/missing/duplicate/version/off-curve inputs, API malformed/oversize/
wrong binding/duplicates, ciphertext DB round trip. Browser plaintext network absence,
incomplete-link failure and successful encryption/storage. Full phase check gate.

## Rollback/migration notes

No migration. Revert code; v1 ciphertext remains compatible with crypto core.

## Acceptance criteria

No plaintext in upload; valid full fragment required; exact retry safe; quota atomic.

## Progress log

2026-10-03: Starting after Phase 2 acceptance and commit.

Completed: 72 Vitest and 6 Chromium tests, full check gate and privacy diff review.
Found/fixed stale verification on hash-only navigation; regression sender test
exercises incomplete-to-full link change. No protocol changes.

## Decisions and surprises

QR uses dependency-free qrcode-generator 2.0.4, bundled locally, with React SVG paths
instead of injecting HTML. No protocol primitive uses a third-party library.
