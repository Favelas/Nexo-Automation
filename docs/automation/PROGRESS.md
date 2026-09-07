# Automation Builder

While creating an automation framework:

1. Consider the structure
2. What can be automated and why
3. Think on reducing regression as much as possible

Tick a step when it is done on **this** machine. Iteration maps and gates: [ITERATIONS.md](./ITERATIONS.md). Architecture: [FRAMEWORK.md](./FRAMEWORK.md).

**Current stop:** Steps 1–8 done. Product **Iteration 2 is closed.** Next on the suite side: Step 9 / Levels 1–3 (`e2e/auth/`). Next on the product side: Iteration 3 (create request). See [ITERATIONS.md — Current stop](./ITERATIONS.md#current-stop).

---

## Step 1 — Add folder

Create the folder where automation will live.

- [x] `e2e/` on `main` in this repo (not a second repo, not only `nexo-dev`)
- [x] Day-one shape: `e2e/smoke/` for the first spec
- [ ] Leave `e2e/pages/` and `e2e/fixtures/` **empty** until a second spec copies locators (Level 4) and login is real (Level 5)

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
- [x] Fill + submit; URL still `/login`
- [x] Post-submit message via `getByTestId('login-status')` — `getByRole('status')` matches **two** nodes (`iteration-banner` + `login-status`) and fails strict mode
- [x] No dashboard assert. Name matches the oracle (stays on login), not “logged in”

Why this spec: Iteration 1 **guarantees** the form and that submit does not authenticate. A dashboard assert would be red today and **wrong** when Iteration 2 ships.

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
- [ ] Confirm anytime with `npx playwright test` (no path) → **1** test (the smoke). If you see 3, the demo is back

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

## Step 9 — Auth specs (Iteration 2 suite)

Auth gate is ticked. Product I2 is closed. The I1 smoke already only asserts the form (it does not claim “valid user stays on `/login`”).

- [ ] `e2e/auth/login.spec.ts` — valid customer A → `/customer/dashboard` + heading
- [ ] Same file or a sibling: valid agent → `/agent/dashboard`
- [ ] Invalid login stays on `/login` with `role="alert"` and **Invalid email or password.**
- [ ] Logout → `/login`; then `/customer/dashboard` returns to `/login`
- [ ] Customer opening `/agent/dashboard` lands on `/customer/dashboard`
- [ ] No POM until those locators appear in a **second** file
- [ ] No custom fixture / `storageState` yet

## Step 10 — Product Iteration 3 (separate sitting)

Customer create / list / detail. Do not start this in the same breath as Step 9 if you will confuse “auth oracles” with “request oracles”.

---

## How the config connects to a spec (reminder)

There is no `import` of `playwright.config.ts` in the spec. The CLI loads the config from the repo root, discovers `e2e/**/*.spec.ts`, builds `{ page }` from `use`, and runs each `test(...)`. Relative `goto('/login')` uses `baseURL`. Timeouts and `testIdAttribute` apply without being named in the spec.
