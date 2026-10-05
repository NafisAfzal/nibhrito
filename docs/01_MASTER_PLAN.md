# 01 - Nibhrito Master Plan

## 1. Product definition

Nibhrito is a privacy-first anonymous feedback and honest-expression platform. It encourages thoughtful opinions, constructive suggestions and respectful communication without social pressure. A recipient creates a profile and shares a unique link. A sender opens that link, writes a message, and the browser encrypts the content before upload. The backend stores only an encrypted envelope and delivery metadata needed to operate the service.

### Primary users

- students collecting honest peer feedback,
- creators receiving anonymous comments,
- professionals collecting candid suggestions,
- small communities collecting private opinions.

### Primary value

- sender identity is not shown to the recipient,
- message content is encrypted in the sender's browser,
- the backend does not possess the recipient's decryption key,
- the recipient decrypts locally,
- messages expire automatically,
- the system minimizes retained metadata.

## 2. Claims we can and cannot make

### Defensible claims

- “Messages are encrypted in the browser before upload.”
- “Stored message bodies are ciphertext.”
- “Nibhrito's application server does not hold the recipient's message-decryption key.”
- “The recipient decrypts messages locally.”
- “The application database does not intentionally store raw sender IP addresses.”

### Claims to avoid

- “100% untrackable.”
- “No one can identify a sender.”
- “Impossible to hack.”
- “The developer can never access future plaintext under any circumstance.”
- “Free hosting forever.”

Network providers necessarily process connection metadata, recipient devices can be compromised, and a web operator controlling future JavaScript can theoretically attempt a malicious build. The architecture significantly reduces trust in the server but does not eliminate all endpoint and delivery-channel risk.

## 3. Architecture decision

### Frontend

- React
- TypeScript strict mode
- Vite
- Tailwind CSS
- Native Web Crypto API
- IndexedDB for local cryptographic state
- No SSR for MVP
- No remote runtime JavaScript on sensitive routes

Why: a static SPA minimizes server complexity, makes the crypto boundary clear, and can be hosted as static assets at no request cost on the selected platform.

### Backend

- Cloudflare Worker
- TypeScript
- Hono recommended for routing, kept thin
- Zod or equivalent schema validation shared between client and API
- No backend framework that requires a long-running server

### Database

- Cloudflare D1
- SQLite-compatible migrations
- Repository abstraction around D1 queries
- Cursor pagination, indexed expiry queries, no full-table scans in hot paths

### Deployment

- Cloudflare Worker + Static Assets
- D1 binding for database
- Workers Cron Trigger for expiry cleanup
- GitHub for source control
- `*.workers.dev` hostname for zero-cost initial deployment
- custom domain only when the owner is willing to pay yearly domain registration

## 4. Why Cloudflare is the recommended v1 platform

It keeps static hosting, API, SQL storage, cron cleanup, TLS, and edge delivery in one deployment model. This reduces operational failure modes and avoids combining several free-tier vendors.

Free-tier limits must be treated as capacity constraints, not promises of permanent free service. As verified on 2026-10-03, Workers Free allows 100,000 Worker requests/day, D1 includes 5 million rows read/day and 100,000 rows written/day, and static asset requests are free/unlimited. D1 free storage is constrained, so quotas and expiry are part of the product design rather than an afterthought.

## 5. Core data flow

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/message-flow-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="assets/message-flow-light.svg" />
  <img src="assets/message-flow-light.svg" alt="The sender encrypts locally, the Worker stores ciphertext in D1, and the authenticated recipient decrypts locally" width="480" height="824" />
</picture>

The `#pk` URL fragment is not part of the HTTP request sent to the server. The sender client uses that fragment as the recipient public encryption key.

## 6. MVP scope

### Include

- create anonymous recipient profile,
- choose display name, prompt, theme, and message retention period,
- create/share a cryptographic profile link,
- QR code generation locally,
- send text-only encrypted message,
- optional mood/category stored inside ciphertext,
- encrypted inbox,
- local decryption,
- delete message,
- expiry policy,
- encrypted recovery bundle,
- restore profile on a new device using recovery code,
- disable/delete profile,
- privacy, terms, acceptable-use, security pages,
- abuse controls and sender throttling,
- accessibility and mobile-first UI.

### Explicitly exclude from MVP

- file/image/audio attachments,
- public comments,
- group chats,
- real-time chat/websocket,
- phone/email identity,
- password reset,
- AI reading/moderating private messages,
- server-side search of messages,
- end-to-end encrypted replies,
- full Signal-style forward secrecy,
- ad networks and behavioral analytics.

## 7. Product experience

### Recipient onboarding

1. Open Nibhrito.
2. Choose display name/slug and a short public prompt.
3. Browser generates encryption key material and owner recovery material.
4. Profile is created with public metadata.
5. User is forced to save a recovery code before completing setup.
6. Nibhrito produces the full share link containing the recipient public key fragment.
7. User can copy link or generate a QR code.

### Sender flow

1. Open recipient's complete share link.
2. Client validates the `#pk` fragment and supported protocol version.
3. Client fetches only public profile metadata.
4. Sender writes message.
5. Client generates a fresh ephemeral ECDH key pair.
6. Client derives a one-message symmetric key and encrypts locally.
7. Only the encrypted envelope is uploaded.
8. Sender sees an acknowledgement after durable storage.

### Recipient inbox flow

1. Owner authentication is loaded locally.
2. API returns encrypted envelopes.
3. Browser derives each message key and decrypts locally.
4. UI holds plaintext in memory only as needed.
5. Delete requests remove the server record; local UI clears plaintext immediately.

## 8. Privacy-preserving recovery

A zero-account app still needs a safe recovery story.

During profile creation:

- generate a high-entropy `recovery_secret` in the browser,
- export the encryption private key only during initial setup,
- create a recovery JSON payload containing private key material, owner token, protocol version, and key id,
- encrypt that payload with a key derived from `recovery_secret`,
- upload only the encrypted recovery blob,
- display the recovery code once and ask the user to save it,
- re-import the working private key as non-extractable and store the `CryptoKey` in IndexedDB,
- erase temporary export variables as far as JavaScript allows.

Restore flow:

- user enters profile slug and recovery code,
- backend returns encrypted recovery blob,
- browser decrypts locally,
- validates key id against the profile/share identity,
- imports private key as non-extractable,
- restores owner token locally.

The server never receives the recovery secret.

## 9. Abuse and moderation model

E2EE prevents server-side content moderation by design. Therefore safety controls must operate around content rather than secretly weakening encryption.

Use:

- maximum message byte size,
- request schema validation,
- per-profile submission quotas,
- per-network short-window rate limits using a rotating HMAC-derived bucket, not raw stored IP,
- global emergency rate limit,
- profile disable switch,
- recipient delete/block controls,
- optional challenge escalation under detected abuse,
- recipient-controlled voluntary report flow in a later phase.

If a recipient reports a message for moderation, the UI must explicitly explain that reporting will disclose that selected message to moderators. Reporting must be opt-in per message.

Never add a hidden server decryption key or “law-enforcement master key.”

## 10. Message expiry

Default retention: 30 days.

Recommended choices: 1 day, 7 days, 30 days, 90 days.

Rules:

- backend computes canonical `expires_at`,
- retrieval always filters `expires_at > now`,
- index `expires_at`,
- scheduled cleanup deletes expired rows,
- opportunistic cleanup runs in bounded batches during safe API operations,
- do not promise immediate physical erasure from infrastructure backups.

Cloudflare D1 free accounts currently have a 7-day Time Travel recovery window. Deleted ciphertext can therefore remain recoverable at the infrastructure layer for that recovery window. This must be described accurately in the privacy documentation.

## 11. Scalability strategy

### Small usage

One Worker + one D1 database is enough.

### Moderate growth

- optimize indexes,
- enforce cursor pagination,
- batch deletes,
- cache public profile metadata where safe,
- shard old/large data only if free-tier database limits become a real constraint,
- upgrade Worker/D1 plan if operationally justified.

### Larger growth

The codebase should expose interfaces for:

- `ProfileRepository`,
- `MessageRepository`,
- `RecoveryRepository`,
- `RateLimitStore`.

This makes migration possible to managed Postgres or another SQL backend without rewriting browser crypto.

## 12. Security priorities

The highest-risk component is not D1. It is the JavaScript that handles plaintext and keys.

Priorities:

1. prevent XSS,
2. prevent remote-script supply-chain exposure,
3. keep crypto code small and heavily tested,
4. validate the full share link public key,
5. avoid logging secrets,
6. use strict security headers,
7. protect dependency updates,
8. make recovery explicit and testable,
9. keep server blind to plaintext,
10. document unavoidable limitations.

## 13. Fun features that fit the privacy model

Good additions:

- themes and profile accent choices,
- locally generated QR share card,
- anonymous “mood” or “type” tags encrypted inside the message,
- random constructive-feedback prompt suggestions,
- “one thing I appreciate / one thing to improve” template,
- local-only inbox search after decryption,
- local archive export encrypted with a user-provided export key,
- reveal animation for a newly decrypted message,
- streak or message-count UI only if calculated client-side from the inbox and not made public by default.

Avoid engagement mechanics that pressure users to send more anonymous content or expose message counts publicly.

## 14. Future cryptographic upgrades

Potential later work:

- X25519 after browser-support verification,
- recipient signed prekey pools for stronger forward secrecy,
- multi-device key authorization,
- passkey-based local unlock,
- native desktop/mobile client with stronger protection against malicious web-build replacement.

These are not MVP requirements.

## 15. Success criteria

Nibhrito v1 is successful when a security review can verify all of the following:

- backend never receives message plaintext,
- database breach reveals ciphertext but not message contents,
- recovery blob is useless without recovery secret,
- raw sender IP is absent from application DB/logging code,
- share-link key mismatch fails closed,
- XSS protections are strict,
- expired messages disappear from all application queries immediately after expiry,
- cleanup eventually deletes expired DB rows,
- lost recovery code correctly means unrecoverable content,
- all critical flows pass cross-browser E2E tests.
