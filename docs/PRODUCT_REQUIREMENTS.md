# Product requirements (MVP)

**What this is:** What the product must do, what is out of MVP, and the **manual** quality-gate checklists. Tick a box only after you prove it in the browser.  
**Not this:** Build order ([DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)), live product-vs-suite ticks ([automation/ITERATIONS.md](./automation/ITERATIONS.md)), or HTTP details ([API.md](./API.md)).

Enough product to start automation — nothing else.

Nexo is an internal customer-request tracker. Customers submit requests. Agents work them through a small status set. The app exists so a tester can learn Playwright against a realistic UI **and** a real REST API.

## In MVP

- Login / logout
- Roles: `CUSTOMER` and `AGENT`
- Protected routes and role-based nav
- Customer: dashboard, create request, list **own** requests, open **own** details
- Agent: dashboard, list **all** requests, open details, change status among `SUBMITTED` \| `IN_PROGRESS` \| `RESOLVED`
- Seed users, seed requests, reset script
- REST API for the same rules

## Out of MVP

Admin, register, reset password, comments, uploads, extra statuses, search, email, hosting, third-party auth vendors.

## Quality gate — ready for a serious suite

Do not call a feature automation-ready until these pass **manually**.

### Auth

- [x] Valid customer login lands on `/customer/dashboard`
- [x] Valid agent login lands on `/agent/dashboard`
- [x] Invalid login stays on `/login` with a generic error (`role="alert"`)
- [x] Logout returns to `/login` and session cannot open a protected page
- [x] Anonymous visit to a protected page redirects to `/login`
- [x] Customer hitting `/agent/*` redirects to the customer dashboard
- [x] Agent hitting `/customer/*` redirects to the agent dashboard

### Customer

- [x] Create request with category, title, description
- [x] Empty required fields show field-level messages (no submit success)
- [x] New request appears in **My requests** with public id `NX-######`
- [x] Detail URL uses that public id
- [x] Customer cannot see another customer’s request (UI: no row / not found; API: `404`)

### Agent

- [ ] Queue lists requests from more than one customer (seed)
- [ ] Status control offers only the three MVP statuses
- [ ] Status change is visible on detail and in the list
- [ ] Agent cannot create a request (UI: no create action; API: `403`)

### Platform

- [ ] `npm run db:reset` restores seed users and seed requests
- [ ] Seed passwords come from `TEST_USER_PASSWORD`
- [ ] `/api/auth/me`, `/api/requests`, and `/api/requests/:publicId` match the UI rules
- [ ] App runs locally with Docker Postgres; SQLite is documented fallback only

## Manual checklists by iteration

### Iteration 1

- [ ] `npm run dev` boots
- [ ] `http://localhost:3000/login` renders a labeled email/password form and a **Log in** button
- [ ] Page-map URLs render (customer and agent placeholders)
- [ ] Docker Compose file exists; `docker compose up -d` starts Postgres when Docker is available
- [ ] `npx prisma validate` succeeds against `prisma/schema.prisma`

Login did **not** authenticate in Iteration 1.

### Iteration 2

Manual login checklist in the Auth section above (except request features). Seed users with `npm run db:seed`.

### Iteration 3

Customer happy path: create → list → detail. Categories are seeded; request rows `NX-000001`… still wait for Iteration 5.

### Iteration 4

Agent queue, detail, status; customer can see the new status on their own request.

### Iteration 5

Quality gate fully green. Then **stop building product** and start Playwright yourself.

## Seed identities

Canonical emails, password, seed requests, and isolation oracles: [README — Test data](../README.md#test-data-manual-kit).

| Who        | Email                  | Role       | Owns                      |
| ---------- | ---------------------- | ---------- | ------------------------- |
| Customer A | `customer.a@nexo.test` | `CUSTOMER` | `NX-000001`, `NX-000002`  |
| Customer B | `customer.b@nexo.test` | `CUSTOMER` | `NX-000003`               |
| Agent      | `agent@nexo.test`      | `AGENT`    | (assigned on 002 and 003) |

Shared password: `TEST_USER_PASSWORD` (`Password123!` in `.env.example`). Users load in Iteration 2; request rows in Iteration 5.
