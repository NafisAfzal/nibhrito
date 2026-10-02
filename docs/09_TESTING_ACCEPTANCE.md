# 09 - Testing and Acceptance Criteria

## Test layers

### Unit

- encoding,
- crypto protocol,
- schemas,
- byte limits,
- slug normalization,
- cursor encoding,
- auth verifier,
- rate-limit bucket derivation,
- expiry calculations.

### Integration

- Worker routes with local D1,
- migrations,
- owner authorization,
- message persistence,
- pagination,
- cleanup,
- quota/rate limit.

### E2E

- create profile,
- save recovery code,
- open share link in a clean browser context,
- send encrypted message,
- fetch/decrypt inbox,
- delete,
- expire,
- restore on second context,
- XSS payloads remain inert.

## Crypto acceptance matrix

Must test:

- normal round trip,
- empty/whitespace policy,
- Bangla Unicode,
- emoji,
- mixed Bangla/English,
- 4 KiB UTF-8 boundary,
- one-byte-over boundary,
- corrupt ciphertext,
- corrupt IV,
- corrupt salt,
- corrupt ephemeral public key,
- wrong profile slug in AAD,
- wrong message id in AAD,
- wrong key id,
- wrong private key.

## Privacy network inspection

Using Playwright/network hooks or equivalent, verify:

- message plaintext never appears in request URL,
- message plaintext never appears in request headers,
- message plaintext never appears in request body,
- private JWK never appears in requests,
- recovery secret never appears in requests,
- share fragment is not sent to backend as part of HTTP URL.

## XSS test payloads

Public profile fields and decrypted message display must safely render strings similar to:

```text
<script>alert(1)</script>
<img src=x onerror=alert(1)>
</textarea><script>alert(1)</script>
javascript:alert(1)
```

Do not make these executable during testing; assert they render as inert text.

## Authorization/IDOR tests

- owner A cannot read owner B inbox,
- owner A cannot delete owner B message,
- random token rejected,
- malformed auth rejected,
- disabled profile rejects new submissions,
- deleted profile cannot be recovered through normal API.

## Rate-limit tests

- burst reaches 429,
- windows reset,
- profile-specific limit isolated,
- raw IP is never persisted,
- rate-limit DB entries expire.

## Expiry tests

- server computes expiry,
- expired rows excluded even before cleanup,
- scheduled cleanup deletes,
- cleanup retries safe,
- new message with same profile unaffected.

## Security-header tests

Verify production response includes intended:

- CSP,
- Referrer-Policy,
- HSTS,
- X-Content-Type-Options,
- Permissions-Policy,
- frame restrictions.

## Browser matrix

Minimum production check:

- current Chrome/Chromium,
- current Edge or another Chromium install,
- Firefox,
- Safari/WebKit if accessible.

If a browser lacks a required crypto primitive, fail with an explicit unsupported-browser screen, not an insecure fallback.

## Release gate

Do not release if any of these are true:

- plaintext found in server request/log/database,
- private key/recovery secret transmitted,
- CSP requires `unsafe-eval`,
- message HTML can execute,
- key-fragment mismatch silently falls back,
- cross-profile IDOR exists,
- crypto tampering returns plaintext,
- recovery flow is untested,
- production migration cannot be reproduced.
