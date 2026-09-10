# Nexo

**What this is:** How to **run** Nexo — clone, boot, Git, seed accounts, locator ids.  
**Not this:** Product specs ([docs/README.md](./docs/README.md)) or Playwright design ([docs/automation/README.md](./docs/automation/README.md)).

Nexo is a small **internal customer-request tracker** used as a QA lab. Customers file requests (`NX-000001` style ids). Agents move them through `SUBMITTED` → `IN_PROGRESS` → `RESOLVED`. You learn Playwright against a real Next.js UI **and** (later) the same rules on REST `/api/*`.

It is **not** a production SaaS, not Supabase/Vercel, and **not** a pre-built test framework. You add Playwright yourself.

|                |                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| App            | Next.js 16 App Router, TypeScript, one PostgreSQL (Docker), Prisma 6                                                                |
| Auth           | Auth.js Credentials, HTTP-only cookie, roles `CUSTOMER` and `AGENT`                                                                 |
| Current stop   | **Iteration 3** — customer create / list / detail. Agent status and seed `NX-000001` rows wait. |
| Git            | Work on **`main`**. **`nexo-dev`** is a backup snapshot of `main`                                                                   |
| Automation     | Design in [`docs/automation/`](./docs/automation/README.md). Specs live in this repo under `e2e/` |

### Start here

| If you want to…                            | Go to                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Run the app                                | [Boot](#boot) below                                                                                                                  |
| Understand the product                     | [`docs/README.md`](./docs/README.md), then [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)                                          |
| Manual accounts, seed ids, isolation rules | [Test data](#test-data-manual-kit)                                                                                                   |
| Locator `data-testid` list                 | [Locator IDs](#locator-ids)                                                                                                          |
| **Design and start Playwright yourself**   | **[`docs/automation/README.md`](./docs/automation/README.md)** then [`docs/automation/FRAMEWORK.md`](./docs/automation/FRAMEWORK.md) |
| Practice exercises (no spoilers)           | [`docs/automation/QA_CHALLENGES.md`](./docs/automation/QA_CHALLENGES.md)                                                             |
| Keep GitHub and your PC in sync            | [Cursor + Git](#cursor--git-fastest-loop)                                                                                            |

Planning / iterations: [`docs/DEVELOPMENT_ROADMAP.md`](./docs/DEVELOPMENT_ROADMAP.md).

## Current stop: Iteration 4 done

Agent queue / status is green by hand. Playwright still has smoke + I2 + I3 only. I4 specs wait for you. Next product work is Iteration 5 (seed / reset / API).

## Clone onto your machine

GitHub is the source of truth (`Favelas/Nexo-Automation`). Open the **cloned folder** in Cursor. A cloud agent cannot write to `C:\Users\maryf\Documents` for you.

```powershell
git clone https://github.com/Favelas/Nexo-Automation.git C:\Users\maryf\Documents\Nexo-Automation
cd C:\Users\maryf\Documents\Nexo-Automation
git checkout main
git pull origin main
```

Work happens on **`main`**. **`nexo-dev`** is a backup snapshot of `main` (Git cannot use the name `Nexo Dev` with a space).

## Cursor + Git (fastest loop)

Use **one local folder that is the Git clone**. Do not keep a second copy without Git.

Every session:

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
git checkout main
git pull origin main
```

After you (or an agent) change files:

```powershell
git add -A
git commit -m "Describe the change"
git push origin main
```

Refresh the backup branch when you want a snapshot:

```powershell
git push origin main:nexo-dev
```

In Cursor Desktop: **File → Open Folder** → `C:\Users\maryf\Documents\Nexo-Automation`. After a cloud agent pushes, run `git pull origin main` in that folder (or Source Control → Pull). That is the whole sync.

If the local folder was cloned earlier from another branch:

```powershell
git fetch origin
git checkout main
git pull origin main
```

## Boot

Needs: Node.js 20+, npm, Docker Desktop (Postgres). **Installed is not enough** — Docker Desktop must be **running** (whale icon ready) before any `docker` command.

From Iteration 2 on, login **and** dashboards need Postgres. `/login` can still render if the database is down. A leftover cookie can even look like a session. Then `/customer/dashboard` and `/customer/requests` return **500** (`Can't reach database server at localhost:5432`). Playwright needs **both** Next and Postgres; it does not start Docker for you.

Copy `.env.example` as-is for local lab work. `TEST_USER_PASSWORD` is the shared seed password below (`Password123!`). `AUTH_SECRET` must be a long random string (`openssl rand -base64 32`). After Postgres is up: `npm run db:deploy` then `npm run db:seed`. Do not run bare `npx prisma …` — Prisma will not see `.env.local`.

Two processes, two ports:

| Process | How it runs | Port | Keep it open? |
| ------- | ----------- | ---- | ------------- |
| Postgres | `docker compose up -d` (background) | **5432** | No — Docker keeps it until `docker compose down` or you quit Docker Desktop |
| Next.js | `npm run dev` (this terminal) | **3000** (or the `Local:` port) | Yes — `Ctrl+C` stops the app |

### Check the tools

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
node -v          # expect v20 or higher
npm -v
docker info      # must print Server Version — if this errors, open Docker Desktop and wait
```

`docker info` must succeed **before** `docker compose`. If it errors with `dockerDesktopLinuxEngine` / `The system cannot find the file specified`, the engine is off — wait until the whale icon is idle/running, then retry.

### First time on this machine

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation

# 1. Env file (gitignored). Only needed once, or if you deleted it.
Copy-Item .env.example .env.local

# 2. Postgres on localhost:5432 (needs Docker Desktop running)
docker compose up -d

# 3. Confirm Postgres is healthy (Status must include healthy, not only Up)
docker compose ps

# 4. App dependencies (skip later if node_modules already exists)
npm install

# 5. Apply migrations (needs Postgres + .env.local)
npm run db:deploy

# 6. Seed roles, three users, and categories (Billing / Access / Technical)
npm run db:seed

# 7. Dev server — leave this terminal open
npm run dev
```

Wait until the terminal prints `Local: http://localhost:3000` (or `3001` if 3000 is taken) and `✓ Ready`. Then open [http://localhost:3000/login](http://localhost:3000/login). `/` redirects there.

If Next.js prints **Port 3000 is in use … using available port 3001**, that is the same app — use [http://localhost:3001/login](http://localhost:3001/login). Do not assume `:3000` is Nexo; another container can own that port and look “down”.

### Every later session

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation

docker info              # fail here → open Docker Desktop and wait
docker compose up -d
docker compose ps        # postgres = Up (healthy)
docker compose exec postgres pg_isready -U nexo -d nexo   # expect: accepting connections

npm run dev              # wait for ✓ Ready and Local:
```

Then [Verify boot](#verify-boot) in the browser. Re-run `Copy-Item .env.example .env.local` only if `.env.local` is missing. Re-run `npm install` only if `node_modules` is missing or `package.json` changed. Re-run `db:deploy` / `db:seed` only after a schema change or `docker compose down -v` (volume wiped).

### What each command does

| Command | What it does |
| ------- | ------------ |
| `docker info` | Talks to the Docker engine. Must work before any `compose` command |
| `Copy-Item .env.example .env.local` | Creates the local env file. Prisma and Next read `DATABASE_URL=postgresql://nexo:nexo@localhost:5432/nexo?schema=public` |
| `docker compose up -d` | Starts Postgres 16 (`nexo` / `nexo` / db `nexo`) in the background on port **5432** |
| `docker compose ps` | Shows the compose service. Want **Up (healthy)** |
| `docker compose exec postgres pg_isready -U nexo -d nexo` | Asks Postgres if it accepts connections |
| `npm install` | Installs Next.js, Prisma, and the rest into `node_modules` |
| `npm run db:deploy` | Applies migrations using `.env.local` |
| `npm run db:seed` | Upserts roles, the three seed users, and categories |
| `npm run dev` | Next.js 16 dev server. Default URL **http://localhost:3000**. Stops when you close the terminal or press `Ctrl+C` |
| `docker compose down` | Stops Postgres. Volume `nexo_pgdata` stays; users/requests are kept |
| `docker compose down -v` | Stops Postgres **and** deletes the volume. Next boot needs `db:deploy` + `db:seed` again |

### Verify boot

Run these **in order**. Login alone is not enough.

```powershell
docker info
docker compose ps
docker compose exec postgres pg_isready -U nexo -d nexo
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

| Check | Expect |
| ----- | ------ |
| `docker info` | `Server Version` (no pipe / `dockerDesktopLinuxEngine` error) |
| `docker compose ps` | Service `postgres` is **Up** and **(healthy)** |
| `pg_isready` | `accepting connections` |
| `npm run dev` terminal | `✓ Ready` and a `Local:` line |
| Browser | [http://localhost:3000/login](http://localhost:3000/login) (or the `Local:` port) shows email, password, and **Log in** |
| After login as Ana | Lands on `/customer/dashboard` **without** a 500 / Prisma error |
| My requests / New request | Pages load (list may be empty; form has category options) |
| `http://localhost:3000` while Next printed `:3001` | That URL is **not** this app |

Nexo wants **3000** (Next.js) and **5432** (Postgres). If another stack holds them, stop it or use the port Next.js chose.

### Stop

```powershell
# App: in the npm run dev terminal
# Ctrl+C

# Postgres only (volume nexo_pgdata stays; data is kept)
docker compose down
```

Quitting Docker Desktop also stops Postgres. Next session: start Docker Desktop, then `docker compose up -d` again.

### If it looks down

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Browser timeout / connection reset on `:3000` | `npm run dev` is not running, **or** another process owns 3000 and is crashing | Start `npm run dev`. Read the `Local:` line. Run `docker ps` and stop the other container if you need `:3000` |
| Next.js: `Port 3000 is in use … using available port 3001` | Something else bound 3000 | Open `:3001`, or free 3000 (`docker stop <name>` or stop the other Node process) and restart `npm run dev` |
| `/login` OK, `/customer/dashboard` **500**, terminal `Can't reach database server at localhost:5432` | Next is up; Postgres is not | Open Docker Desktop, wait, `docker compose up -d`, then `docker compose ps` until **healthy**. Reload the dashboard |
| `error during connect` / `open //./pipe/dockerDesktopLinuxEngine` / `The system cannot find the file specified` | Docker Desktop installed but the engine is off | Open **Docker Desktop**, wait until it is running, then `docker info`, then `docker compose up -d` |
| `unable to get image 'postgres:16-alpine'` with the pipe error | Same as above — Compose never reached Docker | Same fix. Do not retry compose until `docker info` works |
| `Bind for 0.0.0.0:5432 failed: port is already allocated` | Another Postgres already uses 5432 | `docker ps` then `docker stop <name>`. Retry `docker compose up -d` |
| `P1000: Authentication failed` against `nexo` | Whatever is on 5432 is **not** the Nexo database | Same as the 5432 conflict. Credentials in `.env.local` are `nexo` / `nexo` |
| `next` is not recognized / cannot find module | `node_modules` missing | `npm install` |
| Prisma cannot find env / wrong database | `.env.local` missing | `Copy-Item .env.example .env.local` |
| Empty category dropdown / login “invalid” after a volume wipe | Schema or seed missing | `npm run db:deploy` then `npm run db:seed` |

### npm scripts

| Script                        | What it does                                      |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | Next.js dev server                                |
| `npm run build` / `npm start` | Production build                                  |
| `npm run lint`                | ESLint                                            |
| `npm run format`              | Prettier                                          |
| `npm run db:generate`         | Prisma Client                                     |
| `npm run db:migrate`          | `prisma migrate dev` using `.env.local`           |
| `npm run db:reset`            | Drop, migrate, seed users (requests arrive in Iteration 5) |
| `npm run db:seed`             | Upsert roles, the three seed users, and categories |
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

**When it is in the database:** Iteration 2 seeds **users and roles**. Iteration 3 also seeds **categories**. Full request fixtures (`NX-000001`…) arrive in Iteration 5.

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

| Public id   | History                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| `NX-000001` | `null → SUBMITTED` (Ana)                                                                      |
| `NX-000002` | `null → SUBMITTED` (Ana), then `SUBMITTED → IN_PROGRESS` (Avery)                              |
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

**Iteration 2 (now)** — users exist after `npm run db:seed`:

1. [ ] App boots; `/` redirects to `/login`
2. [ ] Email and Password are labeled; button name is **Log in**
3. [ ] Customer A lands on `/customer/dashboard`; agent lands on `/agent/dashboard`
4. [ ] Invalid login stays on `/login` with `role="alert"` and **Invalid email or password.**
5. [ ] Log out returns to `/login`; `/customer/dashboard` then redirects to `/login`
6. [ ] Customer opening `/agent/dashboard` lands on `/customer/dashboard`

**After request features exist (do not automate until the quality gate in [`docs/PRODUCT_REQUIREMENTS.md`](./docs/PRODUCT_REQUIREMENTS.md) is green):**

1. [ ] Customer A / Agent logins land on the dashboards in the user table
2. [ ] Invalid login cases stay on `/login` with the generic alert
3. [ ] Log out, then `/customer/dashboard` returns to `/login`
4. [ ] A sees `NX-000001` and `NX-000002` only; B sees `NX-000003` only
5. [ ] A cannot open B’s `NX-000003` (not-found / API `404`)
6. [ ] Agent queue shows all three seed ids (two customers)
7. [ ] Create the “printer jammed” request as A; it appears in **My requests** with a new `NX-` id
8. [ ] Agent sets that new request `IN_PROGRESS` then `RESOLVED`; A sees `RESOLVED`
9. [ ] `npm run db:reset` restores only the three seed requests and the three users

## Locator IDs

Every control below has the **same** value on `id` and `data-testid`. Prefer `page.getByTestId("login-email")` (or `getByRole` / `getByLabel` when that is enough). Constants live in `lib/test-ids.ts`.

```ts
await page.getByTestId("login-email").fill("customer.a@nexo.test");
await page.getByTestId("login-submit").click();
```

| `data-testid` / `id`                                   | Where                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `page-login`                                           | Login page wrapper                                                    |
| `login-form`                                           | Login `<form>`                                                        |
| `login-email`                                          | Email input                                                           |
| `login-password`                                       | Password input                                                        |
| `login-submit`                                         | **Log in** button                                                     |
| `login-status`                                         | Message after submit (Iteration 1 placeholder)                        |
| `iteration-banner`                                     | Yellow iteration notice                                               |
| `page-heading`                                         | Main `<h1>` on each page                                              |
| `app-header` / `app-main` / `app-footer`               | Chrome                                                                |
| `nav-brand`                                            | Nexo logo link                                                        |
| `nav-primary`                                          | Role nav                                                              |
| `nav-dashboard`                                        | Dashboard link                                                        |
| `nav-my-requests`                                      | Customer **My requests**                                              |
| `nav-new-request`                                      | Customer header **New request**                                       |
| `nav-request-queue`                                    | Agent **Request queue**                                               |
| `nav-logout`                                           | **Log out**                                                           |
| `cta-new-request`                                      | In-page New request button/link                                       |
| `cta-request-queue`                                    | In-page Request queue link                                            |
| `page-customer-dashboard`                              | Customer dashboard                                                    |
| `page-customer-requests`                               | My requests                                                           |
| `page-customer-request-new`                            | New request                                                           |
| `page-customer-request-detail`                         | Customer detail                                                       |
| `page-agent-dashboard`                                 | Agent dashboard                                                       |
| `page-agent-requests`                                  | Agent queue                                                           |
| `page-agent-request-detail`                            | Agent detail                                                          |
| `request-table`                                        | Requests table                                                        |
| `request-table-empty`                                  | Empty-table message                                                   |
| `request-public-id`                                    | Public id on detail (`NX-000001`)                                     |
| `request-title` / `request-category` / `request-description` | Detail field values                                              |
| `request-status`                                       | Status text (customer) or status `<select>` (agent, disabled for now) |
| `create-request-form`                                  | Create form                                                           |
| `field-title` / `field-category` / `field-description` | Create fields                                                         |
| `create-request-submit`                                | **Create request**                                                    |

## SQLite fallback

Postgres via Docker is the default. If Docker Desktop cannot run on Windows, see [`docs/DATABASE.md`](./docs/DATABASE.md#sqlite-fallback). Ask before switching; it changes migrations.

## What is not here yet

- Request seed fixtures `NX-000001`… (Iteration 5)
- Playwright agent queue / status specs (I4 product is green by hand; you add them)

## Docs

Map of every file: [`docs/README.md`](./docs/README.md). Product specs stay in `docs/`. Playwright lives in [`docs/automation/`](./docs/automation/README.md).
