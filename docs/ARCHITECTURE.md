# Architecture

**What this is:** How the Nexo **app** is shaped — runtime pieces, page map, request flow, UI vs API oracles.  
**Not this:** What to build next ([DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)), manual checklists ([PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)), or Playwright steps ([automation/README.md](./automation/README.md)).

Nexo is a single Next.js App Router application with TypeScript, a PostgreSQL database, and JSON REST handlers under `/api/*`.

```
Browser (Playwright later)
        │
        ▼
Next.js (App Router)
  ├── pages (UI, redirects)
  ├── /api/* route handlers (JSON)
  └── domain functions (shared rules)
        │
        ▼
Prisma 6  →  PostgreSQL 16 (Docker Compose)
```

## Runtime pieces

| Piece                              | Role                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| Next.js App Router                 | Pages, layouts, `proxy.ts` for session redirects           |
| REST route handlers                | Stable HTTP contract for UI and API tests                  |
| Domain functions                   | Same create/list/status/isolation rules for pages and APIs |
| Prisma                             | Schema, migrations, `db:reset`                             |
| PostgreSQL                         | Source of truth                                            |
| Auth.js Credentials (Iteration 2+) | Cookie session; role stored on `users`                     |

There is no separate API server. There is no Supabase. There is no object storage.

## Request flow (target, after Iteration 5)

1. Browser submits a form or fetch to `/api/...`.
2. Route handler authenticates the session cookie.
3. Handler calls a domain function (not inline SQL in the route).
4. Domain function enforces role, ownership, and status transitions.
5. Prisma writes `requests` and `request_status_history` together where required.
6. UI navigates; APIs return JSON status codes.

Iteration 2 adds Auth.js, seed users, and route protection. Iteration 3 adds domain functions plus customer create / list / detail (`GET`/`POST /api/requests`, `GET /api/categories`). Agent status `PATCH` and seed request rows wait for later iterations.

## UI vs API oracles

| Situation                                 | Page                                           | API   |
| ----------------------------------------- | ---------------------------------------------- | ----- |
| Anonymous                                 | Redirect to `/login`                           | `401` |
| Wrong role                                | Redirect to that user’s dashboard              | `403` |
| Customer reads another customer’s request | Redirect or not-found page (no existence leak) | `404` |
| Agent reads any request                   | Detail page                                    | `200` |

## Page map

| Path                           | Who                            |
| ------------------------------ | ------------------------------ |
| `/login`                       | Public                         |
| `/`                            | Redirects to `/login`          |
| `/customer/dashboard`          | Customer                       |
| `/customer/requests`           | Customer                       |
| `/customer/requests/new`       | Customer                       |
| `/customer/requests/:publicId` | Customer (own only)            |
| `/agent/dashboard`             | Agent                          |
| `/agent/requests`              | Agent                          |
| `/agent/requests/:publicId`    | Agent + status control (later) |
| Log out                        | Both → `/login`                |

`:publicId` is the human id, e.g. `NX-000001`.

## Layers (keep it small)

```
app/                 pages and route handlers
components/          semantic UI
lib/domain/          rules (from Iteration 3)
lib/prisma.ts        Prisma client singleton
auth.ts / auth.config.ts  Auth.js (Iteration 2)
proxy.ts             Route protection (Next.js 16)
prisma/              schema + migrations
```

Do not add a package monorepo, message queue, or Redis for MVP.

## Testability constraints (apply as features land)

- Semantic HTML and accessible names first (`getByRole`, `getByLabel`).
- `data-testid` (also set as `id`) on key controls — list in the root README; constants in `lib/test-ids.ts`.
- Predictable URLs.
- Generic login error copy (no “email not found” vs “wrong password”).
- Field-level validation messages; `role="alert"` for submit failures.
- Same rules on UI and API so RBAC is not “the button was hidden.”
