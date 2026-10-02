import {
  decode,
  decodeUtf8,
  encode,
  object,
  slug,
  text,
  timestamp,
  utf8,
  uuid,
  ValidationError,
} from '../../shared/protocol/encoding';
import {
  messageEnvelope,
  type MessageEnvelope,
  validatePoint,
} from '../../shared/protocol/envelope';
import { fingerprint, random } from './keys';
export interface PlainMessage {
  type: 'message';
  text: string;
  mood?: 'constructive' | 'appreciation' | 'question';
  client_created_at: string;
}
export function canonicalMessage(value: unknown): PlainMessage {
  const data = object(value, ['type', 'text', 'mood', 'client_created_at']);
  if (
    data['type'] !== 'message' ||
    (data['mood'] !== undefined &&
      !['constructive', 'appreciation', 'question'].includes(
        data['mood'] as string,
      ))
  )
    throw new ValidationError();
  const result: PlainMessage = {
    type: 'message',
    text: text(data['text'], 4096, 4096),
    ...(data['mood'] === undefined
      ? {}
      : { mood: data['mood'] as PlainMessage['mood'] & string }),
    client_created_at: timestamp(data['client_created_at']),
  };
  if (utf8.encode(JSON.stringify(result)).length > 4096)
    throw new ValidationError();
  return result;
}
export function aad(
  profile: string,
  id: string,
  keyId: string,
): Uint8Array<ArrayBuffer> {
  slug(profile);
  uuid(id);
  decode(keyId, 32);
  return utf8.encode(
    `nibhrito:v1|profile=${profile}|message=${id}|key=${keyId}`,
  );
}
export async function deriveAes(
  material: Uint8Array<ArrayBuffer>,
  salt: Uint8Array<ArrayBuffer>,
  purpose: 'message' | 'recovery',
) {
  const base = await crypto.subtle.importKey('raw', material, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: utf8.encode(`nibhrito:v1:${purpose}`),
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}
async function messageKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  salt: Uint8Array<ArrayBuffer>,
) {
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: publicKey },
      privateKey,
      256,
    ),
  );
  try {
    return await deriveAes(bits, salt, 'message');
  } finally {
    bits.fill(0);
  }
}
export async function encryptMessage(
  publicEncoded: string,
  profile: string,
  value: unknown,
): Promise<MessageEnvelope> {
  const plaintext = canonicalMessage(value);
  slug(profile);
  const recipient = await validatePoint(publicEncoded);
  const keyId = await fingerprint(decode(publicEncoded, 65));
  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  );
  const salt = random(32),
    iv = random(12),
    id = crypto.randomUUID();
  const key = await messageKey(ephemeral.privateKey, recipient, salt);
  const bytes = utf8.encode(JSON.stringify(plaintext));
  let ciphertext: ArrayBuffer;
  try {
    ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: aad(profile, id, keyId),
        tagLength: 128,
      },
      key,
      bytes,
    );
  } finally {
    bytes.fill(0);
  }
  return {
    v: 1,
    message_id: id,
    profile_slug: profile,
    key_id: keyId,
    ephemeral_pub: encode(
      new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey)),
    ),
    hkdf_salt: encode(salt),
    iv: encode(iv),
    ciphertext: encode(new Uint8Array(ciphertext)),
  };
}
export interface Keyring {
  get(keyId: string): CryptoKey | undefined;
}
export async function decryptMessage(
  value: unknown,
  profile: string,
  keyring: Keyring,
): Promise<PlainMessage> {
  try {
    const envelope = messageEnvelope(value);
    if (envelope.profile_slug !== slug(profile)) throw new ValidationError();
    const privateKey = keyring.get(envelope.key_id);
    if (!privateKey) throw new ValidationError();
    const key = await messageKey(
      privateKey,
      await validatePoint(envelope.ephemeral_pub),
      decode(envelope.hkdf_salt, 32),
    );
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: decode(envelope.iv, 12),
        additionalData: aad(profile, envelope.message_id, envelope.key_id),
        tagLength: 128,
      },
      key,
      decode(envelope.ciphertext, 16, 4112),
    );
    try {
      return canonicalMessage(JSON.parse(decodeUtf8(plaintext)) as unknown);
    } finally {
      new Uint8Array(plaintext).fill(0);
    }
  } catch {
    throw new Error('Message could not be authenticated or decrypted.');
  }
}
