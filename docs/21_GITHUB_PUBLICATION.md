# GitHub publication

## Scope and baseline

Repository engineering starts from e93fc70, the verified local accessibility/Edge
baseline. Sixteen meaningful development commits are preserved. This phase changes
documentation, repository metadata/hygiene, CI and community guidance only.
E2EE, crypto, API contracts, database behavior and privacy/security guarantees remain
unchanged. No Cloudflare resources, production secrets, deployment or release tag.

## Public-source audit

The initial audit inspected all refs and local reflogs, 201 historical paths and
354 blob versions (2252630 bytes), plus current source, fixtures, examples and plans.
No real credentials, private user messages, databases, private screenshots, logs,
generated output or Wrangler state were found in tracked history. Largest blob:
167979-byte package lockfile. Git loose objects occupied 861 KiB before this phase.

Ignored .dev.vars, dependencies, build output, local Wrangler/D1 state and test
artifacts remain local. Production config/secret files are absent. Examples contain
only comments/placeholders. Deterministic test scalars and fictional text are
deliberate public fixtures, not operational secrets. No history rewrite is needed.

The current start guide no longer assumes a Windows drive or agent installation.
Historical non-secret workspace paths remain as engineering evidence. Safe agent
plans/prompts are retained outside the main developer entry point.

`npm run repository:check` scans current inventoried files, all refs/reflogs,
historical filenames/blobs and commit/tag objects. It reports categories/locations
without matching values. It checks common credentials, unwanted private/generated
paths, binary allowlisting and a 1 MiB file ceiling. These rules complement manual
content and image review; they cannot identify every possible secret or real message.

`npm run test:repository` checks a disposable repository with synthetic current
and historical credentials, environment/generated paths, private-JWK literals and
unknown binaries. It verifies that matched values never appear in audit output.
Its fixture commits are temporary test state, separate from Nibhrito's history.

## Public visual

`assets/overview.png` is the public landing page in a fresh browser context, with
the built-in fictional illustration only. It contains no inbox, user profile,
keys, recovery material, tokens, browser chrome or machine paths. Any asset change
requires fresh pixel review; allowlisting is not proof of image privacy.

## CI and dependency updates

CI uses Ubuntu 24.04, Node from .node-version, npm ci and full-SHA-pinned official
checkout/setup-node actions. It runs the repository/history audit and the existing
full portable release gate, including all three browsers and accessibility checks.
Only contents:read is granted; checkout credentials are not persisted. No external
secrets, caches, uploaded artifacts or deployment steps. Installed Edge is an extra
local gate; physical-device and assistive-technology checks remain manual.

Dependabot checks npm and GitHub Actions weekly, with grouped updates and bounded
open PR counts. No automatic merging. Dependency changes must pass the same checks
and security review. No package versions change during publication.

## Publication verification

Local publication checks pass: clean npm ci (229 packages, no version changes),
formatting, lint, strict TypeScript, 113 Vitest tests, 57 browser cases across
Chromium/Firefox/WebKit and 19 installed-Edge cases, intentional-failure artifact
privacy probes, build, Worker dry run, privacy/history checks and dependency audit
(zero vulnerabilities). Accessibility scans cover 272 states across four browsers
with no rule violations; inconclusive and physical-device/AT checks remain manual.
The native repository-audit regression also passes. Entry-point relative links
resolve and package dependency metadata matches the lockfile.

All 580 baseline Git objects were checked against refs/reflogs; none were orphaned.
The added 69785-byte public PNG is the only deliberate binary. Source, Worker,
shared contracts, migrations, runtime configuration and dependency versions have
no diff from e93fc70. Final JS/CSS names match the accepted baseline:
index-BswXlgnk.js and index-BS90chmJ.css. Tailwind initially detected a utility word
in new test assertion copy; rewording the assertion restored the exact asset names
without an application/style change. Existing tests/assertions remain intact.

Published at [NafisAfzal/nibhrito](https://github.com/NafisAfzal/nibhrito), public,
default branch main, with the original sixteen commits and two preparation commits.
The first pushed HEAD was 95237cb1a7a88f339159a3b785e99454558c43e3; fetched origin/main
matched and e93fc70 remained its ancestor. Working tree was clean.

Verified through GitHub API: description/eight relevant topics, Issues enabled,
wiki disabled, secret scanning and push protection enabled, private vulnerability
reporting enabled, dependency alerts enabled and automated security fixes enabled
(not paused). Actions is enabled; default token permissions are read-only and PR
approval is disabled. Both secret and Dependabot alert counts were zero when checked.
No paid feature is enabled. Dependabot opened its initial grouped npm and Actions
PRs; neither is merged automatically or applied to main.

GitHub's rendered README contains the public image, headings and Mermaid block;
local relative documentation paths resolve. The initial main CI run
[37226329438](https://github.com/NafisAfzal/nibhrito/actions/runs/37226329438) failed:
the workflow-wide WRANGLER_LOG=error suppressed the portability test's D1 JSON
response. The test retained its redacted failure and all assertions. Remove that
global setting; the E2E server retains its own quiet logging configuration. This
changes CI only, with no application/database behavior change. Follow-up CI must
pass before this publication phase is complete.

No license is selected. The owner must make that decision separately.
Next production step, after publication verification and operator approval:
follow docs/16 beginning with `npx wrangler login`, then verify the intended free
account before creating production D1. No production action runs in this phase.
