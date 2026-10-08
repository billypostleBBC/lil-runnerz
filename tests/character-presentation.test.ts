import { describe, expect, it } from "vitest";
import { getCharacter } from "../src/content/character";
import {
  characterPresentation,
  characterStats,
} from "../src/character-presentation";

describe("selected character presentation", () => {
  it("uses the selected character in autonomous copy and portrait metadata", () => {
    const presentation = characterPresentation(
      getCharacter("bill-e-bot"),
      "auto",
    );
    expect(presentation.callToAction).toBe("LET BILL-E BOT LOOSE →");
    expect(presentation.watchLabel).toBe("WATCH BILL-E BOT");
    expect(presentation.portraitAsset).toBe("/assets/bill-e-bot.png");
    expect(presentation.shieldSummary).toBe(
      "Shield lasts 0.8s · Recharges in 4s",
    );
  });

  it("uses a neutral manual call to action", () => {
    expect(
      characterPresentation(getCharacter("codex"), "manual").callToAction,
    ).toBe("ENTER THE HOLLOW →");
  });
});

// Ratings are a stable display scale, independent of which runners are in the roster.
describe("arcade capability ratings", () => {
  it("keeps equivalent physical capabilities equal and distinguishes power duration", () => {
    const shield = characterStats(getCharacter("bill-e-bot").character);
    const glide = characterStats(getCharacter("marty").character);
    expect(shield.map((stat) => stat.rating)).toEqual([3, 3, 2, 3]);
    expect(glide.map((stat) => stat.rating)).toEqual([3, 3, 3, 3]);
    expect(shield.map((stat) => stat.value)).toEqual([
      "160 px/s",
      "93 px",
      "0.8s",
      "4s",
    ]);
  });

  it("rewards faster recharge and clamps unusually high or low capabilities", () => {
    const base = getCharacter("bill-e-bot").character;
    const fast = {
      ...base,
      speed: 999,
      jumpSpeed: 999,
      power: { ...base.power, durationMs: 9999, cooldownMs: 1000 },
    };
    expect(characterStats(fast).map((stat) => stat.rating)).toEqual([
      5, 5, 5, 5,
    ]);
    const slow = {
      ...base,
      speed: 1,
      jumpSpeed: 1,
      power: { ...base.power, durationMs: 1, cooldownMs: 12000 },
    };
    expect(characterStats(slow).map((stat) => stat.rating)).toEqual([
      1, 1, 1, 1,
    ]);
  });
});
