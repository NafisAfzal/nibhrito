# Deployment and operations

Run from the repository root using Node 24 and the pinned npm dependencies. Local
development needs no Cloudflare account. Production provisioning, operator identity,
legal review and live acceptance require the operator; none were fabricated or run.

## Local acceptance

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run check
npm run dev
```

Open `http://127.0.0.1:8787`. Development generates an ignored **local server-only**
rate secret, migrates local D1, builds, and serves the actual Worker and assets.
Recipient keys/recovery codes are browser user material, never environment variables.
Do not use real sensitive messages in development tools or capture private screens.

`npm run check` includes strict TypeScript, lint, formatting, privacy source/secret
checks, native crypto/unit/D1/API tests, three-engine E2E, build, local Worker dry run
and dependency audit. D1 export/import/decryption and trigger verification are part
of integration tests; rerun alone with `npm run db:portability`.

## External production actions

Use a Cloudflare account on the intended Workers Free plan. No domain purchase or
Turnstile account is necessary. Check current provider limits and choose the correct
account; with several accounts, set `CLOUDFLARE_ACCOUNT_ID` to the actual dashboard
value in your shell. CI tokens need least-privilege Workers/D1 permissions and must
remain in the CI secret store; interactive login is sufficient for a first launch.

```powershell
npx wrangler login
npx wrangler d1 create nibhrito-prod
```

Copy the **returned** `database_id`. Substitute actual legal operator name, a
monitored support/abuse email and governing jurisdiction in the following command.
Values are deliberately public; no fake example email will pass validation.

```powershell
npm run production:init -- --database-id "<returned-D1-UUID>" --operator-name "<actual-operator>" --contact-email "<actual-monitored-email>" --jurisdiction "<actual-jurisdiction>"
npm run production:secret
```

The first command exclusively creates ignored `wrangler.production.jsonc` with
production admission rules, same-origin Worker/assets/D1, required secret name, Cron,
and disabled metrics, instrumentation, invocation logs, previews and Logpush. The
tracked `wrangler.production.example.jsonc` has obvious placeholders and cannot
deploy. The generated config uses strict JSON syntax; the guard rejects unknown
fields or changes to security defaults. Routine custom-domain/config changes need
an explicit reviewed guard/test update, rather than bypassing the guard.

The second command exclusively writes ignored `.dev.vars.production`: a fresh
32-byte native random server HMAC root, without displaying it. It is separate from
`.dev.vars`. Protect it with filesystem permissions/Windows ACLs and a secret vault;
POSIX mode 0600 alone does not establish Windows ACLs. Never commit it, paste it into
VITE variables, CI output or public config, or reuse the local development root.
Neither command logs in, creates remote resources or deploys. Existing files are
never overwritten. Keep the same protected root for normal redeploys; if removing
the local file after deployment, restore it from your vault for the next deployment.

Review the generated config and legally review the policy text before public use.
Apply migrations to the actual production binding, then deploy:

```powershell
npx wrangler d1 migrations list DB --remote --config wrangler.production.jsonc
npx wrangler d1 migrations apply DB --remote --config wrangler.production.jsonc
npm run deploy
```

`npm run deploy` validates config and secret file before building, checks again after
the build, and invokes pinned Wrangler with `--config wrangler.production.jsonc
--secrets-file .dev.vars.production --no-autoconfig`. Wrangler uploads the secret
and code version together. It never defaults to the local config or runs migrations
for you. A secret update can deploy a version: do not casually run `secret put`
against a live Worker. Raw `wrangler deploy` defaults to the deliberately local-only
config and is not the supported deployment procedure.

Use the exact URL printed by Wrangler. With default worker name it is
`https://nibhrito.<your-account-subdomain>.workers.dev`; your account subdomain is
not known locally. Later branded domains require your DNS ownership, HTTPS setup
and a reviewed config change. All API traffic must stay on the same origin.

## Hosting privacy settings and live acceptance

Deploy directly on Cloudflare, without Worker proxies. Disable Pseudo IPv4 overwrite,
IP-removal transforms, Browser Insights/Web Analytics, Rocket Loader, Zaraz, injected
apps/scripts and platform challenge scripts on encryption routes. Do not add
analytics to compensate for disabled logs. Cloudflare still sees traffic metadata;
the application never persists raw IPs. Inspect the served asset/network list.

Before a v1.0.0 tag or public launch:

1. On the actual HTTPS hostname, check `/`, `/create`, `/u/<slug>#v=1&pk=...`,
   `/inbox`, static assets and `/api/v1/health` for CSP, HSTS, nosniff, frame,
   Permissions and Referrer policies. Confirm HTTP redirects/rejects, no broad CORS,
   and no challenge/telemetry scripts or email/token material in URLs.
2. Use harmless unique Unicode/Bangla feedback: create a profile, save the recovery
   code privately, copy the **full** link/QR, submit in a separate browser, decrypt,
   search, delete and verify deletion. Test profile pause/resume and 1-day retention.
3. Inspect submission and D1 records privately: only envelope ciphertext and intended
   metadata, no plaintext, raw token, private JWK or recovery code. Do not paste row
   bodies or bearer headers into support/logs. Verify unknown/wrong owner tokens and
   cross-profile attempts fail. Public display name/prompt are intentionally public.
4. Restore and decrypt on a second profile/device. Check Chrome/Edge, Firefox and
   actual Safari/iOS where used; verify keyboard, screen reader, focus, mobile layout,
   clipboard/QR and IndexedDB persistence. Headless engines do not replace devices.
5. Observe a Cron invocation after deployment; config schedules bounded cleanup at
   minute 17 each hour UTC. Changes may take up to 15 minutes to propagate. Verify
   expired rows disappear from API immediately, then are physically removed in
   batches, without dumping ciphertext. Do not enable persistent request logs.
6. Check dashboard aggregate CPU/storage/read/write limits without adding trackers.
   Free HTTP CPU is 10 ms; local tests cannot establish production CPU billing. Keep
   database size well below 500 MB, and confirm provider account/backup settings and
   no secret-bearing logs. Review the independent-audit limitation.

Only after these checks, record production evidence in PROJECT_STATUS.md, update
package version deliberately and create the release tag. No release tag is created
by the implementation agent.

## Quotas and ongoing work

Defaults: 4 KiB complete plaintext JSON, 12 KiB message request, 16 KiB profile
creation, 4 KiB profile update, 500 active notes/profile, 20000 physical notes,
10000 profiles and 2000 short-lived rate rows. Admission rates and IPv6 grouping are
in [15_ABUSE_CONTROLS.md](15_ABUSE_CONTROLS.md). Retry attempts consume limits. Global
caps reserve headroom, not a promise of service under distributed abuse.

Cleanup removes at most 100 expired messages and 100 expired buckets per scheduled
invocation, plus 10 expired messages after a successful submission to that profile.
Rate/day counters and physical rows can reach capacity before cleanup catches up;
new requests fail closed. Monitor bounded backlog, size and provider budgets. Do not
raise limits, batch sizes or add frequent Cron without budget/CPU/privacy review.
Server filtering remains authoritative regardless of delayed physical deletion.

At least monthly, test `db:portability`, check dependency vulnerabilities and review
provider changes. Do not update dependencies blindly; preserve the lockfile, protocol
vectors, CSP and browser gates. English UI copy is centralized for future translation;
full Bangla UI translation and independent accessibility review remain optional.

## Backup, restore and rollback

Recipient encrypted JSON backups are separate from operator SQL backups. They never
upload files/codes, do not reinsert server messages, and retain already copied notes
after server deletion/expiry. Keep recipient recovery codes separately. No operator
reset exists for a lost key/code.

For an operator SQL backup, create a protected ignored `backups` directory and export
the remote database to a chosen filename. Exports contain ciphertext, authentication
verifiers and public/operational metadata and must remain confidential.

```powershell
New-Item -ItemType Directory -Path backups -Force
npx wrangler d1 export DB --remote --config wrangler.production.jsonc --output backups\nibhrito-encrypted.sql
```

Do not commit, print or send the dump to arbitrary services. Encrypt/protect backups
in your operator vault and set retention consciously. D1 Free currently offers
7-day Time Travel; deletion does not imply instant erasure from provider backups.

A Worker rollback **does not** roll back D1, Cron or external resources. Inspect
version/config compatibility first:

```powershell
npx wrangler deployments list --config wrangler.production.jsonc
npx wrangler rollback "<reviewed-previous-version-id>" --config wrangler.production.jsonc
```

0002 is additive, but triggers affect D1 `meta.changes`: an older repository version
which assumes one change per insert may mishandle success. Prefer redeploying a
reviewed known-good commit compatible with 0002 and explicit RETURNING semantics.
Never blindly drop schema or downgrade to plaintext to recover availability.

Database restore is an operator-controlled destructive boundary. Pause writes and
cleanup, export the current database, create a **separate** restore database/config,
and import the chosen backup there first. For a brand-new target only:

```powershell
npx wrangler d1 execute DB --remote --config "<reviewed-restore-config>" --file backups\nibhrito-encrypted.sql
npx wrangler d1 execute DB --remote --config "<reviewed-restore-config>" --file scripts\reconcile-counters.sql
```

Verify both migration records, five application tables, six counter triggers,
aggregate counters, relationships and a harmless recovery/decrypt round trip before
switching the live binding. Reapply expiry cleanup and delete records that were
deleted after the backup. Restoring old data can resurrect deleted profiles/messages,
auth verifiers and old rate windows; avoid silently reversing user deletion or
resetting abuse budgets. Never import over the live database by default. If the
provider export omits triggers, stop and resolve schema integrity before opening
traffic. Local portability tests verify the pinned export includes all six triggers.

During an incident, restrict incoming traffic or pause profiles, preserve only
necessary protected evidence, rotate compromised operator credentials and the HMAC
root through a reviewed secret-file redeploy. Root rotation resets network buckets;
global/profile limits remain. Do not ask recipients for recovery codes, bearer tokens
or full private inbox screenshots. Public metadata can be moderated; encrypted
feedback cannot be inspected by the operator. Voluntary email disclosure is outside
the encrypted flow and is explained on the contact page.

## Primary references checked 2026-10-03

[Wrangler D1 commands](https://developers.cloudflare.com/workers/wrangler/commands/d1/),
[Worker deploy/secret commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/),
[secrets](https://developers.cloudflare.com/workers/configuration/secrets/),
[Cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/),
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).
Installed Wrangler help/source is also checked: 4.116.0 supports secrets-file upload,
while its local export uses config-relative state and has no persist-to flag. Latest
provider documentation may describe features absent from the pinned CLI.
