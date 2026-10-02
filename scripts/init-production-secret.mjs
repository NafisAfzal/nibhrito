import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
if (process.argv.length !== 2) {
  console.error('No arguments accepted.');
  process.exitCode = 1;
} else {
  const secret = randomBytes(32);
  try {
    await writeFile(
      '.dev.vars.production',
      `# Production server-only rate secret; never commit or share.\nRATE_LIMIT_SECRET=${secret.toString('base64url')}\n`,
      { flag: 'wx', mode: 0o600 },
    );
    console.log(
      'Created ignored production rate-secret file without displaying it. Protect this file and follow the deployment guide.',
    );
  } catch {
    console.error(
      'Could not create production rate secret. Existing files are never overwritten.',
    );
    process.exitCode = 1;
  } finally {
    secret.fill(0);
  }
}
