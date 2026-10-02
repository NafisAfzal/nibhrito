import { it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, dirname, basename, relative } from 'node:path';
import {
  generateRecipient,
  random,
  tokenVerifier,
} from '../../src/crypto/keys';
import { encryptMessage, decryptMessage } from '../../src/crypto/protocol';
import {
  recoveryCode,
  encryptRecovery,
  decryptRecovery,
} from '../../src/crypto/recovery';
import { encode } from '../../shared/protocol/encoding';
import type { MessageEnvelope } from '../../shared/protocol/envelope';

const exec = promisify(execFile);
async function safeRemove(dir: string, parent: string) {
  if (
    dirname(resolve(dir)) !== parent ||
    !basename(dir).startsWith('portability-')
  )
    throw new Error('Unsafe test cleanup path.');
  await rm(dir, { recursive: true, force: true });
}
it('exports and restores real protocol ciphertext, schema, migrations and counter triggers', async () => {
  const parent = resolve('.wrangler');
  await mkdir(parent, { recursive: true });
  const dir = await mkdtemp(join(parent, 'portability-'));
  const source = join(dir, 'source'),
    target = join(dir, 'restored');
  for (const state of [source, target]) {
    await mkdir(state);
    await writeFile(
      join(state, 'wrangler.jsonc'),
      JSON.stringify({
        name: 'nibhrito-portability-test',
        compatibility_date: '2026-07-30',
        send_metrics: false,
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'portability-test',
            migrations_dir: relative(state, resolve('migrations')),
          },
        ],
      }),
    );
  }
  async function cli(args: string[]) {
    // Export in this Wrangler version uses config-relative persistence only.
    const index = args.indexOf('--persist-to'),
      state = args[index + 1];
    if (
      index < 0 ||
      !state ||
      ![source, target].includes(state) ||
      !args.includes('--local')
    )
      throw new Error('Unsafe portability command.');
    args.splice(index, 2, '--config', join(state, 'wrangler.jsonc'));
    try {
      return (
        await exec(
          process.execPath,
          ['node_modules/wrangler/bin/wrangler.js', ...args],
          {
            env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
            maxBuffer: 1048576,
          },
        )
      ).stdout;
    } catch {
      throw new Error(
        'Disposable local D1 portability command failed. No database data logged.',
      );
    }
  }
  async function query(sql: string) {
    const raw = await cli([
      'd1',
      'execute',
      'DB',
      '--local',
      '--persist-to',
      target,
      '--command',
      sql,
      '--json',
    ]);
    try {
      return (JSON.parse(raw) as { results: Record<string, unknown>[] }[])[0]!
        .results[0]!;
    } catch {
      throw new Error('Disposable D1 result invalid.');
    }
  }
  try {
    await cli([
      'd1',
      'migrations',
      'apply',
      'DB',
      '--local',
      '--persist-to',
      source,
    ]);
    const recipient = await generateRecipient(),
      code = await recoveryCode(),
      token = encode(random(32));
    const slug = 'portable-test',
      id = crypto.randomUUID(),
      now = Date.now();
    const message = {
      type: 'message',
      text: 'Private portability fixture বাংলা',
      client_created_at: new Date(now).toISOString(),
    };
    const envelope = await encryptMessage(recipient.publicKey, slug, message);
    const recovery = await encryptRecovery(
      {
        v: 1,
        profile_slug: slug,
        key_id: recipient.keyId,
        recipient_private_jwk: recipient.jwk,
        owner_token: token,
        created_at: new Date(now).toISOString(),
      },
      code,
    );
    // Only trusted, generated fixtures enter this SQL import, never HTTP input.
    const literal = (value: string | number) =>
      typeof value === 'number'
        ? String(value)
        : `'${value.replaceAll("'", "''")}'`;
    const sql = [
      `INSERT INTO profiles (id,slug,display_name,public_prompt,theme,owner_token_hash,current_key_id,retention_days,created_at,updated_at) VALUES (${[id, slug, 'Portability fixture', '', 'sage', await tokenVerifier(token), recipient.keyId, 30, now, now].map(literal).join(',')});`,
      `INSERT INTO messages VALUES (${[envelope.message_id, id, slug, 1, envelope.key_id, envelope.ephemeral_pub, envelope.hkdf_salt, envelope.iv, envelope.ciphertext, now, now + 86400000].map(literal).join(',')});`,
      `INSERT INTO recovery_blobs VALUES (${[id, 1, recovery.key_id, recovery.hkdf_salt, recovery.iv, recovery.ciphertext, now].map(literal).join(',')});`,
    ].join('\n');
    expect(
      sql.includes(message.text) ||
        sql.includes(token) ||
        sql.includes(code) ||
        sql.includes(recipient.jwk.d!),
    ).toBe(false);
    const fixture = join(dir, 'fixture.sql'),
      dump = join(dir, 'encrypted.sql');
    await writeFile(fixture, sql, { flag: 'wx', mode: 0o600 });
    await cli([
      'd1',
      'execute',
      'DB',
      '--local',
      '--persist-to',
      source,
      '--file',
      fixture,
    ]);
    await cli([
      'd1',
      'export',
      'DB',
      '--local',
      '--persist-to',
      source,
      '--output',
      dump,
    ]);
    const exported = await readFile(dump, 'utf8');
    expect(
      exported.includes(message.text) ||
        exported.includes(token) ||
        exported.includes(code) ||
        exported.includes(recipient.jwk.d!),
    ).toBe(false);
    expect((exported.match(/CREATE TRIGGER/g) ?? []).length).toBe(6);
    await cli([
      'd1',
      'execute',
      'DB',
      '--local',
      '--persist-to',
      target,
      '--file',
      dump,
    ]);
    expect(
      await query(
        "SELECT (SELECT value FROM storage_counters WHERE name='profiles') AS profiles,(SELECT value FROM storage_counters WHERE name='messages') AS messages,(SELECT COUNT(*) FROM d1_migrations) AS migrations",
      ),
    ).toEqual({ profiles: 1, messages: 1, migrations: 2 });
    const row = await query(
      'SELECT envelope_version AS v,id AS message_id,profile_slug,key_id,ephemeral_pub,hkdf_salt,iv,ciphertext FROM messages',
    );
    const restored = await query(
      'SELECT version AS v,key_id,hkdf_salt,iv,ciphertext FROM recovery_blobs',
    );
    const keys = await decryptRecovery(restored, slug, code);
    const plain = await decryptMessage(
      row as unknown as MessageEnvelope,
      slug,
      new Map([[keys.keyId, keys.privateKey]]),
    );
    expect(plain.text === message.text).toBe(true);
    await cli([
      'd1',
      'execute',
      'DB',
      '--local',
      '--persist-to',
      target,
      '--file',
      'scripts/reconcile-counters.sql',
    ]);
    await cli([
      'd1',
      'execute',
      'DB',
      '--local',
      '--persist-to',
      target,
      '--command',
      'DELETE FROM profiles',
    ]);
    expect(
      await query(
        "SELECT (SELECT value FROM storage_counters WHERE name='profiles') AS profiles,(SELECT value FROM storage_counters WHERE name='messages') AS messages,(SELECT COUNT(*) FROM recovery_blobs) AS recovery",
      ),
    ).toEqual({ profiles: 0, messages: 0, recovery: 0 });
  } finally {
    // Verified absolute task-created directory only; never remove user DB state.
    await safeRemove(dir, parent);
  }
}, 90000);
