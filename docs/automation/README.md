# Automation — start here

**What this is:** Index of the Playwright handbook. Where tests live, what you can automate today, first 90 minutes.  
**Not this:** How to boot the app (root [README.md](../../README.md)) or what the product must do ([../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md)). Product docs live in [../README.md](../README.md).

This folder does **not** contain test code. Specs live in `e2e/`.

| Read this | What this is |
| --------- | ------------ |
| **This page** | First. Placement, today vs later, locator cheat sheet |
| [PROGRESS.md](./PROGRESS.md) | Day-to-day Builder — tick while you work |
| [ITERATIONS.md](./ITERATIONS.md) | Live tracker: product I1–I5 vs suite levels |
| [FRAMEWORK.md](./FRAMEWORK.md) | How to structure the suite (config, POM, data, CI) |
| [AUTOMATION_ROADMAP.md](./AUTOMATION_ROADMAP.md) | Skill levels — **definition of done** |
| [AUTOMATION_LEARNING_GUIDE.md](./AUTOMATION_LEARNING_GUIDE.md) | Same levels — **curriculum** (concept → practice) |
| [QA_CHALLENGES.md](./QA_CHALLENGES.md) | Exercises without spoilers |
| [../../README.md](../../README.md) | App boot, seed accounts, locator `data-testid` list |

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

Level 0 smoke is in `e2e/smoke/login-form.spec.ts`. I2 auth specs + `LoginPage` are in `e2e/auth/` and `e2e/pages/`. **Do not add create / isolation / status specs until product Iteration 3+ works by hand** ([ITERATIONS.md](./ITERATIONS.md)).

| Already automated | Wait for the matching product gate |
| ----------------- | ---------------------------------- |
| `/login` form + labels | Create request, list, detail (I3) |
| Valid / invalid login, logout, redirects | Agent queue / status (I4) |
| | API 401/403/404, seed rows (I5) |

## First 90 minutes (after you have `npm run dev` working)

Already done on this machine — see [PROGRESS.md](./PROGRESS.md). Keep the recipe if you re-init.

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
