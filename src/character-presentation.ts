import type { Character, CharacterDefinition, Mode } from "./game/types";

export function characterPresentation(
  definition: CharacterDefinition,
  mode: Mode,
) {
  const seconds = definition.character.power.durationMs / 1000;
  const cooldown = definition.character.power.cooldownMs / 1000;
  return {
    callToAction:
      mode === "auto"
        ? `LET ${definition.character.name.toUpperCase()} LOOSE →`
        : "ENTER THE HOLLOW →",
    watchLabel: `WATCH ${definition.character.name.toUpperCase()}`,
    portraitAsset: `/${definition.character.asset}`,
    powerSummary: definition.character.power.kind === "rocket"
      ? `One upward boost · Recharges in ${cooldown}s after activation; land before reuse`
      : `${definition.character.power.kind === "glide" ? "Glide" : "Shield"} lasts ${seconds}s · Recharges in ${cooldown}s`,
  };
}

// Fixed display bands, not roster-relative scores or upgrade levels.
// Inclusive upper bounds: speed px/s, nominal jump px, active power ms.
export function characterStats(character: Character) {
  const jump = Math.round(character.jumpSpeed ** 2 / (2 * character.gravity));
  const band = (value: number, limits: number[]) =>
    1 + limits.filter((limit) => value > limit).length;
  return [
    {
      label: "Speed",
      value: `${character.speed} px/s`,
      rating: band(character.speed, [80, 120, 180, 240]),
    },
    {
      label: "Jump height",
      value: `${jump} px`,
      rating: band(jump, [40, 70, 100, 130]),
    },
    {
      label: character.power.kind === "rocket" ? "Boost rise" : "Power duration",
      value: character.power.kind === "rocket"
        ? `${Math.round(character.power.boostSpeed! ** 2 / (2 * character.gravity))} px`
        : `${character.power.durationMs / 1000}s`,
      rating: character.power.kind === "rocket"
        ? band(character.power.boostSpeed! ** 2 / (2 * character.gravity), [40, 70, 100, 130])
        : band(character.power.durationMs, [400, 800, 1200, 1600]),
    },
    {
      label: "Recharge",
      value: `${character.power.cooldownMs / 1000}s`,
      rating:
        1 +
        [6000, 4500, 3000, 1500].filter(
          (limit) => character.power.cooldownMs <= limit,
        ).length,
    },
  ];
}
