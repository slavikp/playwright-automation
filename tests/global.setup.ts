import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ENV_CONFIG } from '../config/environments';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');
const MAX_AGE_MS = 23 * 60 * 60 * 1000; // re-auth after 23 hours

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Skip if the auth file is still fresh
  if (fs.existsSync(AUTH_FILE)) {
    const age = Date.now() - fs.statSync(AUTH_FILE).mtimeMs;
    if (age < MAX_AGE_MS) {
      console.log(`✓ Using cached auth session (${Math.round(age / 60_000)}m old)`);
      return;
    }
  }

  await page.goto(ENV_CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });

  // Open the login overlay
  const signInBtn = page.getByRole('button', { name: /sign in/i });
  await signInBtn.waitFor({ state: 'visible', timeout: 15_000 });
  await signInBtn.click();

  const emailInput = page.getByRole('textbox', { name: /email/i });
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });

  if (ENV_CONFIG.testUserEmail && ENV_CONFIG.testUserPassword) {
    // --- Automated path: fill credentials and submit ---
    await emailInput.fill(ENV_CONFIG.testUserEmail);
    await page.getByLabel(/password/i).fill(ENV_CONFIG.testUserPassword);
    await page.getByRole('button', { name: /^sign in$|^log in$|^submit$/i }).last().click();

    // Wait up to 15s for login to complete automatically.
    // If reCAPTCHA or an error blocks it, fall through to the manual pause.
    const loginGone = await emailInput
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);

    if (!loginGone) {
      console.log('\n👉  reCAPTCHA or login issue detected. Solve it in the browser, then click Resume.\n');
      await page.pause();
      await expect(emailInput, 'Login form should close after successful login').toBeHidden({
        timeout: 30_000,
      });
    }
  } else {
    // --- Manual path: no credentials configured ---
    console.log('\n👉  TEST_USER_EMAIL / TEST_USER_PASSWORD not set. Log in manually, then click Resume.\n');
    await page.pause();
    await expect(emailInput, 'Login form should close after successful login — did you click Resume too early?').toBeHidden({
      timeout: 30_000,
    });
  }

  await page.context().storageState({ path: AUTH_FILE });
  console.log('✓ Session saved to .auth/user.json');
});
