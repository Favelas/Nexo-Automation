# Development roadmap

**What this is:** What to **build** in product Iterations 1–5, then stop growing the app.  
**Not this:** Suite skill levels ([automation/AUTOMATION_ROADMAP.md](./automation/AUTOMATION_ROADMAP.md)) or live ticks ([automation/ITERATIONS.md](./automation/ITERATIONS.md)). This lab also allows an Iteration 1 Playwright smoke; track that in the automation folder.

Hard stop after Iteration 5. After each iteration: what works, what is missing, how to validate manually, what you _could_ automate — then wait.

| Iteration       | Build                                                   | Then stop                   |
| --------------- | ------------------------------------------------------- | --------------------------- |
| **1**           | Skeleton, Postgres, Prisma, empty pages, env example    | App boots, `/login` renders |
| **2**           | Auth.js Credentials, seed users, middleware, dashboards | Manual login checklist      |
| **3**           | Customer create / list / detail                         | Customer happy path         |
| **4**           | Agent queue / detail / status                           | Cross-role status visible   |
| **5** (next)    | Seed, reset, API parity, selective test ids             | Quality gates green         |
| **STOP**        | You start Playwright                                    | No generated framework      |

## Iteration 1 scope (do not exceed)

- Next.js App Router + TypeScript + ESLint + Prettier
- `.env.example` / `.env.local` (`DATABASE_URL`, `AUTH_SECRET`, `TEST_USER_PASSWORD`)
- Docker Compose with Postgres only
- Prisma schema from [DATABASE.md](./DATABASE.md) (no seed data)
- Placeholder routes for the page map
- README how to boot

**Not in Iteration 1:** real login, Auth.js, Playwright, API handlers, seed, middleware, extra features.

## Iteration 4 scope (do not exceed)

- Agent dashboard counts by status
- Agent queue lists **all** customers’ requests (customer name on the row)
- Agent detail with status `<select>`: `SUBMITTED` \| `IN_PROGRESS` \| `RESOLVED`
- `PATCH /api/requests/:publicId` — agent only; writes history; customer → `403`
- Customer detail already shows status; it must update after the agent saves

**Not in Iteration 4:** seed `NX-000001` rows, `db:reset` fixtures, Playwright, `storageState`.

## After Iteration 1 you can automate

Nothing product-wise yet. You can only sanity-check that `/login` renders. Wait for Iteration 2 before a login test.
