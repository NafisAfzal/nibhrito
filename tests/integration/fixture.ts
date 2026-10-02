import {
  generateRecipient,
  random,
  tokenVerifier,
} from '../../src/crypto/keys';
import { encryptRecovery, recoveryCode } from '../../src/crypto/recovery';
import { encryptMessage } from '../../src/crypto/protocol';
import { encode } from '../../shared/protocol/encoding';
import type { harness } from './harness';
export async function fixture(
  app: Awaited<ReturnType<typeof harness>>,
  slug: string,
) {
  const key = await generateRecipient(),
    token = encode(random(32));
  const recovery = await encryptRecovery(
    {
      v: 1,
      profile_slug: slug,
      key_id: key.keyId,
      recipient_private_jwk: key.jwk,
      owner_token: token,
      created_at: new Date().toISOString(),
    },
    await recoveryCode(),
  );
  const response = await app.fetch('/api/v1/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      display_name: slug,
      public_prompt: '',
      theme: 'sage',
      retention_days: 1,
      current_key_id: key.keyId,
      owner_token_hash: await tokenVerifier(token),
      recovery,
    }),
  });
  if (response.status !== 201) throw new Error('Test profile creation failed.');
  const result = (await response.json()) as { data: { id: string } };
  return {
    ...key,
    token,
    id: result.data.id,
    auth: { Authorization: `Bearer ${token}` },
    envelope: (text = 'private test message') =>
      encryptMessage(key.publicKey, slug, {
        type: 'message',
        text,
        client_created_at: new Date().toISOString(),
      }),
  };
}
