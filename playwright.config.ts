import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8788',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'npm run local:init && npm run db:migrate:local && wrangler dev --local --ip 127.0.0.1 --port 8788',
    url: 'http://127.0.0.1:8788/api/v1/health',
    reuseExistingServer: false,
    timeout: 60000,
    env: { WRANGLER_SEND_METRICS: 'false' },
  },
});
