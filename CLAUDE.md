# CLAUDE.md — Project Alpha

> Persistent context for Claude Code. Read this before every task.
> Full architecture, database schema, and API contract live in **@ARCHITECTURE.md** — that file is the source of truth. This file is the working agreement: conventions, rules, and do/don'ts.

---

## What this project is
**Project Alpha** is a Personal Operating System for discipline and self-mastery — "Alpha = a person who improves 1% every day, regardless of mood." It is **not** a generic habit tracker. It tracks **input metrics** (deep work, training, learning, oath compliance) and derives everything else.

Modules: Alpha Core (identity), Daily Engine, Metrics, Weekly Reset (feedback), Progression (XP/ranks), Anti-Failure, Environment, The Oath.

---

## Stack (do not deviate without asking)
- **Web:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Mobile:** React Native + Expo + TypeScript + NativeWind
- **Backend:** Express.js + TypeScript + Prisma + PostgreSQL
- **Shared:** `packages/core` (framework-agnostic TS) — scoring/levels/streaks
- **Monorepo:** Turborepo + pnpm workspaces
- **Auth:** JWT (access + rotating refresh), passwords hashed with argon2/bcrypt

---

## Golden rules (non-negotiable)
1. **`DailyLog` is the single source of truth.** Every metric — weekly/monthly score, streak, heatmap, calendar, level, honor, burnout — is **derived** from `DailyLog`. Never create duplicate aggregate tables or store computed totals (except the cached per-day `score`).
2. **Scoring is server-authoritative.** The client may compute a score for instant UX, but the server **always re-computes** with `@alpha/core` `dayScore()` before persisting. Never trust a client-sent score.
3. **One shared scoring brain.** Web, mobile, and backend import the SAME functions from `packages/core`. Never reimplement scoring/level logic in an app.
4. **Idempotent sync.** Daily writes upsert by `(userId, date)`. Any mutation must be safe to retry from the offline queue.
5. **User isolation.** Every query is scoped by `req.userId`. A user can only ever read/write their own rows.
6. **Input metrics only.** We track effort (hours, sessions, minutes), never outcomes (weight, salary, followers).

---

## Scoring spec (keep identical everywhere)
```ts
dayScore = round(
  (noZeroDay ? 25 : 0) +
  min(deepWorkHours / 2, 1) * 25 +
  (workout ? 25 : 0) +
  min(learningMinutes / 30, 1) * 25
)  // 0..100
```
- **Weekly / Monthly Alpha score** = average `dayScore` over trailing 7 / 30 days.
- **Streak** = consecutive days with `dayScore >= 50` (today counts only if already ≥50).
- **Level** (from avg 30-day score): L1 Initiate ≥0 · L2 Operator ≥50 · L3 Vanguard ≥70 · L4 Elite ≥85 · L5 Alpha Master ≥95.
- **Honor score** = average(`oathCount` / 7) over trailing 30 days, as a percentage.
- **Burnout load** = function of deep-work intensity + workout frequency (see prototype/`packages/core`).
- **Anti-Failure metrics** (missed days, recovery rate, worst gap) are **queries over `DailyLog`**, never stored.

---

## Code conventions
- **TypeScript strict mode** on everywhere. No `any` without a written reason.
- Shared types live in `packages/core/src/types.ts` — import, never redefine.
- API responses are typed; the web/mobile fetch clients are fully typed against them.
- Dates as `'YYYY-MM-DD'` strings at the boundary; `@db.Date` in Postgres.
- Validate all request bodies (zod) in the service layer before touching Prisma.
- Keep controllers thin → services hold logic → Prisma only in services.
- Prefer `prisma.upsert` for daily/weekly/env records (they are one-per-period).

---

## Design system (UI)
- **Dark theme**, premium/masculine/minimal — inspired by Linear, Raycast, Stripe.
- Accent: **gold `#d4a24e`** on near-black `#08080a` / panels `#101012`.
- Fonts: **Space Grotesk** (UI) + **JetBrains Mono** (labels, codes, numbers).
- Borders: hairline `rgba(255,255,255,0.07–0.08)`, radius 11–16px.
- Tone of copy: disciplined, direct, military-grade. Never childish, never gamified-cute.
- Share design tokens via `packages/ui`; web uses Tailwind, mobile uses NativeWind with the same token values.

---

## Do NOT
- ❌ Reimplement scoring/level/streak logic outside `packages/core`.
- ❌ Trust client-computed scores on write.
- ❌ Add aggregate/summary tables that duplicate `DailyLog`.
- ❌ Track outcome metrics.
- ❌ Make the UI look like a generic habit tracker or mobile game.
- ❌ Introduce a new library/framework not in the stack without asking first.
- ❌ Write cross-user queries or unscoped Prisma calls.

---

## Workflow with me
- For any non-trivial task, **show a short plan before writing code.**
- Follow the build order in @ARCHITECTURE.md §9: `packages/core` → `apps/api` → `apps/web` → remaining web modules → `apps/mobile` → achievements + landing.
- After changing scoring or schema, update **@ARCHITECTURE.md** and the unit tests in `packages/core`.
- Run `pnpm lint` and `pnpm test` (core) before declaring a task done.

---

## Useful commands
```bash
pnpm install                 # bootstrap monorepo
pnpm --filter @alpha/api prisma migrate dev    # run migrations
pnpm --filter @alpha/api dev                    # start Express API
pnpm --filter web dev                           # start Next.js
pnpm --filter mobile start                      # start Expo
pnpm --filter @alpha/core test                  # run scoring unit tests
pnpm lint && pnpm test
```
