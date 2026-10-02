# 07 - Free-Tier Deployment and Cost Strategy

## Recommended production target

Use a single Cloudflare developer stack:

- Worker for `/api/*` and scheduled cleanup,
- Worker static assets for Vite build,
- D1 for SQL data,
- Worker secret/env bindings,
- Cron Trigger for cleanup,
- free `workers.dev` hostname initially.

This is simpler than combining a static host, a separate serverless API, and a separate database provider.

## Verified free-tier facts - checked 2026-10-03

Current official documentation states:

- Workers Free: 100,000 requests/day.
- Workers Free CPU: 10 ms CPU time per HTTP request.
- Workers Free: up to 5 Cron Triggers/account.
- Static asset requests are free and unlimited.
- D1 Workers Free: 5 million rows read/day.
- D1 Workers Free: 100,000 rows written/day.
- D1 total free storage allowance: 5 GB across account; **500 MB per free database**.
- Pages/Worker static deployment build limits and other platform limits can change.

These numbers are capacity planning inputs, not promises that the provider will preserve identical terms forever.

## Why “free forever” is not a requirement we can guarantee

No external provider contractually guarantees unchanged free-tier pricing for the lifetime of Nibhrito. The correct engineering goal is:

- zero-cost under current small-use limits,
- no credit-dependent runtime service for MVP,
- low idle cost,
- easy export/migration,
- hard quotas that prevent accidental runaway usage,
- upgrade path when demand justifies cost.

## Capacity controls

Use:

- 4 KiB plaintext cap,
- ~12 KiB envelope hard cap,
- max 500 active messages/profile, 20000 physical messages globally,
- max 10000 profiles and 2000 short-lived rate rows,
- 30-day default expiry,
- 90-day maximum expiry,
- cursor pagination,
- indexed queries,
- bounded cleanup batches.

These controls protect both availability and free-tier capacity.

## D1 query discipline

Never use unindexed scans for common inbox/cleanup operations.

Expected hot queries:

- profile by unique slug,
- inbox by `profile_id` + `created_at`,
- cleanup by `expires_at`,
- delete message scoped by `profile_id` and `id`.

Use indexes described in `05_DATA_API.md`.

## D1 deletion reality

Application deletion removes rows from normal queries. Infrastructure recovery mechanisms can retain recoverable database state temporarily. D1 currently documents 7-day Time Travel for free databases. Privacy policy must avoid claiming instant irreversible physical erasure from every backup layer.

Because Nibhrito stores message content as ciphertext, this residual backup risk is materially reduced but not nonexistent metadata-wise.

## Domain strategy

### Zero-cost launch

Use:

```text
https://<project>.<account-subdomain>.workers.dev
```

### Branded production later

Buy a domain only when desired. Domain registration is an external recurring cost and should not be misrepresented as free hosting.

## Migration readiness

At least monthly during active development:

- keep SQL migrations in Git,
- test database export/restore procedure,
- keep storage behind repository interfaces,
- keep all cryptography client-side and backend-independent.

If Cloudflare pricing or limits stop fitting, migrate storage/API without changing existing ciphertext format.

## Implemented deployment workflow

Use the full guarded procedure in `16_DEPLOYMENT_OPERATIONS.md`. Required operator
configuration and server secret must be prepared before these remote actions:

```powershell
npx wrangler login
npx wrangler d1 create nibhrito-prod
# Generate reviewed production config/secret as documented in docs/16.
npx wrangler d1 migrations apply DB --remote --config wrangler.production.jsonc
npm run deploy
```

Do not paste secrets into committed config. Use Wrangler secret management for server secrets.
