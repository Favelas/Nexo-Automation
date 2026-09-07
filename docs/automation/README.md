# Automation — start here

This folder is the **automation handbook**. It teaches you how to design and grow a Playwright suite against Nexo. It does **not** contain test code. You add `playwright.config.ts` and `e2e/` yourself.

| Read this                                                          | When                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **This page**                                                      | First. Where tests live, what you can automate _today_, first 90 minutes.    |
| [PROGRESS.md](./PROGRESS.md)                                       | **Tracker.** Automation Builder steps 1–9 — what is done, what is next.      |
| [ITERATIONS.md](./ITERATIONS.md)                                   | **Tracker.** Product I1–I5 vs suite levels 0–13; Auth gate; tick boxes.      |
| [FRAMEWORK.md](./FRAMEWORK.md)                                     | Before you create folders. Architecture, global config, POM, auth, data, CI. |
| [../AUTOMATION_LEARNING_GUIDE.md](../AUTOMATION_LEARNING_GUIDE.md) | Curriculum (concept → practice).                                             |
| [../AUTOMATION_ROADMAP.md](../AUTOMATION_ROADMAP.md)               | Levels and definition of done.                                               |
| [../QA_CHALLENGES.md](../QA_CHALLENGES.md)                         | Exercises without spoilers.                                                  |
| [../../README.md](../../README.md)                                 | App boot, seed accounts, locator `data-testid` list.                         |

## Where should the suite live?

**Inside this GitHub repo, on `main`, in an `e2e/` folder.** That is the recommendation. Full analysis is in [FRAMEWORK.md — Placement](./FRAMEWORK.md#1-placement-same-repo-vs-outside-vs-another-branch).

| Option                            | Verdict for Nexo                                                           |
| --------------------------------- | -------------------------------------------------------------------------- |
| Same repo, `e2e/` on `main`       | **Do this.** App and tests version together. One clone, one Cursor folder. |
| Separate repo                     | No. Locators and API drift the week the UI changes.                        |
| Tests only on `nexo-dev`          | No. `nexo-dev` is a **backup** of `main`, not a test silo.                 |
| Download ZIP / folder without Git | No. You will not see agent pushes or history.                              |

You still **write** every spec. Level 0 (`e2e/smoke/login-form.spec.ts`) exists. Track ticks in [PROGRESS.md](./PROGRESS.md) and [ITERATIONS.md](./ITERATIONS.md).

## What you can automate right now

Level 0 smoke is in `e2e/smoke/login-form.spec.ts` (form visible). Product Iteration 2 is wiring auth. **Do not add `e2e/auth/` until the Auth gate is green by hand** ([ITERATIONS.md](./ITERATIONS.md)).

| Automate now (Level 0) | Wait for Auth gate, then I2 suite |
| ---------------------- | --------------------------------- |
| `/login` form + labels | Valid login → dashboard           |
| Heading **Log in**     | Invalid-login `role="alert"`      |
|                        | Logout, anonymous + wrong-role redirects |
|                        | Create request, status, API 401/403/404 |

## First 90 minutes (after you have `npm run dev` working)

1. Read [FRAMEWORK.md](./FRAMEWORK.md) sections 1–6 (placement, pyramid, tree, config, env, locators).
2. From the repo root, run Playwright’s init yourself (`npm init playwright@latest` or install `@playwright/test` and create `playwright.config.ts`). Point `testDir` at `e2e`.
3. Install browsers: `npx playwright install chromium`.
4. Write **one** spec: login form visible. Use `getByLabel('Email')` **or** `getByTestId('login-email')`. Assert URL `/login`. No POM yet. No fixtures yet.
5. Run: `npx playwright test --headed` then without `--headed`.
6. Open the HTML report if a test fails. Do **not** add `waitForTimeout`.
7. Commit on **`main`**: config + first spec + `.gitignore` entries for `test-results/` and `playwright-report/`.
8. Pull/push as in the root README. Refresh backup when you want: `git push origin main:nexo-dev`.

When that one spec is green, follow the roadmap: selectors → assertions → POM only after you paste login locators a second time.

## Locator cheat sheet

App source of truth: [`lib/test-ids.ts`](../../lib/test-ids.ts). Full table: root README → **Locator IDs**.

Playwright default: `page.getByTestId('login-email')` reads `data-testid="login-email"` (also set as `id`).

Prefer, in this order:

1. `getByRole('button', { name: 'Log in' })` / `getByLabel('Email')`
2. `getByTestId('…')` from the table (status, page wrappers, row identity)
3. Never CSS classes or XPath as the first choice

## Accounts (when seed exists)

Password for all seed users: `Password123!` (`TEST_USER_PASSWORD`).

| Email                  | Role     | After login           |
| ---------------------- | -------- | --------------------- |
| `customer.a@nexo.test` | CUSTOMER | `/customer/dashboard` |
| `customer.b@nexo.test` | CUSTOMER | `/customer/dashboard` |
| `agent@nexo.test`      | AGENT    | `/agent/dashboard`    |

Do not PATCH seed row `NX-000001` from every test. Isolation: A reading `NX-000003` is API **404**, not 403.

## Cursor + Git while you build tests

Same loop as the app: one clone at `C:\Users\maryf\Documents\Nexo-Automation`, branch **`main`**, `git pull` then `git push`. Do not put the suite in a second folder outside Git.
