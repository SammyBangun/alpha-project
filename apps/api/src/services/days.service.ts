// Daily log service. The ONLY writer of DailyLog.score — always recomputed via
// @alpha/core, never trusted from the client. Every query is scoped by userId.
import { dayScore, type DailyLog as CoreDailyLog } from "@alpha/core";
import type { DailyLog } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { DayUpsertInput } from "../schemas/day.schema.js";

/** API-facing shape: date as 'YYYY-MM-DD', no internal ids/timestamps noise. */
export interface DayDto {
  date: string;
  noZeroDay: boolean;
  deepWorkHours: number;
  workout: boolean;
  learningMinutes: number;
  oathCount: number;
  mit: string | null;
  intentions: string | null;
  reflection: string | null;
  lessons: string | null;
  score: number;
  updatedAt: Date;
}

/** Parse 'YYYY-MM-DD' into a UTC-midnight Date so it round-trips a @db.Date column. */
function toDbDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

/** Format a stored @db.Date back to 'YYYY-MM-DD'. */
function fromDbDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toDto(row: DailyLog): DayDto {
  return {
    date: fromDbDate(row.date),
    noZeroDay: row.noZeroDay,
    deepWorkHours: row.deepWorkHours,
    workout: row.workout,
    learningMinutes: row.learningMinutes,
    oathCount: row.oathCount,
    mit: row.mit,
    intentions: row.intentions,
    reflection: row.reflection,
    lessons: row.lessons,
    score: row.score,
    updatedAt: row.updatedAt,
  };
}

export async function listDays(userId: string, from?: string, to?: string): Promise<DayDto[]> {
  const rows = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        ...(from ? { gte: toDbDate(from) } : {}),
        ...(to ? { lte: toDbDate(to) } : {}),
      },
    },
    orderBy: { date: "asc" },
  });
  return rows.map(toDto);
}

export async function getDay(userId: string, date: string): Promise<DayDto | null> {
  const row = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: toDbDate(date) } },
  });
  return row ? toDto(row) : null;
}

/**
 * Idempotent upsert by (userId, date). Merges the patch over any existing row,
 * recomputes the canonical score with @alpha/core, and persists. Safe to retry
 * from the offline queue.
 */
export async function upsertDay(userId: string, date: string, patch: DayUpsertInput): Promise<DayDto> {
  const existing = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: toDbDate(date) } },
  });

  // merge existing values with the incoming patch (patch wins where present)
  const merged = {
    noZeroDay: patch.noZeroDay ?? existing?.noZeroDay ?? false,
    deepWorkHours: patch.deepWorkHours ?? existing?.deepWorkHours ?? 0,
    workout: patch.workout ?? existing?.workout ?? false,
    learningMinutes: patch.learningMinutes ?? existing?.learningMinutes ?? 0,
    oathCount: patch.oathCount ?? existing?.oathCount ?? 0,
    mit: patch.mit ?? existing?.mit ?? null,
    intentions: patch.intentions ?? existing?.intentions ?? null,
    reflection: patch.reflection ?? existing?.reflection ?? null,
    lessons: patch.lessons ?? existing?.lessons ?? null,
  };

  // canonical, server-computed score — the client's value (if any) is ignored
  const scoreInput: Partial<CoreDailyLog> = {
    noZeroDay: merged.noZeroDay,
    deepWorkHours: merged.deepWorkHours,
    workout: merged.workout,
    learningMinutes: merged.learningMinutes,
  };
  const score = dayScore(scoreInput);

  const row = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: toDbDate(date) } },
    update: { ...merged, score },
    create: { userId, date: toDbDate(date), ...merged, score },
  });

  return toDto(row);
}
