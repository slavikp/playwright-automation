import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';


export class LoginPage extends BasePage {
  // ── Locators ─────────────────────────────────────────────────────────────────
  private get emailInput() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }
  private get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }
  private get submitButton() {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
  private get forgotPasswordLink() {
    return this.page.getByRole('link', { name: /forgot/i });
  }
  private get registerLink() {
    return this.page.getByRole('link', { name: /register/i });
  }

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigate(ROUTES.HOME);
    await this.waitForLoadingToFinish();
    const signInBtn = this.page.getByRole('button', { name: /sign in/i });
    await signInBtn.waitFor({ state: 'visible', timeout: 30_000 });
    await signInBtn.click();
    // Login opens as a full-screen overlay — URL doesn't change, wait for the form
    await this.page.getByRole('textbox', { name: 'Email' }).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.submitButton.click();
  }

  async loginAndWait(email: string, password: string): Promise<void> {
    await this.login(email, password);
    // Site returns to homepage with ?session_state param — overlay disappearing is the signal
    await this.emailInput.waitFor({ state: 'hidden', timeout: 15_000 });
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async assertErrorMessage(message: string | RegExp): Promise<void> {
    // Auth errors and field validation both render as visible text inside <main>
    await expect(this.page.locator('main')).toContainText(message, { timeout: 10_000 });
  }

  async assertLoginFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
