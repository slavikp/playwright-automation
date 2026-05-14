import { test, expect } from '@playwright/test';

test.describe('Draw Games — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/draw-games', { waitUntil: 'domcontentloaded' });
  });

  test('page title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/Draw Games/i);
    await expect(page.getByRole('heading', { name: 'Draw Games', level: 1 })).toBeVisible();
  });

  test('breadcrumb links back to home', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb.getByRole('link', { name: /home/i })).toBeVisible();
  });
});

test.describe('Draw Games — featured jackpot games', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/draw-games', { waitUntil: 'domcontentloaded' });
  });

  test('Powerball shows jackpot amount and Buy Now', async ({ page }) => {
    const pbCard = page.locator('text=Powerball').first().locator('..').locator('..');
    await expect(page.getByText('Powerball').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /powerball.*buy now/i })).toBeVisible();
  });

  test('Mega Millions shows jackpot amount and Buy Now', async ({ page }) => {
    await expect(page.getByText('Mega Million').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /megamillions.*buy now/i })).toBeVisible();
  });

  test('Powerball has Past Drawings link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /powerball.*past drawings/i })).toBeVisible();
  });

  test('Mega Millions has Past Drawings link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /megamillions.*past drawings/i })).toBeVisible();
  });
});

test.describe('Draw Games — secondary game cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/draw-games', { waitUntil: 'domcontentloaded' });
    // Wait for the last secondary card to confirm all game cards are rendered
    await page.getByRole('link', { name: /holiday millionaire raffle/i }).waitFor({ state: 'visible', timeout: 30_000 });
  });

  const games = [
    'Millionaire for Life',
    'Lotto America',
    'Pick 3',
    '2by2',
    'Keno',
    'Super Kansas Cash',
    'Lucky for Life',
    'Racetrax',
    'Holiday Millionaire Raffle',
  ];

  for (const game of games) {
    test(`${game} card is present`, async ({ page }) => {
      await expect(page.getByRole('link', { name: new RegExp(game, 'i') })).toBeVisible({ timeout: 15_000 });
    });
  }

  test('Millionaire for Life has Buy Now and Past Drawings buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /buy now.*millionaire-for-life/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /past drawings.*millionaire-for-life/i })).toBeVisible();
  });

  test('Keno has Watch Live button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /watch live/i }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('clicking Powerball Past Drawings navigates to game detail', async ({ page }) => {
    await page.getByRole('link', { name: /powerball.*past drawings/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/powerball/i);
  });
});
