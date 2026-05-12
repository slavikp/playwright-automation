// Re-exported as `test` — VS Code Playwright extension traces this back to @playwright/test
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { GamesPage } from '../pages/GamesPage';
import { ApiClient } from '../utils/ApiClient';
import { TestDataGenerator } from '../utils/TestDataGenerator';

export type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  dashboardPage: DashboardPage;
  gamesPage: GamesPage;
  api: ApiClient;
  testData: typeof TestDataGenerator;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  gamesPage: async ({ page }, use) => {
    await use(new GamesPage(page));
  },

  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  testData: async ({}, use) => {
    await use(TestDataGenerator);
  },
});

export { expect };
