import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';

export class DashboardPage extends BasePage {
  private readonly welcomeHeading = this.page.getByTestId('welcome-heading').or(
    this.page.getByRole('heading').first(),
  );
  private readonly logoutButton = this.page.getByTestId('logout-button').or(
    this.page.getByRole('button', { name: /log out|sign out/i }),
  );

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate(ROUTES.DASHBOARD);
    await this.waitForLoadingToFinish();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.waitForUrl(new RegExp(ROUTES.LOGIN));
  }

  async assertDashboardLoaded(): Promise<void> {
    await expect(this.welcomeHeading).toBeVisible();
    await this.assertUrlContains('dashboard');
  }
}
