import { test, expect } from '@playwright/test';

test.describe('News & Special Offers page', () => {
  test('loads with correct title and H1', async ({ page }) => {
    await page.goto('/news-and-offers');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/News.*Special Offers/i);
    await expect(page.getByRole('heading', { name: /news.*special offers/i, level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await page.goto('/news-and-offers');
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });
});

test.describe('Recent Winners page', () => {
  test('loads with correct title and H1', async ({ page }) => {
    await page.goto('/recent-winners');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/Recent Winners/i);
    await expect(page.getByRole('heading', { name: 'Recent Winners', level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    await page.goto('/recent-winners');
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByRole('navigation', { name: /breadcrumb/i }).getByRole('link', { name: /home/i }),
    ).toBeVisible();
  });
});

test.describe('Unclaimed Winners page', () => {
  test('loads with H1 Unclaimed Winners', async ({ page }) => {
    await page.goto('/content/unclaimed-winners');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Unclaimed Winners', level: 1 })).toBeVisible();
  });
});

test.describe('How to Claim page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/how-to-claim');
    await page.waitForLoadState('domcontentloaded');
  });

  test('loads with correct title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/How to Claim/i);
    await expect(page.getByRole('heading', { name: /how to claim/i, level: 1 })).toBeVisible();
  });

  test('online prize claim tiers are listed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /how to claim your online prize/i })).toBeVisible();
    await expect(page.getByText(/prizes of less than \$600/i)).toBeVisible();
    await expect(page.getByText(/prizes of \$600/i).first()).toBeVisible();
    await expect(page.getByText(/\$400,000 or more/i)).toBeVisible();
  });

  test('Upload Document link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /upload document/i })).toBeVisible();
  });

  test('Download Claim Form link is present', async ({ page }) => {
    const link = page.getByRole('link', { name: /download claim form/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /\.pdf/i);
  });

  test('Terms and Conditions link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /terms and conditions/i }).first()).toBeVisible();
  });

  test('retail prize tiers are listed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /how to claim retail prizes/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /prizes up to \$599/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /prizes of \$600 to \$5,000/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /prizes of \$5,001/i })).toBeVisible();
  });

  test('Draw Game Jackpot Prizes section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /draw game jackpot prizes/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /annuity option/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /cash option/i })).toBeVisible();
  });

  test('FAQs link is present in the footer CTA', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'FAQs', exact: true })).toBeVisible();
  });
});
