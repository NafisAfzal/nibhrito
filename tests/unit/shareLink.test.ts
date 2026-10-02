import { describe, expect, it } from 'vitest';
import { generateRecipient } from '../../src/crypto/keys';
import { parseShareLink } from '../../src/crypto/shareLink';
describe('trusted share links', () => {
  it('binds the full fragment key to its profile', async () => {
    const key = await generateRecipient();
    const result = await parseShareLink(
      new URL(`https://local.invalid/u/alice#v=1&pk=${key.publicKey}`),
    );
    expect(result).toEqual({
      profileSlug: 'alice',
      publicKey: key.publicKey,
      keyId: key.keyId,
    });
  });
  it.each([
    '',
    '#v=2&pk=bad',
    '#pk=bad',
    '#v=1&pk=bad',
    '#v=1&pk=' + 'A'.repeat(87),
  ])('fails closed on %s', async (fragment) => {
    await expect(
      parseShareLink(new URL('https://local.invalid/u/alice' + fragment)),
    ).rejects.toThrow();
  });
  it('rejects duplicate/extra parameters, queries and invalid profile bindings', async () => {
    const key = await generateRecipient();
    for (const url of [
      `/u/alice#v=1&pk=${key.publicKey}&v=1`,
      `/u/alice#v=1&pk=${key.publicKey}&extra=1`,
      `/u/alice?key=1#v=1&pk=${key.publicKey}`,
      `/u/Alice#v=1&pk=${key.publicKey}`,
    ])
      await expect(
        parseShareLink(new URL(url, 'https://local.invalid')),
      ).rejects.toThrow();
  });
});
