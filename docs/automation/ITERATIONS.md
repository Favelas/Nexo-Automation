# Iterations — product vs suite

Place to track **where the app is** and **what the suite is allowed to prove**. Update the status table when an iteration ships or a level goes green.

How to use it: product row first, manual gate second, spec third. Do not write the dashboard login spec until Iteration 2 passes by hand.

Sources: [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md), [PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md), [FRAMEWORK.md §14](./FRAMEWORK.md#14-what-to-automate-at-each-app-iteration), [AUTOMATION_ROADMAP.md](../AUTOMATION_ROADMAP.md). Day-to-day steps: [PROGRESS.md](./PROGRESS.md).

The product roadmap says “start Playwright after Iteration 5”. This lab also allows an Iteration 1 smoke (`FRAMEWORK.md`). That smoke is done. From here: **product first, test after**.

## Current stop

| Track | Stop | Next |
| ----- | ---- | ---- |
| Product | **Iteration 2 done** — Auth.js, seed users, `proxy.ts`, dashboards | Iteration 3 — customer create / list / detail |
| Automation | **Level 0** — form visible smoke | **Level 1–3** — `e2e/auth/` (valid A/agent, invalid alert, logout, redirects). POM only if a second spec copies locators |

```
Product:     [I1 done] → [I2 done] → I3 Customer → I4 Agent → I5 API/seed → STOP product
Automation:  [L0 smoke done] → L1–3 auth specs → POM only if a second spec copies locators
```

## Status

Tick when true. Do not tick a suite row before the matching product gate is manual-green.

| ID | Product | Manual gate | Suite (only after gate) | Product | Suite |
| -- | ------- | ----------- | ----------------------- | ------- | ----- |
| I1 | Skeleton, Postgres, Prisma, placeholder pages, login form **does not authenticate** | App boots; `/login` labeled; page map renders | `e2e/smoke/login-form.spec.ts` — form visible | [x] | [x] |
| I2 | Auth.js Credentials, 3 seed users, middleware, real dashboards | Auth checklist below | Valid A + agent login; invalid + `role="alert"`; logout; anonymous → `/login`; wrong-role redirect | [x] | [ ] |
| I3 | Customer create / list / detail | Create → My requests → detail `NX-######` | Create validation; happy create; A does not see B’s id in the table | [ ] | [ ] |
| I4 | Agent queue / detail / status | Queue has two customers; 3 statuses; A sees the new status | Agent sees both customers; status change visible to A | [ ] | [ ] |
| I5 | Seed, `db:reset`, API matches UI | Full quality gate in `PRODUCT_REQUIREMENTS.md` | API isolation/RBAC; `storageState`; one journey; then CI | [ ] | [ ] |

Out of MVP (never in these five): admin, register, forgot password, comments, uploads, search, email.

## Automation levels (suite skill, not product)

| Level | Name | Definition of done | Status |
| ----- | ---- | ------------------ | ------ |
| 0 | Smoke (Iteration 1) | You added config. One spec: form visible; submit does not authenticate | [x] |
| 1 | Basic Playwright | After auth exists: one spec, valid customer login | [ ] |
| 2 | Selectors | Login and nav use role/label. No CSS-class selectors | [ ] |
| 3 | Assertions | Login spec asserts URL + heading. Zero `waitForTimeout` | [ ] |
| 4 | POM | Login locators extracted **only after** a second spec needed them | [ ] |
| 5 | Fixtures | `customerPage` / `agentPage`; specs no longer paste login | [ ] |
| 6 | Auth strategies | `storageState` for both roles. One UI spec still covers the form | [ ] |
| 7 | API | Isolation and status via `/api/*` | [ ] |
| 8 | Test data | Writes create their own requests. Seed `NX-000001` is read-only in CI | [ ] |
| 9 | RBAC | Role × route: UI redirects and API 401/403/404 | [ ] |
| 10 | Workflows | One customer → agent → customer journey | [ ] |
| 11 | Parallel | Green with workers > 1 | [ ] |
| 12 | CI | GitHub Actions: lint/build + Playwright + Compose Postgres | [ ] |
| 13 | Advanced | Trace on failure; at least one accessibility assertion | [ ] |

Levels 1–3 are unblocked. Levels 5–6 wait on real login copied across files. Do not fill `e2e/pages/` or `e2e/fixtures/` to “look ready”.

## Auth gate (unlocks I2 suite)

Pass **in the browser** before any `e2e/auth/` spec. Copy: [PRODUCT_REQUIREMENTS.md — Auth](../PRODUCT_REQUIREMENTS.md#auth).

- [x] Customer A (`customer.a@nexo.test` / `Password123!`) lands on `/customer/dashboard`
- [x] Agent (`agent@nexo.test` / same password) lands on `/agent/dashboard`
- [x] Invalid login stays on `/login` with generic error `role="alert"` (do not leak unknown email vs wrong password)
- [x] Logout → `/login`; session cannot open a protected page
- [x] Anonymous visit to a protected page → `/login`
- [x] Customer hitting `/agent/*` → customer dashboard
- [x] Agent hitting `/customer/*` → agent dashboard

Seed users are **not** in the database in Iteration 1. Iteration 2 loads them. Password: `TEST_USER_PASSWORD`. Requests `NX-000001`… are Iteration 5 (reads). Kit: root README **Test data**.

When this gate is green: add `e2e/auth/login.spec.ts`. Retire or rewrite the I1 smoke — “valid user stays on `/login`” becomes a **bug**, not an oracle.

## Rules that keep regression small

1. **Structure** — specs only where a test exists (`e2e/smoke/` now). Empty POM/fixture files are not progress.
2. **What to automate** — only what the current iteration guarantees by hand.
3. **Less regression** — few tests, product oracles. Do not keep `example.spec.ts` (playwright.dev). Do not write a red dashboard spec “for later”.

## What not to do at this stop

- Do not start Iteration 3 product and Level 1 auth specs in the same sitting if you will mix oracles.
- Do not start POM until a **second** spec copies login locators.
- Do not add `storageState` / custom fixtures yet.
- Do not treat `/playwright/.auth/` in `.gitignore` as the Nexo path. Session files (later) go under `e2e/.auth/` (already gitignored).
