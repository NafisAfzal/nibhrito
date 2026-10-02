# 03 - E2EE Protocol Specification

This document is normative for Nibhrito v1. Do not change field meanings or cryptographic steps without a protocol version bump and migration plan.

## 1. Goals

Protect message confidentiality and integrity from:

- database readers,
- accidental backend logging,
- ordinary server-side application access,
- passive storage compromise.

Nibhrito v1 does not claim full forward secrecy against later compromise of the recipient's long-lived private key.

## 2. Algorithms

### Recipient key agreement

- Web Crypto `ECDH`
- curve `P-256`

Reason: broad browser support and native Web Crypto availability. X25519 is attractive but should be a future protocol version after explicit compatibility verification.

### KDF

- `HKDF`
- SHA-256
- random 32-byte salt per message

### Message AEAD

- AES-GCM
- 256-bit key
- random 12-byte IV per message
- 128-bit authentication tag

### Hash

- SHA-256

## 3. Canonical encoding

- binary fields use unpadded base64url,
- text uses UTF-8,
- protocol object field names are fixed,
- AAD is a deterministic UTF-8 string produced by the protocol helper, not ad hoc JSON stringification.

Example AAD format:

```text
nibhrito:v1|profile=<normalized-slug>|message=<uuid>|key=<key-id>
```

The exact formatter must have unit-test vectors.

## 4. Recipient profile key generation

### v1 serialization clarification (2026-10-03, before crypto implementation)

This resolves previously unspecified serialization without changing algorithms or
envelope meanings. Slugs are lowercase ASCII 3–32 characters, alphanumeric at each
end and alphanumeric/hyphen inside. UUIDs are lowercase RFC 4122 v4 strings. Binary
fields must be canonical unpadded base64url (reject padding, non-zero unused bits,
whitespace, other alphabets). P-256 public points are 65-byte uncompressed points,
validated by native key import; salts/key IDs/secrets/tokens are 32 bytes; IVs 12 bytes.

Message JSON field order is type, text, optional mood, client_created_at. Type is
`message`; text must contain non-whitespace Unicode; mood, if present, is constructive,
appreciation, or question. Timestamps are canonical ISO UTC milliseconds. JSON.stringify
of this ordered object provides UTF-8 serialization; cap the entire object at 4096
bytes, not just text. Reject unpaired UTF-16 surrogates and unknown fields. Decrypted
JSON must pass the same schema. Ciphertext includes the 16-byte AES-GCM tag.

Recovery JSON order is v, profile_slug, key_id, recipient_private_jwk, owner_token,
created_at. Private JWK order is kty, crv, x, y, d, ext, key_ops, with EC/P-256,
32-byte x/y/d, ext=true and key_ops=[deriveBits]. Recovery plaintext cap is 8192 bytes.
Recovery envelope has exactly v, key_id, hkdf_salt, iv, ciphertext. Outer profile slug
comes from the requested immutable profile; it remains bound through recovery AAD.
After authentication, validate JWK fingerprint and compare native ECDH outputs using
a fresh challenge keypair to verify that its private/public components agree.

Recovery code is `NBR1-` + 43-character base64url secret + `-` + 8-character base64url
checksum. The checksum is the first six bytes of SHA-256(secret bytes); it detects
copy errors, provides no security beyond the random secret, and is never uploaded.
Parse fixed positions rather than splitting hyphens. Working private keys import as
non-extractable; temporary exported JWK/secret state is discarded after setup/restore.
JavaScript cannot guarantee physical memory erasure. No recovery export contains
plaintext key material; downloadable backups contain only the versioned recovery code
or encrypted bundle with an explicit warning that the code grants full access.

Browser:

1. `crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"])`
2. export public key as `raw`,
3. export private key as JWK only during initial recovery-package creation,
4. compute `key_id = base64url(SHA-256(raw_public_key))`,
5. create recovery bundle,
6. re-import the private JWK with `extractable = false`,
7. store the non-extractable private `CryptoKey` in IndexedDB,
8. remove temporary exported private material from application state.

The raw public key becomes part of the share URL fragment.

## 5. Message encryption

Inputs:

- recipient raw P-256 public key from URL fragment,
- normalized profile slug,
- plaintext message object.

Plaintext object example:

```json
{
  "type": "message",
  "text": "...",
  "mood": "constructive",
  "client_created_at": "2026-10-03T00:00:00.000Z"
}
```

Steps:

1. Validate plaintext UTF-8 byte length before encryption.
2. Generate `message_id = crypto.randomUUID()`.
3. Import recipient public key as ECDH P-256.
4. Generate a fresh ephemeral ECDH P-256 key pair for this message.
5. Derive 256 ECDH bits using sender ephemeral private key + recipient public key.
6. Import derived bits as HKDF key material.
7. Generate `salt = random 32 bytes`.
8. Derive an AES-256-GCM key with HKDF-SHA-256 and info:

```text
nibhrito:v1:message
```

9. Generate `iv = random 12 bytes`.
10. Build deterministic AAD from version, normalized slug, message id, and key id.
11. UTF-8 encode the canonical plaintext JSON.
12. Encrypt using AES-GCM with 128-bit tag.
13. Export the sender ephemeral public key in raw form.
14. Upload only the envelope.

## 6. Message envelope

```json
{
  "v": 1,
  "message_id": "uuid",
  "profile_slug": "example",
  "key_id": "base64url-sha256",
  "ephemeral_pub": "base64url",
  "hkdf_salt": "base64url",
  "iv": "base64url",
  "ciphertext": "base64url"
}
```

Backend may add server metadata such as `created_at` and `expires_at` outside the cryptographic envelope.

Backend must not rewrite cryptographic envelope fields.

## 7. Message decryption

1. Validate envelope version and field byte lengths.
2. Confirm envelope `key_id` matches a key in the recipient keyring.
3. Import sender ephemeral public key.
4. Derive ECDH shared bits with recipient private key.
5. HKDF with stored salt and fixed protocol info.
6. Rebuild exact AAD.
7. AES-GCM decrypt.
8. Parse JSON only after authentication succeeds.
9. Validate decrypted object schema before rendering.
10. Render text as text content, never HTML.

Any AES-GCM authentication failure must be treated as tampering/corruption. Do not display partial plaintext.

## 8. Recovery protocol

### Recovery secret

Generate 32 random bytes in the browser. Encode as a human-copyable base64url string with a version prefix and checksum in the UI.

Example format conceptually:

```text
NBR1-<high-entropy-value>-<checksum>
```

Do not derive this from a user password in MVP.

### Recovery bundle plaintext

```json
{
  "v": 1,
  "profile_slug": "example",
  "key_id": "...",
  "recipient_private_jwk": {},
  "owner_token": "...",
  "created_at": "..."
}
```

### Recovery bundle encryption

1. Generate random 32-byte salt.
2. Import recovery secret as HKDF input key material.
3. HKDF-SHA-256 info: `nibhrito:v1:recovery`.
4. Derive AES-256-GCM key.
5. Generate 12-byte random IV.
6. AAD: `nibhrito:v1:recovery|profile=<slug>|key=<key-id>`.
7. Encrypt canonical JSON.
8. Upload only the encrypted recovery blob, salt, IV, key id, and version.

The recovery secret itself must not be uploaded.

## 9. Owner token

Generate a separate random 32-byte owner token. Do not derive it from the encryption key.

Server stores only a SHA-256 verifier of the token. Requests authenticate over HTTPS with the raw token in an authorization header. Redaction middleware must remove this header from logs.

A future version may replace bearer auth with asymmetric request signing, but that is not required for MVP.

## 10. Key rotation

MVP may postpone UI key rotation. The data model must nevertheless include `key_id` so a future keyring can decrypt historical messages after rotation.

Never overwrite the identity of an existing key id.

## 11. Required test vectors

Create deterministic fixtures for:

- base64url encode/decode,
- public-key import/export,
- SHA-256 key id,
- AAD formatting,
- recovery bundle round trip,
- message round trip,
- tampered ciphertext rejection,
- tampered AAD rejection,
- wrong private key rejection,
- malformed ephemeral key rejection,
- max-length UTF-8 message.

For random APIs, inject deterministic bytes in unit tests rather than weakening production randomness.
