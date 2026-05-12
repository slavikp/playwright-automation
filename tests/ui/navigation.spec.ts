import { test, expect } from '../../fixtures';


test.describe('Navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto(); // waits for header only — fast
  });

  test('home page loads with visible header', async ({ homePage }) => {
    await expect(homePage.header).toBeVisible();
  });

  test('header contains Home and Responsible Gaming links', async ({ homePage }) => {
    await expect(homePage.homeNavLink).toBeVisible();
    await expect(homePage.responsibleGamingNavLink).toBeVisible();
  });

  test('Responsible Gaming link navigates to /responsible-gaming', async ({
    homePage,
    page,
  }) => {
    await homePage.responsibleGamingNavLink.click();
    await expect(page).toHaveURL(/responsible-gaming/);
  });

  test('PlayOn® Loyalty button is in the header', async ({ homePage }) => {
    await expect(homePage.playOnNavButton).toBeVisible();
  });

  test('page title is present and meaningful', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
