import { describe, it, expect } from "vitest";
import { levelInfo, LEVELS } from "./levels.js";

describe("levelInfo", () => {
  it("resolves each threshold boundary to the right rank", () => {
    expect(levelInfo(0).current.name).toBe("Initiate");
    expect(levelInfo(49).current.name).toBe("Initiate");
    expect(levelInfo(50).current.name).toBe("Operator");
    expect(levelInfo(69).current.name).toBe("Operator");
    expect(levelInfo(70).current.name).toBe("Vanguard");
    expect(levelInfo(85).current.name).toBe("Elite");
    expect(levelInfo(95).current.name).toBe("Alpha Master");
    expect(levelInfo(100).current.name).toBe("Alpha Master");
  });

  it("points at the next rank to chase, null at the top", () => {
    expect(levelInfo(0).next?.name).toBe("Operator");
    expect(levelInfo(70).next?.name).toBe("Elite");
    expect(levelInfo(95).next).toBeNull();
  });

  it("echoes the consistency it was given and the full ladder", () => {
    const li = levelInfo(72);
    expect(li.consistency).toBe(72);
    expect(li.levels).toBe(LEVELS);
    expect(li.current.num).toBe(3);
  });
});
