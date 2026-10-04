import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Explicit extra gate for a machine with Edge installed. Do not replace any of
// the portable mandatory engines, reuse a personal browser profile, or add retries.
export default defineConfig({
  ...base,
  projects: [
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
