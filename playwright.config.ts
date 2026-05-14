import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific .env file, then fall back to base .env
const env = process.env.ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail CI if test.only is left in source
  forbidOnly: !!process.env.CI,

  // Retry on CI, no retries locally
  retries: process.env.CI ? 2 : 0,

  // Workers: CI gets 4 to avoid resource contention; locally uncapped
  workers: process.env.CI ? 4 : undefined,

  // Global timeout per test
  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://playonkansas.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: false,
  },

  projects: [
    // ── Auth setup — opens a headed browser for manual login, then saves session ─
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
      use: { headless: false },
    },

    // ── Chromium — always runs; setup provides .auth/user.json for authenticated tests ─
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // ── Additional browsers — CI only ─────────────────────────────────────────
    ...(process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
        dependencies: ['setup'],
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
        dependencies: ['setup'],
      },
      {
        name: 'mobile-chrome',
        use: { ...devices['Pixel 7'] },
        dependencies: ['setup'],
      },
      {
        name: 'mobile-safari',
        use: { ...devices['iPhone 14'] },
        dependencies: ['setup'],
      },
    ] : []),

    // ── API-only project (no browser) ─────────────────────────────────────────
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL || process.env.BASE_URL || 'https://playonkansas.com',
      },
    },
  ],

  outputDir: 'test-results',
});
