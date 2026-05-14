import { test, expect } from '@playwright/test';

// The homepage has slow third-party scripts AND requires React hydration before
// nav buttons become interactive. Strategy:
//  1. goto with 'domcontentloaded' — skip slow API-driven 'load' event
//  2. waitFor the specific button — waits for React SSR output to appear
//  3. toPass retry loop — retries the click until React handlers attach and
//     the dropdown menu actually opens (typically 1–3 attempts)
async function openNavDropdown(page: import('@playwright/test').Page, btnName: RegExp) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const btn = page.locator('header').getByRole('button', { name: btnName });
  await btn.waitFor({ state: 'visible', timeout: 45_000 });

  // getByRole('menu') matches computed ARIA role (including implicit HTML <menu> elements),
  // unlike the CSS selector [role="menu"] which only matches explicit attribute.
  await expect(async () => {
    if (await page.getByRole('menu').isVisible()) return; // already open
    await btn.click();
    await expect(page.getByRole('menu')).toBeVisible();
  }).toPass({ timeout: 30_000 });
}

// ---------------------------------------------------------------------------
// Header links — Responsible Gaming is the only plain <a> in the nav
// (Games, PlayOn® Loyalty, News & Winners, About Us are all <button> dropdowns)
// ---------------------------------------------------------------------------
test.describe('Navigation — header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('header').waitFor({ state: 'visible', timeout: 45_000 });
  });

  test('header renders with nav buttons', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header').getByRole('button', { name: /^games/i })).toBeVisible();
  });

  test('Responsible Gaming is a nav link in the header', async ({ page }) => {
    await expect(
      page.locator('header').getByRole('link', { name: /responsible gaming/i }),
    ).toBeVisible();
  });

  test('Responsible Gaming link navigates to /responsible-gaming', async ({ page }) => {
    await page.locator('header').getByRole('link', { name: /responsible gaming/i }).click();
    await expect(page).toHaveURL(/responsible-gaming/);
  });

  test('PlayOn® Loyalty button is in the header', async ({ page }) => {
    await expect(
      page.locator('header').getByRole('button', { name: /playon.*loyalty/i }),
    ).toBeVisible();
  });

  test('page title is present and meaningful', async ({ page }) => {
    expect((await page.title()).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Dropdown menus — scoped to [role="menu"] after button click
// ---------------------------------------------------------------------------
test.describe('Navigation — Games dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await openNavDropdown(page, /^games/i);
  });

  const gameLinks: [string, string][] = [
    ['eInstant Games', '/games/instants'],
    ['Draw Games', '/games/draw-games'],
    ['Scratch and Pull Tabs', '/games/scratch-and-pull-tabs'],
    ['Fast Play', '/games/fast-play'],
    ['Samplers', '/samplers'],
  ];

  for (const [label, url] of gameLinks) {
    test(`"${label}" item links to ${url}`, async ({ page }) => {
      await expect(
        page.getByRole('menu').getByRole('link', { name: new RegExp(label, 'i') }),
      ).toHaveAttribute('href', url);
    });
  }
});

test.describe('Navigation — PlayOn® Loyalty dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await openNavDropdown(page, /playon.*loyalty/i);
  });

  const loyaltyLinks: [string, string][] = [
    ['Rewards', '/playon/rewards'],
    ['Earn', '/playon/activities'],
    ['Second Chance', '/playon/promotions'],
    ['Enter Ticket', '/playon/manual-ticket-entry'],
    ['PlayOn.*Home', '/playon'],
  ];

  for (const [label, url] of loyaltyLinks) {
    test(`"${label}" item links to ${url}`, async ({ page }) => {
      await expect(
        page.getByRole('menu').getByRole('link', { name: new RegExp(label, 'i') }),
      ).toHaveAttribute('href', url);
    });
  }
});

test.describe('Navigation — News & Winners dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await openNavDropdown(page, /news.*winners/i);
  });

  const newsLinks: [string, string][] = [
    ['News and Special Offers', '/news-and-offers'],
    ['Unclaimed Winners', '/content/unclaimed-winners'],
    ['Recent Winners', '/recent-winners'],
    ['On The Radio', '/content/on-the-radio'],
    ['On The Road', '/content/on-the-road'],
    ['How to Claim', '/how-to-claim'],
  ];

  for (const [label, url] of newsLinks) {
    test(`"${label}" item links to ${url}`, async ({ page }) => {
      await expect(
        page.getByRole('menu').getByRole('link', { name: new RegExp(label, 'i') }),
      ).toHaveAttribute('href', url);
    });
  }
});

test.describe('Navigation — About Us dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await openNavDropdown(page, /about us/i);
  });

  const aboutLinks: [string, string][] = [
    ['Where The Money Goes', 'https://www.kslottery.gov/where-the-money-goes'],
    ['Lottery History', 'https://www.kslottery.gov/history'],
    ['Lottery Act', 'https://www.kslottery.gov/lottery-act'],
  ];

  for (const [label, url] of aboutLinks) {
    test(`"${label}" item links to ${url}`, async ({ page }) => {
      await expect(
        page.getByRole('menu').getByRole('link', { name: new RegExp(label, 'i') }),
      ).toHaveAttribute('href', url);
    });
  }
});
