import {
  decode,
  decodeUtf8,
  encode,
  object,
  slug,
  timestamp,
  utf8,
  ValidationError,
} from '../../shared/protocol/encoding';
import {
  recoveryEnvelope,
  type RecoveryEnvelope,
} from '../../shared/protocol/envelope';
import { canonicalJwk, random, restorePrivate } from './keys';
import { deriveAes } from './protocol';
export interface RecoveryPayload {
  v: 1;
  profile_slug: string;
  key_id: string;
  recipient_private_jwk: JsonWebKey;
  owner_token: string;
  created_at: string;
}
const checksum = async (secret: Uint8Array<ArrayBuffer>) =>
  encode(
    new Uint8Array(await crypto.subtle.digest('SHA-256', secret)).slice(0, 6),
  );
export async function recoveryCode(secret = random(32)) {
  return `NBR1-${encode(secret)}-${await checksum(secret)}`;
}
export async function parseRecoveryCode(code: string) {
  if (!/^NBR1-[A-Za-z0-9_-]{43}-[A-Za-z0-9_-]{8}$/.test(code))
    throw new ValidationError();
  const secret = decode(code.slice(5, 48), 32);
  if ((await checksum(secret)) !== code.slice(49)) {
    secret.fill(0);
    throw new ValidationError();
  }
  return secret;
}
function payload(value: unknown): RecoveryPayload {
  const data = object(value, [
    'v',
    'profile_slug',
    'key_id',
    'recipient_private_jwk',
    'owner_token',
    'created_at',
  ]);
  if (data['v'] !== 1) throw new ValidationError();
  decode(data['key_id'], 32);
  decode(data['owner_token'], 32);
  return {
    v: 1,
    profile_slug: slug(data['profile_slug']),
    key_id: data['key_id'] as string,
    recipient_private_jwk: canonicalJwk(data['recipient_private_jwk']),
    owner_token: data['owner_token'] as string,
    created_at: timestamp(data['created_at']),
  };
}
const recoveryAad = (profile: string, keyId: string) => {
  slug(profile);
  decode(keyId, 32);
  return utf8.encode(`nibhrito:v1:recovery|profile=${profile}|key=${keyId}`);
};
export async function encryptRecovery(
  value: RecoveryPayload,
  code: string,
): Promise<RecoveryEnvelope> {
  const data = payload(value),
    bytes = utf8.encode(JSON.stringify(data));
  let secret: Uint8Array<ArrayBuffer> | undefined;
  try {
    if (bytes.length > 8192) throw new ValidationError();
    secret = await parseRecoveryCode(code);
    const salt = random(32),
      iv = random(12);
    const key = await deriveAes(secret, salt, 'recovery');
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: recoveryAad(data.profile_slug, data.key_id),
        tagLength: 128,
      },
      key,
      bytes,
    );
    return {
      v: 1,
      key_id: data.key_id,
      hkdf_salt: encode(salt),
      iv: encode(iv),
      ciphertext: encode(new Uint8Array(encrypted)),
    };
  } finally {
    secret?.fill(0);
    bytes.fill(0);
  }
}
export async function decryptRecovery(
  value: unknown,
  profile: string,
  code: string,
) {
  try {
    const envelope = recoveryEnvelope(value),
      secret = await parseRecoveryCode(code);
    try {
      const key = await deriveAes(
        secret,
        decode(envelope.hkdf_salt, 32),
        'recovery',
      );
      const bytes = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: decode(envelope.iv, 12),
          additionalData: recoveryAad(profile, envelope.key_id),
          tagLength: 128,
        },
        key,
        decode(envelope.ciphertext, 16, 8208),
      );
      let data: RecoveryPayload;
      try {
        data = payload(JSON.parse(decodeUtf8(bytes)) as unknown);
      } finally {
        new Uint8Array(bytes).fill(0);
      }
      if (data.profile_slug !== profile || data.key_id !== envelope.key_id)
        throw new ValidationError();
      const restored = await restorePrivate(
        data.recipient_private_jwk,
        data.key_id,
      );
      return {
        profileSlug: profile,
        keyId: data.key_id,
        ownerToken: data.owner_token,
        ...restored,
      };
    } finally {
      secret.fill(0);
    }
  } catch {
    throw new Error(
      'Recovery could not be authenticated. Check the profile and recovery code.',
    );
  }
}
