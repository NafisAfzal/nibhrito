# Documentation

The [root README](../README.md) introduces Nibhrito. This index separates current
references from historical planning and design evidence.

## New developers

- [Start here](00_START_HERE.md) — setup and reading order.
- [Local development](14_LOCAL_DEVELOPMENT.md) — Node, migrations, configuration and iteration.
- [Implementation](../IMPLEMENTATION.md) — actual flows, modules and limitations.
- [Architecture](02_ARCHITECTURE.md) and [architecture decisions](13_ARCHITECTURE_REVIEW.md).
- [Data model and API](05_DATA_API.md).
- [Testing and acceptance](09_TESTING_ACCEPTANCE.md).
- [Contributing](../CONTRIBUTING.md).
- [Design guide](../DESIGN.md) — semantic colors, themes, composition, and motion.

## Security reviewers

- [Normative E2EE v1 protocol](03_E2EE_PROTOCOL.md).
- [Threat model](04_SECURITY_THREAT_MODEL.md).
- [Abuse controls](15_ABUSE_CONTROLS.md).
- [Security self-review](../SECURITY_REVIEW.md) — resolved findings and accepted limitations.
- [Privacy/legal/abuse guidance](08_PRIVACY_LEGAL_ABUSE.md).
- [Vulnerability reporting policy](../SECURITY.md).
- [GitHub publication](21_GITHUB_PUBLICATION.md) — source/history audit and CI boundary.

## Deployment operators

- [Deployment and operations](16_DEPLOYMENT_OPERATIONS.md) — guarded commands,
  privacy settings, smoke tests, backups, restore and rollback.
- [Free-tier capacity strategy](07_DEPLOYMENT_FREE_TIER.md) — dated planning inputs;
  verify current provider terms before provisioning.
- [Release acceptance](20_RELEASE_ACCEPTANCE.md) — physical devices, assistive
  technology and external production gates.
- [Final local verification](../FINAL_VERIFICATION.md).

## Maintainers and engineering history

- [Project status](../PROJECT_STATUS.md) — completed work, commit evidence and pending gates.
- [Master plan](01_MASTER_PLAN.md) and [implementation roadmap](06_IMPLEMENTATION_ROADMAP.md).
- [Product UX plan](12_PRODUCT_UX.md), [UI redesign](17_UI_REDESIGN.md),
  [product-intent UX](18_PRODUCT_INTENT_UX.md) and [mobile polish](19_FINAL_MOBILE_POLISH.md).
- [Design engineering](22_DESIGN_ENGINEERING.md) — tooling audit, independent
  critique, visual changes, and final acceptance evidence.
- [Sources](11_SOURCES.md) — references from the initial planning work.
- [Agent runbook](10_AGENT_RUNBOOK.md), [execution-plan rules](../.agent/PLANS.md)
  and [original combined planning snapshot](../NIBHRITO_MASTER_PLAN.md).

Completed plans in `.agent/plans/` and initial prompts in `prompts/` remain as
engineering records. They do not override the current protocol, architecture
decisions or project status. No license decision has been made.
