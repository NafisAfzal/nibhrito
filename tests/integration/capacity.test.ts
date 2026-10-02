import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { harness } from './harness';
import { fixture } from './fixture';
import { D1MessageRepository } from '../../worker/repositories/messageRepository';
import { D1ProfileRepository } from '../../worker/repositories/profileRepository';

describe('atomic storage capacity counters', () => {
  let app: Awaited<ReturnType<typeof harness>>;
  beforeAll(async () => {
    app = await harness();
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  async function consistent() {
    for (const [name, table] of [
      ['profiles', 'profiles'],
      ['messages', 'messages'],
      ['buckets', 'rate_limit_buckets'],
    ]) {
      const count = await app.db
        .prepare(`SELECT COUNT(*) AS n FROM ${table}`)
        .first('n');
      expect(
        await app.db
          .prepare('SELECT value FROM storage_counters WHERE name=?')
          .bind(name)
          .first('value'),
      ).toBe(count);
    }
  }
  it('counts inserts, idempotent retries, expiry deletion and profile cascades', async () => {
    const owner = await fixture(app, 'counter-test');
    const repo = new D1MessageRepository(app.db),
      envelope = await owner.envelope();
    expect(await repo.submit(envelope, Date.now())).toBe(true);
    expect(await repo.submit(envelope, Date.now())).toBe(false);
    await consistent();
    await repo.remove(owner.id, envelope.message_id);
    await consistent();
    await repo.submit(await owner.envelope(), Date.now());
    await new D1ProfileRepository(app.db).remove(owner.id);
    await consistent();
    await app.db.prepare('DELETE FROM rate_limit_buckets').run();
    await consistent();
  });
  it('fails closed at global capacity and admits exactly one concurrent final slot', async () => {
    const owner = await fixture(app, 'global-cap-test'),
      envelope = await owner.envelope();
    const repo = new D1MessageRepository(app.db);
    // Construct a boundary aggregate without allocating twenty thousand fixtures.
    await app.db
      .prepare("UPDATE storage_counters SET value=19999 WHERE name='messages'")
      .run();
    try {
      const race = await Promise.allSettled(
        Array.from({ length: 8 }, () =>
          repo.submit(
            { ...envelope, message_id: crypto.randomUUID() },
            Date.now(),
          ),
        ),
      );
      expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      await expect(
        repo.submit(
          { ...envelope, message_id: crypto.randomUUID() },
          Date.now(),
        ),
      ).rejects.toMatchObject({ status: 429 });
    } finally {
      await app.db
        .prepare(
          "UPDATE storage_counters SET value=(SELECT COUNT(*) FROM messages) WHERE name='messages'",
        )
        .run();
    }
    await consistent();
  });
});
