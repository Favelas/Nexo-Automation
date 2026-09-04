# QA challenges (no spoilers)

Practice here. There is no `tests/` directory in this repository on purpose. Do not look for a hidden framework.

Write tests against the **running app** and [API.md](./API.md). Accounts, seed ids, and expected oracles: [README — Test data](../README.md#test-data-manual-kit). If a challenge mentions a feature that is not built yet, wait for that iteration.

## Rules

- Prefer `getByRole` and `getByLabel`.
- Use `data-testid` only when the control has no accessible name.
- Do not `waitForTimeout`.
- Do not mutate seeded `NX-000001` from every test.
- UI oracles: navigation and visible text. API oracles: status codes.

## Challenges

1. **Valid login.** Customer reaches the customer dashboard. Agent reaches the agent dashboard.
2. **Invalid login.** Generic error. Password field is not echoed in the alert. URL stays `/login`.
3. **Anonymous protection.** Deep-link `/customer/requests` while logged out. You should not stay on that page.
4. **Wrong-role URL.** Customer opens `/agent/requests`. Where do they land? Match [ARCHITECTURE.md](./ARCHITECTURE.md).
5. **Accessible login form.** Prove the form is usable with labels, not with `#email` CSS.
6. **Create request (UI).** Required field empty → no new row. Valid submit → a new `NX-` id appears in the list.
7. **Customer isolation (API).** Authenticate as customer A. `GET` customer B’s public id. Expect **404**, not 403.
8. **Agent cannot create (API).** `POST /api/requests` as agent → 403.
9. **Status workflow.** Customer creates. Agent sets `IN_PROGRESS`, then `RESOLVED`. Customer detail shows `RESOLVED`.
10. **Logout.** After logout, `/api/auth/me` is 401 and a protected page redirects to login.
11. **Reset.** Change a seeded row, run `npm run db:reset`, prove the seed is back.
12. **Parallel safety.** Two tests create requests at once. Neither should fail on `public_id` collision.

If you get stuck, re-read the product and API docs. The answers are the app’s behavior, not a test file in git.
