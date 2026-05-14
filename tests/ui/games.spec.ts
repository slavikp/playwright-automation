import { test, expect } from '../../fixtures';


test.describe('Games — eInstants page', () => {
  test.beforeEach(async ({ gamesPage }) => {
    await gamesPage.goto();
  });

  test('games page loads with game cards', async ({ gamesPage }) => {
    await gamesPage.assertGamesVisible();
  });

  test('displays multiple game cards', async ({ gamesPage }) => {
    const count = await gamesPage.getGameCount();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Pinata Payday is present with NEW badge', async ({ page }) => {
    await expect(page.getByText('Pinata Payday').first()).toBeVisible();
    await expect(
      page.locator('.MuiCard-root').filter({ hasText: 'Pinata Payday' }).getByText('NEW'),
    ).toBeVisible();
  });

  test('Relic Fortunes card is present', async ({ page }) => {
    await expect(page.getByText('Relic Fortunes').first()).toBeVisible();
  });

  test('Kansas Cashout is present with HOT badge and $300,000 prize', async ({ page }) => {
    const kansasCard = page.locator('.MuiCard-root').filter({ hasText: 'Kansas Cashout' });
    await expect(kansasCard.getByText('HOT')).toBeVisible();
    await expect(kansasCard.getByText(/300,000/)).toBeVisible();
  });

  test('Bacon Me Crazier shows PROGRESSIVE badge and jackpot amount', async ({ page }) => {
    const baconCard = page.locator('.MuiCard-root').filter({ hasText: 'Bacon Me Crazier' });
    await expect(baconCard.getByText('PROGRESSIVE')).toBeVisible();
    await expect(baconCard.getByText(/JACKPOT/)).toBeVisible();
  });

  test('each card has Try and Play Now actions', async ({ page }) => {
    const firstCard = page.locator('.MuiCard-root').first();
    await expect(firstCard.getByText('Try')).toBeVisible();
    await expect(firstCard.getByText('Play Now')).toBeVisible();
  });
});

test.describe('Games — Game card navigation', () => {
  test.beforeEach(async ({ gamesPage }) => {
    await gamesPage.goto();
  });

  test('clicking Pinata Payday navigates to game page', async ({ gamesPage, page }) => {
    await gamesPage.clickGameByName('Pinata Payday');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/PINATAPAYDAY/i);
  });

  test('clicking Kansas Cashout navigates to game page', async ({ gamesPage, page }) => {
    await gamesPage.clickGameByName('Kansas Cashout');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/ks-cashout/i);
  });
});

test.describe('Games — Scratch & Pull Tabs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/scratch-and-pull-tabs');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title and H1', async ({ page }) => {
    await expect(page).toHaveTitle(/Scratch.*Pull Tabs/i);
    await expect(
      page.getByRole('heading', { name: /scratch and pull tab games/i, level: 1 }),
    ).toBeVisible();
  });

  test('shows game count', async ({ page }) => {
    await expect(page.getByText(/\d+ games shown/i)).toBeVisible();
  });

  test('Filter and Sort button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filter.*sort/i })).toBeVisible();
  });
});

test.describe('Games — Fast Play page', () => {
  test('page title and H1', async ({ page }) => {
    await page.goto('/games/fast-play', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Fast Play/i);
    await expect(page.getByRole('heading', { name: 'Fast Play', level: 1 })).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Games — Samplers page', () => {
  test('page title and H1', async ({ page }) => {
    await page.goto('/samplers', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Samplers/i);
    await expect(page.getByRole('heading', { name: 'Samplers', level: 1 })).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Games — Homepage nav', () => {
  test('Games nav button opens dropdown or navigates', async ({ page }) => {
    await page.goto('https://playonkansas.com/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('header').waitFor({ state: 'visible', timeout: 30_000 });

    const gamesButton = page.locator('header').getByRole('button', { name: /^games$/i });
    if (await gamesButton.isVisible()) {
      await gamesButton.click();
      const menuVisible = await page.getByRole('menu').isVisible();
      const urlChanged = page.url() !== 'https://playonkansas.com/';
      expect(menuVisible || urlChanged).toBeTruthy();
    } else {
      const moreLink = page.getByRole('link', { name: /more einstants/i });
      await expect(moreLink).toBeVisible({ timeout: 45_000 });
    }
  });
});
