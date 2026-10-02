# 08 - Privacy, Legal Pages, and Abuse Handling

This is product/engineering guidance, not jurisdiction-specific legal advice. Terms and privacy policies reduce ambiguity but do not automatically remove developer/operator liability.

## Required public pages

- Terms of Service
- Privacy Policy
- Acceptable Use Policy
- Security & Encryption Explanation
- Abuse/Contact page

## Privacy Policy must explain

### What the app stores

- public profile metadata,
- encrypted message envelopes,
- encrypted recovery blob,
- server timestamps,
- short-lived abuse-control bucket identifiers,
- operational metadata needed for service reliability.

### What the app is designed not to store

- message plaintext,
- plaintext recipient private keys,
- recovery secret,
- raw sender IP in application DB,
- browser fingerprint for advertising/tracking,
- third-party ad/analytics profiles.

### Important technical qualification

Hosting/CDN providers process network requests and therefore may process technical connection metadata such as IP addresses under their own infrastructure policies. Nibhrito should not claim that an IP address is never processed anywhere.

### Deletion/expiry

Explain:

- expired messages stop being served by application queries,
- scheduled jobs remove rows,
- provider backup/time-travel systems may temporarily retain recoverable encrypted state,
- deletion cannot erase copies/screenshots/exports already made by a recipient or sender.

## Terms/AUP prohibited uses

At minimum prohibit:

- credible threats of violence,
- targeted harassment and stalking,
- sexual exploitation of minors,
- non-consensual intimate content,
- doxxing/private identifying information,
- fraud and impersonation,
- malware or malicious links,
- illegal solicitation,
- coordinated spam/automation abuse,
- attempts to attack or bypass Nibhrito security.

The final legal language should be reviewed for the jurisdiction in which the service is operated.

## Moderation under E2EE

The backend cannot inspect private message text without intentionally breaking the architecture.

Therefore:

- recipient can delete messages locally/server-side,
- recipient can disable incoming messages,
- rate limits reduce spam,
- profiles can be disabled for platform abuse,
- public profile metadata can be moderated because it is public,
- private message review occurs only when recipient explicitly chooses to report/disclose that message.

## Voluntary report design - later phase

A report screen should say clearly that reporting will disclose the selected message to Nibhrito moderators.

Possible flow:

1. Recipient decrypts message locally.
2. User selects “Report and disclose this message”.
3. UI shows exactly what will be disclosed.
4. User confirms.
5. A separate report object is sent over TLS or encrypted to a moderation public key.
6. Report is retained under a separate, documented policy.

Never silently upload plaintext for automated moderation.

## Age and sensitive-use considerations

Do not market Nibhrito as a guaranteed safe channel for emergencies, whistleblowing against powerful adversaries, self-harm crisis response, or highly sensitive legal/medical communication. Those use cases require stronger operational controls and potentially specialized compliance.

## Security page wording

Explain:

- browser-side encryption,
- public key in share link fragment,
- what the server stores,
- recovery limitations,
- endpoint/XSS limitations,
- metadata limitations,
- lack of full forward secrecy in v1,
- why losing recovery code may make messages permanently unreadable.
