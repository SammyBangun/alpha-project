// Honor score — 30-day oath compliance as a percentage.
import type { DailyLog } from "./types.js";

/**
 * Honor score = average(oathCount / 7) over the supplied window, as a 0..100 percentage.
 * Pass the trailing 30 days; absent days count as 0 honored values.
 */
export function honorScore(last30: ReadonlyArray<Partial<DailyLog> | null | undefined>): number {
  if (last30.length === 0) return 0;
  const total = last30.reduce<number>((acc, d) => acc + (d?.oathCount ?? 0) / 7, 0);
  return Math.round((total / last30.length) * 100);
}
