import { it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  makeProductionConfig,
  validateProductionConfig,
  parseProductionOptions,
  rateSecret,
  type ProductionOptions,
} from '../../scripts/production-config';
import { siteInfo } from '../../shared/schemas/site';
import { encode } from '../../shared/protocol/encoding';
const options: ProductionOptions = {
  databaseId: crypto.randomUUID(),
  operatorName: 'Test fixture operator',
  contactEmail: 'fixture@nibhrito.org',
  jurisdiction: 'Bangladesh',
};
async function safeRemove(dir: string, parent: string) {
  if (
    dirname(resolve(dir)) !== parent ||
    !basename(dir).startsWith('nibhrito-config-test-')
  )
    throw new Error('Unsafe test cleanup path.');
  await rm(dir, { recursive: true, force: true });
}
it('validates production bindings and all privacy controls with the public runtime schema', () => {
  const config = makeProductionConfig(options);
  expect(validateProductionConfig(config)).toEqual(config);
  expect(
    siteInfo({
      operator_name: config.vars.PUBLIC_OPERATOR_NAME,
      contact_email: config.vars.PUBLIC_CONTACT_EMAIL,
      jurisdiction: config.vars.PUBLIC_JURISDICTION,
      local: false,
    }).local,
  ).toBe(false);
});
it('rejects local settings, arbitrary routes/proxies, telemetry, inline vars secrets and config drift', () => {
  for (const change of [
    (c: Record<string, unknown>) => {
      c['send_metrics'] = true;
    },
    (c: Record<string, unknown>) => {
      c['observability'] = { enabled: true };
    },
    (c: Record<string, unknown>) => {
      c['vars'] = { APP_ENV: 'local' };
    },
    (c: Record<string, unknown>) => {
      c['vars'] = { ...(c['vars'] as object), RATE_LIMIT_SECRET: 'secret' };
    },
    (c: Record<string, unknown>) => {
      c['routes'] = ['*/*'];
    },
    (c: Record<string, unknown>) => {
      c['assets'] = { directory: 'dist' };
    },
    (c: Record<string, unknown>) => {
      c['preview_urls'] = true;
    },
    (c: Record<string, unknown>) => {
      c['logpush'] = true;
    },
    (c: Record<string, unknown>) => {
      c['compatibility_flags'] = ['nodejs_compat'];
    },
    (c: Record<string, unknown>) => {
      c['vars'] = { ...(c['vars'] as object), CHALLENGE_ENABLED: 'true' };
    },
  ]) {
    const config: Record<string, unknown> = structuredClone(
      makeProductionConfig(options),
    );
    change(config);
    expect(() => validateProductionConfig(config)).toThrow();
  }
});
it('rejects example/malformed operator and DB values, duplicate/unknown/missing arguments', () => {
  for (const fields of [
    { databaseId: 'REPLACE_WITH_RETURNED_ID' },
    { databaseId: '00000000-0000-0000-0000-000000000000' },
    { operatorName: 'REPLACE_WITH_OPERATOR' },
    { contactEmail: 'test@example.com' },
    { contactEmail: 'x\r\n@example.net' },
    { jurisdiction: '' },
    { workerName: 'nibhrito-local' },
  ])
    expect(() => makeProductionConfig({ ...options, ...fields })).toThrow();
  for (const args of [
    [],
    ['--unknown', 'x'],
    ['__proto__', 'x'],
    ['--database-id'],
    ['--database-id', 'x', '--database-id', 'y'],
  ])
    expect(() => parseProductionOptions(args)).toThrow();
});
it('requires a canonical independent 32-byte secret and rejects extra/weak config', () => {
  const secret = encode(new Uint8Array(randomBytes(32)));
  expect(rateSecret(`# private\nRATE_LIMIT_SECRET=${secret}\n`)).toBe(secret);
  for (const text of [
    '',
    `RATE_LIMIT_SECRET=${secret}\nOWNER_TOKEN=x`,
    `RATE_LIMIT_SECRET=${'A'.repeat(43)}`,
    `RATE_LIMIT_SECRET=${secret}=`,
  ])
    expect(() => rateSecret(text)).toThrow();
});
it('template has only installed Wrangler schema properties and deliberately cannot deploy', async () => {
  const template = JSON.parse(
    await readFile('wrangler.production.example.jsonc', 'utf8'),
  ) as Record<string, unknown>;
  expect(() => validateProductionConfig(template)).toThrow();
  const schema = JSON.parse(
    await readFile('node_modules/wrangler/config-schema.json', 'utf8'),
  ) as { definitions: { RawConfig: { properties: Record<string, unknown> } } };
  expect(
    Object.keys(template).every(
      (key) => key in schema.definitions.RawConfig.properties,
    ),
  ).toBe(true);
  const expected = makeProductionConfig(options),
    db = template['d1_databases'] as Record<string, unknown>[];
  db[0]!['database_id'] = options.databaseId;
  template['vars'] = expected.vars;
  expect(validateProductionConfig(template)).toEqual(expected);
});
it('config and secret generators create exclusive ignored files without displaying secret values', async () => {
  const parent = resolve(tmpdir()),
    dir = await mkdtemp(join(parent, 'nibhrito-config-test-'));
  const exec = promisify(execFile),
    configScript = resolve('scripts/configure-production.mjs'),
    secretScript = resolve('scripts/init-production-secret.mjs');
  try {
    const args = [
      '--database-id',
      options.databaseId,
      '--operator-name',
      options.operatorName,
      '--contact-email',
      options.contactEmail,
      '--jurisdiction',
      options.jurisdiction,
    ];
    await exec(process.execPath, [configScript, ...args], { cwd: dir });
    expect(
      validateProductionConfig(
        JSON.parse(
          await readFile(join(dir, 'wrangler.production.jsonc'), 'utf8'),
        ),
      ),
    ).toEqual(makeProductionConfig(options));
    await expect(
      exec(process.execPath, [configScript, ...args], { cwd: dir }),
    ).rejects.toThrow();
    const result = await exec(process.execPath, [secretScript], { cwd: dir });
    const secret = rateSecret(
      await readFile(join(dir, '.dev.vars.production'), 'utf8'),
    );
    expect((result.stdout + result.stderr).includes(secret)).toBe(false);
    await expect(
      exec(process.execPath, [secretScript], { cwd: dir }),
    ).rejects.toThrow();
  } finally {
    await safeRemove(dir, parent);
  }
});
it('deployment stops before building or invoking Wrangler when config is absent or unsafe', async () => {
  const parent = resolve(tmpdir()),
    dir = await mkdtemp(join(parent, 'nibhrito-config-test-'));
  const exec = promisify(execFile),
    script = resolve('scripts/deploy.mjs');
  try {
    for (const unsafe of [
      null,
      { ...makeProductionConfig(options), send_metrics: true },
    ]) {
      if (unsafe)
        await writeFile(
          join(dir, 'wrangler.production.jsonc'),
          JSON.stringify(unsafe),
        );
      let blocked = false;
      try {
        await exec(process.execPath, [script], {
          cwd: dir,
          env: { ...process.env, npm_execpath: 'must-never-execute' },
        });
      } catch (error) {
        const result = error as {
          code: number;
          stdout: string;
          stderr: string;
        };
        blocked =
          result.code === 1 &&
          !result.stdout.includes('wrangler') &&
          result.stderr.includes('Deployment stopped');
      }
      expect(blocked).toBe(true);
    }
  } finally {
    await safeRemove(dir, parent);
  }
});
