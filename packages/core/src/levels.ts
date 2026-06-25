// Progression ranks, resolved from the trailing 30-day average score.
import type { Level, LevelInfo } from "./types.js";

export const LEVELS: readonly Level[] = [
  { num: 1, name: "Initiate", min: 0 },
  { num: 2, name: "Operator", min: 50 }, // 50% consistency
  { num: 3, name: "Vanguard", min: 70 }, // 70%
  { num: 4, name: "Elite", min: 85 }, // Elite Consistency
  { num: 5, name: "Alpha Master", min: 95 }, // Alpha Master
] as const;

/**
 * Resolve an avg-30 score into the current rank + the next rank to chase.
 * `next` is null at the top rank.
 */
export function levelInfo(avg30: number): LevelInfo {
  let current: Level = LEVELS[0]!;
  for (const l of LEVELS) {
    if (avg30 >= l.min) current = l;
  }
  const next = LEVELS.find((l) => l.min > current.min) ?? null;
  return { consistency: avg30, current, next, levels: LEVELS };
}
