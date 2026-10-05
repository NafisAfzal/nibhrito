# Design engineering and repository presentation

This pass refines the verified public baseline
`219d17e634cc0d5adc84d7fad1a0e24f40767366`. It does not deploy the application.
The [design guide](../DESIGN.md) records the resulting visual conventions;
the [execution plan](../.agent/plans/design-engineering.md) records implementation
and acceptance progress.

## Development environment

The environment was inspected before application edits. Codex CLI 0.160.0 and
OpenCode 1.18.34 run on Windows 10. Node 24.14.1, npm 9.6.4, Git 2.45.2,
Python 3.11.9, GitHub CLI 2.100.0, Playwright CLI 0.1.19, Semgrep 1.177.0,
OSV-Scanner 2.6.0, and Gitleaks 8.30.1 were already available.

| Capability                        | Audit result / decision                                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual design                     | Updated the existing Impeccable skill to 4.5.0 through its official CLI 4.1.0. Reused one installation through a shared skills directory link.                                                          |
| React / accessibility             | Existing shared Vercel React and web-interface skills were already visible to Codex. No duplicate installation.                                                                                         |
| Motion / interaction              | Existing Emil design-engineering, implementation, review, and audit skills were reused. No animation library.                                                                                           |
| Browser testing                   | Existing pinned Playwright and axe-core, plus installed browsers.                                                                                                                                       |
| Security / dependencies / secrets | Existing repository checks, Semgrep, OSV-Scanner, and Gitleaks. No duplicated OWASP instructions.                                                                                                       |
| Architecture / planning / review  | Repository AGENTS, execution plans, tests, and Codex review workflows. OpenCode's optional Superpowers/custom agents were left in their existing scope.                                                 |
| Documentation / GitHub            | Source inspection, GitHub CLI, current official references when needed, and source-controlled visuals.                                                                                                  |
| MCP                               | Figma was already configured but unauthenticated in Codex; Figma and Context7 were configured for OpenCode. No design source required Figma and no documentation gap required Context7. No MCP changes. |

Codex app-server `skills/list` with a fresh discovery reported Impeccable enabled
and no errors. The Windows launcher was exercised successfully. No restart was
needed to read the skill in this session. Hooks were deliberately not installed;
manual detection supplies the useful check without adding a global hook. Existing
Codex plugins were left unchanged. No framework, icon package, font, SaaS, or
project-local developer configuration was added.

Local configuration, installer backup, credentials, and experiment artifacts are
not repository content. CLI and skill payload versions are separate: the bundled
Impeccable engine reports its own version, rather than the npm CLI version.

## Independent baseline review

Method: dual-agent (A: `design_assessment` · B: `detector_assessment`). Assessment A
finished before detector findings entered synthesis. Both assessments used fresh
browser contexts and only public, fictional content.

The baseline had a sound constructive-feedback message, coherent local icons,
accessible controls, and mobile flows. Its grey enclosing conversation panel,
repeated heading/icon-column cadence, and flat charcoal/lavender surfaces made
the useful reply less memorable. The mobile example appeared too late in the
introduction. The design needed stronger relationships and composition rather
than more decoration.

| Heuristic              | Baseline score | Evidence / limit                                                      |
| ---------------------- | -------------: | --------------------------------------------------------------------- |
| System status          |              3 | Setup and menu states; async journeys reserved for acceptance testing |
| Real-world language    |              4 | Concrete, constructive feedback                                       |
| Control and freedom    |              3 | Navigation, restore, and menu Escape                                  |
| Consistency            |              3 | Coherent tokens/icons; repeated layouts flatten hierarchy             |
| Error prevention       |              3 | Form constraints and explicit recovery responsibility                 |
| Recognition            |              3 | Useful labels and flows; system-only theme behavior                   |
| Efficiency             |            n/a | Public persuasion surface                                             |
| Aesthetic hierarchy    |              2 | Nested surfaces and repeated cadence                                  |
| Error recovery         |            n/a | No errors triggered in the independent baseline review                |
| Help and documentation |              3 | Privacy links and setup guidance                                      |
| Total                  |          24/32 | Functional foundation; composition needs refinement                   |

The detector reported three baseline warnings: the example's purple side stripe,
the recovery warning stripe, and the comparison panel's accented rounded border.
The first and third informed visual refinement. The recovery warning is a narrow,
intentional exception: prominence at a security-sensitive step remains useful.
Detection is pattern evidence, not an accessibility or security certification.

Browser overlay injection was attempted on home, create, and security. The
existing CSP blocked its cross-origin helper script. No runtime detector or
owner-visible overlay ran; CSP was not relaxed. The temporary helper was stopped.
Source detection and actual browser pixel inspection remained available.

Questions skipped: the owner supplied a detailed direction and authorized the
implementation and verification pass.

## Review decisions

| Before                                               | After                                                            | Why                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| Question and reply enclosed in another rounded panel | A brand-derived arch with two distinct conversation surfaces     | Make the useful reply the public visual signature                  |
| Uniform charcoal and lavender emphasis               | Separate slate surfaces and semantic teal delivery emphasis      | Give dark mode depth without a sinister or neon aesthetic          |
| Uppercase labels above every public heading          | Direct headings with editorial display type                      | Reduce repeated scaffolding and improve first-impression hierarchy |
| Long introduction and wide mobile gaps               | Shorter factual invitation and deliberate narrow-screen spacing  | Bring the example closer to the primary action                     |
| Press movement limited to desktop hover capability   | Real pointer/touch press feedback, with immediate keyboard focus | Confirm input without slowing keyboard use                         |
| Static public example                                | One short, staggered question/reply entrance                     | Explain the relationship; no loop or layout movement               |

The first full gate exposed a real contrast regression in the new button color
crossfades: switching system themes briefly mixed two individually valid palettes.
A frame-by-frame browser measurement fell to about 1.3:1. Color state changes now
apply immediately; the hero/delivery movement and pointer press feedback remain.
The new browser regression samples actual action colors through both theme
directions with normal and reduced motion. Existing accessibility checks and
thresholds are preserved.

The initial gate also caught a missing explicit Node `URL` import in the new
diagram generator. That narrow tooling fix does not affect runtime code.

## Acceptance evidence

`npm run check` exits 0 against the final application source. Its 113 Vitest tests
across 18 files and all 60 browser cases pass: 20 each in Chromium, Firefox and
WebKit. Formatting, lint, strict TypeScript, production build, Worker dry run,
private-artifact probe, privacy checks and npm dependency audit also pass. The
dependency audit reports zero vulnerabilities. `npm run test:edge` also exits 0
with all 20 cases in installed Microsoft Edge. Across four browsers, 272 automated
accessibility state scans have no violations.

An earlier Windows/WebKit run stalled in the phone test's browser-context cleanup,
after the journey assertions had completed. The unchanged case then passed in
isolation in 11.5 seconds, and the fresh complete gate passed with browser work
kept serial. No retries, skips, deadlines or original assertions were changed.

| Review                        | Measured result / scope                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public geometry               | 22 combinations: eleven widths, both themes; no horizontal overflow                                                                                       |
| Synthetic private geometry    | 176 combinations: eight states, eleven widths, both themes; no overflow                                                                                   |
| Widths                        | 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1600 pixels                                                                                       |
| Private-state inspection      | Recovery, complete link/QR, empty inbox, settings, security, composer, delivery and message reader; saved captures mask private fields/text               |
| Synthetic network journey     | No plaintext/recovery-code leakage, no browser errors, one origin; existing native encryption, verified-link, restore, expiry and deletion tests retained |
| Theme transition              | Actual painted action contrast exceeds 4.5:1 in both directions with normal/reduced motion, across all mandatory engines                                  |
| Motion / fonts / layout shift | Reduced motion has no story animation or translation; sampled landing CLS is 0 in both themes; zero downloaded fonts                                      |
| Production frontend           | JS 337.05 kB / 105.57 kB gzip; CSS 41.46 kB / 9.07 kB gzip; no added packages                                                                             |
| Comparison with baseline      | JS was 337.58 kB / 105.63 kB gzip; CSS was 38.30 kB / 8.37 kB gzip                                                                                        |
| Repository/history checks     | Current source and all refs/reflogs pass; native removed-secret/redacted-output audit regression passes                                                   |
| Gitleaks 8.30.1               | Current publishable text and complete referenced/reflog history: zero findings                                                                            |
| OSV-Scanner 2.6.0             | Lockfile scan: 331 packages, zero vulnerability results                                                                                                   |
| Semgrep 1.177.0               | Security-audit/TypeScript rules: 67 tracked source files plus the new diagram generator; zero findings/errors                                             |
| Public assets                 | Two reviewed 1440×800 fictional homepage PNGs and two script-free 480×824 SVGs; no private profile, inbox, recovery material or token                     |
| Diagrams / links              | Four Mermaid blocks replaced with one factual, reproducible light/dark SVG pair; pixels reviewed at 320/480; relative links resolve                       |
| README rendering              | GitHub Markdown API preserves both picture elements and their relative theme sources; published rendering is checked after push                           |

The geometry and performance samples are local observations, not exhaustive
device/performance certification. Automated accessibility results do not establish
full WCAG conformance; inconclusive rules and assistive technology need manual review.
The final documentation build adds a few unused utilities through the existing
Tailwind content scanner; they do not match application classes. The table reports
that final build rather than the smaller interim stylesheet.

Publication uses the existing read-only [release-check workflow](https://github.com/NafisAfzal/nibhrito/actions/workflows/ci.yml).
Its run for the published commit must be checked after the push; local/remote
hashes, clean state and the exact run URL are verified in the owner handoff.

## Motion and interface review

Verdict: approve for local owner review. The story makes a single short entrance;
the headline, order and meaning remain stable for screen readers. Text starts
nearly opaque (0.95), so entrance effects do not make labels unreadable. Movement
uses opacity/transform, never layout properties. There are no looping, parallax,
typing or navigation animations.

| Before                          | After / source                                                                               | Reason                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Static public example           | Question 240 ms; reply 280 ms with 60 ms delay; [story rules](../src/product-story.css#L436) | Show question → response once without waiting for the headline         |
| Uniform interaction feedback    | Pointer/touch press 120 ms, release 80 ms; [control rules](../src/styles.css#L1030)          | Immediate cause/effect; keyboard focus is excluded from press movement |
| Delivery icon appears abruptly  | Receipt confirmation 220 ms; [receipt rules](../src/styles.css#L1040)                        | A short completion cue; existing status semantics remain               |
| Animated text/background colors | Immediate colors; [painted-color regression](../tests/e2e/product.spec.ts#L3)                | Avoid transient low contrast during theme switches                     |
| Optional entrance effects       | Reduced motion sees the finished content immediately; same rules                             | Preserve information without movement                                  |

The Vercel interface/React review found no new fetch effect, unnecessary state,
rerender subscription or runtime dependency. Public SVG icons remain decorative
to assistive technology; meaningful flows retain labels, captions and reading
order. Focus rings, native labels, error association, touch targets and private
artifact restrictions are retained. Palette and focus rules are in
[styles](../src/styles.css#L8); responsive hero sizing is owned by the same
stylesheet, avoiding the previous late desktop override.

The final source detector reports one warning: the intentional recovery warning
border. Its prominence is retained for a security-sensitive step. There are no
new detector suppressions or relaxed CSP rules.

Security diff review against the baseline finds no changes in cryptography,
private key storage, recovery implementation, API contracts, Worker, shared
schemas, migrations, database behavior, expiry/deletion, rate limiting, headers,
CSP or production configuration. No telemetry, remote scripts/fonts, analytics,
private evidence or new package was added. E2EE and privacy guarantees are
unchanged; this is a scoped self-review, not an independent security audit.

Physical-phone, assistive-technology, and live production acceptance remain the
separate owner/release checks in [release acceptance](20_RELEASE_ACCEPTANCE.md).

## Owner inspection

Run `npm run dev` and open `http://127.0.0.1:8787`. Inspect the homepage and About,
then create a disposable profile and check recovery, My link/QR, sender, inbox,
reading and deletion with synthetic Bangla, English and mixed text. Switch the
browser/OS between light and dark and enable reduced motion. Check keyboard focus,
mobile menu, long link wrapping, the short success cue and the local serif display
font. Physical Android Chrome, iPhone Safari, real keyboards and assistive
technology remain manual acceptance. Do not use an insecure LAN origin for Web
Crypto or treat headless WebKit as a physical iPhone test. No production action or
release tag is part of this pass.
