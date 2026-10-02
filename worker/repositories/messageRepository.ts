import type { MessageEnvelope } from '../../shared/protocol/envelope';
import { HttpError } from '../security/request';
export interface MessageRepository {
  submit(envelope: MessageEnvelope, now: number): Promise<boolean>;
}
export class D1MessageRepository implements MessageRepository {
  constructor(private readonly db: D1Database) {}
  async submit(e: MessageEnvelope, now: number): Promise<boolean> {
    const inserted = await this.db
      .prepare(
        'INSERT INTO messages (id,profile_id,profile_slug,envelope_version,key_id,ephemeral_pub,hkdf_salt,iv,ciphertext,created_at,expires_at) SELECT ?,p.id,?, ?,?,?,?,?,?,?, ? + p.retention_days * 86400000 FROM profiles p WHERE p.slug=? AND p.current_key_id=? AND p.is_disabled=0 AND (SELECT COUNT(*) FROM messages m WHERE m.profile_id=p.id AND m.expires_at>?)<500 ON CONFLICT(id) DO NOTHING',
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
      .run();
    if (inserted.meta.changes === 1) return true;
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
