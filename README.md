# PlayOn Kansas — Playwright Automation Framework

End-to-end test automation for [playonkansas.com](https://playonkansas.com) — the Kansas Lottery PlayOn® platform.

---

## Stack

| | |
|---|---|
| **Target** | https://playonkansas.com |
| **Test runner** | Playwright Test |
| **Language** | TypeScript (strict) |
| **Pattern** | Page Object Model |
| **Browsers** | Chromium (local) · Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari (CI) |
| **CI/CD** | GitHub Actions |
| **Reporting** | Playwright HTML · QMetry Cloud |

---

## Project Structure

```
.
├── config/
│   └── environments.ts           # Typed env config loaded from .env files
│
├── constants/
│   └── routes.ts                 # All site route paths
│
├── fixtures/
│   ├── index.ts                  # Custom test fixtures (page objects)
│   └── data/
│       └── users.ts              # Test user credentials (reads from env)
│
├── pages/                        # Page Object Model
│   ├── BasePage.ts               # Shared navigation and wait helpers
│   ├── HomePage.ts               # playonkansas.com homepage
│   ├── GamesPage.ts              # /games/instants — eInstants section
│   ├── LoginPage.ts              # Keycloak authentication flow
│   ├── PlayOnLoyaltyPage.ts      # /playon — loyalty program section
│   └── DashboardPage.ts          # Authenticated user dashboard
│
├── reporters/
│   └── qmetry.ts                 # Custom reporter — uploads results to QMetry Cloud
│
├── tests/
│   ├── global.setup.ts           # Keycloak auth state setup (saves .auth/user.json)
│   └── ui/
│       ├── auth.spec.ts          # Login, registration, authenticated session
│       ├── draw-games.spec.ts    # /games/draw-games — Powerball, MM, secondary games
│       ├── games.spec.ts         # eInstants, Scratch & Pull Tabs, Fast Play, Samplers
│       ├── homepage.spec.ts      # Homepage structure, hero, nav, footer
│       ├── my-account.spec.ts    # Authenticated — all /my-account sub-pages
│       ├── navigation.spec.ts    # Header nav dropdowns and links
│       └── playon-authenticated.spec.ts  # PlayOn® Loyalty authenticated flows
│
├── utils/
│   ├── ApiClient.ts              # Typed Playwright API request wrapper
│   └── TestDataGenerator.ts     # Faker-based test data factory
│
├── .env.example                  # Environment variable template
├── .env.local                    # Local overrides (gitignored)
├── .mcp.json                     # MCP server config for VS Code AI agents
├── playwright.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### 1. Clone and install

```bash
git clone <repo-url>
cd Automation
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install --with-deps
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
BASE_URL=https://playonkansas.com

TEST_USER_EMAIL=your-test-account@example.com
TEST_USER_PASSWORD=your-password

# QMetry Cloud — leave blank to disable reporting
QMETRY_API_KEY=
QMETRY_PROJECT_KEY=POK
QMETRY_CYCLE_NAME=Automated Run
```

### 4. Authenticate (required for authenticated tests)

```bash
npx playwright test --project=setup
```

A browser window opens. Log in manually (or automatically if credentials are set), then click **Resume** in the Playwright inspector. The session is saved to `.auth/user.json` and is reused for up to 12 minutes before the next re-auth.

### 5. Run the tests

```bash
npm test
```

Open the HTML report when done:

```bash
npm run test:report
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `BASE_URL` | Target site URL | Yes |
| `TEST_USER_EMAIL` | PlayOn® account email | For auth tests |
| `TEST_USER_PASSWORD` | PlayOn® account password | For auth tests |
| `ADMIN_EMAIL` | Admin account email | Optional |
| `ADMIN_PASSWORD` | Admin account password | Optional |
| `ENV` | `local` / `dev` / `staging` | No (default: `local`) |
| `QMETRY_API_KEY` | QMetry Cloud API key | For QMetry reporting |
| `QMETRY_PROJECT_KEY` | QMetry project key (e.g. `POK`) | For QMetry reporting |
| `QMETRY_CYCLE_NAME` | Test cycle name to create/update | No (default: omitted) |

Multiple environments are supported via named `.env` files:

```
.env.local    → npm test (default)
.env.staging  → ENV=staging npm test
```

---

## Running Tests

```bash
# All tests
npm test

# UI tests only
npm run test:ui

# Specific file
npx playwright test tests/ui/my-account.spec.ts

# Headed (visible browser)
npm run test:headed

# Debug mode — step through with inspector
npm run test:debug

# Chromium only
npm run test:chrome

# Open HTML report
npm run test:report

# Clean test artifacts
npm run clean
```

---

## Test Coverage

### Public pages (no auth required)

| Spec | Coverage |
|---|---|
| `homepage.spec.ts` | Page title, hero, nav sections, footer helpline |
| `navigation.spec.ts` | Header dropdowns (Games, PlayOn®, About), all nav links |
| `games.spec.ts` | eInstants cards (Pinata Payday, Kansas Cashout, Bacon Me Crazier…), Scratch & Pull Tabs, Fast Play, Samplers |
| `draw-games.spec.ts` | Draw Games page structure, Powerball/Mega Millions jackpots, 9 secondary game cards, navigation |
| `auth.spec.ts` | Login form, forgot password, register, authenticated session, sign-out |

### Authenticated pages (`/my-account`)

`my-account.spec.ts` covers the full account section with session-expiry skip logic (gracefully skips if the Keycloak session has expired instead of failing the suite):

| Suite | Tests |
|---|---|
| Dashboard | Welcome heading, account info button, sidebar groups, all sidebar nav items |
| Sub-page H1s | Add Funds, Withdraw Wins, Payment Methods, My Bonuses, My Tickets, My Subscriptions, My Claims, eInstant Play History, Transaction History, PlayOn® History, Upload Documents, My Details, Invite Friends |
| Sidebar hrefs | Correct `href` for each of the 15 sidebar links |
| Payment Methods | Empty state / Add a Payment Method option |
| Sign Out | Button visible in sidebar; clicking returns to guest state |

### Authenticated flows (`playon-authenticated.spec.ts`)

Covers PlayOn® Loyalty section pages that require login — verifies redirect behaviour and authenticated access.

---

## Authentication

Authenticated tests use Keycloak session state saved by `tests/global.setup.ts`.

**How setup works:**

1. Navigates to the homepage and clicks **Sign In**
2. If `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` are set, fills credentials and submits automatically
3. If reCAPTCHA blocks the login, pauses for manual intervention (`page.pause()`) then continues
4. If no credentials are configured, pauses for fully manual login
5. Saves storage state (cookies + localStorage) to `.auth/user.json`

**Session lifetime:** The Keycloak dev environment issues sessions that expire in ~15 minutes. The setup caches the session for 12 minutes and re-authenticates automatically before it expires.

**Expired session handling:** Authenticated specs detect a mid-run Keycloak redirect and call `test.skip()` with a clear message rather than failing with a cryptic error:

```
Auth session expired — run: npx playwright test --project=setup to refresh
```

---

## QMetry Cloud Reporting

The custom reporter in `reporters/qmetry.ts` runs automatically after every test suite. When `QMETRY_API_KEY` is set it:

1. Collects all test results (pass / fail / skip) during the run
2. Generates a JUnit XML file at `test-results/qmetry-junit.xml`
3. POSTs the file to `https://qtmcloud.qmetry.com/rest/api/automation/importresult`
4. Logs the QMetry tracking ID on success

When `QMETRY_API_KEY` is **not** set the reporter prints a single skip message and does nothing — local runs without credentials are unaffected.

**Required QMetry setup:**

1. Log into QMetry Cloud → your profile → **API Keys** → generate a key
2. Note your **Project Key** (short code shown in the project settings)
3. Add both to `.env.local` (or CI secrets)

---

## Page Object Model

Each page has a corresponding class in `pages/`. Tests never contain raw selectors — all locator logic lives in the page object.

```typescript
// pages/GamesPage.ts
export class GamesPage extends BasePage {
  readonly gameCardLinks = this.page.locator('a.focus-link').filter({
    has: this.page.locator('.MuiCard-root'),
  });

  async goto() {
    await this.page.goto(ROUTES.GAMES_EINSTANTS, { waitUntil: 'domcontentloaded' });
    await this.gameCardLinks.first().waitFor({ state: 'visible' });
  }
}

// tests/ui/games.spec.ts
test('games page loads', async ({ gamesPage }) => {
  await gamesPage.goto();
  await gamesPage.assertGamesVisible();
});
```

### Adding a new page

1. Create `pages/MyPage.ts` extending `BasePage`
2. Add a fixture in `fixtures/index.ts`
3. Use it in tests via `{ myPage }` destructuring

---

## Selector Strategy

The site does not expose `data-testid` attributes (except `pc-account-info-button`). Priority order:

1. **ARIA roles** — `page.getByRole('button', { name: /sign in/i })`
2. **Labels** — `page.getByLabel(/email/i)`
3. **Text** — `page.getByText(/kansas cashout/i)`
4. **`data-test-id`** — `page.locator('[data-test-id="pc-account-info-button"]')`
5. **CSS** (last resort) — `page.locator('.MuiCard-root')`

Use `.or()` chains when a fallback is needed for content that varies between environments.

---

## HTML Report

After every run Playwright generates a report in `playwright-report/`:

```bash
npm run test:report
```

The report includes pass/fail per test, screenshots on failure, traces and videos on first retry, and full error messages. To inspect a trace from a failed test:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## CI/CD

The GitHub Actions pipeline:

- Runs on push, PR, nightly schedule, and manual dispatch
- Caches Playwright browsers between runs
- Uploads the HTML report as an artifact (30-day retention)
- Publishes results to QMetry Cloud via `QMETRY_API_KEY` secret

### Required GitHub Secrets

```
BASE_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD
QMETRY_API_KEY
QMETRY_PROJECT_KEY
QMETRY_CYCLE_NAME
```

---

## MCP / AI Agents

`.mcp.json` configures the Playwright MCP server for VS Code, enabling Claude and other AI agents to drive a browser directly during development:

```bash
# VS Code — install the MCP extension, then the server starts automatically
# CLI — start the MCP server manually:
npx @playwright/mcp --browser chromium
```

Use-cases: exploratory testing, selector discovery, debugging flaky locators without writing a full spec.

---

## Common Issues

| Issue | Solution |
|---|---|
| Element not found | Use `page.pause()` in debug mode to inspect the live DOM |
| Test flaky on CI | Enable `trace: 'on'` and inspect with `npx playwright show-trace` |
| Auth state missing or expired | Run `npx playwright test --project=setup` to refresh |
| Authenticated tests skipped | Session expired mid-run — re-run setup, then re-run the spec |
| Wrong base URL | Check `ENV` and `.env.local` |
| QMetry upload fails HTTP 401 | Verify `QMETRY_API_KEY` is correct and not expired |
| QMetry upload fails HTTP 400 | Check that `QMETRY_PROJECT_KEY` matches your project in QMetry Cloud |
| Homepage load timeout | The site has slow third-party scripts — all `goto()` calls use `waitUntil: 'domcontentloaded'` |
