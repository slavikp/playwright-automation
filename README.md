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
| **CI/CD** | GitHub Actions with sharding |

---

## Project Structure

```
.
├── config/
│   └── environments.ts      # Typed env config loaded from .env files
│
├── constants/
│   └── routes.ts            # All site route paths
│
├── fixtures/
│   ├── index.ts             # Custom test fixtures (page objects, utils)
│   └── data/
│       └── users.ts         # Test user credentials (reads from env)
│
├── pages/                   # Page Object Model
│   ├── BasePage.ts          # Shared navigation and wait helpers
│   ├── HomePage.ts          # playonkansas.com homepage
│   ├── GamesPage.ts         # /games/instants — eInstants section
│   ├── LoginPage.ts         # Keycloak authentication flow
│   └── DashboardPage.ts     # Authenticated user dashboard
│
├── tests/
│   ├── global.setup.ts      # Keycloak auth state setup (for authenticated tests)
│   └── ui/
│       ├── homepage.spec.ts
│       ├── games.spec.ts
│       ├── loyalty.spec.ts
│       ├── auth.spec.ts
│       └── navigation.spec.ts
│
├── utils/
│   ├── ApiClient.ts         # Typed Playwright API request wrapper
│   └── TestDataGenerator.ts # Faker-based test data factory
│
├── .env.example             # Environment variable template
├── .env.local               # Local overrides (gitignored)
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

Open `.env.local` and set your values:

```env
BASE_URL=https://playonkansas.com
TEST_USER_EMAIL=your-test-account@example.com
TEST_USER_PASSWORD=your-password
```

### 4. Run the tests

```bash
npm test
```

Tests run headless by default. Open the HTML report when done:

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
npx playwright test tests/ui/homepage.spec.ts

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

### HTML Report

After every test run Playwright automatically generates an HTML report in `playwright-report/`. Open it with:

```bash
npm run test:report
```

The report shows:
- Pass / fail status per test
- Screenshots on failure
- Traces and videos (on first retry)
- Full error messages and stack traces

To view a trace from a failed test:

```bash
npm run test:trace
# then open the .zip file from test-results/
```

---

## Page Object Model

Each page has a corresponding class in `pages/`. Tests never contain raw selectors.

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

The site does not use `data-testid` attributes. Priority order:

1. ARIA roles — `page.getByRole('button', { name: /play/i })`
2. Labels — `page.getByLabel(/email/i)`
3. Text — `page.getByText(/kansas cashout/i)`
4. CSS (last resort) — `page.locator('.MuiCard-root')`

---

## Authentication

Authenticated tests use Keycloak session state saved by `tests/global.setup.ts`. The setup authenticates via Keycloak's token endpoint (bypasses browser UI and reCAPTCHA), injects the token into browser storage, and saves the full state to `.auth/user.json`.

To run setup manually:

```bash
npx playwright test --project=setup
```

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/playwright.yml`):

- Runs on push, PR, nightly schedule, and manual dispatch
- Shards tests across 4 parallel runners
- Caches Playwright browsers between runs
- Uploads merged HTML report as artifact (30-day retention)
- Supports `environment` and `browser` inputs on manual trigger

### Required GitHub Secrets

```
BASE_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## Stability Guidelines

- No `waitForTimeout` — use Playwright's built-in auto-waiting
- No hardcoded sleeps — if you need a wait, there's a better locator
- Retries on CI — `retries: 2` handles transient network failures
- Each test sets up its own state — no shared mutable state between tests

---

## Common Issues

| Issue | Solution |
|---|---|
| Element not found | Use `page.pause()` in debug mode to inspect the live DOM |
| Test flaky on CI | Enable `trace: 'on'` and inspect with `npx playwright show-trace` |
| Auth state missing | Run `npx playwright test --project=setup` first |
| Wrong base URL | Check `ENV` and `.env.local` |
