import { test, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

test.use({ storageState: AUTH_FILE });

// ---------------------------------------------------------------------------
// Helper — navigate to an account page and wait for the sidebar to confirm auth.
// Skips the test with a clear message if the Keycloak session has expired.
// ---------------------------------------------------------------------------
async function gotoAccountPage(page: import('@playwright/test').Page, pagePath: string) {
  await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
  // React detects expired session and redirects to Keycloak after hydration
  await page.waitForTimeout(3_000);
  if (page.url().includes('idp-player') || page.url().includes('openid-connect')) {
    test.skip(true, 'Auth session expired — run: npx playwright test --project=setup to refresh');
  }
  await page.getByRole('menuitem', { name: /my account/i }).first().waitFor({ state: 'visible', timeout: 20_000 });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
test.describe('My Account — dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAccountPage(page, '/my-account');
  });

  test('loads with personalized welcome heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/welcome/i);
  });

  test('account button with user info is visible in header', async ({ page }) => {
    await expect(page.locator('[data-test-id="pc-account-info-button"]')).toBeVisible();
  });

  test('sidebar has Wallet, My Activity and My Tools groups', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main.getByText('Wallet')).toBeVisible();
    await expect(main.getByText('My Activity')).toBeVisible();
    await expect(main.getByText('My Tools')).toBeVisible();
  });

  test('sidebar contains all expected navigation items', async ({ page }) => {
    const menu = page.getByRole('menu').first();
    for (const label of [
      /add funds/i, /withdraw wins/i, /payment methods/i,
      /my bonuses/i, /my tickets/i, /my subscriptions/i, /my claims/i,
      /einstant play history/i, /transaction history/i, /loyalty history/i,
      /responsible gaming tools/i, /upload documents/i, /my details/i,
      /invite friends/i, /sign out/i,
    ]) {
      await expect(menu.getByRole('menuitem', { name: label })).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Sub-page load checks — H1 + sidebar present
// ---------------------------------------------------------------------------
const accountSubPages: Array<{ path: string; h1: string | RegExp }> = [
  { path: '/my-account/add-funds',             h1: 'Add Funds' },
  { path: '/my-account/withdraw-wins',          h1: 'Withdraw Wins' },
  { path: '/my-account/payment-methods',        h1: 'Payment Methods' },
  { path: '/my-account/my-bonuses',             h1: 'My Bonuses' },
  { path: '/my-account/my-tickets',             h1: 'My Tickets' },
  { path: '/my-account/my-subscriptions',       h1: 'My Subscriptions' },
  { path: '/my-account/my-claims',              h1: 'My Claims' },
  { path: '/my-account/eInstant-play-history',  h1: /einstant play history/i },
  { path: '/my-account/transaction-history',    h1: 'Transaction History' },
  { path: '/my-account/playon-history',         h1: /playon.*history|loyalty.*history/i },
  { path: '/my-account/upload-documents',       h1: /upload documents/i },
  { path: '/my-account/my-details',             h1: 'My Details' },
  { path: '/my-account/invite-friends',         h1: /invite friends/i },
];

test.describe('My Account — sub-pages load authenticated', () => {
  for (const { path: pagePath, h1 } of accountSubPages) {
    test(`${pagePath.replace('/my-account/', '')} loads with correct H1`, async ({ page }) => {
      await gotoAccountPage(page, pagePath);
      await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible({ timeout: 20_000 });
    });
  }
});

// ---------------------------------------------------------------------------
// Sidebar link hrefs
// ---------------------------------------------------------------------------
test.describe('My Account — sidebar nav link hrefs', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAccountPage(page, '/my-account');
  });

  const navLinks: Array<{ name: RegExp; href: string }> = [
    { name: /^my account$/i,           href: '/my-account' },
    { name: /add funds/i,              href: '/my-account/add-funds' },
    { name: /withdraw wins/i,          href: '/my-account/withdraw-wins' },
    { name: /payment methods/i,        href: '/my-account/payment-methods' },
    { name: /my bonuses/i,             href: '/my-account/my-bonuses' },
    { name: /my tickets/i,             href: '/my-account/my-tickets' },
    { name: /my subscriptions/i,       href: '/my-account/my-subscriptions' },
    { name: /my claims/i,              href: '/my-account/my-claims' },
    { name: /einstant play history/i,  href: '/my-account/eInstant-play-history' },
    { name: /transaction history/i,    href: '/my-account/transaction-history' },
    { name: /loyalty history/i,        href: '/my-account/playon-history' },
    { name: /responsible gaming tools/i, href: '/my-account/responsible-gaming-tools' },
    { name: /upload documents/i,       href: '/my-account/upload-documents' },
    { name: /my details/i,             href: '/my-account/my-details' },
    { name: /invite friends/i,         href: '/my-account/invite-friends' },
  ];

  for (const { name, href } of navLinks) {
    test(`"${href.replace('/my-account/', '')}" link has correct href`, async ({ page }) => {
      await expect(
        page.getByRole('menu').first().getByRole('link', { name }).first()
      ).toHaveAttribute('href', href);
    });
  }
});

// ---------------------------------------------------------------------------
// Payment Methods — empty state
// ---------------------------------------------------------------------------
test.describe('My Account — payment methods', () => {
  test('shows Add a Payment Method option when no methods saved', async ({ page }) => {
    await gotoAccountPage(page, '/my-account/payment-methods');
    await expect(
      page.getByRole('button', { name: /add a payment method/i })
        .or(page.getByText(/no.*payment|add a payment method/i).first()),
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// Sign Out
// ---------------------------------------------------------------------------
test.describe('My Account — sign out', () => {
  test('Sign Out button is present in sidebar', async ({ page }) => {
    await gotoAccountPage(page, '/my-account');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('clicking Sign Out returns to guest state', async ({ page }) => {
    await gotoAccountPage(page, '/my-account');
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 20_000 });
  });
});
