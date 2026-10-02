import { readFile, readdir } from 'node:fs/promises';
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
  const dir = new URL('../../migrations/', import.meta.url);
  for (const name of (await readdir(dir))
    .filter((n) => n.endsWith('.sql'))
    .sort()) {
    const sql = await readFile(new URL(name, dir), 'utf8');
    await db.batch(
      sql
        .replace(/^--.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => db.prepare(s)),
    );
  }
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
