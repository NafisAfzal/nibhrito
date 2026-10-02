# 05 - Data Model and API Contract

This is a logical contract. Migrations may refine SQL types, but security semantics must stay the same.

Initial storage constraints reserve up to 4 KiB of serialized message plaintext plus
the 16-byte GCM tag (5483 unpadded base64url characters) and up to 8 KiB of recovery
bundle plaintext plus its tag (10944 characters). HTTP envelope cap remains 12 KiB.
These are bounds on opaque encodings; full schema/encoding validation belongs at each
API boundary. No write API is exposed in Phase 0. Phase 1 must clarify canonical
serialization and limits before crypto implementation; see `13_ARCHITECTURE_REVIEW.md`.

## Database tables

### `profiles`

Suggested fields:

```text
id                  TEXT PRIMARY KEY
slug                TEXT NOT NULL UNIQUE
display_name        TEXT NOT NULL
public_prompt       TEXT NOT NULL
theme               TEXT NOT NULL DEFAULT 'default'
owner_token_hash    TEXT NOT NULL
current_key_id      TEXT NOT NULL
retention_days      INTEGER NOT NULL
is_disabled         INTEGER NOT NULL DEFAULT 0
created_at          INTEGER NOT NULL
updated_at          INTEGER NOT NULL
```

No private encryption key.

MVP slugs are immutable. Validate/normalize the slug before generating recovery/AAD.
All timestamps below use integer Unix epoch milliseconds. Foreign keys from messages
and recovery blobs to profiles use `ON DELETE CASCADE`.

### `messages`

```text
id                  TEXT PRIMARY KEY
profile_id          TEXT NOT NULL
profile_slug        TEXT NOT NULL
envelope_version    INTEGER NOT NULL
key_id              TEXT NOT NULL
ephemeral_pub       TEXT NOT NULL
hkdf_salt           TEXT NOT NULL
iv                  TEXT NOT NULL
ciphertext          TEXT NOT NULL
created_at          INTEGER NOT NULL
expires_at          INTEGER NOT NULL
```

Indexes:

`profile_slug` preserves the authenticated envelope field exactly for later AAD
reconstruction; it must match the route and owning profile at insertion.

```text
(profile_id, created_at DESC, id DESC)
(expires_at)
(profile_id, expires_at)
```

### `recovery_blobs`

```text
profile_id          TEXT PRIMARY KEY
version             INTEGER NOT NULL
key_id              TEXT NOT NULL
hkdf_salt           TEXT NOT NULL
iv                  TEXT NOT NULL
ciphertext          TEXT NOT NULL
updated_at          INTEGER NOT NULL
```

### `rate_limit_buckets`

```text
bucket_key          TEXT NOT NULL
scope               TEXT NOT NULL
window_start        INTEGER NOT NULL
count               INTEGER NOT NULL
expires_at          INTEGER NOT NULL
PRIMARY KEY (bucket_key, scope, window_start)
```

Keep retention short and run cleanup.

## API

Prefix all API routes:

```text
/api/v1
```

### Create profile

`POST /api/v1/profiles`

Client sends public settings, `current_key_id`, owner-token verifier, and encrypted recovery blob. The raw recovery secret is never sent.

Server returns profile id, canonical slug, retention policy, created timestamp.

### Read public profile

`GET /api/v1/profiles/:slug`

Returns only public metadata required to render the send page. Do not return a replacement encryption public key for verified sending.

### Update profile

`PATCH /api/v1/profiles/:id`

Owner auth required.

Allowed fields: display name, public prompt, theme, retention within limits, disable flag.

### Delete profile

`DELETE /api/v1/profiles/:id`

Owner auth required. Delete profile messages and recovery blob in a transaction/batched safe sequence appropriate for D1.

### Submit encrypted message

`POST /api/v1/profiles/:slug/messages`

Body is the v1 envelope. Server:

1. validates shape and byte lengths,
2. checks profile enabled,
3. checks key id compatibility policy,
4. checks rate limit and quota,
5. prevents duplicate message id insertion,
6. computes `created_at` and `expires_at`,
7. stores envelope exactly.

Never inspect or transform ciphertext.

### Get inbox

`GET /api/v1/inbox?cursor=<opaque>&limit=25`

Owner auth required. Return only unexpired ciphertext envelopes and server timestamps. Use cursor pagination.

### Delete message

`DELETE /api/v1/messages/:id`

Owner auth required and ownership verified in the query. Avoid a two-step lookup that creates IDOR risk.

### Get recovery blob

`GET /api/v1/recovery/:slug`

Returns encrypted recovery blob. Knowledge of this blob is not considered sufficient authentication; the recovery secret remains client-side.

Consider mild rate limits to reduce scraping.

### Health

`GET /api/v1/health`

No sensitive diagnostics.

## Response format

Use consistent JSON:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again later."
  }
}
```

Do not return stack traces in production.

## Authorization

Use:

```text
Authorization: Bearer <owner-token>
```

Server computes SHA-256 and compares against stored verifier using constant-time byte comparison where possible in the runtime.

Authorization middleware must redact the header from logs.

## Idempotency and duplicates

`message_id` is client-generated and primary-key unique. A retry never creates a
second row. A collision receives a generic 409 duplicate response without exposing
the existing envelope or its metadata. Only an implementation that checks the exact
same envelope and profile may report an identical retry as accepted. A collision alone
is not proof of delivery. Uniqueness lasts while the row exists; no retained replay
tombstones are planned after deletion or expiry.

## Time

Server time is authoritative for retention and API ordering. Client timestamp is informational and encrypted inside message content.
