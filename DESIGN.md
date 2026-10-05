# Nibhrito interface

Nibhrito gives respectful feedback room to be honest. The interface should feel
open and human, with privacy supporting that purpose. Keep the product's working
flows and security boundaries intact when refining its appearance.

## Visual language

The arch in the local brand mark represents a private space. The public example
uses the same shape around a question and useful reply. It is a fictional
conversation, never an inbox preview populated from user data.

Use warm off-white, ink, restrained indigo, and green/teal in light mode. Dark mode
uses deep slate with lighter task surfaces and warm readable text. Indigo belongs
to actions and links; teal belongs to private delivery and constructive outcomes.
Blue and rose provide limited context accents. Avoid page-wide purple, neon,
gradient text, glass panels, or unrelated decorative shapes.

Semantic tokens live in `src/styles.css`. Both palettes must meet the same
contrast and focus requirements. Theme follows the browser/operating system;
there is no application theme preference, cookie, or appearance-storage feature.
CSS and matching theme-color metadata give the correct theme on first paint.

Body text uses native UI fonts with Bangla fallbacks. The public hero and final
invitation use local Georgia/serif for an editorial voice. No fonts are downloaded.
Operational headings stay in the UI family. Keep long text readable, and preserve
natural Bangla line height and wrapping.

## Composition and depth

Use surfaces where they separate a task or message. The question and reply are
individual conversation surfaces, not cards nested in a card. The arch's bounded
cream-to-teal/slate gradient establishes a place; offset soft shadows separate the
reply from it. Other sections use distinct sequences, comparison, and reading
layouts. Do not turn every paragraph into a card.

Forms, inbox notes, recovery, sharing, and legal pages use the same semantic
surfaces, controls, focus rings, and icon family. Preserve the white QR background
for scan contrast, complete-link wrapping, warning prominence, and comfortable
touch targets. Richness should recede around recovery and destructive actions.

## Motion

The public question/reply enter once using a short, staggered opacity/translation
transition. The content is visible by default and does not require a loop or
animation to make sense. Successful delivery has a small receipt confirmation.
Pointer/touch presses and immediate copy-state colors give quick feedback. Keyboard focus
remains immediate. There are no moving backgrounds, rotating headlines, parallax,
or animated message lists.

Motion uses native CSS, named properties, and the shared easing token. Reduced
motion shows the finished story immediately, with no movement. Color changes are
immediate: crossfading text and backgrounds can violate contrast during theme
switches, even when both finished palettes pass. Hover treatment is
limited to fine pointers that actually support hover.

## Review

Inspect actual pixels in both themes, not just source. Check narrow screens,
intermediate widths, keyboard navigation, reduced motion, long multilingual text,
empty/error/loading states, and private flows using synthetic data. Keep private
DOM, messages, keys, recovery material, and tokens out of saved evidence.

See [design engineering evidence](docs/22_DESIGN_ENGINEERING.md),
[testing requirements](docs/09_TESTING_ACCEPTANCE.md), and
[release acceptance](docs/20_RELEASE_ACCEPTANCE.md).
