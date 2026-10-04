# Contributing

Small, focused changes are easiest to review. Read the [README](README.md),
[project status](PROJECT_STATUS.md) and [AGENTS.md](AGENTS.md) first. Discuss changes
to product scope or architecture before implementing them. Follow the existing
roadmap and avoid mixing unrelated refactors into a fix.

## Setup and checks

Use Node 24.14.1 from `.node-version` and npm >=9:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Before a pull request:

```sh
npm run check
npm run repository:check
# When Microsoft Edge is installed:
npm run test:edge
```

On Linux, `npx playwright install --with-deps chromium firefox webkit` also installs
required system libraries. See [local development](docs/14_LOCAL_DEVELOPMENT.md).
Keep locked versions and the lockfile; do not commit generated files or secrets.

## Security-sensitive changes

Plaintext feedback, private keys and recovery secrets must stay within the browser
boundary. Preserve same-origin calls, inert text rendering, non-extractable working
keys, strict schemas/byte caps and parameterized repository queries. Do not add
remote scripts, analytics or plaintext debugging.

Write tests before or alongside changes to crypto, recovery, authorization, input
validation or persistence. Cryptographic/protocol changes require explicit security
review, updated normative documentation and an interoperability/migration plan.
Use an [ExecPlan](.agent/PLANS.md) for complex features or significant refactors.
Report vulnerabilities through [SECURITY.md](SECURITY.md), not public issues.

## Pull requests

Describe the problem, resulting behavior and checks actually run. Include relevant
failure cases and security/privacy effects. Use synthetic fixtures; never attach
private UI or test artifacts. Keep existing security assertions and artifact
protections enabled. Update affected docs and `PROJECT_STATUS.md` for completed work.

Maintainers review dependency updates; passing CI does not authorize automatic
merging or Cloudflare deployment. No software license has been selected yet;
publication and contributions do not establish a new licensing decision.
