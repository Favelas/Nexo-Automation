# Automation roadmap

Levels match [AUTOMATION_LEARNING_GUIDE.md](./AUTOMATION_LEARNING_GUIDE.md). **How to structure the suite** (same repo, `e2e/`, `playwright.config.ts`): [automation/FRAMEWORK.md](./automation/FRAMEWORK.md).

There is no `e2e/` tree yet **on purpose**. You add it on **`main`** in this repository. Do not put tests in a separate repo or only on `nexo-dev`.

Definition of done is what _you_ produce. This repo will not ship a generated framework.

| Level | Name                | Definition of done                                                                                     |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| 0     | Smoke (Iteration 1) | Config exists because **you** added it. One spec: `/login` form visible; submit does not authenticate. |
| 1     | Basic Playwright    | After auth exists: one spec, valid customer login.                                                     |
| 2     | Selectors           | Login and nav use role/label locators. No CSS-class selectors in that spec.                            |
| 3     | Assertions          | Login spec asserts URL + heading. Zero `waitForTimeout`.                                               |
| 4     | POM                 | Login locators extracted only after a second spec needed them.                                         |
| 5     | Fixtures            | `customerPage` / `agentPage` fixtures; specs no longer paste login.                                    |
| 6     | Auth strategies     | `storageState` for both roles. One UI spec still covers the login form.                                |
| 7     | API                 | Request isolation and status transition covered via `/api/*`.                                          |
| 8     | Test data           | Write tests create their own requests. Seeded `NX-000001` is read-only in CI.                          |
| 9     | RBAC                | Role × route matrix for UI redirects and API 401/403/404.                                              |
| 10    | Workflows           | One customer→agent→customer journey.                                                                   |
| 11    | Parallel            | Green with workers > 1.                                                                                |
| 12    | CI                  | GitHub Actions runs lint/build + Playwright against Compose Postgres.                                  |
| 13    | Advanced            | Trace on failure; at least one accessibility assertion.                                                |

## Explicitly do not automate (yet)

- Visual pixel diffs of the whole app
- Every status × every role × every field as UI tests
- Email, register, admin (not in MVP)
- Performance SLAs

## Stop line

After Iteration 5 the **application** stops growing until you have levels 1–3 done. New product features wait on a small, stable suite.
