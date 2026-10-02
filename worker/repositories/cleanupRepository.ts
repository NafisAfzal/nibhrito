export interface CleanupRepository {
  cleanup(now: number): Promise<{ messages: number; buckets: number }>;
}
export class D1CleanupRepository implements CleanupRepository {
  constructor(private readonly db: D1Database) {}
  async cleanup(now: number) {
    const results = await this.db.batch([
      this.db
        .prepare(
          'DELETE FROM messages WHERE id IN (SELECT id FROM messages WHERE expires_at<=? ORDER BY expires_at LIMIT 100) RETURNING 1 AS changed',
        )
        .bind(now),
      this.db
        .prepare(
          'DELETE FROM rate_limit_buckets WHERE rowid IN (SELECT rowid FROM rate_limit_buckets WHERE expires_at<=? ORDER BY expires_at LIMIT 100) RETURNING 1 AS changed',
        )
        .bind(now),
    ]);
    return {
      messages: results[0]!.results.length,
      buckets: results[1]!.results.length,
    };
  }
}
