# Automation Builder

**What this is:** Day-to-day steps while you build the suite. Tick a box on **this** machine.  
**Not this:** Product-vs-suite map ([ITERATIONS.md](./ITERATIONS.md)), skill **definition of done** ([AUTOMATION_ROADMAP.md](./AUTOMATION_ROADMAP.md)), or how folders/config should look ([FRAMEWORK.md](./FRAMEWORK.md)).

While creating an automation framework:

1. Consider the structure
2. What can be automated and why
3. Think on reducing regression as much as possible

Tick a step when it is done on **this** machine. Iteration maps and gates: [ITERATIONS.md](./ITERATIONS.md). Architecture: [FRAMEWORK.md](./FRAMEWORK.md).

**Current stop:** Product I4 is green by hand. I4 specs are unblocked; you write them. No fixtures. See [Today](#today) and [ITERATIONS.md](./ITERATIONS.md#current-stop).

Before a commit: tick the matching row here / in ITERATIONS so code and docs go together.

---

## Step 1 — Add folder

Create the folder where automation will live.

- [x] `e2e/` on `main` in this repo (not a second repo, not only `nexo-dev`)
- [x] Day-one shape: `e2e/smoke/` for the first spec
- [x] `e2e/pages/` filled in Step 10 (POM). `e2e/fixtures/` still empty — no custom fixture yet

Prefer the handbook name `fixtures/` (plural). A leftover `e2e/fixture/` can be deleted when you touch Git.

## Step 2 — Install Playwright

```powershell
cd C:\Users\maryf\Documents\Nexo-Automation
npm init playwright@latest
```

Wizard: TypeScript, tests in `e2e`, GitHub Action **No**, install browsers **Yes**.

- [x] `playwright.config.ts` at repo root
- [x] `@playwright/test` in `package.json`
- [x] Init example spec was created (later removed — Step 6)

## Step 3 — Update `playwright.config.ts`

Control plane. One Chromium project. No `storageState` yet.

| Item | Starting gap | Now |
| ---- | ------------ | --- |
| `reporter` list + html | Was `'html'` only | [x] `list` + `html` `{ open: 'never' }` |
| `baseURL` active | Was commented | [x] Same host:port as `webServer.url` |
| `actionTimeout` / `navigationTimeout` | Missing | [x] 10s / 15s |
| `screenshot: 'only-on-failure'` | Missing | [x] |
| `webServer.timeout` | Missing | [x] 120s |
| Same port on `baseURL` and `webServer` | Mismatch risk | [x] Both `http://localhost:3001` on this PC (3000 was taken). Contract in docs is **3000** if that port is free |
| `testIdAttribute` | — | [x] `data-testid` |
| `fullyParallel` / `workers` | Defaults were parallel | [x] `false` / `1` |
| `webServer.command` | Wizard said `npm run start` | [x] `npm run dev` |
| Firefox / WebKit projects | Init added three browsers | [x] Chromium only |

`baseURL` is **not** imported in the spec. `npx playwright test` loads the config; `{ page }` gets `use`. Absolute URLs (`https://playwright.dev/`) ignore `baseURL`.

## Step 4 — Create the first Nexo spec

Not next to the example. Not a POM.

- [x] File: `e2e/smoke/login-form.spec.ts`
- [x] Import `test` / `expect` from `@playwright/test`; use built-in `{ page }`
- [x] `goto('/login')` (relative)
- [x] Heading **Log in**, Email, Password, button — role/label first
- [x] After auth exists: smoke only checks the form is visible (do not assert “valid user stays on `/login`”)

## Step 5 — Run the spec

```powershell
npx playwright test e2e/smoke/login-form.spec.ts --headed
```

Then the same without `--headed`.

- [x] 1 worker, Chromium, passed
- [x] App URL matches `baseURL` (here `:3001`)

## Step 6 — Remove the demo

`testDir: './e2e'` runs every `*.spec.ts` under `e2e/`.

- [x] `e2e/example.spec.ts` gone
- [x] `npx playwright test` (no path) now runs smoke **plus** `e2e/auth/` (about 10 tests). If you still see playwright.dev, the demo is back

## Step 7 — Gitignore

Ignore runner output and **future** session files. Do **not** create `e2e/.auth/` now. Do **not** ignore all of `e2e/`.

- [x] `/test-results`
- [x] `/playwright-report`
- [x] `/blob-report`
- [x] `/playwright/.cache/` and `/playwright/.auth/` (wizard defaults)
- [x] `/e2e/.auth/` (Nexo path for `storageState` in Iteration 2+ / Level 6)

## Step 8 — Commit on `main`

Include: `playwright.config.ts`, `e2e/smoke/login-form.spec.ts`, `package.json`, `package-lock.json`, `.gitignore`.

Do not include empty `pages/` / `fixtures/` unless you want the folders in Git. Do not commit `test-results/` or `playwright-report/`.

Example message:

```
Add Playwright and an Iteration 1 smoke that login submit stays on /login.
```

- [x] Commit done

Push when you want (`git push origin main`). Backup snapshot: `git push origin main:nexo-dev`.

## Step 9 — Auth specs

Product already logs in by hand. One `test()` per rule in `e2e/auth/login.spec.ts`. Still `{ page }`. No POM yet.

| Prove | How you know |
| ----- | ------------ |
| Valid customer / agent | Their dashboard URL + **heading** (not the “Signed in as” line) |
| Bad email / bad password | Stay on `/login`, **same** copy: Invalid email or password. |
| Logout | Back to `/login`, then a protected URL still `/login` |
| Wrong role | Customer cannot stay on `/agent/*` (and the reverse) |
| Anonymous | Never logged in; dashboards send you to login |

Name the rule (not “submitable”). `toHaveURL('/login')` is exact — a `?callbackUrl=` is not the same string. If `getByRole('alert')` matches two nodes, Next added one; use `login-status` + the copy.

```powershell
npx playwright test e2e/auth/login.spec.ts
```

- [x] Nine auth tests green; smoke still only “form visible”

## Step 10 — POM

You pasted login in every test. Move locators + `goto` + one `login(email, password)` into a class. **Asserts stay in the spec.**

| Who | Role |
| --- | ---- |
| `{ page }` | Playwright gives you a new tab each test. You do not import it. |
| `LoginPage` | You `export` the class so the spec can `import` it. |
| `new LoginPage(page)` | Hands that tab to the POM. Do this **per test**. |
| `page.object.ts` | Optional tiny base: only stores `page`. Not required. Keep it small. |

File: `login.page.ts` (class `LoginPage`). No fixture yet — fixture is “give me a page already built/logged in”. Logout stays in the spec (header, not the form).

- [x] POM wired; auth tests still green

## Today

Product I4 is green by hand. No Playwright in this sitting.

- [x] I3 specs (navigate, happy create + detail, empty fields, isolation). No fixtures
- [x] Agent queue lists every customer
- [x] Agent changes status; customer sees it
- [x] Do not add I4 Playwright (this sitting)

## Step 11 — Pause

Login and I3 stay closed. Product I4 stays closed. Next sitting you may add I4 specs. Not Level 5.

---

Config is not imported. The CLI reads it, finds `e2e/**/*.spec.ts`, and injects `{ page }`. The POM uses that same tab; it does not start the browser.
