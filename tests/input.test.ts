import { afterEach, describe, expect, it, vi } from "vitest";
import { ManualInput } from "../src/game/input";
afterEach(() => vi.unstubAllGlobals());
describe("manual power binding", () => {
  it("uses physical left Shift with movement, ignores X/right Shift, and clears held input", () => {
    const target = new EventTarget();
    vi.stubGlobal("window", target);
    vi.stubGlobal("HTMLButtonElement", class {});
    let playing = true;
    const input = new ManualInput(
      () => playing,
      () => {},
    );
    const key = (code: string, repeat = false) =>
      target.dispatchEvent(
        Object.assign(new Event("keydown", { cancelable: true }), {
          code,
          repeat,
        }),
      );
    key("KeyD");
    key("KeyX");
    key("ShiftRight");
    expect(input.read()).toEqual({ move: 1, jump: false, power: false });
    key("ShiftLeft");
    expect(input.read()).toEqual({ move: 1, jump: false, power: true });
    key("ShiftLeft", true);
    expect(input.read().power).toBe(false);
    input.clear();
    expect(input.read()).toEqual({ move: 0, jump: false, power: false });
    playing = false;
    key("KeyD");
    key("ShiftLeft");
    expect(input.read()).toEqual({ move: 0, jump: false, power: false });
    input.destroy();
  });
});
