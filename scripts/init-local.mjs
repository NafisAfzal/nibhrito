import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
try {
  const contents = await readFile('.dev.vars', 'utf8');
  if (!/^RATE_LIMIT_SECRET=[A-Za-z0-9_-]{43}$/m.test(contents))
    throw new Error(
      'Local rate secret is missing or malformed. See .dev.vars.example.',
    );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await writeFile(
    '.dev.vars',
    `# Local server-only secret; do not commit.\nRATE_LIMIT_SECRET=${randomBytes(32).toString('base64url')}\n`,
    { flag: 'wx', mode: 0o600 },
  );
}
