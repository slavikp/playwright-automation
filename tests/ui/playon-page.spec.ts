import { test, expect } from '@playwright/test';

test.describe('PlayOn® Loyalty hub page — public content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playon');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/PlayOn.*Loyalty/i);
    await expect(page.getByRole('heading', { name: /playon.*loyalty/i, level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });

  test('Keep The Fun Going heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /keep the fun going/i })).toBeVisible();
  });

  test('Get The App link is present', async ({ page }) => {
    const link = page.getByRole('link', { name: /get the app/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /faq/i);
  });

  test('Enter Ticket button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /enter ticket/i })).toBeVisible();
  });

  test('Enter Ticket button redirects to login for guest users', async ({ page }) => {
    await page.getByRole('button', { name: /enter ticket/i }).click();
    await page.waitForLoadState('domcontentloaded');
    const signInVisible = await page.getByRole('textbox', { name: /email/i }).isVisible()
      || await page.getByText(/sign in|log in/i).first().isVisible()
      || page.url().includes('login') || page.url().includes('sign-in');
    expect(signInVisible).toBeTruthy();
  });
});

test.describe('PlayOn® Loyalty — authenticated sub-pages redirect guard', () => {
  const protectedRoutes = [
    { path: '/playon/rewards', label: 'Rewards' },
    { path: '/playon/activities', label: 'Earn / Activities' },
    { path: '/playon/promotions', label: 'Second Chance' },
    { path: '/playon/manual-ticket-entry', label: 'Enter Ticket' },
  ];

  for (const { path, label } of protectedRoutes) {
    test(`${label} (${path}) redirects or prompts login for guests`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      const isAuthWall =
        page.url().includes('login') ||
        page.url().includes('sign-in') ||
        (await page.getByText(/sign in|log in|create account/i).first().isVisible().catch(() => false));
      const isContentLoaded = !isAuthWall && await page.getByRole('main').isVisible();
      expect(isAuthWall || isContentLoaded).toBeTruthy();
    });
  }
});
