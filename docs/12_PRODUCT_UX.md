# 12 - Product and UX Notes

## Brand direction

“Nibhrito” means secluded/private. The UI should feel calm, safe, and personal rather than “hacker” themed.

Recommended visual principles:

- dark/light mode,
- soft neutral palette,
- one accent color chosen by profile owner,
- large readable Bangla/English typography,
- mobile-first card layout,
- subtle CSS transitions,
- no manipulative urgency or public popularity counters.

## Core screens

1. Landing page
2. Create profile
3. Recovery-code confirmation
4. Profile dashboard
5. Share link / QR
6. Public send page
7. Send success
8. Encrypted inbox
9. Message detail
10. Restore profile
11. Settings
12. Terms / Privacy / AUP / Security

## Bangla and English

Design strings for localization from day one. Do not hard-code UI text deeply in components.

Suggested locales:

- `bn-BD`
- `en`

User-generated content is Unicode and must be byte-limited as UTF-8 at both client and server.

## Sender prompts

Constructive templates can reduce abuse without reading messages:

- “একটি ভালো দিক বলুন”
- “একটি উন্নতির জায়গা বলুন”
- “যেটা সামনে বলতে সংকোচ লাগে, সম্মানজনকভাবে এখানে বলুন”
- “What should I keep doing?”
- “What could I improve?”

## Privacy UX

Always show a small status near compose:

```text
Encrypted in your browser before sending.
```

On recovery setup:

```text
Nibhrito cannot recover this code for you. If you lose both this device and the recovery code, old messages may become permanently unreadable.
```

On invalid share key:

```text
This link is incomplete or cannot be verified. Ask the profile owner for the full Nibhrito link.
```

Do not silently degrade security for convenience.

## Implemented visual communication

The accepted consumer redesign (ab5dc7d), product-intent upgrade (8526c06) and final
mobile polish retain one brand and working lifecycle. Local person/conversation
symbols, qualified social-pressure scenarios, short use-case examples and captioned
sharing/privacy/recovery flows explain the positive honest-feedback purpose without
depending on paragraphs. Indigo supports feedback, teal trust, sky information,
emerald completion, amber recovery consequences and red actual danger/errors.
Warm light and slate dark surfaces use system preference and local fonts.

Public diagrams become vertical on phones; brief setup/recovery overviews keep three
legible symbols/captions horizontally. Phone gutters, full-width primary actions,
associated labels and native destructive confirmations remain intentional. No unread
state, extra metadata or server recovery is implied. See docs/19_FINAL_MOBILE_POLISH.md
for the audit, exact responsive matrix, accessibility and verification evidence;
docs/17 and docs/18 preserve the preceding passes.
