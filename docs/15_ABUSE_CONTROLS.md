# Abuse controls

Production defaults: 20000 API requests/day globally, 300 API requests/hour per
network, 100 new profiles/day globally and 3/hour per network; 3000 message attempts
per day globally, 30/hour per network and 10/minute per profile. Retries consume
attempt limits. Malformed input consumes general limits but not validated-write
limits. All limits are atomic D1 counters; failure is a generic 429. A conservative
one-hour Retry-After does not guarantee the next attempt succeeds (daily caps exist).

Local loopback shares one group across all browser contexts. It allows 5000 API
requests/hour, 100 profile creations/hour and 300 sends/hour per loopback group;
global and per-profile limits remain unchanged. APP_ENV=local requires a loopback
request URL. Production config must set APP_ENV=production.

Buckets are daily HMAC identifiers, not raw addresses. IPv6 groups /64, IPv4 /32;
mapped IPv4 is canonicalized. Source is only Cloudflare's CF-Connecting-IP. Ignore
Forwarded, X-Forwarded-For and client-supplied auxiliary IPv6 headers. Disable Pseudo
IPv4 overwrite and address-removal transforms; deploy directly on Cloudflare without
Worker proxies. Worker subrequests reject. Missing metadata/secrets fail closed.
The provider still sees network metadata. Root compromise permits correlation;
daily derivation does not promise forward secrecy. Rotate the root periodically.

Storage is bounded: 10000 profiles, 500 active notes/profile, 2000 rate rows total.
Existing rate rows update even at capacity; new groups fail closed until hourly
cleanup frees space. This prevents unbounded stale-bucket growth under distributed
abuse. Global counters precede network counters; no caller-controlled scope is
stored before general admission. Network rows live at most two hours; global day
rows 25 hours, with bounded cleanup thereafter. Query expiry and active-note quota
remain authoritative even during cleanup backlog. Persistent distributed abuse can
exhaust provider quotas or throttle legitimate shared-network users; limits are not
a guarantee of availability or anonymity. Test staging CPU/capacity before launch.

CHALLENGE_ENABLED must remain false. Remote Turnstile scripts conflict with the
current crypto-route policy. Enabling a challenge requires a reviewed separate
non-crypto route, explicit provider/privacy disclosure, server verification and
tests; current implementation fails closed if enabled. No placeholder challenge.

Moderation cannot inspect ciphertext. Owners pause/delete; operators may disable
public profiles by ID with a parameterized administrative D1 query. Keep support
channels and retention policies outside normal encrypted-message processing. No
plaintext report endpoint exists; voluntary disclosure remains optional post-launch.
