export const policies = {
  '/privacy': {
    title: 'Privacy policy',
    intro:
      'Your words are encrypted in your browser. This policy describes the data that still makes the service work.',
    sections: [
      {
        title: 'What the application stores',
        body: 'Public link name, display name, prompt, profile accent and retention preference; encrypted message envelopes and recovery bundle; server creation/expiry times; a hashed owner-token verifier; and short-lived abuse counters. Message size, destination and timing are visible metadata. Public profiles can be enumerated. Use public fields carefully.',
      },
      {
        title: 'What stays in your browser',
        body: 'Normal message plaintext, private decryption keys, recovery codes and derived message keys never go to the backend. Your non-extractable key and owner token are stored in this browser’s IndexedDB; decrypted notes and searches stay in page memory. JavaScript cannot guarantee physical memory erasure. Browser storage, extensions, cloud-synced profiles and device backups remain under your control.',
      },
      {
        title: 'Network data and abuse prevention',
        body: 'The application does not persist raw IP addresses, user-agent history, referrers, advertising identifiers or fingerprints. It transiently processes the trusted edge address to derive a daily HMAC bucket, grouping IPv6 by /64 and IPv4 by address. Network counters expire within two hours, global daily counters within 25 hours, then bounded hourly cleanup removes them. Cleanup backlogs can delay physical deletion. Shared networks may be throttled. Root-secret compromise may correlate network buckets.',
      },
      {
        title: 'Hosting and third parties',
        body: 'Cloudflare serves requests and stores the encrypted database. It processes network metadata, including IP addresses, under its own policies and infrastructure controls. There are no advertising, analytics, session-replay tools, remote fonts or third-party scripts in this application. Contact by email uses your chosen mail provider and voluntarily discloses whatever you send.',
      },
      {
        title: 'Expiry, deletion and your copies',
        body: 'Messages expire after 1, 7, 30 or 90 days; 30 is the default. Expired messages stop appearing in the API immediately according to server time. Hourly jobs remove at most 100 expired messages per invocation, with smaller cleanup during new sends. Deleting a message/profile removes active rows; encrypted provider backups may retain recoverable state temporarily. Deletion cannot erase screenshots, exports or other copies. Encrypted backups you download remain readable with your recovery code after server expiry or deletion.',
      },
      {
        title: 'Recovery and access',
        body: 'Your saved recovery code unlocks the encrypted private key and owner token. Anyone holding it can regain access while the bundle exists. The operator cannot reset it. Losing both the browser key and recovery code may permanently lose access. Forgetting this device clears its local access but does not revoke other devices or copied codes/tokens. MVP has no remote device revocation or key rotation.',
      },
      {
        title: 'Your choices and requests',
        body: 'You can edit public settings, pause incoming messages, download encrypted backups, delete notes/profile, or remove this device’s access. Contact the operator for privacy requests about public metadata. Do not send private feedback or recovery material in a support email. The backend cannot inspect private ciphertext for moderation. Any future voluntary disclosure flow must show and ask you to approve the exact disclosure.',
      },
    ],
  },
  '/terms': {
    title: 'Terms of service',
    intro:
      'Nibhrito is a space for respectful feedback. Use it with care and understand its limits.',
    sections: [
      {
        title: 'Who can use this service',
        body: 'This service is intended for adults aged 18 or older. Do not impersonate someone or create profiles without authority. You are responsible for public profile information, the feedback you send, and keeping your device and recovery code secure.',
      },
      {
        title: 'Respectful use',
        body: 'Follow the Acceptable Use Policy and applicable law. The operator may disable public profiles or restrict access for platform abuse. Encryption does not make illegal or harmful behavior acceptable. Recipients may delete messages or stop receiving them.',
      },
      {
        title: 'Security and availability',
        body: 'Nibhrito is designed for browser-side end-to-end encryption, not absolute anonymity or guaranteed availability. There is no email/password reset or operator decryption mechanism. It is not an emergency, crisis-response, medical/legal advice, or high-risk whistleblowing channel. v1 is not independently audited and has no full forward secrecy.',
      },
      {
        title: 'Your content and deletion',
        body: 'You keep responsibility for the content you create. Public profile metadata is visible to others; messages are stored as opaque encrypted envelopes. Retention and deletion rules are described in the Privacy Policy. Service changes, outages or lost keys may make data unavailable; keep your recovery code and any needed encrypted backup.',
      },
      {
        title: 'Operator and changes',
        body: 'The operator and contact details appear below. Material policy changes should be published with an updated date before they apply. These baseline terms require the operator’s review for the jurisdiction where the service is launched; they do not assert compliance with every jurisdiction.',
      },
    ],
  },
  '/acceptable-use': {
    title: 'Acceptable use',
    intro: 'Honesty can be kind. Keep feedback respectful and lawful.',
    sections: [
      {
        title: 'Prohibited use',
        body: 'Do not send credible threats of violence, targeted harassment or stalking, sexual exploitation of minors, non-consensual intimate material, doxxing or private identifying information, fraud or impersonation, malware or malicious links, illegal solicitation, coordinated spam, or attempts to attack or bypass Nibhrito’s security. Attachments are not supported.',
      },
      {
        title: 'Recipient controls',
        body: 'Delete unwanted notes or pause incoming messages in profile settings. The backend cannot read encrypted message meaning or silently moderate private text. Public profile metadata may be reviewed. If you contact the operator about abuse, share a public profile URL and a minimal description; do not include recovery codes, tokens or private messages. A public URL alone may not establish message authorship.',
      },
      {
        title: 'Urgent harm',
        body: 'For imminent danger, use trusted local emergency services or an appropriate professional support channel. Nibhrito is not monitored as a crisis service. Avoid putting yourself or others at risk by sharing sensitive information.',
      },
    ],
  },
  '/security': {
    title: 'Security & encryption',
    intro:
      'Content confidentiality has clear boundaries. Knowing them is part of staying safe.',
    sections: [
      {
        title: 'Browser-to-browser confidentiality',
        body: 'Your browser generates a fresh ephemeral P-256 ECDH keypair for each note, derives a 256-bit AES-GCM key through HKDF-SHA-256 with a fresh 32-byte salt, and encrypts with a random 96-bit IV and 128-bit tag. Authenticated data binds protocol version, profile link name, message UUID and key fingerprint. Bangla, emoji, mood and the sender’s device time are all inside the encrypted payload.',
      },
      {
        title: 'Share the complete verified link',
        body: 'The #v=1&pk=… fragment carries the recipient public key and stays out of the HTTP request URL. Obtain the full link from a trusted recipient channel. Missing, malformed, unsupported or mismatched keys fail closed; the backend never supplies a replacement key. This protects against database-only key substitution, not someone replacing a whole link or deploying malicious client code.',
      },
      {
        title: 'Authentication is separate',
        body: 'A random owner token authorizes inbox access and deletion; its SHA-256 verifier is stored server-side. It cannot decrypt messages. The private decryption key is non-extractable in IndexedDB. The recovery bundle encrypts both the original key and owner token under an independent random recovery code using HKDF and AES-GCM.',
      },
      {
        title: 'Recovery is your responsibility',
        body: 'Save the recovery code away from this device, preferably in a password manager. Anyone with the code and encrypted bundle can restore access. The operator has no hidden master key and cannot reset the code. Non-extractable keys still can be used by malicious code in your browser; protect your device and extensions.',
      },
      {
        title: 'What encryption cannot promise',
        body: 'Network providers see connection metadata. Writing style, timing, public profiles or a compromised device may reveal identity. A malicious future deployed frontend can capture plaintext or invoke keys. A stolen long-lived recipient key can decrypt historical messages: v1 has no full forward secrecy. AEAD detects envelope tampering; sender identity is not authenticated, and server timestamps/expiry are outside AEAD. The server can omit, replay or delete data; duplicate UUID protection lasts only while a stored row exists.',
      },
      {
        title: 'Client and service safeguards',
        body: 'Strict CSP, no remote scripts/fonts, text-only message rendering, validated bounded APIs, parameterized owner-scoped SQL, short-lived HMAC rate controls and disabled application telemetry/logging reduce risk. They are tested safeguards, not a guarantee against every attack. Review the source and releases before sensitive use. No independent security audit or production acceptance is claimed by this local implementation.',
      },
    ],
  },
  '/contact': {
    title: 'Contact & abuse support',
    intro:
      'Share only what is needed. Support never needs your recovery code or private keys.',
    sections: [
      {
        title: 'Contact the operator',
        body: 'Use the configured contact below for public-profile abuse, privacy requests or a security vulnerability. Include the public profile link name and minimal context. Do not send recovery codes, owner tokens, keys or private feedback. This application has no plaintext-report upload endpoint.',
      },
      {
        title: 'Report a vulnerability',
        body: 'Explain the affected feature and a reproducible example using synthetic test data. Avoid accessing another person’s private data, publishing live secrets, or testing destructive actions on production. Coordinate disclosure through the operator’s contact channel.',
      },
    ],
  },
} as const;
