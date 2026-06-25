// Derived metrics — everything computed from DailyLog via @alpha/core. Nothing stored.
import {
  dayScore,
  weeklyScore,
  monthlyScore,
  levelInfo,
  streak,
  fmt,
  addDays,
  lastNDates,
  type DailyLog as CoreDailyLog,
  type LogsByDate,
} from "@alpha/core";
import { prisma } from "../lib/prisma.js";

export interface MetricsSummary {
  daily: number;
  weekly: number;
  monthly: number;
  streak: number;
  level: { num: number; name: string; consistency: number; next: string | null };
  xp: number;
}

export async function metricsSummary(userId: string, asOf = new Date()): Promise<MetricsSummary> {
  // pull a generous trailing window once, index by date for O(1) lookups
  const since = addDays(asOf, -200);
  const rows = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: new Date(`${fmt(since)}T00:00:00.000Z`) } },
    orderBy: { date: "asc" },
  });

  const byDate: LogsByDate = {};
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10);
    byDate[key] = {
      date: key,
      deepWorkHours: r.deepWorkHours,
      workout: r.workout,
      learningMinutes: r.learningMinutes,
      noZeroDay: r.noZeroDay,
      oathCount: r.oathCount,
    } satisfies CoreDailyLog;
  }

  const window = (n: number) => lastNDates(asOf, n).map((k) => byDate[k]);

  const today = byDate[fmt(asOf)];
  const li = levelInfo(monthlyScore(window(30)));

  return {
    daily: dayScore(today),
    weekly: weeklyScore(window(7)),
    monthly: monthlyScore(window(30)),
    streak: streak(byDate, asOf),
    level: {
      num: li.current.num,
      name: li.current.name,
      consistency: li.consistency,
      next: li.next?.name ?? null,
    },
    // XP = lifetime sum of daily scores in the window (cheap, derived)
    xp: rows.reduce((acc, r) => acc + r.score, 0),
  };
}
