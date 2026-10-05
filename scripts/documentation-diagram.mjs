import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';

// The same geometry is used in both palettes. No renderer or remote assets.
// Keep labels short: this portrait diagram remains readable on narrow screens.
const themes = {
  light: {
    background: '#faf9f6',
    surface: '#fffdf9',
    text: '#263238',
    muted: '#5c646c',
    border: '#7f8c89',
    browser: '#e9f3ed',
    accent: '#216b5c',
    server: '#eeedf8',
    primary: '#4b418c',
  },
  dark: {
    background: '#1e262b',
    surface: '#273238',
    text: '#eef2ee',
    muted: '#bdc8ca',
    border: '#849895',
    browser: '#293e37',
    accent: '#a1d8c5',
    server: '#35354b',
    primary: '#c8c4ff',
  },
};

for (const [name, t] of Object.entries(themes)) {
  const arrow = (from, to, label) => `
    <path d="M240 ${from}V${to - 5}" stroke="${t.border}" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="40" y="${from + 14}" width="400" height="28" fill="${t.background}"/>
    <text x="240" y="${from + 34}" text-anchor="middle" fill="${t.muted}" font-size="19">${label}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="824" viewBox="0 0 480 824" role="img" aria-labelledby="title description">
  <title id="title">Nibhrito: the encrypted message journey</title>
  <desc id="description">The recipient first shares a complete verified link whose public key is in the URL fragment. The sender browser encrypts the message locally. The same-origin Worker API stores ciphertext in D1 and serves static application assets. The authenticated recipient browser fetches ciphertext and decrypts using its local private key. D1 also stores public metadata, encrypted recovery and owner-token verifiers. An hourly Worker trigger cleans up expired rows. Message plaintext and recovery secrets are never uploaded.</desc>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" fill="none" stroke="${t.border}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
  <rect width="480" height="824" rx="16" fill="${t.background}"/>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" fill="${t.text}">
    <text x="24" y="34" font-size="24" font-weight="650">The encrypted message journey</text>
    <text x="24" y="78" font-size="19">Share the complete verified link first.</text>
    <text x="24" y="106" font-size="19" fill="${t.muted}">Its public key lives in the URL fragment.</text>

    <rect x="24" y="146" width="432" height="120" rx="12" fill="${t.browser}" stroke="${t.accent}"/>
    <text x="48" y="182" font-size="22" font-weight="650" fill="${t.accent}">Sender browser</text>
    <text x="48" y="213" font-size="20">Plaintext → local Web Crypto</text>
    <text x="48" y="241" font-size="19" fill="${t.muted}">Public key verified against the profile</text>
${arrow(266, 326, 'Encrypted envelope over HTTPS')}

    <rect x="24" y="326" width="432" height="238" rx="12" fill="${t.server}" stroke="${t.primary}"/>
    <text x="48" y="359" font-size="20" font-weight="650" fill="${t.primary}">Cloudflare · server boundary</text>
    <rect x="48" y="378" width="384" height="62" rx="8" fill="${t.surface}" stroke="${t.border}"/>
    <text x="240" y="415" text-anchor="middle" font-size="21" font-weight="600">Worker API + Static Assets</text>
    <path d="M240 446V464" stroke="${t.border}" stroke-width="2" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
    <rect x="48" y="470" width="384" height="72" rx="8" fill="${t.surface}" stroke="${t.border}"/>
    <text x="240" y="499" text-anchor="middle" font-size="20" font-weight="600">D1 · ciphertext + metadata</text>
    <text x="240" y="527" text-anchor="middle" font-size="18" fill="${t.muted}">Encrypted recovery · owner verifiers</text>
    <path d="M433 409H444V612H240V619" fill="none" stroke="${t.border}" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="240" y="598" text-anchor="middle" font-size="19" fill="${t.muted}">API returns the encrypted inbox</text>

    <rect x="24" y="624" width="432" height="120" rx="12" fill="${t.browser}" stroke="${t.accent}"/>
    <text x="48" y="660" font-size="22" font-weight="650" fill="${t.accent}">Recipient browser</text>
    <text x="48" y="691" font-size="20">Private key → local decryption</text>
    <text x="48" y="719" font-size="19" fill="${t.muted}">Readable inbox · key stays on device</text>

    <text x="24" y="784" font-size="18" fill="${t.muted}">Hourly Worker cleanup removes expired rows.</text>
    <text x="24" y="810" font-size="18" fill="${t.muted}">Message plaintext stays inside browsers.</text>
  </g>
</svg>
`;
  await writeFile(
    new URL(`../docs/assets/message-flow-${name}.svg`, import.meta.url),
    svg,
  );
}
