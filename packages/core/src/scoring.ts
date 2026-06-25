// The scoring brain. Identical rules everywhere — this is the only place dayScore lives.
import type { ScoreInput } from "./types.js";

/**
 * Per-day compliance score, 0..100. Four equal 25-point pillars:
 *   - no zero day                (25)
 *   - deep work, capped at 2h    (25)
 *   - workout done               (25)
 *   - learning, capped at 30min  (25)
 * Server-authoritative: clients may preview this, but the server always recomputes.
 */
export function dayScore(d: ScoreInput | null | undefined): number {
  if (!d) return 0;
  let s = 0;
  s += d.noZeroDay ? 25 : 0;
  s += Math.min((d.deepWorkHours ?? 0) / 2, 1) * 25;
  s += d.workout ? 25 : 0;
  s += Math.min((d.learningMinutes ?? 0) / 30, 1) * 25;
  return Math.round(s);
}

/** Rounded average dayScore over the supplied logs. Missing/empty -> 0. */
export function averageScore(logs: ReadonlyArray<ScoreInput | null | undefined>): number {
  if (logs.length === 0) return 0;
  const total = logs.reduce<number>((acc, d) => acc + dayScore(d), 0);
  return Math.round(total / logs.length);
}

/**
 * Weekly Alpha score = average dayScore over the trailing 7 days.
 * Pass exactly the days in the window (callers slice the range); padding with
 * absent days counts them as 0, which is the intended "you didn't log = zero" rule.
 */
export function weeklyScore(last7: ReadonlyArray<ScoreInput | null | undefined>): number {
  return averageScore(last7);
}

/** Monthly Alpha score = average dayScore over the trailing 30 days. */
export function monthlyScore(last30: ReadonlyArray<ScoreInput | null | undefined>): number {
  return averageScore(last30);
}
