import { describe, expect, it } from "vitest";
import { followView, GAME_VIEW } from "../src/game/camera";
const input = {
  x: 2880,
  y: 313,
  scrollX: 2600,
  scrollY: 74,
  facing: 1,
  width: 4000,
  height: 1120,
  dt: 16,
  reduced: false,
};
describe("closer camera framing", () => {
  it("uses 1.25x framing and keeps vertical position continuous across level seams", () => {
    expect(GAME_VIEW).toEqual({ width: 512, height: 288 });
    const before = followView({ ...input, x: 2879 });
    const after = followView({ ...input, x: 2881 });
    expect(before.y).toBe(74);
    expect(after.y).toBe(74);
    expect(followView({ ...input, y: 220 }).y).toBe(74);
  });
  it("tracks substantial rises/falls smoothly and respects world bounds", () => {
    const down = followView({ ...input, y: 370 });
    expect(down.y).toBeGreaterThan(74);
    expect(down.y).toBeLessThan(132);
    const up = followView({ ...input, y: 140 });
    expect(up.y).toBeLessThan(74);
    expect(up.y).toBeGreaterThan(40);
    expect(followView({ ...input, x: 9999, y: 9999, reduced: true })).toEqual({
      x: 3488,
      y: 832,
    });
  });
});
