import type { CharacterDefinition } from "../game/types";

export interface CharacterAvailability {
  available: boolean;
  reason?: string;
}

export async function checkCharacterAvailability(
  definition: CharacterDefinition,
  request: typeof fetch = fetch,
): Promise<CharacterAvailability> {
  try {
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const result = await request(`${base}${definition.character.asset}`, {
      method: "GET",
    });
    if (
      result.ok &&
      result.headers.get("content-type")?.toLowerCase().startsWith("image/")
    )
      return { available: true };
  } catch {
    // Network and missing-file failures use the same availability policy.
  }

  if (definition.bundled) {
    throw new Error(`${definition.character.name} artwork could not be loaded.`);
  }
  return { available: false, reason: "Local artwork required" };
}
