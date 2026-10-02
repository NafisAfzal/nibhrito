import type { Env } from '../types';
import type { RateRepository } from '../repositories/rateRepository';
import { networkBucket, sourceNetwork } from '../security/network';
import { HttpError } from '../security/request';
export interface WriteLimits {
  creation(): Promise<void>;
  submission(slug: string): Promise<void>;
}
export async function rateLimit(
  request: Request,
  env: Env,
  repo: RateRepository,
  now = Date.now(),
): Promise<WriteLimits> {
  if (env.CHALLENGE_ENABLED !== 'false')
    throw new HttpError(503, 'UNAVAILABLE', 'Service temporarily unavailable.');
  const network = sourceNetwork(request, env);
  const bucket = await networkBucket(
    env.RATE_LIMIT_SECRET,
    network,
    'api',
    now,
  );
  async function consume(
    key: string,
    scope: string,
    windowMs: number,
    limit: number,
  ) {
    if (!(await repo.consume(key, scope, now, windowMs, limit)))
      throw new HttpError(
        429,
        'RATE_LIMITED',
        'Too many requests. Try again later.',
      );
  }
  // Fixed global buckets first bound amplification by attacker-controlled networks/slugs.
  await consume('global', 'api-day', 86400000, 20000);
  await consume(
    bucket,
    'api-network',
    3600000,
    env.APP_ENV === 'local' ? 5000 : 300,
  );
  return {
    async creation() {
      await consume('global', 'create-day', 86400000, 100);
      await consume(
        bucket,
        'create-network',
        3600000,
        env.APP_ENV === 'local' ? 100 : 3,
      );
    },
    async submission(slug: string) {
      await consume('global', 'send-day', 86400000, 3000);
      await consume(
        bucket,
        'send-network',
        3600000,
        env.APP_ENV === 'local' ? 300 : 30,
      );
      await consume(slug, 'send-profile', 60000, 10);
    },
  };
}
