import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { D1ReadinessRepository } from '../../worker/repositories/readinessRepository';
import { handleApi } from '../../worker/routes/api';

describe('local D1 foundation', () => {
  let runtime: Miniflare;
  let database: D1Database;

  beforeAll(async () => {
    runtime = new Miniflare({
      modules: true,
      script:
        'export default { fetch() { return new Response("test harness"); } };',
      compatibilityDate: '2026-07-30',
      d1Databases: { DB: 'foundation-test' },
      d1Persist: false,
    });
    // Miniflare's RPC proxy implements the Worker D1 API at this test boundary.
    database = (await runtime.getD1Database('DB')) as unknown as D1Database;
  });

  afterAll(async () => {
    await runtime?.dispose();
  });

  it('fails closed before the schema exists, then applies the committed migration', async () => {
    const repository = new D1ReadinessRepository(database);
    expect(
      (
        await handleApi(
          new Request('https://local.invalid/api/v1/health'),
          repository,
        )
      ).status,
    ).toBe(503);
    const migration = await readFile(
      new URL('../../migrations/0001_initial.sql', import.meta.url),
      'utf8',
    );
    // Split this trusted migration at statement boundaries; it has no string semicolons.
    const statements = migration
      .replace(/^--.*$/gm, '')
      .split(';')
      .map((sql) => sql.trim())
      .filter(Boolean);
    await database.batch(statements.map((sql) => database.prepare(sql)));
    expect(await repository.isReady()).toBe(true);
    const response = await handleApi(
      new Request('https://local.invalid/api/v1/health'),
      repository,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { status: 'ok' } });
  });

  it('has the required indexes and no plaintext or identifying metadata columns', async () => {
    const indexes = await database
      .prepare('SELECT name FROM sqlite_master WHERE type = ?')
      .bind('index')
      .all<{ name: string }>();
    expect(indexes.results.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        'messages_inbox',
        'messages_expiry',
        'messages_profile_expiry',
        'rate_limit_expiry',
      ]),
    );
    for (const table of [
      'profiles',
      'messages',
      'recovery_blobs',
      'rate_limit_buckets',
    ]) {
      const columns = await database
        .prepare('SELECT name FROM pragma_table_info(?)')
        .bind(table)
        .all<{ name: string }>();
      expect(columns.results.map(({ name }) => name).join(' ')).not.toMatch(
        /plaintext|private_key|recovery_secret|raw_ip|user_agent|referrer/,
      );
    }
  });

  it('enforces retention, duplicate IDs, profile identity, and deletion cascades', async () => {
    const now = 1790985600000;
    const profile = (id: string, slug: string, days: number) =>
      database
        .prepare(
          'INSERT INTO profiles (id, slug, display_name, public_prompt, owner_token_hash, current_key_id, retention_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          id,
          slug,
          'Foundation fixture',
          '',
          'h'.repeat(43),
          'k'.repeat(43),
          days,
          now,
          now,
        )
        .run();
    await expect(profile('invalid', 'invalid', 365)).rejects.toThrow();
    await profile('profile-a', 'alice', 30);

    // These are structural storage fixtures, not usable crypto envelopes.
    const insert = (id: string, slug = 'alice') =>
      database
        .prepare(
          'INSERT INTO messages (id, profile_id, profile_slug, envelope_version, key_id, ephemeral_pub, hkdf_salt, iv, ciphertext, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          id,
          'profile-a',
          slug,
          1,
          'k'.repeat(43),
          'p'.repeat(87),
          's'.repeat(43),
          'i'.repeat(16),
          'c'.repeat(22),
          now,
          now + 86400000,
        )
        .run();
    await insert('message-a');
    await expect(insert('message-a')).rejects.toThrow();
    await expect(insert('message-b', 'bob')).rejects.toThrow();

    await database
      .prepare(
        'INSERT INTO recovery_blobs (profile_id, version, key_id, hkdf_salt, iv, ciphertext, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'profile-a',
        1,
        'k'.repeat(43),
        's'.repeat(43),
        'i'.repeat(16),
        'c'.repeat(22),
        now,
      )
      .run();
    await database
      .prepare('DELETE FROM profiles WHERE id = ?')
      .bind('profile-a')
      .run();
    expect(
      await database
        .prepare('SELECT COUNT(*) AS count FROM messages')
        .first('count'),
    ).toBe(0);
    expect(
      await database
        .prepare('SELECT COUNT(*) AS count FROM recovery_blobs')
        .first('count'),
    ).toBe(0);
  });

  it('unknown APIs fail as JSON without reflecting paths or creating data', async () => {
    const repository = new D1ReadinessRepository(database);
    const response = await handleApi(
      new Request('https://local.invalid/api/v1/unknown-input'),
      repository,
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Route not found.' },
    });
    expect(
      await database
        .prepare('SELECT COUNT(*) AS count FROM profiles')
        .first('count'),
    ).toBe(0);
  });
});
