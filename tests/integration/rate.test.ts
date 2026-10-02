import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import { fixture } from './fixture';
import { D1RateRepository } from '../../worker/repositories/rateRepository';
import { rateLimit } from '../../worker/middleware/rateLimit';
import worker from '../../worker/index';
describe('atomic privacy-preserving rate limits', () => {
  let app: Awaited<ReturnType<typeof harness>>;
  beforeAll(async () => {
    app = await harness();
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  it('allows exactly the configured concurrent count and resets in next window', async () => {
    const repo = new D1RateRepository(app.db);
    const race = await Promise.all(
      Array.from({ length: 20 }, () =>
        repo.consume('opaque', 'test', 60000, 60000, 5),
      ),
    );
    expect(race.filter(Boolean)).toHaveLength(5);
    expect(await repo.consume('opaque', 'test', 120000, 60000, 5)).toBe(true);
  });
  it('rejects the eleventh profile submission without storing duplicate messages', async () => {
    const owner = await fixture(app, 'burst-test'),
      envelope = await owner.envelope();
    const post = () =>
      app.fetch('/api/v1/profiles/burst-test/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
      });
    for (let i = 0; i < 10; i++)
      expect((await post()).status).toBe(i ? 200 : 201);
    const response = await post();
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('3600');
    const stored = await app.db
      .prepare('SELECT * FROM rate_limit_buckets')
      .all();
    expect(JSON.stringify(stored.results).includes('127.0.0.1')).toBe(false);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM messages')
          .first<{ n: number }>()
      )?.n,
    ).toBe(1);
  });
  it('enforces production creation limits, profile isolation and window recovery', async () => {
    const env = { ...app.env, APP_ENV: 'production' as const },
      repo = new D1RateRepository(app.db),
      now = 864000000;
    const req = new Request('https://edge.invalid/api/v1/profiles', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '192.0.2.44',
        'X-Forwarded-For': '192.0.2.99',
      },
    });
    const limits = await rateLimit(req, env, repo, now);
    for (let i = 0; i < 3; i++) await limits.creation();
    await expect(limits.creation()).rejects.toMatchObject({ status: 429 });
    for (let i = 0; i < 10; i++) await limits.submission('isolation-one');
    await expect(limits.submission('isolation-one')).rejects.toMatchObject({
      status: 429,
    });
    await limits.submission('isolation-two');
    const fresh = await rateLimit(req, env, repo, now + 3600000);
    await fresh.creation();
    await fresh.submission('isolation-one');
    const records = JSON.stringify(
      (await app.db.prepare('SELECT * FROM rate_limit_buckets').all()).results,
    );
    expect(records.includes('192.0.2.44')).toBe(false);
    expect(records.includes('192.0.2.99')).toBe(false);
  });
  it('fails closed for missing secret, unknown environment and unsupported challenge config', async () => {
    for (const env of [
      { ...app.env, RATE_LIMIT_SECRET: '' },
      { ...app.env, APP_ENV: 'production' as const },
      { ...app.env, CHALLENGE_ENABLED: 'true' },
    ]) {
      const response = await worker.fetch(
        new Request('http://127.0.0.1/api/v1/health'),
        env as typeof app.env,
      );
      expect(response.status).toBe(503);
    }
  });
  it('bounds bucket cardinality even under distinct-source attacks', async () => {
    const before = await app.db
      .prepare('SELECT SUM(count) AS n FROM rate_limit_buckets')
      .first<{ n: number }>();
    expect(
      (
        await app.fetch('/api/v1/health', {
          headers: {
            Origin: 'https://evil.invalid',
            'Sec-Fetch-Site': 'cross-site',
          },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await app.db
          .prepare('SELECT SUM(count) AS n FROM rate_limit_buckets')
          .first<{ n: number }>()
      )?.n,
    ).toBe(before?.n);
    await app.db.prepare('DELETE FROM rate_limit_buckets').run();
    await app.db.batch(
      Array.from({ length: 2000 }, (_, i) =>
        app.db
          .prepare('INSERT INTO rate_limit_buckets VALUES (?, ?, 0, 1, 1)')
          .bind(`opaque-${i}`, 'fixture'),
      ),
    );
    const repo = new D1RateRepository(app.db);
    expect(await repo.consume('new', 'fixture', 0, 60000, 2)).toBe(false);
    expect(await repo.consume('opaque-0', 'fixture', 0, 60000, 2)).toBe(true);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM rate_limit_buckets')
          .first<{ n: number }>()
      )?.n,
    ).toBe(2000);
  });
});
