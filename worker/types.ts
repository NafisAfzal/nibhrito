export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ENV: 'local' | 'production';
  RATE_LIMIT_SECRET: string;
  CHALLENGE_ENABLED: 'false';
}
