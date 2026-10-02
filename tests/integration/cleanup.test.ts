import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import { fixture } from './fixture';
import { D1MessageRepository } from '../../worker/repositories/messageRepository';
import { D1CleanupRepository } from '../../worker/repositories/cleanupRepository';
import worker from '../../worker/index';
describe('bounded expiry and quota', () => {
  let app: Awaited<ReturnType<typeof harness>>,
    owner: Awaited<ReturnType<typeof fixture>>;
  beforeAll(async () => {
    app = await harness();
    owner = await fixture(app, 'quota-test');
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  it('enforces the quota atomically under concurrent submissions', async () => {
    const envelope = await owner.envelope();
    const repo = new D1MessageRepository(app.db),
      now = Date.now();
    // Unique UUIDs suffice for storage concurrency; ciphertext remains opaque to D1.
    await app.db.batch(
      Array.from({ length: 490 }, () =>
        app.db
          .prepare('INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?,?,?)')
          .bind(
            crypto.randomUUID(),
            owner.id,
            'quota-test',
            1,
            envelope.key_id,
            envelope.ephemeral_pub,
            envelope.hkdf_salt,
            envelope.iv,
            envelope.ciphertext,
            now,
            now + 86400000,
          ),
      ),
    );
    const race = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        repo.submit({ ...envelope, message_id: crypto.randomUUID() }, now),
      ),
    );
    expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(10);
    const attempted = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        repo.submit({ ...envelope, message_id: crypto.randomUUID() }, now),
      ),
    );
    expect(attempted.every((r) => r.status === 'rejected')).toBe(true);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM messages')
          .first<{ n: number }>()
      )?.n,
    ).toBe(500);
  });
  it('cleans bounded batches, safely retries, and preserves new messages', async () => {
    await app.db.prepare('UPDATE messages SET created_at=0,expires_at=1').run();
    const repo = new D1MessageRepository(app.db),
      envelope = await owner.envelope();
    await repo.submit(envelope, Date.now()); // Opportunistic cleanup removes only ten.
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM messages')
          .first<{ n: number }>()
      )?.n,
    ).toBe(491);
    await app.db
      .prepare('INSERT INTO rate_limit_buckets VALUES (?, ?, 0, 1, 1)')
      .bind('opaque-test', 'test')
      .run();
    const cleanup = new D1CleanupRepository(app.db);
    expect(await cleanup.cleanup(Date.now())).toEqual({
      messages: 100,
      buckets: 1,
    });
    for (let i = 0; i < 5; i++)
      await worker.scheduled(
        { scheduledTime: Date.now() } as ScheduledController,
        app.env,
      );
    expect(await cleanup.cleanup(Date.now())).toEqual({
      messages: 0,
      buckets: 0,
    });
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM messages')
          .first<{ n: number }>()
      )?.n,
    ).toBe(1);
    expect(
      (await repo.inbox(owner.id, 25, null, Date.now())).messages[0]?.envelope
        .message_id,
    ).toBe(envelope.message_id);
  });
});
