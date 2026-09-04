# Nexo automation framework architecture

Handbook for **you** to implement. This file is analysis and a blueprint. It is not a generated Playwright project.

How to use it: read §1–§6 before creating files. Skim §7–§12 before the second spec. Use §13–§16 as a checklist while the suite grows. Pair with [README.md](./README.md) (start here) and the [learning guide](../AUTOMATION_LEARNING_GUIDE.md).

---

## Contents

1. [Placement: same repo vs outside vs another branch](#1-placement-same-repo-vs-outside-vs-another-branch)
2. [Goals and constraints](#2-goals-and-constraints)
3. [Test pyramid and oracles](#3-test-pyramid-and-oracles)
4. [Target directory structure](#4-target-directory-structure)
5. [Global config (`playwright.config.ts`)](#5-global-config-playwrightconfigts)
6. [Environment, secrets, and base URL](#6-environment-secrets-and-base-url)
7. [Locator strategy](#7-locator-strategy)
8. [Spec design, naming, and tags](#8-spec-design-naming-and-tags)
9. [Page objects — when and how](#9-page-objects--when-and-how)
10. [Fixtures](#10-fixtures)
11. [Auth architecture](#11-auth-architecture)
12. [API layer in the suite](#12-api-layer-in-the-suite)
13. [Test data](#13-test-data)
14. [What to automate at each app iteration](#14-what-to-automate-at-each-app-iteration)
15. [Stability, traces, and anti-patterns](#15-stability-traces-and-anti-patterns)
16. [CI (later)](#16-ci-later)
17. [Bootstrap commands (you type these)](#17-bootstrap-commands-you-type-these)
18. [Definition of a healthy suite](#18-definition-of-a-healthy-suite)

---

## 1. Placement: same repo vs outside vs another branch

### Recommendation

**Keep automation in this repository, on `main`, under `e2e/`, with `playwright.config.ts` at the repo root.**

Nexo is one Next.js app plus tests that must follow the same locators, seed users, and `/api/*` contract. Splitting that across repos or branches is how labs die.

### Comparison

| Approach                                 | What it means                                                                                                                                                           | Fit                                                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Same repo, `main`, `e2e/`**         | Clone once. App change and test change can ship together. Playwright `webServer` can start `npm run dev`. You can import `lib/test-ids.ts` (it has no Next.js runtime). | **Best.**                                                                                                                                            |
| **B. Separate GitHub repo**              | `Nexo-Automation-Tests` pointing at a deployed or local URL.                                                                                                            | Two clones, two PRs, locator drift. Only makes sense for a vendor QA team that cannot write the product repo. That is not this lab.                  |
| **C. Tests only on `nexo-dev`**          | `main` has the app; backup branch has Playwright.                                                                                                                       | Tests never track the code you actually run. `nexo-dev` is a **snapshot of `main`**, not a QA silo. Refresh it with `git push origin main:nexo-dev`. |
| **D. Feature branch that never merges**  | `cursor/…` or `tests` branch lives forever.                                                                                                                             | Same drift as C. Feature branches are for unfinished work, then merge to `main`.                                                                     |
| **E. Monorepo package** (`packages/e2e`) | Extra workspace tooling.                                                                                                                                                | Overkill. One `package.json` at the root is enough.                                                                                                  |
| **F. Local folder, no Git**              | Copy of the app on Desktop.                                                                                                                                             | You will miss pushes from Cursor Cloud / GitHub. Do not do this.                                                                                     |

### How Cursor should be set up

1. Clone `https://github.com/Favelas/Nexo-Automation.git` to `C:\Users\maryf\Documents\Nexo-Automation`.
2. **File → Open Folder** on that path (this **is** the Git repo).
3. Stay on **`main`**. Pull before you work, push when a spec is green.
4. Do **not** open a second Cursor window on a ZIP or a non-Git copy.

Git vs “local folder”: the fast path is **both** — a local folder that **is** the clone. See the root README section **Cursor + Git**.

### What this repo will not do for you

This handbook will not add `e2e/` or `playwright.config.ts`. You create them. That is the learning goal.

---

## 2. Goals and constraints

**Goals**

- Prove the product: login, RBAC, customer isolation, agent status, one cross-role journey.
- Learn Playwright the way a job uses it: config, fixtures, API + UI, traces — not 80 duplicated E2E clones.
- Keep the suite smaller than the app.

**Constraints**

- Next.js App Router hydrates. Naive `click` + `waitForTimeout` will flake. Use locators and web-first assertions (`toBeVisible`, `toHaveURL`).
- One Postgres + shared seed. Parallel workers that all PATCH `NX-000001` will race. Seed = identity/reads; writes = create-per-test.
- UI oracles are **navigation and visible text**. API oracles are **status codes**. Do not treat a missing button as a security test.
- Iteration 1 has **no session**. Do not write a “successful login” spec until that works manually.

**Stack (pin when you init)**

- `@playwright/test` (latest stable you install)
- TypeScript (already in the app)
- Chromium first; Firefox/WebKit after Chromium is boringly green
- Node 20+ (same as the app)

You do not need Cucumber, Selenium, Cypress, or a Java/TestNG stack for this lab. One runner.

---

## 3. Test pyramid and oracles

```
            ┌─────────────────────┐
            │  1–2 UI journeys    │  customer creates → agent resolves → customer sees
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │  UI: forms + nav    │  login form, redirects, labels, tables
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │  API: rules         │  401 / 403 / 404, isolation, status PATCH
            └─────────────────────┘
```

| Layer                   | Nexo examples                                                                                     | Do not use this layer for                           |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| API (`request` fixture) | `GET /api/requests/NX-000003` as customer A → 404; agent `POST /api/requests` → 403; status PATCH | Pixel layout, accessible names                      |
| UI                      | Login form, field errors, nav, redirect when logged out                                           | Re-proving every status code already covered by API |
| Journey (UI, few)       | A creates → agent `IN_PROGRESS` → `RESOLVED` → A sees status                                      | Ten copies of the same flow                         |

**Oracles (must match the app)**

| Situation                                 | UI                                | API                |
| ----------------------------------------- | --------------------------------- | ------------------ |
| Anonymous                                 | Redirect `/login`                 | `401`              |
| Wrong role                                | Redirect to that user’s dashboard | `403`              |
| Customer reads another customer’s request | Not found (no existence leak)     | **`404`**, not 403 |
| Agent reads any existing request          | Detail                            | `200`              |

Error JSON (when APIs exist): `{ "error": { "code", "message" } }`.

If a test “passes” because a button was hidden, it is not an RBAC test.

---

## 4. Target directory structure

Create this **incrementally**. Day one needs only `playwright.config.ts` + `e2e/smoke/login-form.spec.ts`. Folders below are the shape to grow into — not a homework dump on day one.

```
Nexo-Automation/                          ← Git root = Cursor folder
├── playwright.config.ts                  ← global config (you add)
├── e2e/
│   ├── smoke/
│   │   └── login-form.spec.ts            ← Iteration 1: form visible, stays on /login
│   ├── auth/
│   │   ├── login.spec.ts                 ← Iteration 2+: valid / invalid / logout
│   │   └── rbac-redirects.spec.ts
│   ├── customer/
│   │   ├── create-request.spec.ts
│   │   └── isolation.spec.ts             ← UI not-found; pair with API spec
│   ├── agent/
│   │   └── status.spec.ts
│   ├── api/
│   │   ├── auth.spec.ts
│   │   ├── requests-isolation.spec.ts
│   │   └── requests-rbac.spec.ts
│   ├── journeys/
│   │   └── customer-agent-resolve.spec.ts
│   ├── pages/                            ← POM: add when locators are duplicated
│   │   ├── login.page.ts
│   │   ├── app-shell.page.ts
│   │   ├── customer-requests.page.ts
│   │   └── agent-request-detail.page.ts
│   ├── fixtures/
│   │   └── index.ts                      ← customerPage, agentPage, apiAs(role)
│   ├── support/
│   │   ├── users.ts                      ← emails from README seed contract
│   │   ├── env.ts                        ← baseURL, password from env
│   │   └── data.ts                       ← unique titles, workerIndex
│   └── .auth/                            ← storageState JSON (gitignored)
├── test-results/                         ← gitignored
├── playwright-report/                    ← gitignored
├── app/ …                                ← product
└── lib/test-ids.ts                       ← product locator constants (optional import)
```

**Why `e2e/` not `tests/`?** Next.js and other tools often use `tests/` or `__tests__` for unit tests later. `e2e` states intent. If Playwright init offers `tests/`, you may rename to `e2e` and set `testDir: './e2e'`.

**What not to add on day one:** `pages/`, `fixtures/`, `.auth/`, extra browsers, Allure, Docker-in-Docker.

**`.gitignore` (add if missing):**

```
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/e2e/.auth/
```

---

## 5. Global config (`playwright.config.ts`)

This is the **control plane** of the suite. One file at the **repository root** so `npx playwright test` works from `C:\Users\maryf\Documents\Nexo-Automation`.

You will create this file. Below is the shape to aim for, with **why** each option exists. Type it yourself; adjust as you learn.

### Mental model

```
playwright.config.ts
  defineConfig({
    testDir,          // where spec files live
    timeout,          // per-test budget
    expect,           // assertion wait
    fullyParallel,    // file-level parallel
    workers,          // process count
    retries,          // CI only, usually
    reporter,         // list + html
    use {             // default for every test
      baseURL,
      trace, screenshot, video,
      testIdAttribute,
      actionTimeout, navigationTimeout,
      storageState,   // later, per project
    },
    webServer {       // start Next.js if not already running
    },
    projects [        // chromium now; auth projects later
    ],
  })
```

### Options to set (and why)

| Option                          | Starting value                                                       | Why                                                                              |
| ------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `testDir`                       | `'./e2e'`                                                            | Keeps specs out of `app/`.                                                       |
| `timeout`                       | `30_000`                                                             | One test should not hang a minute. Raise per-test only for a known slow journey. |
| `expect.timeout`                | `5_000`                                                              | Auto-wait for assertions. Do not use `waitForTimeout(5000)`.                     |
| `fullyParallel`                 | `true` later; **`false` at first**                                   | Easier debugging until you understand workers × seed data.                       |
| `workers`                       | `1` at first; `undefined` (CPU) later                                | Shared DB. Start serial. Parallel only after create-per-test.                    |
| `retries`                       | `0` locally; `2` on CI                                               | Retries hide local bugs. CI flakes from timing can retry once you have traces.   |
| `forbidOnly`                    | `!!process.env.CI`                                                   | Prevents `test.only` from merging green on CI while skipping the suite.          |
| `reporter`                      | `[['list'], ['html', { open: 'never' }]]`                            | Terminal + `npx playwright show-report`.                                         |
| `use.baseURL`                   | `http://localhost:3000`                                              | `page.goto('/login')` instead of full URLs.                                      |
| `use.trace`                     | `'on-first-retry'` locally; `'retain-on-failure'` on CI is also fine | Trace viewer is how you debug hydration flakes.                                  |
| `use.screenshot`                | `'only-on-failure'`                                                  |                                                                                  |
| `use.video`                     | `'retain-on-failure'` or `'off'` at first                            | Video is heavy; traces often enough.                                             |
| `use.testIdAttribute`           | `'data-testid'` (Playwright default)                                 | Matches `lib/test-ids.ts`.                                                       |
| `use.actionTimeout`             | `10_000`                                                             | Click/fill fail clearly instead of hanging until `timeout`.                      |
| `use.navigationTimeout`         | `15_000`                                                             | Next.js compile on first route can be slow.                                      |
| `use.locale` / `timezoneId`     | `'en-US'` / `'UTC'`                                                  | Deterministic dates later.                                                       |
| `webServer.command`             | `'npm run dev'`                                                      | Playwright starts the app.                                                       |
| `webServer.url`                 | `http://localhost:3000`                                              | Wait until ready.                                                                |
| `webServer.reuseExistingServer` | `!process.env.CI`                                                    | Locally reuse the terminal you already started; CI always boots fresh.           |
| `webServer.timeout`             | `120_000`                                                            | First Next compile.                                                              |

### Projects (grow into this)

**Day one:** one project, Chromium, no `storageState`.

```ts
projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }];
```

**After login works:** three projects (or fixtures instead of projects — fixtures are often simpler to learn first):

| Project           | `storageState`                                    | Tests                            |
| ----------------- | ------------------------------------------------- | -------------------------------- |
| `setup`           | writes `e2e/.auth/customer.json` and `agent.json` | Login once via UI or API         |
| `customer`        | `e2e/.auth/customer.json`                         | Most customer UI                 |
| `agent`           | `e2e/.auth/agent.json`                            | Agent UI                         |
| `unauthenticated` | none                                              | Login form, logged-out redirects |

Do **not** start with setup projects. One Chromium project + a login in the spec is enough until login is duplicated.

### `webServer` vs you starting `npm run dev`

Either works. If both bind port 3000, one fails. Local habit: start the app yourself (`reuseExistingServer: true`). CI: let Playwright start it (`CI=true` → no reuse).

### TypeScript

Playwright uses its own loader. You do **not** need to put `e2e` in the Next.js `tsconfig` include, but you may. If you import `@/lib/test-ids`, ensure Playwright can resolve `@/*` (duplicate `paths` in a `e2e/tsconfig.json` or use relative imports `../../lib/test-ids`). Relative imports are simpler on day one.

### Scripts to add in `package.json` (you add)

```json
{
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

Keep `npm test` unused or pointed at unit tests later so you do not confuse “Playwright” with “Jest”.

---

## 6. Environment, secrets, and base URL

| Variable              | Where        | Purpose                                                 |
| --------------------- | ------------ | ------------------------------------------------------- |
| `DATABASE_URL`        | `.env.local` | App + Prisma, not Playwright directly                   |
| `AUTH_SECRET`         | `.env.local` | App sessions (Iteration 2+)                             |
| `TEST_USER_PASSWORD`  | `.env.local` | Seed users and tests (`Password123!` in `.env.example`) |
| `PLAYWRIGHT_BASE_URL` | optional     | Override `baseURL` in CI or against another host        |

**Rules**

- Tests read the **same** password as seed. Do not hardcode a second password in specs.
- Never commit `.env.local`. `.env.example` documents keys.
- Playwright can load `.env.local` with `dotenv` in `playwright.config.ts` (`import 'dotenv/config'` plus a small snippet to load `.env.local`, or `dotenv-cli`). The app already has `dotenv-cli` for Prisma.
- Seed emails are **not** secrets. They are the contract in the root README. Put them in `e2e/support/users.ts`.

**`users.ts` sketch (you write it):**

```ts
export const users = {
  customerA: { email: "customer.a@nexo.test", role: "CUSTOMER" as const },
  customerB: { email: "customer.b@nexo.test", role: "CUSTOMER" as const },
  agent: { email: "agent@nexo.test", role: "AGENT" as const },
};
export const password = () => process.env.TEST_USER_PASSWORD ?? "Password123!";
```

---

## 7. Locator strategy

Priority:

1. **Accessible name:** `getByRole('button', { name: 'Log in' })`, `getByLabel('Email')`, `getByRole('heading', { name: 'Log in' })`.
2. **`getByTestId`:** Nexo sets `id` and `data-testid` to the same string. List: root README **Locator IDs**; code: `lib/test-ids.ts`.
3. **`getByText`:** brittle for long paragraphs; OK for a unique status word if needed.
4. **CSS / XPath:** last resort. Do not target Tailwind classes (`bg-nexo-navy`). They will change.

**Playwright**

```ts
await page.getByTestId("login-email").fill(users.customerA.email);
await page.getByRole("button", { name: "Log in" }).click();
await expect(page).toHaveURL(/\/customer\/dashboard/);
await expect(page.getByTestId("page-heading")).toHaveText("Customer dashboard");
```

**Hydration:** `toBeVisible` waits for the element to be ready. Do not `waitForLoadState('networkidle')` as a habit on Next.js (it often never goes idle). Prefer URL + heading assertions.

**Lists / rows (later):** when seed rows exist, give each row a test id such as `request-row-NX-000001` in the **app** (you or a later iteration). Until then, empty table uses `request-table-empty`.

**Strict mode:** `getByTestId('nav-dashboard')` must match **one** node. In-page CTAs use `cta-new-request` / `cta-request-queue` so they do not clash with header nav.

---

## 8. Spec design, naming, and tags

**One behavior per test.** Name what the user/API guarantees.

```ts
test('valid customer login lands on customer dashboard', …); // Iteration 2+
test('customer A cannot fetch customer B request NX-000003 via API', …);
```

Bad: `test('test1')`, `test('login works')` (which login?).

**File names:** `login.spec.ts`, `requests-isolation.spec.ts`. Playwright picks up `*.spec.ts` by default.

**Describe blocks:** group by actor or feature, not by “smoke vs regression” only.

**Tags (optional, later):**

```ts
test('…', { tag: '@api' }, async ({ request }) => { … });
```

Run with `--grep @api`. Do not tag everything `@smoke` on day one; your only spec _is_ smoke.

**Independent tests:** no test should require another test to have run first. No shared `let publicId` across files.

---

## 9. Page objects — when and how

**When:** the same locators appear in a **second** file. Not before. A single login spec does not need `LoginPage`.

**What a page object is:** locators + small flows (`loginAs(email, password)`). It is not a dumping ground for assertions (keep expect in the spec so the spec still reads as the requirement).

**Sketch (later):**

```ts
export class LoginPage {
  constructor(private readonly page: Page) {}
  email = () => this.page.getByTestId("login-email");
  password = () => this.page.getByTestId("login-password");
  submit = () => this.page.getByRole("button", { name: "Log in" });
  async goto() {
    await this.page.goto("/login");
  }
  async login(email: string, password: string) {
    await this.email().fill(email);
    await this.password().fill(password);
    await this.submit().click();
  }
}
```

**Anti-pattern:** a 400-line `BasePage` hierarchy. Nexo needs `LoginPage`, `CustomerRequestsPage`, `AgentRequestDetailPage`, maybe `AppShell` for nav/logout.

---

## 10. Fixtures

Playwright fixtures replace most `beforeEach` globals.

**Day one:** use the built-in `{ page }`. No custom fixtures.

**After login exists and is duplicated:**

```ts
export const test = base.extend<{ customerPage: Page }>({
  customerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "e2e/.auth/customer.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

Built-in `{ request }` is the API client. Prefer `request` over `page.request` when no browser is needed (faster, no hydration).

---

## 11. Auth architecture

Three layers. Grow in this order.

| Layer                   | How                                                  | Use for                                              |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| 1. UI login in the spec | Fill form, click **Log in**                          | **One** happy-path login test; invalid login; logout |
| 2. `storageState`       | Save cookies after one login; reuse                  | All other UI tests                                   |
| 3. API login            | `POST /api/auth/login` then storage or cookie header | API specs; creating `storageState` faster than UI    |

**Iteration 1:** only layer 1 **without** expecting a dashboard. Assert you **remain** on `/login` and (optionally) see the placeholder status `login-status`.

**Do not** log in through the UI in every file once layer 2 exists. That is slow and doubles flake surface.

**Cookie:** HTTP-only session from Auth.js (Iteration 2). Do not scrape cookie names until that is documented in `docs/API.md`. If the real route is `/api/auth/[...nextauth]`, update API.md and your helper in the same change.

---

## 12. API layer in the suite

When `/api/*` exists:

- Use `request.post('/api/auth/login', { data: { email, password } })`.
- Store cookies from the response (`storageState` from `APIRequestContext` is supported in Playwright).
- Assert `status()` first, then `json()`.
- Isolation spec: authenticate as A, `GET /api/requests/NX-000003` → 404.
- Do not parse HTML in API tests.

Thin helper (later): `e2e/support/api.ts` with `login(request, user)`, `createRequest(...)`, `patchStatus(...)`. Specs stay readable.

UI tests should not duplicate the entire API matrix. If API already proves 403 for agent create, the UI test only checks there is no **Create request** for the agent (no `cta-new-request` / no `/customer/requests/new` in nav).

---

## 13. Test data

**Seed (read-only in CI once it exists)**

| Id          | Owner | Status      | Tests may                    |
| ----------- | ----- | ----------- | ---------------------------- |
| `NX-000001` | A     | SUBMITTED   | Read, isolation target for B |
| `NX-000002` | A     | IN_PROGRESS | Read                         |
| `NX-000003` | B     | RESOLVED    | Read; A must 404             |

**Writes:** `POST /api/requests` or UI create with a unique title:

```ts
const title = `E2E printer ${test.info().workerIndex} ${Date.now()}`;
```

Then assert list contains that title. PATCH **that** public id, never `NX-000001`, unless a single dedicated spec is documenting seed reset.

**Reset:** `npm run db:reset` restores seed (Iteration 5). Tests should not require a reset between tests if they create their own rows. Reset belongs in CI **before** the suite, not in `afterEach`.

**Parallel:** only after writes are unique. Until then `workers: 1`.

---

## 14. What to automate at each app iteration

| App iteration | Product                         | Your suite                                                                                        |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| **1 (now)**   | Pages + locators, no auth       | `e2e/smoke/login-form.spec.ts`: `/login`, labels/testids, submit does not navigate to a dashboard |
| **2**         | Auth.js, seed users, middleware | Valid A/agent login, invalid login alert, logout, anonymous redirect, wrong-role redirect         |
| **3**         | Customer create/list/detail     | Create validation; happy create; A does not see B’s id in the table                               |
| **4**         | Agent queue/status              | Agent sees both customers; status change visible to A                                             |
| **5**         | Seed reset, API parity          | API isolation/RBAC; `storageState`; one journey; then CI                                          |

Manual quality gate: `docs/PRODUCT_REQUIREMENTS.md`. Do not mark a feature “automation-ready” until that checklist passes by hand.

---

## 15. Stability, traces, and anti-patterns

**Do**

- `expect(locator).toBeVisible()`, `toHaveURL`, `toHaveText`
- Click the locator, not coordinates
- Open trace: `npx playwright show-trace test-results/.../trace.zip`
- Fail on `test.only` in CI (`forbidOnly`)

**Do not**

- `page.waitForTimeout(3000)`
- `page.locator('.flex > button:nth-child(2)')`
- One spec that logs in, creates, acts as agent, asserts history, and checks isolation (split: API isolation + one journey)
- Visual screenshot diffs of whole pages (layout lab, not MVP)
- Automating register/forgot-password (not in MVP)

**Next.js first load:** first `goto` after `next dev` can be slow. Config `navigationTimeout` and `webServer.timeout` handle that. If a test is still flaky, assert heading after URL, not a fixed sleep.

---

## 16. CI (later)

When the suite is green locally with `workers > 1` (or a conscious `workers: 1` in CI):

- GitHub Actions on `main`: checkout, Node 20, `npm ci`, Playwright browsers (`npx playwright install --with-deps chromium`), Docker Compose Postgres, `npx prisma migrate deploy`, seed/reset, `CI=true npx playwright test`.
- Upload `playwright-report` and traces on failure.
- `webServer.reuseExistingServer` must be false on CI.

Do not add CI on day one.

---

## 17. Bootstrap commands (you type these)

From the repo root, with the app able to boot (`npm install` already done).

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
git checkout main
git pull origin main
npm run dev
```

In a **second** terminal, after you have added Playwright:

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
npx playwright install chromium
npx playwright test --headed
```

Typical init (choose **TypeScript**, tests in `e2e` if asked, GitHub Action **no** for now):

```powershell
npm init playwright@latest
```

Then edit the generated config to match §5 (`testDir`, `baseURL`, `webServer`, `workers: 1`).

First spec idea (Iteration 1) — write it in your own words:

- `goto('/login')`
- expect `login-form` or heading **Log in**
- expect Email and Password fields
- fill and submit
- expect URL still `/login` (no dashboard)

When green:

```powershell
git add playwright.config.ts e2e package.json package-lock.json
git commit -m "Add Playwright smoke for login form."
git push origin main
git push origin main:nexo-dev
```

---

## 18. Definition of a healthy suite

You are doing this right when:

- A new teammate runs `npm run dev` and `npx playwright test` without extra tribal docs.
- Failures name the **product rule** (404 isolation, wrong dashboard), not `timeout 30000`.
- Deleting `NX-000001` mutation from all but at most one spec does not break CI.
- The HTML report + a trace are enough to debug without a huddle.
- The suite is smaller than the number of pages × statuses × roles.

Then follow [AUTOMATION_ROADMAP.md](../AUTOMATION_ROADMAP.md) for levels 1–13.

Related: [QA_CHALLENGES.md](../QA_CHALLENGES.md), [API.md](../API.md), [ARCHITECTURE.md](../ARCHITECTURE.md), root README test data and locator tables.
