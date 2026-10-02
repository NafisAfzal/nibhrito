import { decode, object, slug, uuid, ValidationError } from './encoding';
export interface RecoveryEnvelope {
  v: 1;
  key_id: string;
  hkdf_salt: string;
  iv: string;
  ciphertext: string;
}
export interface MessageEnvelope extends RecoveryEnvelope {
  message_id: string;
  profile_slug: string;
  ephemeral_pub: string;
}
const recoveryFields = [
  'v',
  'key_id',
  'hkdf_salt',
  'iv',
  'ciphertext',
] as const;
export function recoveryEnvelope(value: unknown): RecoveryEnvelope {
  return validate(value, recoveryFields, 8192 + 16) as RecoveryEnvelope;
}
function validate(
  value: unknown,
  fields: readonly string[],
  max: number,
): unknown {
  const data = object(value, fields);
  if (fields.some((k) => !(k in data)) || data['v'] !== 1)
    throw new ValidationError();
  decode(data['key_id'], 32);
  decode(data['hkdf_salt'], 32);
  decode(data['iv'], 12);
  decode(data['ciphertext'], 16, max);
  return data;
}
export function messageEnvelope(value: unknown): MessageEnvelope {
  const data = validate(
    value,
    [...recoveryFields, 'message_id', 'profile_slug', 'ephemeral_pub'],
    4096 + 16,
  ) as Record<string, unknown>;
  uuid(data['message_id']);
  slug(data['profile_slug']);
  if (decode(data['ephemeral_pub'], 65)[0] !== 4) throw new ValidationError();
  return data as unknown as MessageEnvelope;
}
export async function validatePoint(encoded: string): Promise<CryptoKey> {
  const raw = decode(encoded, 65);
  if (raw[0] !== 4) throw new ValidationError();
  try {
    return await crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      [],
    );
  } catch {
    throw new ValidationError();
  }
}
