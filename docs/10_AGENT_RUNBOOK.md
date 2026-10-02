# 10 - AI Coding Agent Runbook

## Objective

Turn the planning repository into a production-ready MVP without silently redesigning security assumptions.

## Read order for an agent

1. `AGENTS.md`
2. `docs/00_START_HERE.md`
3. `docs/01_MASTER_PLAN.md`
4. `docs/03_E2EE_PROTOCOL.md`
5. `docs/04_SECURITY_THREAT_MODEL.md`
6. `docs/05_DATA_API.md`
7. `docs/06_IMPLEMENTATION_ROADMAP.md`
8. `docs/09_TESTING_ACCEPTANCE.md`
9. relevant remaining docs

## Before coding

The agent should write a short repository-local implementation note or ExecPlan for the current phase, then inspect the working tree and available toolchain.

It should not ask the user to choose ordinary implementation details already decided in these docs.

## Commit strategy

Suggested commits:

```text
chore: scaffold web and worker project
test: add E2EE protocol vectors
feat: implement browser crypto protocol
feat: add profile creation and recovery
feat: add verified encrypted message sending
feat: add encrypted inbox and deletion
feat: add expiry cleanup and quotas
feat: add privacy-preserving abuse controls
security: harden headers and client rendering
docs: add legal and security pages
chore: prepare Cloudflare production deployment
```

## Mandatory review points

Pause and self-review after:

- crypto protocol,
- recovery implementation,
- owner authorization,
- message retrieval/deletion ownership checks,
- CSP/security headers,
- production deployment.

## Forbidden shortcuts

- storing plaintext “temporarily” server-side,
- logging request bodies to debug message submission,
- storing keys in localStorage,
- fetching a replacement recipient public key when share fragment is invalid,
- using a home-grown cipher,
- disabling certificate/HTTPS verification,
- broad `Access-Control-Allow-Origin: *`,
- adding Firebase Analytics, Google Analytics, Meta Pixel, Hotjar, etc.,
- adding attachments before MVP release,
- creating a password/email auth system without architecture revision.

## If blocked

Prefer the simplest solution that preserves the documented security properties. Record any unavoidable deviation in `PROJECT_STATUS.md` and explain why.

## Definition of agent success

The best implementation is not the one with the most features. It is the one whose behavior can be independently verified against the protocol and threat model.
