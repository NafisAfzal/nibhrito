export interface RateRepository {
  consume(
    key: string,
    scope: string,
    now: number,
    windowMs: number,
    limit: number,
  ): Promise<boolean>;
}
export class D1RateRepository implements RateRepository {
  constructor(private readonly db: D1Database) {}
  async consume(
    key: string,
    scope: string,
    now: number,
    windowMs: number,
    limit: number,
  ) {
    const start = Math.floor(now / windowMs) * windowMs;
    const result = await this.db
      .prepare(
        'INSERT INTO rate_limit_buckets (bucket_key,scope,window_start,count,expires_at) SELECT ?,?,?,1,? WHERE CASE WHEN EXISTS (SELECT 1 FROM rate_limit_buckets WHERE bucket_key=? AND scope=? AND window_start=?) THEN 1 ELSE (SELECT COUNT(*) FROM (SELECT 1 FROM rate_limit_buckets LIMIT 2000))<2000 END ON CONFLICT(bucket_key,scope,window_start) DO UPDATE SET count=count+1 WHERE count<?',
      )
      .bind(
        key,
        scope,
        start,
        start + windowMs + 3600000,
        key,
        scope,
        start,
        limit,
      )
      .run();
    return result.meta.changes === 1;
  }
}
