import type { MessageEnvelope } from '../../shared/protocol/envelope';
import { HttpError } from '../security/request';
import {
  encodeCursor,
  type Cursor,
  type InboxPage,
} from '../../shared/schemas/inbox';
export interface MessageRepository {
  inbox(
    profileId: string,
    limit: number,
    cursor: Cursor | null,
    now: number,
  ): Promise<InboxPage>;
  remove(profileId: string, messageId: string): Promise<void>;
  submit(envelope: MessageEnvelope, now: number): Promise<boolean>;
}
export class D1MessageRepository implements MessageRepository {
  constructor(private readonly db: D1Database) {}
  async inbox(
    profileId: string,
    limit: number,
    cursor: Cursor | null,
    now: number,
  ): Promise<InboxPage> {
    const result = await this.db
      .prepare(
        'SELECT id,profile_slug,envelope_version AS v,key_id,ephemeral_pub,hkdf_salt,iv,ciphertext,created_at,expires_at FROM messages WHERE profile_id=? AND expires_at>? AND (? IS NULL OR created_at<? OR (created_at=? AND id<?)) ORDER BY created_at DESC,id DESC LIMIT ?',
      )
      .bind(
        profileId,
        now,
        cursor?.created_at ?? null,
        cursor?.created_at ?? null,
        cursor?.created_at ?? null,
        cursor?.id ?? null,
        limit + 1,
      )
      .all<
        MessageEnvelope & { id: string; created_at: number; expires_at: number }
      >();
    const page = result.results.slice(0, limit),
      last = page.at(-1);
    return {
      messages: page.map((row) => ({
        envelope: {
          v: row.v,
          message_id: row.id,
          profile_slug: row.profile_slug,
          key_id: row.key_id,
          ephemeral_pub: row.ephemeral_pub,
          hkdf_salt: row.hkdf_salt,
          iv: row.iv,
          ciphertext: row.ciphertext,
        },
        created_at: row.created_at,
        expires_at: row.expires_at,
      })),
      next_cursor:
        result.results.length > limit && last
          ? encodeCursor({
              created_at: last.created_at,
              id: last.id,
              profile_id: profileId,
            })
          : null,
    };
  }
  async remove(profileId: string, messageId: string) {
    const result = await this.db
      .prepare(
        'DELETE FROM messages WHERE id=? AND profile_id=? RETURNING 1 AS changed',
      )
      .bind(messageId, profileId)
      .first<{ changed: number }>();
    if (result?.changed !== 1)
      throw new HttpError(404, 'NOT_FOUND', 'Message not available.');
  }
  async submit(e: MessageEnvelope, now: number): Promise<boolean> {
    const inserted = await this.db
      .prepare(
        "INSERT INTO messages (id,profile_id,profile_slug,envelope_version,key_id,ephemeral_pub,hkdf_salt,iv,ciphertext,created_at,expires_at) SELECT ?,p.id,?, ?,?,?,?,?,?,?, ? + p.retention_days * 86400000 FROM profiles p WHERE p.slug=? AND p.current_key_id=? AND p.is_disabled=0 AND (SELECT value FROM storage_counters WHERE name='messages')<20000 AND (SELECT COUNT(*) FROM messages m WHERE m.profile_id=p.id AND m.expires_at>?)<500 ON CONFLICT(id) DO NOTHING RETURNING 1 AS changed",
      )
      .bind(
        e.message_id,
        e.profile_slug,
        e.v,
        e.key_id,
        e.ephemeral_pub,
        e.hkdf_salt,
        e.iv,
        e.ciphertext,
        now,
        now,
        e.profile_slug,
        e.key_id,
        now,
      )
      .first<{ changed: number }>();
    if (inserted?.changed === 1) {
      await this.db
        .prepare(
          'DELETE FROM messages WHERE id IN (SELECT id FROM messages WHERE profile_id=(SELECT id FROM profiles WHERE slug=?) AND expires_at<=? ORDER BY expires_at LIMIT 10)',
        )
        .bind(e.profile_slug, now)
        .run();
      return true;
    }
    const existing = await this.db
      .prepare(
        'SELECT id FROM messages WHERE id=? AND profile_slug=? AND envelope_version=? AND key_id=? AND ephemeral_pub=? AND hkdf_salt=? AND iv=? AND ciphertext=? AND expires_at>?',
      )
      .bind(
        e.message_id,
        e.profile_slug,
        e.v,
        e.key_id,
        e.ephemeral_pub,
        e.hkdf_salt,
        e.iv,
        e.ciphertext,
        now,
      )
      .first();
    if (existing) return false;
    const collision = await this.db
      .prepare('SELECT id FROM messages WHERE id=?')
      .bind(e.message_id)
      .first();
    if (collision)
      throw new HttpError(
        409,
        'DUPLICATE',
        'This message could not be accepted.',
      );
    throw new HttpError(
      429,
      'LIMITED',
      'This profile cannot accept messages right now. Try again later.',
    );
  }
}
