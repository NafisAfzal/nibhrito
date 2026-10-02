import {
  decode,
  encode,
  object,
  ValidationError,
} from '../../shared/protocol/encoding';
import { validatePoint } from '../../shared/protocol/envelope';
export { validatePoint as importPublicKey };
export const random = (length: number) =>
  crypto.getRandomValues(new Uint8Array(length));
export const fingerprint = async (raw: Uint8Array<ArrayBuffer>) =>
  encode(new Uint8Array(await crypto.subtle.digest('SHA-256', raw)));
export const tokenVerifier = async (token: string) =>
  fingerprint(decode(token, 32));
export function canonicalJwk(value: unknown): JsonWebKey {
  const data = object(value, ['kty', 'crv', 'x', 'y', 'd', 'ext', 'key_ops']);
  if (
    data['kty'] !== 'EC' ||
    data['crv'] !== 'P-256' ||
    data['ext'] !== true ||
    JSON.stringify(data['key_ops']) !== '["deriveBits"]'
  )
    throw new ValidationError();
  decode(data['x'], 32);
  decode(data['y'], 32);
  decode(data['d'], 32);
  return {
    kty: 'EC',
    crv: 'P-256',
    x: data['x'] as string,
    y: data['y'] as string,
    d: data['d'] as string,
    ext: true,
    key_ops: ['deriveBits'],
  };
}
export function rawFromJwk(jwk: JsonWebKey): Uint8Array<ArrayBuffer> {
  const raw = new Uint8Array(65);
  raw[0] = 4;
  raw.set(decode(jwk.x, 32), 1);
  raw.set(decode(jwk.y, 32), 33);
  return raw;
}
export async function generateRecipient() {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  const raw = new Uint8Array(
    await crypto.subtle.exportKey('raw', pair.publicKey),
  );
  const jwk = canonicalJwk(
    await crypto.subtle.exportKey('jwk', pair.privateKey),
  );
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  );
  return {
    publicKey: encode(raw),
    keyId: await fingerprint(raw),
    privateKey,
    jwk,
  };
}
export async function restorePrivate(value: unknown, keyId: string) {
  const jwk = canonicalJwk(value);
  const raw = rawFromJwk(jwk);
  if ((await fingerprint(raw)) !== keyId) throw new ValidationError();
  const publicKey = await validatePoint(encode(raw));
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  );
  const challenge = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits'],
  );
  const [a, b] = await Promise.all([
    crypto.subtle.deriveBits(
      { name: 'ECDH', public: challenge.publicKey },
      privateKey,
      256,
    ),
    crypto.subtle.deriveBits(
      { name: 'ECDH', public: publicKey },
      challenge.privateKey,
      256,
    ),
  ]);
  const x = new Uint8Array(a),
    y = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i]! ^ y[i]!;
  x.fill(0);
  y.fill(0);
  if (difference) throw new ValidationError();
  return { privateKey, publicKey: encode(raw) };
}
