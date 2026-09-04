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

`AUTH_SECRET` and `TEST_USER_PASSWORD` are unused until later iterations. Leave the example values for now, or set `AUTH_SECRET` with `openssl rand -base64 32`.

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

### Page map (placeholders)

| Path                           | Who      |
| ------------------------------ | -------- |
| `/login`                       | Public   |
| `/customer/dashboard`          | Customer |
| `/customer/requests`           | Customer |
| `/customer/requests/new`       | Customer |
| `/customer/requests/NX-000001` | Customer |
| `/agent/dashboard`             | Agent    |
| `/agent/requests`              | Agent    |
| `/agent/requests/NX-000001`    | Agent    |

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
