import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import { fixture } from './fixture';
import { D1MessageRepository } from '../../worker/repositories/messageRepository';
import type { InboxPage } from '../../shared/schemas/inbox';
describe('owner-scoped inbox and lifecycle', () => {
  let app: Awaited<ReturnType<typeof harness>>,
    a: Awaited<ReturnType<typeof fixture>>,
    b: Awaited<ReturnType<typeof fixture>>,
    ids: string[];
  beforeAll(async () => {
    app = await harness();
    a = await fixture(app, 'owner-alpha');
    b = await fixture(app, 'owner-beta');
    ids = [];
    const repo = new D1MessageRepository(app.db);
    for (let i = 0; i < 4; i++) {
      const e = await a.envelope();
      ids.push(e.message_id);
      await repo.submit(e, Date.now());
    }
    const e = await b.envelope();
    await repo.submit(e, Date.now());
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  const page = async (path: string, headers = a.auth) => {
    const response = await app.fetch(path, { headers });
    expect(response.status).toBe(200);
    return ((await response.json()) as { data: InboxPage }).data;
  };
  it('requires bearer auth independently of client', async () => {
    for (const path of ['/api/v1/inbox', `/api/v1/messages/${ids[0]}`])
      expect(
        (
          await app.fetch(path, {
            method: path.includes('messages/') ? 'DELETE' : 'GET',
          })
        ).status,
      ).toBe(401);
  });
  it('paginates deterministically and cannot select another owner', async () => {
    const first = await page('/api/v1/inbox?limit=2');
    expect(first.messages).toHaveLength(2);
    expect(first.next_cursor).not.toBeNull();
    const second = await page(
      `/api/v1/inbox?limit=2&cursor=${first.next_cursor}`,
    );
    expect(second.messages).toHaveLength(2);
    expect(second.next_cursor).toBeNull();
    const all = [...first.messages, ...second.messages];
    expect(new Set(all.map((n) => n.envelope.message_id)).size).toBe(4);
    expect(all.every((n) => n.envelope.profile_slug === 'owner-alpha')).toBe(
      true,
    );
    expect(
      (
        await app.fetch(`/api/v1/inbox?cursor=${first.next_cursor}`, {
          headers: b.auth,
        })
      ).status,
    ).toBe(400);
    expect((await page('/api/v1/inbox', b.auth)).messages).toHaveLength(1);
  });
  it.each([
    '?limit=0',
    '?limit=51',
    '?limit=1&limit=2',
    '?owner_id=other',
    '?cursor=bad',
  ])('rejects invalid cursor/query %s', async (query) => {
    expect(
      (await app.fetch('/api/v1/inbox' + query, { headers: a.auth })).status,
    ).toBe(400);
  });
  it('blocks IDOR deletion/update and rejects immutable/unexpected profile fields', async () => {
    expect(
      (
        await app.fetch(`/api/v1/messages/${ids[0]}`, {
          method: 'DELETE',
          headers: b.auth,
        })
      ).status,
    ).toBe(404);
    for (const [id, body, expected] of [
      [b.id, { display_name: 'attack' }, 404],
      [a.id, { slug: 'rename' }, 400],
      [a.id, { owner_token_hash: 'replace' }, 400],
      [a.id, { is_disabled: 'false' }, 400],
    ] as const)
      expect(
        (
          await app.fetch(`/api/v1/profiles/${id}`, {
            method: 'PATCH',
            headers: { ...a.auth, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        ).status,
      ).toBe(expected);
    expect(
      (
        await app.fetch(`/api/v1/profiles/${b.id}`, {
          method: 'DELETE',
          headers: a.auth,
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await app.fetch(`/api/v1/messages/${ids[0]}`, {
          method: 'DELETE',
          headers: { ...a.auth, Origin: 'https://evil.invalid' },
        })
      ).status,
    ).toBe(403);
  });
  it('updates allowed settings and deletes only its own message', async () => {
    const empty = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });
    expect(
      (
        await app.fetch(`/api/v1/messages/${crypto.randomUUID()}`, {
          method: 'DELETE',
          headers: { ...a.auth, 'Content-Length': '0' },
          body: empty,
          duplex: 'half',
        } as RequestInit)
      ).status,
    ).toBe(404);
    expect(
      (
        await app.fetch(`/api/v1/messages/${ids[0]}`, {
          method: 'DELETE',
          headers: a.auth,
          body: 'unexpected',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await app.fetch(`/api/v1/profiles/${a.id}`, {
          method: 'PATCH',
          headers: { ...a.auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: 'বাংলা',
            is_disabled: true,
            retention_days: 7,
          }),
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await app.fetch(`/api/v1/messages/${ids[0]}`, {
          method: 'DELETE',
          headers: a.auth,
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await app.fetch(`/api/v1/messages/${ids[0]}`, {
          method: 'DELETE',
          headers: a.auth,
        })
      ).status,
    ).toBe(404);
  });
  it('excludes expired rows before cleanup and cascades profile deletion', async () => {
    await app.db
      .prepare(
        'UPDATE messages SET created_at=0,expires_at=1 WHERE profile_id=?',
      )
      .bind(a.id)
      .run();
    expect((await page('/api/v1/inbox')).messages).toHaveLength(0);
    expect(
      (
        await app.fetch(`/api/v1/profiles/${a.id}`, {
          method: 'DELETE',
          headers: a.auth,
        })
      ).status,
    ).toBe(200);
    expect((await app.fetch('/api/v1/recovery/owner-alpha')).status).toBe(404);
    expect(
      (
        await app.db
          .prepare(
            'SELECT COUNT(*) AS n FROM recovery_blobs WHERE profile_id=?',
          )
          .bind(a.id)
          .first<{ n: number }>()
      )?.n,
    ).toBe(0);
    expect((await page('/api/v1/inbox', b.auth)).messages).toHaveLength(1);
  });
});
