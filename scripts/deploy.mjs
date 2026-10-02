import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { validateProductionConfig, rateSecret } from './production-config.ts';

async function inspect() {
  const config = validateProductionConfig(
    JSON.parse(await readFile('wrangler.production.jsonc', 'utf8')),
  );
  const secret = rateSecret(await readFile('.dev.vars.production', 'utf8'));
  const local = await readFile('.dev.vars', 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  if (
    local
      .split(/\r?\n/)
      .some((line) => line.trim() === `RATE_LIMIT_SECRET=${secret}`)
  )
    throw new Error('Production must use a fresh rate secret.');
  return config;
}
async function run(script, args) {
  const child = spawn(process.execPath, [script, ...args], {
    stdio: 'inherit',
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  });
  await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error('Command failed.')),
    );
  });
}
try {
  if (process.argv.length !== 2 || !process.env.npm_execpath)
    throw new Error('Run npm run deploy without overrides.');
  const config = await inspect();
  await run(process.env.npm_execpath, ['run', 'build']);
  if (JSON.stringify(await inspect()) !== JSON.stringify(config))
    throw new Error('Configuration changed during the build.');
  // Uploads the server-only secret and this version together; no secret is printed.
  await run('node_modules/wrangler/bin/wrangler.js', [
    'deploy',
    '--config',
    'wrangler.production.jsonc',
    '--secrets-file',
    '.dev.vars.production',
    '--no-autoconfig',
  ]);
} catch {
  console.error(
    'Deployment stopped. Check production config, protected secret file, build and Cloudflare login. Follow docs/16_DEPLOYMENT_OPERATIONS.md. No local fallback is allowed.',
  );
  process.exitCode = 1;
}
