# Development roadmap

Hard stop after Iteration 5. After each iteration: what works, what is missing, how to validate manually, what you _could_ automate — then wait.

| Iteration       | Build                                                   | Then stop                   |
| --------------- | ------------------------------------------------------- | --------------------------- |
| **1**           | Skeleton, Postgres, Prisma, empty pages, env example    | App boots, `/login` renders |
| **2**           | Auth.js Credentials, seed users, middleware, dashboards | Manual login checklist      |
| **3** (next)    | Customer create / list / detail                         | Customer happy path         |
| **4**           | Agent queue / detail / status                           | Cross-role status visible   |
| **5**           | Seed, reset, API parity, selective test ids             | Quality gates green         |
| **STOP**        | You start Playwright                                    | No generated framework      |

## Iteration 1 scope (do not exceed)

- Next.js App Router + TypeScript + ESLint + Prettier
- `.env.example` / `.env.local` (`DATABASE_URL`, `AUTH_SECRET`, `TEST_USER_PASSWORD`)
- Docker Compose with Postgres only
- Prisma schema from [DATABASE.md](./DATABASE.md) (no seed data)
- Placeholder routes for the page map
- README how to boot

**Not in Iteration 1:** real login, Auth.js, Playwright, API handlers, seed, middleware, extra features.

## After Iteration 1 you can automate

Nothing product-wise yet. You can only sanity-check that `/login` renders. Wait for Iteration 2 before a login test.
