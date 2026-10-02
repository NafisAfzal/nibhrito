import { writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { resolve, join, relative, dirname, basename } from 'node:path';
import { spawn } from 'node:child_process';
const parent = resolve('.wrangler');
await mkdir(parent, { recursive: true });
const dir = await mkdtemp(join(parent, 'e2e-'));
let child;
const stop = () => {
  child?.kill('SIGTERM');
};
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
async function run(args) {
  child = spawn(
    process.execPath,
    ['node_modules/wrangler/bin/wrangler.js', ...args],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        WRANGLER_SEND_METRICS: 'false',
        WRANGLER_LOG: 'error',
      },
    },
  );
  await new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error('E2E server could not start.')));
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error('E2E server stopped.')),
    );
  });
}
async function cleanup() {
  if (dirname(resolve(dir)) !== parent || !basename(dir).startsWith('e2e-'))
    throw new Error('Unsafe E2E cleanup path.');
  await rm(dir, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
}
try {
  // Fixed local-only config, isolated D1 and test-only server secret. No user state.
  const config = {
    name: 'nibhrito-e2e',
    main: relative(dir, resolve('worker/index.ts')),
    compatibility_date: '2026-07-30',
    send_metrics: false,
    dependencies_instrumentation: { enabled: false },
    workers_dev: false,
    preview_urls: false,
    vars: { APP_ENV: 'local', CHALLENGE_ENABLED: 'false' },
    observability: {
      enabled: false,
      logs: { enabled: false, invocation_logs: false },
    },
    assets: {
      directory: relative(dir, resolve('dist')),
      binding: 'ASSETS',
      not_found_handling: 'single-page-application',
      run_worker_first: ['/api', '/api/*'],
    },
    d1_databases: [
      {
        binding: 'DB',
        database_name: 'nibhrito-e2e',
        migrations_dir: relative(dir, resolve('migrations')),
      },
    ],
  };
  const path = join(dir, 'wrangler.jsonc');
  await writeFile(path, JSON.stringify(config), { flag: 'wx' });
  await writeFile(
    join(dir, '.dev.vars'),
    `RATE_LIMIT_SECRET=${randomBytes(32).toString('base64url')}\n`,
    { flag: 'wx', mode: 0o600 },
  );
  await run(['d1', 'migrations', 'apply', 'DB', '--local', '--config', path]);
  await run([
    'dev',
    '--local',
    '--ip',
    '127.0.0.1',
    '--port',
    '8788',
    '--config',
    path,
  ]);
} catch {
  process.exitCode = 1;
} finally {
  process.removeListener('SIGTERM', stop);
  process.removeListener('SIGINT', stop);
  await cleanup();
}
