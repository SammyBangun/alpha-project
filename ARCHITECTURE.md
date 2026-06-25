# PROJECT ALPHA — Technical Architecture & Database Design

> **Personal Operating System** for self-mastery, discipline, and continuous 1%/day improvement.
> This document is the source-of-truth context for development (web, mobile, backend).
>
> **Philosophy in code:** track _input metrics_ (deep work, training, learning, oath), never outcome metrics. Everything is derived from one immutable table of daily logs.

---

## 1. Stack Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Web** | Next.js 14 (App Router) + TypeScript | Dashboard, marketing landing page. Dark/gold premium UI. |
| **Mobile** | React Native + Expo (TypeScript) | iOS + Android. Offline-first daily tracking. |
| **Backend** | Express.js + TypeScript | REST API, auth, scoring sync. |
| **Database** | PostgreSQL + Prisma ORM | Single source of truth. |
| **Auth** | JWT (access + refresh) | Shared between web & mobile. |
| **Shared logic** | `packages/core` (TS) | Scoring, levels, streaks — used by ALL three apps. |
| **UI Web** | Tailwind CSS + shadcn/ui | |
| **UI Mobile** | NativeWind (Tailwind for RN) | Same design tokens as web. |
| **Charts** | Recharts (web) / Victory Native (mobile) | |
| **State/data** | TanStack Query + Zustand | |
| **Offline (mobile)** | WatermelonDB or AsyncStorage + sync queue | |
| **Monorepo** | Turborepo + pnpm workspaces | |

---

## 2. System Architecture Diagram

```mermaid
graph TD
    subgraph Clients
        WEB["Next.js Web<br/>(dashboard + landing)"]
        MOB["React Native + Expo<br/>(offline-first)"]
    end

    subgraph Shared["packages/core (TypeScript)"]
        CORE["Scoring · Levels · Streaks<br/>Honor · Burnout · XP"]
    end

    subgraph Server["Express.js API"]
        AUTH["Auth Controller<br/>JWT access/refresh"]
        API["REST Controllers<br/>/days /weekly /env /oath"]
        SVC["Service Layer<br/>(validation + scoring re-check)"]
    end

    subgraph Data
        PG[("PostgreSQL<br/>via Prisma")]
        LOCAL[("Mobile Local DB<br/>WatermelonDB")]
    end

    WEB --> CORE
    MOB --> CORE
    WEB -->|HTTPS REST| API
    MOB -->|HTTPS REST| API
    MOB <-->|sync queue| LOCAL
    AUTH --> SVC
    API --> SVC
    SVC --> PG
    AUTH --> PG
```

### Request flow (daily log)
```
User taps "Deep Work +0.5h" (mobile, offline)
        │
        ▼
Write to local DB (WatermelonDB) immediately  ──►  UI updates via shared core scoring
        │
        ▼
Sync queue (when online): POST /api/days/:date  ──►  Express validates + re-computes score server-side
        │
        ▼
Prisma upsert into daily_logs  ──►  returns canonical record  ──►  local DB reconciles
```

> **Rule:** the client computes scores instantly for UX, but the **server re-computes and stores the canonical score** so it can never be tampered with. Both use the identical `packages/core` functions.

---

## 3. Monorepo Structure

```
project-alpha/
├── apps/
│   ├── web/                 # Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (marketing)/page.tsx        # landing page
│   │   │   ├── (app)/core/page.tsx         # Alpha Core
│   │   │   ├── (app)/system/page.tsx       # Daily Engine
│   │   │   ├── (app)/metrics/page.tsx      # Metrics + calendar/heatmap
│   │   │   ├── (app)/feedback/page.tsx     # Weekly Reset
│   │   │   ├── (app)/progression/page.tsx  # XP / Ranks
│   │   │   ├── (app)/antifail/page.tsx     # Anti-Failure
│   │   │   ├── (app)/environment/page.tsx
│   │   │   └── (app)/oath/page.tsx
│   │   └── lib/api.ts        # typed fetch client
│   │
│   ├── mobile/              # React Native + Expo
│   │   ├── app/             # expo-router (same routes as web)
│   │   ├── db/              # WatermelonDB models + schema
│   │   └── lib/sync.ts      # offline sync queue
│   │
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middleware/auth.ts
│       │   └── prisma/schema.prisma
│       └── package.json
│
├── packages/
│   ├── core/               # SHARED scoring logic (framework-agnostic TS)
│   │   └── src/
│   │       ├── scoring.ts   # dayScore, weeklyScore, monthlyScore
│   │       ├── levels.ts    # rank/level thresholds
│   │       ├── streak.ts    # streak + worstGap
│   │       ├── honor.ts     # oath/honor score
│   │       ├── burnout.ts
│   │       └── types.ts     # DailyLog, EnvFactors, Level...
│   │
│   ├── ui/                  # shared design tokens (colors, spacing)
│   └── config/             # eslint, tsconfig, tailwind preset
│
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 4. Shared Core Logic (`packages/core`)

This is the heart of the system. **Web, mobile, and backend all import these — identical rules everywhere.**

```ts
// packages/core/src/types.ts
export interface DailyLog {
  date: string;          // 'YYYY-MM-DD'
  deepWorkHours: number;
  workout: boolean;
  learningMinutes: number;
  noZeroDay: boolean;
  oathCount: number;     // 0..7 core values honored
  mit?: string;
  intentions?: string;
  reflection?: string;
  lessons?: string;
}

// packages/core/src/scoring.ts
export function dayScore(d: Partial<DailyLog>): number {
  if (!d) return 0;
  let s = 0;
  s += d.noZeroDay ? 25 : 0;
  s += Math.min((d.deepWorkHours ?? 0) / 2, 1) * 25;
  s += d.workout ? 25 : 0;
  s += Math.min((d.learningMinutes ?? 0) / 30, 1) * 25;
  return Math.round(s);
}

// packages/core/src/levels.ts  — progression thresholds (avg 30-day score)
export const LEVELS = [
  { num: 1, name: 'Initiate',     min: 0  },
  { num: 2, name: 'Operator',     min: 50 },   // 50% consistency
  { num: 3, name: 'Vanguard',     min: 70 },   // 70%
  { num: 4, name: 'Elite',        min: 85 },   // Elite Consistency
  { num: 5, name: 'Alpha Master', min: 95 },   // Alpha Master
];
```

> Mirror the exact functions already proven in the prototype (`Project Alpha.dc.html`): `dayScore`, `levelInfo`, `streak`, `worstGap`, honor score = avg(oathCount/7) over 30 days, burnout load = f(deep-work intensity + workout frequency).

---

## 5. Database Schema (Prisma / PostgreSQL)

```prisma
// apps/api/src/prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ──────────────── IDENTITY ────────────────
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  displayName   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  identity      Identity?
  dailyLogs     DailyLog[]
  weeklyReviews WeeklyReview[]
  envSnapshots  EnvSnapshot[]
  objectives    Objective[]
  achievements  UserAchievement[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

// Vision, mission, alpha definition, life-domain progress
model Identity {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  visionStatement String   @db.Text
  missionStatement String  @db.Text
  alphaDefinition String   @default("Alpha = a person who improves 1% every day, regardless of mood.")
  updatedAt       DateTime @updatedAt
}

// ──────────────── DAILY ENGINE (the core table) ────────────────
model DailyLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date          // one row per user per day

  // mandatory rules (INPUT metrics)
  noZeroDay       Boolean  @default(false)
  deepWorkHours   Float    @default(0)
  workout         Boolean  @default(false)
  learningMinutes Int      @default(0)

  // morning protocol
  mit             String?  @db.Text
  intentions      String?  @db.Text

  // night review
  reflection      String?  @db.Text
  lessons         String?  @db.Text

  // oath compliance (0..7 core values)
  oathCount       Int      @default(0)

  // canonical, server-computed
  score           Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, date])                    // upsert key
  @@index([userId, date])
}

// ──────────────── FEEDBACK LOOP ────────────────
model WeeklyReview {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weekStart   DateTime @db.Date              // Monday of the week
  whatWorked  String?  @db.Text
  whatFailed  String?  @db.Text
  whyFailed   String?  @db.Text
  adjustment  String?  @db.Text              // "System Failure > Personal Failure"
  createdAt   DateTime @default(now())

  @@unique([userId, weekStart])
}

// ──────────────── ENVIRONMENT ────────────────
model EnvSnapshot {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime @db.Date
  phoneDistraction Int     @default(50)      // 0..100 (lower better)
  workspaceQuality Int     @default(50)
  sleepQuality     Int     @default(50)
  focusEnvironment Int     @default(50)
  createdAt       DateTime @default(now())

  @@unique([userId, date])
}

// ──────────────── OBJECTIVES (Core / Quarterly / Long-term) ────────────────
enum ObjectiveHorizon { LONG_TERM  QUARTERLY }
enum LifeDomain { CAREER  PHYSICAL  MENTAL  FINANCIAL }

model Objective {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  horizon     ObjectiveHorizon
  domain      LifeDomain
  progress    Int              @default(0)   // 0..100
  targetDate  DateTime?
  createdAt   DateTime         @default(now())

  @@index([userId, horizon])
}

// ──────────────── PROGRESSION / ACHIEVEMENTS ────────────────
model Achievement {
  id          String  @id @default(cuid())
  key         String  @unique                // 'streak_7', 'deep_diver_100h'...
  name        String
  description String
  users       UserAchievement[]
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())

  @@unique([userId, achievementId])
}
```

### Why this schema
- **`DailyLog` is the single immutable source of truth.** All metrics — weekly/monthly Alpha score, streaks, level, heatmap, calendar, deep-work charts — are **derived** from it. Never store computed aggregates as duplicate columns (except the per-day `score`, cached for fast queries).
- `@@unique([userId, date])` makes the sync **idempotent**: an upsert by `(userId, date)` is safe to retry from the offline queue.
- Anti-Failure metrics (missed days, recovery rate, worst gap, burnout) are **queries over `DailyLog`**, not separate tables.
- Honor score = aggregate of `oathCount` over the trailing 30 days.

---

## 6. API Contract (Express.js)

| Method | Route | Body / Query | Returns |
|--------|-------|--------------|---------|
| POST | `/auth/register` | `{ email, password, displayName }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken }` |
| GET | `/identity` | — | `Identity` |
| PUT | `/identity` | `Partial<Identity>` | `Identity` |
| GET | `/days?from=&to=` | date range | `DailyLog[]` |
| GET | `/days/:date` | — | `DailyLog` |
| PUT | `/days/:date` | `Partial<DailyLog>` | upserted `DailyLog` (server re-scores) |
| GET | `/metrics/summary` | — | `{ daily, weekly, monthly, streak, level, xp }` |
| GET | `/metrics/heatmap?days=98` | — | `{ date, score }[]` |
| GET | `/weekly?weekStart=` | — | `WeeklyReview` |
| PUT | `/weekly/:weekStart` | `Partial<WeeklyReview>` | `WeeklyReview` |
| GET | `/environment/:date` | — | `EnvSnapshot` |
| PUT | `/environment/:date` | `Partial<EnvSnapshot>` | `EnvSnapshot` |
| GET | `/objectives` | — | `Objective[]` |
| POST/PUT/DELETE | `/objectives/:id?` | `Objective` | `Objective` |
| GET | `/progression` | — | `{ level, xp, consistency, achievements[] }` |

### Server-side scoring (critical)
```ts
// PUT /days/:date controller
import { dayScore } from '@alpha/core';

const merged = { ...existing, ...req.body };
merged.score = dayScore(merged);          // canonical, never trust client score
const saved = await prisma.dailyLog.upsert({
  where: { userId_date: { userId, date } },
  update: merged,
  create: { userId, date, ...merged },
});
```

---

## 7. Offline-First Sync (Mobile)

1. All writes go to **local WatermelonDB first** → instant UI (scored via `@alpha/core`).
2. Each mutation enqueues a job in a **sync queue** table.
3. On connectivity, flush queue: `PUT /days/:date` (idempotent upsert).
4. Pull server changes with `?updatedAfter=` cursor; **last-write-wins** by `updatedAt` (daily logs rarely conflict since they're 1/day/user).
5. Reconcile local rows with the server's canonical `score`.

---

## 8. Auth & Security
- **JWT access token** (~15 min) + **refresh token** (rotating, stored in `RefreshToken`, revocable).
- All `/api/*` (except `/auth/*`) behind `requireAuth` middleware that injects `req.userId`.
- Every query scoped by `userId` — a user can only read/write their own rows.
- Rate-limit auth endpoints; hash passwords with **argon2** or **bcrypt**.

---

## 9. Suggested Build Order (for Claude Code)
1. `packages/core` — types + scoring/level/streak functions (port from prototype, add unit tests).
2. `apps/api` — Prisma schema, migrations, auth, `/days` CRUD with server scoring.
3. `apps/web` — auth + Daily Engine + Metrics, consuming the API.
4. Remaining web modules (Core, Feedback, Progression, Anti-Failure, Environment, Oath).
5. `apps/mobile` — Expo shell, local DB, sync queue, then port screens.
6. Achievements engine + landing page.

---

## 10. Environment Variables
```
# apps/api/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/project_alpha"
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="30d"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:4000"

# apps/mobile/.env
EXPO_PUBLIC_API_URL="http://localhost:4000"
```
