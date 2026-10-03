# Product-intent UX upgrade

## Audit and direction

Nibhrito exists to make thoughtful, honest feedback easier to give and safer to receive. Privacy supports that purpose. The established redesign was calm and usable, but made privacy visible more readily than the everyday reason to use it.

| Before                                   | After                                                          | Why                                                                           |
| ---------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Abstract sealed note in the hero         | Clearly labelled example question and constructive response    | Explain the product in a glance without suggesting secret/confession-only use |
| Numbered text-only steps                 | Connected link/share/inbox icons and short captions            | Make the action sequence visible                                              |
| Privacy explained by paragraphs          | Sender browser → encrypted storage → recipient browser diagram | Explain who does what without algorithm jargon                                |
| No discoverable About page               | Public “Why Nibhrito” story with practical scenarios           | Explain positive purpose, social pressure and respectful use                  |
| Sharing and setup depend on instructions | Compact visual guides beside real actions                      | Connect the user's next action to its outcome                                 |
| Recovery explained only in prose         | Saved code → trusted browser → restored access                 | Explain consequences without displaying extra secrets                         |
| Shield icon on errors                    | Distinct error, helpful, privacy and critical recovery cues    | Improve scanning without relying on color alone                               |

Keep restrained indigo for actions, warm light surfaces for openness and teal for trust. Preserve accessible system typography, Bangla support, native dark preference and existing control behavior. Examples are explicitly fictional product illustrations, not testimonials or real inbox data.

## Scope and preservation

This is a presentation and product explanation change. Protocol version, cryptography, verified share links, backend API contracts, authorization, database behavior, key handling, recovery, deletion/expiry, rate limiting and security headers remain unchanged. No new dependencies or remote resources. Legal policy meaning remains intact. The current master-plan product definition follows the user's explicit feedback/honest-expression clarification.

The positive, non-adult-themed product direction does not change the existing Terms age requirement. No “for all ages”, guaranteed safety, untraceability or server moderation claim is introduced. The operator still needs legal review before public deployment.

## Implemented

- Homepage: a labelled example question, share connection and constructive response replace the abstract sealed note. Three practical use cases, an icon/arrow step flow, reduced-social-pressure explanation, encryption diagram and considerate-use principles form the narrative. Main copy is “Invite honest feedback. Give it a private space.”
- Public `/about`: “Why Nibhrito” is discoverable in desktop/mobile navigation and the footer. It explains the reason for the product, practical invitations, privacy and respectful culture. It renders without Web Crypto, IndexedDB or API calls; operational routes still fail closed when browser security features are unavailable.
- Setup/profile: visual invitation → link → inbox and link/key progress symbols explain what is being made. The existing saved-code acknowledgement, public metadata notices and validation remain. Profile editing includes a clear example invitation.
- My link: full copying/QR and manual fallback are unchanged. Copy → invite → read explains how to share with a question. It does not change, truncate or manufacture a verified link.
- Sender/success: constructive guidance supports the dominant composer. Warm delivery feedback encourages care. Encryption, draft lifetime, byte limits and identical-envelope retry behavior remain unchanged.
- Inbox: an empty inbox shows a visual path to the first response and one sharing action. Irrelevant search/filter controls are omitted until messages, a cursor or active filters exist; controls remain available to clear active searches. Message categories use meaningful symbols without inventing sender or unread metadata. The refresh button retains a readable mobile label.
- Recovery/archive: saved code → trusted browser → inbox and encrypted file + saved code → local reading explain the consequences. Code display and deliberate entry remain exactly in the existing flows; no extra secret is revealed or copied. Critical recovery warnings have a warning symbol distinct from helpful/teal privacy cues and red error symbols.
- Supporting documents: privacy/security diagrams, respectful-use principles and a safe support reminder supplement the unchanged policy bodies. The guidelines page avoids a redundant link to itself.

`src/components/ProductStory.tsx` provides typed ProductFlow, PrivacyFlow, RecoveryFlow, FeedbackExample, UseCases, OpenFeedback and RespectfulUse. Public copy lives in `src/app/story.ts`; shared inline SVG icons and semantic styles are bundled locally. Warm neutral backgrounds reduce purple weight; restrained indigo actions, soft teal trust cues and native dark preference retain the brand. No new motion is introduced.

## Responsive and accessibility review

Horizontal desktop flows become vertical mobile sequences in the same DOM reading order. Semantic labelled lists, visible captions and heading hierarchy carry meaning; decorative icons/arrows/numbers are hidden from screen readers. Existing keyboard focus, mobile-menu Escape/focus return, labels, status feedback, 44–48px controls and reduced-motion support remain. System fonts and generous line-height support Bangla and English. The contrast suite checks both themes against AA text and control/focus thresholds.

Masked screenshots inspected homepage/About, setup, recovery, sharing/QR, sender/success, empty/populated inbox, security, archive and explanatory/error pages. A second state pass covers unsupported crypto, profile save, inbox loading/network error and authenticated-decryption failure. Fixed a wrapping refresh button and a redundant self-link. No horizontal overflow was detected. Private content/codes were masked, artifacts stayed ignored and disposable profiles were deleted. This is engineering QA, not independent WCAG certification or a user comprehension study.

## Verification

Baseline: actual Worker, 195 masked responsive/state checks at 360–1440px in light/dark; zero overflow; disposable fixture deleted.

Final: 224 main visual/state checks plus 40 final state checks, zero overflow. Full `npm run check` exits 0: 113 Vitest tests in 18 files; 48 E2E cases (16 per engine across Chromium, Firefox, WebKit), no retries/skips; lint, format, strict TypeScript, privacy/tracked-secret scan, production build, Worker dry run and audit (zero vulnerabilities). No migration is added; both existing migrations remain applied. The intentional failure probe still confirms private DOM is absent from test failure output/artifacts.

Two added browser journeys verify public purpose/examples/discoverability without crypto/storage/API access or third-party requests, and captioned diagram order/layout across five widths. Existing owner coverage now asserts the setup, sharing, recovery and empty-state guides; all original crypto/privacy/security assertions remain. Security diff review confirms no change to cryptographic modules, key storage, API client, shared schemas, Worker, migrations, CSP/headers, dependency/configuration files or legal policy bodies. No new Critical/High finding was identified.

Run `npm run dev`, then open `http://127.0.0.1:8787` (About: `/about`). No deployment was performed. Real devices, Safari/iOS, assistive technology and production acceptance remain the existing manual release gates. See PROJECT_STATUS.md, FINAL_VERIFICATION.md and `.agent/plans/product-intent-ux.md` for continuation.
