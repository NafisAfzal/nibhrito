import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import {
  generateRecipient,
  random,
  tokenVerifier,
} from '../../src/crypto/keys';
import { encryptRecovery, recoveryCode } from '../../src/crypto/recovery';
import { encryptMessage, decryptMessage } from '../../src/crypto/protocol';
import { encode } from '../../shared/protocol/encoding';
import type { MessageEnvelope } from '../../shared/protocol/envelope';
describe('encrypted submission', () => {
  let app: Awaited<ReturnType<typeof harness>>,
    key: Awaited<ReturnType<typeof generateRecipient>>,
    envelope: MessageEnvelope;
  const note = 'বাংলা 🌿 <img src=x onerror=alert(1)> private note';
  beforeAll(async () => {
    app = await harness();
    key = await generateRecipient();
    const token = encode(random(32));
    const recovery = await encryptRecovery(
      {
        v: 1,
        profile_slug: 'sender-test',
        key_id: key.keyId,
        recipient_private_jwk: key.jwk,
        owner_token: token,
        created_at: new Date().toISOString(),
      },
      await recoveryCode(),
    );
    expect(
      (
        await app.fetch('/api/v1/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: 'sender-test',
            display_name: 'Test',
            public_prompt: '',
            theme: 'sage',
            retention_days: 7,
            current_key_id: key.keyId,
            owner_token_hash: await tokenVerifier(token),
            recovery,
          }),
        })
      ).status,
    ).toBe(201);
    envelope = await encryptMessage(key.publicKey, 'sender-test', {
      type: 'message',
      text: note,
      client_created_at: new Date().toISOString(),
    });
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  const post = (body: unknown, name = 'sender-test') =>
    app.fetch(`/api/v1/profiles/${name}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  it('stores only ciphertext, calculates expiry server-side, and decrypts locally', async () => {
    expect((await post(envelope)).status).toBe(201);
    const row = await app.db
      .prepare('SELECT * FROM messages')
      .first<Record<string, unknown>>();
    expect(row).not.toBeNull();
    expect(JSON.stringify(row).includes(note)).toBe(false);
    expect(Number(row?.['expires_at']) - Number(row?.['created_at'])).toBe(
      7 * 86400000,
    );
    expect(
      await decryptMessage(
        envelope,
        'sender-test',
        new Map([[key.keyId, key.privateKey]]),
      ),
    ).toMatchObject({ text: note });
  });
  it('acknowledges identical retry once and rejects conflicting ID reuse', async () => {
    expect((await post(envelope)).status).toBe(200);
    const fresh = await encryptMessage(key.publicKey, 'sender-test', {
      type: 'message',
      text: 'different',
      client_created_at: new Date().toISOString(),
    });
    expect(
      (await post({ ...fresh, message_id: envelope.message_id })).status,
    ).toBe(409);
    expect(
      (
        await app.db
          .prepare('SELECT COUNT(*) AS n FROM messages')
          .first<{ n: number }>()
      )?.n,
    ).toBe(1);
  });
  it.each([
    { v: 2 },
    { owner_id: 'fake' },
    { iv: 'bad' },
    { ephemeral_pub: 'A'.repeat(87) },
    { key_id: encode(random(32)) },
    { profile_slug: 'someone-else' },
    { created_at: 0 },
  ])('rejects malformed or substituted envelope %#', async (change) => {
    expect((await post({ ...envelope, ...change })).status).toBe(400);
  });
  it('rejects malformed JSON, oversized requests, expired retries and disabled profiles', async () => {
    for (const [body, status] of [
      ['{', 400],
      ['x'.repeat(13000), 413],
    ] as const)
      expect(
        (
          await app.fetch('/api/v1/profiles/sender-test/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          })
        ).status,
      ).toBe(status);
    await app.db.prepare('UPDATE messages SET created_at=0,expires_at=1').run();
    expect((await post(envelope)).status).toBe(409);
    await app.db.prepare('UPDATE profiles SET is_disabled=1').run();
    expect((await post(envelope)).status).toBe(404);
  });
});
