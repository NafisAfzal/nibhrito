# Codex Execution Plans

Use an ExecPlan for a feature that spans multiple modules, changes a security invariant, modifies the cryptographic envelope, changes authentication/recovery, alters the database schema, or requires a significant refactor.

Each ExecPlan must be self-contained and written as if the implementer has only the current repository and this plan.

## Required ExecPlan sections

1. Purpose and user-visible outcome
2. Existing behavior and relevant files
3. Security invariants that must remain true
4. Exact implementation steps
5. Data/schema changes
6. API changes
7. Test plan
8. Rollback/migration notes
9. Acceptance criteria
10. Progress log
11. Decisions and surprises

## Execution behavior

- Keep the plan updated as work proceeds.
- Record discoveries that invalidate earlier assumptions.
- Run verification commands after implementation.
- Do not silently alter crypto algorithms or serialization.
- If a plan conflicts with `AGENTS.md`, `AGENTS.md` wins.
