# 11 - Technical Sources and Freshness Notes

Checked: **2026-10-03**.

Before production launch, re-check platform limits and browser compatibility because these can change.

## Cloudflare

- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Pages/Functions pricing and static assets: https://developers.cloudflare.com/pages/functions/pricing/
- Turnstile plans: https://developers.cloudflare.com/turnstile/plans/

## Web Crypto / browser platform

- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- ECDH key generation parameters: https://developer.mozilla.org/en-US/docs/Web/API/EcKeyGenParams
- Key derivation: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
- AES-GCM parameters: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams

## OWASP

- Cryptographic Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
- Key Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html
- Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

## Codex workflow

- Codex with ChatGPT plans / CLI: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan
- ExecPlans guidance: https://developers.openai.com/cookbook/articles/codex_exec_plans
- Codex agent-loop / AGENTS.md behavior: https://openai.com/index/unrolling-the-codex-agent-loop/

## Architecture note

These sources support primitives and platform constraints. The Nibhrito protocol itself is a project-specific design and must receive an application-security review before being represented as formally audited cryptography.
