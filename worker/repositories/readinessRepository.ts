export interface ReadinessRepository {
  isReady(): Promise<boolean>;
}

export class D1ReadinessRepository implements ReadinessRepository {
  constructor(private readonly database: D1Database) {}

  async isReady(): Promise<boolean> {
    const result = await this.database
      .prepare(
        "SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?, ?)",
      )
      .bind('profiles', 'messages', 'recovery_blobs', 'rate_limit_buckets')
      .first<{ count: number }>();
    return result?.count === 4;
  }
}
