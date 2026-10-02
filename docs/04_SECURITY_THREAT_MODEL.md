# 04 - Security and Threat Model

## Assets

Highest sensitivity:

- message plaintext,
- recipient private encryption key,
- recovery secret,
- owner token,
- decrypted inbox state.

Moderate sensitivity:

- encrypted recovery blob,
- ciphertext messages,
- profile metadata,
- rate-limit bucket identifiers.

## Adversaries considered

- database thief,
- accidental operator access,
- malicious sender,
- bot/spam sender,
- XSS attacker,
- dependency/supply-chain attacker,
- network observer outside TLS termination,
- stolen/lost recipient device,
- attacker with copied recovery code,
- attacker tampering with ciphertext.

## Security properties

### Database compromise

Expected outcome: attacker obtains ciphertext, public metadata, encrypted recovery blob, and hashed owner verifier. Message plaintext and recipient private key should remain unavailable without recovery secret/private key.

### Passive network observer

TLS protects transport; E2EE means message body is also encrypted before transport. Network-level metadata such as source/destination/timing is not hidden by Nibhrito.

### Malicious sender

Can submit abusive ciphertext but cannot directly execute HTML/JS if rendering is text-only. Abuse controls limit volume but cannot infer message meaning server-side.

### XSS

Critical risk. If arbitrary JavaScript executes in recipient/sender pages, it can read plaintext or invoke cryptographic keys while the page is active.

Required mitigations:

- strict CSP response headers,
- no inline scripts where avoidable,
- no `dangerouslySetInnerHTML` for message/user content,
- no remote JavaScript on crypto routes,
- bundled and locked dependencies,
- text-only message rendering,
- output encoding,
- dependency audit,
- minimal DOM injection surfaces.

### Malicious future frontend build

A web operator with control of deployment can theoretically ship JavaScript that captures future plaintext or key material. A normal web app cannot cryptographically eliminate this trust without an independently verified client distribution mechanism.

Mitigations:

- open source client,
- reproducible builds where practical,
- transparent release hashes,
- immutable release tags,
- no runtime remote scripts,
- future native/browser-extension client for users requiring stronger client-distribution trust.

Do not claim protection against a malicious deployed frontend.

### Public-key substitution

Mitigation: recipient public key is carried in the share URL fragment. A database-only attacker cannot silently replace the public key the sender uses. The client must fail closed if fragment parsing or key import fails.

This does not protect against malicious JavaScript that ignores the protocol.

### Device compromise

Out of scope. Malware or a compromised browser profile can read rendered plaintext and potentially use local keys.

### Recovery code theft

Anyone with the recovery code plus access to the encrypted recovery blob can restore the private key. Therefore recovery code must be treated like a password-manager secret.

## Metadata minimization

Application database should not retain:

- raw IP,
- user agent history,
- browser fingerprint,
- referrer history,
- third-party analytics identifiers.

For abuse throttling, derive a rotating bucket identifier:

```text
bucket = HMAC-SHA-256(server_rate_secret_for_day, normalized_source_ip)
```

Store only the bucket, time window, and count. Rotate the HMAC secret and expire bucket rows quickly.

Implementation refinement: derive the daily secret as HMAC-SHA-256(root secret,
`nibhrito:rate:day:<UTC epoch day>`), then HMAC the scope and normalized network.
IPv4 groups by address; IPv6 by /64. Day separation does not provide forward secrecy
against root-secret compromise. Rotate the root periodically in Worker secrets.
Network rows expire one hour after their window (at most two hours); global daily
rows at most 25 hours. Only direct Cloudflare edge requests are supported in
production; Worker subrequests are rejected to avoid their special source-IP
semantics. See [Cloudflare header reference](https://developers.cloudflare.com/fundamentals/reference/http-headers/).
Local development uses one loopback group and still requires a generated local
secret. It is never a production fallback. Unknown environment/secret/missing
edge source fails closed. Client Forwarded/X-Forwarded-For headers are ignored.

Important: the hosting/network provider still processes source IP to deliver traffic. Privacy copy must distinguish “not stored by the application” from “never processed anywhere.”

## Recommended security headers

At minimum:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Evaluate CSP requirements after build tooling is finalized. Do not weaken it with `unsafe-eval` in production.

## Logging policy

Allowed examples:

- request id,
- route name,
- status code,
- coarse duration,
- generic error class,
- aggregate cleanup counts.

Forbidden:

- request body for message routes,
- ciphertext body dumps,
- authorization headers,
- recovery blob content,
- recovery code,
- private/public key dumps,
- raw IP,
- decrypted content.

## DoS controls

Recommended initial limits:

- plaintext max: 4 KiB UTF-8,
- ciphertext envelope hard cap: 12 KiB,
- profile display name: <= 64 Unicode code points and lower byte cap,
- prompt: <= 280 Unicode code points and lower byte cap,
- inbox page size: <= 50,
- default unread/storage quota per profile: 500 messages,
- default retention: 30 days,
- max retention: 90 days.

Exact limits may be tuned, but all must exist server-side.

## Security testing priorities

1. crypto known-answer/round-trip tests,
2. XSS attempts through every public text field,
3. header verification,
4. owner auth bypass attempts,
5. IDOR tests across profiles/messages,
6. malformed base64/key/envelope fuzz cases,
7. replay/duplicate message id handling,
8. rate-limit bypass attempts,
9. expiry race conditions,
10. secret/log scanning.
