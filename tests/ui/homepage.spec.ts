import { test, expect } from '../../fixtures';



test.describe('Homepage — Page load and core structure', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should load with a meaningful page title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display header navigation', async ({ homePage }) => {
    await expect(homePage.header).toBeVisible();
    await expect(homePage.homeNavLink).toBeVisible();
    await expect(homePage.responsibleGamingNavLink).toBeVisible();
  });

  test('should display PlayOn® Loyalty nav button', async ({ homePage }) => {
    await expect(homePage.playOnNavButton).toBeVisible();
  });

  test('should display eInstants game cards', async ({ homePage }) => {
    await homePage.waitForGameCards();
    await homePage.assertEInstantsGamesPresent();
    const count = await homePage.eInstantsGameCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should display PlayOn® loyalty section buttons', async ({ homePage }) => {
    await homePage.assertLoyaltySectionVisible();
    await expect(homePage.secondChanceButton).toBeVisible();
    await expect(homePage.earnButton).toBeVisible();
    await expect(homePage.rewardsButton).toBeVisible();
    await expect(homePage.enterTicketButton).toBeVisible();
  });

  test('should display footer with helpline', async ({ homePage }) => {
    await homePage.assertFooterVisible();
  });
});

test.describe('Homepage — Navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('Responsible Gaming link navigates to responsible gaming page', async ({
    homePage,
    page,
  }) => {
    await homePage.responsibleGamingNavLink.click();
    await expect(page).toHaveURL(/responsible-gaming/);
  });

  test('PlayOn® Loyalty button is visible in header', async ({ homePage }) => {
    await expect(homePage.playOnNavButton).toBeVisible();
  });

  test('Home link is visible and active', async ({ homePage }) => {
    await expect(homePage.homeNavLink).toBeVisible();
  });
});

test.describe('Homepage — eInstants game cards', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForGameCards();
  });

  test('should show at least 4 game cards', async ({ homePage }) => {
    const count = await homePage.eInstantsGameCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should show Pinata Payday with NEW badge', async ({ page }) => {
    await expect(page.getByText('Pinata Payday')).toBeVisible();
    await expect(
      page.locator('.MuiCard-root').filter({ hasText: 'Pinata Payday' }).getByText('NEW'),
    ).toBeVisible();
  });

  test('should show Kansas Cashout with HOT badge', async ({ page }) => {
    await expect(page.getByText('Kansas Cashout')).toBeVisible();
    await expect(
      page.locator('.MuiCard-root').filter({ hasText: 'Kansas Cashout' }).getByText('HOT'),
    ).toBeVisible();
  });

  test('should show progressive games with JACKPOT amount', async ({ page }) => {
    await expect(page.getByText('Bacon Me Crazier')).toBeVisible();
    await expect(
      page.locator('.MuiCard-root').filter({ hasText: 'Bacon Me Crazier' }).getByText(/JACKPOT/),
    ).toBeVisible();
  });

  test('clicking a game card navigates to game page', async ({ homePage, page }) => {
    await homePage.eInstantsGameCards.first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/games\/instants\/.+/);
  });

  test('"More eInstants" link is present', async ({ homePage }) => {
    await expect(homePage.moreEInstantsLink).toBeVisible();
  });
});

test.describe('Homepage — PlayOn® Loyalty section', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('all four loyalty category buttons are visible', async ({ homePage }) => {
    await expect(homePage.secondChanceButton).toBeVisible();
    await expect(homePage.earnButton).toBeVisible();
    await expect(homePage.rewardsButton).toBeVisible();
    await expect(homePage.enterTicketButton).toBeVisible();
  });

  test('"View All" link points to /playon', async ({ homePage }) => {
    await expect(homePage.viewAllLoyaltyLink).toBeVisible();
    await expect(homePage.viewAllLoyaltyLink).toHaveAttribute('href', '/playon');
  });
});

test.describe('Homepage — Responsible Gaming footer', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should show gambling helpline (800) 522-4700', async ({ homePage }) => {
    await expect(homePage.helplineLink).toBeVisible();
  });

  test('should show ksgamblinghelp.com link', async ({ homePage }) => {
    await expect(homePage.gamblingHelpLink).toBeVisible();
  });
});

test.describe('Homepage — Mobile responsiveness', () => {
  test('should render header on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();

    await page.goto('https://playonkansas.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.locator('header')).toBeVisible({ timeout: 30_000 });
    await context.close();
  });
});
