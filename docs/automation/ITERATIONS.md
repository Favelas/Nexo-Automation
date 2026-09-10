# Iterations — product vs suite

**What this is:** Live tracker — where the **app** is (I1–I5) and what the **suite** may prove.  
**Not this:** What to **build** ([../DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md)), skill lessons ([AUTOMATION_LEARNING_GUIDE.md](./AUTOMATION_LEARNING_GUIDE.md)), or daily Builder steps ([PROGRESS.md](./PROGRESS.md)).

Two tables in this file — they are **not** the same queue:

| Table | Order for | `[x]` means |
| ----- | --------- | ----------- |
| **Status (I1–I5)** | What to do **next** (product, then manual gate, then specs) | That iteration’s product or suite is **fully** done |
| **Automation levels (0–13)** | Skills you already used. **Not** the next ticket | That skill’s definition of done is **fully** true |

Tick `[x]` only when the row is complete. Do not tick Level 5 because 0–4 are done. After L4, the next work is **Status → I3 Suite**, still with `LoginPage.login(...)`.

How to use Status: product row first, manual gate second, spec third.

Sources: [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md), [PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md), [FRAMEWORK.md §14](./FRAMEWORK.md#14-what-to-automate-at-each-app-iteration), [AUTOMATION_ROADMAP.md](./AUTOMATION_ROADMAP.md). Day-to-day steps: [PROGRESS.md](./PROGRESS.md).

The product roadmap says “start Playwright after Iteration 5”. This lab also allows an Iteration 1 smoke (`FRAMEWORK.md`). That smoke is done. From here: **product first, test after**.

## Current stop

| Track | Stop | Next |
| ----- | ---- | ---- |
| Product | **Iteration 3 done** — customer create / list / detail, categories seeded | **Next:** I4 agent queue / status |
| Automation | **I3 suite green** — create / list / detail / isolation | **Next:** I4 product (agent queue / status). No fixtures yet |

```
Product:     [I1 done] → [I2 done] → [I3 done] → I4 Agent → I5 API/seed → STOP product
Automation:  [L0–4 done] → [I3 suite done] → wait for I4 product
```

## Status

Tick when true. Do not tick a suite row before the matching product gate is manual-green.

| ID | Product | Manual gate | Suite (only after gate) | Product | Suite |
| -- | ------- | ----------- | ----------------------- | ------- | ----- |
| I1 | Skeleton, Postgres, Prisma, placeholder pages, login form **does not authenticate** | App boots; `/login` labeled; page map renders | `e2e/smoke/login-form.spec.ts` — form visible | [x] | [x] |
| I2 | Auth.js Credentials, 3 seed users, middleware, real dashboards | Auth checklist below | Valid A + agent login; invalid + `role="alert"`; logout; anonymous → `/login`; wrong-role redirect | [x] | [x] |
| I3 | Customer create / list / detail | Create → My requests → detail `NX-######` | Create validation; happy create; A does not see B’s id in the table | [x] | [x] |
| I4 | Agent queue / detail / status | Queue has two customers; 3 statuses; A sees the new status | Agent sees both customers; status change visible to A | [ ] | [ ] |
| I5 | Seed, `db:reset`, API matches UI | Full quality gate in `PRODUCT_REQUIREMENTS.md` | API isolation/RBAC; `storageState`; one journey; then CI | [ ] | [ ] |

Out of MVP (never in these five): admin, register, forgot password, comments, uploads, search, email.

## Automation levels (suite skill, not the daily queue)

Tick `[x]` only when that level is **fully** done. A `[x]` on 0–4 does **not** mean “do Level 5 now”.

| Level | Name | Definition of done | Status |
| ----- | ---- | ------------------ | ------ |
| 0 | Smoke (Iteration 1) | You added config. One spec: form visible | [x] |
| 1 | Basic Playwright | After auth exists: one spec, valid customer login | [x] |
| 2 | Selectors | Login and nav use role/label. No CSS-class selectors | [x] |
| 3 | Assertions | Login spec asserts URL + heading. Zero `waitForTimeout` | [x] |
| 4 | POM | Login locators extracted after auth tests copied them | [x] |
| 5 | Fixtures | `customerPage` / `agentPage`; specs no longer paste login | [ ] |
| 6 | Auth strategies | `storageState` for both roles. One UI spec still covers the form | [ ] |
| 7 | API | Isolation and status via `/api/*` | [ ] |
| 8 | Test data | Writes create their own requests. Seed `NX-000001` is read-only in CI | [ ] |
| 9 | RBAC | Role × route: UI redirects and API 401/403/404 | [ ] |
| 10 | Workflows | One customer → agent → customer journey | [ ] |
| 11 | Parallel | Green with workers > 1 | [ ] |
| 12 | CI | GitHub Actions: lint/build + Playwright + Compose Postgres | [ ] |
| 13 | Advanced | Trace on failure; at least one accessibility assertion | [ ] |

Levels 0–4 are complete (smoke, login spec, POM). I3 specs still paste `LoginPage.login(...)`. Level 5 stays empty until you extract that on purpose. Do not fill `e2e/fixtures/` to “look ready”.

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

1. **Structure** — specs only where a test exists (`e2e/smoke/`, `e2e/auth/`, `e2e/customer/`). Empty fixture files are not progress.
2. **What to automate** — only what the current iteration guarantees by hand.
3. **Less regression** — few tests, product oracles. Do not keep `example.spec.ts` (playwright.dev). Do not write a red dashboard spec “for later”.

## What not to do at this stop

- Do not add more login or I3 customer tests.
- Do not add I4 specs until the agent queue is green by hand.
- Do not add `storageState` / custom fixtures yet.
- Do not treat `/playwright/.auth/` in `.gitignore` as the Nexo path. Session files (later) go under `e2e/.auth/` (already gitignored).
