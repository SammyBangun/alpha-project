// Streak + worst-gap derivations over a date-keyed log map. Ported from the prototype.
import type { LogsByDate } from "./types.js";
import { dayScore } from "./scoring.js";
import { fmt, addDays } from "./date.js";

const PASS = 50; // a day "counts" when its score is >= 50

/**
 * Consecutive days (ending at `asOf`) with dayScore >= 50.
 * Today is special: if today already passes it extends the streak; if today is
 * not yet done it does NOT break the streak (the day isn't over) — we keep
 * counting backwards from yesterday. Any earlier failing day breaks it.
 */
export function streak(logs: LogsByDate, asOf: Date = new Date(), maxLookback = 400): number {
  let s = 0;
  for (let i = 0; i < maxLookback; i++) {
    const sc = dayScore(logs[fmt(addDays(asOf, -i))]);
    if (sc >= PASS) {
      s++;
    } else if (i === 0) {
      continue; // today not done yet — don't penalize
    } else {
      break;
    }
  }
  return s;
}

/**
 * Longest run of consecutive failing days (dayScore < 50) within the trailing
 * `window` days ending at `asOf`. Absent days count as failures (score 0).
 */
export function worstGap(logs: LogsByDate, asOf: Date = new Date(), window = 120): number {
  let worst = 0;
  let cur = 0;
  for (let i = window - 1; i >= 0; i--) {
    const sc = dayScore(logs[fmt(addDays(asOf, -i))]);
    if (sc < PASS) {
      cur++;
      if (cur > worst) worst = cur;
    } else {
      cur = 0;
    }
  }
  return worst;
}
