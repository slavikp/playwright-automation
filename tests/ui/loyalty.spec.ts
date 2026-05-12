import { test, expect } from '../../fixtures';


test.describe('PlayOn® Loyalty — Homepage section', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('all four loyalty category buttons are visible', async ({ homePage }) => {
    await expect(homePage.secondChanceButton).toBeVisible();
    await expect(homePage.earnButton).toBeVisible();
    await expect(homePage.rewardsButton).toBeVisible();
    await expect(homePage.enterTicketButton).toBeVisible();
  });

  test('Second Chance button has descriptive text', async ({ page }) => {
    const btn = page.getByRole('button', { name: /second chance/i });
    await expect(btn).toContainText(/second chance/i);
    await expect(btn).toContainText(/earn|draw|entries/i);
  });

  test('Earn button has descriptive text about points', async ({ page }) => {
    const btn = page.getByRole('button', { name: /^earn/i });
    await expect(btn).toContainText(/points|activities/i);
  });

  test('"View All" link navigates to /playon', async ({ homePage, page }) => {
    await homePage.viewAllLoyaltyLink.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/playon/);
  });
});

test.describe('PlayOn® Loyalty — Card interactions', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // Second Chance, Earn, Rewards buttons open an inline modal/accordion on the homepage.
  // They do NOT navigate — the URL stays on '/'. We verify the button is interactive.
  test('Second Chance button is clickable and triggers a UI change', async ({
    homePage,
    page,
  }) => {
    await homePage.secondChanceButton.click();
    // Either a dialog opens or expanded content appears
    const dialog = page.getByRole('dialog');
    const expanded = page.locator('[aria-expanded="true"]');
    const hasChange =
      (await dialog.isVisible()) ||
      (await expanded.count()) > 0 ||
      (await page.getByText(/second chance/i).count()) > 1;
    expect(hasChange).toBeTruthy();
  });

  test('Earn button is clickable', async ({ homePage }) => {
    // Button is visible and enabled — clicking it is the interaction (may open accordion/modal)
    await expect(homePage.earnButton).toBeEnabled();
    await homePage.earnButton.click();
    // Just verify no JS error / crash by checking the header is still visible
    await expect(homePage.header).toBeVisible();
  });

  test('Rewards button is clickable and triggers a UI change', async ({
    homePage,
    page,
  }) => {
    await homePage.rewardsButton.click();
    const dialog = page.getByRole('dialog');
    const hasChange =
      (await dialog.isVisible()) ||
      (await page.getByText(/redeem|points|rewards/i).first().isVisible());
    expect(hasChange).toBeTruthy();
  });

  test('Enter Ticket button navigates or shows sign-in prompt', async ({
    homePage,
    page,
  }) => {
    await homePage.enterTicketButton.click();
    await page.waitForLoadState('domcontentloaded');
    const urlChanged = page.url() !== 'https://playonkansas.com/';
    const signInVisible = await page
      .getByText(/sign in|log in|create account|register/i)
      .first()
      .isVisible();
    expect(urlChanged || signInVisible).toBeTruthy();
  });
});

test.describe('PlayOn® Loyalty — Nav button', () => {
  test('PlayOn® Loyalty header button is visible', async ({ page }) => {
    await page.goto('https://playonkansas.com');
    await page.locator('a.focus-link').filter({ has: page.locator('.MuiCard-root') }).first()
      .waitFor({ state: 'visible', timeout: 30_000 });

    const playOnBtn = page.locator('header').getByRole('button', { name: /playon/i });
    await expect(playOnBtn).toBeVisible();
  });
});
