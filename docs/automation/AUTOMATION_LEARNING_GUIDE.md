# Automation learning guide

**What this is:** Curriculum for the same levels as the roadmap — concept → why → when → Nexo → practice → expected result.  
**Not this:** One-line definition of done ([AUTOMATION_ROADMAP.md](./AUTOMATION_ROADMAP.md)) or live ticks ([ITERATIONS.md](./ITERATIONS.md)). Architecture: [README.md](./README.md).

Work in order. You **may** add Playwright now for an Iteration 1 **login-form smoke** (page renders, no real session). Do **not** write a “valid login lands on dashboard” spec until Iteration 2 works manually. A serious suite (RBAC, API, journeys) waits until Iteration 5’s quality gate is green. Architecture, folder layout, and global config: [README.md](./README.md). Start with **one** spec, not a framework.

## How you learn (coach contract)

**Goal:** you write the code and can explain every token on the line. Green tests the coach pasted do not count.

| Rule | Why (learning research, applied — not a lecture) |
| ---- | ------------------------------------------------ |
| You type the next `test()`. The coach names **one** method if you freeze. | **Generation effect** — producing the line beats reading it. |
| UI methods are **not** reused in API. If you only know `.fill` / `toHaveURL`, ask. | **Expertise reversal** — yesterday’s UI schema blocks today’s HTTP schema if we skip naming. |
| One idea per sitting (e.g. isolation, not isolation + `storageState` + CI). | **Cognitive load** — working memory holds few new tokens. |
| First file can be a worked example (`e2e/api/auth/login.spec.ts`). The next file you complete. | **Worked-example fading** — full example → fill the blanks → independent. |
| Four questions before code ([FEEDBACK.md](./FEEDBACK.md)). | Reduces load: value → after which call → where it lives → where it plugs in. |

API line-by-line: [API_TESTING.md](./API_TESTING.md). Cursor skill: `.cursor/skills/nexo-learn/SKILL.md`.

## Pyramid

| Layer               | Use for                                                                 | Not for                               |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| API                 | Rules, isolation, status transitions, 401/403/404                       | Pixel layout                          |
| UI                  | Forms, nav, accessible names, redirects                                 | Cloning every API case in the browser |
| Cross-role journeys | One or two flows (customer creates → agent resolves → customer sees it) | Dozens of E2E clones                  |

## Levels

### 1. Basic Playwright

- **Concept:** Browser automation is a real browser, not a unit test.
- **Why:** You will debug timing and navigation, not just assertions.
- **When:** First test only.
- **Nexo:** `/login`.
- **Practice:** Open the app, fill labeled fields, click **Log in**.
- **Expected:** One passing test that reaches the customer dashboard (after Iteration 2).

### 2. Selectors

- **Concept:** Role and label locators over CSS and XPath.
- **Why:** UI refactors break CSS; accessible names are the product.
- **When:** Every new page.
- **Nexo:** Email, Password, **Log in**, nav links, table captions.
- **Practice:** Rewrite any `locator('.btn-primary')` you were tempted to write.
- **Expected:** Tests use `getByRole` / `getByLabel`. `data-testid` only for nameless chrome (status badge, row id).

### 3. Assertions

- **Concept:** Auto-waiting assertions vs `waitForTimeout`.
- **Why:** Next.js hydration + naive clicks flake.
- **When:** Always.
- **Nexo:** URL, heading, alert, table row.
- **Practice:** Assert dashboard heading after login without `waitForTimeout`.
- **Expected:** No hardcoded sleeps in the suite.

### 4. Page Object Model

- **Concept:** Locators live in one place after duplication appears.
- **Why:** Login will be reused; premature POM is extra code.
- **When:** After the same locators are copy-pasted, not before.
- **Nexo:** `LoginPage`, later `CustomerRequestForm`.
- **Practice:** Extract login only when a second spec needs it.
- **Expected:** POM after duplication, not on day one.

### 5. Fixtures

- **Concept:** Shared setup (page, logged-in page) without globals.
- **Why:** `beforeEach` copy-paste drifts.
- **When:** Two or more specs share the same setup.
- **Nexo:** `customerPage`, `agentPage`.
- **Practice:** One fixture that lands an already-logged-in customer.
- **Expected:** Specs do not paste login steps forever.

### 6. Auth strategies

- **Concept:** UI login vs `storageState` vs API login.
- **Why:** Logging in through the form in every test is slow and flaky.
- **When:** After login itself is covered once via UI.
- **Nexo:** Cookie session from Auth.js.
- **Practice:** Save `storageState` for customer and agent.
- **Expected:** Most tests start authenticated; one spec still tests the login form.

### 7. API testing

- **Concept:** `{ request }` is an HTTP client (cookie jar). There is **no** `page`, **no** `goto`, **no** `.fill`. Methods: `request.get`, `request.post`, `request.patch`. `login(...)` is **our** helper, not a Playwright builtin.
- **Why:** RBAC and isolation are HTTP rules. The UI can hide a row; the API must still 404.
- **When:** As soon as `/api/*` exists (Iteration 5). After Postman matches [../API.md](../API.md).
- **Nexo:** `GET /api/requests`, Ana `GET …/NX-000003` → 404; agent POST → 403.
- **Practice:** You complete `e2e/api/requests/isolation.spec.ts`. Coach explains **each line** you point at ([API_TESTING.md](./API_TESTING.md) dictionary). You do not skip “where does `loginResponse` come from.”
- **Expected:** You can say, for any line: fixture vs helper vs return value vs `expect`. API specs own rules; UI specs do not re-prove every status code.
- **Not yet:** `storageState`, fixtures, CI.

### 8. Test data

- **Concept:** Seed for identity/reads; create-per-test for writes.
- **Why:** Parallel workers racing on `NX-000001` fail randomly.
- **When:** First write test.
- **Nexo:** `db:reset` + `POST /api/requests`.
- **Practice:** Create a request in the test; do not PATCH the seeded demo row from every file.
- **Expected:** Workers can run in parallel without unique-constraint collisions.

### 9. RBAC

- **Concept:** Same user matrix on UI and API.
- **Why:** Hidden buttons are not security.
- **When:** After both UI protection and API land.
- **Nexo:** Agent `POST /api/requests` → 403; customer `/agent/requests` → redirect.
- **Practice:** Table of role × endpoint × expected oracle.
- **Expected:** Failures named 401/403/404 correctly.

### 10. Workflows

- **Concept:** Cross-role journeys.
- **When:** After single-role happy paths pass.
- **Nexo:** Customer creates → agent `IN_PROGRESS` → `RESOLVED` → customer sees status.
- **Practice:** One journey spec, not five.
- **Expected:** Status history has three rows for that public id.

### 11. Parallel

- **Concept:** Isolated data, no shared mutable seed rows.
- **When:** CI or local `--workers=4`.
- **Nexo:** Unique titles per test (`test.info().workerIndex`).
- **Expected:** Suite green with multiple workers.

### 12. CI

- **Concept:** GitHub Actions boots app + Postgres + Playwright.
- **When:** After the suite is stable locally.
- **Nexo:** `db:reset` in CI, then `playwright test`.
- **Expected:** Main/PR pipeline, not only a laptop run.

### 13. Advanced

- **Concept:** Trace viewer, retries, network mocking, accessibility snapshots.
- **When:** After CI is green.
- **Practice:** Open a trace from a forced failure; add one a11y check on `/login`.
- **Expected:** You can explain a flake from a trace, not from a screenshot guess.
