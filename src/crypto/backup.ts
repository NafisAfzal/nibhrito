import {
  object,
  slug,
  utf8,
  ValidationError,
} from '../../shared/protocol/encoding';
import {
  messageEnvelope,
  recoveryEnvelope,
  type RecoveryEnvelope,
} from '../../shared/protocol/envelope';
import type { StoredMessage } from '../../shared/schemas/inbox';
import { decryptRecovery } from './recovery';
import { decryptMessage, type PlainMessage } from './protocol';
export const BACKUP_BYTE_LIMIT = 4 * 1024 * 1024;
export interface EncryptedBackup {
  format: 'nibhrito-encrypted-backup';
  version: 1;
  profile_slug: string;
  recovery: RecoveryEnvelope;
  messages: StoredMessage[];
}
export function validateBackup(value: unknown): EncryptedBackup {
  const data = object(value, [
    'format',
    'version',
    'profile_slug',
    'recovery',
    'messages',
  ]);
  if (
    data['format'] !== 'nibhrito-encrypted-backup' ||
    data['version'] !== 1 ||
    !Array.isArray(data['messages']) ||
    data['messages'].length > 500
  )
    throw new ValidationError();
  const profile = slug(data['profile_slug']),
    recovery = recoveryEnvelope(data['recovery']),
    ids = new Set<string>();
  const messages = (data['messages'] as unknown[]).map((item) => {
    const row = object(item, ['envelope', 'created_at', 'expires_at']),
      envelope = messageEnvelope(row['envelope']);
    if (
      envelope.profile_slug !== profile ||
      envelope.key_id !== recovery.key_id ||
      ids.has(envelope.message_id) ||
      !Number.isSafeInteger(row['created_at']) ||
      !Number.isSafeInteger(row['expires_at']) ||
      Number(row['created_at']) < 0 ||
      Number(row['expires_at']) > 8640000000000000 ||
      Number(row['expires_at']) <= Number(row['created_at']) ||
      Number(row['expires_at']) - Number(row['created_at']) > 90 * 86400000
    )
      throw new ValidationError();
    ids.add(envelope.message_id);
    return {
      envelope,
      created_at: Number(row['created_at']),
      expires_at: Number(row['expires_at']),
    };
  });
  const result: EncryptedBackup = {
    format: 'nibhrito-encrypted-backup',
    version: 1,
    profile_slug: profile,
    recovery,
    messages,
  };
  if (utf8.encode(JSON.stringify(result)).byteLength > BACKUP_BYTE_LIMIT)
    throw new ValidationError();
  return result;
}
export function parseBackup(bytes: ArrayBuffer): EncryptedBackup {
  if (bytes.byteLength > BACKUP_BYTE_LIMIT) throw new ValidationError();
  return validateBackup(
    JSON.parse(
      new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes),
    ) as unknown,
  );
}
export async function openBackup(
  value: unknown,
  code: string,
): Promise<{
  profile: string;
  notes: {
    id: string;
    plain: PlainMessage | null;
    created_at: number;
    expires_at: number;
  }[];
}> {
  const backup = validateBackup(value),
    restored = await decryptRecovery(
      backup.recovery,
      backup.profile_slug,
      code,
    ),
    keys = new Map([[restored.keyId, restored.privateKey]]);
  const notes = [];
  // Sequential decryption caps outstanding work for a user-controlled local file.
  for (const note of backup.messages) {
    let plain: PlainMessage | null = null;
    try {
      plain = await decryptMessage(note.envelope, backup.profile_slug, keys);
    } catch {
      /* Corruption never exposes partial text. */
    }
    notes.push({
      id: note.envelope.message_id,
      plain,
      created_at: note.created_at,
      expires_at: note.expires_at,
    });
  }
  return { profile: backup.profile_slug, notes };
}
