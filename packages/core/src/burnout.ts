// Burnout load — a function of deep-work intensity + workout frequency. Ported from the prototype.
import type { BurnoutLabel, BurnoutLoad, DailyLog } from "./types.js";

/**
 * Estimate sustained training/work load over the supplied window (intended: 30 days).
 *   load = min(100, round( (avgDeepWorkPerDay / 4) * 100 + (workoutRate > 90% ? 20 : 0) ))
 * High load is a warning to deload, not a goal.
 */
export function burnoutLoad(
  last30: ReadonlyArray<Partial<DailyLog> | null | undefined>,
): BurnoutLoad {
  const window = last30.length || 1;
  const totalDeep = last30.reduce<number>((acc, d) => acc + (d?.deepWorkHours ?? 0), 0);
  const workoutDays = last30.reduce<number>((acc, d) => acc + (d?.workout ? 1 : 0), 0);

  const avgDeepPerDay = totalDeep / window;
  const workoutRate = (workoutDays / window) * 100;

  const pct = Math.min(
    100,
    Math.round((avgDeepPerDay / 4) * 100 + (workoutRate > 90 ? 20 : 0)),
  );

  const label: BurnoutLabel = pct > 80 ? "HIGH" : pct > 55 ? "MODERATE" : "HEALTHY";
  return { pct, label };
}
