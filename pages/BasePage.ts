import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForLoadingToFinish(): Promise<void> {
    const spinner = this.page.locator('[data-testid="loading-spinner"]');
    try {
      await spinner.waitFor({ state: 'visible', timeout: 3_000 });
      await spinner.waitFor({ state: 'hidden', timeout: 30_000 });
    } catch {
      // Spinner may not appear for fast responses
    }
  }

  async waitForUrl(urlOrPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlOrPattern);
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async assertUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring));
  }
}
