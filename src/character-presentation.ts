import type { CharacterDefinition, Mode } from "./game/types";

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
    shieldSummary: `Shield lasts ${seconds}s · Recharges in ${cooldown}s`,
  };
}
