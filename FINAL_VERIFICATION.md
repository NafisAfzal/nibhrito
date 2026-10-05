# Final local verification

## Independent review and two corrections — 2026-10-06

This pass started from verified handoff commit `d041d22` with a clean tree and a
green workflow run. It audits the running application in a real browser and
changes only genuine defects; see
[design engineering evidence](docs/22_DESIGN_ENGINEERING.md) for the findings and
the deliberate items left alone.

Two corrections, both presentation-only. The link-name `pattern` was rejected by
the `v`-flag character-class parser that browsers use for HTML `pattern`, so
native slug validation was silently disabled and every load of the public `/create`
page logged a console error; the hyphen is now escaped, and a browser regression
asserts both the absence of the error and the accept/reject behaviour for valid,
hyphenated, uppercase, spaced, underscored and edge-hyphen values. `/about` — the
destination behind the "Why Nibhrito" navigation label — duplicated the landing
page's walkthrough rather than explaining why the product exists; it now carries
an honest "What Nibhrito does, and what it cannot do." account of capabilities and
structural limits.

From the repository root, `npm run check` exits 0 and `npm run test:edge` exits 0:

| Check                             | Result                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Lint, format, strict TypeScript   | Pass; Prettier reports all matched files use its style                                                                 |
| Vitest                            | 113 passed in 18 files                                                                                                 |
| Portable browser cases            | 63 passed, 21 each across Chromium, Firefox and WebKit; no retries or skips                                            |
| Installed Edge                    | 21 passed, same assertions, isolated profile, no retries or skips                                                      |
| Automated accessibility           | 272 state scans across four browsers; 68 per engine (53 public/menu, 15 private); no violations                        |
| Private artifact probe            | Pass before every browser suite; assertion DOM absent from output and artifacts                                        |
| Production build                  | Pass; JS 338.56 kB / 106.09 kB gzip, CSS 42.44 kB / 9.24 kB gzip                                                       |
| Worker dry run                    | Pass; 5 asset files, 32.73 KiB total upload; no remote provisioning or upload                                          |
| Privacy and tracked-secret checks | Pass                                                                                                                   |
| npm audit --audit-level=low       | 0 vulnerabilities                                                                                                      |
| Gitleaks 8.30.1                   | Working tree and all 27 commits of history; no leaks, output redacted                                                  |
| OSV-Scanner                       | Lockfile scan, 331 packages; no vulnerability results                                                                  |
| Semgrep                           | `p/security-audit` and `p/typescript`, 97 rules on 154 tracked files; 0 findings                                       |
| Repository audit                  | 188 current files, 433 historical blob versions, no credential or generated-file matches; its native regression passes |

Independent browser audit, Chromium, synthetic data only: ten public routes at
1440px and 390px, plus an eleven-width sweep from 320 to 1600px in both themes.
Zero horizontal overflow, zero console or page errors, zero requests to any origin
other than `127.0.0.1:8787`, zero downloaded fonts and sampled landing CLS of 0 in
both themes. A separate authenticated walkthrough covered setup, recovery
acknowledgement, complete link and QR, inbox, composer, send confirmation, the
mixed Bangla/English/emoji message, decryption, cancelled and confirmed deletion
and restore validation in both themes at desktop and phone; no synthetic plaintext
appeared in any request. Reduced motion renders the finished story with no
transformation and no animation. The design detector reports only the pre-existing
intentional recovery warning accent and nothing on the changed files.

One machine-level constraint is recorded honestly. The shared Windows host ran
several unrelated development servers and fell to 1.17 GB free of 7.49 GB during
the first combined gate run. That produced nondeterministic WebKit failures — a
whole-browser close in one run and a scattered eight in another, with no common
test. Isolating the variable proved it was not the change: the untouched baseline
then passed WebKit 20/20, and the changed code passed 21/21 under identical
conditions. No assertion, timeout, retry, skip or browser target was changed, and
the final complete `npm run check` passed all three engines in one run once the
host had memory available.

E2EE guarantees, P-256 ECDH, HKDF-SHA-256, AES-256-GCM, the verified-link model,
API contracts, database behavior, expiry and deletion, rate limiting, CSP and
security headers are unchanged. Physical devices, assistive technology, legal
review and live deployment acceptance remain separate manual gates. No production
resource, secret, deployment or tag was created. Earlier phase evidence follows.

## Design engineering and presentation — 2026-10-05

This is a local visual/repository pass from verified GitHub commit
`219d17e634cc0d5adc84d7fad1a0e24f40767366`, not production acceptance.
`npm run check` exits 0: formatting, lint, strict TypeScript, 113 Vitest tests in
18 files, all 60 portable browser cases (20 per engine), artifact privacy probe,
production build, Worker dry run, privacy check and dependency audit. npm reports
zero vulnerabilities. `npm run test:edge` also exits 0 with all 20 cases. Across
four browsers, 272 automated accessibility state scans have no violations;
inconclusive rules remain manual review. Existing assertions, retries, skips and
deadlines are unchanged.

The new painted-color browser regression catches theme-transition contrast,
and the existing captioned-flow test now covers both themes. Public geometry
checks cover 22 combinations and masked synthetic private states cover 176,
at eleven widths from 320 through 1600 pixels: no horizontal overflow. The
synthetic request review found no plaintext/recovery-code leakage, browser errors
or third-party origin. Sampled landing CLS is zero in both themes, and no font is
downloaded. JS is 337.05 kB / 105.57 kB gzip; CSS 41.46 kB / 9.07 kB gzip.
No dependency version changes.

Gitleaks current/history scans, OSV lockfile scan (331 packages), Semgrep source
scan, repository/history audit and its native removed-secret regression pass.
Four approved public visuals are reviewed: fictional light/dark homepage PNGs and
script-free architecture SVGs. The same accurate diagram replaces four Mermaid
blocks. Relative documentation paths and GitHub Markdown picture rendering pass.

The first visual gate caught transient low contrast during color crossfades;
colors now change immediately, with a measured browser regression. An earlier
Windows/WebKit run timed out during context cleanup after the phone assertions;
the unchanged isolated case and fresh complete gate pass. Neither failure is
hidden by a retry, timeout increase, weakened assertion or skipped test.

Local measurements and publication checks are recorded in
[design engineering evidence](docs/22_DESIGN_ENGINEERING.md); the published
commit's remote result is available in the
[release-check workflow](https://github.com/NafisAfzal/nibhrito/actions/workflows/ci.yml).
Crypto, verified links, private key handling, recovery, API, Worker/D1 behavior,
expiry/deletion, abuse controls, headers/CSP and privacy guarantees are unchanged.
Physical devices, assistive technology, legal review and live deployment acceptance
remain separate manual gates. No production resource, secret, deployment or tag
was created. Earlier phase evidence below is retained as history.

## Release QA — 2026-10-04

Release candidate 1.0.0-rc.1 with the complete UI/UX redesign and product-intent UX
upgrade and final mobile/visual polish, preserving ab5dc7d, 8526c06 and 8c891fa.
Local Phase 8 is 1df1698; earlier commits are in PROJECT_STATUS.md. This record
accompanies the remaining local accessibility/Edge release QA commit,
not a production release or independent audit.

From the repository root:

| Check                                           | Result                                                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency installation                         | One exact dev-only axe-core 4.13.0 addition; no runtime/transitive version changes                                                       |
| db:migrate:local / db:list:local                | 0001 and 0002 applied; no pending migration; repeat is a no-op                                                                           |
| npm run check                                   | Exit 0 against final application source                                                                                                  |
| TypeScript, lint, formatting                    | All pass                                                                                                                                 |
| Native crypto/unit/API/D1/config/contrast tests | 113 passed across 18 Vitest files                                                                                                        |
| Browser/security/E2E                            | 57 passed, 19 each across Chromium, Firefox, WebKit; no retries/skips                                                                    |
| Installed Edge                                  | npm run test:edge passes all 19 cases; Microsoft Edge 154.0.4258.53; isolated profile, no retries/skips                                  |
| Automated accessibility                         | 272 state scans across four browsers; no violations; generic inconclusive-rule annotations require manual review                         |
| Intentional-failure privacy probe               | Assertion DOM absent from output/artifacts; runs before every E2E suite                                                                  |
| Production build                                | Pass; local assets only, no source maps                                                                                                  |
| Worker dry run                                  | Pass; no remote provisioning/upload                                                                                                      |
| npm audit --audit-level=low                     | 0 vulnerabilities                                                                                                                        |
| Privacy/tracked-secret scan                     | Pass; no real secrets tracked                                                                                                            |
| Diff/import/bundle review                       | Pass; Worker has no browser decryption/private-key payload                                                                               |
| D1 export/restore                               | Native ciphertext/recovery restores/decrypts; two migrations, six counter triggers and cascades pass                                     |
| Network/persistence confidentiality             | Tests detect no plaintext anonymous messages, raw recipient private keys or recovery codes in API/DB; working browser key nonextractable |
| UI review                                       | Preserved 8c891fa: 577 masked visual checks at ten widths/both themes; responsive and touch tests pass again in all four browsers        |
| Security self-review                            | No unresolved Critical/High findings identified; fixes and model limitations in SECURITY_REVIEW.md                                       |

The redesign preserves the absent-Clipboard API and encoded-contact regressions,
and strengthens complete-copy fallback selection, multi-profile navigation, mobile
menu, deletion cancellation, oversized composition and same-envelope rate-limit
retry coverage. An explicit initial-load wait stabilizes secondary WebKit windows;
the focused three-journey set and final full gate pass without retries or weaker
assertions. A Playwright failed-assertion DOM gap is fixed and tested by the probe.
Two additional cross-engine intent journeys verify static public storytelling without
crypto/storage/API access or third-party requests, and captioned diagram order and
orientation at ten widths. Existing owner checks now assert setup, sharing, empty
inbox and recovery guides. No original security assertion was removed or weakened.
The final polish expands responsive coverage to 320, 360, 375, 390, 412, 430, 768,
1024, 1280 and 1440px in both schemes. A new 320px touch journey checks the initial
setup field, 44px primary controls, complete maximum-length link/QR, long Bangla,
English and mixed drafts, focused short-height composer, network failure/draft
retention, native encryption/decryption, visible expiry and cancelled/confirmed
deletion. 477 main + 100 state captures are masked and remain ignored; disposable
profiles deleted. The compact overview arrow issue found at 320px is corrected.
Physical OS keyboard and real Safari/iOS/assistive technology remain manual checks.

Release QA adds two privacy-safe accessibility journeys, retaining all 17 original
journeys and assertions. Each engine scans 53 public/menu and 15 private lifecycle/
error states: public 320/1280px light/dark, expanded phone navigation, recovery/share,
owner screens, Unicode composer/byte-limit error, delivery, decrypted text/details,
local encrypted archive and restore validation. Scan diagnostics contain only rule
IDs, impact and counts, never node HTML/selectors/private text. The pinned dev-only
engine is absent from the shipped application; JS/CSS asset hashes remain
index-BswXlgnk.js / index-BS90chmJ.css. Only browser theme-color HTML metadata changes
to match #fafaf7 / #20242c, with a selected-theme/background regression.

The first Edge invocation timed out during isolated server startup before browser
tests ran. Direct isolated health returned 200; after stopping that diagnostic server,
a sequential Edge run passed all 19 cases without timeout changes or weaker assertions.
Both final commands exit 0; this note preserves the initial infrastructure failure.

Failure artifacts do not record private DOM,
screenshots, traces or videos. Test databases/root secrets are disposable and separate
from developer state. Ignored dependencies, builds, local D1/.dev.vars and test
artifacts are intentional; production config and production secret file do not exist.

Security diff review confirms crypto/key storage/shared schemas/API/Worker/migrations,
expiry/deletion semantics, CSP/security headers and legal policy bodies are unchanged.
No runtime dependency, remote asset, tracking or telemetry added. UI details and
historical audits: docs/17_UI_REDESIGN.md, docs/18_PRODUCT_INTENT_UX.md and
docs/19_FINAL_MOBILE_POLISH.md. Current QA and exact remaining manual gates:
docs/20_RELEASE_ACCEPTANCE.md. This QA adds one dev-only dependency, no migration,
and makes no change to message/key/code handling or owner authentication. Final
format/privacy/diff checks cover the handoff documents before the clean-state commit.
No external credentials were supplied or fabricated.
No Cloudflare resources/deployment, domain setup or v1.0.0 tag were created.

The operator must perform the exact steps in docs/16_DEPLOYMENT_OPERATIONS.md and
verify live HTTPS/headers/no injected scripts, CPU/storage/read/write budgets, Cron,
logs, real production Edge/Safari/devices/assistive technology and second-device recovery; legally
review the policy baseline. Local dry run and headless engines cannot establish those.
Encrypted exports are implemented; the rest of conditional Phase 9 remains optional
post-launch work. Local start: npm run dev, http://127.0.0.1:8787.

## GitHub publication checks — 2026-10-05

Repository-only preparation from e93fc70. Clean npm ci installs 229 packages with
no dependency version changes. The full local check passes again: formatting,
lint, strict TypeScript, 113 Vitest tests, 57 three-engine browser cases, artifact
privacy probe, production build, Worker dry run, privacy scan and dependency audit
with zero vulnerabilities. Installed Edge separately passes all 19 cases. The same
272 accessibility state scans have no violations; manual limitations remain.

New repository audit and its native regression pass, including removed historical
credential detection and redacted output. All 580 baseline Git objects are reachable
from audited refs/reflogs; no orphaned objects. Initial history has 354 blob versions,
no real secrets or private/generated files, and a 167979-byte maximum (lockfile).
The only new binary is a reviewed 69785-byte public landing screenshot, captured
in a fresh context without API/external requests or private application state.
README/index/policy relative links resolve; package dependencies match the lockfile.

At preparation HEAD 95237cb, application/security/runtime configuration and
migrations had no diff. JS/CSS
names remain index-BswXlgnk.js and index-BS90chmJ.css after removing a Tailwind
utility word from new test assertion copy. No existing test is weakened. Optional
577-capture visual QA is not repeated because product visuals/source are unchanged.
Publication/remote CI evidence is tracked in docs/21_GITHUB_PUBLICATION.md.
License selection, real devices/assistive technology and live Cloudflare acceptance
remain owner actions; no cloud deployment or release tag is made here.

Linux CI subsequently revealed two release-environment issues, preserved in
docs/21_GITHUB_PUBLICATION.md: a CI log-level setting suppressed structured D1 JSON
(removed and reproduced/fixed locally), and wider system-font text wraps pushed
the initial setup input below a 320x568 viewport. Numeric public-screen diagnostics
identified the extra 67.25px. Four CSS declarations scoped to <=360px onboarding
adjust heading/intro sizes and gaps; every original viewport, touch and security
assertion stays enabled. This is the only application change during publication.
Built application JavaScript bytes remain identical to e93fc70. The stylesheet
change yields index-Dcwf44wJ.css / index-Bd8V0yrB.js. Final local/remote results for
this correction are recorded in the publication doc.

Final correction results: npm run check exits 0 with 113 Vitest and 57 portable
browser cases. npm run test:edge exits 0 with all 19 cases; 272 local accessibility
scans have no violations. All original assertions/retry/skip/artifact settings are
preserved. Native repository regression and history audit pass. Linux GitHub CI
37230785921 passes the complete gate at a2469c2. Initial CI failures remain recorded
and are resolved without weakening checks. Publication handoff docs rerun CI on
main; final commit/hash/clean-state results are verified after that push.
