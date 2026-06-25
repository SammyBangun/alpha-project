import { describe, it, expect } from "vitest";
import { honorScore } from "./honor.js";
import { burnoutLoad } from "./burnout.js";
import type { DailyLog } from "./types.js";

describe("honorScore", () => {
  it("is 100 when every day honors all 7 values", () => {
    const days = Array.from({ length: 30 }, () => ({ oathCount: 7 }) as Partial<DailyLog>);
    expect(honorScore(days)).toBe(100);
  });

  it("averages partial compliance as a percentage", () => {
    // half the days at 7/7, half at 0 -> 50%
    const days = Array.from({ length: 30 }, (_, i) => ({ oathCount: i < 15 ? 7 : 0 }) as Partial<DailyLog>);
    expect(honorScore(days)).toBe(50);
  });

  it("treats absent days as 0 and empty window as 0", () => {
    expect(honorScore([undefined, { oathCount: 7 }])).toBe(50);
    expect(honorScore([])).toBe(0);
  });
});

describe("burnoutLoad", () => {
  it("is HEALTHY for light, sustainable load", () => {
    const days = Array.from({ length: 30 }, () => ({ deepWorkHours: 1, workout: false }) as Partial<DailyLog>);
    const b = burnoutLoad(days);
    expect(b.label).toBe("HEALTHY");
    expect(b.pct).toBe(25); // (1/4)*100
  });

  it("flags HIGH for heavy deep work plus near-daily training", () => {
    const days = Array.from({ length: 30 }, () => ({ deepWorkHours: 4, workout: true }) as Partial<DailyLog>);
    const b = burnoutLoad(days);
    expect(b.pct).toBe(100); // min(100, 100 + 20)
    expect(b.label).toBe("HIGH");
  });
});
