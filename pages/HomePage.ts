import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';


export class HomePage extends BasePage {
  readonly header = this.page.locator('header');

  // Plain nav links (Home, Responsible Gaming)
  readonly homeNavLink = this.header.getByRole('link', { name: 'Home' });
  readonly responsibleGamingNavLink = this.header.getByRole('link', {
    name: 'Responsible Gaming',
  });

  // Dropdown trigger buttons (Games, PlayOn® Loyalty, News & Winners, About Us)
  readonly gamesNavButton = this.header.getByRole('button', { name: /^games$/i });
  readonly playOnNavButton = this.header.getByRole('button', { name: /playon/i });
  readonly newsNavButton = this.header.getByRole('button', { name: /news/i });
  readonly aboutNavButton = this.header.getByRole('button', { name: /about/i });

  // ── eInstants game cards ─────────────────────────────────────────────────────
  // Cards: <a class="focus-link"> wrapping <div class="MuiCard-root">
  readonly eInstantsGameCards = this.page.locator('a.focus-link').filter({
    has: this.page.locator('.MuiCard-root'),
  });

  // ── eInstants section heading/link ───────────────────────────────────────────
  readonly moreEInstantsLink = this.page.getByRole('link', { name: /more einstants/i });

  // ── PlayOn® Loyalty section ──────────────────────────────────────────────────
  // These are MUI <button> elements (not links)
  readonly loyaltySection = this.page.locator('section, div').filter({
    hasText: /PlayOn/,
  }).first();

  readonly secondChanceButton = this.page.getByRole('button', { name: /second chance/i });
  readonly earnButton = this.page.getByRole('button', { name: /^earn/i });
  readonly rewardsButton = this.page.getByRole('button', { name: /^rewards/i });
  readonly enterTicketButton = this.page.getByRole('button', { name: /enter ticket/i });
  readonly viewAllLoyaltyLink = this.page.getByRole('link', { name: /view all/i });

  // ── Footer ────────────────────────────────────────────────────────────────────
  readonly footer = this.page.locator('footer').or(this.page.locator('[class*="footer"]').first());
  readonly helplineLink = this.page.getByRole('link', { name: /800.*522.*4700|522.?4700/ });
  readonly gamblingHelpLink = this.page.getByRole('link', { name: /ksgamblinghelp/i });

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('https://playonkansas.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    // Wait for header — it's in the initial HTML and confirms the app shell is ready
    await this.header.waitFor({ state: 'visible', timeout: 30_000 });
  }

  /** Call this in tests that specifically need game cards to be loaded. */
  async waitForGameCards(): Promise<void> {
    await this.eInstantsGameCards.first().waitFor({ state: 'visible', timeout: 45_000 });
  }

  async clickGamesNav(): Promise<void> {
    await this.gamesNavButton.click();
  }

  async clickPlayOnNav(): Promise<void> {
    await this.playOnNavButton.click();
  }

  async clickGameCard(index = 0): Promise<void> {
    await this.eInstantsGameCards.nth(index).click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async assertPageLoaded(): Promise<void> {
    await expect(this.header).toBeVisible();
    await expect(this.eInstantsGameCards.first()).toBeVisible();
  }

  async assertNavLinksVisible(): Promise<void> {
    await expect(this.homeNavLink).toBeVisible();
    await expect(this.responsibleGamingNavLink).toBeVisible();
    // Dropdown trigger buttons
    await expect(this.playOnNavButton).toBeVisible();
  }

  async assertEInstantsGamesPresent(): Promise<void> {
    await expect(this.eInstantsGameCards.first()).toBeVisible();
  }

  async assertLoyaltySectionVisible(): Promise<void> {
    await expect(this.secondChanceButton).toBeVisible();
  }

  async assertFooterVisible(): Promise<void> {
    await expect(this.helplineLink).toBeVisible();
  }
}
