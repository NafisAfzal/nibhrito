# 06 - Implementation Roadmap

Implement sequentially. Each phase must pass its acceptance criteria before continuing.

## Phase 0 - Repository and local platform

Tasks:

- initialize Node/TypeScript project,
- Vite React app,
- Worker entry point,
- D1 local binding,
- SQL migration runner/workflow,
- Vitest,
- Playwright,
- lint + formatting,
- strict TypeScript,
- `.dev.vars.example`,
- no secrets committed,
- local `/api/v1/health` works through Worker.

Acceptance:

- production build succeeds,
- Worker serves SPA and API locally,
- test command works,
- migration creates local D1 schema,
- CSP/security headers visible in local/proxied test environment.

## Phase 1 - Crypto core

Tasks:

- binary/base64url helpers,
- public key import/export,
- key id hashing,
- AAD formatter,
- ECDH + HKDF + AES-GCM message encrypt/decrypt,
- recovery encrypt/decrypt,
- keyring interface,
- deterministic test fixtures.

Acceptance:

- all protocol tests in `docs/03_E2EE_PROTOCOL.md` pass,
- tampering fails closed,
- wrong key fails closed,
- crypto module has no React/backend dependencies,
- no third-party crypto library required for protocol operations.

## Phase 2 - Profile creation and recovery

Tasks:

- profile creation UI,
- slug validation,
- recipient ECDH key generation,
- owner token generation,
- encrypted recovery bundle,
- IndexedDB persistence of non-extractable private key,
- force user to confirm recovery code saved,
- profile API + DB,
- restore-on-new-device flow.

Acceptance:

- database contains no private plaintext key/recovery secret,
- restored device can decrypt test message,
- wrong recovery code cannot decrypt recovery bundle,
- no secret appears in console/network payloads except the owner token on authenticated HTTPS API requests.

## Phase 3 - Verified share link and sender

Tasks:

- canonical share URL with `#v=1&pk=...`,
- client parser,
- invalid/missing key failure screen,
- public profile page,
- sender textarea with byte counter,
- optional encrypted mood/category,
- local encryption,
- message submission,
- success state,
- QR generation locally.

Acceptance:

- plaintext absent from request payload,
- backend can store/retrieve message without crypto code,
- malformed key fragment cannot send,
- duplicate id retry is safe,
- max-size message handled correctly.

## Phase 4 - Encrypted inbox

Tasks:

- owner auth,
- cursor pagination,
- decrypt on client,
- loading/error states,
- delete message,
- local client-side search/filter,
- hide expired messages,
- plaintext memory minimization.

Acceptance:

- cross-profile IDOR tests fail safely,
- tampered envelope displays corruption error without partial text,
- no decrypted text appears in browser persistent storage,
- message HTML payload renders inert text.

## Phase 5 - Expiry and quotas

Tasks:

- retention choices,
- authoritative server `expires_at`,
- expiry indexes,
- scheduled cleanup Worker handler,
- bounded cleanup batches,
- opportunistic cleanup,
- profile storage quota.

Acceptance:

- expired rows never appear in inbox API,
- cleanup removes expired rows,
- cleanup is safe to retry,
- large cleanup cannot exceed free-tier CPU design assumptions due to bounded batches.

## Phase 6 - Abuse resistance

Tasks:

- request envelope byte caps,
- per-profile send limits,
- short-lived rotating network buckets without raw IP storage,
- global emergency throttling,
- profile disable switch,
- spam-friendly generic errors,
- optional challenge escalation design behind feature flag.

Acceptance:

- raw IP is not written to D1/app logs,
- burst tests receive 429,
- normal users recover after window expiry,
- public profile cannot reveal rate-limit bucket data.

## Phase 7 - Hardening and legal UX

Tasks:

- production CSP,
- Referrer-Policy,
- HSTS,
- Permissions-Policy,
- no remote scripts,
- dependency audit,
- secret scanning,
- Terms,
- Privacy Policy,
- Acceptable Use Policy,
- Security page,
- recovery warning UX,
- zero-knowledge limitation wording.

Acceptance:

- automated security-header test passes,
- CSP blocks injected inline script in E2E test,
- no prohibited marketing claim remains,
- privacy page accurately describes metadata processing and deletion limitations.

## Phase 8 - Deployment

Tasks:

- create D1 production DB,
- configure Wrangler bindings/secrets,
- run production migrations,
- deploy Worker + static assets,
- configure Cron Trigger,
- smoke test production,
- validate HTTPS and headers,
- create rollback instructions,
- tag release `v1.0.0` when final checks pass.

Acceptance:

- send/decrypt round trip succeeds in production on at least Chrome/Edge and one additional browser engine,
- DB contains only expected encrypted fields,
- Cron invocation observed,
- production logs contain no secrets,
- recovery tested on a second browser profile/device.

## Phase 9 - Post-launch optional work

Only after metrics show need:

- encrypted exports,
- voluntary abuse-report disclosure flow,
- key rotation UI,
- multi-device authorization,
- challenge escalation,
- native client,
- cryptographic prekeys/stronger forward secrecy.
