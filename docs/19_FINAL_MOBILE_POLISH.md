# Final product communication and mobile polish

## Audit

Baseline: 8526c06 on top of ab5dc7d. The brand, working flows and visual guides are good foundations. The remaining problem is hierarchy and explanation density, especially on short phones.

| Before                                                 | After                                                                        | Why                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Social hesitation explained in three paragraphs        | Qualified side-by-side conversation scenarios with a visible causal sequence | Explain the reason to use Nibhrito through relationships    |
| Hero message cards look like anonymous rectangles      | Human participant symbols, conversation shapes and an encrypted-delivery cue | Connect a real invitation to a thoughtful response          |
| Use cases repeat a caption and example                 | Meaningful symbol, heading and short example                                 | Reduce reading without losing practical purpose             |
| Trust and general guidance both teal/purple            | Semantic trust teal, information sky, feedback indigo and success emerald    | Make function visible before the text                       |
| Dark surfaces are nearly black/violet                  | Calm slate surfaces with readable semantic colors                            | Preserve dark preference while reducing an underground feel |
| Setup overview pushes the first field down             | Compact icon-led overview and shorter introduction                           | Put the form within comfortable phone reach                 |
| Expiry is inside details; destructive action only text | Visible existing expiry, clock and trash symbols                             | Improve inbox scanning without inventing metadata           |
| Responsive evidence begins at 360px                    | Full 320–1440px matrix and touch/short-height checks                         | Exercise the smallest supported phones and keyboard space   |

## Preservation

This is refinement of both preceding UX commits. Protocol, E2EE, key/recovery handling, API contracts, authorization, database, rate limits, deletion/expiry, CSP/security headers and legal policy meanings remain unchanged. Public illustrations contain labelled examples. No dependencies, remote assets, telemetry or deployment.

## Visual language and product story

The existing homepage headline and identity remain. The example now shows two
human participants, offset conversation shapes, a share connection and an explicit
encrypted-delivery cue. It is clearly labelled as an example, never live inbox data.
Landing and About put the reason to use Nibhrito immediately after the hero:
identity → second thoughts → withheld feedback beside a private response → room
to speak → useful perspective. This is a possible experience, not a promise of
eliminating judgment or retaliation; the visible qualifier and anonymity limits
remain. Four short, illustrated invitations cover work, ideas, personal reflection,
and a team or class. Repeated explanatory paragraphs are removed from these items.

The culture remains “Be specific”, “Be considerate” and “Keep it safe”. This is
constructive honest communication rather than secrets or confession drama. The
existing three-step sharing and browser → encrypted storage → recipient diagrams
remain, with a two-stage private-delivery guide on success. About is already
discoverable; no extra route or navigation clutter is needed. Legal age eligibility
and policy bodies are unchanged by the non-adult-themed product direction.

The local 24px outline SVG vocabulary gains clock, trash, copy, information, pause,
people and thought symbols. Person circles and conversation shapes use native HTML
and CSS, not stock or externally loaded illustrations. PressureComparison extends
ProductStory; ProductFlow supports compact overviews while keeping full explanatory
versions for public/privacy/recovery reading. Icons are decorative beside visible
captions, so meaning remains available without color or visual perception.

## Semantic color

| Meaning             | Light              | Dark               | Use                                      |
| ------------------- | ------------------ | ------------------ | ---------------------------------------- |
| Feedback / brand    | #4c3d99 on #eeebfa | #cdc0ff on #373248 | Invitations, link and conversation       |
| Trust               | #247769 on #e7f3ef | #9bd6cb on #2a403e | Browser encryption and private delivery  |
| Information         | #2d6284 on #edf4fa | #b0d4ed on #293d4a | Helpful guidance and identified scenario |
| Completion          | #226b48 on #eaf5ef | #a2deba on #2b4032 | Copied link and delivered message        |
| Recovery warning    | #775016 on #fff5df | #efd197 on #433727 | Loss consequences                        |
| Destruction / error | #a42c42 on #fff0f2 | #ffadbb on #4d3038 | Delete and actual failures               |

Warm light surfaces remain; dark mode moves from near-black violet to calm slate
(#20242c background, #272c35 surface). System color preference is retained. Both
schemes use the same semantic roles, readable neutral text and existing focus
ring. Expanded token tests cover information/trust surfaces, AA text contrast,
input boundaries and focus contrast. No gradients, new motion, remote fonts or
extra dependencies are introduced.

## Mobile and interaction refinement

At 320–360px, 16px gutters/card padding preserve usable space. Hero actions fill
the available width. The setup overview uses three readable symbols and short
captions; the first field fits the initial 320×568 viewport. Recovery setup uses
the same compact overview, with the full saved-code acknowledgement, code handling
and explicit amber loss warning intact. Longer explanations retain vertical phone
flows and become horizontal on wider screens. A cascade issue that dropped compact
arrows below captions was fixed and checked again.

Sharing keeps the complete verified URL and local QR, with a copy symbol changing
to a check and semantic success feedback. The sender has one short guidance line
and the dominant composer. Inbox expiry is visible with a clock using existing
server metadata; exact time remains available in details. Trash symbols reinforce
the existing destructive confirmation, with no invented unread/sender data.
Security, restore, archive and legal/error screens inherit the refined palette,
small-phone spacing and semantic symbols without changing their behavior.

The new touch journey checks a maximum-length link name, complete verified copying,
QR, recovery association, long Bangla/English/mixed drafts, a focused 320×360
composer viewport, network failure/draft retention, real browser encryption and
decryption, visible expiry, cancelled/confirmed deletion and empty-state guidance.
Primary controls are checked at least 44px. This emulates keyboard space rather
than a physical OS keyboard. Native dialogs, mobile-menu Escape/focus, status
announcements, associated labels, semantic list order and reduced-motion support
remain. Private values are compared through booleans and excluded from artifacts.

## Verification

The actual local Worker baseline completed 268 masked layout/state checks with
zero overflow. Final application QA completed 477 main checks plus 100 state checks
(577 total) at 320, 360, 375, 390, 412, 430, 768, 1024, 1280 and 1440px in light/dark.
No horizontal overflow. Captures include public/About, setup/recovery, full link/QR
and clipboard fallback, sender/success, long-script inbox reading, settings/security,
restore/archive, legal/error pages, unsupported crypto, loading, network/rate errors
and authenticated-decryption failure. The focused shortened composer frame and
smallest error layouts were checked explicitly. Private messages/codes were masked;
artifacts remain ignored and disposable profiles were deleted.

Full `npm run check` exits 0 against final application source: 113 Vitest tests in
18 files; 51 E2E cases, 17 each in Chromium, Firefox and WebKit, no retries/skips.
Lint, formatting, strict TypeScript, unit/crypto/D1/API/authorization/integration,
production build, Worker dry run, privacy/tracked-secret checks and dependency audit
all pass. Audit reports zero vulnerabilities. Both existing migrations are applied;
none is added. The intentional failed-assertion probe confirms private DOM is absent
from output/artifacts. All original security assertions remain.

Security diff review confirms no changes in crypto, key storage, API client, shared
schemas/protocol, Worker, database/migrations, CSP/headers, dependency/configuration
or legal policy bodies. New presentation adds no plaintext persistence, secret
display/copy, logging, remote request or tracking. No new Critical/High or actionable
Medium finding identified. This is engineering self-review, not independent security
or accessibility certification.

A final conceptual skim answers what the product is, why a private response may
help, how a link becomes feedback, why encryption protects content, how to create
the link and where replies arrive through the hero conversation, comparative paths,
use-case invitations and labelled sequences. This is a product-design review, not
a measured five-second user study. Real phone keyboards, Safari/iOS and assistive
technology remain manual checks. Start `npm run dev`, open `http://127.0.0.1:8787`.
No production deployment.
