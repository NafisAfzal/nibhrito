import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import worker from '../../worker/index';
describe('security boundaries', () => {
  let app: Awaited<ReturnType<typeof harness>>;
  beforeAll(async () => {
    app = await harness();
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  it('rejects insecure production transport before auth or rate work', async () => {
    const response = await worker.fetch(
      new Request('http://edge.invalid/api/v1/owner', {
        headers: { 'CF-Connecting-IP': '192.0.2.1' },
      }),
      { ...app.env, APP_ENV: 'production' },
    );
    expect(response.status).toBe(426);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM rate_limit_buckets')
          .first<{ n: number }>()
      )?.n,
    ).toBe(0);
  });
  it('enforces streamed byte limits even with misleading length headers', async () => {
    const response = await app.fetch('/api/v1/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': '1' },
      body: 'x'.repeat(20000),
    });
    expect(response.status).toBe(413);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM profiles')
          .first<{ n: number }>()
      )?.n,
    ).toBe(0);
  });
  it('exposes only configured public site metadata', async () => {
    const response = await app.fetch('/api/v1/site');
    expect(response.status).toBe(200);
    const raw = await response.text();
    expect(raw.includes(app.env.RATE_LIMIT_SECRET)).toBe(false);
    expect(raw.includes('RATE_LIMIT_SECRET')).toBe(false);
    expect((await app.fetch('/api/v1/site?secret=1')).status).toBe(400);
  });
});
