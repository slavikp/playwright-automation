import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';


export class GamesPage extends BasePage {
  // All eInstants game card links
  readonly gameCardLinks = this.page.locator('a.focus-link').filter({
    has: this.page.locator('.MuiCard-root'),
  });

  // Badge selectors (text inside cards)
  readonly newBadges = this.page.locator('.MuiCard-root').filter({ hasText: /^NEW$/ });
  readonly hotBadges = this.page.locator('.MuiCard-root').filter({ hasText: /^HOT$/ });
  readonly progressiveBadges = this.page
    .locator('.MuiCard-root')
    .filter({ hasText: /^PROGRESSIVE$/ });

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto(ROUTES.GAMES_EINSTANTS, { waitUntil: 'domcontentloaded' });
    await this.gameCardLinks.first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async clickGameByName(gameName: string): Promise<void> {
    await this.page
      .locator('a.focus-link')
      .filter({ has: this.page.getByText(new RegExp(gameName, 'i')) })
      .first()
      .click();
  }

  async getGameCount(): Promise<number> {
    return this.gameCardLinks.count();
  }

  // ── Assertions ────────────────────────────────────────────────────────────────

  async assertGamesVisible(): Promise<void> {
    await expect(this.gameCardLinks.first()).toBeVisible();
  }

  async assertGameExists(gameName: string): Promise<void> {
    await expect(
      this.page.getByText(new RegExp(gameName, 'i')).first(),
    ).toBeVisible();
  }

  async assertNewBadgePresent(): Promise<void> {
    await expect(this.newBadges.first()).toBeVisible();
  }
}
