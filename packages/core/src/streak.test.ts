import { describe, it, expect } from "vitest";
import { streak, worstGap } from "./streak.js";
import { fmt, addDays } from "./date.js";
import type { DailyLog, LogsByDate } from "./types.js";

const asOf = new Date(2026, 5, 24); // 2026-06-24, fixed for determinism
const pass: Partial<DailyLog> = { noZeroDay: true, deepWorkHours: 2, workout: true, learningMinutes: 30 }; // 100
const fail: Partial<DailyLog> = {}; // 0

/** Build a log map where offsets-ago (0 = asOf) map to the given day templates. */
function build(byOffset: Record<number, Partial<DailyLog>>): LogsByDate {
  const logs: LogsByDate = {};
  for (const [off, d] of Object.entries(byOffset)) {
    logs[fmt(addDays(asOf, -Number(off)))] = d as DailyLog;
  }
  return logs;
}

describe("streak", () => {
  it("counts consecutive passing days including a completed today", () => {
    const logs = build({ 0: pass, 1: pass, 2: pass });
    expect(streak(logs, asOf)).toBe(3);
  });

  it("does not break when today is not done yet (counts from yesterday)", () => {
    const logs = build({ 0: fail, 1: pass, 2: pass });
    expect(streak(logs, asOf)).toBe(2);
  });

  it("breaks on an earlier failing day", () => {
    const logs = build({ 0: pass, 1: pass, 2: fail, 3: pass });
    expect(streak(logs, asOf)).toBe(2);
  });

  it("is 0 when today is undone and yesterday failed", () => {
    const logs = build({ 0: fail, 1: fail, 2: pass });
    expect(streak(logs, asOf)).toBe(0);
  });
});

describe("worstGap", () => {
  it("finds the longest run of failing/absent days in the window", () => {
    // offsets 5,4,3 failing (3 in a row), 2 passes, 1 fails, 0 passes
    const logs = build({ 6: pass, 5: fail, 4: fail, 3: fail, 2: pass, 1: fail, 0: pass });
    expect(worstGap(logs, asOf, 7)).toBe(3);
  });

  it("returns the window size when nothing is logged (all absent = fails)", () => {
    expect(worstGap({}, asOf, 10)).toBe(10);
  });

  it("returns 0 when every day in the window passes", () => {
    const logs = build({ 0: pass, 1: pass, 2: pass });
    expect(worstGap(logs, asOf, 3)).toBe(0);
  });
});
