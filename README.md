# Nibhrito (নিভৃত)

**Privacy-first anonymous feedback with client-side end-to-end encryption.**

This repository starts with an implementation-ready planning pack. The goal is to let a coding agent such as Codex or OpenCode build the product phase by phase without having to redesign the architecture.

## Start here

Read in this order:

1. `AGENTS.md`
2. `docs/00_START_HERE.md`
3. `docs/01_MASTER_PLAN.md`
4. `docs/03_E2EE_PROTOCOL.md`
5. `docs/04_SECURITY_THREAT_MODEL.md`
6. `docs/06_IMPLEMENTATION_ROADMAP.md`
7. `docs/09_TESTING_ACCEPTANCE.md`
8. `docs/10_AGENT_RUNBOOK.md`

The remaining files are references for data/API, UX, deployment, legal/privacy, and sources.

## Final architecture decision

- Frontend: React + TypeScript + Vite, static SPA
- Styling: Tailwind CSS; CSS-first motion; no remote runtime UI scripts
- API: Cloudflare Worker, TypeScript, Hono optional but recommended
- Database: Cloudflare D1
- Crypto: browser-native Web Crypto API
- Message encryption: ephemeral P-256 ECDH -> HKDF-SHA-256 -> AES-256-GCM
- Recipient public key: carried in the share URL fragment (`#pk=...`) so it is not sent to the server in the initial HTTP request
- Private key: generated in the browser, persisted as a non-extractable `CryptoKey` in IndexedDB after an encrypted recovery bundle is prepared
- Recovery: high-entropy recovery secret + server-stored encrypted recovery blob; server never receives the recovery secret
- Owner authentication: random high-entropy owner token, server stores only a SHA-256 verifier; token is included in the encrypted recovery bundle
- Abuse protection: request-size caps, per-profile quotas, short-lived HMAC-derived network buckets, optional challenge escalation; never persist raw IP in the application database
- Message expiry: `expires_at`, indexed cleanup, scheduled deletion plus opportunistic cleanup
- Hosting: Cloudflare free tier first, designed for migration rather than claiming guaranteed free hosting forever

## Product claim language

Use: **“Anonymous to the recipient, end-to-end encrypted in the browser, and stored as ciphertext.”**

Do not claim: **“completely untrackable,” “impossible for anyone to identify you,” “developer can never access anything,” or “free forever.”**

The server is designed not to possess message-decryption keys. However, network infrastructure processes technical metadata, endpoint devices can be compromised, and a web application operator could theoretically ship a malicious future JavaScript build. The product must communicate these limitations clearly.
