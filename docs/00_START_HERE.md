# Start here

Nibhrito's MVP is implemented. Begin with the [root README](../README.md) for the
product, privacy boundary and quick start, then use the [documentation index](README.md)
to find the relevant technical reference.

## Run locally

Clone the repository into a directory you control. From its root, with Node
24.14.1 and npm >=9:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Open <http://127.0.0.1:8787>. Local development requires no cloud login.
Use synthetic messages and keep recovery codes private.
See [local development](14_LOCAL_DEVELOPMENT.md) for migrations, iteration and tests.

## Before changing code

Read [AGENTS.md](../AGENTS.md), the [master plan](01_MASTER_PLAN.md),
[protocol](03_E2EE_PROTOCOL.md), [threat model](04_SECURITY_THREAT_MODEL.md),
[data/API contract](05_DATA_API.md), [roadmap](06_IMPLEMENTATION_ROADMAP.md)
and [testing requirements](09_TESTING_ACCEPTANCE.md). Consult
[PROJECT_STATUS.md](../PROJECT_STATUS.md) before starting a phase: do not reimplement
completed work or change the protocol without a documented security review.

The split documentation and recorded architecture decisions describe the current
implementation. [NIBHRITO_MASTER_PLAN.md](../NIBHRITO_MASTER_PLAN.md) preserves the
initial planning snapshot; proposed modules there are not a literal file inventory.

## Maintainer infrastructure

`.agent/` contains execution-plan requirements and completed engineering records.
`prompts/` preserves initial implementation and security-review prompts. These are
development aids, not installation requirements. The initial implementation prompts
describe past work; follow current project status when resuming maintenance.

Keep the working Git repository outside live file-sync folders that might conflict
with `.git` metadata. Back up exports separately, and never commit databases,
recovery material, environment secrets or private QA artifacts.

## Release boundary

Local release QA is complete. Cloudflare deployment and live acceptance remain
pending; repository publication does not complete them. Follow
[release acceptance](20_RELEASE_ACCEPTANCE.md) and
[deployment operations](16_DEPLOYMENT_OPERATIONS.md) before launching a service.
