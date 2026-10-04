# GitHub repository publication

## Purpose and user-visible outcome

Publish Nibhrito as a clear public GitHub project named `nibhrito`, preserving all
genuine history from e93fc70. Prepare docs, privacy-safe presentation, community
guidance and CI. Cloudflare deployment is outside this phase.

## Existing behavior and relevant files

Sixteen commits on `main`, no remotes/tags, clean baseline. MVP/local QA complete.
README, docs/00, PROJECT_STATUS and FINAL_VERIFICATION provide the handoff.
package.json and lockfile pin dependencies; .node-version is 24.14.1.
No license or GitHub configuration exists.

## Security invariants that must remain true

All AGENTS.md invariants remain. No application, crypto, API or migration changes.
Audit tree/history before publication. Do not expose credentials or private
artifacts, rewrite history, force-push, invent licensing or provision Cloudflare.
Ordinary CI has read-only permissions and no production credentials/deployment.

## Exact implementation steps

1. Read required/release docs; inspect Git, configuration, scripts and tests.
2. Audit historical blobs/paths, commit messages, current files and object sizes.
   Review synthetic fixtures, ignored local state and example config.
3. Check CLI authentication and repository-name conflicts without mutation.
4. Refine README/start guide; add index, security/contribution guidance, one reviewed
   public screenshot, publication evidence and repeatable repository audit.
5. Add least-privilege CI, weekly grouped Dependabot and simple issue/PR templates.
6. Run clean install, full local gate, installed Edge and tree/history audit.
7. Commit logical repository changes preserving the accepted baseline history.
8. Create an empty public remote; push only main without force.
9. Configure and verify metadata, default branch, issues, private reporting and
   available free security/dependency features.
10. Verify remote/local HEAD, rendered README/links, clean state and initial CI.
    Fix genuine CI issues with ordinary follow-up commits; record actual results.

## Data/schema changes

None.

## API changes

None.

## Test plan

npm ci, npm run check, npm run test:edge, npm run repository:check, local migration
listing. Review YAML/action SHAs, docs/README links and public screenshot.
Verify remote settings and initial Actions. Preserve all existing assertions and
private-artifact protections. No repeat of optional 577-image QA: UI unchanged.

## Rollback/migration notes

Revert repository-only commits normally. Stop at missing authentication only after
local preparation. A real secret blocks publication and requires credential rotation
plus reviewed history cleanup. Never overwrite a conflicting remote repository.

## Acceptance criteria

Clean audit/gates, accurate docs, no invented identity/license, meaningful commits,
full genuine main history on public remote, verified settings/CI, clean worktree,
pending production/license/manual checks recorded honestly.

## Progress log

- 2026-10-05: Baseline clean at e93fc70; 16 commits, no remotes/tags.
  gh 2.100.0 authenticated as NafisAfzal in owner context.
- Initial audit: 201 historical paths, 354 blob versions, 2252630 blob bytes;
  no credential/generated/private file matches. Largest blob 167979 bytes (lockfile);
  loose Git objects occupy 861 KiB. No license decision.
- NafisAfzal/nibhrito does not exist. Official checkout/setup-node v6 revisions
  resolved through GitHub API for full-SHA pinning.
- Preparation complete: docs/index/public screenshot, security/contribution guidance,
  CI/weekly updates/templates and repeatable audit with native regression test.
- Local gates pass: npm ci, 113 Vitest/57 portable/19 Edge cases, 272 accessibility
  states, audit regression, privacy/history, lint/format/TS/build/dry run and zero
  vulnerabilities. No orphaned baseline objects; accepted JS/CSS names preserved.
- Created public NafisAfzal/nibhrito and pushed main normally at 95237cb. Verified
  default branch, matching fetched HEAD, original ancestry and a clean worktree.
  Free scanning/protection, private reports and dependency alerts/fixes enabled;
  Actions defaults read-only. Initial alert counts zero; grouped bot PRs unmerged.
- First CI 37226329438 exposed a CI configuration defect: global Wrangler error
  verbosity suppresses D1 JSON in the portability test. Remove the global setting,
  preserve the quiet E2E wrapper and all original assertions; confirm follow-up CI.

## Decisions and surprises

- Sandbox Git ownership/auth differs from owner's Windows context; owner-context
  commands are needed for Git mutations and authenticated GitHub.
- Retain safe .agent/prompts as history. Replace obsolete machine-specific setup
  advice in current docs; historical non-secret paths need no rewrite.
- No packages or license choice. Only a public landing screenshot may be published;
  never capture private application states.
