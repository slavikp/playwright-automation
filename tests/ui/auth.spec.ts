import { test, expect } from '../../fixtures';

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
});
