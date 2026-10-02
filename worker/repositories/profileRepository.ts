import type {
  CreateProfile,
  PublicProfile,
} from '../../shared/schemas/profile';
import type { RecoveryEnvelope } from '../../shared/protocol/envelope';
import { HttpError } from '../security/request';
interface Row extends Omit<PublicProfile, 'is_disabled'> {
  is_disabled: number;
  owner_token_hash: string;
}
export interface ProfileRepository {
  create(input: CreateProfile, now: number): Promise<PublicProfile>;
  bySlug(slug: string): Promise<PublicProfile | null>;
  byVerifier(
    verifier: string,
  ): Promise<(PublicProfile & { owner_token_hash: string }) | null>;
  recovery(slug: string): Promise<RecoveryEnvelope | null>;
}
const publicRow = (row: Row): PublicProfile => ({
  id: row.id,
  slug: row.slug,
  display_name: row.display_name,
  public_prompt: row.public_prompt,
  theme: row.theme,
  retention_days: row.retention_days,
  current_key_id: row.current_key_id,
  is_disabled: row.is_disabled === 1,
  created_at: row.created_at,
  updated_at: row.updated_at,
});
export class D1ProfileRepository implements ProfileRepository {
  constructor(private readonly db: D1Database) {}
  async create(input: CreateProfile, now: number): Promise<PublicProfile> {
    const id = crypto.randomUUID(),
      b = input.recovery;
    const results = await this.db.batch([
      this.db
        .prepare(
          'INSERT INTO profiles (id,slug,display_name,public_prompt,theme,owner_token_hash,current_key_id,retention_days,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING',
        )
        .bind(
          id,
          input.slug,
          input.display_name,
          input.public_prompt,
          input.theme,
          input.owner_token_hash,
          input.current_key_id,
          input.retention_days,
          now,
          now,
        ),
      this.db
        .prepare(
          'INSERT INTO recovery_blobs (profile_id,version,key_id,hkdf_salt,iv,ciphertext,updated_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM profiles WHERE id=?)',
        )
        .bind(id, b.v, b.key_id, b.hkdf_salt, b.iv, b.ciphertext, now, id),
    ]);
    if (results[0]?.meta.changes !== 1)
      throw new HttpError(
        409,
        'CONFLICT',
        'This profile could not be created. Choose a different link name.',
      );
    return (await this.bySlug(input.slug))!;
  }
  async bySlug(slug: string) {
    const row = await this.db
      .prepare('SELECT * FROM profiles WHERE slug=?')
      .bind(slug)
      .first<Row>();
    return row ? publicRow(row) : null;
  }
  async byVerifier(verifier: string) {
    const row = await this.db
      .prepare('SELECT * FROM profiles WHERE owner_token_hash=?')
      .bind(verifier)
      .first<Row>();
    return row
      ? { ...publicRow(row), owner_token_hash: row.owner_token_hash }
      : null;
  }
  async recovery(slug: string) {
    return this.db
      .prepare(
        'SELECT r.version AS v,r.key_id,r.hkdf_salt,r.iv,r.ciphertext FROM recovery_blobs r JOIN profiles p ON p.id=r.profile_id WHERE p.slug=?',
      )
      .bind(slug)
      .first<RecoveryEnvelope>();
  }
}
