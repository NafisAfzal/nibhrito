# Security policy

## Supported versions

Security fixes currently target `main`, containing the `1.0.0-rc.1` release
candidate. There is no deployed production release or supported older release
line. Local checks and the repository's security review are engineering evidence,
not an independent audit or certification.

## Report a vulnerability privately

Use GitHub's **Security → Advisories → Report a vulnerability** on this repository:
[private vulnerability reporting](https://github.com/NafisAfzal/nibhrito/security/advisories/new).

Include the affected commit, a concise description, impact and reproduction steps
using synthetic data. Share exploitable details only in the private report.
Do not put them in public issues or pull requests.

Never include real messages, bearer tokens, recipient private keys, recovery codes,
database dumps, credentials or private screenshots. If a credential was exposed,
revoke or rotate it through its provider; a report does not replace that action.

If the private reporting button is unavailable, open a public issue asking only
for a private reporting channel. Do not include vulnerability details. No personal
email is designated here and no response-time or bounty commitment is made.

## Research and review scope

Use your own local instance and disposable profiles. Avoid accessing another
person's data, disrupting a service or testing a production deployment without
its operator's authorization.

Review the [E2EE protocol](docs/03_E2EE_PROTOCOL.md),
[threat model](docs/04_SECURITY_THREAT_MODEL.md) and
[security self-review](SECURITY_REVIEW.md). Cryptographic, recovery,
authentication and privacy changes require explicit security review, regression
tests and documentation. Protocol changes also need deliberate versioning and a
migration/interoperability plan.

The current model trusts the delivered frontend and recipient device, exposes
necessary network metadata to the provider, lacks full forward secrecy after
recipient-key compromise and cannot recover a lost key without the saved code.
These limitations must remain visible in product and release documentation.
