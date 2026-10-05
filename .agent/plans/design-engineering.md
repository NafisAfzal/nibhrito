# Final design engineering and repository presentation

## 1. Purpose and user-visible outcome

Refine the existing Nibhrito identity into a richer, more deliberate interface in
both browser themes. Make the public repository easier to evaluate with current,
synthetic screenshots and clear, maintainable diagrams. Stop before deployment.

## 2. Existing behavior and relevant files

The verified baseline is `219d17e634cc0d5adc84d7fad1a0e24f40767366` on `main`.
The UI uses semantic CSS tokens, local SVG icons, native system fonts, and browser
color preference. There is no application theme preference or theme storage.
Relevant files are `src/styles.css`, `src/product-story.css`,
`src/components/ProductStory.tsx`, the landing routes, README, and architecture
documentation. Existing creation, sending, inbox, sharing, recovery, and legal
flows already have extensive functional and accessibility coverage.

## 3. Security invariants that must remain true

Preserve the protocol, verified fragment links, key handling, recovery,
authentication, API contracts, D1 schema/queries, expiry/deletion, rate limiting,
CSP, headers, and privacy checks. No runtime logging, telemetry, remote fonts,
external scripts, new runtime dependencies, or production actions. Use only an
isolated local database and synthetic data for browser inspection. Never save
private DOM, message bodies, keys, bearer tokens, or recovery material as evidence.

## 4. Exact implementation steps

1. Finish the environment audit and verify shared skill discovery before editing.
2. Inspect fresh browser renders and independently assess design and detector
   evidence using Impeccable's critique workflow.
3. Refine semantic colors and surface depth within the existing brand. Improve
   the conversation composition and section rhythm rather than adding a gallery
   of decorative cards. Keep the central message visible without animation.
4. Add a small, purposeful motion treatment to the fictional public example and
   feedback controls, with reduced-motion and touch-safe alternatives.
5. Inspect public and synthetic private flows across both themes and the required
   widths. Fix actual wrapping, contrast, focus, and layout problems.
6. Replace cramped documentation diagrams with factual, source-controlled SVGs.
   Capture a small pair of privacy-safe light/dark public screenshots.
7. Update the README, design guidance, verification evidence, and project status.
8. Review the security diff, run the full release gate and installed scanners,
   inspect assets and links, make meaningful commits, push normally, and wait for
   GitHub CI. Record local/remote HEAD and working-tree status.

## 5. Data/schema changes

None. No D1 migrations, queries, or private browser storage changes.

## 6. API changes

None.

## 7. Test plan

Preserve `npm run check`, repository/history checks and regression tests, installed
Edge coverage, and existing cross-browser accessibility scans. Inspect at 320,
360, 375, 390, 412, 430, 768, 1024, 1280, and 1440 pixels in light and dark.
Check long Bangla, English, and mixed synthetic content, forms, verified links,
QR, recovery, inbox, legal pages, errors, and reduced motion. Run Semgrep,
OSV-Scanner, and Gitleaks using appropriate local, non-secret workflows. Measure
the production bundle and review request origins and layout shift.

## 8. Rollback/migration notes

All changes are reversible source/assets/documentation changes. Revert their
commits if needed. There is no migration or production rollback to perform.

## 9. Acceptance criteria

Both themes have intentional surfaces, readable hierarchy, contrast, and focus.
The visual example explains the actual constructive-feedback journey. No narrow
viewport overflow or weakened assertions. Diagrams match the implementation,
screenshots contain only public fictional examples, and links resolve. Required
gates and CI pass. Security-sensitive files and dependencies remain unchanged.
The owner receives the exact local run command and a short manual inspection list.

## 10. Progress log

- Environment audit complete. Existing shared Vercel/Emil skills, Playwright,
  Semgrep, OSV-Scanner, Gitleaks, and GitHub CLI are usable. Updated the single
  OpenCode Impeccable installation and exposed it through a shared skills link;
  Codex app-server discovery reports it enabled with no errors. No new MCPs,
  hooks, frameworks, or project-local tooling.
- Confirmed clean baseline and green GitHub release workflow. Started isolated
  local server on port 8788 and captured public light/dark baseline renders.
- Independent Impeccable assessments completed, with fresh desktop/mobile renders
  in both themes. Refined palette, conversation composition, editorial display
  type, responsive heading ownership, and deliberate motion.
- Inspected 22 public geometry combinations and 176 masked synthetic private-state
  combinations at eleven widths/both themes. No overflow, browser errors, network
  plaintext/recovery leakage, or third-party origins in the synthetic journey.
- Replaced four Mermaid diagrams with a shared, maintainable SVG pair; reviewed
  diagram pixels at 320/480 and both public screenshots. Relative links resolve.
- Source/history audits, Gitleaks, OSV, and Semgrep pass. Full gate exposed button
  color crossfades reducing contrast during theme switches. Removed the crossfades
  and added an actual painted-color browser regression. The final full gate passes
  113 Vitest tests and all 60 portable browser cases, plus build/dry run, formatting,
  lint, strict TypeScript, artifact privacy and zero-vulnerability dependency audit.
- An earlier WebKit phone case stalled after assertions during context cleanup.
  Its unchanged isolated run and fresh full gate pass; no deadlines, retries,
  original assertions or artifact controls were weakened. Installed Edge passes
  all 20 cases too. Across four browsers, 272 automated accessibility scans have
  no violations. GitHub CI remains the final verification step before owner
  visual acceptance.
- Normal push completed; local and remote hashes match. Actual published
  desktop/phone light/dark inspection found fixed HTML image heights adding
  unwanted space on mobile. A narrow documentation-only follow-up removes the
  heights in the screenshot and all diagram embeds, preserving source assets.

## 11. Decisions and surprises

- The incumbent theme implementation follows the operating system/browser. Keep
  that mechanism and its first-paint behavior; do not introduce preference storage
  as part of a visual pass. Both theme designs remain first-class.
- Native fonts and local CSS/SVG provide the needed quality without dependencies.
- The mobile hero font override previously lost to a later desktop rule. Moved
  responsive sizing to the stylesheet that owns the hero rather than masking
  overflow. The required narrow-phone setup visibility is preserved.
- Theme text/background crossfades are unsafe even when final token contrast
  passes. Apply color changes immediately and limit movement to purposeful,
  nonessential moments.
- Tooling credentials, backups, captures, and experiment scripts stay outside
  tracked source. Public assets receive a separate privacy review.
