# Remaining release acceptance

## Scope

Local MVP implementation and design are complete. This pass after 8c891fa closes
locally executable accessibility and installed-Edge checks. It does not deploy,
change the protocol or mark unperformed device/account checks complete.

## Added local checks

`npm run check` keeps Chromium, Firefox and WebKit mandatory. Two new journeys scan
public screens, expanded phone navigation and native setup/recovery/share/composer/
inbox/settings/archive/error states with pinned dev-only axe-core 4.13.0. They check
WCAG A/AA rules through 2.2 and best-practice tags at phone/desktop and light/dark.
The scan runs only in disposable test browsers, not in shipped application code.
Only rule IDs, impact and counts cross the browser boundary. Inconclusive rules
remain generic manual-review annotations; node HTML, selectors and private text
are never reported. Existing private-artifact protection remains in force.

On a machine with Microsoft Edge installed, run the separate explicit gate:

```powershell
npm run test:edge
```

It uses the installed Edge channel with an isolated temporary browser profile and
test D1, all existing/new journeys, zero retries and disabled screenshots/traces/
video. It does not reuse your real browser profile or substitute for another engine.
No automatic skip if Edge is missing. The portable mandatory gate remains unchanged.

The Web Interface Guidelines review found `index.html:13` and `index.html:18` using
the old theme colors. Fixed: light #fafaf7 and dark #20242c match current CSS tokens.
New browser checks compare the selected theme-color to the rendered background.
No other automated accessibility defect was identified. This does not
establish complete WCAG conformance or replace a screen-reader review. Existing
privacy requirements take precedence over generic guidelines: private search,
drafts and recovery codes must not be synchronized into URLs or persistent storage.

## Completed local results — 2026-10-04

- `npm run check`: exit 0, 113 Vitest tests across 18 files; 57 browser cases,
  19 each in Chromium, Firefox and WebKit. Original security assertions retained.
- `npm run test:edge`: exit 0, 19 cases in installed Microsoft Edge 154.0.4258.53.
  Its initial invocation timed out during server startup before any tests ran.
  A direct isolated health check returned 200; a subsequent sequential run passed.
  No assertions, retry settings or startup timeout were changed.
- 272 automated accessibility state scans: 53 public/menu and 15 private lifecycle/
  error states per browser. No violations; generic inconclusive-rule annotations
  still need human review. This is not WCAG or physical-device certification.
- Strict TypeScript, lint/format, production build, Worker dry run, privacy/secret
  scan and audit pass; zero vulnerabilities. Local migrations have no pending entries.
- Security diff review: no crypto/storage/shared/API/Worker/migration/header/CSP or
  legal policy change. JS/CSS assets are unchanged; only HTML theme colors change.
  No production config, credentials, external resources, deployment or release tag.

Run resource-intensive Wrangler/browser gates sequentially on this workspace;
the startup diagnosis did not establish a deterministic application defect.
See FINAL_VERIFICATION.md and PROJECT_STATUS.md at the repository root for handoff.

## Physical phone checks — still requires your devices

Use harmless disposable feedback/profile fixtures and keep recovery material
private. Do not send screenshots of decrypted text/codes or DevTools body/header
dumps. Record only device/browser version, pass/fail and a generic UI issue.

For Android, a local check can use Chrome's USB port forwarding, preserving the
app's secure-context requirement without opening a LAN HTTP listener:

1. Run `npm run dev` on this computer.
2. Connect your Android phone by USB and authorize remote debugging yourself.
3. In desktop Chrome, open `chrome://inspect/#devices`, enable USB discovery and
   port forwarding; map phone port **8787** to **127.0.0.1:8787** on the computer.
4. Open `http://localhost:8787` in phone Chrome. Keep the profile/share/sender tests
   on that same origin; `localhost` and `127.0.0.1` browser storage are separate.
5. Remove the port-forwarding rule and disable/revoke debugging when done.

For a second phone or a cross-device QR check, each phone needs its own forwarding
to the same computer, or both devices need the same trusted HTTPS staging origin.
A localhost link on an unconfigured second device cannot reach this computer.

This procedure follows [Chrome's USB port-forwarding instructions](https://developer.chrome.com/docs/devtools/remote-debugging/local-server/).
Ordinary `http://<LAN-address>` is unsuitable for the crypto flow; do not enable an
insecure-context bypass. Actual iOS/Safari needs your device and a properly trusted
HTTPS staging origin or appropriately trusted local HTTPS setup; none is fabricated
or provisioned here. Headless WebKit is not an iPhone/Safari certification.

Check in portrait and landscape, light/dark, increased text size and browser zoom:

- Create → save/acknowledge recovery → get complete link. Critical loss warnings
  must remain readable; no automatic copying or extra secret display.
- Open the phone keyboard on inputs/composer; caret and actions remain reachable
  by normal scrolling. Paste long Bangla, English and mixed text; no clipping/zoom
  trap/horizontal overflow. Oversized content shows the existing byte-limit error.
- Copy/paste the link intact and scan the local QR from another device/browser.
  Sending from a missing/altered fragment must fail closed.
- Send → browser decrypts in inbox → check expiry/details → cancel deletion → delete.
  Network/rate errors keep the draft; no duplicate message on an identical retry.
- Restore on another browser/device with the saved code, test a wrong code, read an
  encrypted archive locally, and verify pause/resume and permanent fixture deletion.
- Check mobile navigation, native dialogs, focus, screen-reader names/statuses and
  whether long messages remain readable with the keyboard dismissed.

## Assistive technology — still requires a person/device

Use your available Windows Narrator/NVDA, Android TalkBack or iOS VoiceOver with
disposable content. Automated rules do not establish what a screen-reader user hears.

Verify skip navigation and headings/landmarks, expanded menu and current destination,
labelled fields and associated hints/errors, saved-code checkbox, copy announcement,
encrypted-send success, expiry/delete action names, error/loading announcements,
private message reading order, recovery/archive consequences and native confirmation.
Use keyboard/switch navigation without a pointer where applicable; focus stays
visible and reachable, including after closing the mobile menu. Do not record speech
or output containing real private messages or recovery material.

## Operator-controlled production boundary

Not performed: Cloudflare authentication, real production D1 UUID, actual legal
operator/contact/jurisdiction, production HMAC root/configuration, HTTPS deployment,
provider privacy settings, live Cron/budget/log checks, production second-device
recovery and v1.0.0 release acceptance. Keep these pending until the operator acts.

The exact commands and prerequisites are in
[16_DEPLOYMENT_OPERATIONS.md](16_DEPLOYMENT_OPERATIONS.md). Start with
`npx wrangler login` and `npx wrangler d1 create nibhrito-prod` only when you choose
to provision. Use the returned UUID and actual operator details with the guarded
generators; never deploy the example config or reuse the local rate secret.
No release tag or deployment is authorized by this local QA pass.

## Primary guidance

[axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md),
[Playwright browser channels](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge),
[Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
Installed pinned code and actual test results are the implementation evidence.
