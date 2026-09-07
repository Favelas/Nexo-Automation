# Docs

Two folders only. Read the **What this is** line at the top of a file if you are unsure.

| Folder | What lives here |
| ------ | --------------- |
| **This folder** | The **Nexo app**: what it is, what to build, schema, API, decisions |
| **[automation/](./automation/README.md)** | **Playwright**: how to grow the suite, trackers, curriculum, exercises |

The root [README.md](../README.md) is how to **run** the app (boot, Git, seed accounts, locator ids). It is not a second product spec.

## Product (this folder)

| File | What this is |
| ---- | ------------ |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the app is shaped — pages, roles, UI vs API oracles |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | MVP scope and **manual** quality-gate checklists |
| [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | What to **build** in Iterations 1–5 |
| [API.md](./API.md) | REST contract (`/api/*`) |
| [DATABASE.md](./DATABASE.md) | Prisma / Postgres schema |
| [DECISIONS.md](./DECISIONS.md) | Why we chose Auth.js, Postgres, 404 isolation, etc. |

## Automation (`automation/`)

Start at [automation/README.md](./automation/README.md).

| File | What this is |
| ---- | ------------ |
| [PROGRESS.md](./automation/PROGRESS.md) | Day-to-day Builder steps (tick while you work) |
| [ITERATIONS.md](./automation/ITERATIONS.md) | Live tracker: product I1–I5 vs suite levels |
| [FRAMEWORK.md](./automation/FRAMEWORK.md) | How to structure the suite (folders, config, POM) |
| [AUTOMATION_ROADMAP.md](./automation/AUTOMATION_ROADMAP.md) | Skill levels — **definition of done** |
| [AUTOMATION_LEARNING_GUIDE.md](./automation/AUTOMATION_LEARNING_GUIDE.md) | Same levels — **curriculum** (concept → practice) |
| [QA_CHALLENGES.md](./automation/QA_CHALLENGES.md) | Practice exercises, no spoilers |

Roadmap and learning guide are **not** copies of each other. Roadmap = when a level is done. Guide = how to learn that level. Ticks live only in ITERATIONS / PROGRESS.
