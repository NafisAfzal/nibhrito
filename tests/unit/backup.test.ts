import { describe, expect, it } from 'vitest';
import { generateRecipient, random } from '../../src/crypto/keys';
import { recoveryCode, encryptRecovery } from '../../src/crypto/recovery';
import { encryptMessage } from '../../src/crypto/protocol';
import {
  openBackup,
  parseBackup,
  validateBackup,
  BACKUP_BYTE_LIMIT,
} from '../../src/crypto/backup';
import { encode, utf8, decode } from '../../shared/protocol/encoding';
async function archive() {
  const key = await generateRecipient(),
    code = await recoveryCode(),
    token = encode(random(32)),
    note = 'বাংলা secret archive <script>alert(1)</script>';
  const recovery = await encryptRecovery(
    {
      v: 1,
      profile_slug: 'archive-test',
      key_id: key.keyId,
      recipient_private_jwk: key.jwk,
      owner_token: token,
      created_at: new Date().toISOString(),
    },
    code,
  );
  const envelope = await encryptMessage(key.publicKey, 'archive-test', {
    type: 'message',
    text: note,
    client_created_at: new Date().toISOString(),
  });
  return {
    code,
    token,
    note,
    backup: validateBackup({
      format: 'nibhrito-encrypted-backup',
      version: 1,
      profile_slug: 'archive-test',
      recovery,
      messages: [{ envelope, created_at: 0, expires_at: 86400000 }],
    }),
  };
}
describe('local encrypted archive', () => {
  it('preserves only ciphertext and supports expired copies without uploading', async () => {
    const { code, token, note, backup } = await archive(),
      json = JSON.stringify(backup);
    for (const secret of [
      code,
      code.slice(5, 48),
      token,
      note,
      'recipient_private_jwk',
    ])
      expect(json.includes(secret)).toBe(false);
    const parsed = parseBackup(utf8.encode(json).buffer);
    expect(
      (await openBackup(parsed, code)).notes[0]?.plain?.text === note,
    ).toBe(true);
    await expect(openBackup(parsed, await recoveryCode())).rejects.toThrow();
  });
  it('rejects malformed/version/duplicate/profile/size metadata before decryption', async () => {
    const { backup } = await archive();
    for (const bad of [
      { ...backup, version: 2 },
      { ...backup, extra: 1 },
      { ...backup, profile_slug: 'wrong-profile' },
      { ...backup, messages: [backup.messages[0], backup.messages[0]] },
      { ...backup, messages: [{ ...backup.messages[0], expires_at: -1 }] },
    ])
      expect(() => validateBackup(bad)).toThrow();
    expect(() =>
      parseBackup(new Uint8Array(BACKUP_BYTE_LIMIT + 1).buffer),
    ).toThrow();
    expect(() => parseBackup(new Uint8Array([0xff]).buffer)).toThrow();
  });
  it('fails closed on corrupted recovery and individual message authentication', async () => {
    const { backup, code } = await archive();
    const change = (data: string) => {
      const bytes = decode(data, 16, 10000);
      bytes[0] = bytes[0]! ^ 1;
      return encode(bytes);
    };
    await expect(
      openBackup(
        {
          ...backup,
          recovery: {
            ...backup.recovery,
            ciphertext: change(backup.recovery.ciphertext),
          },
        },
        code,
      ),
    ).rejects.toThrow();
    const item = backup.messages[0]!;
    const opened = await openBackup(
      {
        ...backup,
        messages: [
          {
            ...item,
            envelope: {
              ...item.envelope,
              ciphertext: change(item.envelope.ciphertext),
            },
          },
        ],
      },
      code,
    );
    expect(opened.notes[0]?.plain).toBeNull();
  });
});
