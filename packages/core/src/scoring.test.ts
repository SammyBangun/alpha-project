import { describe, it, expect } from "vitest";
import { dayScore, averageScore, weeklyScore, monthlyScore } from "./scoring.js";
import type { DailyLog } from "./types.js";

const full: Partial<DailyLog> = {
  noZeroDay: true,
  deepWorkHours: 2,
  workout: true,
  learningMinutes: 30,
};

describe("dayScore", () => {
  it("returns 0 for null/undefined/empty", () => {
    expect(dayScore(null)).toBe(0);
    expect(dayScore(undefined)).toBe(0);
    expect(dayScore({})).toBe(0);
  });

  it("returns 100 for a perfect day", () => {
    expect(dayScore(full)).toBe(100);
  });

  it("awards 25 per pillar independently", () => {
    expect(dayScore({ noZeroDay: true })).toBe(25);
    expect(dayScore({ workout: true })).toBe(25);
    expect(dayScore({ deepWorkHours: 2 })).toBe(25);
    expect(dayScore({ learningMinutes: 30 })).toBe(25);
  });

  it("caps deep work at 2h and learning at 30min", () => {
    expect(dayScore({ deepWorkHours: 10 })).toBe(25);
    expect(dayScore({ learningMinutes: 600 })).toBe(25);
    // combined cap check: 8h + 120min still only the two pillars
    expect(dayScore({ deepWorkHours: 8, learningMinutes: 120 })).toBe(50);
  });

  it("scales partial deep work / learning linearly", () => {
    expect(dayScore({ deepWorkHours: 1 })).toBe(13); // 12.5 -> round 13
    expect(dayScore({ learningMinutes: 15 })).toBe(13);
    expect(dayScore({ deepWorkHours: 0.5 })).toBe(6); // 6.25 -> 6
  });

  it("rounds the total to an integer", () => {
    // 1h deep (12.5) + 15min learn (12.5) = 25 exactly
    expect(dayScore({ deepWorkHours: 1, learningMinutes: 15 })).toBe(25);
  });
});

describe("averages", () => {
  it("averageScore over mixed days", () => {
    expect(averageScore([full, {}])).toBe(50); // (100 + 0) / 2
    expect(averageScore([])).toBe(0);
  });

  it("weeklyScore / monthlyScore are rounded averages of the window", () => {
    const week = [full, full, full, {}, {}, {}, {}]; // 3*100 / 7 = 42.857
    expect(weeklyScore(week)).toBe(43);
    const month = Array.from({ length: 30 }, (_, i) => (i < 15 ? full : {}));
    expect(monthlyScore(month)).toBe(50);
  });
});
