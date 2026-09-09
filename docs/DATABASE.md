# Database

**What this is:** Postgres / Prisma schema — tables, enums, public ids, seed order, SQLite fallback.  
**Not this:** HTTP routes ([API.md](./API.md)) or how to boot Docker (root [README.md](../README.md)).

Tables may be empty of **requests** until Iteration 5 seed. Iteration 3 seeds **categories** so the create form has options.

## Engine

- **Default:** PostgreSQL 16, one Docker Compose service, database `nexo`.
- **Fallback:** SQLite if Docker Desktop cannot run (see [SQLite fallback](#sqlite-fallback)). Do not switch silently.

## Tables (five)

| Table                    | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `roles`                  | `CUSTOMER`, `AGENT`                              |
| `users`                  | Login identity + role. No separate profile table |
| `categories`             | Request categories                               |
| `requests`               | Work items                                       |
| `request_status_history` | Append-only status changes                       |

Internal primary keys are UUID (`gen_random_uuid()`). Human id on requests is `public_id` like `NX-000001` (unique, sequential).

## Enums

```text
RoleName:        CUSTOMER | AGENT
RequestStatus:   SUBMITTED | IN_PROGRESS | RESOLVED
```

## Relationships

- `users.role_id` → `roles.id`
- `requests.category_id` → `categories.id`
- `requests.customer_id` → `users.id`
- `requests.assigned_agent_id` → `users.id` (nullable)
- `request_status_history.request_id` → `requests.id`
- `request_status_history.actor_id` → `users.id`

Application invariants (not all enforceable as FKs):

- `customer_id` must reference a user whose role is `CUSTOMER`
- `assigned_agent_id`, when set, must reference `AGENT`
- Creating a request writes history `from_status NULL → SUBMITTED`
- Status changes append a row; they do not overwrite history

## Indexes

| Table                    | Index                      |
| ------------------------ | -------------------------- |
| `users`                  | unique `email`             |
| `requests`               | unique `public_id`         |
| `requests`               | `customer_id`              |
| `requests`               | `status`                   |
| `requests`               | `created_at`               |
| `request_status_history` | `(request_id, changed_at)` |

## Public id sequence

PostgreSQL sequence `request_public_id_seq` (starts at 1). Format:

```text
NX- || LPAD(nextval, 6, '0')  →  NX-000001
```

The initial migration creates the sequence and a `next_request_public_id()` function. Application code (later) should allocate ids through that function, not by counting rows.

After seed inserts with known ids, set the sequence past the highest seeded number:

```sql
SELECT setval('request_public_id_seq', <highest_seeded_n>);
```

## History rules

| Event               | `from_status`   | `to_status` | `actor_id`   |
| ------------------- | --------------- | ----------- | ------------ |
| Create request      | `NULL`          | `SUBMITTED` | the customer |
| Agent status change | previous status | new status  | the agent    |

No `DELETE` of requests in MVP. History is append-only.

## Seed sequence

1. Roles
2. Users (password hashes from `TEST_USER_PASSWORD`)
3. Categories (Iteration 3 — Billing, Access, Technical)
4. Requests with explicit `public_id` values (`NX-000001` …) — Iteration 5
5. Matching history rows — Iteration 5
6. `setval` on `request_public_id_seq` — Iteration 5

Do not have every test mutate `NX-000001`. Seed is for identity and reads. Create-per-test for writes.

## SQLite fallback

Use only if Postgres cannot run.

1. Change `datasource.provider` to `sqlite` and `DATABASE_URL` to `file:./dev.db`.
2. Drop `@db.Uuid` and `@db.Text` native types.
3. Replace `gen_random_uuid()` defaults with Prisma `@default(uuid())`.
4. Replace the SQL sequence with a counter table or in-process allocator.
5. Recreate migrations (`prisma migrate diff` from empty). Do not run the Postgres SQL against SQLite.

Document in the PR if you had to do this. Default remains Postgres.
