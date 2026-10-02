import { applyMigrations } from './migrations';
import { Miniflare } from 'miniflare';
import worker from '../../worker/index';
import type { Env } from '../../worker/types';
import { randomBytes } from 'node:crypto';
import { encode } from '../../shared/protocol/encoding';
export async function harness() {
  const runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch(){ return new Response("local test"); } }',
    compatibilityDate: '2026-07-30',
    d1Databases: { DB: 'api-test' },
    d1Persist: false,
  });
  const db = (await runtime.getD1Database('DB')) as unknown as D1Database;
  await applyMigrations(db);
  const env = {
    DB: db,
    APP_ENV: 'local',
    RATE_LIMIT_SECRET: encode(new Uint8Array(randomBytes(32))),
    CHALLENGE_ENABLED: 'false',
    ASSETS: { fetch: async () => new Response('asset') },
  } as unknown as Env;
  return {
    runtime,
    db,
    env,
    fetch: (path: string, init?: RequestInit) =>
      worker.fetch(new Request(`http://127.0.0.1${path}`, init), env),
  };
}
