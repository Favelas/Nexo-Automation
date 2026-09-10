# Feedback — I3 customer specs

**What this is:** How to turn a product fact into code when the test must **read** a value and **reuse** it. Locators and simple `expect`s you already have.  
**Use it when:** You understand the rule (“the id is in the top row”) but freeze on the next line.  
**Not this:** Tracker ([PROGRESS.md](./PROGRESS.md)). Product rules ([../PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md)).

The spec is `e2e/customer/requests.spec.ts`. Clicks and reads live in `e2e/pages/`. `expect` stays in the spec.

---

## 1. `const` — a name you fill once

`const title = "Test title"` gives a name to a string. You assign it **one time**. Later lines use that name. They do not type `"Test title"` again.

```ts
const title = "Test title";
await newRequestPage.newRequest(title, category, description);
await expect(detailsPage.title).toHaveText(title);
```

`const` does **not** mean “I typed this before the test started.”  
It means “this name gets a value **one time**.”

| Answer this first | When you write `const` | Example |
| ----------------- | ---------------------- | ------- |
| I already know this string **before** Create | At the top of the test | `title`, `category`, `description`, `status` |
| I only know it **after** the UI shows it | Right after you read the page | `publicId` |

Same keyword. Different **moment**. `let` is for overwriting the same name later. These tests do not need it.

```ts
const publicId = "NX-000001"; // wrong — you do not choose that number
```

---

## 2. From thought to code (`publicId`)

You already know: after create, the new id is in the **first cell of the top row**.  
The hard part is the shape of the code: **read → store → reuse**.

That shape is the same every time you need a value the app created.

### Four questions (write them before any code)

| # | Question | For this test |
| - | -------- | ------------- |
| 1 | What string will I need **later**? | The request id, e.g. `NX-000008` |
| 2 | After **which click** does it exist? | After **Create request** (then the list) |
| 3 | **Where** is it on the page? | Table → top body row → first cell |
| 4 | **Where** do I plug it in? | URL, detail id, Ben’s `goto` |

If you cannot fill box 4, you do not need to read the text. Clicking the top link does **not** need the string. Checking `/customer/requests/NX-…` **does**.

### The code shape (always this)

```ts
await /* the action from question 2 */;

const publicId = await /* read the locator from question 3 */;

await expect(page).toHaveURL(`/customer/requests/${publicId}`); // question 4
await expect(detailsPage.publicId).toHaveText(publicId);
await detailsPage.goto(publicId); // isolation only
```

Four jobs, four pieces of syntax:

| You think | You type |
| --------- | -------- |
| Find the cell | a locator (`table` → `tr` → `td`) |
| Take the visible text out | `.innerText()` |
| Wait until that text is there | `await` |
| Keep it under a name | `const publicId = …` |
| Put that name inside a URL | `` `/customer/requests/${publicId}` `` |

Without `await`, `publicId` is not `"NX-000008"`. It is a Promise. The URL becomes garbage.

### Put the read on the page object

Question 3 is a locator. Locators belong in the POM. The spec only says *when* to read.

```ts
// MyRequestsPage — how to get the text
latestRow() {
  return this.table.locator("tbody tr").first();
}

async getLatestRequestId() {
  const text = await this.latestRow().locator("td").first().innerText();
  return text.trim();
}

async openLatestRequest() {
  await this.latestRow().getByRole("link").click();
}
```

| Line | Why it is there |
| ---- | ---------------- |
| `this.table` | Parent: `request-table` |
| `tbody tr` | Body rows, not the header |
| `.first()` | Top row = newest (`createdAt` desc) |
| `locator("td").first()` | First cell = the id |
| `innerText()` | The letters, not a click |
| `await` / `return` / `trim()` | Wait, hand the string to the spec, drop spaces |

`.first()` only means “the one we just created” because the list puts **new rows at the top**. If the sort changes, locate by the id you already stored: `requestLink(publicId)`.

### Then the spec (order = the four questions)

```ts
await newRequestPage.newRequest(title, category, description); // 2 — now the id exists

const publicId = await myRequestPage.getLatestRequestId();     // 3 — read + store

await expect(myRequestPage.latestRow()).toContainText(title);
await expect(myRequestPage.latestRow()).toContainText(status);

await myRequestPage.openLatestRequest();                       // click; no string needed
await expect(page).toHaveURL(`/customer/requests/${publicId}`); // 4
await expect(detailsPage.publicId).toHaveText(publicId);
await expect(detailsPage.title).toHaveText(title);             // still the consts from before Create
```

Isolation is the same stored name, other user:

```ts
const createdPublicId = await myRequestPage.getLatestRequestId();
// logout → Ben login → toHaveURL dashboard
await detailsPage.goto(createdPublicId);
await expect(detailsPage.heading).toHaveText("Request not found");
```

Happy path: **click** the top row. Isolation: **open the URL** with the stored id.

### Next time something feels “too complex”

Do not start at the locator. Fill the four questions on paper. Then:

1. POM method that **returns a string** (`async` + `innerText` + `return`).
2. In the spec, **after** the action: `const name = await thatMethod()`.
3. Use `name` only in the lines from question 4.

That is the skill: not a new kind of locator — **capture and reuse**.

---

## 3. Spec vs POM

| | Spec | POM |
| - | ---- | --- |
| Job | The rule (`expect`) | Where to click / how to read |
| Example | `toHaveText(title)` | `getLatestRequestId()`, `newRequest(...)` |

If a method is named `verify*` / `assert*`, it belongs in the spec.

`newRequest(title, category, description)` must **use those arguments**. If the body still fills `"Test title"`, the empty-field test creates a real row. One click: the method **or** the spec, not both.

---

## 4. After login / logout / create — wait for the URL

`LoginPage.login()` only fills and clicks. It must **not** wait for the dashboard (invalid login stays on `/login`).

After a session change or a submit that navigates:

```ts
await expect(page).toHaveURL("…the page you think you are on…");
```

| If you skip that | What you see |
| ---------------- | ------------ |
| Login, then `goto` dashboard too soon | Still **Log in**, or `ERR_ABORTED` |
| Logout, then `goto("/login")` with the cookie still there | Ana’s dashboard; Email timeout |
| Create, then read the table too soon | Empty table / wrong row |

Logout: click → `toHaveURL("/login")` → Ben `login()`. Do not `goto("/login")` after that.

---

## 5. Locators (short)

- **New request** is a **link**, not a button. There are two: `nav-new-request` and `cta-new-request`.
- Prefer role/label. Use `getByTestId` when the name is shared or has no name.
- Detail values: `request-title`, `request-category`, `request-description`, `request-status`.
- On red: screenshot first. “Am I on the page I think?”

---

## 6. Before Run

1. After `login(` / logout → `toHaveURL`?
2. Words I typed → one `const`, fill **and** expect?
3. Value the app created → four questions → `await` read → reuse?
4. `expect` only in the spec?
