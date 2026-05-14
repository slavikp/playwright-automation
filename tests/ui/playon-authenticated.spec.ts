import { test, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

// ---------------------------------------------------------------------------
// PlayOn® Loyalty pages — these load content publicly but show more when
// authenticated (personal points balance, active redemptions, etc.)
// ---------------------------------------------------------------------------

test.describe('Rewards page — public content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playon/rewards', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Rewards', level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('page title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/Kansas Lottery/i);
    await expect(page.getByRole('heading', { name: 'Rewards', level: 1 })).toBeVisible();
  });

  test('Rewards and Coupons tabs are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^rewards$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^coupons$/i })).toBeVisible();
  });

  test('reward catalog shows items with point costs', async ({ page }) => {
    await expect(page.getByText(/redeem for.*points/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Enter Ticket shortcut button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /enter ticket/i })).toBeVisible();
  });

  test('Coupons tab is clickable', async ({ page }) => {
    await page.getByRole('button', { name: /^coupons$/i }).click();
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Earn / Activities page — public content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playon/activities', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Earn', level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('page title and H1', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Earn', level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });
});

test.describe('Second Chance / Promotions page — public content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playon/promotions', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Second Chance', level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('page title and H1', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Second Chance', level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Auth-required pages — redirect to Keycloak IDP for guest users
// ---------------------------------------------------------------------------

test.describe('Auth-required pages — guest redirect', () => {
  const authPages = [
    { path: '/playon/manual-ticket-entry', label: 'Enter Ticket' },
    { path: '/my-account', label: 'My Account' },
    { path: '/my-account/responsible-gaming-tools', label: 'RG Tools' },
    { path: '/my-account/transaction-history', label: 'Transaction History' },
  ];

  for (const { path: pagePath, label } of authPages) {
    test(`${label} redirects unauthenticated users to Keycloak login`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      // React detects missing auth after hydration and redirects — wait for it
      await Promise.race([
        page.waitForURL(/idp-player|openid-connect/, { timeout: 20_000 }),
        page.getByRole('textbox', { name: /email/i }).waitFor({ state: 'visible', timeout: 20_000 }),
      ]).catch(() => {});
      const isKeycloakRedirect = page.url().includes('idp-player') || page.url().includes('openid-connect');
      const hasSignInForm = await page.getByRole('textbox', { name: /email/i }).isVisible().catch(() => false);
      expect(isKeycloakRedirect || hasSignInForm).toBeTruthy();
    });
  }
});

// ---------------------------------------------------------------------------
// Authenticated session — requires .auth/user.json
// ---------------------------------------------------------------------------

test.describe('Enter Ticket — authenticated', () => {
  test.use({ storageState: AUTH_FILE });

  test('manual ticket entry page loads after login', async ({ page }) => {
    await page.goto('/playon/manual-ticket-entry', { waitUntil: 'domcontentloaded' });
    // Should NOT redirect to Keycloak
    await expect(page).not.toHaveURL(/idp-player|openid-connect/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('My Account — authenticated', () => {
  test.use({ storageState: AUTH_FILE });

  test('my-account loads without Keycloak redirect', async ({ page }) => {
    await page.goto('/my-account', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/idp-player|openid-connect/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 20_000 });
  });

  test('responsible gaming tools page is accessible', async ({ page }) => {
    await page.goto('/my-account/responsible-gaming-tools', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/idp-player|openid-connect/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 20_000 });
  });

  test('transaction history page is accessible', async ({ page }) => {
    await page.goto('/my-account/transaction-history', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/idp-player|openid-connect/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 20_000 });
  });
});
