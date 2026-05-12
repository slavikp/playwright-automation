import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ENV_CONFIG } from '../config/environments';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');
const TOKEN_URL =
  'https://webview.ilp.pgp.playonkansas.com/auth/realms/player/protocol/openid-connect/token';


setup('authenticate as test user', async ({ page, request }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Step 1 — get tokens from Keycloak directly
  const tokenRes = await request.post(TOKEN_URL, {
    form: {
      grant_type: 'password',
      client_id: 'game-web',
      username: ENV_CONFIG.testUserEmail,
      password: ENV_CONFIG.testUserPassword,
    },
  });

  if (!tokenRes.ok()) {
    const body = await tokenRes.text();
    throw new Error(`Keycloak token request failed (${tokenRes.status()}): ${body}`);
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Step 2 — load the site and inject the token so the app recognises the session
  await page.goto(ENV_CONFIG.baseUrl);

  await page.evaluate((token) => {
    localStorage.setItem('access_token', token);
    sessionStorage.setItem('access_token', token);
  }, access_token);

  // Reload so the app picks up the injected token
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Step 3 — save full browser state (cookies + storage)
  await page.context().storageState({ path: AUTH_FILE });
});
