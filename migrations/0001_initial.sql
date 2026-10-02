-- Epoch milliseconds throughout. Ciphertext is opaque; no plaintext/private key fields.
CREATE TABLE profiles (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (length(slug) BETWEEN 3 AND 32 AND slug NOT GLOB '*[^a-z0-9-]*' AND substr(slug, 1, 1) != '-' AND substr(slug, -1, 1) != '-'),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 64 AND length(CAST(display_name AS BLOB)) <= 256),
  public_prompt TEXT NOT NULL CHECK (length(public_prompt) <= 280 AND length(CAST(public_prompt AS BLOB)) <= 1120),
  theme TEXT NOT NULL DEFAULT 'default',
  owner_token_hash TEXT NOT NULL UNIQUE CHECK (length(owner_token_hash) = 43),
  current_key_id TEXT NOT NULL CHECK (length(current_key_id) = 43),
  retention_days INTEGER NOT NULL CHECK (retention_days IN (1, 7, 30, 90)),
  is_disabled INTEGER NOT NULL DEFAULT 0 CHECK (is_disabled IN (0, 1)),
  created_at INTEGER NOT NULL CHECK (created_at >= 0),
  updated_at INTEGER NOT NULL CHECK (updated_at >= created_at),
  UNIQUE (id, slug)
) STRICT;

CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  profile_slug TEXT NOT NULL,
  envelope_version INTEGER NOT NULL CHECK (envelope_version = 1),
  key_id TEXT NOT NULL CHECK (length(key_id) = 43),
  ephemeral_pub TEXT NOT NULL CHECK (length(ephemeral_pub) = 87),
  hkdf_salt TEXT NOT NULL CHECK (length(hkdf_salt) = 43),
  iv TEXT NOT NULL CHECK (length(iv) = 16),
  ciphertext TEXT NOT NULL CHECK (length(ciphertext) BETWEEN 22 AND 5483),
  created_at INTEGER NOT NULL CHECK (created_at >= 0),
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at AND expires_at - created_at <= 7776000000),
  FOREIGN KEY (profile_id, profile_slug) REFERENCES profiles (id, slug) ON DELETE CASCADE
) STRICT;

CREATE INDEX messages_inbox ON messages (profile_id, created_at DESC, id DESC);
CREATE INDEX messages_expiry ON messages (expires_at);
CREATE INDEX messages_profile_expiry ON messages (profile_id, expires_at);

CREATE TABLE recovery_blobs (
  profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version = 1),
  key_id TEXT NOT NULL CHECK (length(key_id) = 43),
  hkdf_salt TEXT NOT NULL CHECK (length(hkdf_salt) = 43),
  iv TEXT NOT NULL CHECK (length(iv) = 16),
  ciphertext TEXT NOT NULL CHECK (length(ciphertext) BETWEEN 22 AND 10944),
  updated_at INTEGER NOT NULL CHECK (updated_at >= 0)
) STRICT;

CREATE TABLE rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  scope TEXT NOT NULL,
  window_start INTEGER NOT NULL CHECK (window_start >= 0),
  count INTEGER NOT NULL CHECK (count >= 0),
  expires_at INTEGER NOT NULL CHECK (expires_at > window_start),
  PRIMARY KEY (bucket_key, scope, window_start)
) STRICT;

CREATE INDEX rate_limit_expiry ON rate_limit_buckets (expires_at);
