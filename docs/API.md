# API contract (MVP)

All routes live under `/api/*`. JSON only. No DELETE in MVP.

Auth routes below are implemented in Iteration 2. Request handlers wait for Iteration 5.

## Envelope

Success bodies are resource objects or lists (defined per route). Errors:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

| HTTP | `error.code` (typical) |
| ---- | ---------------------- |
| 400  | `VALIDATION_ERROR`     |
| 401  | `UNAUTHORIZED`         |
| 403  | `FORBIDDEN`            |
| 404  | `NOT_FOUND`            |
| 409  | `CONFLICT`             |

`message` is safe to show in the UI. Do not include stack traces.

## Auth

Session is an HTTP-only cookie set by Auth.js Credentials (`next-auth@5.0.0-beta.32`, JWT). Tests should not guess the cookie name.

Auth.js also owns `GET`/`POST` `/api/auth/[...nextauth]`. The UI and API tests use the thin wrappers:

| Method | Path               | Auth             | Notes                                                                         |
| ------ | ------------------ | ---------------- | ----------------------------------------------------------------------------- |
| `POST` | `/api/auth/login`  | Public           | JSON `{ "email", "password" }`. Sets session cookie. Generic error on failure |
| `POST` | `/api/auth/logout` | Session optional | Clears cookie                                                                 |
| `GET`  | `/api/auth/me`     | Required         | `401` if anonymous. Returns `{ "id", "email", "name", "role" }`               |

## Categories

| Method | Path              | Auth                   | Notes                    |
| ------ | ----------------- | ---------------------- | ------------------------ |
| `GET`  | `/api/categories` | Any authenticated role | List for the create form |

## Requests

| Method  | Path                      | CUSTOMER                                | AGENT           |
| ------- | ------------------------- | --------------------------------------- | --------------- |
| `GET`   | `/api/requests`           | Own rows only                           | All rows        |
| `POST`  | `/api/requests`           | `201`                                   | `403`           |
| `GET`   | `/api/requests/:publicId` | Own → `200`; other customer → **`404`** | `200` if exists |
| `PATCH` | `/api/requests/:publicId` | `403`                                   | Status only     |

`:publicId` is `NX-000001`, not the UUID.

### POST `/api/requests`

Body:

```json
{
  "categoryId": "<uuid>",
  "title": "string",
  "description": "string"
}
```

Creates `SUBMITTED`, assigns `public_id`, writes history `null → SUBMITTED`.

### PATCH `/api/requests/:publicId`

Body:

```json
{
  "status": "SUBMITTED" | "IN_PROGRESS" | "RESOLVED"
}
```

Agent only. Unknown fields ignored or `400`. Invalid status `400`. Missing request `404`.

## Isolation reminder

Customer GET of another customer’s `publicId` is **404**, not 403.
