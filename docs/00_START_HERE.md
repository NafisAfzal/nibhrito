# 00 - Start Here

## কোথায় রাখবেন

Windows laptop-এ project root হিসেবে এই path ব্যবহার করুন:

```text
D:\Projects\Nibhrito\
```

এই planning pack ZIP-টি `D:\Projects\`-এ extract করলে final folder হওয়া উচিত:

```text
D:\Projects\Nibhrito\
```

`Nibhrito\Nibhrito\` double nesting করবেন না। `AGENTS.md`, `README.md`, `docs`, `.agent`, এবং `prompts` সরাসরি `D:\Projects\Nibhrito\`-এর ভেতরে থাকবে।

Google Drive-এ backup রাখতে চাইলে source-of-truth Git repository রাখুন laptop/GitHub-এ, এবং Drive-এ শুধু periodic ZIP/export রাখুন। Live Git repository সরাসরি Google Drive sync folder-এর মধ্যে রাখা recommended নয়, কারণ sync conflict `.git` metadata নষ্ট করতে পারে।

## Recommended first commands - PowerShell

```powershell
D:
mkdir D:\Projects -Force
cd D:\Projects\Nibhrito

git init
git add .
git commit -m "docs: add Nibhrito architecture and execution plan"

node --version
npm --version
git --version
```

Install/update Codex:

```powershell
npm install -g @openai/codex@latest
codex --version
codex
```

Inside Codex, first ask it to read the plan, not to immediately improvise.

Use the prompt in:

```text
prompts\CODEX_START.txt
```

For a deep security pass after implementation, use:

```text
prompts\SECURITY_REVIEW.txt
```

## Which model to use

For repository-wide implementation, use the strongest coding/reasoning model that your Codex installation exposes. As of 2026-10-03, if **GPT-6 Astra** is available in Codex, use it for the initial architecture-to-code implementation and difficult security/refactor work. If it is not available, use **GPT-5.6 Sol** with high reasoning effort. Use faster models only for small mechanical edits after the architecture is stable.

Do not let the model redesign the crypto protocol simply because another primitive looks newer. A protocol change requires an explicit architecture revision and interoperability tests.

## Suggested workflow

1. Install this planning pack.
2. Commit it before generating application code.
3. Start Codex from the repository root.
4. Have it implement Phase 0 and Phase 1 first.
5. Review crypto tests before proceeding to profile/message UI.
6. Continue phase by phase.
7. Deploy a staging environment before production.
8. Run the final security prompt and fix all high-severity findings.

## Expected final repository shape

The coding agent may refine file names, but the target should remain simple:

```text
Nibhrito/
├─ AGENTS.md
├─ README.md
├─ PROJECT_STATUS.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts
├─ wrangler.jsonc
├─ .dev.vars.example
├─ .agent/
│  └─ PLANS.md
├─ docs/
├─ prompts/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ crypto/
│  ├─ storage/
│  ├─ lib/
│  └─ main.tsx
├─ worker/
│  ├─ index.ts
│  ├─ routes/
│  ├─ middleware/
│  ├─ repositories/
│  └─ security/
├─ shared/
│  ├─ schemas/
│  ├─ protocol/
│  └─ types/
├─ migrations/
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ e2e/
```
