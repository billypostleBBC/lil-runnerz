import { describe, expect, it } from "vitest";
import { getCharacter } from "../src/content/character";
import { characterPresentation } from "../src/character-presentation";

describe("selected character presentation", () => {
  it("uses the selected character in autonomous copy and portrait metadata", () => {
    const presentation = characterPresentation(
      getCharacter("bill-e-bot"),
      "auto",
    );
    expect(presentation.callToAction).toBe("LET BILL-E BOT LOOSE →");
    expect(presentation.watchLabel).toBe("WATCH BILL-E BOT");
    expect(presentation.portraitAsset).toBe("/assets/bill-e-bot.png");
    expect(presentation.shieldSummary).toBe("Shield lasts 0.8s · Recharges in 4s");
  });

  it("uses a neutral manual call to action", () => {
    expect(
      characterPresentation(getCharacter("codex"), "manual").callToAction,
    ).toBe("ENTER THE HOLLOW →");
  });
});
