import { test, expect } from '@playwright/test';

test.describe('Responsible Gaming — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/responsible-gaming', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Responsible Gaming', level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  test('page title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/Responsible Gaming/i);
    await expect(page.getByRole('heading', { name: 'Responsible Gaming', level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });
});

test.describe('Responsible Gaming — tool cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/responsible-gaming', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Responsible Gaming', level: 1 })).toBeVisible({ timeout: 20_000 });
  });

  const tools: [string, string][] = [
    ['Funding Limits', 'funding-limits'],
    ['Take a Break', 'take-break'],
    ['Time Limits', 'time-limits'],
    ['Self Exclusion', 'self-exclusion'],
    ['Loss Limits', 'loss-limits'],
  ];

  for (const [name, section] of tools) {
    test(`${name} card links to responsible gaming tools`, async ({ page }) => {
      const link = page.getByRole('link', { name: new RegExp(name, 'i') }).first();
      await expect(link).toBeVisible({ timeout: 15_000 });
      await expect(link).toHaveAttribute('href', new RegExp(section));
    });
  }
});

test.describe('Responsible Gaming — content sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/responsible-gaming', { waitUntil: 'domcontentloaded' });
    // Wait for first content heading to confirm dynamic content has rendered
    await expect(
      page.getByRole('heading', { name: /personalized play means responsible play/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test('Personalized Play section is present', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /personalized play means responsible play/i }),
    ).toBeVisible();
  });

  test('Informed Play section is present', async ({ page }) => {
    await expect(page.getByText('Informed Play is the Best Play')).toBeVisible({ timeout: 15_000 });
  });

  test('Know the Warning Signs section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Know the Warning Signs' })).toBeVisible({ timeout: 15_000 });
  });

  test('Support is Available section with helpline', async ({ page }) => {
    await expect(page.getByText('Support is Available')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /1-800-522-4700/ })).toBeVisible({ timeout: 15_000 });
  });

  test('ksgamblinghelp.com link is present', async ({ page }) => {
    await expect(page.locator('main').getByRole('link', { name: /ksgamblinghelp/i })).toBeVisible({ timeout: 15_000 });
  });

  test('external help links are present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /national council on problem gambling/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('link', { name: /gamblers anonymous/i }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('The Kansas Lottery Cares section is present', async ({ page }) => {
    await expect(page.getByText('The Kansas Lottery Cares')).toBeVisible({ timeout: 15_000 });
  });
});
