import { describe, expect, it } from "vitest";
import { checkCharacterAvailability } from "../src/content/character-availability";
import { getCharacter } from "../src/content/character";

const response = (ok: boolean, contentType = "image/png") =>
  (async () => ({
    ok,
    headers: new Headers({ "content-type": contentType }),
  })) as unknown as typeof fetch;

describe("character asset availability", () => {
  it("marks an available local character as selectable", async () => {
    await expect(
      checkCharacterAvailability(getCharacter("codex"), response(true)),
    ).resolves.toEqual({ available: true });
  });

  it("keeps optional Codex unavailable after 404 or network failure", async () => {
    await expect(
      checkCharacterAvailability(getCharacter("codex"), response(false)),
    ).resolves.toEqual({
      available: false,
      reason: "Local artwork required",
    });
    const rejected = (async () => {
      throw new Error("offline");
    }) as typeof fetch;
    await expect(
      checkCharacterAvailability(getCharacter("codex"), rejected),
    ).resolves.toEqual({
      available: false,
      reason: "Local artwork required",
    });
  });

  it("rejects an HTML fallback returned for a missing image path", async () => {
    await expect(
      checkCharacterAvailability(
        getCharacter("codex"),
        response(true, "text/html"),
      ),
    ).resolves.toEqual({
      available: false,
      reason: "Local artwork required",
    });
  });

  it("rejects when bundled Bill-e Bot artwork is unavailable", async () => {
    await expect(
      checkCharacterAvailability(
        getCharacter("bill-e-bot"),
        response(false),
      ),
    ).rejects.toThrow(/Bill-e Bot/i);
  });
});
