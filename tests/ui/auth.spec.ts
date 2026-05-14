import { test, expect } from '../../fixtures';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
    });

    test('should display login form', async ({ loginPage }) => {
      await loginPage.assertLoginFormVisible();
    });

    test('should navigate to forgot password page', async ({ loginPage, page }) => {
      await loginPage.clickForgotPassword();
      await expect(page).toHaveURL(/reset-credentials|forgot|password/i, { timeout: 15_000 });
    });

    test('should navigate to register page', async ({ loginPage, page }) => {
      await loginPage.clickRegister();
      await expect(page).toHaveURL(/registration|register/i, { timeout: 15_000 });
    });
  });

  test.describe('Registration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should show validation errors for empty submission', async ({ page }) => {
      await page.getByRole('button', { name: /register|sign up|submit/i }).click();
      await expect(page.getByRole('alert').or(page.locator('[class*="error"]').first())).toBeVisible();
    });
  });

  test.describe('Authenticated session', () => {
    test.use({ storageState: AUTH_FILE });

    test('homepage should not show Sign In button when logged in', async ({ page, homePage }) => {
      await homePage.goto();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeHidden({ timeout: 10_000 });
    });

    test('authenticated pages should be accessible without redirect to login', async ({ page }) => {
      await page.goto('/enter-ticket');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).not.toHaveURL(/login|sign-in/i);
    });

    test('PlayOn Loyalty section should be accessible without redirect to login', async ({ page }) => {
      await page.goto('/playon');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).not.toHaveURL(/login|sign-in/i);
    });

    test('should be able to log out and return to guest state', async ({ page }) => {
      // Account button (data-test-id="pc-account-info-button") navigates to the
      // account section where the Sign Out button lives in the sidebar menu.
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /sign in/i })).toBeHidden({ timeout: 20_000 });

      await page.locator('[data-test-id="pc-account-info-button"]').click();
      await page.getByRole('button', { name: /sign out/i }).waitFor({ state: 'visible', timeout: 15_000 });
      await page.getByRole('button', { name: /sign out/i }).click();

      await expect(
        page.getByRole('button', { name: /sign in/i }),
      ).toBeVisible({ timeout: 20_000 });
    });
  });
});
