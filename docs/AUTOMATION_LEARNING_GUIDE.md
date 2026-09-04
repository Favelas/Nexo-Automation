# Automation learning guide

Curriculum for Nexo. Each level: concept → why it matters → when to use it → how it shows up in Nexo → practice → expected result.

Work in order. Do not start a Playwright config until Iteration 5’s quality gate is green. Start with **one valid login test**, not a framework.

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

- **Concept:** `request` context, status codes, JSON envelope.
- **Why:** RBAC and isolation are HTTP rules.
- **When:** As soon as `/api/*` exists (Iteration 5).
- **Nexo:** `GET /api/requests`, cross-customer `404`.
- **Practice:** Customer token cannot read Customer B’s `NX-*`.
- **Expected:** API specs own rules; UI specs do not re-prove every status code.

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
