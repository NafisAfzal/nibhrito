import { deriveAes } from '../crypto/protocol';
import { random } from '../crypto/keys';
export async function supportsCrypto(): Promise<boolean> {
  try {
    if (
      !window.isSecureContext ||
      !globalThis.crypto?.subtle ||
      !globalThis.indexedDB
    )
      return false;
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveBits'],
    );
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: 'ECDH', public: pair.publicKey },
        pair.privateKey,
        256,
      ),
    );
    const key = await deriveAes(bits, random(32), 'message');
    bits.fill(0);
    const iv = random(12),
      data = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        key,
        new Uint8Array(),
      );
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      data,
    );
    return true;
  } catch {
    return false;
  }
}
