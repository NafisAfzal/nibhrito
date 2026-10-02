import { createECDH, createHash, hkdfSync, createCipheriv } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decode, encode, utf8 } from '../../shared/protocol/encoding';
import { messageEnvelope } from '../../shared/protocol/envelope';
import {
  generateRecipient,
  fingerprint,
  restorePrivate,
} from '../../src/crypto/keys';
import {
  aad,
  canonicalMessage,
  encryptMessage,
  decryptMessage,
} from '../../src/crypto/protocol';
import {
  recoveryCode,
  parseRecoveryCode,
  encryptRecovery,
  decryptRecovery,
} from '../../src/crypto/recovery';

const date = '2026-10-03T00:00:00.000Z';
const message = (text = 'হ্যালো 🌿 — thoughtful feedback') => ({
  type: 'message' as const,
  text,
  client_created_at: date,
});
const alter = (s: string, index = 0) => {
  const bytes = decode(s, 1, 9000);
  bytes[index] = bytes[index]! ^ 1;
  return encode(bytes);
};
describe('v1 crypto', () => {
  it('canonical encoding and AAD vectors', () => {
    expect(encode(new Uint8Array([0, 255, 254]))).toBe('AP_-');
    expect([...decode('AP_-', 3)]).toEqual([0, 255, 254]);
    expect(
      new TextDecoder().decode(
        aad('alice', '00000000-0000-4000-8000-000000000000', 'A'.repeat(43)),
      ),
    ).toBe(
      `nibhrito:v1|profile=alice|message=00000000-0000-4000-8000-000000000000|key=${'A'.repeat(43)}`,
    );
  });
  it.each(['A', 'AB', 'AP_=', 'AP/+', ' AP_-', 'AP_-\n', '💥'])(
    'rejects malformed base64url %s',
    (value) => {
      expect(() => decode(value, 3)).toThrow();
    },
  );
  it('decrypts an independent deterministic Node OpenSSL vector', async () => {
    // Public deterministic test scalars 1 and 2; NEVER use these keys outside tests.
    const recipient = createECDH('prime256v1'),
      sender = createECDH('prime256v1');
    const d = new Uint8Array(32);
    d[31] = 1;
    recipient.setPrivateKey(d);
    d[31] = 2;
    sender.setPrivateKey(d);
    const raw = new Uint8Array(recipient.getPublicKey());
    const id = '00000000-0000-4000-8000-000000000000';
    const keyId = createHash('sha256').update(raw).digest('base64url');
    expect(await fingerprint(raw)).toBe(keyId);
    const salt = new Uint8Array(32).map((_, i) => i),
      iv = new Uint8Array(12).map((_, i) => i);
    const aes = hkdfSync(
      'sha256',
      sender.computeSecret(recipient.getPublicKey()),
      salt,
      Buffer.from('nibhrito:v1:message'),
      32,
    );
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(aes), iv);
    cipher.setAAD(
      Buffer.from(`nibhrito:v1|profile=alice|message=${id}|key=${keyId}`),
    );
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(message()), 'utf8'),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    d[31] = 1;
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: encode(raw.slice(1, 33)),
      y: encode(raw.slice(33)),
      d: encode(d),
      ext: true,
      key_ops: ['deriveBits'],
    };
    const { privateKey } = await restorePrivate(jwk, keyId);
    const envelope = {
      v: 1,
      message_id: id,
      profile_slug: 'alice',
      key_id: keyId,
      ephemeral_pub: encode(new Uint8Array(sender.getPublicKey())),
      hkdf_salt: encode(salt),
      iv: encode(iv),
      ciphertext: ciphertext.toString('base64url'),
    };
    expect(
      await decryptMessage(envelope, 'alice', new Map([[keyId, privateKey]])),
    ).toEqual(message());
    expect(privateKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('jwk', privateKey)).rejects.toThrow();
  });
  it.each([
    'English',
    'বাংলা ভাষায় সুন্দর কথা',
    'emoji 🙂🌿',
    'Mixed বাংলা and English',
    '<img src=x onerror=alert(1)>',
  ])('round trip %s', async (text) => {
    const recipient = await generateRecipient();
    const envelope = await encryptMessage(
      recipient.publicKey,
      'alice',
      message(text),
    );
    expect(
      await decryptMessage(
        envelope,
        'alice',
        new Map([[recipient.keyId, recipient.privateKey]]),
      ),
    ).toEqual(message(text));
  });
  it('fresh ephemeral key, salt, IV and ciphertext for repeated plaintext', async () => {
    const recipient = await generateRecipient();
    const a = await encryptMessage(recipient.publicKey, 'alice', message());
    const b = await encryptMessage(recipient.publicKey, 'alice', message());
    for (const field of [
      'ephemeral_pub',
      'hkdf_salt',
      'iv',
      'ciphertext',
      'message_id',
    ] as const)
      expect(a[field]).not.toBe(b[field]);
  });
  it('serialized 4096-byte boundary and one byte over', async () => {
    const overhead = utf8.encode(JSON.stringify(message(''))).length;
    const largest = message('x'.repeat(4096 - overhead));
    expect(utf8.encode(JSON.stringify(canonicalMessage(largest))).length).toBe(
      4096,
    );
    const recipient = await generateRecipient();
    const e = await encryptMessage(recipient.publicKey, 'alice', largest);
    expect(
      (
        await decryptMessage(
          e,
          'alice',
          new Map([[recipient.keyId, recipient.privateKey]]),
        )
      ).text,
    ).toBe(largest.text);
    await expect(
      encryptMessage(recipient.publicKey, 'alice', message(largest.text + 'x')),
    ).rejects.toThrow();
  });
  it.each(['', ' \n\t', '\ud800'])(
    'rejects empty/invalid Unicode %j',
    (text) => {
      expect(() => canonicalMessage(message(text))).toThrow();
    },
  );
  it.each([
    'ciphertext',
    'tag',
    'iv',
    'hkdf_salt',
    'ephemeral_pub',
    'profile_slug',
    'message_id',
    'key_id',
    'version',
    'unknown',
  ])('tampering fails closed: %s', async (field) => {
    const r = await generateRecipient(),
      e = await encryptMessage(r.publicKey, 'alice', message());
    const changed: Record<string, unknown> = { ...e };
    if (field === 'tag')
      changed['ciphertext'] = alter(
        e.ciphertext,
        decode(e.ciphertext, 16, 4112).length - 1,
      );
    else if (
      ['ciphertext', 'iv', 'hkdf_salt', 'ephemeral_pub', 'key_id'].includes(
        field,
      )
    )
      changed[field] = alter(e[field as keyof typeof e] as string);
    else if (field === 'profile_slug') changed[field] = 'bob';
    else if (field === 'message_id') changed[field] = crypto.randomUUID();
    else if (field === 'version') changed['v'] = 2;
    else changed['unexpected'] = true;
    await expect(
      decryptMessage(changed, 'alice', new Map([[r.keyId, r.privateKey]])),
    ).rejects.toThrow('could not be authenticated');
  });
  it('rejects wrong recipient, malformed envelope and invalid points', async () => {
    const a = await generateRecipient(),
      b = await generateRecipient(),
      e = await encryptMessage(a.publicKey, 'alice', message());
    await expect(
      decryptMessage(e, 'alice', new Map([[a.keyId, b.privateKey]])),
    ).rejects.toThrow();
    expect(() => messageEnvelope({})).toThrow();
    await expect(
      encryptMessage(encode(new Uint8Array(65)), 'alice', message()),
    ).rejects.toThrow();
    const offCurve = new Uint8Array(65);
    offCurve[0] = 4;
    await expect(
      encryptMessage(encode(offCurve), 'alice', message()),
    ).rejects.toThrow();
  });
  it('recovery checksum fixed vector, round trip and non-extractable restored key', async () => {
    const secret = new Uint8Array(32);
    const code = await recoveryCode(secret);
    expect(code).toBe(
      `NBR1-${'A'.repeat(43)}-${encode(new Uint8Array(createHash('sha256').update(secret).digest()).slice(0, 6))}`,
    );
    expect(await parseRecoveryCode(code)).toEqual(secret);
    const r = await generateRecipient(),
      token = encode(crypto.getRandomValues(new Uint8Array(32)));
    const blob = await encryptRecovery(
      {
        v: 1,
        profile_slug: 'alice',
        key_id: r.keyId,
        recipient_private_jwk: r.jwk,
        owner_token: token,
        created_at: date,
      },
      code,
    );
    const restored = await decryptRecovery(blob, 'alice', code);
    expect(restored.ownerToken).toBe(token);
    expect(restored.privateKey.extractable).toBe(false);
    const e = await encryptMessage(r.publicKey, 'alice', message());
    expect(
      await decryptMessage(
        e,
        'alice',
        new Map([[r.keyId, restored.privateKey]]),
      ),
    ).toEqual(message());
    await expect(
      decryptRecovery(blob, 'alice', await recoveryCode()),
    ).rejects.toThrow();
    await expect(
      decryptRecovery(
        { ...blob, ciphertext: alter(blob.ciphertext) },
        'alice',
        code,
      ),
    ).rejects.toThrow();
    await expect(decryptRecovery(blob, 'other', code)).rejects.toThrow();
    await expect(parseRecoveryCode(code.slice(0, -1) + '!')).rejects.toThrow();
    const other = await generateRecipient();
    await expect(
      restorePrivate({ ...r.jwk, d: other.jwk.d }, r.keyId),
    ).rejects.toThrow();
  });
});
