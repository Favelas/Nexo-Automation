# API testing — I5 (Playwright `{ request }`)

**What this is:** How **you** start Nexo API specs if you already use Postman. Plan, first file, cookie login, oracles.  
**Use it when:** I4 UI is green and you are writing `e2e/api/`.  
**Not this:** The REST contract ([../API.md](../API.md)). Tracker ([ITERATIONS.md](./ITERATIONS.md)). A finished spec (you write that).

You still write every test. This page is the map, not the homework copy.

**Coach:** do not assume UI methods (`goto`, `fill`, `click`, `toHaveURL`). Name every API token the first time it appears. Line-by-line of the current specs: [§10](#10-ui-vs-api--there-is-no-goto) and [§11](#11-line-by-line-isolationspects).

---

## 1. Where we are (the plan)

| Track | Now | Next (this sitting) | Later (not yet) |
| ----- | --- | ------------------- | ---------------- |
| Product | I1–I4 done. Seed `NX-000001`…`003` exists | Optional: `npm run db:reset` once (wipes leftover ids) | STOP growing the app |
| Suite I1–I4 | Green (smoke, auth, customer, agent UI) | Closed | — |
| **I5 suite** | Empty | **API matches UI** — same rules, HTTP codes | `storageState`, one UI journey, CI |
| Levels | 0–4 done | You practice Level 7 (API) | 5 fixtures / 6 `storageState` still wait |

**“API matches UI”** means: if the page hides Ben’s ticket from Ana, `GET /api/requests/NX-000003` as Ana is **404**. You do **not** click the table. You assert `response.status()`.

UI already proved the story for a human. API proves the **rule** for a client that never opens a browser.

Order for I5 (do **not** skip to CI):

1. **Now:** API isolation / RBAC (`e2e/api/`, `{ request }`).
2. Then: `storageState` so UI specs stop pasting login (Level 6).
3. Then: one customer → agent → customer **journey** (Level 10).
4. Then: CI (Level 12).

This sitting is only step 1.

---

## 2. Postman → Playwright

You already think in method, URL, body, status. Playwright is the same call, inside `test()`.

| In Postman | In Playwright |
| ---------- | ------------- |
| Collection + environment `baseUrl` | `baseURL` in `playwright.config.ts` (`http://localhost:3000`) |
| Method + path `/api/requests` | `request.get("/api/requests")` |
| Body JSON | `{ data: { email, password } }` on `post` / `patch` |
| Cookie jar (auto after login) | The `{ request }` fixture **keeps cookies** after `POST /api/auth/login` |
| Tests tab `pm.response.code` | `expect(response.status()).toBe(401)` |
| `pm.response.json()` | `await response.json()` |
| No browser | No `{ page }`. Faster. `--headed` does nothing useful here |

New file: `e2e/api/isolation.spec.ts` (or `auth.spec.ts` first — one file is enough to start).

```ts
import { test, expect } from "@playwright/test";

test("Anonymous GET /api/requests is 401", async ({ request }) => {
  const response = await request.get("/api/requests");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});
```

`{ request }` is Playwright’s API client. You do not import axios.

Assert **status first**, then `json()`. Do not parse HTML.

---

## 3. Session (the part Postman hid)

Nexo login is **not** a Bearer token you paste. `POST /api/auth/login` sets an **HTTP-only cookie**. Postman’s cookie jar stores it. Playwright’s `request` does the same **for that test only**.

```ts
async function login(request: APIRequestContext, email: string) {
  const password = process.env.TEST_USER_PASSWORD ?? "Password123!";
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
}
```

Each `test()` gets a **fresh** `request` (empty jar). Login **inside** the test that needs a user. Do not reuse Ana’s cookie in Ben’s test.

`storageState` is how you **save** that jar to a file for later UI specs. **Not this sitting.**

---

## 4. Contract you assert against

Read [../API.md](../API.md) before writing. Envelope on errors:

```json
{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required." } }
```

| HTTP | `error.code` |
| ---- | ------------ |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |

Isolation: Ana `GET /api/requests/NX-000003` is **404**, not 403.

Seed (read-only in these tests):

| Id | Owner | Ana GET | Agent GET |
| -- | ----- | ------- | --------- |
| `NX-000001` | Ana | 200 | 200 |
| `NX-000002` | Ana | 200 | 200 |
| `NX-000003` | Ben | **404** | 200 |

Do **not** `PATCH NX-000001` to “see if write works”. Create a **new** row (`POST`) if you need a write, then PATCH **that** id.

---

## 5. I5 oracles (one `test()` each)

Write these. Stop when they are green. Do not add CI.

1. No cookie → `GET /api/requests` → **401** + `UNAUTHORIZED`.
2. Login Ana → `GET /api/auth/me` → **200**, `"role": "CUSTOMER"`.
3. Login Ana → `GET /api/requests` → ids include `NX-000001` and `NX-000002`, **not** `NX-000003`.
4. Login Ana → `GET /api/requests/NX-000003` → **404** + `NOT_FOUND`.
5. Login Avery → `GET /api/requests/NX-000003` → **200**.
6. Login Avery → `POST /api/requests` with `{ data: { categoryId: "x", title: "x", description: "x" } }` → **403** + `FORBIDDEN`. Dummy `data` is required (empty POST is **400**, not this test).
7. Login Ana → `PATCH /api/requests/NX-000001` → **403** (proves she cannot change status; does not change seed if 403).

Need a category uuid for a real customer `POST`? `GET /api/categories` after login, pick `id`. That is a later test, not required for the 403 agent case.

---

## 6. Try once in Postman, then copy the thought

App up (`npm run dev`, Postgres healthy).

1. `POST http://localhost:3000/api/auth/login`  
   Body raw JSON: `{ "email": "customer.a@nexo.test", "password": "Password123!" }`  
   Confirm **200** and that Postman stored a cookie.
2. `GET http://localhost:3000/api/requests/NX-000003` (same session)  
   Confirm **404**.
3. New session: login `agent@nexo.test`, same GET → **200**.

When that matches [../API.md](../API.md), type the same two calls in Playwright. If Postman disagrees with the spec, the **product** is wrong — do not “fix” the test to 200.

---

## 7. Run

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
npx playwright test e2e/api/requests/isolation.spec.ts
```

No `--headed`. Failures: status code + JSON in the trace / error, not a screenshot of `/login`.

If 001–003 are missing: `npm run db:seed`. `db:reset` wipes **all** extra `NX-` rows; ask before that.

---

## 8. Spec vs helper (same rule as POM)

| Spec | Helper (later) |
| ---- | -------------- |
| `expect(status)` and `error.code` | `login(request, email)` |
| The rule (“Ana cannot see 003”) | `post` / `get` wrappers |

Do not put `expect` inside a helper named `verifyIsolation`. No `e2e/fixtures/` yet.

---

## 9. Before you click Run

1. App + Postgres up?
2. `{ request }`, not `{ page }`?
3. Status **then** body?
4. Cookie from `POST /api/auth/login` in **this** test?
5. Writes on a **new** id, not a campaign against `NX-000001`?

---

## 10. UI vs API — there is no `goto`

A UI test **drives a browser**. An API test **sends HTTP**. Nothing in API “opens a URL in the address bar.”

| What you want | UI (`{ page }`) | API (`{ request }`) |
| ------------- | --------------- | ------------------- |
| Open a screen | `await page.goto("/login")` | Does not exist |
| Type in a field | `locator.fill("…")` | Does not exist |
| Click | `locator.click()` | Does not exist |
| Landed on a path | `expect(page).toHaveURL("…")` | Does not exist |
| Call the server | (the click caused it) | `request.get("/api/requests")` |
| Send a body | form fill | `request.post(path, { data: { … } })` |
| Did it work? | heading / URL | `response.status()` then `response.json()` |

`baseURL` (`http://localhost:3000`) is prepended for you. You type the **path** (`/api/requests`), not the full URL.

Playwright methods you actually type in API specs:

| You type | Meaning |
| -------- | ------- |
| `request.get(path)` | HTTP GET |
| `request.post(path, { data })` | HTTP POST + JSON |
| `request.patch(path, { data })` | HTTP PATCH + JSON |
| `response.status()` | Status number |
| `await response.json()` | Body as object/array |
| `expect(x).toBe(y)` | Exact match |
| `expect(arr).toContain(y)` / `.not.toContain(y)` | List includes / excludes |

`login` is **not** in that table. We wrote it. See §11.

---

## 11. Line-by-line (`isolation.spec.ts`)

Same helper lives in `e2e/api/auth/login.spec.ts`. Tokens below are the ones that felt “magic.”

### Imports and password

```ts
import { test, expect, type APIRequestContext } from "@playwright/test";
```

| Piece | Kind | Job |
| ----- | ---- | --- |
| `test` | Playwright function | Declares one case: `test("name", async ({ request }) => { … })` |
| `expect` | Playwright function | Assertion. If false, the test fails. |
| `type APIRequestContext` | TypeScript type | The type of `{ request }`. Only needed because `login`’s first argument is typed. |
| `@playwright/test` | Package | Where those names are defined. You do not invent them. |

```ts
const password = process.env.TEST_USER_PASSWORD ?? "Password123!";
```

`const password` = a name filled **once**. `process.env.TEST_USER_PASSWORD` = env var if CI set it. `?? "Password123!"` = if that var is missing, use the seed password. This is **not** sent yet. It is stored for the helper.

### The helper `login` (not a Playwright builtin)

```ts
async function login(request: APIRequestContext, email: string, pass = password) {
  return request.post("/api/auth/login", {
    data: { email, password: pass },
  });
}
```

| Token | Meaning |
| ----- | ------- |
| `async function login` | **We** named this. Playwright does not provide `login`. |
| `(request, email, pass = password)` | Three inputs. Third is optional: if omitted, `pass` is the `password` from above. |
| `request.post(...)` | Same as Postman POST. Path `/api/auth/login`. |
| `data: { email, password: pass }` | JSON body. `email` is the argument. `password` is the key the API expects; `pass` is the value. |
| `return` | Hand the HTTP **response** back to the caller. No `expect` here. |

This is Postman **Login Ana**, packaged so you do not paste POST in every test.

### Where `loginResponse` comes from

```ts
const loginResponse = await login(request, "customer.a@nexo.test");
```

Read right to left:

1. Call **our** `login` with the fixture `request` and Ana’s email. Password is the default (line `pass = password`).
2. `await` — wait until the POST finishes. Without `await` you do not have a response yet (you have a Promise).
3. `const loginResponse =` — give that response a name. **You** chose the name. Could be `res` or `auth`. It is the object `request.post` returned.

Then:

```ts
expect(loginResponse.status()).toBe(200);
```

`loginResponse.status()` is a **number**. `toBe(200)` means login worked and the cookie jar on **this** `request` now has the session. There is still no browser.

### Test 1 — no session

```ts
test("…", async ({ request }) => {
  const response = await request.get("/api/requests");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});
```

| Line | What happens |
| ---- | ------------ |
| `async ({ request })` | Playwright **injects** a fresh HTTP client. Empty cookie jar. This is a **fixture**, not something you construct. |
| `request.get("/api/requests")` | GET. No body. Like Postman GET with no Cookies. |
| `const response = await …` | Store that GET’s result. Different name from `loginResponse` on purpose: this is the list call, not login. |
| `status() === 401` | Not logged in. |
| `await response.json()` | Parse JSON. Envelope `{ error: { code, message } }`. |
| `body.error.code` | Dot = go into the object. Same keys as Postman Body. |

### Test 2 — Ana’s list

```ts
const loginResponse = await login(request, "customer.a@nexo.test");
expect(loginResponse.status()).toBe(200);
const response = await request.get("/api/requests");
expect(response.status()).toBe(200);
const body = await response.json();
const ids = body.map((row: { publicId: string }) => row.publicId);
expect(ids).toContain("NX-000001");
expect(ids).not.toContain("NX-000003");
```

Two HTTP calls, **same** `request` so the cookie from login is sent on the GET.

| Name | Which HTTP call |
| ---- | --------------- |
| `loginResponse` | POST `/api/auth/login` |
| `response` | GET `/api/requests` |
| `body` | JSON of the GET (an **array** of requests) |
| `ids` | Only the `publicId` strings, so `toContain` is easy |

`body.map(...)` = for each row, take `row.publicId`. Type `{ publicId: string }` tells TypeScript each row has that field.

### Pattern for the tests you still write

Same four beats. Change **path**, **method**, and **email**.

```
login (if the route needs a user)
request.get | .post | .patch
expect status
expect body field (error.code or publicId)
```

GET one id: `request.get("/api/requests/NX-000003")` — path includes the id; still not `goto`.

POST with body: `request.post("/api/requests", { data: { categoryId: "x", title: "x", description: "x" } })`.

PATCH: `request.patch("/api/requests/NX-000001", { data: { status: "IN_PROGRESS" } })`.
