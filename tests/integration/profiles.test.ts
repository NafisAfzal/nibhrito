import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { harness } from './harness';
import {
  generateRecipient,
  random,
  tokenVerifier,
} from '../../src/crypto/keys';
import { encryptRecovery, recoveryCode } from '../../src/crypto/recovery';
import { encode } from '../../shared/protocol/encoding';
describe('profile API', () => {
  let app: Awaited<ReturnType<typeof harness>>,
    input: Record<string, unknown>,
    token: string,
    code: string;
  beforeAll(async () => {
    app = await harness();
    const key = await generateRecipient();
    token = encode(random(32));
    code = await recoveryCode();
    input = {
      slug: 'alice',
      display_name: 'আলিস',
      public_prompt: '<script>alert(1)</script>',
      theme: 'sage',
      retention_days: 30,
      current_key_id: key.keyId,
      owner_token_hash: await tokenVerifier(token),
      recovery: await encryptRecovery(
        {
          v: 1,
          profile_slug: 'alice',
          key_id: key.keyId,
          recipient_private_jwk: key.jwk,
          owner_token: token,
          created_at: new Date().toISOString(),
        },
        code,
      ),
    };
  });
  afterAll(async () => {
    await app.runtime.dispose();
  });
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    app.fetch('/api/v1/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  it('atomically creates only public metadata and encrypted recovery', async () => {
    const result = await post(input);
    expect(result.status).toBe(201);
    const data = (await result.json()) as { data: Record<string, unknown> };
    expect(data.data['slug']).toBe('alice');
    expect(data.data).not.toHaveProperty('owner_token_hash');
    const profile = await app.db
      .prepare('SELECT * FROM profiles WHERE slug=?')
      .bind('alice')
      .first();
    const blob = await app.db.prepare('SELECT * FROM recovery_blobs').first();
    const stored = JSON.stringify([profile, blob]);
    for (const secret of [
      token,
      code,
      code.slice(5, 48),
      'recipient_private_jwk',
    ])
      expect(stored.includes(secret)).toBe(false);
    expect((await post(input)).status).toBe(409);
  });
  it('public profile and recovery do not disclose owner authentication', async () => {
    const response = await app.fetch('/api/v1/profiles/alice');
    expect(response.status).toBe(200);
    expect((await response.text()).includes(token)).toBe(false);
    expect((await app.fetch('/api/v1/recovery/alice')).status).toBe(200);
    expect((await app.fetch('/api/v1/recovery/missing')).status).toBe(404);
  });
  it.each([undefined, 'Bearer invalid', 'Basic abc'])(
    'rejects malformed/absent bearer auth %s',
    async (auth) => {
      expect(
        (
          await app.fetch('/api/v1/owner', {
            headers: auth ? { Authorization: auth } : {},
          })
        ).status,
      ).toBe(401);
    },
  );
  it('owner token works; verifier and random token do not', async () => {
    expect(
      (
        await app.fetch('/api/v1/owner', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await app.fetch('/api/v1/owner', {
          headers: { Authorization: `Bearer ${input['owner_token_hash']}` },
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await app.fetch('/api/v1/owner', {
          headers: { Authorization: `Bearer ${encode(random(32))}` },
        })
      ).status,
    ).toBe(401);
  });
  it.each([
    { extra: true },
    { retention_days: 365 },
    { slug: '../../evil' },
    { current_key_id: 'bad' },
    { recovery: { v: 2 } },
    { display_name: 'x'.repeat(65) },
    { public_prompt: '🌿'.repeat(281) },
  ])('rejects malformed/unexpected input %#', async (change) => {
    expect(
      (
        await post({
          ...input,
          ...change,
          slug: 'valid-new',
          ...(change.slug ? { slug: change.slug } : {}),
        })
      ).status,
    ).toBe(400);
  });
  it('caps JSON byte size, invalid JSON/content type and cross-origin writes', async () => {
    expect(
      (
        await app.fetch('/api/v1/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'x'.repeat(17000),
        })
      ).status,
    ).toBe(413);
    expect(
      (
        await app.fetch('/api/v1/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{',
        })
      ).status,
    ).toBe(400);
    expect(
      (await app.fetch('/api/v1/profiles', { method: 'POST', body: 'test' }))
        .status,
    ).toBe(415);
    expect((await post(input, { Origin: 'https://evil.invalid' })).status).toBe(
      403,
    );
    expect(
      (
        await app.fetch('/api/v1/owner?profile=someone', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).status,
    ).toBe(400);
  });
});
