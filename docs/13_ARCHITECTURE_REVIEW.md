# Architecture review and implementation decisions

Reviewed 2026-10-03 before Phase 0 implementation. This is a design review, not an
independent cryptographic audit. The split documentation in `docs/` is authoritative;
the combined NIBHRITO_MASTER_PLAN.md is an original planning snapshot. Consult this
review and the split documents for subsequent decisions.

## Security boundary

Keep React/Vite static client, native Web Crypto P-256 ECDH, HKDF-SHA-256, AES-256-GCM,
IndexedDB non-extractable working keys, independent bearer owner authentication,
encrypted recovery, and opaque server storage. No v1 algorithm or envelope change
is needed for Phase 0. Non-extractable keys limit export; they do not prevent XSS
from using a key or reading plaintext. Share fragments bind a key supplied by the
owner, not the identity of a person, and remain visible to client code and whoever
receives/copies the link. These properties do not eliminate malicious-build risk.

## Resolutions before coding

1. **Static security headers and cost.** Apply static headers in `public/_headers`
   and API headers in Worker middleware. Worker-first routing covers `/api` and
   `/api/*` so browser navigations cannot receive SPA HTML for API errors. Avoid
   running every static request through the Worker. Cloudflare distinguishes
   static and Worker-generated header handling:
   [static headers](https://developers.cloudflare.com/workers/static-assets/headers/),
   [selective routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).
2. **Logging defaults.** Disable persisted Workers observability and invocation
   logs. Do not add request/error logging or third-party telemetry. Invocation logs
   can contain request URLs, and exception strings can contain attacker input;
   middleware cannot redact logs produced by the hosting layer. Providers still
   process connection metadata. See [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
   Wrangler metrics and dependency instrumentation are also explicitly disabled;
   the latter is a separate upload metadata setting in the pinned CLI schema.
3. **Duplicate contract.** A duplicate never inserts twice. Until Phase 3 implements
   safe identical-envelope acceptance, the contract is a generic 409 duplicate
   response with no existing envelope, ownership, or timestamps disclosed. A sender
   must not interpret an ID collision alone as proof its message was delivered.
4. **Stable AAD identity.** Slugs are immutable for MVP and normalized/validated
   before keys/recovery are generated. Store envelope profile_slug rather than
   reconstructing authenticated fields from potentially mutable public metadata.
   Foreign keys cascade messages/recovery on deletion; unique message IDs reject
   replays while rows exist. Replay resistance after deletion/expiry is not promised;
   stronger protection would require retained tombstones and a privacy decision.
5. **Ownership and recovery.** A verifier is never accepted as a bearer credential.
   Derive the acting profile from the verified owner token, then scope SQL operations
   to that profile. Creation atomically stores public metadata, verifier, and recovery
   blob. Restore verifies recovered key material against its computed public-key
   fingerprint, slug, and key ID before persisting it. No fallback decryption key.
6. **Limits from the first write route.** Roadmap Phases 5/6 expand expiry/abuse
   behavior; initial profile/message routes must already have input byte caps,
   validation, and server expiry filtering. Quota/rate checks must be atomic with
   writes to avoid concurrent bypass. Do not postpone these invariants just because
   their full acceptance suites occur in later phases.
7. **Metadata.** Use epoch milliseconds consistently. No source IP, UA, referrer,
   fingerprint, or plaintext columns. Health checks disclose only readiness, not
   table names, database IDs, profile counts, config, or stack traces.
8. **Local versus remote config.** Local D1 uses Wrangler's local-only binding
   support, with no fictional production UUID. Production provisioning/configuration
   is a Phase 8 user boundary. No secrets in Vite variables: VITE-prefixed values
   are public browser build inputs. Same-origin API requires no configurable API host.

## Protocol clarification gate for Phase 1

The v1 design says canonical JSON and checksum but leaves exact encoding details
underspecified. Before implementing crypto, document field order/optional-field
policy, strict unpadded base64url decoding, UUID/slug/key encoding, recovery checksum
encoding, and precise limits with deterministic fixtures. Treat 4 KiB as the cap on
the complete UTF-8 serialized plaintext object, with UI accounting for JSON/metadata
overhead; this avoids cross-client ambiguity. Raw P-256 keys are 65-byte uncompressed
points validated by Web Crypto, salts 32 bytes, IVs 12 bytes, tags 16 bytes, and key IDs
32-byte SHA-256 outputs. Validation must reject unknown versions/fields and malformed
keys. Document these clarifications before code; any semantic protocol change needs
explanation, versioning, and migration per docs/03. No crypto code exists in Phase 0.

## Deployment and release gates

Free-tier capacity is not guaranteed permanently. Recheck actual limits and provider
backup policies before release. Local dry-run is not deployment validation. CSP,
authorization, concurrency, recovery, browser compatibility, and plaintext network
inspection must pass feature-specific tests before production. Turnstile executes
remote JavaScript, conflicting with the current crypto-route policy: leave disabled;
any later challenge design must resolve that conflict explicitly in documentation.
