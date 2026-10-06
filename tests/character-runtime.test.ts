import { describe, expect, it } from "vitest";
import { resolveCharacterRuntime } from "../src/game/character-runtime";

describe("selected character runtime", () => {
  it("returns selected power, controller and sprite metadata", () => {
    const runtime = resolveCharacterRuntime("bill-e-bot");
    expect(runtime.textureKey).toBe("pet:bill-e-bot");
    expect(runtime.definition.character.power).toEqual({
      kind: "shield",
      durationMs: 800,
      cooldownMs: 4000,
    });
    expect(runtime.definition.controllerProfile.reactionMs).toBe(120);
    expect([
      runtime.definition.frameWidth,
      runtime.definition.frameHeight,
    ]).toEqual([192, 208]);
  });

  it("rejects an unknown selected character", () => {
    expect(() => resolveCharacterRuntime("missing")).toThrow(
      /unknown character/i,
    );
  });
});
