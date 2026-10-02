# AGENTS.md

These instructions apply to the entire Nibhrito repository.

## Mission

Build Nibhrito as a small, auditable, privacy-first anonymous feedback platform. Do not trade away the E2EE model for convenience.

## Required reading before coding

Read:

- `docs/00_START_HERE.md`
- `docs/01_MASTER_PLAN.md`
- `docs/03_E2EE_PROTOCOL.md`
- `docs/04_SECURITY_THREAT_MODEL.md`
- `docs/05_DATA_API.md`
- `docs/06_IMPLEMENTATION_ROADMAP.md`
- `docs/09_TESTING_ACCEPTANCE.md`

For any complex feature or significant refactor, use an ExecPlan according to `.agent/PLANS.md`.

## Non-negotiable security rules

1. Plaintext messages must never be sent to the backend.
2. Recipient private encryption keys must never be sent to the backend in plaintext.
3. Recovery secrets must never be sent to the backend.
4. Never log message plaintext, private keys, recovery secrets, bearer owner tokens, ciphertext bodies, or raw IP addresses.
5. Never store private keys in `localStorage` or `sessionStorage`.
6. Do not load remote JavaScript, analytics, tag managers, ad scripts, or CDN scripts on encryption/decryption routes.
7. Do not invent cryptography. Follow `docs/03_E2EE_PROTOCOL.md` exactly.
8. AES-GCM IVs must be random 96-bit values and never reused with the same key.
9. All API input must be schema-validated and byte-size limited.
10. All DB queries must be parameterized.
11. Use same-origin API calls. Do not enable broad CORS.
12. Decrypted message text must be rendered as text, never as trusted HTML.
13. Dependency versions must be locked. Avoid unnecessary packages in crypto and security-sensitive code.
14. No attachments in MVP.
15. No password/email account system in MVP unless the architecture documents are explicitly revised first.

## Engineering rules

- TypeScript strict mode.
- Minimal dependencies.
- Small modules with explicit interfaces.
- Prefer native Web APIs in the crypto path.
- Keep crypto serialization deterministic and versioned.
- Keep backend storage behind a repository interface so D1 can be replaced later.
- Use SQL migrations committed to source control.
- Write tests before or alongside security-sensitive implementation.
- Run unit, integration, typecheck, lint, and E2E checks before declaring a phase complete.
- Update `PROJECT_STATUS.md` after each completed phase.
- Make small, reviewable commits. Do not mix unrelated refactors into feature commits.

## Phase discipline

Implement in the order in `docs/06_IMPLEMENTATION_ROADMAP.md`.

Do not begin the next phase until the current phase acceptance criteria pass. If architecture and implementation disagree, stop and resolve the conflict in documentation before proceeding.

## Definition of done

A feature is not done because the UI appears to work. It is done when:

- security invariants hold,
- automated tests pass,
- failure cases are handled,
- no sensitive data appears in logs,
- documentation is updated,
- `PROJECT_STATUS.md` records what changed and what remains.
