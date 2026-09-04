# Nexo

Internal customer-request tracker used as a **QA automation lab**. One Next.js app, one PostgreSQL database, REST under `/api/*` (from Iteration 5). Playwright is **your** work after Iteration 5 — this repo does not ship a test framework.

Planning docs live in [`docs/`](./docs/). Start with [`docs/DEVELOPMENT_ROADMAP.md`](./docs/DEVELOPMENT_ROADMAP.md).

## Current stop: Iteration 1

The app boots. `/login` renders. Routes in the page map exist as placeholders. **Login does not authenticate.** There is no seed data and no Playwright.

## Clone onto your machine

This project lives on GitHub (`Favelas/Nexo-Automation`). A cloud agent cannot write to `C:\Users\maryf\Documents` for you. After you have the branch or `main`:

```powershell
git clone https://github.com/Favelas/Nexo-Automation.git C:\Users\maryf\Documents\Nexo-Automation
cd C:\Users\maryf\Documents\Nexo-Automation
```

If you are reviewing a pull request branch:

```powershell
git clone -b cursor/iteration-1-scaffold-2ada https://github.com/Favelas/Nexo-Automation.git C:\Users\maryf\Documents\Nexo-Automation
```

## Boot (Iteration 1)

Needs: Node.js 20+, npm, Docker Desktop (Postgres).

```bash
cp .env.example .env.local
docker compose up -d
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). `/` redirects there.

Copy `.env.example` as-is for local lab work. `TEST_USER_PASSWORD` is the shared seed password below (`Password123!`). `AUTH_SECRET` is unused until Iteration 2; you can leave the example or set it with `openssl rand -base64 32`.

### npm scripts

| Script                        | What it does                                      |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | Next.js dev server                                |
| `npm run build` / `npm start` | Production build                                  |
| `npm run lint`                | ESLint                                            |
| `npm run format`              | Prettier                                          |
| `npm run db:generate`         | Prisma Client                                     |
| `npm run db:migrate`          | `prisma migrate dev` using `.env.local`           |
| `npm run db:reset`            | Drop, migrate, seed (seed arrives in Iteration 5) |
| `npm run db:validate`         | Validate `prisma/schema.prisma`                   |

### Page map

| Path                           | Who                          |
| ------------------------------ | ---------------------------- |
| `/login`                       | Public                       |
| `/`                            | Redirects to `/login`        |
| `/customer/dashboard`          | Customer                     |
| `/customer/requests`           | Customer                     |
| `/customer/requests/new`       | Customer                     |
| `/customer/requests/:publicId` | Customer (own requests only) |
| `/agent/dashboard`             | Agent                        |
| `/agent/requests`              | Agent                        |
| `/agent/requests/:publicId`    | Agent (any request + status) |
| Log out                        | Both → `/login`              |

`:publicId` is the human id, for example `NX-000001`.

## Test data (manual kit)

This is the **seed contract**. Use these accounts, ids, and expected results for every manual pass and, later, for automation. Do not invent extra users in tests.

**When it is in the database:** Iteration 1 has **no seed and no real login**. The tables below are what seed will load (users in Iteration 2, full requests in Iteration 5 via `npm run db:reset`). Until then you can only check that pages render.

Base URL: [http://localhost:3000](http://localhost:3000)

### Shared password

| Env var              | Value          | Used by              |
| -------------------- | -------------- | -------------------- |
| `TEST_USER_PASSWORD` | `Password123!` | All three seed users |

There is no self-register and no “forgot password” in MVP. If login fails after seed exists, run `npm run db:reset` and confirm `.env.local` still has this password.

### Seed users

| Who        | Email                  | Password       | Role       | Display name | Lands on after login  |
| ---------- | ---------------------- | -------------- | ---------- | ------------ | --------------------- |
| Customer A | `customer.a@nexo.test` | `Password123!` | `CUSTOMER` | Ana Rivera   | `/customer/dashboard` |
| Customer B | `customer.b@nexo.test` | `Password123!` | `CUSTOMER` | Ben Cho      | `/customer/dashboard` |
| Agent      | `agent@nexo.test`      | `Password123!` | `AGENT`    | Avery Cole   | `/agent/dashboard`    |

Nav after login:

- Customer: **Dashboard**, **My requests**, **New request**, **Log out**
- Agent: **Dashboard**, **Request queue**, **Log out** (no create action)

### Invalid login (same generic error)

Do not leak “unknown email” vs “wrong password”.

| Case           | Email                  | Password         | Expected                                 |
| -------------- | ---------------------- | ---------------- | ---------------------------------------- |
| Wrong password | `customer.a@nexo.test` | `WrongPassword!` | Stay on `/login`; `role="alert"`         |
| Unknown email  | `nobody@nexo.test`     | `Password123!`   | Same as above                            |
| Empty fields   | (blank)                | (blank)          | Browser/field-level required; no session |

Pinned alert copy (when auth exists): **Invalid email or password.**

### Categories (create form)

| Name      | Slug        | Use for                       |
| --------- | ----------- | ----------------------------- |
| Billing   | `billing`   | Seed `NX-000001`              |
| Access    | `access`    | Seed `NX-000002`              |
| Technical | `technical` | Seed `NX-000003`; new creates |

### Seed requests (read fixtures)

Do **not** have every test PATCH `NX-000001`. Seed is for identity and reads. For write tests, create a new request, then change that new id.

| Public id   | Owner      | Category  | Title                       | Status        | Assigned agent | Why it exists                                           |
| ----------- | ---------- | --------- | --------------------------- | ------------- | -------------- | ------------------------------------------------------- |
| `NX-000001` | Customer A | Billing   | Cannot open invoice PDF     | `SUBMITTED`   | (none)         | Stable “open” row for A; isolation target for B         |
| `NX-000002` | Customer A | Access    | Portal password reset loops | `IN_PROGRESS` | Agent          | A can see in-progress; agent happy-path starting point  |
| `NX-000003` | Customer B | Technical | Access to archived tickets  | `RESOLVED`    | Agent          | Isolation: A must not see this; queue has two customers |

History (append-only):

| Public id   | History                                                          |
| ----------- | ---------------------------------------------------------------- |
| `NX-000001` | `null → SUBMITTED` (Ana)                                         |
| `NX-000002` | `null → SUBMITTED` (Ana), then `SUBMITTED → IN_PROGRESS` (Avery) |
| `NX-000003` | `null → SUBMITTED` (Ben), `SUBMITTED → IN_PROGRESS` (Avery), `IN_PROGRESS → RESOLVED` (Avery) |

Statuses allowed on agent detail: `SUBMITTED` \| `IN_PROGRESS` \| `RESOLVED` only.

### Who can see what

| Actor      | `NX-000001`                | `NX-000002` | `NX-000003`                                       | Create request            | Change status |
| ---------- | -------------------------- | ----------- | ------------------------------------------------- | ------------------------- | ------------- |
| Anonymous  | login redirect / API `401` | same        | same                                              | no                        | no            |
| Customer A | own (UI + API `200`)       | own         | **hidden** (UI not-found; API **`404`**, not 403) | yes                       | no (`403`)    |
| Customer B | **`404`**                  | **`404`**   | own                                               | yes                       | no (`403`)    |
| Agent      | all `200`                  | all `200`   | all `200`                                         | no (no button; API `403`) | yes           |

Wrong-role URLs (UI): customer opening `/agent/*` → `/customer/dashboard`. Agent opening `/customer/*` → `/agent/dashboard`.

### Suggested new-request (write) data

Use this when you create a request by hand so it is obvious it is not seed.

| Field       | Value                                                    |
| ----------- | -------------------------------------------------------- |
| Title       | `Manual test — printer in lobby jammed`                  |
| Category    | Technical                                                |
| Description | `Created in a manual pass; safe to delete via db:reset.` |

Expect a new public id `NX-000004` (or higher if you created extras). After `npm run db:reset`, only `NX-000001`–`NX-000003` remain.

### API smoke (after Iteration 5)

Login (cookie session):

```bash
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer.a@nexo.test\",\"password\":\"Password123!\"}"
```

| Call                                   | Expect                                                         |
| -------------------------------------- | -------------------------------------------------------------- |
| `GET /api/auth/me` with cookie         | `200`, `"role": "CUSTOMER"`                                    |
| `GET /api/auth/me` with no cookie      | `401`                                                          |
| `GET /api/requests` as A               | only A’s rows (`NX-000001`, `NX-000002`, plus any you created) |
| `GET /api/requests/NX-000003` as A     | `404`                                                          |
| `GET /api/requests/NX-000003` as agent | `200`                                                          |
| `POST /api/requests` as agent          | `403`                                                          |
| `PATCH /api/requests/NX-000001` as A   | `403`                                                          |

Error envelope:

```json
{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required." } }
```

### Manual checklist before you start Playwright

**Iteration 1 (now)** — no accounts yet:

1. [ ] App boots; `/` redirects to `/login`
2. [ ] Email and Password are labeled; button name is **Log in**
3. [ ] `/customer/requests/NX-000001` and `/agent/requests/NX-000001` render (placeholders)
4. [ ] Submit on login does **not** start a session

**After auth + seed (do not automate until the quality gate in [`docs/PRODUCT_REQUIREMENTS.md`](./docs/PRODUCT_REQUIREMENTS.md) is green):**

1. [ ] Customer A / Agent logins land on the dashboards in the user table
2. [ ] Invalid login cases stay on `/login` with the generic alert
3. [ ] Log out, then `/customer/dashboard` returns to `/login`
4. [ ] A sees `NX-000001` and `NX-000002` only; B sees `NX-000003` only
5. [ ] A cannot open B’s `NX-000003` (not-found / API `404`)
6. [ ] Agent queue shows all three seed ids (two customers)
7. [ ] Create the “printer jammed” request as A; it appears in **My requests** with a new `NX-` id
8. [ ] Agent sets that new request `IN_PROGRESS` then `RESOLVED`; A sees `RESOLVED`
9. [ ] `npm run db:reset` restores only the three seed requests and the three users

## SQLite fallback

Postgres via Docker is the default. If Docker Desktop cannot run on Windows, see [`docs/DATABASE.md`](./docs/DATABASE.md#sqlite-fallback). Ask before switching; it changes migrations.

## What is not here yet

- Auth.js / sessions (Iteration 2)
- Create request / agent status (Iterations 3–4)
- Seed + REST API (Iteration 5)
- `tests/` and Playwright (you, after Iteration 5)

## Docs

| File                                                                     | Contents                            |
| ------------------------------------------------------------------------ | ----------------------------------- |
| [docs/DECISIONS.md](./docs/DECISIONS.md)                                 | Architecture choices                |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)                           | Shape, page map, oracles            |
| [docs/PRODUCT_REQUIREMENTS.md](./docs/PRODUCT_REQUIREMENTS.md)           | MVP + quality gates                 |
| [docs/DATABASE.md](./docs/DATABASE.md)                                   | Schema                              |
| [docs/API.md](./docs/API.md)                                             | REST contract (not implemented yet) |
| [docs/DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md)             | Build iterations                    |
| [docs/AUTOMATION_LEARNING_GUIDE.md](./docs/AUTOMATION_LEARNING_GUIDE.md) | Curriculum                          |
| [docs/AUTOMATION_ROADMAP.md](./docs/AUTOMATION_ROADMAP.md)               | Automation levels                   |
| [docs/QA_CHALLENGES.md](./docs/QA_CHALLENGES.md)                         | Practice without spoilers           |
